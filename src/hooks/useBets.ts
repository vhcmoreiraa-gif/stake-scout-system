import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bet, BankrollSettings } from "@/lib/bets";

export function useBets() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["bets", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bets")
        .select("*")
        .order("bet_date", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return (data as Bet[]) ?? [];
    },
  });
}

export function useBankroll() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["bankroll", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("bankroll_settings").select("*").maybeSingle();
      if (error) throw error;
      return data as BankrollSettings | null;
    },
  });
}
