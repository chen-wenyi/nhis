import { getEnv } from '@vercel/functions';

export async function GET(request: Request) {
  const todos = await fetch(getEnv().VERCEL_URL + '/api/todos').then((res) =>
    res.json(),
  );
  return Response.json(todos);
}
