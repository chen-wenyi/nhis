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
import { cn } from '@/lib/utils';
import { useAlerts } from '@/queries';
import { store } from '@/store';
import { sortAlerts } from '@/utils';
import { useStore } from '@tanstack/react-store';
import { useEffect, useRef } from 'react';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { AlertHistory } from './AlertHistory';
import { AlertIndicator } from './AlertIndicator';
import { getChanceOfUpgrade, getPeriodDescription } from './utils';

export default function IssuedWarningsAndWatches() {
  const { data: alerts, error, isLoading } = useAlerts();

  const activeReference = useStore(store, (state) => state.activeReference);

  const scrollIntoViewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeReference?.alertIds.length === 0) return;
    if (scrollIntoViewRef.current) {
      scrollIntoViewRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [activeReference]);

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
          <div className="flex flex-col gap-2 w-70">
            {alerts ? (
              sortAlerts(alerts).map((alert) => {
                return (
                  <HoverCard key={alert.identifier}>
                    <HoverCardTrigger asChild>
                      <div
                        ref={
                          activeReference &&
                          activeReference.alertIds.length > 0 &&
                          activeReference.alertIds[0] === alert.identifier
                            ? scrollIntoViewRef
                            : null
                        }
                        className={cn(
                          'mb-4 w-full border p-4 rounded-md shadow',
                          alert._history.length > 0 &&
                            'hover:bg-gray-50 transition-all',
                          activeReference?.alertIds.includes(
                            alert.identifier,
                          ) && 'border-blue-500 bg-blue-50',
                        )}
                      >
                        <div className="text-xs text-gray-500 mb-1 relative flex items-center">
                          <span>{alert.sent}</span>
                          {alert._history.length > 0 && (
                            <Badge className="text-xs absolute right-0">
                              History
                            </Badge>
                          )}
                        </div>
                        <AlertIndicator alert={alert} />
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
                        <div>
                          <span className="font-bold">ChanceOfUpgrade: </span>
                          <span>{getChanceOfUpgrade(alert) || 'N/A'}</span>
                        </div>
                      </div>
                    </HoverCardTrigger>
                    {alert._history.length > 0 && (
                      <HoverCardContent
                        className="w-96 bg-gray-50"
                        side="right"
                      >
                        <AlertHistory history={alert._history} />
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
