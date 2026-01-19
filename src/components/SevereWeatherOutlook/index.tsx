import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '../ui/spinner';
import { fetchSevereWeatherOutlook } from './api';
import { ReactMarkdownWithHighlight } from './ReactMarkdownWithHighlight';

export default function SevereWeatherOutlook() {
  const {
    data: severeWeatherOutlook,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['severeWeatherOutlook'],
    queryFn: async () => {
      const data = await fetchSevereWeatherOutlook();
      console.log('Severe Weather Outlook data:', data);
      return data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Severe Weather Outlook</CardTitle>
        <CardDescription>
          <span>
            Source:{' '}
            <a
              href="https://www.metservice.com/warnings/severe-weather-outlook"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              MetService
            </a>
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Spinner />
            <span>Loading severe weather outlook...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {severeWeatherOutlook?.outlookItems.map((item) => (
              <SevereWeatherOutlookItem
                key={item.date}
                date={item.date}
                outlook={item.outlook}
              />
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-gray-500 text-xs">
          This section uses terminology for confidence, risk and chance provided
          by MetService
          <a
            href="https://about.metservice.com/about-severe-weather-warnings"
            target="_blank"
            rel="noopener noreferrer"
            className=" mx-2"
          >
            (
            <span className="underline">
              Severe Weather Warnings and Watches
            </span>
            )
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}

function SevereWeatherOutlookItem({
  date,
  outlook,
}: {
  date: string;
  outlook: string;
}) {
  return (
    <>
      <h3 className="text-xl font-semibold mb-2">{date}</h3>
      <ReactMarkdownWithHighlight
        markdown={outlook}
        quotes={[]}
        keywords={[]}
      />
    </>
  );
}
