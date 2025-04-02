"use client";
import * as React from "react";

import {
  generateKpiData, // Reuse for overall metrics
  platforms, // Import platform names
} from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, MousePointerClick, Percent, Search } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";
import { formatCurrency, formatPercent } from "@/lib/helpers"; // Import helpers
import {
  DateRangeFilter,
  DateRangeKey,
  dateRangeOptions,
} from "@/components/ui/date-range-filter"; // Import filter
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Import Tooltip

// --- Types for this page ---
type PlatformPerformanceEntry = {
  date: string;
  [key: string]: number | string; // Allows platform names as keys
};

type KeywordPerformance = {
  keyword: string;
  clicks: number;
  impressions: number;
  cost: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpa: number;
};

// --- Fake Data Generation for this page ---
const generatePlatformPerformance = (): PlatformPerformanceEntry[] => {
  const data: PlatformPerformanceEntry[] = [];
  const endDate = new Date();
  for (let i = 6; i >= 0; i--) {
    // Last 7 days for simplicity
    const date = new Date();
    date.setDate(endDate.getDate() - i);
    const entry: PlatformPerformanceEntry = {
      date: date.toISOString().split("T")[0].substring(5), // MM-DD format
    };
    platforms.forEach((p: string) => {
      entry[p] = Math.random() * 500 + 50; // Fake spend per platform
    });
    data.push(entry);
  }
  return data;
};

const generateTopKeywords = (count = 10): KeywordPerformance[] => {
  const keywords: Omit<KeywordPerformance, "ctr" | "cpc" | "cpa">[] = [];
  const baseTerms = [
    "home solar panels",
    "business energy audit",
    "renewable energy sources",
    "ev charging station install",
    "smart thermostat discount",
    "industrial energy efficiency",
    "district heating system",
    "compare energy prices",
    "fixed rate electricity",
    "green hydrogen production",
  ];
  for (let i = 0; i < count; i++) {
    keywords.push({
      keyword: `${baseTerms[i % baseTerms.length]}${
        i >= baseTerms.length ? " long tail" : ""
      }`,
      clicks: Math.floor(Math.random() * 15000) + 500,
      impressions: Math.floor(Math.random() * 1_000_000) + 50000,
      cost: Math.random() * 20000 + 1000,
      conversions: Math.floor(Math.random() * 500) + 10,
    });
  }
  // Calculate derived metrics and cast to full type
  const fullKeywords: KeywordPerformance[] = keywords.map((k) => {
    const clicks = k.clicks > 0 ? k.clicks : 1; // Avoid division by zero
    const conversions = k.conversions > 0 ? k.conversions : 1;
    return {
      ...k,
      ctr: k.clicks / k.impressions, // Use original clicks for CTR
      cpc: k.cost / clicks,
      cpa: k.cost / conversions,
    };
  });
  return fullKeywords.sort((a, b) => b.conversions - a.conversions); // Sort by conversions
};

// --- Chart Component ---
const PlatformSpendChart = ({ data }: { data: PlatformPerformanceEntry[] }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const gridColor = isDarkMode
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)";
  const textColor = isDarkMode ? "#cbd5e1" : "#64748b";
  // Basic color palette (customize further if needed)
  const colors = ["#8b5cf6", "#ef4444", "#3b82f6", "#10b981", "#f59e0b"];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis
          dataKey="date"
          stroke={textColor}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke={textColor}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <RechartsTooltip
          contentStyle={{
            backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
            borderColor: isDarkMode ? "#374151" : "#e5e7eb",
            borderRadius: "0.375rem",
          }}
          labelStyle={{ color: isDarkMode ? "#f9fafb" : "#111827" }}
          itemStyle={{ color: textColor }}
          formatter={(value: number) => formatCurrency(value)}
        />
        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
        {platforms.map((platform: string, index: number) => (
          <Bar
            key={platform}
            dataKey={platform}
            fill={colors[index % colors.length]}
            stackId="a"
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

// --- Page Component ---
export default function AnalyticsPage() {
  // Add state for date range
  const [dateRange, setDateRange] = React.useState<DateRangeKey>("30d");

  // Generate data (not dynamically linked to dateRange in prototype)
  const kpiData = generateKpiData();
  const platformData = generatePlatformPerformance();
  const keywordData = generateTopKeywords();

  // Calculate overall CPC and CTR from KPIs (assuming we can derive this)
  // This is very rough, real calculation needs total clicks/impressions
  const averageCpc = kpiData.totalSpend / (kpiData.totalSpend * 10); // Fake calculation
  const averageCtr = kpiData.conversionRate * 0.5; // Fake calculation

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Energy Solutions Performance
        </h1>
        <DateRangeFilter
          selectedRange={dateRange}
          onRangeChange={setDateRange}
        />
      </div>

      {/* KPI Cards with Tooltips - Trigger on Icon */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average CPC</CardTitle>
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <MousePointerClick className="h-4 w-4 text-orange-600 dark:text-orange-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Average Cost Per Click across all campaigns in the selected
                    period.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(averageCpc)}
            </div>
            <p className="text-xs text-muted-foreground">Cost Per Click</p>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Percent className="h-4 w-4 text-teal-600 dark:text-teal-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Average Click-Through Rate (Clicks / Impressions) in the
                    selected period.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercent(averageCtr)}
            </div>
            <p className="text-xs text-muted-foreground">Click-Through Rate</p>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Conversions
            </CardTitle>
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Total number of valuable actions (leads, sign-ups) recorded.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(kpiData.totalSpend / (averageCpc * 5))}
            </div>
            <p className="text-xs text-muted-foreground">Rough estimate</p>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Top Keyword Source
            </CardTitle>
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Search className="h-4 w-4 text-indigo-600 dark:text-indigo-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    The keyword driving the most conversions in the selected
                    period.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {keywordData[0]?.keyword ?? "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on conversions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables Grid with Descriptions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Platform Spend Chart */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Spend by Platform</CardTitle>
            <CardDescription>
              Daily ad spend distribution across connected platforms (
              {dateRangeOptions[dateRange]}).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PlatformSpendChart data={platformData} />
          </CardContent>
        </Card>

        {/* Top Keywords Table */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Top Performing Keywords</CardTitle>
            <CardDescription>
              Keywords driving the most conversions, sorted by performance (
              {dateRangeOptions[dateRange]}).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead className="text-right">CPC</TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                  <TableHead className="text-right">Conv.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keywordData.map((kw: KeywordPerformance) => (
                  <TableRow key={kw.keyword}>
                    <TableCell className="font-medium max-w-[150px] truncate">
                      {kw.keyword}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(kw.cpc)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPercent(kw.ctr)}
                    </TableCell>
                    <TableCell className="text-right">
                      {kw.conversions}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
