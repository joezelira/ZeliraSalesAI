import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Calendar, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lead } from "@shared/schema";

interface LeadsTableProps {
  leads: Lead[];
  isLoading?: boolean;
  compact?: boolean;
}

const statusConfig = {
  new: { label: "New", variant: "secondary" as const },
  contacted: { label: "Contacted", variant: "outline" as const },
  qualified: { label: "Qualified", variant: "default" as const },
  unqualified: { label: "Unqualified", variant: "destructive" as const },
  scheduled: { label: "Scheduled", variant: "secondary" as const },
  closed: { label: "Closed", variant: "outline" as const },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map(part => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
    "bg-pink-100 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400",
  ];
  
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export default function LeadsTable({ leads, isLoading = false, compact = false }: LeadsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 dark:text-slate-400">No leads found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Contact</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => {
          const config = statusConfig[lead.status as keyof typeof statusConfig] || statusConfig.new;
          
          return (
            <TableRow key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm",
                    getAvatarColor(lead.name)
                  )}>
                    {getInitials(lead.name)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {lead.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {lead.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm text-slate-900 dark:text-white">
                    {lead.company || "—"}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {lead.role || "—"}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={config.variant}>
                  {config.label}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={lead.score || 0} 
                    className="w-16 h-2" 
                  />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {lead.score || 0}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {lead.status === "qualified" ? (
                    <Button variant="ghost" size="sm">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  ) : lead.status === "scheduled" ? (
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" disabled>
                      <Calendar className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
