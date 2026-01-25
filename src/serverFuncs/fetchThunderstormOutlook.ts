import { getThunderstormOutlookCollection } from '@/lib/mongodb';
import type { ThunderstormOutlook } from '@/types';
import { createServerFn } from '@tanstack/react-start';

export const fetchThunderstormOutlook = createServerFn().handler(
  async (): Promise<ThunderstormOutlook | undefined> => {
    const collection = await getThunderstormOutlookCollection();
    const outlook = await collection.findOne({}, { sort: { updatedAt: -1 } });
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
