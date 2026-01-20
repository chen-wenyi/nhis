import { useAISummary, useAlerts, useSevereWeatherOutlook } from '@/queries';
import type { Alert } from '@/types';
import { formatAlertName, sortAlerts } from '@/utils';
import { DateTime, Interval } from 'luxon';
import { useEffect, useState } from 'react';
import { getChanceOfUpgrade } from '../IssuedWarningsAndWatches/utils';
import { AlertIndicator } from './AlertIndicator';
import type { SevereWeatherAISummary } from './schema';
import { formatAlertDuration, formatAreasList } from './utils';

type Summary = {
  date: DateTime;
  issuedAlerts: Alert[];
  outlooks: SevereWeatherAISummary['chanceOfUpgrade'];
};

export function AISummary() {
  const { data: alerts, error, isLoading: isAlertsLoading } = useAlerts();
  const {
    data: severeWeatherOutlook,
    error: severeWeatherError,
    isLoading: isSevereWeatherLoading,
  } = useSevereWeatherOutlook();

  const aiSummaries = useAISummary(
    severeWeatherOutlook?.outlookItems.map((item) => item.outlook),
  );

  const allAiSummariesSuccess = aiSummaries.every((s) => s.isSuccess);

  const [summaries, setSummaries] = useState<Summary[]>([]);

  // Handle severeWeatherOutlook changes separately
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
  useEffect(() => {
    if (allAiSummariesSuccess) {
      console.log(
        'AI Summaries for Severe Weather Outlook:',
        aiSummaries.map((s) => s.data),
      );
    }
  }, [allAiSummariesSuccess, aiSummaries]);

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      {summaries.map(({ date, issuedAlerts, outlooks }) => (
        <div className="flex flex-col" key={date.toISODate()}>
          <span className="font-semibold">{date.toFormat('cccc dd LLLL')}</span>
          <div>
            {issuedAlerts.length > 0 && (
              <ul className="text-sm">
                {sortAlerts(issuedAlerts)
                  .filter(({ info }) =>
                    DateTime.fromISO(info.onset).hasSame(date, 'day'),
                  )
                  .map((alert) => (
                    <li className="py-2" key={alert.identifier}>
                      <IssuedAlert alert={alert} />
                    </li>
                  ))}
              </ul>
            )}
          </div>
          <div>
            {outlooks && outlooks.length > 0 && (
              <ul className="text-sm">
                {outlooks.map((outlook, index) => (
                  <li className="py-2" key={index}>
                    <OutlookItem outlook={outlook} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function IssuedAlert({ alert }: { alert: Alert }) {
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

  return (
    <div className="flex items-center gap-2">
      <AlertIndicator alert={alert} />
      <span>
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
            . There is a <span className="underline lowercase">{chance}</span>{' '}
            confidence of upgrading to a {upgradeTo}
          </span>
        )}
        <span>.</span>
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
      - There is <span className="underline">{outlook.chance}</span> confidence
      that {event} will reach {criteria} criteria
      {areas && areas.length > 0 ? ` for ${areas}` : ''}.
    </span>
  );
}
