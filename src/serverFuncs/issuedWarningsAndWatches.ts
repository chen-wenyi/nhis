import { getIssuedWarningsAndWatchesCollection } from '@/lib/mongodb';
import type { IssuedWarningsAndWatches } from '@/types';
import { createServerFn } from '@tanstack/react-start';
import { ObjectId } from 'mongodb';

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

export const getIssuedWarningsAndWatchesById = createServerFn()
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<IssuedWarningsAndWatches[]> => {
    const collection = await getIssuedWarningsAndWatchesCollection();
    const issuedWarningsAndWatches = await collection
      .find({ _id: ObjectId.createFromHexString(data.id) })
      .toArray();
    console.log(
      `Fetched ${issuedWarningsAndWatches.length} Issued Warnings And Watches(s) for ID: ${data.id}`,
    );

    return issuedWarningsAndWatches.map((item) => ({
      id: item._id.toString(),
      updatedAt: item.updatedAt,
      updatedAtISO: item.updatedAtISO,
      entries: item.entries,
      insertedAt: item.insertedAt,
    }));
  });
