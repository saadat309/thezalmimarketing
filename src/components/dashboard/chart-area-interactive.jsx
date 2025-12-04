
import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
export function ChartAreaInteractive({ data, chartConfig, title, description, referenceDate = new Date() }) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("7d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = React.useMemo(() => {
    if (timeRange === "all") {
      return data;
    }

    return data.filter((item) => {
      const date = new Date(item.date)
      let daysToSubtract = 90
      if (timeRange === "30d") {
        daysToSubtract = 30
      } else if (timeRange === "7d") {
        daysToSubtract = 7
      }
      const startDate = new Date(referenceDate)
      startDate.setDate(startDate.getDate() - daysToSubtract)
      return date >= startDate
    })
  }, [data, timeRange, referenceDate]);

  // Determine data keys dynamically from chartConfig
  const dataKeys = Object.keys(chartConfig).filter(key => key !== 'visitors' && key !== 'queries');

  const transformedData = filteredData.map(item => ({
    ...item,
    dateAsTimestamp: new Date(item.date).getTime()
  }));

  const descriptionForTimeRange = React.useMemo(() => {
    switch (timeRange) {
      case "7d":
        return "Total queries for the last 7 days";
      case "30d":
        return "Total queries for the last 30 days";
      case "90d":
        return "Total queries for the last 3 months";
      case "all":
        return "Total queries for all time";
      default:
        return description; // Fallback to default description prop
    }
  }, [timeRange, description]);

  return (
    <Card className="@container/card">
      <CardHeader className="flex flex-col @[540px]/card:flex-row @[540px]/card:items-center @[540px]/card:justify-between space-y-2 @[540px]/card:space-y-0 relative">
        <div className="flex flex-col space-y-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            <span className="@[540px]/card:block hidden">
              {descriptionForTimeRange}
            </span>
            <span className="@[540px]/card:hidden">{descriptionForTimeRange}</span>
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="@[767px]/card:flex hidden">
            <ToggleGroupItem value="7d" className="h-8 px-2.5 hover:bg-muted data-[state=on]:bg-muted">
              Last 7 days
            </ToggleGroupItem>
            <ToggleGroupItem value="30d" className="h-8 px-2.5 hover:bg-muted data-[state=on]:bg-muted">
              Last 30 days
            </ToggleGroupItem>
            <ToggleGroupItem value="90d" className="h-8 px-2.5 hover:bg-muted data-[state=on]:bg-muted">
              Last 3 months
            </ToggleGroupItem>
            <ToggleGroupItem value="all" className="h-8 px-2.5 hover:bg-muted data-[state=on]:bg-muted">
              All Time
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="@[767px]/card:hidden flex w-40" aria-label="Select a value">
              <SelectValue placeholder="Last 7 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
              <SelectItem value="all" className="rounded-lg">
                All Time
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={transformedData}>
            <defs>
              {dataKeys.map((key, index) => (
                <linearGradient key={key} id={`fill${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={`var(--color-${key})`} stopOpacity={1.0} />
                  <stop offset="95%" stopColor={`var(--color-${key})`} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="dateAsTimestamp"
              type="number"
              scale="time"
              domain={['dataMin', 'dataMax']} // Reverted to auto-calculation
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={5}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }} />
            <YAxis
              tickLine={false}
              axisLine={false}
              dataKey={dataKeys[0]} // Use the first data key for Y-axis
              domain={[0, 'auto']} // Start from 0, auto max
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot" />
              } />
            {dataKeys.map((key, index) => (
              <Area
                key={key}
                dataKey={key}
                type="natural"
                fill={`url(#fill${key})`}
                stroke={`var(--color-${key})`}
                stackId="a"
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
