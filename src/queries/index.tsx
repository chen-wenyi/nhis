import { generateAISummary } from '@/components/AISummary/api';
import { fetchThunderstormOutlook } from '@/components/ThunderstormOutlook/api';
import { fetchIssuedWarningsAndWatches } from '@/serverFuncs/issuedWarningsAndWatches';
import { fetchSevereWeatherOutlook } from '@/serverFuncs/severeWeatherOutlook';
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

export const useAISummary = (outlooks: string[] | undefined) =>
  useQueries({
    queries:
      outlooks?.map((outlook) => ({
        queryKey: ['aiSummary', outlook],
        queryFn: async () => generateAISummary({ data: { outlook } }),
        refetchOnWindowFocus: false,
      })) || [],
  });
