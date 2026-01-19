import type { SevereWeatherOutlook } from '@/types';
import { createServerFn } from '@tanstack/react-start';
import axios from 'axios';

export const fetchSevereWeatherOutlook = createServerFn().handler(
  async (): Promise<SevereWeatherOutlook | undefined> => {
    const url =
      'https://nhis-services-production.up.railway.app/metservice-warnings';
    try {
      const response = await axios.get<SevereWeatherOutlook>(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching Severe Weather Outlook:', error);
      return undefined;
    }
  },
);
