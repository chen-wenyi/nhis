export async function GET(request: Request) {
  const todos = await fetch('/api/todos').then((res) => res.json());
  return Response.json(todos);
}
