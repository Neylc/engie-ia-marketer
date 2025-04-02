"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AiDecision } from "@/lib/data";
import { ArrowUpDown, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns"; // For formatting timestamp
import Link from "next/link"; // For linking to campaign (if ID exists)
import { Badge } from "@/components/ui/badge"; // To categorize decision types
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Import Tooltip

// Helper function to get a badge variant based on decision type (customize as needed)
const getTypeVariant = (
  type: string
): "default" | "secondary" | "destructive" | "outline" => {
  if (type.includes("Budget")) return "default";
  if (type.includes("Audience")) return "secondary";
  if (type.includes("Creative")) return "outline";
  // Add more specific variants if desired
  return "secondary";
};

export const columns: ColumnDef<AiDecision>[] = [
  // Timestamp Column
  {
    accessorKey: "timestamp",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="pl-0"
        >
          Timestamp
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const timestamp = row.getValue("timestamp") as string;
      const formattedDate = format(new Date(timestamp), "yyyy-MM-dd HH:mm:ss");
      return (
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {formattedDate}
        </div>
      );
    },
    size: 180, // Give timestamp a fixed size
  },
  // Type Column
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return <Badge variant={getTypeVariant(type)}>{type}</Badge>;
    },
    size: 150, // Fixed size for type
  },
  // Description Column
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue("description")}</div>
    ),
  },
  // Related Campaign Column (Uses campaignName now)
  {
    accessorKey: "campaignId", // Still filter/sort by ID if needed
    header: "Related Campaign",
    cell: ({ row }) => {
      const campaignId = row.getValue("campaignId") as string | undefined;
      const campaignName = row.original.campaignName; // Get name from original data

      if (!campaignId)
        return <span className="text-sm text-muted-foreground">N/A</span>;

      // Link using ID, display Name with tooltip for full name/ID
      return (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/dashboard/campaigns/${campaignId}`} passHref>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-sm whitespace-nowrap"
                >
                  {campaignName
                    ? campaignName.substring(0, 20) +
                      (campaignName.length > 20 ? "..." : "")
                    : campaignId.substring(0, 8) + "..."}
                  <LinkIcon className="ml-1 h-3 w-3 flex-shrink-0" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{campaignName ?? "View Campaign"}</p>
              <p className="text-xs text-muted-foreground">ID: {campaignId}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableSorting: false,
    size: 200, // Give campaign column reasonable size
  },
  // Actions Column (Optional - what actions might apply to a decision log?)
  // {
  //   id: "actions",
  //   cell: ({ row }) => {
  //     const decision = row.original;
  //     return (
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //            <Button variant="ghost" className="h-8 w-8 p-0">
  //               <span className="sr-only">Open menu</span>
  //               <MoreHorizontal className="h-4 w-4" />
  //            </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align="end">
  //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //           <DropdownMenuItem>View Details</DropdownMenuItem>
  //           {/* Add other relevant actions */}
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     );
  //   },
  //   enableSorting: false,
  //   enableHiding: false,
  // },
];
