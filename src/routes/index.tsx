import { createFileRoute } from '@tanstack/react-router';

import { AISummary } from '@/components/AISummary';
import Header from '@/components/Header';
import IssuedWarningsAndWatches from '@/components/IssuedWarningsAndWatches';
import SevereWeatherOutlook from '@/components/SevereWeatherOutlook';

export const Route = createFileRoute('/')({ component: App });

function App() {
  return (
    <div className="flex flex-col h-screen w-full">
      <Header />
      <main className="flex flex-1 m-2 gap-3 min-h-0">
        <div className="flex-1">
          <AISummary />
        </div>
        <div className="w-85">
          <IssuedWarningsAndWatches />
        </div>
        <div className="w-120">
          <SevereWeatherOutlook />
        </div>
      </main>
    </div>
  );
}
