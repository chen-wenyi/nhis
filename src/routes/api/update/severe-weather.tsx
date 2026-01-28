import { getSevereWeatherOutlookCollection } from '@/lib/mongodb';
import { formatUTCToNZDate, parseNZIssuedDate } from '@/lib/utils';
import type { SevereWeatherOutlookResp } from '@/types';
import { createFileRoute } from '@tanstack/react-router';
import axios from 'axios';

export const Route = createFileRoute('/api/update/severe-weather')({
  server: {
    handlers: {
      GET: async () => {
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
            'Queried Severe Weather Outlook issued date: ' +
              responseIssuedDateStr,
          );
          logs.push(
            'Latest Severe Weather Outlook issued date from DB: ' +
              latestOutlookIssuedDateStr,
          );

          if (
            latestOutlook?.issuedDate &&
            latestOutlook.issuedDate.getTime() === responseIssuedDate.getTime()
          ) {
            logs.push('Result: Same issued date, no update needed.');
          } else {
            logs.push('Result: Different issued date, inserting new data.');
            await collection.insertOne({
              ...response.data,
              issuedDate: responseIssuedDate,
              insertedAt: new Date(),
            });
            logs.push('Insertion complete.');
          }
          return Response.json({
            ok: true,
          });
        } catch (error) {
          console.error('Error fetching Severe Weather Outlook:', error);
          return Response.error();
        } finally {
          logs.push('*** Finished querying Severe Weather Outlook ***');
          console.log(logs.join('\n'));
        }
      },
    },
  },
});
