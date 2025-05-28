import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatsCard from "@/components/stats-card";
import LeadsTable from "@/components/leads-table";
import SystemStatus from "@/components/system-status";
import ActivityFeed from "@/components/activity-feed";
import QuickActions from "@/components/quick-actions";
import { useStats } from "@/hooks/use-stats";
import { useLeads } from "@/hooks/use-leads";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: leads, isLoading: leadsLoading } = useLeads();

  const recentLeads = leads?.slice(0, 5) || [];

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Monitor your AI sales assistant performance
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Status Indicator */}
            <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Active</span>
            </div>
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="New Leads Today"
            value={stats?.newLeadsToday || 0}
            change="+23%"
            changeType="positive"
            icon="user-plus"
            isLoading={statsLoading}
          />
          <StatsCard
            title="Qualified Leads"
            value={stats?.qualifiedLeads || 0}
            change="85% rate"
            changeType="neutral"
            icon="check-circle"
            isLoading={statsLoading}
          />
          <StatsCard
            title="Emails Sent"
            value={stats?.emailsSent || 0}
            change={`${stats?.emailOpenRate || 0}% open rate`}
            changeType="positive"
            icon="mail"
            isLoading={statsLoading}
          />
          <StatsCard
            title="Calls Scheduled"
            value={stats?.callsScheduled || 0}
            change="Next: 2:30 PM"
            changeType="neutral"
            icon="phone"
            isLoading={statsLoading}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Leads */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Leads</CardTitle>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <LeadsTable leads={recentLeads} isLoading={leadsLoading} compact />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            <SystemStatus />
            <ActivityFeed />
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}
