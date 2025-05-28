import { useQuery } from "@tanstack/react-query";

interface Stats {
  newLeadsToday: number;
  qualifiedLeads: number;
  emailsSent: number;
  callsScheduled: number;
  totalLeads: number;
  emailOpenRate: number;
}

export function useStats() {
  return useQuery<Stats>({
    queryKey: ["/api/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
