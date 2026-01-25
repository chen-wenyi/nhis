import { getIssuedWarningsAndWatchesCollection } from '@/lib/mongodb';
import type { Alert, CAP, IssuedWarningOrWatche } from '@/types';
import { createFileRoute } from '@tanstack/react-router';
import { XMLParser } from 'fast-xml-parser';
import lodash from 'lodash';
import { DateTime } from 'luxon';

export const Route = createFileRoute('/api/update/issued-warnings-watches')({
  server: {
    handlers: {
      GET: async () => {
        const response = fetch('https://alerts.metservice.com/cap/atom');
        try {
          const data = await response.then((res) => res.text());
          const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '',
          });
          const { feed } = parser.parse(data) as CAP;
          if (!feed.entry) {
            feed.entry = [];
            console.log('There is no issued warnings and watches entries.');
          }

          // if entry is single object, convert to array
          if (!Array.isArray(feed.entry)) {
            feed.entry = [feed.entry];
          }
          const alerts = await Promise.all(
            feed.entry.map(async (entry) => {
              const alertResponse = await fetch(entry.link.href);
              const alertData = await alertResponse.text();
              const alertObj = parser.parse(alertData);
              const { alert } = alertObj as { alert: Alert };
              if (alert.references) {
                alert._history = await fetchAlertHistory(alert.identifier);
              } else {
                alert._history = [];
              }
              return alert;
            }),
          );

          const issuedWarningsAndWatches: IssuedWarningOrWatche[] = alerts.map(
            (alert) => convertAlertToIssuedWarningAndWatches(alert),
          );

          const collection = await getIssuedWarningsAndWatchesCollection();

          const latestRecord = await collection.findOne(
            {},
            {
              sort: { insertedAt: -1 },
            },
          );

          console.log(
            'Latest issued warnings and watches updated date from DB:',
            latestRecord?.updatedAtISO,
            'Response feed updated date:',
            feed.updated,
          );

          if (latestRecord?.updatedAtISO === feed.updated) {
            console.log(
              'Issued Warnings and Watches are already up to date. Date:',
              feed.updated,
            );

            return new Response(
              'Issued Warnings and Watches are already up to date. Date:' +
                feed.updated,
            );
          } else if (latestRecord) {
            // different updatedAt, need to check if same day
            const newFeedUpdatedAt = DateTime.fromISO(feed.updated, {
              setZone: true,
            });
            const previousFeedUpdatedAt = DateTime.fromISO(
              latestRecord.updatedAtISO,
              { setZone: true },
            );

            const newFeedUpdatedAtFormatted =
              newFeedUpdatedAt.toFormat('yyyyLLdd');
            const previousFeedUpdatedAtFormatted =
              previousFeedUpdatedAt.toFormat('yyyyLLdd');

            console.log(
              'checking newFeedUpdatedAt timezone:',
              newFeedUpdatedAt.zoneName,
            );
            console.log(
              'checking previousFeedUpdatedAt timezone:',
              previousFeedUpdatedAt.zoneName,
            );

            console.log(
              'Comparing new feed update dates:',
              newFeedUpdatedAtFormatted,
              'and previous feed update dates:',
              previousFeedUpdatedAtFormatted,
            );

            if (
              // same day month and year
              newFeedUpdatedAtFormatted === previousFeedUpdatedAtFormatted
            ) {
              console.log(
                'Same day update for Issued Warnings and Watches. Updating entries and insert.',
              );

              await collection.insertOne({
                updatedAt: new Date(feed.updated),
                updatedAtISO: feed.updated,
                entries: updateStatus(
                  issuedWarningsAndWatches,
                  latestRecord.entries,
                ),
                insertedAt: new Date(),
              });

              // indicate it's an update
              return new Response('Update complete.');
            } else {
              console.log(
                'New day update for Issued Warnings and Watches. Inserting new entries.',
              );
              // new day
              await collection.insertOne({
                updatedAt: new Date(feed.updated),
                updatedAtISO: feed.updated,
                entries: issuedWarningsAndWatches.map((i) => ({
                  ...i,
                  _status: 'new',
                })),
                insertedAt: new Date(),
              });
              return new Response('Insertion complete.');
            }
          } else {
            await collection.insertOne({
              updatedAt: new Date(feed.updated),
              updatedAtISO: feed.updated,
              entries: issuedWarningsAndWatches.map((i) => ({
                ...i,
                _status: 'new',
              })),
              insertedAt: new Date(),
            });
            return new Response('Insertion complete.');
          }
        } catch (error) {
          console.error('Error fetching Warnings and Watches:', error);
          return new Response('Error fetching Warnings and Watches' + error);
        }
      },
    },
  },
});

async function fetchAlertById(id: string): Promise<Alert> {
  const alertResponse = await fetch(
    `https://alerts.metservice.com/cap/alert?id=${id}`,
  );
  const alertData = await alertResponse.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
  });
  const { alert } = parser.parse(alertData);

  return alert as Alert;
}

async function fetchAlertHistory(id: string): Promise<Alert[]> {
  const history: Alert[] = [];
  let currentId: string = id;

  while (currentId) {
    const alert = await fetchAlertById(currentId);
    history.push(alert);

    // Get the reference ID from the alert (if exists)
    if (alert.references) {
      // references format: "sender,identifier,sent"
      currentId = alert.references.split(',')[1];
    } else {
      currentId = '';
    }
  }

  return history;
}

function convertAlertToIssuedWarningAndWatches(
  alert: Alert,
): IssuedWarningOrWatche {
  const _history =
    alert._history?.map((histAlert) => {
      return convertAlertToIssuedWarningAndWatches(histAlert);
    }) || [];
  return {
    id: alert.identifier,
    sent: alert.sent,
    event: alert.info.event,
    responseType: alert.info.responseType,
    urgency: alert.info.urgency,
    severity: alert.info.severity,
    certainty: alert.info.certainty,
    onset: alert.info.onset,
    expires: alert.info.expires,
    headline: alert.info.headline,
    description: alert.info.description,
    instruction: alert.info.instruction,
    areaDesc: alert.info.area.areaDesc,
    ColourCode: getColourCode(alert),
    ChanceOfUpgrade: getChanceOfUpgrade(alert),
    _status: '',
    _history,
  };
}

function getColourCode(alert: Alert): string | undefined {
  return alert.info.parameter.find((p) => p.valueName === 'ColourCode')?.value;
}

function getChanceOfUpgrade(alert: Alert): string | undefined {
  return alert.info.parameter.find((p) => p.valueName === 'ChanceOfUpgrade')
    ?.value;
}

function updateStatus(
  newEntries: IssuedWarningOrWatche[],
  oldEntries: IssuedWarningOrWatche[],
): IssuedWarningOrWatche[] {
  const newIds = newEntries.map((e) => e.id);
  const oldIds = oldEntries.map((e) => e.id);

  console.log('New IDs:', newIds);
  console.log('Old IDs:', oldIds);

  const updatedEntries: IssuedWarningOrWatche[] = newEntries.map((entry) => {
    if (!oldIds.includes(entry.id)) {
      if (
        lodash.intersection(
          oldIds,
          entry._history.map((h) => h.id),
        ).length > 0
      ) {
        // oldIds exist in entry history ids
        return { ...entry, _status: 'updated' };
      } else {
        return { ...entry, _status: 'new' };
      }
    }
    return entry;
  });

  oldEntries
    .filter((entry) => !newIds.includes(entry.id))
    .forEach((removedEntry) => {
      updatedEntries.push({ ...removedEntry, _status: 'removed' });
    });

  return updatedEntries;
}
