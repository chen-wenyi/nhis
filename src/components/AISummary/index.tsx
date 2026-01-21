import { useAlerts, useSevereWeatherOutlook } from '@/queries';
import type { Alert, SevereWeatherOutlook } from '@/types';
import { DateTime, Interval } from 'luxon';
import { useEffect, useState } from 'react';
import { Progress } from '../ui/progress';
import { SummaryItem } from './SummaryItem';

type Summary = {
  date: DateTime;
  issuedAlerts: Alert[];
  severeWeatherOutlook?: SevereWeatherOutlook;
};

export function AISummary() {
  const { data: alerts, isLoading: isAlertsLoading } = useAlerts();
  const { data: severeWeatherOutlook, isLoading: isSevereWeatherLoading } =
    useSevereWeatherOutlook();

  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (alerts && severeWeatherOutlook) {
      const start = DateTime.now().startOf('day');
      const end = DateTime.fromFormat(
        severeWeatherOutlook.outlookItems[
          severeWeatherOutlook.outlookItems.length - 1
        ].date,
        'cccc dd LLL',
      ).endOf('day');
      const interval = Interval.fromDateTimes(start, end);
      const dates = interval.splitBy({ days: 1 }).map((i) => i.start);

      const _summaries: Summary[] = dates
        .filter((d): d is DateTime => d !== null)
        .map((date) => ({ date, issuedAlerts: [], severeWeatherOutlook }));

      alerts.forEach((alert) => {
        const alertOnset = DateTime.fromISO(alert.info.onset);
        const alertExpires = DateTime.fromISO(alert.info.expires);
        _summaries.forEach((daySummary) => {
          if (
            daySummary.date >= alertOnset.startOf('day') &&
            daySummary.date <= alertExpires.endOf('day')
          ) {
            daySummary.issuedAlerts.push(alert);
          }
        });
      });

      setSummaries(_summaries);
    }
  }, [alerts, severeWeatherOutlook]);

  useEffect(() => {
    const steps = [isAlertsLoading, isSevereWeatherLoading];
    const completedSteps = steps.filter((step) => !step).length;
    setLoadingProgress((completedSteps / steps.length) * 100);
  }, [isAlertsLoading, isSevereWeatherLoading]);

  const isDataLoading = isAlertsLoading || isSevereWeatherLoading;

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
        summaries.map((summary) => (
          <SummaryItem key={summary.date.toISODate()} {...summary} />
        ))
      )}
    </div>
  );
}
