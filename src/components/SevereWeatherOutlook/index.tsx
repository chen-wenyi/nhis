import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useSevereWeatherOutlook } from '@/queries';
import { store } from '@/store';
import { useStore } from '@tanstack/react-store';
import { DateTime } from 'luxon';
import { useEffect, useRef } from 'react';
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
        <CardTitle>Severe Weather Outlook</CardTitle>
        <CardDescription>
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
  const activeOutlookReference = useStore(
    store,
    (state) => state.activeOutlookReference,
  );

  const isActive =
    activeOutlookReference &&
    activeOutlookReference.date ===
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
        quotes={activeOutlookReference?.quotes || []}
        keywords={activeOutlookReference?.keywords || []}
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
