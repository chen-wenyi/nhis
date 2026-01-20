import { useAISummary, useAlerts, useSevereWeatherOutlook } from '@/queries';
import type { Alert } from '@/types';
import { formatAlertName, sortAlerts } from '@/utils';
import { DateTime, Interval } from 'luxon';
import { useEffect, useMemo, useState } from 'react';
import { getChanceOfUpgrade } from '../IssuedWarningsAndWatches/utils';
import { Progress } from '../ui/progress';
import { AlertIndicator } from './AlertIndicator';
import type { SevereWeatherAISummary } from './schema';
import { formatAlertDuration, formatAreasList, groupAlerts } from './utils';

type Summary = {
  date: DateTime;
  issuedAlerts: Alert[];
  outlooks: SevereWeatherAISummary['chanceOfUpgrade'];
};

export function AISummary() {
  const { data: alerts, isLoading: isAlertsLoading } = useAlerts();
  const { data: severeWeatherOutlook, isLoading: isSevereWeatherLoading } =
    useSevereWeatherOutlook();

  const aiSummaries = useAISummary(
    severeWeatherOutlook?.outlookItems.map((item) => item.outlook),
  );

  const openAICallCount =
    aiSummaries.length || severeWeatherOutlook?.outlookItems.length || 0;
  const { value: genProgress, desc: genDesc } = useProgressTracker({
    openAICallCount,
    isAlertsLoading,
    isSevereWeatherLoading,
    aiSummaries,
  });

  const allAiSummariesSuccess =
    !isAlertsLoading &&
    !isSevereWeatherLoading &&
    aiSummaries.every((s) => s.isSuccess);

  const [summaries, setSummaries] = useState<Summary[]>([]);

  useEffect(() => {
    if (alerts && severeWeatherOutlook && allAiSummariesSuccess) {
      console.log(severeWeatherOutlook.outlookItems.map((item) => item.date));
      const start = DateTime.now().startOf('day');
      // end from in format i.e. Sunday 25 Jan
      const end = DateTime.fromFormat(
        severeWeatherOutlook.outlookItems[
          severeWeatherOutlook.outlookItems.length - 1
        ].date,
        'cccc dd LLL',
      ).endOf('day');
      // create an array of dates between start and end
      const interval = Interval.fromDateTimes(start, end);
      const dates = interval.splitBy({ days: 1 }).map((i) => i.start);

      const _summaries: Summary[] = dates
        .filter((d): d is DateTime => d !== null)
        .map((date) => ({ date, issuedAlerts: [], outlooks: [] }));

      alerts.forEach((alert) => {
        const alertOnset = DateTime.fromISO(alert.info.onset);
        const alertExpires = DateTime.fromISO(alert.info.expires);
        // if date is between alertOnset and alertExpires, add to issuedAlerts
        _summaries.forEach((daySummary) => {
          if (
            daySummary.date >= alertOnset.startOf('day') &&
            daySummary.date <= alertExpires.endOf('day')
          ) {
            daySummary.issuedAlerts.push(alert);
          }
        });

        severeWeatherOutlook.outlookItems.forEach((item, index) => {
          const outlookDate = DateTime.fromFormat(item.date, 'cccc dd LLL');
          // find the corresponding in summary and add the aiSummary
          const daySummary = _summaries.find((s) =>
            s.date.hasSame(outlookDate, 'day'),
          );
          if (daySummary) {
            daySummary.outlooks = aiSummaries[index].data.chanceOfUpgrade || [];
          }
        });
      });

      setSummaries(_summaries);
    }
  }, [alerts, severeWeatherOutlook, allAiSummariesSuccess]);

  // Log AI summaries when all are successful (using stable dependency)
  // useEffect(() => {
  //   if (allAiSummariesSuccess) {
  //     console.log(
  //       'AI Summaries for Severe Weather Outlook:',
  //       aiSummaries.map((s) => s.data),
  //     );
  //   }
  // }, [allAiSummariesSuccess, aiSummaries]);

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      {!allAiSummariesSuccess ? (
        <div className="w-full h-full flex flex-col justify-center items-center gap-2">
          <Progress value={genProgress} className="w-100" />
          <span className="text-sm animate-pulse">{genDesc}</span>
        </div>
      ) : (
        summaries.map(({ date, issuedAlerts, outlooks }) => (
          <div className="flex flex-col" key={date.toISODate()}>
            <span className="font-semibold">
              {date.toFormat('cccc dd LLLL')}
            </span>
            <div>
              {issuedAlerts.length > 0 && (
                <ul className="text-sm">
                  {groupAlerts(
                    sortAlerts(issuedAlerts).filter(({ info }) =>
                      DateTime.fromISO(info.onset).hasSame(date, 'day'),
                    ),
                  ).map((alertGroup) => (
                    <li className="py-2" key={alertGroup[0].identifier}>
                      <IssuedAlerts alerts={alertGroup} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              {outlooks && outlooks.length > 0 && (
                <ul className="text-sm list-disc pl-6 space-y-1">
                  {outlooks.map((outlook, index) => (
                    <li className="py-2" key={index}>
                      <OutlookItem outlook={outlook} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function IssuedAlerts({ alerts }: { alerts: Alert[] }) {
  const alert = alerts[0];
  let upgradeTo = '';
  const name = alert.info.headline.toLowerCase();
  if (name.includes('watch')) {
    upgradeTo = 'warning';
  } else if (name.includes('warning - orange')) {
    upgradeTo = 'red warning';
  } else if (name.includes('warning')) {
    upgradeTo = 'red warning';
  }

  const chance = getChanceOfUpgrade(alert);
  const isMultipleAreas = alerts.length > 1;

  return (
    <div className="flex items-stretch gap-2">
      <div className="flex min-h-full">
        <AlertIndicator alert={alert} />
      </div>
      <span>
        {isMultipleAreas ? (
          <div className="flex flex-col gap-1">
            <div>
              MetService have issued {formatAlertName(alert.info.headline)} for
              the following areas:
            </div>
            <ul className="list-disc pl-6 space-y-1">
              {alerts.map((a, idx) => (
                <li key={idx}>
                  {a.info.area.areaDesc.length > 0
                    ? a.info.area.areaDesc
                    : 'Multiple areas'}
                  {formatAlertDuration(
                    DateTime.fromISO(a.info.onset),
                    DateTime.fromISO(a.info.expires),
                  )}
                  {getChanceOfUpgrade(a) && upgradeTo && (
                    <span>
                      . There is a{' '}
                      <span className="underline lowercase">
                        {getChanceOfUpgrade(a)}
                      </span>{' '}
                      confidence of upgrading to a {upgradeTo}
                    </span>
                  )}
                  <span>.</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            A {formatAlertName(alert.info.headline)} has been issued{' '}
            {alert.info.area.areaDesc.length > 0 && (
              <>for {alert.info.area.areaDesc}</>
            )}
            {formatAlertDuration(
              DateTime.fromISO(alert.info.onset),
              DateTime.fromISO(alert.info.expires),
            )}
            {chance && upgradeTo && (
              <span>
                . There is a{' '}
                <span className="underline lowercase">{chance}</span> confidence
                of upgrading to a {upgradeTo}
              </span>
            )}
            <span>.</span>
          </>
        )}
      </span>
    </div>
  );
}

function OutlookItem({
  outlook,
}: {
  outlook: NonNullable<SevereWeatherAISummary['chanceOfUpgrade']>[number];
}) {
  const name = outlook.upgradeTo.toLowerCase();
  const event = name.includes('rain')
    ? 'rainfall'
    : name.includes('wind')
      ? 'strong gales'
      : name.includes('thunderstorm')
        ? 'thunderstorms'
        : name;
  const criteria = name.includes('warning')
    ? 'warning'
    : name.includes('watch')
      ? 'watch'
      : name;
  const areas =
    outlook.areas && outlook.areas.length > 0
      ? formatAreasList(outlook.areas)
      : '';
  return (
    <span>
      There is <span className="underline lowercase">{outlook.chance}</span>{' '}
      confidence that {event} will reach {criteria} criteria
      {areas && areas.length > 0 ? ` for ${areas}` : ''}.
    </span>
  );
}

function useProgressTracker({
  openAICallCount,
  isAlertsLoading,
  isSevereWeatherLoading,
  aiSummaries,
}: {
  openAICallCount: number;
  isAlertsLoading: boolean;
  isSevereWeatherLoading: boolean;
  aiSummaries: ReturnType<typeof useAISummary>;
}) {
  const descs = useMemo(() => {
    const count = Math.max(openAICallCount, 1);
    return [
      'Get reference data (1/2)...',
      'Get reference data (2/2)...',
      ...Array.from(
        { length: count },
        (_, i) => `Generating summary (${i + 1}/${count})...`,
      ),
    ];
  }, [openAICallCount]);

  const [value, setValue] = useState(0);
  const [desc, setDesc] = useState(descs[0] ?? '');

  useEffect(() => {
    const referenceStepsCompleted =
      (isAlertsLoading ? 0 : 1) + (isSevereWeatherLoading ? 0 : 1);
    const aiSummaryStepsCompleted =
      !isAlertsLoading && !isSevereWeatherLoading
        ? aiSummaries.filter((s) => s.isSuccess).length
        : 0;
    const completedSteps = referenceStepsCompleted + aiSummaryStepsCompleted;

    const clamped = Math.min(Math.max(completedSteps, 0), descs.length);
    const descIndex = Math.min(clamped, descs.length - 1);
    setValue((clamped / descs.length) * 100);
    setDesc(descs[descIndex] ?? '');
  }, [isAlertsLoading, isSevereWeatherLoading, aiSummaries, descs]);

  return { value, desc };
}
