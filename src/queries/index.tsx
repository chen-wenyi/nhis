import { fetchSevereWeatherOutlook } from '@/serverFuncs/fetchSevereWeatherOutlook';
import { fetchThunderstormOutlook } from '@/serverFuncs/fetchThunderstormOutlook';
import { generateSevereWeatherOutlookAISummary } from '@/serverFuncs/generateSevereWeatherOutlookAISummary';
import { generateThunderstormOutlookAISummary } from '@/serverFuncs/generateThunderstormOutlookAISummary';
import { fetchIssuedWarningsAndWatches } from '@/serverFuncs/issuedWarningsAndWatches';
import type { DateString } from '@/types';
import { useQueries, useQuery } from '@tanstack/react-query';

export const useIssuedWarningsAndWatches = () =>
  useQuery({
    queryKey: ['issuedWarningsAndWatches'],
    queryFn: async () => fetchIssuedWarningsAndWatches(),
    refetchInterval: 1000 * 60 * 1,
  });

export const useSevereWeatherOutlook = () =>
  useQuery({
    queryKey: ['severeWeatherOutlook'],
    queryFn: async () => fetchSevereWeatherOutlook(),
    refetchOnWindowFocus: false,
  });

export const useThunderstormOutlook = () =>
  useQuery({
    queryKey: ['thunderstormOutlook'],
    queryFn: async () => fetchThunderstormOutlook(),
    refetchOnWindowFocus: false,
  });

export const useSevereWeatherOutlookAISummary = (
  id: string,
  date: DateString,
  outlooks: string[],
) =>
  useQueries({
    queries: outlooks.map((outlook) => ({
      queryKey: ['aiSevereWeatherOutlookSummary', id, date, outlook],
      queryFn: () =>
        generateSevereWeatherOutlookAISummary({ data: { outlook, id, date } }),
      refetchOnWindowFocus: false,
    })),
  });

export const useThunderstormOutlookAISummary = (
  id: string,
  date: DateString,
  outlooks: string[],
) =>
  useQueries({
    queries: outlooks.map((outlook) => ({
      queryKey: ['aiThunderstormOutlookSummary', id, date, outlook],
      queryFn: () =>
        generateThunderstormOutlookAISummary({ data: { outlook, id, date } }),
      refetchOnWindowFocus: false,
    })),
  });
