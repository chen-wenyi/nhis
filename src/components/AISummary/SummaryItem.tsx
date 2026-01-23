import { cn } from '@/lib/utils';
import { useAISummary } from '@/queries';
import {
  removeActiveAlertReference,
  removeactiveSevereWeatherOutlookReference,
  setActiveAlertReference,
  setActiveSevereWeatherOutlookReference,
  store,
} from '@/store';
import type { IssuedWarningOrWatche, SevereWeatherOutlook } from '@/types';
import { formatAlertName, sortAlerts } from '@/utils';
import { useStore } from '@tanstack/react-store';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { AiOutlineFileSearch } from 'react-icons/ai';
import { LuFileSearch2 } from 'react-icons/lu';
import { Skeleton } from '../ui/skeleton';
import { AlertIndicator } from './AlertIndicator';
import type { SevereWeatherAISummary } from './schema';
import { formatAlertDuration, formatAreasList, groupAlerts } from './utils';

type Summary = {
  date: DateTime;
  issuedWarningsAndWatches: IssuedWarningOrWatche[];
  severeWeatherOutlook?: SevereWeatherOutlook;
};

export function SummaryItem({
  date,
  issuedWarningsAndWatches,
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

  const groupedIssuedWarningsAndWatchesToday = useMemo(() => {
    return groupAlerts(
      sortAlerts(issuedWarningsAndWatches).filter(({ onset }) =>
        DateTime.fromISO(onset).hasSame(date, 'day'),
      ),
    );
  }, [issuedWarningsAndWatches, date]);

  const groupedIssuedWarningsAndWatchesRemaining = useMemo(() => {
    return groupAlerts(
      sortAlerts(issuedWarningsAndWatches).filter(({ onset, expires }) => {
        return (
          !DateTime.fromISO(onset).hasSame(date, 'day') &&
          !DateTime.fromISO(expires).hasSame(date, 'day')
        );
      }),
    );
  }, [issuedWarningsAndWatches, date]);

  const groupedIssuedWarningsAndWatchesEnd = useMemo(() => {
    return groupAlerts(
      sortAlerts(issuedWarningsAndWatches).filter(({ onset, expires }) => {
        return (
          DateTime.fromISO(expires).hasSame(date, 'day') &&
          !DateTime.fromISO(onset).hasSame(date, 'day')
        );
      }),
    );
  }, [issuedWarningsAndWatches, date]);

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
            {issuedWarningsAndWatches.length > 0 &&
              groupedIssuedWarningsAndWatchesToday.length > 0 && (
                <ul className="text-sm">
                  {groupedIssuedWarningsAndWatchesToday.map((group) => (
                    <li className="py-2" key={group[0].id}>
                      <IssuedAlerts
                        issuedWarningsAndWatches={group}
                        date={date}
                      />
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
                    <IssuedAlertsEnd
                      issuedWarningsAndWatches={group}
                      date={date}
                    />
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
                    <SevereWeatherOutlookItem date={date} outlook={outlook} />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            {issuedWarningsAndWatches.length === 0 && outlooks.length === 0 && (
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

function SevereWeatherOutlookItem({
  date,
  outlook,
}: {
  date: DateTime;
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
      <OutlookRefIcon
        date={date}
        quotes={outlook.quotes}
        keywords={outlook.keywords}
      />
    </span>
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

function OutlookRefIcon({
  date,
  quotes,
  keywords,
}: {
  date: DateTime;
  quotes: string[];
  keywords: string[];
}) {
  const activeSevereWeatherOutlookReference = useStore(
    store,
    (state) => state.activeSevereWeatherOutlookReference,
  );
  const isActive =
    activeSevereWeatherOutlookReference &&
    activeSevereWeatherOutlookReference.date === date.toISODate() &&
    activeSevereWeatherOutlookReference.quotes.toString() ===
      quotes.toString() &&
    activeSevereWeatherOutlookReference.keywords.toString() ===
      keywords.toString();

  const onClick = () => {
    if (!isActive) {
      setActiveSevereWeatherOutlookReference({
        quotes,
        keywords,
        date: date.toISODate()!,
      });
    } else {
      removeactiveSevereWeatherOutlookReference();
    }
  };

  return (
    <AiOutlineFileSearch
      className={cn(
        'inline align-text-bottom ml-2 text-gray-300 cursor-pointer hover:text-yellow-500',
        isActive && 'text-yellow-500',
      )}
      size={16}
      onClick={onClick}
    />
  );
}
