import { getSevereWeatherAISummaryCollection } from '@/lib/mongodb';
import type { AISummaryId, DateString } from '@/types';
import { createServerFn } from '@tanstack/react-start';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { updateAISummaryGeneratedAt } from '../AISummaryGenAt';
import { createUserPrompt, systemPrompt } from './prompt';
import type { SevereWeatherAISummary } from './schema';
import { SevereWeatherAISummarySchema } from './schema';

export const generateSevereWeatherOutlookAISummary = createServerFn()
  .inputValidator(
    (data: { outlook: string; id: AISummaryId; date: DateString }) => data,
  )
  .handler(async ({ data }): Promise<SevereWeatherAISummary> => {
    console.log('Generating severe weather outlook AI summary...');

    const { outlook, id, date } = data;

    const collection = await getSevereWeatherAISummaryCollection();

    const existingSummary = await collection.findOne({
      'identifier.severeWeatherOutlookId': id.severeWeatherOutlook,
      'identifier.date': date,
      'identifier.outlook': outlook,
    });

    if (existingSummary) {
      console.log('Found existing severe weather AI summary in database');
      return existingSummary.summary;
    }

    console.log('No existing summary found, querying OpenAI API...');

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('Missing OPENAI_API_KEY environment variable');
    }
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
      const result = response.choices[0].message.parsed?.chanceOfUpgrade;
      if (!result) {
        throw new Error('AI response is missing the chanceOfUpgrade field');
      }

      console.log('Inserting new severe weather AI summary into database');
      await collection.insertOne({
        summary: result,
        identifier: {
          severeWeatherOutlookId: id.severeWeatherOutlook,
          date,
          outlook,
        },
        insertedAt: new Date(),
      });

      await updateAISummaryGeneratedAt({ data: { id } });

      return result;
    } catch (error) {
      console.error('Error generating severe weather AI summary:', error);
      throw new Error(`Failed to generate AI summary: ${error}`);
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
