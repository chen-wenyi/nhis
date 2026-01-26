import { getAISummaryGenerationTimeCollection } from '@/lib/mongodb';
import type { AISummaryId } from '@/types';
import { createServerFn } from '@tanstack/react-start';

export const checkAISummaryGeneratedAt = createServerFn()
  .inputValidator((data: { id: AISummaryId }) => data)
  .handler(async ({ data }) => {
    const { id } = data;
    const collection = await getAISummaryGenerationTimeCollection();
    const result = await collection.findOne({ summaryId: id });
    return result ? true : false;
  });
