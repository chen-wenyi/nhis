import {
  useAISummaryGeneratedAt,
  useAISummaryIsGenerated,
  useIssuedWarningsAndWatches,
  useSevereWeatherOutlook,
  useThunderstormOutlook,
} from '@/queries';
import type { AISummaryId } from '@/types';
import { DateTime, Interval } from 'luxon';
import { useEffect, useState } from 'react';
import { Progress } from '../ui/progress';
import { Skeleton } from '../ui/skeleton';
import type { Summary } from './SummaryItem';
import { SummaryItem } from './SummaryItem';
import { getThunderstormOutlookDate } from './utils';

export function AISummary() {
  const {
    data: issuedWarningsAndWatches,
    isLoading: isIssuedWarningsAndWatchesLoading,
  } = useIssuedWarningsAndWatches();
  const { data: severeWeatherOutlook, isLoading: isSevereWeatherLoading } =
    useSevereWeatherOutlook();

  const { data: thunderstormOutlook, isLoading: isThunderstormLoading } =
    useThunderstormOutlook();

  const [summaries, setSummaries] = useState<Summary[]>([]);

  const [_AISummaryId, setAISummaryId] = useState<AISummaryId>();
  const genAt = useAISummaryGeneratedAt(_AISummaryId);
  useAISummaryIsGenerated(_AISummaryId);

  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (
      issuedWarningsAndWatches &&
      severeWeatherOutlook &&
      thunderstormOutlook
    ) {
      const start = DateTime.now().startOf('day');
      const end = DateTime.fromFormat(
        severeWeatherOutlook.outlookItems[
          severeWeatherOutlook.outlookItems.length - 1
        ].date,
        'cccc dd LLL',
      ).endOf('day');
      const interval = Interval.fromDateTimes(start, end);
      const dates = interval.splitBy({ days: 1 }).map((i) => i.start);

      const _AISumId = {
        issuedWarningsAndWatches: issuedWarningsAndWatches.id,
        thunderstormOutlook: thunderstormOutlook.id,
        severeWeatherOutlook: severeWeatherOutlook.id,
      };

      const _summaries: Summary[] = dates
        .filter((d): d is DateTime => d !== null)
        .map((date) => ({
          date,
          issuedWarningsAndWatches: [],
          severeWeatherOutlook: severeWeatherOutlook.outlookItems.find(
            (item) => {
              const outlookDate = DateTime.fromFormat(item.date, 'cccc dd LLL');
              return date.hasSame(outlookDate, 'day');
            },
          ),
          thunderstormOutlookItems: thunderstormOutlook.items.filter((o) => {
            const dateStr = getThunderstormOutlookDate(o);
            if (!dateStr) return false;
            const outlookDate = DateTime.fromFormat(dateStr, 'dd LLL');
            return date.hasSame(outlookDate, 'day');
          }),
          AISummaryId: _AISumId,
        }));

      issuedWarningsAndWatches.entries.forEach((i) => {
        const onset = DateTime.fromISO(i.onset);
        const expires = DateTime.fromISO(i.expires);
        _summaries.forEach((daySummary) => {
          if (
            daySummary.date >= onset.startOf('day') &&
            daySummary.date <= expires.endOf('day')
          ) {
            daySummary.issuedWarningsAndWatches.push(i);
          }
        });
      });

      console.log('Preparing AI summaries Data:', _summaries);
      setSummaries(_summaries);
      setAISummaryId(_AISumId);
    }
  }, [
    issuedWarningsAndWatches?.id,
    severeWeatherOutlook?.id,
    thunderstormOutlook?.id,
  ]);

  useEffect(() => {
    const steps = [
      isIssuedWarningsAndWatchesLoading,
      isSevereWeatherLoading,
      isThunderstormLoading,
    ];
    const completedSteps = steps.filter((step) => !step).length;
    setLoadingProgress((completedSteps / steps.length) * 100);
  }, [
    isIssuedWarningsAndWatchesLoading,
    isSevereWeatherLoading,
    isThunderstormLoading,
  ]);

  const isDataLoading =
    isIssuedWarningsAndWatchesLoading ||
    isSevereWeatherLoading ||
    isThunderstormLoading;

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      {isDataLoading ? (
        <div className="w-full h-full flex flex-col justify-center items-center gap-2">
          <Progress value={loadingProgress} className="w-100" />
          <span className="text-sm animate-pulse">
            Loading reference data...
          </span>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <span className="font-semibold">AI Generated At: </span>
            {genAt.data ? (
              DateTime.fromJSDate(genAt.data).toLocaleString(
                DateTime.DATETIME_MED,
              )
            ) : (
              <Skeleton className="w-36 h-6" />
            )}
          </div>
          {summaries.map((summary) => (
            <SummaryItem key={summary.date.toISODate()} {...summary} />
          ))}
        </>
      )}
    </div>
  );
}
