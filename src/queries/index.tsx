import { fetchSevereWeatherOutlook } from '@/serverFuncs/fetchSevereWeatherOutlook';
import { fetchThunderstormOutlook } from '@/serverFuncs/fetchThunderstormOutlook';
import { generateSevereWeatherOutlookAISummary } from '@/serverFuncs/generateSevereWeatherOutlookAISummary';
import { generateThunderstormOutlookAISummary } from '@/serverFuncs/generateThunderstormOutlookAISummary';
import { fetchIssuedWarningsAndWatches } from '@/serverFuncs/issuedWarningsAndWatches';
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
  outlooks: string[] | undefined,
) =>
  useQueries({
    queries:
      outlooks?.map((outlook) => ({
        queryKey: ['aiSevereWeatherOutlookSummary', outlook],
        queryFn: () =>
          generateSevereWeatherOutlookAISummary({ data: { outlook } }),
        refetchOnWindowFocus: false,
      })) || [],
  });

export const useThunderstormOutlookAISummary = (
  outlooks: string[] | undefined,
) =>
  useQueries({
    queries:
      outlooks?.map((outlook) => ({
        queryKey: ['aiThunderstormOutlookSummary', outlook],
        queryFn: () =>
          generateThunderstormOutlookAISummary({ data: { outlook } }),
        refetchOnWindowFocus: false,
      })) || [],
  });
