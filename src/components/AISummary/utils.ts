import type { Alert } from '@/types';
import type { DateTime } from 'luxon';
import type { SevereThunderstormLevel } from '../warnings-and-watches-indicators/severe-thunderstorm';

export function formatAreasList(areas: string[]): string {
  const filtered = areas.filter(Boolean);
  if (filtered.length === 0) return '';
  if (filtered.length === 1) return filtered[0];
  if (filtered.length === 2) return `${filtered[0]} and ${filtered[1]}`;

  const last = filtered[filtered.length - 1];
  return `${filtered.slice(0, -1).join(', ')} and ${last}`;
}

export function formatAlertDuration(from?: DateTime, to?: DateTime): string {
  let duration = '';
  const isSameDay = from && to && to.hasSame(from, 'day');

  if (from) {
    if (isSameDay) {
      duration += `, from ${from.toFormat('HHmm')}hrs`;
    } else {
      duration += `, from ${from.toFormat('HHmm')}hrs on ${from.toFormat('cccc')}`;
    }
  }

  if (to) {
    if (isSameDay) {
      duration += ` until ${to.toFormat('HHmm')}hrs`;
    } else {
      duration += ` until ${to.toFormat('HHmm')}hrs on ${to.toFormat('cccc')}`;
    }
  }

  return duration;
}

export const COLOR_CODE_MAP: { [key: string]: SevereThunderstormLevel } = {
  yellow: 'watch',
  orange: 'warning',
  red: 'red warning',
};

export function getColourCode(alert: Alert): string | undefined {
  return alert.info.parameter.find((p) => p.valueName === 'ColourCode')?.value;
}
