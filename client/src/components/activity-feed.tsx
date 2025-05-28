import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { Activity } from "@shared/schema";

const activityIcons = {
  lead_created: "🆕",
  email_sent: "📧",
  email_response: "💬",
  lead_qualified: "✅",
  call_scheduled: "📅",
  call_completed: "☎️",
  default: "📋",
};

const activityColors = {
  lead_created: "bg-blue-500",
  email_sent: "bg-purple-500",
  email_response: "bg-green-500",
  lead_qualified: "bg-yellow-500",
  call_scheduled: "bg-orange-500",
  call_completed: "bg-teal-500",
  default: "bg-gray-500",
};

export default function ActivityFeed() {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const recentActivities = activities?.slice(0, 10) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <Skeleton className="w-2 h-2 rounded-full mt-2" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))
        ) : recentActivities.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
            No recent activity
          </p>
        ) : (
          recentActivities.map((activity) => {
            const color = activityColors[activity.type as keyof typeof activityColors] || activityColors.default;
            
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={cn(
                  "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                  color
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 dark:text-white">
                    {activity.description}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {activity.createdAt 
                      ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })
                      : "Just now"
                    }
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
