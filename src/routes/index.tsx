import { createFileRoute } from '@tanstack/react-router';

import { AISummary } from '@/components/AISummary';
import Header from '@/components/Header';
import IssuedWarningsAndWatches from '@/components/IssuedWarningsAndWatches';
import SevereWeatherOutlook from '@/components/SevereWeatherOutlook';
import ThunderstormOutlook from '@/components/ThunderstormOutlook';
import { store } from '@/store';
import { useStore } from '@tanstack/react-store';

export const Route = createFileRoute('/')({ component: App });

function App() {
  const activeOutlookTab = useStore(store, (state) => state.activeOutlookTab);
  return (
    <div className="flex flex-col h-screen w-full">
      <Header />
      <main className="flex flex-1 m-2 gap-3 min-h-0">
        <div className="flex-1">
          <AISummary />
        </div>
        <div className="w-90">
          <IssuedWarningsAndWatches />
        </div>
        <div className="w-120">
          {activeOutlookTab === 'severeWeatherOutlook' ? (
            <SevereWeatherOutlook />
          ) : (
            <ThunderstormOutlook />
          )}
        </div>
      </main>
    </div>
  );
}
