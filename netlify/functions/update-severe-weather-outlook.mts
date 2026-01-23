// YOUR_BASE_DIRECTORY/netlify/functions/test-scheduled-function.mts

import type { Config } from '@netlify/functions';

const url = process.env.URL!;

export default async (req: Request) => {
  const { next_run } = await req.json();
  console.log('Next invocation at:', next_run);
  await fetch(url + '/api/update/severe-weather');
};

export const config: Config = {
  schedule: '*/60 20-23,0-5 * * *', // Runs every 1 hour from 9:00 AM to 5:00 PM in nz timezone
};
