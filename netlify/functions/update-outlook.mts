// YOUR_BASE_DIRECTORY/netlify/functions/test-scheduled-function.mts

import type { Config } from '@netlify/functions';

export default async (req: Request) => {
  const { next_run } = await req.json();
  console.log('Received event! Next invocation at:', next_run);
};

export const config: Config = {
  schedule: '*/5 * * * *', // Runs every 5 minutes
};
