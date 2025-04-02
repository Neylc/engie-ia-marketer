import React from "react";
import {
  Bot,
  CircleDollarSign,
  Users,
  Image as ImageIcon,
  BarChartBig,
  ListFilter,
} from "lucide-react";

/**
 * Provides consistent styling (badge variant, icon, card border class)
 * for different AI decision types.
 */
export const getTypeStyling = (
  type: string
): {
  variant: "default" | "secondary" | "destructive" | "outline";
  icon: React.ComponentType<{ className?: string }>;
  cardClass: string;
} => {
  let variant: "default" | "secondary" | "destructive" | "outline" =
    "secondary";
  let icon: React.ComponentType<{ className?: string }> = Bot;
  // Use more subtle default border for general cards, specific borders for AI decisions
  let cardClass = "border-border/40";

  // Specific styling based on decision type keywords
  if (type.includes("Budget")) {
    variant = "default";
    icon = CircleDollarSign;
    cardClass = "border-blue-500/30 dark:border-blue-500/50";
  }
  if (type.includes("Audience")) {
    variant = "secondary";
    icon = Users;
    cardClass = "border-purple-500/30 dark:border-purple-500/50";
  }
  if (type.includes("Creative")) {
    variant = "outline";
    icon = ImageIcon;
    cardClass = "border-orange-500/30 dark:border-orange-500/50";
  }
  if (type.includes("Bidding")) {
    variant = "default";
    icon = BarChartBig;
    cardClass = "border-teal-500/30 dark:border-teal-500/50";
  }
  if (type.includes("Keyword")) {
    variant = "secondary";
    icon = ListFilter;
    cardClass = "border-pink-500/30 dark:border-pink-500/50";
  }

  return { variant, icon, cardClass };
};

/**
 * Formats a number as currency (USD).
 */
export const formatCurrency = (
  value: number,
  minimumFractionDigits: number = 0
) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits,
  }).format(value);

/**
 * Formats a number as a percentage.
 */
export const formatPercent = (
  value: number,
  minimumFractionDigits: number = 1
) =>
  new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits,
  }).format(value);

/**
 * Gets a badge variant based on campaign status.
 */
export const getStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "Active":
      return "default";
    case "Paused":
      return "secondary";
    case "Ended":
      return "outline";
    case "Draft":
      return "destructive"; // Using destructive for Draft
    default:
      return "secondary";
  }
};
