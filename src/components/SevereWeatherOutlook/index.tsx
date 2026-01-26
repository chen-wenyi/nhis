import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatUTCToNZDate } from '@/lib/utils';
import { useSevereWeatherOutlook } from '@/queries';
import { setActiveOutlookTab, store } from '@/store';
import { useStore } from '@tanstack/react-store';
import { DateTime } from 'luxon';
import { useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { ButtonGroup } from '../ui/button-group';
import { Skeleton } from '../ui/skeleton';
import { ReactMarkdownWithHighlight } from './ReactMarkdownWithHighlight';

export default function SevereWeatherOutlook() {
  const {
    data: severeWeatherOutlook,
    isLoading,
    error,
  } = useSevereWeatherOutlook();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <ButtonGroup className="w-full flex">
            <Button
              className="flex-1 h-12"
              onClick={() => setActiveOutlookTab('severeWeatherOutlook')}
            >
              Severe Weather Outlook
            </Button>
            <Button
              variant={'outline'}
              className="flex-1 text-black/65 h-12"
              onClick={() => setActiveOutlookTab('thunderstormOutlook')}
            >
              Thunderstorm Outlook
            </Button>
          </ButtonGroup>
        </CardTitle>
        <CardDescription className="mt-2 ml-1">
          <div className="flex gap-6">
            <span>
              Source:{' '}
              <a
                href="https://www.metservice.com/warnings/severe-weather-outlook"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                MetService
              </a>
            </span>
            <span>
              Issued:{' '}
              {severeWeatherOutlook?.issuedDate
                ? formatUTCToNZDate(severeWeatherOutlook.issuedDate)
                : ''}
            </span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="flex flex-col gap-6">
            {severeWeatherOutlook?.outlookItems.map((item) => (
              <SevereWeatherOutlookItem
                key={item.date}
                date={item.date}
                outlook={item.outlook}
              />
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-gray-500 text-xs">
          This section uses terminology for confidence, risk and chance provided
          by MetService
          <a
            href="https://about.metservice.com/about-severe-weather-warnings"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-2"
          >
            (
            <span className="underline">
              Severe Weather Warnings and Watches
            </span>
            )
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}

function SevereWeatherOutlookItem({
  date,
  outlook,
}: {
  date: string;
  outlook: string;
}) {
  const activeSevereWeatherOutlookReference = useStore(
    store,
    (state) => state.activeSevereWeatherOutlookReference,
  );

  const isActive =
    activeSevereWeatherOutlookReference &&
    activeSevereWeatherOutlookReference.date ===
      DateTime.fromFormat(date, 'cccc dd MMM').toISODate();

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isActive]);

  return (
    <div ref={isActive ? ref : null}>
      <div className="text-lg font-semibold">{date}</div>
      <ReactMarkdownWithHighlight
        markdown={outlook}
        quotes={activeSevereWeatherOutlookReference?.quotes || []}
        keywords={activeSevereWeatherOutlookReference?.keywords || []}
      />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <Skeleton className="h-full w-full" />
    </div>
  );
}
