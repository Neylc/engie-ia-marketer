"use client";

import { PerformanceDataPoint } from "@/lib/data";
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

interface PerformanceChartProps {
  data: PerformanceDataPoint[];
}

// Helper to format axis ticks (e.g., 1000 -> 1k)
const formatAxisTick = (tick: number) => {
  if (tick >= 1000000) {
    return `${(tick / 1000000).toFixed(1)}M`;
  }
  if (tick >= 1000) {
    return `${(tick / 1000).toFixed(0)}k`;
  }
  return tick.toString();
};

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  // Define colors for lines, adapting to theme
  const colors = {
    spend: isDarkMode ? "#a78bfa" : "#8b5cf6", // violet-400 / violet-500
    impressions: isDarkMode ? "#f87171" : "#ef4444", // red-400 / red-500
    clicks: isDarkMode ? "#60a5fa" : "#3b82f6", // blue-400 / blue-500
    conversions: isDarkMode ? "#34d399" : "#10b981", // emerald-400 / emerald-500
  };

  const gridColor = isDarkMode
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)";
  const textColor = isDarkMode ? "#cbd5e1" : "#64748b"; // slate-300 / slate-500

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 10,
          left: -10, // Adjust to align YAxis labels nicely
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis
          dataKey="date"
          stroke={textColor}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          // Format date ticks if needed (e.g., show month/day)
          // tickFormatter={(value) => value.substring(5)} // Example: MM-DD
        />
        <YAxis
          stroke={textColor}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatAxisTick} // Use the helper for large numbers
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDarkMode ? "#1f2937" : "#ffffff", // gray-800 / white
            borderColor: isDarkMode ? "#374151" : "#e5e7eb", // gray-700 / gray-200
            borderRadius: "0.375rem", // rounded-md
          }}
          labelStyle={{ color: isDarkMode ? "#f9fafb" : "#111827" }} // gray-50 / gray-900
          itemStyle={{ color: textColor }}
          formatter={(value: number, name: string) => {
            if (name === "spend") {
              return [
                `$${value.toFixed(2)}`,
                name.charAt(0).toUpperCase() + name.slice(1),
              ];
            }
            return [
              value.toLocaleString(),
              name.charAt(0).toUpperCase() + name.slice(1),
            ];
          }}
        />
        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
        <Line
          type="monotone"
          dataKey="spend"
          stroke={colors.spend}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="impressions"
          stroke={colors.impressions}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="clicks"
          stroke={colors.clicks}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="conversions"
          stroke={colors.conversions}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
