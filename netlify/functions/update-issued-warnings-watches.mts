// YOUR_BASE_DIRECTORY/netlify/functions/test-scheduled-function.mts

import type { Config } from '@netlify/functions';

const url = process.env.URL!;

export default async (req: Request) => {
  const { next_run } = await req.json();
  console.log('Next invocation at:', next_run);
  return await fetch(url + '/api/update/issued-warnings-watches');
};

export const config: Config = {
  schedule: '*/5 * * * *',
};
