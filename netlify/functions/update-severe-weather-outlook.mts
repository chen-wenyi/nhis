// YOUR_BASE_DIRECTORY/netlify/functions/test-scheduled-function.mts

import type { Config } from '@netlify/functions';

const url = process.env.URL!;

export default async (req: Request) => {
  const { next_run } = await req.json();
  console.log('Next invocation at:', next_run);
  const resp = await fetch(url + '/api/update/severe-weather');
  console.log('Response status:', await resp.text());
};

export const config: Config = {
  schedule: '0 21-23,0-5 * * *', // Runs every 1 hour from 10:00 PM to 6:00 AM in nz timezone
};
