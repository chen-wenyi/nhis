import type { Context } from '@netlify/functions';

const url = process.env.URL!;

export default async (req: Request, context: Context) => {
  const todos = await fetch(url + '/api/todos').then((res) => res.json());
  return Response.json(todos);
};
