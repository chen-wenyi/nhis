import type { Alert } from './types';

export function formatAlertName(
  title: string,
  isPlural: boolean = false,
): string {
  let formatted: string;

  if (title.includes(' - Red')) {
    formatted = 'Red Heavy Rain Warning';
  } else {
    formatted = title.replace(' - Orange', '');
  }

  if (isPlural) {
    if (formatted.includes('Watch')) {
      formatted = formatted.replace('Watch', 'Watches');
    } else if (formatted.includes('Warning')) {
      formatted = formatted.replace('Warning', 'Warnings');
    }
  }

  return formatted;
}

// Configurable alert sort order - adjust as needed
const ALERT_SORT_ORDER = [
  'Severe Thunderstorm Warning',
  'Heavy Rain Warning - Red',
  'Heavy Rain Warning - Orange',
  'Severe Thunderstorm Watch',
  'Strong Wind Warning',
  'Heavy Rain Watch',
  'Strong Wind Watch',
];

export function sortAlerts(alerts: Alert[]): Alert[] {
  return [...alerts].sort((a, b) => {
    const aHeadline = a.info.headline;
    const bHeadline = b.info.headline;

    const aIndex = ALERT_SORT_ORDER.findIndex((order) =>
      aHeadline.includes(order),
    );
    const bIndex = ALERT_SORT_ORDER.findIndex((order) =>
      bHeadline.includes(order),
    );

    // If both found in order list, sort by their position
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }

    // If only a is in order list, it comes first
    if (aIndex !== -1) return -1;

    // If only b is in order list, it comes first
    if (bIndex !== -1) return 1;

    // Otherwise maintain original order
    return 0;
  });
}
