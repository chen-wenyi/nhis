import { getSevereWeatherOutlookCollection } from '@/lib/mongodb';
import type { SevereWeatherOutlook } from '@/types';
import { createServerFn } from '@tanstack/react-start';
import { DateTime } from 'luxon';
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

export const getSevereWeatherOutlookHistory = createServerFn()
  .inputValidator((data: { issuedDate: Date }) => data)
  .handler(
    async ({
      data,
    }): Promise<(SevereWeatherOutlook & { insertedAt: Date })[]> => {
      const collection = await getSevereWeatherOutlookCollection();

      // same day as issuedDate in NZ timezone
      const d = DateTime.fromJSDate(data.issuedDate).setZone(
        'Pacific/Auckland',
      );

      console.log('Searching Severe Weather Outlook for date:', d.toISODate());

      const startOfDay = d.startOf('day').toJSDate();
      const endOfDay = d.endOf('day').toJSDate();

      console.log('Start of day (NZ):', startOfDay);
      console.log('End of day (NZ):', endOfDay);

      const query = {
        $and: [
          { issuedDate: { $type: 'date' as const } },
          { issuedDate: { $gte: startOfDay, $lte: endOfDay } },
        ],
      };

      const outlooks = await collection
        .find(query, { sort: { issuedDate: 1 } })
        .toArray();
      console.log(
        `Fetched ${outlooks.length} Severe Weather Outlook(s) for date: ${data.issuedDate}`,
      );

      return outlooks.map((outlook) => ({
        id: outlook._id.toString(),
        issuedDate: outlook.issuedDate,
        outlookItems: outlook.outlookItems,
        insertedAt: outlook.insertedAt,
      }));
    },
  );
