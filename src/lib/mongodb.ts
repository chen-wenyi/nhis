import type {
  IssuedWarningsAndWatchesDocument,
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

export async function getIssuedWarningsAndWatchesCollection() {
  return getCollection<IssuedWarningsAndWatchesDocument>(
    'issued_warnings_and_watches',
  );
}
