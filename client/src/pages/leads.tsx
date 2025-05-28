import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LeadsTable from "@/components/leads-table";
import { useLeads } from "@/hooks/use-leads";
import { Plus, Search, Filter } from "lucide-react";
import { useState } from "react";

export default function Leads() {
  const { data: leads, isLoading } = useLeads();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredLeads = leads?.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const statusCounts = leads?.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Leads</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage and track your sales leads
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {leads?.length || 0}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {statusCounts.new || 0}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">New</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {statusCounts.contacted || 0}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Contacted</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {statusCounts.qualified || 0}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Qualified</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">
                {statusCounts.scheduled || 0}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Scheduled</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-600">
                {statusCounts.closed || 0}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Closed</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search leads by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="unqualified">Unqualified</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(searchTerm || statusFilter !== "all") && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Showing {filteredLeads.length} of {leads?.length || 0} leads
                </span>
                {searchTerm && (
                  <Badge variant="secondary">
                    Search: {searchTerm}
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge variant="secondary">
                    Status: {statusFilter}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Leads</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <LeadsTable leads={filteredLeads} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
