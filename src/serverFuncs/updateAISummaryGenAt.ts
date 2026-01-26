import { getAISummaryGenerationTimeCollection } from '@/lib/mongodb';
import type { AISummaryId } from '@/types';
import { createServerFn } from '@tanstack/react-start';

export const updateAISummaryGeneratedAt = createServerFn()
  .inputValidator((data: { id: AISummaryId }) => data)
  .handler(async ({ data }) => {
    const { id } = data;
    const collection = await getAISummaryGenerationTimeCollection();
    await collection.updateOne(
      { summaryId: id },
      { $set: { lastGeneratedAt: new Date() } },
      { upsert: true },
    );
  });
