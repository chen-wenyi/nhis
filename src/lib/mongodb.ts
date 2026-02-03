import type {
  AISevereWeatherOutlookSummaryDocument,
  AIThunderstormOutlookSummaryDocument,
  IssuedAlertEntriesDocument,
  SevereWeatherOutlookDocument,
  ThunderstormOutlookDocument,
} from '@/types';
import { attachDatabasePool } from '@vercel/functions';
import type { Document } from 'mongodb';
import { MongoClient } from 'mongodb';

const options = {};
let client: MongoClient | null = null;

export async function getDatabase() {
  if (!client) {
    const uri = process.env.MONGODB_URI;
    client = new MongoClient(uri!, options);
    await client.connect();
    attachDatabasePool(client);
  }
  return client.db('natural_hazard_intelligence_summary');
}

export async function getCollection<T extends Document>(
  collectionName: string,
) {
  const db = await getDatabase();
  return db.collection<T>(collectionName);
}

export async function getSevereWeatherOutlookCollection() {
  return getCollection<SevereWeatherOutlookDocument>('severe_weather_outlook');
}

export async function getThunderstormOutlookCollection() {
  return getCollection<ThunderstormOutlookDocument>('thunderstorm_outlook');
}

export async function getIssuedAlertCollection() {
  return getCollection<IssuedAlertEntriesDocument>('issued_alert_entries');
}

export async function getAISevereWeatherOutlookSummaryCollection() {
  return getCollection<AISevereWeatherOutlookSummaryDocument>(
    'ai_severe_weather_outlook_summary',
  );
}

export async function getAIThunderstormOutlookSummaryCollection() {
  return getCollection<AIThunderstormOutlookSummaryDocument>(
    'ai_thunderstorm_outlook_summary',
  );
}
