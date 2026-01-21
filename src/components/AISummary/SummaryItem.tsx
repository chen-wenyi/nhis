import { useAISummary } from '@/queries';
import type { Alert, SevereWeatherOutlook } from '@/types';
import { formatAlertName, sortAlerts } from '@/utils';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { getChanceOfUpgrade } from '../IssuedWarningsAndWatches/utils';
import { Skeleton } from '../ui/skeleton';
import { AlertIndicator } from './AlertIndicator';
import type { SevereWeatherAISummary } from './schema';
import { formatAlertDuration, formatAreasList, groupAlerts } from './utils';

type Summary = {
  date: DateTime;
  issuedAlerts: Alert[];
  severeWeatherOutlook?: SevereWeatherOutlook;
};

export function SummaryItem({
  date,
  issuedAlerts,
  severeWeatherOutlook,
}: Summary) {
  const correspondingOutlook = useMemo(() => {
    if (!severeWeatherOutlook) return undefined;
    return severeWeatherOutlook.outlookItems.find((item) => {
      const outlookDate = DateTime.fromFormat(item.date, 'cccc dd LLL');
      return date.hasSame(outlookDate, 'day');
    });
  }, [severeWeatherOutlook, date]);

  const aiSummary = useAISummary(
    correspondingOutlook ? [correspondingOutlook.outlook] : undefined,
  );

  const isLoading = aiSummary[0]?.isLoading ?? false;
  const outlooks = aiSummary[0]?.data?.chanceOfUpgrade || [];

  const groupedAlertsToday = useMemo(() => {
    return groupAlerts(
      sortAlerts(issuedAlerts).filter(({ info }) =>
        DateTime.fromISO(info.onset).hasSame(date, 'day'),
      ),
    );
  }, [issuedAlerts, date]);

  const groupedAlertsRemaining = useMemo(() => {
    return groupAlerts(
      sortAlerts(issuedAlerts).filter(({ info }) => {
        return !DateTime.fromISO(info.onset).hasSame(date, 'day');
      }),
    );
  }, [issuedAlerts, date]);

  return (
    <div className="flex flex-col" key={date.toISODate()}>
      <span className="font-semibold">{date.toFormat('cccc dd LLLL')}</span>
      {isLoading ? (
        <div className="flex flex-col gap-2 py-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      ) : (
        <>
          <div>
            {issuedAlerts.length > 0 && groupedAlertsToday.length > 0 && (
              <ul className="text-sm">
                {groupedAlertsToday.map((alertGroup) => (
                  <li className="py-2" key={alertGroup[0].identifier}>
                    <IssuedAlerts alerts={alertGroup} />
                  </li>
                ))}
              </ul>
            )}
            {groupedAlertsRemaining.length > 0 && (
              <ul className="text-sm">
                {groupedAlertsRemaining.map((alertGroup) => (
                  <li className="py-2" key={alertGroup[0].identifier}>
                    <IssuedAlertsRemaining alerts={alertGroup} />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            {outlooks.length > 0 && (
              <ul className="text-sm list-disc pl-6 space-y-1">
                {outlooks.map((outlook, index) => (
                  <li className="py-2" key={index}>
                    <OutlookItem outlook={outlook} />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            {issuedAlerts.length === 0 && outlooks.length === 0 && (
              <div className="text-sm py-2">
                There is <span className="underline">minimal</span> risk of
                severe weather.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function IssuedAlerts({ alerts }: { alerts: Alert[] }) {
  const alert = alerts[0];
  const isMultipleAreas = alerts.length > 1;

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
    <div className="flex items-stretch gap-2">
      <div className="flex min-h-full">
        <AlertIndicator alert={alert} />
      </div>
      <span>
        {isMultipleAreas ? (
          <div className="flex flex-col gap-1">
            <div>
              MetService has issued{' '}
              {formatAlertName(alert.info.headline, isMultipleAreas)} for the
              following areas:
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
            A {formatAlertName(alert.info.headline, isMultipleAreas)} has been
            issued{' '}
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

function IssuedAlertsRemaining({ alerts }: { alerts: Alert[] }) {
  const alert = alerts[0];
  const allAreas = alerts.flatMap((a) =>
    a.info.area.areaDesc.split(',').map((area) => area.trim()),
  );
  const isMultipleAreas = allAreas.length > 1;

  return (
    <div className="flex items-stretch gap-2">
      <div className="flex items-center justify-center min-h-full">
        <AlertIndicator alert={alert} />
      </div>
      <span>
        <div className="flex flex-col gap-1">
          {isMultipleAreas ? (
            <div>
              The {formatAlertName(alert.info.headline, isMultipleAreas)} remain
              in place for {formatAreasList(allAreas)}.
            </div>
          ) : (
            <div>
              The {formatAlertName(alert.info.headline, isMultipleAreas)}{' '}
              remains in place for {formatAreasList(allAreas)}.
            </div>
          )}
        </div>
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
