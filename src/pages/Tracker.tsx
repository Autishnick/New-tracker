import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useExpenseStats } from "../hooks/useExpenseStats";
import { supabase } from "../supabaseClient";
interface Expense {
  id: string;
  amount: number;
  date: string;
}

export default function Tracker({ session }: { session: Session | null }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekExpense, setWeekExpense] = useState<Expense[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [newAmount, setNewAmount] = useState<{ [key: string]: string }>({});

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString("uk-UA");
  };

  const getWeekDays = (baseDate: Date) => {
    const start = getStartOfWeek(baseDate);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays(currentDate);
  const startOfWeekStr = formatDate(weekDays[0]);
  const endOfWeekStr = formatDate(weekDays[6]);

  const { periodTotal: weekTotal, refreshStats } = useExpenseStats(
    session,
    startOfWeekStr,
    endOfWeekStr
  );

  useEffect(() => {
    if (!session) return;
    const fetchList = async () => {
      setLoadingList(true);
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .gte("date", startOfWeekStr)
        .lte("date", endOfWeekStr)
        .order("date", { ascending: true });

      if (error) console.error(error);
      else setWeekExpense(data || []);
      setLoadingList(false);
    };
    fetchList();
  }, [session, startOfWeekStr, endOfWeekStr]);

  const addExpense = async (dateStr: string) => {
    const amountStr = newAmount[dateStr];
    if (!amountStr || isNaN(parseFloat(amountStr))) return;
    const amount = parseFloat(amountStr);

    if (amount <= 0) {
      toast.error("Amount must be >0");
      return;
    }

    const { data, error } = await supabase
      .from("expenses")
      .insert([{ user_id: session?.user.id, date: dateStr, amount: amount }])
      .select();

    if (error) {
      toast.error("Error: " + error.message);
    } else if (data) {
      setWeekExpense([...weekExpense, data[0]]);
      setNewAmount({ ...newAmount, [dateStr]: "" });
      refreshStats();
    }
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id);

    if (error) {
      toast.error("Error: " + error.message);
    } else {
      setWeekExpense(weekExpense.filter(item => item.id !== id));
      refreshStats();
    }
  };

  const changeWeek = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  if (loadingList) return <div>Loading...</div>;

  return (
    <div>
      <div className='flex justify-center'>
        <button onClick={() => changeWeek(-7)}>←Previous week</button>
        <h2 className='pl-4 pr-4'>
          {formatDisplayDate(weekDays[0])} - {formatDisplayDate(weekDays[6])}
        </h2>
        <button onClick={() => changeWeek(7)}>Next week→</button>
      </div>

      <div className='flex justify-center flex-col items-center pt-8 pb-8'>
        <h2 className='text-xl font-bold'>
          Week Expense: {weekTotal.toFixed(2)} UAH
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
          gap: "10px",
        }}
      >
        {weekDays.map(dayObj => {
          const dateStr = formatDate(dayObj);
          const isToday = dateStr === formatDate(new Date());
          const dayExpenses = weekExpense.filter(ex => ex.date === dateStr);
          const daySum = dayExpenses.reduce((sum, ex) => sum + ex.amount, 0);

          return (
            <div
              key={dateStr}
              style={{
                border: isToday ? "2px solid #007bff" : "1px solid #ddd",
                padding: "10px",
                borderRadius: "8px",
                background: "#fff",
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                {dayObj.toLocaleDateString("en-US", { weekday: "long" })} <br />
                <span style={{ fontSize: "0.8em", color: "#666" }}>
                  {formatDisplayDate(dayObj)}
                </span>
              </div>

              <div
                style={{
                  minHeight: "50px",
                  fontSize: "0.9em",
                  marginBottom: "10px",
                }}
              >
                {dayExpenses.map(ex => (
                  <div
                    key={ex.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "4px",
                    }}
                  >
                    <span style={{ color: "red" }}>-{ex.amount}</span>
                    <button
                      onClick={() => deleteExpense(ex.id)}
                      style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        color: "#999",
                        padding: "0 5px",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {dayExpenses.length === 0 && (
                  <div style={{ color: "#ccc" }}>-</div>
                )}
              </div>

              <div
                style={{
                  borderTop: "1px solid #eee",
                  paddingTop: "5px",
                  fontWeight: "bold",
                }}
              >
                Total: {daySum.toFixed(2)}
              </div>

              <div style={{ marginTop: "10px" }}>
                <input
                  type='number'
                  min='0'
                  placeholder='Amount'
                  value={newAmount[dateStr] || ""}
                  onChange={e =>
                    setNewAmount({ ...newAmount, [dateStr]: e.target.value })
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    marginBottom: "5px",
                  }}
                />
                <button
                  onClick={() => addExpense(dateStr)}
                  style={{
                    width: "100%",
                    fontSize: "0.8em",
                    cursor: "pointer",
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
