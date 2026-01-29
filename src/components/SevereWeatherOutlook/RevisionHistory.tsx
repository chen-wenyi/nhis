import { formatUTCToNZDate } from '@/lib/utils';
import { useSevereWeatherOutlook } from '@/queries';
import { getSevereWeatherOutlookHistory } from '@/serverFuncs/fetchSevereWeatherOutlook';
import type { SevereWeatherOutlook } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';
import { Button } from '../ui/button';
import { ButtonGroup } from '../ui/button-group';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';

export function RevisionHistory() {
  const { data: outlook } = useSevereWeatherOutlook();

  const { data: revisionHistory } = useQuery({
    enabled: !!outlook?.issuedDate,
    queryKey: ['severeWeatherOutlookRevisionHistory', outlook?.id],
    queryFn: async () => {
      return outlook?.issuedDate
        ? getSevereWeatherOutlookHistory({
            data: { issuedDate: outlook.issuedDate },
          })
        : undefined;
    },
    staleTime: Infinity,
  });

  if (!revisionHistory || revisionHistory.length <= 1) {
    return <></>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Revision History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[80vw]! h-[80vh]">
        {<DiffViewer items={revisionHistory} />}
      </DialogContent>
    </Dialog>
  );
}

export function DiffViewer({ items }: { items: SevereWeatherOutlook[] }) {
  const outlookStrs = items.map(({ outlookItems, issuedDate }) => {
    const header = `Issued: ${issuedDate ? `${formatUTCToNZDate(issuedDate)}\n` : '\n'}`;
    const result = `${header}\n ${outlookItems
      .map(({ date, outlook }) => {
        return `\n${date}\n${outlook.replaceAll('\n', ' \n \n')}`;
      })
      .join('\n \n ')}`;
    return result;
  });

  const length = outlookStrs.length;
  if (length < 2) {
    return <div>No previous summary to compare.</div>;
  }

  const [oldIndex, setOldIndex] = useState(length - 2);
  const [newIndex, setNewIndex] = useState(length - 1);

  return (
    <div className="flex flex-col w-full h-full min-h-0">
      <div className="flex pb-2">
        <div className="flex-1 flex items-center justify-center">
          <ButtonGroup>
            {Array.from({ length }).map((_, idx) => (
              <Button
                size="sm"
                variant={idx === oldIndex ? 'default' : 'outline'}
                key={idx}
                onClick={() => setOldIndex(idx)}
                disabled={idx === newIndex}
              >
                Revision {idx + 1}
              </Button>
            ))}
          </ButtonGroup>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <ButtonGroup>
            {Array.from({ length }).map((_, idx) => (
              <Button
                size="sm"
                variant={idx === newIndex ? 'default' : 'outline'}
                key={idx}
                onClick={() => setNewIndex(idx)}
                disabled={idx === oldIndex}
              >
                Revision {idx + 1}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <ReactDiffViewer
          oldValue={outlookStrs[oldIndex]}
          newValue={outlookStrs[newIndex]}
          splitView={true}
          hideLineNumbers={true}
          compareMethod={DiffMethod.WORDS}
          showDiffOnly={false}
        />
      </div>
    </div>
  );
}
