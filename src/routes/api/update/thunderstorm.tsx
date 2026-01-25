import { getThunderstormOutlookCollection } from '@/lib/mongodb';
import type { ThunderstormOutlookResp } from '@/types';
import { createFileRoute } from '@tanstack/react-router';
import axios from 'axios';

export const Route = createFileRoute('/api/update/thunderstorm')({
  server: {
    handlers: {
      GET: async () => {
        const url =
          'https://nhis-services-production.up.railway.app/thunderstorm-outlook';
        try {
          const response = await axios.get<ThunderstormOutlookResp>(url);
          const responseIssuedDates = response.data.map(
            ({ issuedDate }) => issuedDate,
          );

          const collection = await getThunderstormOutlookCollection();
          const latestOutlook = await collection.findOne(
            {},
            { sort: { insertedAt: -1 } },
          );

          if (!latestOutlook) {
            console.log('No existing Thunderstorm Outlook data found in DB.');
            collection.insertOne({
              insertedAt: new Date(),
              refIssuedDates: responseIssuedDates,
              items: response.data,
            });
            return new Response('Initial Thunderstorm Outlook data inserted.');
          } else {
            const latestRefDates = latestOutlook.refIssuedDates;
            if (responseIssuedDates.toString() !== latestRefDates.toString()) {
              console.log('New Thunderstorm Outlook data found. Updating DB.');
              collection.insertOne({
                insertedAt: new Date(),
                refIssuedDates: responseIssuedDates,
                items: response.data,
              });
              return new Response('Thunderstorm Outlook data updated.');
            } else {
              return new Response(
                'No update needed for Thunderstorm Outlook data.',
              );
            }
          }
        } catch (error) {
          console.error('Error fetching Thunderstorm Outlook:', error);
          return Response.error();
        }
      },
    },
  },
});
