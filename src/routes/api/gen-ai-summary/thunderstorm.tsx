import { generateThunderstormOutlookAISummary } from '@/serverFuncs/AISummary/thunderstormOutlook';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/gen-ai-summary/thunderstorm')({
  server: {
    handlers: {
      GET: async () => {
        const resp = await generateThunderstormOutlookAISummary({
          data: { reason: 'Thunderstrom outlook updated. 222' },
        });
        return Response.json(resp);
      },
    },
  },
});
