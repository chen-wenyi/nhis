import { generateSevereWeatherOutlookAISummary } from '@/serverFuncs/AISummary/severeWeatherOutlook';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/gen-ai-summary/severe-weather')({
  server: {
    handlers: {
      GET: async () => {
        const resp = await generateSevereWeatherOutlookAISummary({
          data: { reason: 'severe weather outlook updated. 111 ' },
        });
        return Response.json(resp);
      },
    },
  },
});
