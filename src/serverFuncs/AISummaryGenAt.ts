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

export const checkAISummaryGeneratedAt = createServerFn()
  .inputValidator((data: { id: AISummaryId }) => data)
  .handler(async ({ data }) => {
    const { id } = data;
    const collection = await getAISummaryGenerationTimeCollection();
    const result = await collection.findOne({ summaryId: id });
    return result ? true : false;
  });

export const removeAISummaryGeneratedAt = createServerFn()
  .inputValidator((data: { id: AISummaryId }) => data)
  .handler(async ({ data }) => {
    const { id } = data;
    const collection = await getAISummaryGenerationTimeCollection();
    const deleteResult = await collection.deleteOne({ summaryId: id });

    if (deleteResult.deletedCount && deleteResult.deletedCount > 0) {
      console.log(
        `Successfully removed ${deleteResult.deletedCount} AI summary(ies) from database`,
      );
    } else {
      console.log('No AI summary found to remove');
    }
  });
