import { useNHISChannel } from '@/hooks';
import { Event } from '@/lib/ably';
import {
  useIssuedWarningsAndWatches,
  useSevereWeatherOutlook,
  useThunderstormOutlook,
} from '@/queries';
import {
  generateSevereWeatherOutlookAISummary,
  getSevereWeatherOutlookAISummary,
} from '@/serverFuncs/AISummary/severeWeatherOutlook';
import {
  generateThunderstormOutlookAISummary,
  getThunderstormOutlookAISummary,
} from '@/serverFuncs/AISummary/thunderstormOutlook';
import { useQuery } from '@tanstack/react-query';
import { DateTime, Interval } from 'luxon';
import { useEffect, useRef, useState } from 'react';
import { TbRefresh } from 'react-icons/tb';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Skeleton } from '../ui/skeleton';
import type { Summary } from './SummaryItem';
import { SummaryItem } from './SummaryItem';
import {
  getLatestDate,
  getThunderstormOutlookDate,
  isOneDigitDay,
} from './utils';

export function AISummary() {
  const isSummaryLoaded = useRef(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [summaries, setSummaries] = useState<Summary[]>([]);

  const {
    data: severeWeatherOutlook,
    isLoading: isSevereWeatherOutlookLoading,
    refetch: refetchSevereWeatherOutlook,
  } = useSevereWeatherOutlook();
  const {
    data: thunderstormOutlook,
    isLoading: isThunderstormOutlookLoading,
    refetch: refetchThunderstormOutlook,
  } = useThunderstormOutlook();

  const {
    data: issuedWarningsAndWatches,
    isLoading: isIssuedWarningsAndWatchesLoading,
    refetch: refetchIssuedWarningsAndWatches,
  } = useIssuedWarningsAndWatches();
  const {
    data: severeWeatherOutlookAISummary,
    refetch: refetchSevereWeatherOutlookAISummary,
  } = useSevereWeatherOutlookAISummary(severeWeatherOutlook?.id ?? '');
  const {
    data: thunderstormOutlookAISummary,
    refetch: refetchThunderstormOutlookAISummary,
  } = useThunderstormOutlookAISummary(thunderstormOutlook?.id ?? '');

  useEffect(() => {
    if (severeWeatherOutlook?.id && thunderstormOutlook?.id) {
      if (!isSummaryLoaded.current) {
        refetchSevereWeatherOutlookAISummary();
        refetchThunderstormOutlookAISummary();
        isSummaryLoaded.current = true;
      }
      console.log(
        `
Current Severe Weather Outlook Id: 
${severeWeatherOutlook.id}
Current Thunderstrom Outlook Id:
${thunderstormOutlook.id}
`,
      );
    }
  }, [severeWeatherOutlook?.id, thunderstormOutlook?.id]);

  useEffect(() => {
    console.log(
      `\nissuedWarningsAndWatches : ${issuedWarningsAndWatches?.id}, \nsevereWeatherOutlook: ${severeWeatherOutlook?.id}, \nthunderstormOutlook: ${thunderstormOutlook?.id}, \nsevereWeatherOutlookAISummary: ${severeWeatherOutlookAISummary?.id}, \nthunderstormOutlookAISummary: ${thunderstormOutlookAISummary?.id}`,
    );
    if (
      issuedWarningsAndWatches?.id &&
      severeWeatherOutlookAISummary?.id &&
      thunderstormOutlookAISummary?.id &&
      severeWeatherOutlook?.id
    ) {
      const start = DateTime.now().startOf('day');
      const endDateStr =
        severeWeatherOutlook.outlookItems[
          severeWeatherOutlook.outlookItems.length - 1
        ].date;

      const end = DateTime.fromFormat(
        endDateStr,
        isOneDigitDay(endDateStr) ? 'cccc d LLL' : 'cccc dd LLL',
      ).endOf('day');
      const interval = Interval.fromDateTimes(start, end);
      const dates = interval.splitBy({ days: 1 }).map((i) => i.start);

      const _summaries: Summary[] = dates
        .filter((d): d is DateTime => d !== null)
        .map((date) => ({
          date,
          issuedWarningsAndWatches: [],
          severeWeatherOutlookAISummary: [],
          thunderstormOutlookAISummary: [],

          isSevereWeatherOutlookLoading: false,
          isThunderstormOutlookLoading: false,
        }));

      severeWeatherOutlookAISummary.content.forEach((item) => {
        const outlookDate = DateTime.fromFormat(
          item.date,
          isOneDigitDay(item.date) ? 'cccc d LLL' : 'cccc dd LLL',
        );
        _summaries
          .find((daySummary) => daySummary.date.hasSame(outlookDate, 'day'))
          ?.severeWeatherOutlookAISummary.push(...item.summary);
      });

      thunderstormOutlookAISummary.content.forEach((item) => {
        const dateStr = getThunderstormOutlookDate(item.date);
        if (!dateStr) return false;

        const outlookDate = DateTime.fromFormat(
          dateStr,
          isOneDigitDay(dateStr) ? 'd LLL' : 'dd LLL',
        );
        _summaries
          .find((daySummary) => daySummary.date.hasSame(outlookDate, 'day'))
          ?.thunderstormOutlookAISummary.push(...item.summary);
      });

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

      console.log('Generated summaries:', _summaries);
      setSummaries(_summaries);
    }
  }, [
    issuedWarningsAndWatches?.id,
    severeWeatherOutlook?.id,
    thunderstormOutlook?.id,
    severeWeatherOutlookAISummary?.id,
    thunderstormOutlookAISummary?.id,
  ]);

  useNHISChannel((message) => {
    console.log(
      `Received ${message.name} message: ${message.data} at ${DateTime.now().setZone('Pacific/Auckland').toISO()}`,
    );

    switch (message.name) {
      case Event.ISSUED_WARNINGS_WATCHES_UPDATED: {
        refetchIssuedWarningsAndWatches();
        break;
      }
      case Event.AI_SEVERE_WEATHER_OUTLOOK_SUMMARY_GENERATED: {
        refetchSevereWeatherOutlookAISummary();
        break;
      }
      case Event.AI_THUNDERSTORM_OUTLOOK_SUMMARY_GENERATED: {
        refetchThunderstormOutlookAISummary();
        break;
      }
      case Event.AI_SEVERE_WEATHER_OUTLOOK_SUMMARY_GENERATING: {
        refetchSevereWeatherOutlook();
        setSummaries((sum) =>
          sum.map((s) => ({
            ...s,
            isSevereWeatherOutlookLoading: true,
          })),
        );
        break;
      }
      case Event.AI_THUNDERSTORM_OUTLOOK_SUMMARY_GENERATING: {
        refetchThunderstormOutlook();
        setSummaries((sum) =>
          sum.map((s) => ({
            ...s,
            isThunderstormOutlookLoading: true,
          })),
        );
        break;
      }
      default:
        break;
    }
  });

  const isDataLoading =
    isIssuedWarningsAndWatchesLoading ||
    isSevereWeatherOutlookLoading ||
    isThunderstormOutlookLoading;

  useEffect(() => {
    const steps = [
      isIssuedWarningsAndWatchesLoading,
      isSevereWeatherOutlookLoading,
      isThunderstormOutlookLoading,
    ];
    const completedSteps = steps.filter((step) => !step).length;
    setLoadingProgress((completedSteps / steps.length) * 100);
  }, [
    isIssuedWarningsAndWatchesLoading,
    isSevereWeatherOutlookLoading,
    isThunderstormOutlookLoading,
  ]);

  const regenerate = () => {
    if (severeWeatherOutlook?.id) {
      generateSevereWeatherOutlookAISummary({
        data: {
          reason: 'Triggered by user regeneration',
          outlookRefId: severeWeatherOutlook.id,
        },
      });
    }
    if (thunderstormOutlook?.id) {
      generateThunderstormOutlookAISummary({
        data: {
          reason: 'Triggered by user regeneration',
          outlookRefId: thunderstormOutlook.id,
        },
      });
    }
  };

  const generatedAt = getLatestDate([
    issuedWarningsAndWatches?.insertedAt,
    severeWeatherOutlookAISummary?.generatedAt,
    thunderstormOutlookAISummary?.generatedAt,
  ]);

  useEffect(() => {
    console.log(
      `\n*** AI Summary Generation Time:\nissuedWarningsAndWatches: ${issuedWarningsAndWatches?.insertedAt}, \nsevereWeatherOutlookAISummary: ${severeWeatherOutlookAISummary?.generatedAt}, \nthunderstormOutlookAISummary: ${thunderstormOutlookAISummary?.generatedAt} \n=> Latest: ${generatedAt} ***\n`,
    );
  }, [
    issuedWarningsAndWatches?.insertedAt,
    severeWeatherOutlookAISummary?.generatedAt,
    thunderstormOutlookAISummary?.generatedAt,
  ]);

  const isAIGenerating = summaries.some(
    (s) => s.isThunderstormOutlookLoading || s.isSevereWeatherOutlookLoading,
  );

  const handleGeneratedAtClick = () => {
    console.log(
      `\n*** AI Summary Generation Time Details ***\nissuedWarningsAndWatches: ${issuedWarningsAndWatches?.id}\ninsertedAt: ${issuedWarningsAndWatches?.insertedAt}\n\nsevereWeatherOutlook: ${severeWeatherOutlook?.id}\n\nthunderstormOutlook: ${thunderstormOutlook?.id}\n\nsevereWeatherOutlookAISummary: ${severeWeatherOutlookAISummary?.id}\ngeneratedAt: ${severeWeatherOutlookAISummary?.generatedAt}\n\nthunderstormOutlookAISummary: ${thunderstormOutlookAISummary?.id}\ngeneratedAt: ${thunderstormOutlookAISummary?.generatedAt}\n*******************************\n`,
    );
  };

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
          <div className="flex gap-2 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold" onClick={handleGeneratedAtClick}>
                AI Generated At:{' '}
              </span>
              {isAIGenerating ? (
                <Skeleton className="w-36 h-6" />
              ) : generatedAt ? (
                DateTime.fromJSDate(generatedAt).toFormat(
                  'h:mm a EEE, d LLL yyyy',
                )
              ) : (
                'N/A'
              )}
            </div>
            <Button
              className="cursor-pointer ml-4"
              variant="outline"
              onClick={regenerate}
            >
              Regenerate
              <TbRefresh />
            </Button>
          </div>
          {summaries.map((summary) => (
            <SummaryItem key={summary.date.toISODate()} {...summary} />
          ))}
        </>
      )}
    </div>
  );
}

export const useSevereWeatherOutlookAISummary = (outlookRefId: string) =>
  useQuery({
    enabled: false,
    queryKey: ['aiSevereWeatherOutlookSummary', outlookRefId],
    queryFn: () => getSevereWeatherOutlookAISummary({ data: { outlookRefId } }),
    refetchOnWindowFocus: false,
  });

export const useThunderstormOutlookAISummary = (outlookRefId: string) =>
  useQuery({
    enabled: false,
    queryKey: ['aiThunderstormOutlookSummary', outlookRefId],
    queryFn: () => getThunderstormOutlookAISummary({ data: { outlookRefId } }),
    refetchOnWindowFocus: false,
  });
