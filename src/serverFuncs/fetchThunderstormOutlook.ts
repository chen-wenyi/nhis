import type { ThunderstormOutlook } from '@/types';
import { createServerFn } from '@tanstack/react-start';
import axios from 'axios';

export const fetchThunderstormOutlook = createServerFn().handler(
  async (): Promise<ThunderstormOutlook | undefined> => {
    const url =
      'https://nhis-services-production.up.railway.app/thunderstorm-outlook';
    try {
      const response = await axios.get<ThunderstormOutlook>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching Thunderstorm Outlook:', error);
      return undefined;
    }
  },
);
