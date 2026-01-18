import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import type { Alert, CAP } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { XMLParser } from 'fast-xml-parser';
import { DateTime } from 'luxon';
import { HeavyRain } from '../warnings-and-watches-indicators/heavy-rain';
import type { SevereThunderstormLevel } from '../warnings-and-watches-indicators/severe-thunderstorm';
import { SevereThunderstorm } from '../warnings-and-watches-indicators/severe-thunderstorm';

export default function IssuedWarningsAndWatches() {
  const {
    data: alerts,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => getAlerts(),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issued Warnings And Watches</CardTitle>
        <CardDescription>
          <span>
            Source:{' '}
            <a
              href="https://www.metservice.com/warnings/home"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              MetService
            </a>
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 w-70">
          {alerts &&
            alerts.map((alert) => {
              return (
                <HoverCard key={alert.identifier}>
                  <HoverCardTrigger asChild>
                    <div
                      key={alert.identifier}
                      className="mb-4 w-full border p-4 rounded-md shadow hover:bg-gray-50 transition-all text-sm"
                    >
                      <div className="text-xs text-gray-500 mb-1">
                        <span>{alert.sent}</span>
                      </div>
                      <Indicator alert={alert} />
                      <div>
                        <span className="font-bold">Area: </span>
                        <span>
                          {alert.info.area.areaDesc.replace(/,/g, ', ')}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold">Period: </span>
                        <span>
                          {getPeriodDescription(
                            alert.info.onset,
                            alert.info.expires,
                          )}
                        </span>
                      </div>
                    </div>
                  </HoverCardTrigger>
                  {alert._history.length > 0 && (
                    <HoverCardContent className="w-96 bg-gray-50">
                      <AlertHistory history={alert._history} />
                    </HoverCardContent>
                  )}
                </HoverCard>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}

const COLOR_CODE_MAP: { [key: string]: SevereThunderstormLevel } = {
  yellow: 'watch',
  orange: 'warning',
  red: 'red warning',
};

function Indicator({ alert }: { alert: Alert }) {
  const event = alert.info.event.toLowerCase();
  const colorCode = alert.info.parameter.find(
    (p) => p.valueName === 'ColourCode',
  );
  const level = colorCode?.value.toLowerCase()
    ? COLOR_CODE_MAP[colorCode.value.toLowerCase()]
    : '';

  if (event === 'thunderstorm') {
    return (
      <h3 className="flex items-center gap-2 font-semibold">
        <div className="w-8 h-8 ">
          {level && <SevereThunderstorm level={level} />}
        </div>
        {alert.info.headline}
      </h3>
    );
  } else if (event === 'rain') {
    return (
      <div className="flex items-center gap-2 font-semibold">
        <div className="w-8 h-8">{level && <HeavyRain level={level} />}</div>
        {alert.info.headline}
      </div>
    );
  } else {
    return <h3 className="font-semibold">{alert.info.headline}</h3>;
  }
}

function AlertHistory({ history }: { history: Alert[] }) {
  return (
    <div className="w-full max-h-96 overflow-y-auto">
      <h4 className="font-bold mb-2">Alert History ({history.length})</h4>
      {history.map((alert, index) => (
        <div
          key={alert.identifier}
          className="mb-4 w-full border p-4 rounded-md shadow"
        >
          <div className="text-xs text-gray-500 mb-1 flex items-center relative">
            <span>{alert.sent}</span>
            {index === 0 && (
              <Badge className="absolute right-0 mx-2">Latest</Badge>
            )}
          </div>
          <Indicator alert={alert} />
          <div>
            <span className="font-bold">Area: </span>
            <span>{alert.info.area.areaDesc.replace(/,/g, ', ')}</span>
          </div>
          <div>
            <span className="font-bold">Period: </span>
            <span>
              {getPeriodDescription(alert.info.onset, alert.info.expires)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function getPeriodDescription(onset: string, expires: string) {
  // 2026-01-15T20:00:00+13:00
  // use luxon to parse the date strings
  const onsetDate = DateTime.fromISO(onset);
  const expiresDate = DateTime.fromISO(expires);

  // format to this style 2100hrs Tues – 1800hrs Wed
  const onsetStr =
    onsetDate.day === expiresDate.day
      ? onsetDate.toFormat("HHmm'hrs'")
      : onsetDate.toFormat("HHmm'hrs' ccc");
  const expiresStr = expiresDate.toFormat("HHmm'hrs' ccc");

  return `${onsetStr} - ${expiresStr}`;
}

const getAlerts = createServerFn().handler(async (): Promise<Alert[]> => {
  const response = fetch('https://alerts.metservice.com/cap/atom');
  try {
    const data = await response.then((res) => res.text());
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
    });
    const { feed } = parser.parse(data) as CAP;
    if (!feed.entry) {
      return [];
    }
    const promiseFeed = Promise.all(
      feed.entry.map(async (entry) => {
        const alertResponse = await fetch(entry.link.href);
        const alertData = await alertResponse.text();
        const alertObj = parser.parse(alertData);
        const { alert } = alertObj as { alert: Alert };
        if (alert.references) {
          alert._history = await getAlertHistory(alert.identifier);
        } else {
          alert._history = [];
        }
        return alert;
      }),
    );
    return promiseFeed;
  } catch (error) {
    console.error('Error fetching Warnings and Watches:', error);
    return [];
  }
});

async function getAlertById(id: string): Promise<Alert> {
  // Implementation for fetching a specific alert by its ID can be added here.
  const alertResponse = await fetch(
    `https://alerts.metservice.com/cap/alert?id=${id}`,
  );
  const alertData = await alertResponse.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
  });
  const { alert } = parser.parse(alertData);

  return alert as Alert;
}

export async function getAlertHistory(id: string): Promise<Alert[]> {
  const history: Alert[] = [];
  let currentId: string = id;

  while (currentId) {
    const alert = await getAlertById(currentId);
    history.push(alert);

    // Get the reference ID from the alert (if exists)
    if (alert.references) {
      // references format: "sender,identifier,sent"
      currentId = alert.references.split(',')[1];
    } else {
      currentId = '';
    }
  }

  return history;
}
