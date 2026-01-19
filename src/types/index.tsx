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
  };
  updated: string;
};

export type Alert = {
  identifier: string;
  sent: string;
  references?: string;
  info: {
    // 'category', 'event', 'responseType', 'urgency', 'severity', 'certainty', 'onset', 'expires', 'senderName', 'headline', 'description', 'instruction', 'web', 'parameter', 'area'
    area: {
      areaDesc: string;
      polygon: string;
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
  _history: Alert[];
};

// Severe Weather Outlook Types
export type SevereWeatherOutlook = {
  issuedDate: Date | null;
  outlookItems: SevereWeatherOutlookItem[];
};

export type SevereWeatherOutlookItem = {
  date: string;
  outlook: string;
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
export type SevereWeatherOutlookDocument = SevereWeatherOutlook & {
  insertedAt: Date;
};
