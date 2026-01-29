import { useThunderstormOutlook } from '@/queries';
import { getThunderstormOutlookHistory } from '@/serverFuncs/fetchThunderstormOutlook';
import type { ThunderstormOutlookResp } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';
import { Button } from '../ui/button';
import { ButtonGroup } from '../ui/button-group';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';

export function RevisionHistory() {
  const { data: outlook } = useThunderstormOutlook();

  const issuedDateStrs = outlook?.items.map((item) =>
    item.issuedDate.split(', ')[1].trim(),
  );

  // if every issued date is the same, assign only one date string
  const uniqueIssuedDateStrs = Array.from(new Set(issuedDateStrs));

  const issuedDateStr =
    uniqueIssuedDateStrs.length === 1 ? uniqueIssuedDateStrs[0] : '';

  const { data: revisionHistory } = useQuery({
    enabled: !!outlook && !!issuedDateStr,
    queryKey: ['thunderstormOutlookRevisionHistory', outlook?.id],
    queryFn: async () =>
      getThunderstormOutlookHistory({ data: { dateStr: issuedDateStr } }),
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
        {<DiffViewer items={revisionHistory.map(({ items }) => items)} />}
      </DialogContent>
    </Dialog>
  );
}

export function DiffViewer({ items }: { items: ThunderstormOutlookResp[] }) {
  // const items: ThunderstormOutlookResp[] = [
  //   [
  //     {
  //       header: 'Valid to midnight Wed, 28 Jan',
  //       outlook:
  //         'A combination of wind convergence and afternoon and early evening heating is expected to bring a low risk of a few thunderstorms to inland parts of the central North Island, as depicted on the chart.\n\nThere is minimal risk of thunderstorms or significant convection expected elsewhere during this period.',
  //       issuedDate: '7:32am Wed, 28 Jan',
  //     },
  //     {
  //       header: 'Valid from midnight Wed, 28 Jan to noon Thu, 29 Jan',
  //       outlook:
  //         'There is minimal risk of thunderstorms or significant convection during this period.',
  //       issuedDate: '7:39pm Wed, 28 Jan',
  //     },
  //     {
  //       header: 'Valid from noon Thu, 29 Jan to midnight Thu, 29 Jan',
  //       outlook:
  //         'A front moves northwards over the lower South Island during Thursday afternoon, and there is a low risk of thunderstorms on a southerly change for Dunedin, North Otago and about the Canterbury Plains and foothills south of Ashburton.\n\nThere is minimal risk of thunderstorms or significant convection expected elsewhere during this period.',
  //       issuedDate: '7:54pm Wed, 28 Jan',
  //     },
  //   ],
  //   [
  //     {
  //       header: 'Valid to midnight Wed, 28 Jan',
  //       outlook:
  //         'A combination of wind convergence and afternoon and early evening heating is expected to bring a low risk of a few thunderstorms to inland parts of the central North Island, as depicted on the chart.\n\nThere is minimal risk of thunderstorms or significant convection expected elsewhere during this period.',
  //       issuedDate: '7:32am Wed, 28 Jan',
  //     },
  //     {
  //       header: 'Valid from midnight Wed, 28 Jan to noon Thu, 29 Jan',
  //       outlook:
  //         'There is minimal risk of thunderstorms or significant convection during this period.',
  //       issuedDate: '9:03am Wed, 28 Jan',
  //     },
  //     {
  //       header: 'Valid from noon Thu, 29 Jan to midnight Thu, 29 Jan',
  //       outlook:
  //         'A front moves northwards over the lower South Island tomorrow afternoon and there is a low risk of thunderstorms on a southerly change for coastal North Otago and the far south of Canterbury plains.\n\nThere is minimal risk of thunderstorms or significant convection expected elsewhere during this period.',
  //       issuedDate: '9:10am Wed, 28 Jan',
  //     },
  //   ],
  // ];

  const outlookStrs = items.map((item) =>
    item
      .map(({ header, outlook, issuedDate }) => {
        return `\n${header}\n${outlook}\nIssued: ${issuedDate}`;
      })
      .join('\n\n'),
  );

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
