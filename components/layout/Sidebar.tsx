"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  BrainCircuit,
  BarChart3,
  Wallet,
  Settings,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import * as React from "react";
import EngieLogo from "./EngieLogo";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Campaigns", href: "/dashboard/campaigns", icon: Megaphone },
  { name: "AI Decisions", href: "/dashboard/ai-decisions", icon: BrainCircuit },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Budget", href: "/dashboard/budget", icon: Wallet },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isAutoMode, setIsAutoMode] = React.useState(true);

  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 px-4">
        <EngieLogo />
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <item.icon
              className={cn(
                "mr-3 flex-shrink-0 h-5 w-5",
                pathname === item.href
                  ? "text-primary-foreground/80"
                  : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors duration-150"
              )}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="auto-mode-sidebar"
            className="flex items-center space-x-2 cursor-pointer"
          >
            <Bot className="h-5 w-5 text-blue-500" />
            <span className="font-medium text-sm">AI Auto Mode</span>
          </Label>
          <Switch
            id="auto-mode-sidebar"
            checked={isAutoMode}
            onCheckedChange={setIsAutoMode}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          When enabled, the AI will automatically apply optimizations.
        </p>
      </div>
    </aside>
  );
}
