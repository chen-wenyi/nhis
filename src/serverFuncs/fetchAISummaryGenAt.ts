import { getAISummaryGenerationTimeCollection } from '@/lib/mongodb';
import type { AISummaryId } from '@/types';
import { createServerFn } from '@tanstack/react-start';

export const fetchAISummaryGeneratedAt = createServerFn()
  .inputValidator((data: { id: AISummaryId }) => data)
  .handler(async ({ data }): Promise<Date | null> => {
    const { id } = data;
    const collection = await getAISummaryGenerationTimeCollection();
    const result = await collection.findOne({
      'summaryId.thunderstormOutlook': id.thunderstormOutlook,
      'summaryId.severeWeatherOutlook': id.severeWeatherOutlook,
    });
    return result ? result.lastGeneratedAt : null;
  });
