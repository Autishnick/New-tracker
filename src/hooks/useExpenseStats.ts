import type { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient"; // Перевір шлях до клієнта

export const useExpenseStats = (
  session: Session | null,
  startDate?: string,
  endDate?: string
) => {
  const [allTimeTotal, setAllTimeTotal] = useState(0);
  const [periodTotal, setPeriodTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!session) return;
    setLoading(true);

    try {
      const { data: allData, error: allError } = await supabase
        .from("expenses")
        .select("amount");

      if (!allError && allData) {
        const total = allData.reduce((sum, item) => sum + item.amount, 0);
        setAllTimeTotal(total);
      }

      if (startDate && endDate) {
        const { data: periodData, error: periodError } = await supabase
          .from("expenses")
          .select("amount")
          .gte("date", startDate)
          .lte("date", endDate);

        if (!periodError && periodData) {
          const pTotal = periodData.reduce((sum, item) => sum + item.amount, 0);
          setPeriodTotal(pTotal);
        }
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }, [session, startDate, endDate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { allTimeTotal, periodTotal, loading, refreshStats: fetchStats };
};
