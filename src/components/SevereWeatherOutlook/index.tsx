import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function SevereWeatherOutlook() {
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
      <CardContent></CardContent>
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
  )
}
