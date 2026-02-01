import type { SevereWeatherAISummary } from '@/serverFuncs/AISummary/severeWeatherOutlook/schema';
import type { SevereWeatherOutlookAISummary } from '@/serverFuncs/generateSevereWeatherOutlookAISummary/schema';
import type {
  ThunderstormAISummary,
  ThunderstormOutlookAISummary,
} from '@/serverFuncs/generateThunderstormOutlookAISummary/schema';

export type DateString = string; // in ISO format

export type AISummaryId = {
  thunderstormOutlook: string;
  severeWeatherOutlook: string;
  issuedWarningsAndWatches: string;
};

// issued warnings and watches Types
export type CAP = {
  feed: {
    entry?: Array<{
      id: string;
      link: { href: string };
      published: string;
      updated: string;
      title: string;
      summary: string;
    }>;
    updated: string;
  };
};

export type Alert = {
  identifier: string;
  sent: string;
  references?: string;
  info: {
    // 'category', 'event', 'responseType', 'urgency', 'severity', 'certainty', 'onset', 'expires', 'senderName', 'headline', 'description', 'instruction', 'web', 'parameter', 'area'
    area: {
      areaDesc: string;
      polygon: string[];
    };
    category: string;
    event: string;
    responseType: string;
    urgency: string;
    severity: string;
    certainty: string;
    onset: string;
    expires: string;
    senderName: string;
    headline: string;
    description: string;
    instruction: string;
    web: string;
    parameter: Array<{
      valueName: string;
      value: string;
    }>;
  };
  _history?: Alert[];
};

// Issued Warnings and Watches
export type IssuedWarningOrWatche = {
  id: string;
  sent: DateString;
  event: string;
  responseType: string;
  urgency: string;
  severity: string;
  certainty: string;
  onset: DateString;
  expires: DateString;
  headline: string;
  description: string;
  instruction: string;
  areaDesc: string;
  _status: 'removed' | 'updated' | 'new' | '';
  _history: IssuedWarningOrWatche[];
  ColourCode?: string;
  ChanceOfUpgrade?: string;
};

export type IssuedWarningsAndWatches = {
  id: string;
  updatedAt: Date;
  updatedAtISO: DateString;
  entries: IssuedWarningOrWatche[];
  insertedAt: Date;
};

// Severe Weather Outlook Types
export type SevereWeatherOutlook = {
  id: string;
  issuedDate: Date | null;
  outlookItems: SevereWeatherOutlookItem[];
};

export type SevereWeatherOutlookResp = {
  issuedDate: string;
  outlookItems: SevereWeatherOutlookItem[];
};

export type SevereWeatherOutlookItem = {
  date: string;
  outlook: string;
};

export type ThunderstormOutlookResp = ThunderstormOutlookItem[];

export type ThunderstormOutlook = {
  id: string;
  items: ThunderstormOutlookItem[];
  refIssuedDates: string[];
};

export type ThunderstormOutlookItem = {
  header: string;
  outlook: string;
  issuedDate: string;
};

// NOAA Geomagnetic Forecast Types
export type GeomagneticForecastData = {
  issuedDate: string;
  scales: GeomagneticScale[];
};

export type GeomagneticScale = {
  dateStamp: string;
  value: string;
  text: string;
};

type NOAAGeomagneticScale = {
  Scale: string | null;
  Text: string | null;
};

type NOAAScale = {
  DateStamp: string;
  TimeStamp: string;
  G: NOAAGeomagneticScale;
};

export type NOAAData = {
  [key: string]: NOAAScale;
};

// Volcanic Activity Types
interface VolcanoFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    acc: 'Green' | 'Yellow' | 'Orange' | 'Red';
    activity: string;
    hazards: string;
    level: number;
    volcanoID: string;
    volcanoTitle: string;
  };
}

export interface VolcanoFeatureCollection {
  features: VolcanoFeature[];
}

type VolcanicActivity = {
  volcanoTitle: string;
  level: number;
  activity: string;
  acc: 'Green' | 'Yellow' | 'Orange' | 'Red';
};

export type VolcanicActivityData = VolcanicActivity[];

// MongoDB Document Types
export type SevereWeatherOutlookDocument = Omit<SevereWeatherOutlook, 'id'> & {
  insertedAt: Date;
};

export type ThunderstormOutlookDocument = Omit<ThunderstormOutlook, 'id'> & {
  insertedAt: Date;
};

export type IssuedWarningsAndWatchesDocument = Omit<
  IssuedWarningsAndWatches,
  'id'
>;

export type SevereWeatherAISummaryDocument = {
  summary: SevereWeatherOutlookAISummary;
  identifier: {
    severeWeatherOutlookId: string;
    date: DateString;
    outlook: string;
  };
  insertedAt: Date;
};

export type ThunderstormAISummaryDocument = {
  summary: ThunderstormOutlookAISummary[];
  identifier: {
    thunderstormOutlookId: string;
    date: DateString;
    outlook: string;
  };
  insertedAt: Date;
};

export type AISevereWeatherOutlookSummaryDocument = {
  outlookRefId: string;
  genReason: string;
  generatedAt: Date;
  generatedAtISO: string;
  content: {
    summary: SevereWeatherAISummary;
    date: string;
  }[];
};

export type AISevereWeatherOutlookSummaryResp =
  AISevereWeatherOutlookSummaryDocument & { id: string };

export type AIThunderstormOutlookSummaryDocument = {
  outlookRefId: string;
  genReason: string;
  generatedAt: Date;
  generatedAtISO: string;
  content: {
    summary: ThunderstormAISummary['outlooks'];
    date: string;
  }[];
};

export type AIThunderstormOutlookSummaryResp =
  AIThunderstormOutlookSummaryDocument & { id: string };
