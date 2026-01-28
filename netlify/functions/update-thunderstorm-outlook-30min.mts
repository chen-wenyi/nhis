// YOUR_BASE_DIRECTORY/netlify/functions/test-scheduled-function.mts

import type { Config } from '@netlify/functions';

const url = process.env.URL!;

export default async (req: Request) => {
  const { next_run } = await req.json();
  console.log('Next invocation at:', next_run);
  const resp = await fetch(url + '/api/update/thunderstorm');
  console.log(await resp.text());
};

export const config: Config = {
  schedule: '*/30 * * * *', // Runs every 30 minutes
};
