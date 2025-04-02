"use client"; // Need this for state
import * as React from "react"; // Import React for state
import {
  generateKpiData,
  generatePerformanceData,
  generateCampaigns,
  Campaign,
  generateAiDecisions,
  AiDecision,
  generateEstimatedSavings,
  generateEuropeData, // Import new data generator
  CountryData, // Import new data type
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DollarSign,
  Target,
  TrendingUp,
  ExternalLink,
  Bot,
  PiggyBank,
  Globe, // Add Globe icon for map
} from "lucide-react";
import PerformanceChart from "@/components/charts/PerformanceChart";
import EuropeMapChart from "@/components/charts/EuropeMapChart"; // Import the map chart
import {
  formatCurrency,
  formatPercent,
  getStatusVariant,
  getTypeStyling,
} from "@/lib/helpers";
import { formatDistanceToNow } from "date-fns";
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

// Helper to get days from DateRangeKey - aligned with DateRangeKey type
const getDaysFromRange = (range: DateRangeKey): number => {
  switch (range) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
    // Removed '12m' as it might not be in DateRangeKey type
    // Add cases for 'mtd', 'ytd' if needed, returning appropriate day counts or handling them differently
    default:
      return 30; // Default to 30 days
  }
};

export default function DashboardPage() {
  // State for date range
  const [dateRange, setDateRange] = React.useState<DateRangeKey>("30d");

  // State for data that depends on the date range
  const [kpiData, setKpiData] = React.useState(() => generateKpiData());
  const [performanceData, setPerformanceData] = React.useState(() =>
    generatePerformanceData(getDaysFromRange(dateRange))
  );
  const [savingsData, setSavingsData] = React.useState(() =>
    generateEstimatedSavings(kpiData.totalSpend, getDaysFromRange(dateRange))
  );
  const [europeData, setEuropeData] = React.useState<CountryData[]>(() =>
    generateEuropeData(kpiData.totalSpend * 0.8)
  );

  // Static data (doesn't change with date range in this example)
  const campaigns = React.useMemo(() => generateCampaigns(5), []);
  const recentDecisions = React.useMemo(() => generateAiDecisions(4), []);

  // Effect to regenerate data when dateRange changes
  React.useEffect(() => {
    const days = getDaysFromRange(dateRange);

    // Regenerate data that depends on the date range
    const newKpiData = generateKpiData(); // Regenerate KPIs (could adjust based on days if needed)
    const newPerformanceData = generatePerformanceData(days);
    const newSavingsData = generateEstimatedSavings(
      newKpiData.totalSpend,
      days
    );
    const newEuropeData = generateEuropeData(newKpiData.totalSpend * 0.8);

    // Update state
    setKpiData(newKpiData);
    setPerformanceData(newPerformanceData);
    setSavingsData(newSavingsData);
    setEuropeData(newEuropeData);
  }, [dateRange]); // Dependency array: runs when dateRange changes

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Marketing Dashboard Overview
        </h1>
        <DateRangeFilter
          selectedRange={dateRange}
          onRangeChange={setDateRange}
        />
      </div>

      {/* KPI Cards Grid with Tooltips */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <TooltipProvider delayDuration={150}>
          <Card className="border-border/40">
            <Tooltip>
              <TooltipTrigger asChild>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-help">
                  <CardTitle className="text-sm font-medium">
                    Total Ad Spend
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                </CardHeader>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Total amount spent across all connected ad platforms in the
                  selected period.
                </p>
              </TooltipContent>
            </Tooltip>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(kpiData.totalSpend)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all platforms
              </p>
            </CardContent>
          </Card>
        </TooltipProvider>
        <TooltipProvider delayDuration={150}>
          <Card className="border-border/40">
            <Tooltip>
              <TooltipTrigger asChild>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-help">
                  <CardTitle className="text-sm font-medium">
                    Return on Investment (ROI)
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </CardHeader>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Measures the profit generated relative to ad spend (Revenue /
                  Spend).
                </p>
              </TooltipContent>
            </Tooltip>
            <CardContent>
              <div className="text-2xl font-bold">
                {kpiData.roi.toFixed(2)}x
              </div>
              {/* Add comparison logic if needed, e.g., +5.2% from last month */}
              <p className="text-xs text-muted-foreground">
                Compared to target
              </p>
            </CardContent>
          </Card>
        </TooltipProvider>
        <TooltipProvider delayDuration={150}>
          <Card className="border-border/40">
            <Tooltip>
              <TooltipTrigger asChild>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-help">
                  <CardTitle className="text-sm font-medium">
                    Conversion Rate
                  </CardTitle>
                  <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </CardHeader>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Percentage of clicks that resulted in a desired action (e.g.,
                  sign-up, lead).
                </p>
              </TooltipContent>
            </Tooltip>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPercent(kpiData.conversionRate, 1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Average across campaigns
              </p>
            </CardContent>
          </Card>
        </TooltipProvider>
        <TooltipProvider delayDuration={150}>
          <Card className="border-border/40">
            <Tooltip>
              <TooltipTrigger asChild>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 cursor-help">
                  <CardTitle className="text-sm font-medium">
                    Est. AI Savings
                  </CardTitle>
                  <PiggyBank className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </CardHeader>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Estimated cost savings achieved through AI-driven
                  optimizations.
                </p>
              </TooltipContent>
            </Tooltip>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(savingsData.amount)}
              </div>
              <p className="text-xs text-muted-foreground">
                ~{savingsData.percentage}% improvement (Last{" "}
                {savingsData.periodDays} days)
              </p>
            </CardContent>
          </Card>
        </TooltipProvider>
      </div>

      {/* Main Content Grid (Chart, Recent Decisions) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Performance Chart Card - Add description */}
        <Card className="lg:col-span-2 border-border/40">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>
              Key metrics trend over the selected period (
              {dateRangeOptions[dateRange]}).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceChart data={performanceData} />
          </CardContent>
        </Card>

        {/* Recent AI Decisions Card - Add tooltip to button */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-500" />
              Recent AI Decisions
            </CardTitle>
            <CardDescription>Latest automated actions taken.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentDecisions.length > 0 ? (
              recentDecisions.map((decision: AiDecision) => {
                const { icon: TypeIcon } = getTypeStyling(decision.type);
                return (
                  <div
                    key={decision.id}
                    className="flex items-start space-x-3 hover:bg-muted/50 p-2 rounded-md -mx-2 transition-colors"
                  >
                    <TypeIcon className="h-4 w-4 flex-shrink-0 mt-1 text-muted-foreground" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium leading-none line-clamp-2">
                        {decision.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(decision.timestamp), {
                          addSuffix: true,
                        })}
                        {decision.campaignName && (
                          <Link
                            href={`/dashboard/campaigns/${decision.campaignId}`}
                            className="ml-1 hover:underline"
                          >
                            {" "}
                            - {decision.campaignName.substring(0, 15)}...
                          </Link>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent AI decisions.
              </p>
            )}
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                    asChild
                  >
                    <Link href="/dashboard/ai-decisions">
                      View All Decisions
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>See the full history of AI optimizations.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardContent>
        </Card>
      </div>

      {/* Europe Map Card - NEW */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-sky-500" />
            European Performance & Budget
          </CardTitle>
          <CardDescription>
            Geographic overview of key metrics across European countries. Hover
            over a country for details.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          {/* Conditional rendering in case data/component fails */}
          {europeData && europeData.length > 0 ? (
            <EuropeMapChart data={europeData} />
          ) : (
            <p className="text-muted-foreground">Map data unavailable.</p>
          )}
        </CardContent>
      </Card>

      {/* Top Campaigns Preview Table - Add description */}
      <Card className="border-border/40">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>
              A snapshot of the most recently active or modified campaigns.
            </CardDescription>
          </div>
          <Link href="/dashboard/campaigns" passHref>
            <Button size="sm">
              View All
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Spend</TableHead>
                <TableHead className="text-right">Budget</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.length > 0 ? (
                campaigns.map((campaign: Campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">
                      {campaign.name}
                    </TableCell>
                    <TableCell>{campaign.platform}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(campaign.spend, 2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(campaign.budget, 0)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No recent campaigns found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
