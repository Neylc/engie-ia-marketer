"use client";

import * as React from "react";
import { generateAiDecisions, AiDecision, aiDecisionTypes } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  Link as LinkIcon,
  ThumbsUp,
  ThumbsDown,
  Bot,
  Undo2, // Import Undo icon
  CircleDollarSign, // Icon for Budget
  Users, // Icon for Audience
  Image as ImageIcon, // Icon for Creative
  BarChartBig, // Icon for Bidding
  ListFilter, // Icon for Keywords
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator"; // Import Separator
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For reverted status
import { getTypeStyling } from "@/lib/helpers"; // Import helper
import {
  DateRangeFilter,
  DateRangeKey,
} from "@/components/ui/date-range-filter"; // Import filter

// --- Types & Interfaces ---

// Minimal interface for the mocked column object passed to the filter
interface MockFilterColumn {
  getFilterValue: () => string[] | undefined;
  setFilterValue: (value: string[] | undefined) => void;
  getFacetedUniqueValues: () => Map<string, number>;
}

// Interface for the filter options, matching DataTableFacetedFilter expectation
interface FacetedFilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// --- Filter Options & Icons ---

// Define icons FIRST
const decisionTypeIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  "Budget Adjustment": CircleDollarSign,
  "Audience Refinement": Users,
  "Ad Creative Change": ImageIcon,
  "Bidding Strategy Update": BarChartBig,
  "Keyword Optimization": ListFilter,
};

// NOW define options using the icons
const decisionTypeOptions: FacetedFilterOption[] = aiDecisionTypes.map(
  (type) => ({
    label: type,
    value: type,
    icon: decisionTypeIcons[type] || Bot, // Use specific icon or fallback (Bot is a ComponentType)
  })
);

export default function AiDecisionsPage() {
  // --- State ---
  const [allDecisions, setAllDecisions] = React.useState<AiDecision[]>(() =>
    generateAiDecisions(100)
  ); // Make mutable for revert
  const [filteredDecisions, setFilteredDecisions] =
    React.useState<AiDecision[]>(allDecisions);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedTypes, setSelectedTypes] = React.useState<Set<string>>(
    new Set()
  );
  const [feedback, setFeedback] = React.useState<
    Record<string, "good" | "bad" | null>
  >({});
  const [dateRange, setDateRange] = React.useState<DateRangeKey>("30d"); // Add date range state

  // --- Filtering Logic ---
  React.useEffect(() => {
    let decisions = allDecisions;

    // TODO: Add filtering by dateRange here if implementing actual data fetching

    // Filter by selected types
    if (selectedTypes.size > 0) {
      decisions = decisions.filter((d) => selectedTypes.has(d.type));
    }

    // Filter by search term (description or campaign name)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      decisions = decisions.filter(
        (d) =>
          d.description.toLowerCase().includes(lowerSearchTerm) ||
          d.campaignName?.toLowerCase().includes(lowerSearchTerm)
      );
    }

    setFilteredDecisions(decisions);
  }, [allDecisions, searchTerm, selectedTypes, dateRange]); // Add dateRange to dependency array

  // --- Handlers ---
  const handleFeedback = (decisionId: string, newFeedback: "good" | "bad") => {
    // Prevent feedback if reverted
    const decision = allDecisions.find((d) => d.id === decisionId);
    if (decision?.isReverted) return;

    setFeedback((prev) => {
      const current = prev[decisionId];
      // Allow toggling off feedback
      const updatedFeedback = current === newFeedback ? null : newFeedback;
      // Update the feedback state for the specific decision
      return { ...prev, [decisionId]: updatedFeedback };
    });
    console.log(`Feedback for ${decisionId}: ${newFeedback}`);
  };

  const handleRevert = (decisionId: string) => {
    // In a real app, this would be an API call, potentially complex
    console.log(`Reverting decision ${decisionId}`);
    setAllDecisions((prevDecisions) =>
      prevDecisions.map(
        (d) =>
          d.id === decisionId
            ? { ...d, isReverted: true, userFeedback: "bad" }
            : d // Mark as reverted and maybe set feedback to bad
      )
    );
    // Feedback state might also need updating if we automatically set it
    setFeedback((prev) => ({ ...prev, [decisionId]: "bad" }));
  };

  // --- Faceted Filter State Management ---
  // This mimics how the DataTable component uses the filter
  // We manage the selected values set here and pass it down
  const handleFilterChange = (
    updater: Set<string> | ((prev: Set<string>) => Set<string>)
  ) => {
    setSelectedTypes(updater);
  };
  // Mimic the table column interface needed by DataTableFacetedFilter
  const typeFilterColumn: MockFilterColumn = {
    getFilterValue: () => Array.from(selectedTypes),
    setFilterValue: (values: string[] | undefined) =>
      handleFilterChange(new Set(values ?? [])),
    getFacetedUniqueValues: () => {
      // Calculate counts based on *all* decisions, not just filtered ones
      const counts = new Map<string, number>();
      allDecisions.forEach((d) => {
        counts.set(d.type, (counts.get(d.type) || 0) + 1);
      });
      return counts;
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          AI Optimization Center
        </h1>
        {/* Filters Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            placeholder="Search decisions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 w-full md:w-[250px]"
          />
          <DataTableFacetedFilter
            // @ts-expect-error // Justification: Mocking tanstack column for filter component reuse outside DataTable
            column={typeFilterColumn}
            title="Type"
            options={decisionTypeOptions}
          />
          {/* Add Date Range Filter */}
          <DateRangeFilter
            selectedRange={dateRange}
            onRangeChange={setDateRange}
          />
        </div>
      </div>
      <p className="text-muted-foreground">
        Review the automated decisions and optimizations made by the AdOptimize
        AI engine. Provide feedback to help improve future suggestions.
      </p>

      {/* Decisions List */}
      <div className="space-y-3">
        {filteredDecisions.length > 0 ? (
          filteredDecisions.map((decision) => {
            const {
              variant: badgeVariant,
              icon: TypeIcon,
              cardClass,
            } = getTypeStyling(decision.type);
            const currentFeedback =
              feedback[decision.id] ?? decision.userFeedback; // Use state feedback first
            const isReverted = decision.isReverted;

            return (
              <Collapsible
                key={decision.id}
                className={cn(
                  "rounded-lg border px-4 py-3 bg-card text-card-foreground shadow-sm transition-all",
                  cardClass, // Apply type-specific border color
                  isReverted && "opacity-60 bg-muted/50 border-dashed"
                )}
              >
                <CollapsibleTrigger
                  className="flex w-full items-center justify-between text-left group"
                  disabled={isReverted}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <TypeIcon className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge
                          variant={badgeVariant}
                          className="text-xs capitalize"
                        >
                          {decision.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                          {formatDistanceToNow(new Date(decision.timestamp), {
                            addSuffix: true,
                          })}
                        </span>
                        {isReverted && (
                          <Badge
                            variant="destructive"
                            className="text-xs font-mono"
                          >
                            Reverted
                          </Badge>
                        )}
                      </div>
                      <p
                        className={cn(
                          "text-sm font-medium truncate",
                          !isReverted && "group-hover:text-primary"
                        )}
                      >
                        {decision.description}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform duration-200 ml-2 flex-shrink-0",
                      !isReverted && "group-data-[state=open]:rotate-180"
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 space-y-4">
                  {isReverted && (
                    <Alert variant="destructive" className="border-dashed">
                      <Undo2 className="h-4 w-4" />
                      <AlertTitle>Decision Reverted</AlertTitle>
                      <AlertDescription>
                        This automated action has been manually reverted and is
                        no longer active.
                      </AlertDescription>
                    </Alert>
                  )}
                  <Separator />
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <h4 className="font-semibold mb-1 text-foreground">
                      Reasoning:
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {decision.reason}
                    </p>
                  </div>
                  {(decision.campaignId || decision.campaignName) && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        Related Campaign:
                      </span>
                      {decision.campaignId ? (
                        <Link
                          href={`/dashboard/campaigns/${decision.campaignId}`}
                          passHref
                        >
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-sm"
                          >
                            {decision.campaignName ??
                              decision.campaignId.substring(0, 8) + "..."}
                            <LinkIcon className="ml-1 h-3 w-3 flex-shrink-0" />
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {decision.campaignName}
                        </span>
                      )}
                    </div>
                  )}
                  <Separator />
                  <div className="flex items-center justify-end gap-2 pt-2">
                    {!isReverted && (
                      <>
                        <span className="text-xs text-muted-foreground mr-auto">
                          Was this decision helpful?
                        </span>
                        <Button
                          variant={
                            currentFeedback === "good" ? "default" : "outline"
                          }
                          size="icon"
                          onClick={() => handleFeedback(decision.id, "good")}
                          className={cn(
                            "h-7 w-7",
                            currentFeedback === "good" &&
                              "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800"
                          )}
                          title="Good Decision"
                        >
                          <ThumbsUp
                            className={cn(
                              "h-4 w-4",
                              currentFeedback === "good"
                                ? "text-green-600 dark:text-green-400"
                                : "text-muted-foreground"
                            )}
                          />
                        </Button>
                        <Button
                          variant={
                            currentFeedback === "bad" ? "default" : "outline"
                          }
                          size="icon"
                          onClick={() => handleFeedback(decision.id, "bad")}
                          className={cn(
                            "h-7 w-7",
                            currentFeedback === "bad" &&
                              "bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-800"
                          )}
                          title="Bad Decision"
                        >
                          <ThumbsDown
                            className={cn(
                              "h-4 w-4",
                              currentFeedback === "bad"
                                ? "text-red-600 dark:text-red-400"
                                : "text-muted-foreground"
                            )}
                          />
                        </Button>
                        <Separator
                          orientation="vertical"
                          className="h-6 mx-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevert(decision.id)}
                          className="h-7 text-xs text-destructive hover:bg-destructive/10 border-destructive/50"
                          title="Revert Decision"
                        >
                          <Undo2 className="h-3 w-3 mr-1" />
                          Revert
                        </Button>
                      </>
                    )}
                    {isReverted && (
                      <p className="text-xs text-destructive font-medium mr-auto">
                        Decision Reverted
                      </p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })
        ) : (
          <Card className="flex flex-col items-center justify-center py-12">
            <CardContent className="text-center">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-semibold">No decisions found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters or check back later.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Add Pagination if needed for large lists */}
    </div>
  );
}
