import { Badge } from '@/components/ui/badge';
import type { IssuedWarningOrWatche } from '@/types';
import { AlertIndicator } from './AlertIndicator';
import { getPeriodDescription } from './utils';

export function AlertHistory({
  history,
}: {
  history: IssuedWarningOrWatche[];
}) {
  return (
    <div className="w-full px-4 max-h-96 overflow-y-auto text-[0.9rem]">
      <h4 className="font-bold mb-2">History ({history.length})</h4>
      {history.map((i, index) => (
        <div key={i.id} className="mb-4 w-full border p-4 rounded-md shadow">
          <div className="text-xs text-gray-500 mb-1 flex items-center relative">
            <span>{i.sent}</span>
            {index === 0 && (
              <Badge className="absolute right-0 mx-2">Latest</Badge>
            )}
          </div>
          <AlertIndicator data={i} />
          <div>
            <span className="font-bold">Area: </span>
            <span>{i.areaDesc.replace(/,/g, ', ')}</span>
          </div>
          <div>
            <span className="font-bold">Period: </span>
            <span>{getPeriodDescription(i.onset, i.expires)}</span>
          </div>
          <div>
            <span className="font-bold">ChanceOfUpgrade: </span>
            <span>{i.ChanceOfUpgrade || 'N/A'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
