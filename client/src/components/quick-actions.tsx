import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, RefreshCw, Download } from "lucide-react";

export default function QuickActions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/sync/google-sheets"),
    onSuccess: () => {
      toast({
        title: "Sync completed",
        description: "Google Sheets has been synchronized successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => {
      toast({
        title: "Sync failed",
        description: "Failed to synchronize Google Sheets. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          className="w-full justify-center" 
          onClick={() => {
            toast({
              title: "Feature coming soon",
              description: "Manual lead creation will be available soon.",
            });
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Lead Manually
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-center"
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
          {syncMutation.isPending ? "Syncing..." : "Sync CRM"}
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-center"
          onClick={() => {
            toast({
              title: "Feature coming soon",
              description: "Data export will be available soon.",
            });
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </CardContent>
    </Card>
  );
}
