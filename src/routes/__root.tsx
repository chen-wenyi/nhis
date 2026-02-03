import { TanStackDevtools } from '@tanstack/react-devtools';
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import type { QueryClient } from '@tanstack/react-query';
import * as Ably from 'ably';
import { AblyProvider, ChannelProvider } from 'ably/react';
import ConvexProvider from '../integrations/convex/provider';
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools';
import appCss from '../styles.css?url';

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Natural Hazard Intelligence Summary',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
});

const realtimeClient = new Ably.Realtime({
  authUrl: '/ably/create-token',
  clientId: 'nhis-client',
  recover: (lastConnectionDetails, cb) => {
    console.log(`lastConnectionDetails:`, lastConnectionDetails);
    cb(true); /* recover connection */
  },
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <head>
        <HeadContent />
      </head>
      <body>
        <ConvexProvider>
          <AblyProvider client={realtimeClient}>
            <ChannelProvider channelName="nhis-channel">
              {children}
            </ChannelProvider>
          </AblyProvider>
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
        </ConvexProvider>
        <Scripts />
      </body>
    </html>
  );
}
