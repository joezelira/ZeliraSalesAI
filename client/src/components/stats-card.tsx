import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  UserPlus, 
  CheckCircle, 
  Mail, 
  Phone, 
  ArrowUp, 
  ArrowDown,
  type LucideIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: "user-plus" | "check-circle" | "mail" | "phone";
  isLoading?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  "user-plus": UserPlus,
  "check-circle": CheckCircle,
  "mail": Mail,
  "phone": Phone,
};

const iconBgMap = {
  "user-plus": "bg-blue-100 dark:bg-blue-900/20",
  "check-circle": "bg-green-100 dark:bg-green-900/20",
  "mail": "bg-purple-100 dark:bg-purple-900/20",
  "phone": "bg-orange-100 dark:bg-orange-900/20",
};

const iconColorMap = {
  "user-plus": "text-blue-600 dark:text-blue-400",
  "check-circle": "text-green-600 dark:text-green-400",
  "mail": "text-purple-600 dark:text-purple-400",
  "phone": "text-orange-600 dark:text-orange-400",
};

export default function StatsCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  isLoading = false 
}: StatsCardProps) {
  const Icon = iconMap[icon];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-12 w-12 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              {title}
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
              {value}
            </p>
            <p className={cn(
              "text-sm font-medium mt-1 flex items-center",
              changeType === "positive" && "text-green-600 dark:text-green-400",
              changeType === "negative" && "text-red-600 dark:text-red-400",
              changeType === "neutral" && "text-slate-600 dark:text-slate-400"
            )}>
              {changeType === "positive" && <ArrowUp className="h-3 w-3 mr-1" />}
              {changeType === "negative" && <ArrowDown className="h-3 w-3 mr-1" />}
              {change}
            </p>
          </div>
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            iconBgMap[icon]
          )}>
            <Icon className={cn("h-6 w-6", iconColorMap[icon])} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
