import { createFileRoute } from '@tanstack/react-router';

import { AISummary } from '@/components/AISummary';
import Header from '@/components/Header';
import IssuedWarningsAndWatches from '@/components/IssuedWarningsAndWatches';
import SevereWeatherOutlook from '@/components/SevereWeatherOutlook';
import ThunderstormOutlook from '@/components/ThunderstormOutlook';
import { Toaster } from '@/components/ui/sonner';
import { toastInfo, toastSuccess, toastUpdateToDate } from '@/lib/toast';
import { store } from '@/store';
import { useStore } from '@tanstack/react-store';

export const Route = createFileRoute('/')({ component: App });

function App() {
  const activeOutlookTab = useStore(store, (state) => state.activeOutlookTab);
  return (
    <div className="flex flex-col h-dvh w-full overscroll-none">
      <Header />
      <main className="flex flex-1 m-2 gap-3 min-h-0">
        <Toaster position="top-center" duration={10000} />
        <div className="flex-1">
          <AISummary />
        </div>
        <div className="w-90">
          <IssuedWarningsAndWatches />
        </div>
        <div className="w-[30%]">
          {activeOutlookTab === 'severeWeatherOutlook' ? (
            <SevereWeatherOutlook />
          ) : (
            <ThunderstormOutlook />
          )}
        </div>
      </main>
      <button
        onClick={() => {
          toastSuccess('Test Success', 'This is a success message!');
          toastInfo('Test Success', 'This is a success message!');
          toastUpdateToDate('Test Update', 'This is an update message!');
        }}
      >
        123
      </button>
    </div>
  );
}
