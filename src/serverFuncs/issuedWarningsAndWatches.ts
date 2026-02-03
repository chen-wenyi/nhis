import { getIssuedWarningsAndWatchesCollection } from '@/lib/mongodb';
import type { IssuedWarningsAndWatches } from '@/types';
import { createServerFn } from '@tanstack/react-start';

export const fetchIssuedWarningsAndWatches = createServerFn().handler(
  async (): Promise<IssuedWarningsAndWatches | null> => {
    const collection = await getIssuedWarningsAndWatchesCollection();
    const issuedWarningsAndWatches = await collection.findOne(
      {},
      { sort: { insertedAt: -1 } },
    );

    if (issuedWarningsAndWatches) {
      return {
        id: issuedWarningsAndWatches._id.toString() || '',
        updatedAt: issuedWarningsAndWatches.updatedAt,
        updatedAtISO: issuedWarningsAndWatches.updatedAtISO,
        entries: issuedWarningsAndWatches.entries,
        insertedAt: issuedWarningsAndWatches.insertedAt,
      };
    }
    return null;
  },
);
