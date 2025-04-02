"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

// Define possible date ranges
export const dateRangeOptions = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  mtd: "Month to date",
  ytd: "Year to date",
};

export type DateRangeKey = keyof typeof dateRangeOptions;

interface DateRangeFilterProps {
  selectedRange: DateRangeKey;
  onRangeChange: (range: DateRangeKey) => void;
  className?: string;
}

export function DateRangeFilter({
  selectedRange,
  onRangeChange,
  className,
}: DateRangeFilterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-8 flex items-center gap-1", className)}
        >
          <CalendarDays className="h-4 w-4 opacity-70" />
          <span>{dateRangeOptions[selectedRange]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Select Date Range</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={selectedRange}
          onValueChange={(value) => onRangeChange(value as DateRangeKey)}
        >
          {Object.entries(dateRangeOptions).map(([key, label]) => (
            <DropdownMenuRadioItem key={key} value={key}>
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
