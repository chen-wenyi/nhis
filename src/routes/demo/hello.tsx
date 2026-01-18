import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/demo/hello')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return new Response(JSON.stringify({ message: `Hello, ABC!` }))
      },
    },
  },
  component: RouteComponent,
})

function RouteComponent() {
  const [reply, setReply] = useState('')

  return (
    <div>
      <button
        onClick={() => {
          fetch('/demo/hello', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: 'Tanner' }),
          })
            .then((res) => res.json())
            .then((data) => setReply(data.message))
        }}
      >
        Say Hello
      </button>
      {reply && <p>{reply}</p>}
    </div>
  )
}
