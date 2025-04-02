"use client";
import * as React from "react";

import {
  generateKpiData, // Reuse for spend data
  platforms, // For platform breakdown
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
import { Progress } from "@/components/ui/progress"; // Import Progress
import { Target, Banknote, WalletCards } from "lucide-react"; // Icons
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";
import { formatCurrency } from "@/lib/helpers"; // Import helper
import {
  DateRangeFilter,
  DateRangeKey,
} from "@/components/ui/date-range-filter"; // Import filter

// --- Types for this page ---
type MonthlyBudgetData = {
  month: string;
  budget: number;
  spend: number;
};

// --- Fake Data Generation for this page ---
const generateMonthlyBudgetData = (months = 6): MonthlyBudgetData[] => {
  const data: MonthlyBudgetData[] = [];
  const today = new Date();
  const totalBudget = 75000; // Assume a total budget for the period

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthStr = date.toLocaleString("default", { month: "short" });
    const monthlyBudget =
      totalBudget / months + (Math.random() - 0.5) * (totalBudget * 0.1); // Slight variation
    const monthlySpend = monthlyBudget * (Math.random() * 0.4 + 0.7); // Spend 70-110% of budget

    data.push({
      month: monthStr,
      budget: parseFloat(monthlyBudget.toFixed(0)),
      spend: parseFloat(monthlySpend.toFixed(0)),
    });
  }
  return data;
};

const generatePlatformBudgetAllocation = (totalSpend: number) => {
  // Allocate budget somewhat proportional to spend from KPI data
  let allocatedBudget = 0;
  const allocations = platforms.map((p) => {
    const budgetShare = Math.random() * 0.3 + 0.1; // Random share for prototype
    const budget = totalSpend * 1.2 * budgetShare; // Assume budget is ~120% of spend total
    allocatedBudget += budget;
    return { platform: p, budget: parseFloat(budget.toFixed(0)) };
  });

  // Normalize to a more realistic total budget (e.g., totalSpend * 1.2)
  const targetTotalBudget = totalSpend * 1.2;
  const normFactor = targetTotalBudget / allocatedBudget;
  allocations.forEach(
    (a) => (a.budget = parseFloat((a.budget * normFactor).toFixed(0)))
  );

  return allocations;
};

// --- Chart Component ---
const MonthlyBudgetChart = ({ data }: { data: MonthlyBudgetData[] }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const gridColor = isDarkMode
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)";
  const textColor = isDarkMode ? "#cbd5e1" : "#64748b";
  const budgetColor = isDarkMode ? "#60a5fa" : "#3b82f6"; // Blue
  const spendColor = isDarkMode ? "#a78bfa" : "#8b5cf6"; // Violet

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 5, left: -15, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis
          dataKey="month"
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
          tickFormatter={formatCurrency}
        />
        <Tooltip
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
        <Line
          type="monotone"
          dataKey="budget"
          stroke={budgetColor}
          strokeWidth={2}
          dot={false}
          name="Budget"
        />
        <Line
          type="monotone"
          dataKey="spend"
          stroke={spendColor}
          strokeWidth={2}
          dot={false}
          name="Spend"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// --- Page Component ---
export default function BudgetPage() {
  // Add state for date range
  const [dateRange, setDateRange] = React.useState<DateRangeKey>("30d");

  // Generate data (not dynamically linked to dateRange in prototype)
  const kpiData = generateKpiData();
  const monthlyData = generateMonthlyBudgetData();
  const platformBudgets = generatePlatformBudgetAllocation(kpiData.totalSpend);

  // Calculate overall budget figures
  const totalBudget = platformBudgets.reduce((sum, p) => sum + p.budget, 0);
  const remainingBudget = totalBudget - kpiData.totalSpend;
  const budgetUtilization =
    totalBudget > 0 ? (kpiData.totalSpend / totalBudget) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Marketing Budget & Spend
        </h1>
        <DateRangeFilter
          selectedRange={dateRange}
          onRangeChange={setDateRange}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBudget)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all platforms
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <Banknote className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(kpiData.totalSpend)}
            </div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Remaining Budget
            </CardTitle>
            <WalletCards className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                remainingBudget < 0 ? "text-red-600" : ""
              }`}
            >
              {formatCurrency(remainingBudget)}
            </div>
            <p className="text-xs text-muted-foreground">
              {remainingBudget < 0 ? "Over budget" : "Available"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Utilization Progress */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Overall Budget Utilization</CardTitle>
          <CardDescription>
            Total spend compared to the total allocated budget.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={budgetUtilization} className="h-3" />
          <div className="text-sm text-muted-foreground flex justify-between">
            <span>{formatCurrency(kpiData.totalSpend)} Spent</span>
            <span>
              {formatCurrency(totalBudget)} Budget (
              {budgetUtilization.toFixed(1)}%)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Charts and Tables Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Spend vs Budget Chart */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Monthly Spend vs. Budget</CardTitle>
            <CardDescription>
              Track spending trends against allocated monthly budgets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyBudgetChart data={monthlyData} />
          </CardContent>
        </Card>

        {/* Platform Budget Allocation Table */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Budget Allocation by Platform</CardTitle>
            <CardDescription>
              Allocated budget for each connected ad platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead className="text-right">Allocated Budget</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {platformBudgets.map((pb) => (
                  <TableRow key={pb.platform}>
                    <TableCell className="font-medium">{pb.platform}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(pb.budget)}
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
