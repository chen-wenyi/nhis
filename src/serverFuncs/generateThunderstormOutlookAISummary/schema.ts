import { z } from 'zod';

export const ChanceLevelEnum = z.enum(['Minimal', 'Low', 'Moderate', 'High']);

const OutlookSchema = z.object({
  risk: ChanceLevelEnum,
  areas: z.array(z.string()),
  when: z.array(z.string()),
  quotes: z.array(z.string()).min(1),
  keywords: z.array(z.string()),
});

export const ThunderstormAISummarySchema = z.object({
  outlooks: z.array(OutlookSchema),
});

export type ThunderstormAISummary = z.infer<typeof ThunderstormAISummarySchema>;
