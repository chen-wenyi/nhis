import { Event } from '@/lib/ably';
import {
  getAISevereWeatherOutlookSummaryCollection,
  getSevereWeatherAISummaryCollection,
  getSevereWeatherOutlookCollection,
} from '@/lib/mongodb';
import type { AISevereWeatherOutlookSummaryResp, AISummaryId } from '@/types';
import { createServerFn } from '@tanstack/react-start';
import * as Ably from 'ably';
import { DateTime } from 'luxon';
import { ObjectId } from 'mongodb';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { createUserPrompt, systemPrompt } from './prompt';
import type { SevereWeatherAISummary } from './schema';
import { SevereWeatherAISummarySchema } from './schema';

type Resp = {
  outlookRefId: string;
  genReason: string;
  generatedAt: Date;
  generatedAtISO: string;
  content: {
    summary: SevereWeatherAISummary;
    date: string;
  }[];
};

export const getSevereWeatherOutlookAISummary = createServerFn()
  .inputValidator((data: { outlookRefId: string }) => data)
  .handler(
    async ({ data }): Promise<AISevereWeatherOutlookSummaryResp | null> => {
      console.log(
        `Event: Fetching severe weather outlook AI summary for outlook ID: ${data.outlookRefId}...`,
      );

      const collection = await getAISevereWeatherOutlookSummaryCollection();

      const summaryDoc = await collection.findOne(
        {
          outlookRefId: data.outlookRefId,
        },
        { sort: { generatedAt: -1 } },
      );

      if (summaryDoc) {
        console.log(
          `Result: Found severe weather outlook AI summary for outlook ID: ${data.outlookRefId}`,
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
          `Result: No severe weather outlook AI summary found for outlook ID: ${data.outlookRefId}`,
        );
        return null;
      }
    },
  );

export const generateSevereWeatherOutlookAISummary = createServerFn()
  .inputValidator((data: { reason: string; outlookRefId: string }) => data)
  .handler(async ({ data }): Promise<Resp | null> => {
    // Ably Publish
    const ablyClient = new Ably.Rest({
      key: process.env.ABLY_API_KEY,
      clientId: 'nhis-server',
    });
    const logs = [
      '\n*** Event: Generating severe weather outlook AI summary... ***',
    ];
    try {
      const channel = ablyClient.channels.get('nhis-channel');

      logs.push(`Reason for generation: ${data.reason}`);

      const SevereWeatherOutlookCollection =
        await getSevereWeatherOutlookCollection();
      const outlookDoc = await SevereWeatherOutlookCollection.findOne({
        _id: new ObjectId(data.outlookRefId),
      });
      if (outlookDoc) {
        await channel.publish(
          Event.AI_SEVERE_WEATHER_OUTLOOK_SUMMARY_GENERATING,
          outlookDoc._id.toString(),
        );

        const resps = await Promise.all(
          outlookDoc.outlookItems.map((item) => {
            return invokeChatCompletion(item.outlook);
          }),
        );

        const generatedAt = new Date();

        const result = {
          outlookRefId: outlookDoc._id.toString(),
          genReason: data.reason,
          generatedAt: generatedAt,
          generatedAtISO:
            DateTime.fromJSDate(generatedAt)
              .setZone('Pacific/Auckland')
              .toISO() || '',
          content: resps.map((summary, idx) => ({
            summary,
            date: outlookDoc.outlookItems[idx].date,
          })),
        };

        const AISevereWeatherOutlookSummaryCollection =
          await getAISevereWeatherOutlookSummaryCollection();
        await AISevereWeatherOutlookSummaryCollection.insertOne({ ...result });

        await channel.publish(
          Event.AI_SEVERE_WEATHER_OUTLOOK_SUMMARY_GENERATED,
          outlookDoc._id.toString(),
        );

        logs.push(
          `Inserted severe weather outlook AI summary for outlook ID: ${outlookDoc._id.toString()}`,
        );
        console.log(logs.join('\n'));
        return result;
      }
      logs.push('No severe weather outlook document found in database');
      return null;
    } catch (error) {
      console.error(
        'Error generating severe weather outlook AI summary:',
        error,
      );
      return null;
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
        SevereWeatherAISummarySchema,
        'SevereWeatherAISummary',
      ),
    });
    return response.choices[0].message.parsed?.chanceOfUpgrade || [];
  } catch (error) {
    console.error('Error invoking chat completion:', error);
    return [];
  }
}
