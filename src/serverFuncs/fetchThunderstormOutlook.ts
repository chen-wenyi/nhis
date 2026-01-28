import { getThunderstormOutlookCollection } from '@/lib/mongodb';
import type { ThunderstormOutlook } from '@/types';
import { createServerFn } from '@tanstack/react-start';
import { ObjectId } from 'mongodb';

export const fetchThunderstormOutlook = createServerFn().handler(
  async (): Promise<ThunderstormOutlook | undefined> => {
    const collection = await getThunderstormOutlookCollection();
    const outlook = await collection.findOne({}, { sort: { insertedAt: -1 } });
    if (!outlook) {
      console.warn('No Severe Weather Outlook data found in the database.');
      return undefined;
    }

    return {
      id: outlook._id.toString(),
      items: outlook.items,
      refIssuedDates: outlook.refIssuedDates,
    };
  },
);

export const getThunderstormOutlookById = createServerFn()
  .inputValidator((data: { id: string }) => data)
  .handler(
    async ({
      data,
    }): Promise<(ThunderstormOutlook & { insertedAt: Date })[]> => {
      const collection = await getThunderstormOutlookCollection();
      const outlooks = await collection
        .find({ _id: ObjectId.createFromHexString(data.id) })
        .toArray();
      console.log(
        `Fetched ${outlooks.length} Thunderstorm Outlook(s) for ID: ${data.id}`,
      );

      return outlooks.map((outlook) => ({
        insertedAt: outlook.insertedAt,
        id: outlook._id.toString(),
        items: outlook.items,
        refIssuedDates: outlook.refIssuedDates,
      }));
    },
  );
