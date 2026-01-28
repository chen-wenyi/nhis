import { z } from 'zod';

// heavy rain, strong wind, or heavy snow (https://about.metservice.com/about-severe-weather-warnings#types)
const WATCHES = z.enum([
  'Heavy Rain Watch',
  'Strong Wind Watch',
  'Heavy Snow Watch',
]);

const WARNINGS = z.enum([
  'Heavy Rain Warning',
  'Strong Wind Warning',
  'Heavy Snow Warning',
]);

const IssuredWatcheOrWarning = z.object({
  issuredWatch: WATCHES,
  issuredWarning: WARNINGS,
  issuedRedWarning: z.string(),
  areas: z.array(z.string()),
  quotes: z.array(z.string()).min(1),
  keywords: z.array(z.string()),
});

export const ChanceLevelEnum = z.enum(['Minimal', 'Low', 'Moderate', 'High']);

const UpgradeChanceEventSchema = z.object({
  upgradeTo: WATCHES.or(WARNINGS).or(z.literal('Red Warning')),
  chance: ChanceLevelEnum,
  areas: z.array(z.string()),
  quotes: z.array(z.string()).min(1),
  keywords: z.array(z.string()),
});

export const SevereWeatherAISummarySchema = z.object({
  minimalRisk: z.boolean(),
  IssuredWatcheOrWarnings: z.array(IssuredWatcheOrWarning),
  chanceOfUpgrade: z.array(UpgradeChanceEventSchema),
});

export type SevereWeatherAISummary = z.infer<typeof UpgradeChanceEventSchema>[];

export type SevereWeatherOutlookAISummary = z.infer<
  typeof UpgradeChanceEventSchema
>[];
