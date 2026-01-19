import type { Alert } from '@/types';
import { HeavyRain } from '../warnings-and-watches-indicators/heavy-rain';
import { SevereThunderstorm } from '../warnings-and-watches-indicators/severe-thunderstorm';
import { COLOR_CODE_MAP, getColourCode } from './utils';

export function AlertIndicator({ alert }: { alert: Alert }) {
  const event = alert.info.event.toLowerCase();
  const colorCode = getColourCode(alert);
  const level = colorCode?.toLowerCase()
    ? COLOR_CODE_MAP[colorCode.toLowerCase()]
    : '';

  if (event === 'thunderstorm') {
    return (
      <h3 className="flex items-center gap-2 font-semibold">
        <div className="w-8 h-8 ">
          {level && <SevereThunderstorm level={level} />}
        </div>
        {alert.info.headline}
      </h3>
    );
  } else if (event === 'rain') {
    return (
      <div className="flex items-center gap-2 font-semibold">
        <div className="w-8 h-8">{level && <HeavyRain level={level} />}</div>
        {alert.info.headline}
      </div>
    );
  } else {
    return <h3 className="font-semibold">{alert.info.headline}</h3>;
  }
}
