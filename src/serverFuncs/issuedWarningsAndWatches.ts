import { getIssuedWarningsAndWatchesCollection } from '@/lib/mongodb';
import type { IssuedWarningsAndWatches } from '@/types';
import { createServerFn } from '@tanstack/react-start';

export const fetchIssuedWarningsAndWatches = createServerFn().handler(
  async (): Promise<IssuedWarningsAndWatches | null> => {
    const collecton = await getIssuedWarningsAndWatchesCollection();
    const issuedWarningsAndWatches = await collecton.findOne(
      {},
      { sort: { updatedAt: -1 } },
    );

    console.log(
      'Fetched issued warnings and watches:',
      issuedWarningsAndWatches,
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
