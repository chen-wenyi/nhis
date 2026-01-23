import { getSevereWeatherOutlookCollection } from '@/lib/mongodb';
import { formatUTCToNZDate, parseNZIssuedDate } from '@/lib/utils';
import type { SevereWeatherOutlookResp } from '@/types';
import { createFileRoute } from '@tanstack/react-router';
import axios from 'axios';

export const Route = createFileRoute('/api/update/severe-weather')({
  server: {
    handlers: {
      GET: async () => {
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
          console.log(
            'Latest outlook issued date from DB:',
            latestOutlookIssuedDateStr,
            'Response outlook issued date:',
            responseIssuedDateStr,
          );

          if (
            latestOutlook?.issuedDate &&
            latestOutlook.issuedDate.getTime() === responseIssuedDate.getTime()
          ) {
            console.log(
              'Severe Weather Outlook is already up to date. Date:',
              responseIssuedDateStr,
            );
          } else {
            console.log(
              'Inserting new Severe Weather Outlook data. Date:',
              responseIssuedDateStr,
            );
            await collection.insertOne({
              ...response.data,
              issuedDate: responseIssuedDate,
              insertedAt: new Date(),
            });
            console.log('Insertion complete.');
          }
          return Response.json({
            ok: true,
            latestOutlook,
          });
        } catch (error) {
          console.error('Error fetching Severe Weather Outlook:', error);
          return Response.error();
        }
      },
    },
  },
});
