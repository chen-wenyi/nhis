import { getSevereWeatherOutlookCollection } from '@/lib/mongodb';
import type { SevereWeatherOutlook } from '@/types';
import { createServerFn } from '@tanstack/react-start';

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
      issuedDate: outlook.issuedDate,
      outlookItems: outlook.outlookItems,
    };
  },
);
