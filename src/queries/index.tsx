import { generateAISummary } from '@/components/AISummary/api';
import { fetchActiveAlerts } from '@/components/IssuedWarningsAndWatches/api';
import { fetchSevereWeatherOutlook } from '@/components/SevereWeatherOutlook/api';
import { useQueries, useQuery } from '@tanstack/react-query';

export const useAlerts = () =>
  useQuery({
    queryKey: ['alerts'],
    queryFn: async () => fetchActiveAlerts(),
  });

export const useSevereWeatherOutlook = () =>
  useQuery({
    queryKey: ['severeWeatherOutlook'],
    queryFn: async () => fetchSevereWeatherOutlook(),
  });

export const useAISummary = (outlooks: string[] | undefined) =>
  useQueries({
    queries:
      outlooks?.map((outlook) => ({
        queryKey: ['aiSummary', outlook],
        queryFn: async () => generateAISummary({ data: { outlook } }),
      })) || [],
  });
