import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SystemStatusItem {
  name: string;
  connected: boolean;
  status: string;
  icon: string;
  description: string;
}

export default function SystemStatus() {
  const { data: status, isLoading } = useQuery({
    queryKey: ["/api/system-status"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const statusItems: SystemStatusItem[] = [
    {
      name: "Google Sheets",
      connected: status?.googleSheets?.connected || false,
      status: status?.googleSheets?.status || "inactive",
      icon: "🔗",
      description: "Monitoring active",
    },
    {
      name: "AI Engine",
      connected: status?.aiEngine?.connected || false,
      status: status?.aiEngine?.status || "inactive",
      icon: "🧠",
      description: "Processing leads",
    },
    {
      name: "Email Service",
      connected: status?.emailService?.connected || false,
      status: status?.emailService?.status || "inactive",
      icon: "📧",
      description: "Ready to send",
    },
    {
      name: "CRM Sync",
      connected: status?.crmSync?.connected || false,
      status: status?.crmSync?.status || "inactive",
      icon: "🗃️",
      description: "Last sync: 5 min ago",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="w-3 h-3 rounded-full" />
            </div>
          ))
        ) : (
          statusItems.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-lg",
                  item.connected
                    ? "bg-green-100 dark:bg-green-900/20"
                    : "bg-gray-100 dark:bg-gray-900/20"
                )}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>
              </div>
              <div className={cn(
                "w-3 h-3 rounded-full",
                item.connected && item.status === "active"
                  ? "bg-green-500"
                  : "bg-gray-400"
              )} />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
