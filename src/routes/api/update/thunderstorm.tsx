import { getThunderstormOutlookCollection } from '@/lib/mongodb';
import { generateThunderstormOutlookAISummary } from '@/serverFuncs/AISummary/thunderstormOutlook';
import type { ThunderstormOutlookResp } from '@/types';
import { createFileRoute } from '@tanstack/react-router';
import axios from 'axios';

export const Route = createFileRoute('/api/update/thunderstorm')({
  server: {
    handlers: {
      GET: async (): Promise<Response> => {
        const logs = ['\n*** Event: Querying Thunderstorm Outlook ***'];
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
            logs.push('No existing Thunderstorm Outlook data found in DB.');
            const result = await collection.insertOne({
              insertedAt: new Date(),
              refIssuedDates: responseIssuedDates,
              items: response.data,
            });
            generateThunderstormOutlookAISummary({
              data: {
                reason: 'Initial thunderstorm outlook ai summary generation',
                outlookRefId: result.insertedId.toString(),
              },
            });
          } else {
            const latestRefDates = latestOutlook.refIssuedDates;
            logs.push(
              `${latestRefDates} - Latest thunderstorm issuedDates from DB`,
            );
            logs.push(
              `${responseIssuedDates} - Queried thunderstorm issuedDates`,
            );
            if (responseIssuedDates.toString() !== latestRefDates.toString()) {
              logs.push(
                'Result: New Thunderstorm Outlook data found. Updating DB.',
              );
              const result = await collection.insertOne({
                insertedAt: new Date(),
                refIssuedDates: responseIssuedDates,
                items: response.data,
              });
              generateThunderstormOutlookAISummary({
                data: {
                  reason: 'New thunderstorm outlook ai summary generation',
                  outlookRefId: result.insertedId.toString(),
                },
              });
            } else {
              logs.push(
                'Result: Thunderstorm Outlook data is up to date. No update needed.',
              );
            }
          }
          logs.push('*** Finished querying Thunderstorm Outlook ***');
          return new Response(logs.join('\n'));
        } catch (error) {
          console.error('Error fetching Thunderstorm Outlook:', error);
          return Response.error();
        } finally {
          console.log(logs.join('\n'));
        }
      },
    },
  },
});
