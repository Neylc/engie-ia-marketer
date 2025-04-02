import { generateCampaigns, Campaign } from "@/lib/data";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function CampaignsPage() {
  // Generate a larger set of fake campaigns for this page
  const campaignsData: Campaign[] = generateCampaigns(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Campaign Management
        </h1>
        {/* TODO: Implement Create Campaign Modal */}
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>
      <DataTable columns={columns} data={campaignsData} />
    </div>
  );
}
