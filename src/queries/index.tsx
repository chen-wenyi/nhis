import {
  checkAISummaryGeneratedAt,
  updateAISummaryGeneratedAt,
} from '@/serverFuncs/AISummaryGenAt';
import { fetchAISummaryGeneratedAt } from '@/serverFuncs/fetchAISummaryGenAt';
import { fetchSevereWeatherOutlook } from '@/serverFuncs/fetchSevereWeatherOutlook';
import { fetchThunderstormOutlook } from '@/serverFuncs/fetchThunderstormOutlook';
import { fetchIssuedWarningsAndWatches } from '@/serverFuncs/issuedWarningsAndWatches';
import type { AISummaryId } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export const useIssuedWarningsAndWatches = () =>
  useQuery({
    queryKey: ['issuedWarningsAndWatches'],
    queryFn: async () => fetchIssuedWarningsAndWatches(),
    staleTime: Infinity,
    // refetchInterval: 1000 * 60 * 1, // refetch every 1 minute
  });

export const useSevereWeatherOutlook = () =>
  useQuery({
    queryKey: ['severeWeatherOutlook'],
    queryFn: async () => fetchSevereWeatherOutlook(),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    // refetchInterval: 1000 * 60 * 5, // refetch every 5 minute
  });

export const useThunderstormOutlook = () =>
  useQuery({
    queryKey: ['thunderstormOutlook'],
    queryFn: async () => fetchThunderstormOutlook(),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    // refetchInterval: 1000 * 60 * 5, // refetch every 5 minutes
  });

export const useAISummaryGeneratedAt = (id?: AISummaryId) =>
  useQuery({
    enabled: false,
    queryKey: [
      'aiSummaryGeneratedAt',
      id?.severeWeatherOutlook,
      id?.thunderstormOutlook,
    ],
    queryFn: async () => {
      if (!id) return null;
      return fetchAISummaryGeneratedAt({ data: { id } });
    },
    refetchOnWindowFocus: false,
  });

export const useAISummaryIsGenerated = (id?: AISummaryId) => {
  const { refetch } = useAISummaryGeneratedAt(id); // to ensure the generatedAt query is fetched
  const queryClient = useQueryClient();

  useEffect(() => {
    if (id && id.issuedWarningsAndWatches) {
      checkAISummaryGeneratedAt({ data: { id } }).then((isGenerated) => {
        if (!isGenerated) {
          updateAISummaryGeneratedAt({ data: { id } });
        }
      });
    }
  }, [id?.issuedWarningsAndWatches]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (id && id.severeWeatherOutlook && id.thunderstormOutlook) {
      timeout = setInterval(() => {
        const queriesSevereWeather = queryClient.getQueryCache().findAll({
          queryKey: ['aiSevereWeatherOutlookSummary', id.severeWeatherOutlook],
          exact: false,
        });
        const queriesThunderstorm = queryClient.getQueryCache().findAll({
          queryKey: ['aiThunderstormOutlookSummary', id.thunderstormOutlook],
          exact: false,
        });

        const severeWeatherQuerySuccessList = queriesSevereWeather.map(
          (q) => q.state.status === 'success',
        ); // 'pending' | 'error' | 'success'

        const thunderstormQuerySuccessList = queriesThunderstorm.map(
          (q) => q.state.status === 'success',
        );

        console.log(
          'severeWeatherQuerySuccessList length:',
          severeWeatherQuerySuccessList.length,
          'thunderstormQuerySuccessList length:',
          thunderstormQuerySuccessList.length,
        );

        const isQueriesSevereWeatherSuccess =
          severeWeatherQuerySuccessList.every((status) => status === true);
        const isQueriesThunderstormSuccess = thunderstormQuerySuccessList.every(
          (status) => status === true,
        );

        if (
          id.severeWeatherOutlook &&
          id.thunderstormOutlook &&
          thunderstormQuerySuccessList.length > 0 &&
          severeWeatherQuerySuccessList.length > 0
        ) {
          if (isQueriesSevereWeatherSuccess && isQueriesThunderstormSuccess) {
            refetch();
            clearInterval(timeout);
          }
        }
      }, 1000 * 5); // check every 5 seconds
    }
    return () => clearInterval(timeout);
  }, [
    id?.issuedWarningsAndWatches,
    id?.severeWeatherOutlook,
    id?.thunderstormOutlook,
  ]);
};
