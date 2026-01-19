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
import { useQuery } from '@tanstack/react-query';
import { Badge } from '../ui/badge';
import { Spinner } from '../ui/spinner';
import { AlertHistory } from './AlertHistory';
import { AlertIndicator } from './AlertIndicator';
import { fetchActiveAlerts } from './api';
import { getChanceOfUpgrade, getPeriodDescription } from './utils';

export default function IssuedWarningsAndWatches() {
  const {
    data: alerts,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => fetchActiveAlerts(),
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
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Spinner />
              <span>Loading warnings and watches...</span>
            </div>
          ) : alerts ? (
            alerts.map((alert) => {
              return (
                <HoverCard key={alert.identifier}>
                  <HoverCardTrigger asChild>
                    <div
                      key={alert.identifier}
                      className={cn(
                        'mb-4 w-full border p-4 rounded-md shadow',
                        alert._history.length > 0 &&
                          'hover:bg-gray-50 transition-all',
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
                    <HoverCardContent className="w-96 bg-gray-50" side="right">
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
      </CardContent>
    </Card>
  );
}
