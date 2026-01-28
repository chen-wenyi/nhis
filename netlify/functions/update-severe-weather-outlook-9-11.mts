// YOUR_BASE_DIRECTORY/netlify/functions/test-scheduled-function.mts

import type { Config } from '@netlify/functions';

const url = process.env.URL!;

export default async (req: Request) => {
  const { next_run } = await req.json();
  console.log('Next invocation at:', next_run);
  const resp = await fetch(url + '/api/update/severe-weather');
  console.log(await resp.text());
};

export const config: Config = {
  schedule: '*/10 20-21 * * *', // Runs every 10 min from 9 - 11 in nz timezone
};
