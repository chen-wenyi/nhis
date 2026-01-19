import type { Alert } from '@/types';
import { DateTime } from 'luxon';
import type { SevereThunderstormLevel } from '../warnings-and-watches-indicators/severe-thunderstorm';

export const COLOR_CODE_MAP: { [key: string]: SevereThunderstormLevel } = {
  yellow: 'watch',
  orange: 'warning',
  red: 'red warning',
};

export function getPeriodDescription(onset: string, expires: string) {
  // 2026-01-15T20:00:00+13:00
  // use luxon to parse the date strings
  const onsetDate = DateTime.fromISO(onset);
  const expiresDate = DateTime.fromISO(expires);

  // format to this style 2100hrs Tues – 1800hrs Wed
  const onsetStr =
    onsetDate.day === expiresDate.day
      ? onsetDate.toFormat("HHmm'hrs'")
      : onsetDate.toFormat("HHmm'hrs' ccc");
  const expiresStr = expiresDate.toFormat("HHmm'hrs' ccc");

  return `${onsetStr} - ${expiresStr}`;
}

export function getColourCode(alert: Alert): string | undefined {
  return alert.info.parameter.find((p) => p.valueName === 'ColourCode')?.value;
}

export function getChanceOfUpgrade(alert: Alert): string | undefined {
  return alert.info.parameter.find((p) => p.valueName === 'ChanceOfUpgrade')
    ?.value;
}
