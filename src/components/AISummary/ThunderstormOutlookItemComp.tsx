import { cn } from '@/lib/utils';
import type { ThunderstormAISummary } from '@/serverFuncs/generateThunderstormOutlookAISummary/schema';
import {
  removeactiveThunderstormOutlookReference,
  setActiveThunderstormOutlookReference,
  store,
} from '@/store';
import { useStore } from '@tanstack/react-store';
import type { DateTime } from 'luxon';
import { AiOutlineFileSearch } from 'react-icons/ai';
import { formatAreasList, formatDuration } from './utils';

export function ThunderstormOutlookItemComp({
  date,
  outlook,
}: {
  date: DateTime;
  outlook: NonNullable<ThunderstormAISummary['outlooks']>[number];
}) {
  const formattedDuration = formatDuration(outlook.when);
  return (
    <span>
      {formattedDuration
        ? `During ${formattedDuration}, there is `
        : 'There is '}
      <span className="underline lowercase">{outlook.risk}</span> risk of
      thunderstorms
      {outlook.areas.length > 0 ? ` for ${formatAreasList(outlook.areas)}` : ''}
      .
      <OutlookRefIcon
        date={date}
        quotes={outlook.quotes}
        keywords={outlook.keywords}
      />
    </span>
  );
}

function OutlookRefIcon({
  date,
  quotes,
  keywords,
}: {
  date: DateTime;
  quotes: string[];
  keywords: string[];
}) {
  const activeThunderstormOutlookReference = useStore(
    store,
    (state) => state.activeThunderstormOutlookReference,
  );
  const isActive =
    activeThunderstormOutlookReference &&
    activeThunderstormOutlookReference.date === date.toISODate() &&
    activeThunderstormOutlookReference.quotes.toString() ===
      quotes.toString() &&
    activeThunderstormOutlookReference.keywords.toString() ===
      keywords.toString();

  const onClick = () => {
    if (!isActive) {
      setActiveThunderstormOutlookReference({
        quotes,
        keywords,
        date: date.toISODate()!,
      });
    } else {
      removeactiveThunderstormOutlookReference();
    }
  };

  return (
    <AiOutlineFileSearch
      className={cn(
        'inline align-text-bottom ml-2 text-gray-300 cursor-pointer hover:text-yellow-500',
        isActive && 'text-yellow-500',
      )}
      size={16}
      onClick={onClick}
    />
  );
}
