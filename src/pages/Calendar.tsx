import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

interface Expense {
  amount: number;
  date: string;
}

export default function Calendar({ session }: { session: Session | null }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthlyExpenses, setMonthlyExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const formatDateLocal = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (y: number, m: number) => {
    const day = new Date(y, m, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(
      currentDate.setMonth(currentDate.getMonth() + offset)
    );
    setCurrentDate(new Date(newDate));
  };

  useEffect(() => {
    if (!session) return;

    const fetchMonthData = async () => {
      setLoading(true);

      const startDateObj = new Date(year, month, 1);
      const endDateObj = new Date(year, month + 1, 0);

      const startStr = formatDateLocal(startDateObj);
      const endStr = formatDateLocal(endDateObj);

      const { data, error } = await supabase
        .from("expenses")
        .select("date, amount")
        .gte("date", startStr)
        .lte("date", endStr);

      if (!error) {
        setMonthlyExpenses(data || []);
      }
      setLoading(false);
    };

    fetchMonthData();
  }, [currentDate, session, year, month]);

  const daysInMonth = getDaysInMonth(year, month);
  const paddingDays = getFirstDayOfMonth(year, month);

  const weekDayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getExpenseForDay = (dayNumber: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      dayNumber
    ).padStart(2, "0")}`;

    return monthlyExpenses
      .filter(ex => ex.date === dateStr)
      .reduce((sum, ex) => sum + ex.amount, 0);
  };

  const totalMonthlyExpenses = monthlyExpenses.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );

  return (
    <div className='max-w-4xl mx-auto p-4'>
      <div className='flex flex-col gap-4 mb-6'>
        <div className='flex justify-between items-center'>
          <button
            onClick={() => changeMonth(-1)}
            className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300'
          >
            ← Prev
          </button>

          <h2 className='text-2xl font-bold'>
            {currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h2>

          <button
            onClick={() => changeMonth(1)}
            className='px-4 py-2 bg-gray-200 rounded hover:bg-gray-300'
          >
            Next →
          </button>
        </div>

        <div className='bg-red-50 border border-red-200 rounded p-4 text-center'>
          <span className='text-gray-700 font-medium mr-2'>
            Total expenses for this month:
          </span>
          <span className='text-2xl font-bold text-red-600'>
            -{totalMonthlyExpenses.toFixed(0)} ₴
          </span>
        </div>
      </div>

      {loading ? (
        <div className='text-center py-10 text-gray-500'>Loading data...</div>
      ) : (
        <div className='border rounded-lg overflow-hidden shadow'>
          <div className='grid grid-cols-7 bg-gray-100 border-b'>
            {weekDayNames.map(day => (
              <div
                key={day}
                className='p-2 text-center font-semibold text-sm text-gray-600 truncate'
              >
                {day}
              </div>
            ))}
          </div>

          <div className='grid grid-cols-7 bg-white'>
            {Array.from({ length: paddingDays }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className='h-24 border-b border-r bg-gray-50'
              />
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const dayNum = index + 1;
              const dailyTotal = getExpenseForDay(dayNum);

              const isToday =
                dayNum === new Date().getDate() &&
                month === new Date().getMonth() &&
                year === new Date().getFullYear();

              return (
                <div
                  key={dayNum}
                  className={`h-24 border-b border-r p-2 flex flex-col justify-between transition hover:bg-gray-50 cursor-default ${
                    isToday ? "bg-blue-50 ring-2 ring-blue-200 inset-0" : ""
                  }`}
                >
                  <span
                    className={`text-sm font-medium ${
                      isToday ? "text-blue-600" : "text-gray-700"
                    }`}
                  >
                    {dayNum}
                  </span>

                  {dailyTotal > 0 && (
                    <div className='text-right'>
                      <span className='inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-bold'>
                        -{dailyTotal.toFixed(0)} ₴
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
