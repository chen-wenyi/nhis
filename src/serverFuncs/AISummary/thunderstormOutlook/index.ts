import { Event } from '@/lib/ably';
import {
  getAIThunderstormOutlookSummaryCollection,
  getSevereWeatherAISummaryCollection,
  getThunderstormOutlookCollection,
} from '@/lib/mongodb';
import type {
  AISummaryId,
  AIThunderstormOutlookSummaryDocument,
  AIThunderstormOutlookSummaryResp,
} from '@/types';
import { createServerFn } from '@tanstack/react-start';
import * as Ably from 'ably';
import { DateTime } from 'luxon';
import { ObjectId } from 'mongodb';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { createUserPrompt, systemPrompt } from './prompt';
import { ThunderstormAISummarySchema } from './schema';

export const getThunderstormOutlookAISummary = createServerFn()
  .inputValidator((data: { outlookRefId: string }) => data)
  .handler(
    async ({ data }): Promise<AIThunderstormOutlookSummaryResp | null> => {
      console.log(
        `Event: Fetching thunderstorm outlook AI summary for outlook ID: ${data.outlookRefId}...`,
      );

      const collection = await getAIThunderstormOutlookSummaryCollection();

      const summaryDoc = await collection.findOne(
        {
          outlookRefId: data.outlookRefId,
        },
        { sort: { generatedAt: -1 } },
      );

      if (summaryDoc) {
        console.log(
          `Result: Found thunderstorm outlook AI summary for outlook ID: ${data.outlookRefId}`,
        );
        return {
          id: summaryDoc._id.toString(),
          outlookRefId: summaryDoc.outlookRefId,
          genReason: summaryDoc.genReason,
          generatedAt: summaryDoc.generatedAt,
          generatedAtISO: summaryDoc.generatedAtISO,
          content: summaryDoc.content,
        };
      } else {
        console.log(
          `Result: No thunderstorm outlook AI summary found for outlook ID: ${data.outlookRefId}`,
        );
        return null;
      }
    },
  );

export const generateThunderstormOutlookAISummary = createServerFn()
  .inputValidator((data: { reason: string; outlookRefId: string }) => data)
  .handler(async ({ data }) => {
    const logs = [
      '\n*** Event: Generating thunderstorm outlook AI summary... ***',
    ];

    console.log('Generating thunderstorm outlook AI summary...');

    // Ably Publish
    const ablyClient = new Ably.Rest({
      key: process.env.ABLY_API_KEY,
      clientId: 'nhis-server',
    });

    try {
      const channel = ablyClient.channels.get('nhis-channel');

      console.log('channel connected');

      logs.push(`Reason for generation: ${data.reason}`);
      logs.push(`Thunderstorm outlook Id ${data.outlookRefId}`);

      const ThunderstormOutlookCollection =
        await getThunderstormOutlookCollection();
      const outlookDoc = await ThunderstormOutlookCollection.findOne({
        _id: new ObjectId(data.outlookRefId),
      });
      if (outlookDoc) {
        await channel.publish(
          Event.AI_THUNDERSTORM_OUTLOOK_SUMMARY_GENERATING,
          outlookDoc._id.toString(),
        );

        const resps = await Promise.all(
          outlookDoc.items.map((item) => {
            return invokeChatCompletion(item.outlook);
          }),
        );

        console.log('ChatGPT completions invoked');

        const generatedAt = new Date();

        const result: AIThunderstormOutlookSummaryDocument = {
          outlookRefId: outlookDoc._id.toString(),
          genReason: data.reason,
          generatedAt: generatedAt,
          generatedAtISO:
            DateTime.fromJSDate(generatedAt)
              .setZone('Pacific/Auckland')
              .toISO() || '',
          content: resps.map((summary, idx) => ({
            summary,
            date: outlookDoc.items[idx].header,
          })),
        };

        console.log('starting to insert summary into db');

        const AIThunderstormOutlookSummaryCollection =
          await getAIThunderstormOutlookSummaryCollection();
        await AIThunderstormOutlookSummaryCollection.insertOne({ ...result });

        await channel.publish(
          Event.AI_THUNDERSTORM_OUTLOOK_SUMMARY_GENERATED,
          outlookDoc._id.toString(),
        );

        logs.push(
          `Inserted thunderstorm outlook AI summary for outlook ID: ${outlookDoc._id.toString()}`,
        );
        return result;
      }
      logs.push('No thunderstorm outlook document found in database');
      return null;
    } catch (error) {
      console.error('Error generating thunderstorm outlook AI summary:', error);
    } finally {
      console.log(logs.join('\n'));
    }
  });

export const removeSevereWeatherOutlookAISummary = createServerFn()
  .inputValidator((data: { id: AISummaryId }) => data)
  .handler(async ({ data }) => {
    console.log('Removing severe weather outlook AI summary...');

    const { id } = data;

    const collection = await getSevereWeatherAISummaryCollection();

    const deleteResult = await collection.deleteMany({
      'identifier.severeWeatherOutlookId': id.severeWeatherOutlook,
    });

    if (deleteResult.deletedCount && deleteResult.deletedCount > 0) {
      console.log(
        `Successfully removed ${deleteResult.deletedCount} severe weather AI summary(ies) from database`,
      );
    } else {
      console.log('No severe weather AI summary found to remove');
    }
  });

async function invokeChatCompletion(outlook: string) {
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const response = await client.chat.completions.parse({
      model: 'gpt-5-mini',
      reasoning_effort: 'low',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: createUserPrompt(outlook),
        },
      ],
      response_format: zodResponseFormat(
        ThunderstormAISummarySchema,
        'ThunderstormAISummary',
      ),
    });
    return response.choices[0].message.parsed?.outlooks || [];
  } catch (error) {
    console.error('Error invoking chat completion:', error);
    return [];
  }
}
