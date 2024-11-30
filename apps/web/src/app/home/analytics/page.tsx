"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/views/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/views/ui/chart";
import { getApiKeyUsageStats } from "@/actions";
import { IconLoader } from "@tabler/icons-react";

const chartConfig = {
  views: {
    label: "API Usage",
    color: "hsl(var(--primary))",
  }
} satisfies ChartConfig;

export default function Analytics() {
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUsageStats = async () => {
      setIsLoading(true);
      try {
        const response = await getApiKeyUsageStats();

        if (response.ok) {
          setChartData(response.data.chartData);
          setTotal(response.data.totalUsage);
        } else {
          console.error("Failed to fetch usage stats");
        }
      } catch (error) {
        console.error("Error fetching usage stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsageStats();
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <IconLoader className="h-12 w-12 text-black dark:text-white animate-spin" />
      </div>
    )
  }

  return (
    <section className="flex items-center justify-center p-3 md:p-12 w-full">
      <Card className="w-full">
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <CardTitle>API Usage Analytics</CardTitle>
            <CardDescription>
              Showing API usage for the last 3 months
            </CardDescription>
          </div>
          <div className="flex">
            <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 px-6 py-4 text-left">
              <span className="text-xs text-muted-foreground">
                Total Usage
              </span>
              <span className="text-lg font-bold leading-none sm:text-3xl">
                {total.toLocaleString()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="views"
                    labelFormatter={(value: any) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                  />
                }
              />
              <Bar dataKey="usage" fill={`var(--color-views)`} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </section>
  );
}