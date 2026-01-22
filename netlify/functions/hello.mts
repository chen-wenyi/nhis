import type { Context } from '@netlify/functions';

const url = process.env.URL!;

export default async (req: Request, context: Context) => {
  return new Response('url: ' + url);
};
