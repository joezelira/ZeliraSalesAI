import { useQuery } from "@tanstack/react-query";
import type { Lead } from "@shared/schema";

export function useLeads() {
  return useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useLead(id: number) {
  return useQuery<Lead>({
    queryKey: ["/api/leads", id],
    enabled: !!id,
  });
}
