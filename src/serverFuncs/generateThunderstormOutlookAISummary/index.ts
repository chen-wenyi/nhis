import {
  getAISummaryGenerationTimeCollection,
  getThunderstormAISummaryCollection,
} from '@/lib/mongodb';
import type { AISummaryId, DateString } from '@/types';
import { createServerFn } from '@tanstack/react-start';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { createUserPrompt, systemPrompt } from './prompt';
import { ThunderstormAISummarySchema } from './schema';

export const generateThunderstormOutlookAISummary = createServerFn()
  .inputValidator(
    (data: { outlook: string; id: AISummaryId; date: DateString }) => data,
  )
  .handler(async ({ data }) => {
    const { outlook, id, date } = data;

    const collection = await getThunderstormAISummaryCollection();

    const existingSummary = await collection.findOne({
      'identifier.thunderstormOutlookId': id.thunderstormOutlook,
      'identifier.date': date,
      'identifier.outlook': outlook,
    });

    if (existingSummary) {
      console.log('Found existing thunderstorm AI summary in database');
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
          ThunderstormAISummarySchema,
          'ThunderstormAISummary',
        ),
      });
      const result = response.choices[0].message.parsed?.outlooks;

      if (!result) {
        throw new Error('AI response is missing the outlooks field');
      }

      console.log('Inserting new thunderstorm AI summary into database');
      await collection.insertOne({
        summary: result,
        identifier: {
          thunderstormOutlookId: id.thunderstormOutlook,
          date,
          outlook,
        },
        insertedAt: new Date(),
      });

      getAISummaryGenerationTimeCollection().then((timeCollection) => {
        timeCollection.updateOne(
          { summaryId: id },
          { $set: { lastGeneratedAt: new Date() } },
          { upsert: true },
        );
      });

      return result;
    } catch (error) {
      throw new Error(`Failed to generate AI summary: ${error}`);
    }
  });

// Failed to generate AI summary: Error: Root schema must have type: 'object' but got type: 'array'"
