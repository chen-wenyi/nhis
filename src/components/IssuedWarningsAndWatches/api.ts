import type { Alert, CAP } from '@/types';
import { createServerFn } from '@tanstack/react-start';
import { XMLParser } from 'fast-xml-parser';

export const fetchActiveAlerts = createServerFn().handler(
  async (): Promise<Alert[]> => {
    const response = fetch('https://alerts.metservice.com/cap/atom');
    try {
      const data = await response.then((res) => res.text());
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
      });
      const { feed } = parser.parse(data) as CAP;
      if (!feed.entry) {
        return [];
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

      return alerts;
    } catch (error) {
      console.error('Error fetching Warnings and Watches:', error);
      return [];
    }
  },
);

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

export async function fetchAlertHistory(id: string): Promise<Alert[]> {
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
