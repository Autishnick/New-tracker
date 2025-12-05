import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

interface MonoRate {
  currencyCodeA: number;
  currencyCodeB: number;
  date: number;
  rateBuy?: number;
  rateSell?: number;
  rateCross?: number;
}

const CACHE_KEY = "monobank_rates_cache";
const CACHE_DURATION = 5 * 60 * 1000;

export default function CurrencyTracker({
  session,
}: {
  session: Session | null;
}) {
  const [rates, setRates] = useState<MonoRate[]>([]);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth();

        const startStr = new Date(year, month, 1).toLocaleDateString("en-CA");
        const endStr = new Date(year, month + 1, 0).toLocaleDateString("en-CA");

        const fetchExpenses = supabase
          .from("expenses")
          .select("amount")
          .gte("date", startStr)
          .lte("date", endStr);

        let monoData: MonoRate[] | null = null;

        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CACHE_DURATION) {
            monoData = parsed.data;
          }
        }

        if (!monoData) {
          const response = await fetch("https://api.monobank.ua/bank/currency");
          if (!response.ok)
            throw new Error(`Monobank API Error: ${response.status}`);
          monoData = await response.json();
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              timestamp: Date.now(),
              data: monoData,
            })
          );
        }

        const { data: expensesData, error: expensesError } =
          await fetchExpenses;

        if (expensesError) throw new Error(expensesError.message);

        const total = (expensesData || []).reduce(
          (sum, item) => sum + item.amount,
          0
        );

        setRates(monoData || []);
        setTotalExpenses(total);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  const getRate = (code: number) => {
    return rates.find(r => r.currencyCodeA === code && r.currencyCodeB === 980);
  };

  const usdRateObj = getRate(840);
  const eurRateObj = getRate(978);

  const usdRate = usdRateObj?.rateSell || usdRateObj?.rateCross || 0;
  const eurRate = eurRateObj?.rateSell || eurRateObj?.rateCross || 0;

  const convertedUSD = usdRate ? totalExpenses / usdRate : 0;
  const convertedEUR = eurRate ? totalExpenses / eurRate : 0;

  if (loading) return <div className='p-4 text-gray-500'>Loading data...</div>;
  if (error) return <div className='p-4 text-red-500'>Error: {error}</div>;

  return (
    <div className='p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 max-w-sm mt-4'>
      <h2 className='text-xl font-bold mb-4 text-gray-800 dark:text-white'>
        Month Expenses
      </h2>

      <div className='flex flex-col gap-3'>
        <div className='flex justify-between items-center border-b dark:border-gray-700 pb-2'>
          <span className='text-gray-600 dark:text-gray-300 font-medium'>
            UAH:
          </span>
          <span className='text-lg font-bold text-gray-900 dark:text-white'>
            {totalExpenses.toFixed(0)} ₴
          </span>
        </div>

        <div className='flex justify-between items-center border-b dark:border-gray-700 pb-2'>
          <div className='flex flex-col'>
            <span className='text-gray-600 dark:text-gray-300 font-medium'>
              USD
            </span>
            <span className='text-xs text-gray-400'>Rate: {usdRate}</span>
          </div>
          <span className='text-lg font-bold text-green-600 dark:text-green-400'>
            ${convertedUSD.toFixed(2)}
          </span>
        </div>

        <div className='flex justify-between items-center'>
          <div className='flex flex-col'>
            <span className='text-gray-600 dark:text-gray-300 font-medium'>
              EUR
            </span>
            <span className='text-xs text-gray-400'>Rate: {eurRate}</span>
          </div>
          <span className='text-lg font-bold text-blue-600 dark:text-blue-400'>
            €{convertedEUR.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
