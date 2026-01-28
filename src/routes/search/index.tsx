import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { getSevereWeatherOutlookAISummary } from '@/serverFuncs/AISummary/severeWeatherOutlook';
import { getThunderstormOutlookAISummary } from '@/serverFuncs/AISummary/thunderstormOutlook';
import { getSevereWeatherOutlookById } from '@/serverFuncs/fetchSevereWeatherOutlook';
import { getThunderstormOutlookById } from '@/serverFuncs/fetchThunderstormOutlook';
import { getIssuedWarningsAndWatchesById } from '@/serverFuncs/issuedWarningsAndWatches';
import type {
  AISevereWeatherOutlookSummaryResp,
  AIThunderstormOutlookSummaryResp,
  IssuedWarningsAndWatches,
  SevereWeatherOutlook,
  ThunderstormOutlook,
} from '@/types';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import ReactJson from 'react-json-view';

export const Route = createFileRoute('/search/')({
  component: RouteComponent,
  ssr: false,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <SearchSevereWeatherOutlook />
      <SearchThunderstormOutlook />
      <SearchIssuedWarningsAndWatches />
      <SearchSevereWeatherOutlookAISummary />
      <SearchThunderstormAISummary />
    </div>
  );
}

function SearchSevereWeatherOutlook() {
  const [value, setValue] = useState('');
  const [outlooks, setOutlooks] = useState<
    (SevereWeatherOutlook & { insertedAt: Date })[]
  >([]);

  const onSearch = async () => {
    const _outlooks = await getSevereWeatherOutlookById({
      data: { id: value.trim() },
    });
    setOutlooks(_outlooks);
  };

  return (
    <Field className="w-100">
      <FieldLabel htmlFor="severe-weather-outlook">
        Severe Weather Outlook
      </FieldLabel>
      <Field orientation="horizontal">
        <Input
          id="severe-weather-outlook"
          type="text"
          placeholder=""
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button onClick={onSearch}>Search</Button>
      </Field>
      <FieldDescription>
        {/* Your API key is encrypted and stored securely. */}
      </FieldDescription>
      {outlooks.map((outlook) => (
        <ReactJson
          key={outlook.id}
          src={outlook}
          collapsed={2}
          enableClipboard={false}
        />
      ))}
    </Field>
  );
}

function SearchThunderstormOutlook() {
  const [value, setValue] = useState('');
  const [outlooks, setOutlooks] = useState<
    (ThunderstormOutlook & { insertedAt: Date })[]
  >([]);

  const onSearch = async () => {
    const _outlooks = await getThunderstormOutlookById({
      data: { id: value.trim() },
    });
    setOutlooks(_outlooks);
  };

  return (
    <Field className="w-100">
      <FieldLabel htmlFor="thunderstorm-outlook">
        Thunderstorm Outlook
      </FieldLabel>
      <Field orientation="horizontal">
        <Input
          id="thunderstorm-outlook"
          type="text"
          placeholder=""
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button onClick={onSearch}>Search</Button>
      </Field>
      <FieldDescription>
        {/* Your API key is encrypted and stored securely. */}
      </FieldDescription>
      {outlooks.map((outlook) => (
        <ReactJson
          key={outlook.id}
          src={outlook}
          collapsed={2}
          enableClipboard={false}
        />
      ))}
    </Field>
  );
}

function SearchIssuedWarningsAndWatches() {
  const [value, setValue] = useState('');
  const [outlooks, setOutlooks] = useState<IssuedWarningsAndWatches[]>([]);

  const onSearch = async () => {
    const _outlooks = await getIssuedWarningsAndWatchesById({
      data: { id: value.trim() },
    });
    setOutlooks(_outlooks);
  };

  return (
    <Field className="w-100">
      <FieldLabel htmlFor="issued-warnings-and-watches">
        Issued Warnings And Watches
      </FieldLabel>
      <Field orientation="horizontal">
        <Input
          id="issued-warnings-and-watches"
          type="text"
          placeholder=""
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button onClick={onSearch}>Search</Button>
      </Field>
      <FieldDescription>
        {/* Your API key is encrypted and stored securely. */}
      </FieldDescription>
      {outlooks.map((outlook) => (
        <ReactJson
          key={outlook.id}
          src={outlook}
          collapsed={2}
          enableClipboard={false}
        />
      ))}
    </Field>
  );
}

function SearchSevereWeatherOutlookAISummary() {
  const [value, setValue] = useState('');
  const [summary, setSummary] =
    useState<AISevereWeatherOutlookSummaryResp | null>(null);

  const onSearch = async () => {
    const _summary = await getSevereWeatherOutlookAISummary({
      data: { outlookRefId: value.trim() },
    });
    setSummary(_summary);
  };

  return (
    <Field className="w-100">
      <FieldLabel htmlFor="severe-weather-outlook-ai-summary">
        Severe Weather Outlook AI Summary
      </FieldLabel>
      <Field orientation="horizontal">
        <Input
          id="severe-weather-outlook-ai-summary"
          type="text"
          placeholder=""
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button onClick={onSearch}>Search</Button>
      </Field>
      <FieldDescription>
        Please enter the Severe Weather Outlook ID summary.
      </FieldDescription>
      {summary && (
        <ReactJson src={summary} collapsed={2} enableClipboard={false} />
      )}
    </Field>
  );
}

function SearchThunderstormAISummary() {
  const [value, setValue] = useState('');
  const [summary, setSummary] =
    useState<AIThunderstormOutlookSummaryResp | null>(null);

  const onSearch = async () => {
    const _summary = await getThunderstormOutlookAISummary({
      data: { outlookRefId: value.trim() },
    });
    setSummary(_summary);
  };

  return (
    <Field className="w-100">
      <FieldLabel htmlFor="thunderstorm-outlook-ai-summary">
        Thunderstorm Outlook AI Summary
      </FieldLabel>
      <Field orientation="horizontal">
        <Input
          id="thunderstorm-outlook-ai-summary"
          type="text"
          placeholder=""
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Button onClick={onSearch}>Search</Button>
      </Field>
      <FieldDescription>
        Please enter the Thunderstorm Outlook ID summary.
      </FieldDescription>
      {summary && (
        <ReactJson src={summary} collapsed={2} enableClipboard={false} />
      )}
    </Field>
  );
}
