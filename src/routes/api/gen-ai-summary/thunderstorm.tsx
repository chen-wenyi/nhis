import { generateThunderstormOutlookAISummary } from '@/serverFuncs/AISummary/thunderstormOutlook';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/gen-ai-summary/thunderstorm')({
  server: {
    handlers: {
      GET: async () => {
        const resp = await generateThunderstormOutlookAISummary({
          data: {
            reason: 'Thunderstrom outlook updated. 222',
            outlookRefId: '697a0c8c4de02c6ef8fe81d7',
          },
        });
        return Response.json(resp);
      },
    },
  },
});
