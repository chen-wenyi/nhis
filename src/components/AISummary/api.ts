import { createServerFn } from '@tanstack/react-start';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { createUserPrompt, systemPrompt } from './prompt';
import type { SevereWeatherAISummary } from './schema';
import { SevereWeatherAISummarySchema } from './schema';

export const generateAISummary = createServerFn()
  .inputValidator((data: { outlook: string }) => data)
  .handler(async ({ data }): Promise<SevereWeatherAISummary> => {
    const { outlook } = data;
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
      return response.choices[0].message.parsed as SevereWeatherAISummary;
    } catch (error) {
      throw new Error(`Failed to generate AI summary: ${error}`);
    }
  });
