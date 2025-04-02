import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { generatePlatformStatus, PlatformStatus } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  // Generate fake platform statuses
  const platformStatuses: PlatformStatus[] = generatePlatformStatus();

  const getStatusVariant = (
    status: PlatformStatus["status"]
  ): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case "Connected":
        return "default";
      case "Error":
        return "destructive";
      case "Disconnected":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        Account Settings & Integrations
      </h1>
      <p className="text-muted-foreground">
        Manage your account, integrations, and application preferences.
      </p>

      <Separator />

      {/* Integrations Section */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Ad Platform Integrations</CardTitle>
          <CardDescription>
            Connect and manage your ad platform accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {platformStatuses.map((ps) => (
            <div
              key={ps.platform}
              className="flex items-center justify-between p-4 border rounded-md border-border/40"
            >
              <div>
                <h3 className="font-medium">{ps.platform}</h3>
                <p className="text-sm text-muted-foreground">
                  Last sync:{" "}
                  {formatDistanceToNow(new Date(ps.lastSync), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              <Badge
                variant={getStatusVariant(ps.status)}
                className={cn(
                  ps.status === "Connected" &&
                    "text-green-700 dark:text-green-300",
                  ps.status === "Error" && "text-red-700 dark:text-red-300"
                )}
              >
                {ps.status}
              </Badge>
            </div>
          ))}
          <Button className="w-full">Connect New Platform</Button>
        </CardContent>
      </Card>

      {/* Add other settings sections like Profile, Billing, Notifications etc. later */}
    </div>
  );
}
