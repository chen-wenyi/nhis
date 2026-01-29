import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import type { ThunderstormOutlookResp } from '@/types';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';

export const Route = createFileRoute('/diff/')({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  const items: ThunderstormOutlookResp[] = [
    [
      {
        header: 'Valid to midnight Wed, 28 Jan',
        outlook:
          'A combination of wind convergence and afternoon and early evening heating is expected to bring a low risk of a few thunderstorms to inland parts of the central North Island, as depicted on the chart.\n\nThere is minimal risk of thunderstorms or significant convection expected elsewhere during this period.',
        issuedDate: '7:32am Wed, 28 Jan',
      },
      {
        header: 'Valid from midnight Wed, 28 Jan to noon Thu, 29 Jan',
        outlook:
          'There is minimal risk of thunderstorms or significant convection during this period.',
        issuedDate: '7:39pm Wed, 28 Jan',
      },
      {
        header: 'Valid from noon Thu, 29 Jan to midnight Thu, 29 Jan',
        outlook:
          'A front moves northwards over the lower South Island during Thursday afternoon, and there is a low risk of thunderstorms on a southerly change for Dunedin, North Otago and about the Canterbury Plains and foothills south of Ashburton.\n\nThere is minimal risk of thunderstorms or significant convection expected elsewhere during this period.',
        issuedDate: '7:54pm Wed, 28 Jan',
      },
    ],
    [
      {
        header: 'Valid to midnight Wed, 28 Jan',
        outlook:
          'A combination of wind convergence and afternoon and early evening heating is expected to bring a low risk of a few thunderstorms to inland parts of the central North Island, as depicted on the chart.\n\nThere is minimal risk of thunderstorms or significant convection expected elsewhere during this period.',
        issuedDate: '7:32am Wed, 28 Jan',
      },
      {
        header: 'Valid from midnight Wed, 28 Jan to noon Thu, 29 Jan',
        outlook:
          'There is minimal risk of thunderstorms or significant convection during this period.',
        issuedDate: '9:03am Wed, 28 Jan',
      },
      {
        header: 'Valid from noon Thu, 29 Jan to midnight Thu, 29 Jan',
        outlook:
          'A front moves northwards over the lower South Island tomorrow afternoon and there is a low risk of thunderstorms on a southerly change for coastal North Otago and the far south of Canterbury plains.\n\nThere is minimal risk of thunderstorms or significant convection expected elsewhere during this period.',
        issuedDate: '9:10am Wed, 28 Jan',
      },
    ],
  ];

  const outlookStrs = items.map((item) =>
    item
      .map(({ header, outlook, issuedDate }) => {
        return `\n${header}\n${outlook}\nIssued: ${issuedDate}
  `;
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
    <div className="p-8">
      <div className="flex pb-1">
        <div className="flex-1 flex items-center justify-center">
          <ButtonGroup>
            {Array.from({ length }).map((_, idx) => (
              <Button
                variant={idx === oldIndex ? 'default' : 'outline'}
                key={idx}
                onClick={() => setOldIndex(idx)}
                // disabled={idx === length - 1}
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
                variant={idx === newIndex ? 'default' : 'outline'}
                key={idx}
                onClick={() => setNewIndex(idx)}
                // disabled={idx === length - 1}
              >
                Revision {idx + 1}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      </div>
      <ReactDiffViewer
        oldValue={outlookStrs[oldIndex]}
        newValue={outlookStrs[newIndex]}
        splitView={true}
        hideLineNumbers={true}
        compareMethod={DiffMethod.WORDS}
        showDiffOnly={false}
      />
    </div>
  );
}
