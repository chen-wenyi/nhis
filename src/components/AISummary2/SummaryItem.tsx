import { cn } from '@/lib/utils';
import type { SevereWeatherAISummary } from '@/serverFuncs/AISummary/severeWeatherOutlook/schema';
import type { ThunderstormOutlookAISummary } from '@/serverFuncs/AISummary/thunderstormOutlook/schema';
import {
  removeActiveAlertReference,
  setActiveAlertReference,
  store,
} from '@/store';
import type { IssuedWarningOrWatche } from '@/types';
import { formatAlertName, sortAlerts } from '@/utils';
import { useStore } from '@tanstack/react-store';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { LuFileSearch2 } from 'react-icons/lu';
import { CopyIcon } from '../CopyIcon';
import { Skeleton } from '../ui/skeleton';
import { AlertIndicator } from './AlertIndicator';
import { SevereWeatherOutlookItemComp } from './SevereWeatherOutlookItemComp';
import { ThunderstormOutlookItemComp } from './ThunderstormOutlookItemComp';
import { formatAlertDuration, formatAreasList, groupAlerts } from './utils';

export type Summary = {
  date: DateTime<true>;
  issuedWarningsAndWatches: IssuedWarningOrWatche[];
  severeWeatherOutlookAISummary: SevereWeatherAISummary;
  thunderstormOutlookAISummary: ThunderstormOutlookAISummary[];
  isSevereWeatherOutlookLoading: boolean;
  isThunderstormOutlookLoading: boolean;
};

export function SummaryItem({
  date,
  issuedWarningsAndWatches,
  severeWeatherOutlookAISummary,
  thunderstormOutlookAISummary,
  isSevereWeatherOutlookLoading,
  isThunderstormOutlookLoading,
}: Summary) {
  const groupedIssuedWarningsAndWatchesToday = useMemo(() => {
    return groupAlerts(
      sortAlerts(issuedWarningsAndWatches).filter(
        ({ onset, _status }) =>
          DateTime.fromISO(onset).hasSame(date, 'day') && _status !== 'removed',
      ),
    );
  }, [issuedWarningsAndWatches, date]);

  const groupedIssuedWarningsAndWatchesRemaining = useMemo(() => {
    return groupAlerts(
      sortAlerts(issuedWarningsAndWatches).filter(
        ({ onset, expires, _status }) => {
          return (
            !DateTime.fromISO(onset).hasSame(date, 'day') &&
            !DateTime.fromISO(expires).hasSame(date, 'day') &&
            _status !== 'removed'
          );
        },
      ),
    );
  }, [issuedWarningsAndWatches, date]);

  const groupedIssuedWarningsAndWatchesEnd = useMemo(() => {
    return groupAlerts(
      sortAlerts(issuedWarningsAndWatches).filter(
        ({ onset, expires, _status }) => {
          return (
            DateTime.fromISO(expires).hasSame(date, 'day') &&
            !DateTime.fromISO(onset).hasSame(date, 'day') &&
            _status !== 'removed'
          );
        },
      ),
    );
  }, [issuedWarningsAndWatches, date]);

  return (
    <div className="flex flex-col" key={date.toISODate()}>
      <span className="font-semibold">{date.toFormat('cccc dd LLLL')}</span>
      <div>
        {issuedWarningsAndWatches.length > 0 &&
          groupedIssuedWarningsAndWatchesToday.length > 0 && (
            <ul className="text-sm">
              {groupedIssuedWarningsAndWatchesToday.map((group) => (
                <li className="py-2" key={group[0].id}>
                  <IssuedAlerts issuedWarningsAndWatches={group} date={date} />
                </li>
              ))}
            </ul>
          )}
        {groupedIssuedWarningsAndWatchesRemaining.length > 0 && (
          <ul className="text-sm">
            {groupedIssuedWarningsAndWatchesRemaining.map((group) => (
              <li className="py-2" key={group[0].id}>
                <IssuedAlertsRemaining
                  issuedWarningsAndWatches={group}
                  date={date}
                />
              </li>
            ))}
          </ul>
        )}
        {groupedIssuedWarningsAndWatchesEnd.length > 0 && (
          <ul className="text-sm">
            {groupedIssuedWarningsAndWatchesEnd.map((group) => (
              <li className="py-2" key={group[0].id}>
                <IssuedAlertsEnd issuedWarningsAndWatches={group} date={date} />
              </li>
            ))}
          </ul>
        )}
      </div>
      {isSevereWeatherOutlookLoading ? (
        <div className="flex flex-col gap-2 py-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      ) : (
        severeWeatherOutlookAISummary.length > 0 && (
          <div>
            <ul className="text-sm list-disc pl-6 space-y-1">
              {severeWeatherOutlookAISummary.map((outlook, index) => (
                <li className="py-2" key={index}>
                  <SevereWeatherOutlookItemComp date={date} outlook={outlook} />
                </li>
              ))}
            </ul>
          </div>
        )
      )}
      {isThunderstormOutlookLoading ? (
        <div className="flex flex-col gap-2 py-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      ) : (
        thunderstormOutlookAISummary.length > 0 && (
          <div>
            <ul className="text-sm list-disc pl-6 space-y-1">
              {thunderstormOutlookAISummary.map((outlook, index) => (
                <li className="py-2" key={index}>
                  <ThunderstormOutlookItemComp date={date} outlook={outlook} />
                </li>
              ))}
            </ul>
          </div>
        )
      )}
      {!isSevereWeatherOutlookLoading &&
        !isThunderstormOutlookLoading &&
        issuedWarningsAndWatches.length === 0 &&
        severeWeatherOutlookAISummary.length === 0 &&
        thunderstormOutlookAISummary.length === 0 && (
          <MinimalRiskSevereWeatherOutlook />
        )}
    </div>
  );
}

function IssuedAlerts({
  issuedWarningsAndWatches,
  date,
}: {
  issuedWarningsAndWatches: IssuedWarningOrWatche[];
  date: DateTime;
}) {
  const issuedWarningOrAlert = issuedWarningsAndWatches[0];
  const isMultipleAreas = issuedWarningsAndWatches.length > 1;

  let upgradeTo = '';
  const name = issuedWarningOrAlert.headline.toLowerCase();
  if (name.includes('watch')) {
    upgradeTo = 'warning';
  } else if (name.includes('warning - orange')) {
    upgradeTo = 'red warning';
  } else if (name.includes('warning')) {
    upgradeTo = 'red warning';
  }

  const chance = issuedWarningOrAlert.ChanceOfUpgrade;

  return (
    <div className="flex items-stretch gap-2">
      <div className="flex min-h-full">
        <AlertIndicator data={issuedWarningOrAlert} />
      </div>
      <span>
        {isMultipleAreas ? (
          <div className="flex flex-col gap-1">
            <div>
              MetService has issued{' '}
              {formatAlertName(issuedWarningOrAlert.headline, isMultipleAreas)}{' '}
              for the following areas:
            </div>
            <ul className="list-disc pl-6 space-y-1">
              {issuedWarningsAndWatches.map((i, idx) => (
                <li key={idx}>
                  {i.areaDesc.length > 0 ? i.areaDesc : 'Multiple areas'}
                  {formatAlertDuration(
                    DateTime.fromISO(i.onset),
                    DateTime.fromISO(i.expires),
                  )}
                  {i.ChanceOfUpgrade && upgradeTo && (
                    <span>
                      . There is a{' '}
                      <span className="underline lowercase">
                        {i.ChanceOfUpgrade}
                      </span>{' '}
                      confidence of upgrading to a {upgradeTo}
                    </span>
                  )}
                  <span>.</span>
                  <AlertRef date={date} alertIds={[i.id]} />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            A {formatAlertName(issuedWarningOrAlert.headline, isMultipleAreas)}{' '}
            has been issued{' '}
            {issuedWarningOrAlert.areaDesc.length > 0 && (
              <>for {issuedWarningOrAlert.areaDesc}</>
            )}
            {formatAlertDuration(
              DateTime.fromISO(issuedWarningOrAlert.onset),
              DateTime.fromISO(issuedWarningOrAlert.expires),
            )}
            {chance && upgradeTo && (
              <span>
                . There is a{' '}
                <span className="underline lowercase">{chance}</span> confidence
                of upgrading to a {upgradeTo}
              </span>
            )}
            <span>.</span>
            <AlertRef date={date} alertIds={[issuedWarningOrAlert.id]} />
          </>
        )}
      </span>
    </div>
  );
}

function IssuedAlertsRemaining({
  issuedWarningsAndWatches,
  date,
}: {
  issuedWarningsAndWatches: IssuedWarningOrWatche[];
  date: DateTime;
}) {
  const issuedWarningOrAlert = issuedWarningsAndWatches[0];
  const allAreas = issuedWarningsAndWatches.flatMap((a) =>
    a.areaDesc.split(',').map((area) => area.trim()),
  );
  const isMultipleAreas = issuedWarningsAndWatches.length > 1;
  return (
    <div className="flex items-stretch gap-2">
      <div className="flex justify-center min-h-full">
        <AlertIndicator data={issuedWarningOrAlert} />
      </div>
      <span>
        <div className="flex gap-1">
          {isMultipleAreas ? (
            <div>
              The{' '}
              {formatAlertName(issuedWarningOrAlert.headline, isMultipleAreas)}{' '}
              remain in place for {formatAreasList(allAreas)}.
              <AlertRef
                date={date}
                alertIds={issuedWarningsAndWatches.map((m) => m.id)}
              />
            </div>
          ) : (
            <div>
              The{' '}
              {formatAlertName(issuedWarningOrAlert.headline, isMultipleAreas)}{' '}
              remains in place for {formatAreasList(allAreas)}.
              <AlertRef
                date={date}
                alertIds={issuedWarningsAndWatches.map((m) => m.id)}
              />
            </div>
          )}
        </div>
      </span>
    </div>
  );
}

function IssuedAlertsEnd({
  issuedWarningsAndWatches,
  date,
}: {
  issuedWarningsAndWatches: IssuedWarningOrWatche[];
  date: DateTime;
}) {
  const issuedWarningOrAlert = issuedWarningsAndWatches[0];
  const allAreas = issuedWarningsAndWatches.flatMap((a) =>
    a.areaDesc.split(',').map((area) => area.trim()),
  );
  const isMultipleAreas = issuedWarningsAndWatches.length > 1;

  return (
    <div className="flex items-stretch gap-2">
      <div className="flex justify-center min-h-full">
        <AlertIndicator data={issuedWarningOrAlert} />
      </div>
      <span>
        <div className="flex gap-1">
          {isMultipleAreas ? (
            <div>
              The{' '}
              {formatAlertName(issuedWarningOrAlert.headline, isMultipleAreas)}{' '}
              remain in place for {formatAreasList(allAreas)}.
              <AlertRef
                date={date}
                alertIds={issuedWarningsAndWatches.map((m) => m.id)}
              />
            </div>
          ) : (
            <div>
              The{' '}
              {formatAlertName(issuedWarningOrAlert.headline, isMultipleAreas)}{' '}
              remains in place for {formatAreasList(allAreas)} until{' '}
              {`${DateTime.fromISO(issuedWarningOrAlert.expires).toFormat('HHmm')}hrs`}{' '}
              today.
              <AlertRef
                date={date}
                alertIds={issuedWarningsAndWatches.map((m) => m.id)}
              />
            </div>
          )}
        </div>
      </span>
    </div>
  );
}

function AlertRef({ date, alertIds }: { date: DateTime; alertIds: string[] }) {
  const activeAlertReference = useStore(
    store,
    (state) => state.activeAlertReference,
  );
  const isActive =
    activeAlertReference &&
    activeAlertReference.date === date.toISODate() &&
    activeAlertReference.alertIds.toString() === alertIds.toString();

  const onClick = () => {
    if (!isActive) {
      setActiveAlertReference({
        alertIds,
        date: date.toISODate()!,
      });
    } else {
      removeActiveAlertReference();
    }
  };

  return (
    <LuFileSearch2
      className={cn(
        'inline align-text-bottom ml-2 text-gray-300 cursor-pointer hover:text-blue-500',
        isActive && 'text-blue-500',
      )}
      size={16}
      onClick={onClick}
    />
  );
}

function MinimalRiskSevereWeatherOutlook() {
  return (
    <div className="flex items-center gap-1">
      <div className="text-sm py-2">
        There is <span className="underline">minimal</span> risk of severe
        weather.
      </div>
      <CopyIcon content="There is minimal risk of severe weather." />
    </div>
  );
}
