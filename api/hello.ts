import { api } from 'convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL;

export async function GET(request: Request) {
  const client = new ConvexHttpClient(CONVEX_URL);
  const todos = await client.query(api.todos.list);
  return Response.json(todos);
}
