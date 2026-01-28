import { getSevereWeatherOutlookCollection } from '@/lib/mongodb';
import { formatUTCToNZDate, parseNZIssuedDate } from '@/lib/utils';
import { generateSevereWeatherOutlookAISummary } from '@/serverFuncs/AISummary/severeWeatherOutlook';
import type { SevereWeatherOutlookResp } from '@/types';
import { createFileRoute } from '@tanstack/react-router';
import axios from 'axios';

export const Route = createFileRoute('/api/update/severe-weather')({
  server: {
    handlers: {
      GET: async (): Promise<Response> => {
        const logs = ['\n*** Event: Querying Severe Weather Outlook ***'];
        const url =
          'https://nhis-services-production.up.railway.app/severe-weather-outlook';
        try {
          const response = await axios.get<SevereWeatherOutlookResp>(url);
          const responseIssuedDateStr = response.data.issuedDate;
          const collection = await getSevereWeatherOutlookCollection();
          const latestOutlook = await collection.findOne(
            { issuedDate: { $type: 'date' } },
            { sort: { issuedDate: -1 } },
          );

          const responseIssuedDate = parseNZIssuedDate(responseIssuedDateStr);
          const latestOutlookIssuedDateStr = latestOutlook?.issuedDate
            ? formatUTCToNZDate(latestOutlook.issuedDate)
            : '';

          logs.push(
            `${responseIssuedDateStr} - Queried Severe Weather Outlook issued date`,
          );
          logs.push(
            `${latestOutlookIssuedDateStr} - Latest Severe Weather Outlook issued date from DB`,
          );

          if (!latestOutlook) {
            logs.push('No existing Severe Weather Outlook data found in DB.');
            const result = await collection.insertOne({
              ...response.data,
              issuedDate: responseIssuedDate,
              insertedAt: new Date(),
            });
            generateSevereWeatherOutlookAISummary({
              data: {
                reason: 'Initial severe weather outlook ai summary generation',
                outlookRefId: result.insertedId.id.toString(),
              },
            });
            logs.push('Insertion complete.');
          } else {
            if (
              latestOutlook.issuedDate &&
              latestOutlook.issuedDate.getTime() ===
                responseIssuedDate.getTime()
            ) {
              logs.push('Result: Same issued date, no update needed.');
            } else {
              logs.push('Result: Different issued date, inserting new data.');
              const result = await collection.insertOne({
                ...response.data,
                issuedDate: responseIssuedDate,
                insertedAt: new Date(),
              });
              generateSevereWeatherOutlookAISummary({
                data: {
                  reason: 'New severe weather outlook ai summary generation',
                  outlookRefId: result.insertedId.id.toString(),
                },
              });
              logs.push('Insertion complete.');
            }
          }
          logs.push('*** Finished querying Severe Weather Outlook ***');
          return new Response(logs.join('\n'));
        } catch (error) {
          console.error('Error fetching Severe Weather Outlook:', error);
          return new Response('Error fetching Severe Weather Outlook' + error);
        } finally {
          console.log(logs.join('\n'));
        }
      },
    },
  },
});
