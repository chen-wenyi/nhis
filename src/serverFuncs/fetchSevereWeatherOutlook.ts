import { getSevereWeatherOutlookCollection } from '@/lib/mongodb';
import type { SevereWeatherOutlook } from '@/types';
import { createServerFn } from '@tanstack/react-start';

export const fetchSevereWeatherOutlook = createServerFn().handler(
  async (): Promise<SevereWeatherOutlook | null> => {
    const collection = await getSevereWeatherOutlookCollection();
    const outlook = await collection.findOne({}, { sort: { insertedAt: -1 } });
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
