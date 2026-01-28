import { getSevereWeatherOutlookCollection } from '@/lib/mongodb';
import type { SevereWeatherOutlook } from '@/types';
import { createServerFn } from '@tanstack/react-start';
import { ObjectId } from 'mongodb';

export const fetchSevereWeatherOutlook = createServerFn().handler(
  async (): Promise<SevereWeatherOutlook | null> => {
    const collection = await getSevereWeatherOutlookCollection();
    const outlook = await collection.findOne(
      { issuedDate: { $type: 'date' } },
      { sort: { issuedDate: -1 } },
    );
    if (!outlook) {
      console.warn('No Severe Weather Outlook data found in the database.');
      return null;
    }

    return {
      id: outlook._id.toString(),
      issuedDate: outlook.issuedDate,
      outlookItems: outlook.outlookItems,
    };
  },
);

export const getSevereWeatherOutlookById = createServerFn()
  .inputValidator((data: { id: string }) => data)
  .handler(
    async ({
      data,
    }): Promise<(SevereWeatherOutlook & { insertedAt: Date })[]> => {
      const collection = await getSevereWeatherOutlookCollection();
      const outlooks = await collection
        .find({ _id: ObjectId.createFromHexString(data.id) })
        .toArray();
      console.log(
        `Fetched ${outlooks.length} Severe Weather Outlook(s) for ID: ${data.id}`,
      );
      // const outlook = await collection.findOne({ _id: new Object(data.id) });

      return outlooks.map((outlook) => ({
        id: outlook._id.toString(),
        issuedDate: outlook.issuedDate,
        outlookItems: outlook.outlookItems,
        insertedAt: outlook.insertedAt,
      }));
    },
  );
