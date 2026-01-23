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
import { cn, formatUTCToNZDate } from '@/lib/utils';
import { useIssuedWarningsAndWatches } from '@/queries';
import { store } from '@/store';
import { sortAlerts } from '@/utils';
import { useStore } from '@tanstack/react-store';
import { useEffect, useRef } from 'react';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { AlertHistory } from './AlertHistory';
import { AlertIndicator } from './AlertIndicator';
import { getPeriodDescription } from './utils';

export default function IssuedWarningsAndWatches() {
  const {
    data: issuedWarningsAndWatches,
    error,
    isLoading,
  } = useIssuedWarningsAndWatches();

  const activeAlertReference = useStore(
    store,
    (state) => state.activeAlertReference,
  );

  const scrollIntoViewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeAlertReference?.alertIds.length === 0) return;
    if (scrollIntoViewRef.current) {
      scrollIntoViewRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [activeAlertReference]);

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
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="flex flex-col gap-2 w-70 text-[0.9rem]">
            {issuedWarningsAndWatches ? (
              sortAlerts(issuedWarningsAndWatches.entries).map((i) => {
                return (
                  <HoverCard key={i.id}>
                    <HoverCardTrigger asChild>
                      <div
                        ref={
                          activeAlertReference &&
                          activeAlertReference.alertIds.length > 0 &&
                          activeAlertReference.alertIds[0] === i.id
                            ? scrollIntoViewRef
                            : null
                        }
                        className={cn(
                          'mb-4 w-full border p-4 rounded-md shadow',
                          i._history.length > 0 &&
                            'hover:bg-gray-50 transition-all',
                          activeAlertReference?.alertIds.includes(i.id) &&
                            'border-blue-500 bg-blue-50',
                        )}
                      >
                        <div className="text-xs text-gray-500 mb-1 relative flex items-center justify-between gap-1">
                          <span>{formatUTCToNZDate(new Date(i.sent))}</span>
                          <div className="flex gap-1 justify-center items-center">
                            {i._status && (
                              <Badge
                                variant={'outline'}
                                className={cn(
                                  'text-xs right-0 font-semibold',
                                  i._status === 'updated' &&
                                    'border-blue-500 text-blue-500',
                                  i._status === 'removed' &&
                                    'border-gray-500 text-gray-500',
                                  i._status === 'new' &&
                                    'border-green-600 text-green-600',
                                )}
                              >
                                {i._status}
                              </Badge>
                            )}
                            {i._history.length > 0 && (
                              <Badge
                                // variant={'outline'}
                                title="Number of history"
                                className={'text-xs right-0 font-semibold'}
                              >
                                {i._history.length}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <AlertIndicator data={i} />
                        <div>
                          <span className="font-bold">Area: </span>
                          <span>{i.areaDesc.replace(/,/g, ', ')}</span>
                        </div>
                        <div>
                          <span className="font-bold">Period: </span>
                          <span>
                            {getPeriodDescription(i.onset, i.expires)}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold">ChanceOfUpgrade: </span>
                          <span>{i.ChanceOfUpgrade || 'N/A'}</span>
                        </div>
                      </div>
                    </HoverCardTrigger>
                    {i._history.length > 0 && (
                      <HoverCardContent
                        className="w-85 bg-gray-50"
                        side="right"
                      >
                        <AlertHistory history={i._history} />
                      </HoverCardContent>
                    )}
                  </HoverCard>
                );
              })
            ) : (
              <div>No issued warnings or watches.</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-36 w-full" />
    </div>
  );
}
