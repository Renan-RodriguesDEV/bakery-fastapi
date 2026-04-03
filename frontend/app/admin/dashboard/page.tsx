"use client";

import { useAuth } from "@/hooks/useAuth";
import { salesApi } from "@/lib/api/sales";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type PeriodMode = "month" | "day";

interface Sale {
  id: number;
  count: number;
  value: number;
  was_paid: boolean;
  created_at: string;
}

const monthOptions = [
  { label: "3 meses", value: 3 },
  { label: "6 meses", value: 6 },
  { label: "12 meses", value: 12 },
];

const dayOptions = [
  { label: "30 dias", value: 30 },
  { label: "15 dias", value: 15 },
  { label: "7 dias", value: 7 },
];

const currency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);

export default function AdminDashboardPage() {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<PeriodMode>("month");
  const [selectedMonths, setSelectedMonths] = useState(3);
  const [selectedDays, setSelectedDays] = useState(30);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.is_admin)) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router, user]);

  useEffect(() => {
    const loadSales = async () => {
      if (!token || !user?.is_admin) return;

      setIsLoading(true);
      setError("");
      try {
        const result = await salesApi.getAllSales(token);
        setSales(Array.isArray(result) ? result : []);
      } catch {
        setError("Não foi possível carregar as vendas.");
      } finally {
        setIsLoading(false);
      }
    };

    loadSales();
  }, [token, user]);

  const rangeStart = useMemo(() => {
    const base = new Date();
    if (mode === "month") {
      const start = new Date(
        base.getFullYear(),
        base.getMonth() - selectedMonths + 1,
        1,
      );
      start.setHours(0, 0, 0, 0);
      return start;
    }
    const start = new Date(base);
    start.setDate(base.getDate() - selectedDays + 1);
    start.setHours(0, 0, 0, 0);
    return start;
  }, [mode, selectedDays, selectedMonths]);

  const filteredSales = useMemo(
    () => sales.filter((sale) => new Date(sale.created_at) >= rangeStart),
    [rangeStart, sales],
  );

  const summary = useMemo(() => {
    const totalSales = filteredSales.length;
    const itemsSold = filteredSales.reduce(
      (acc, sale) => acc + Number(sale.count || 0),
      0,
    );
    const grossRevenue = filteredSales.reduce(
      (acc, sale) => acc + Number(sale.value || 0),
      0,
    );
    const paidRevenue = filteredSales
      .filter((sale) => sale.was_paid)
      .reduce((acc, sale) => acc + Number(sale.value || 0), 0);

    return {
      totalSales,
      itemsSold,
      grossRevenue,
      paidRevenue,
      averageTicket: totalSales ? grossRevenue / totalSales : 0,
    };
  }, [filteredSales]);

  const chartData = useMemo(() => {
    const buckets: {
      key: string;
      label: string;
      revenue: number;
      orders: number;
    }[] = [];
    const now = new Date();

    if (mode === "month") {
      for (let i = selectedMonths - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        buckets.push({
          key,
          label: date.toLocaleDateString("pt-BR", {
            month: "short",
            year: "2-digit",
          }),
          revenue: 0,
          orders: 0,
        });
      }

      filteredSales.forEach((sale) => {
        const date = new Date(sale.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const bucket = buckets.find((item) => item.key === key);
        if (bucket) {
          bucket.revenue += Number(sale.value || 0);
          bucket.orders += 1;
        }
      });
    } else {
      for (let i = selectedDays - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const key = date.toISOString().slice(0, 10);
        buckets.push({
          key,
          label: date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          }),
          revenue: 0,
          orders: 0,
        });
      }

      filteredSales.forEach((sale) => {
        const date = new Date(sale.created_at);
        const key = date.toISOString().slice(0, 10);
        const bucket = buckets.find((item) => item.key === key);
        if (bucket) {
          bucket.revenue += Number(sale.value || 0);
          bucket.orders += 1;
        }
      });
    }

    return buckets;
  }, [filteredSales, mode, selectedDays, selectedMonths]);

  const maxRevenue = Math.max(...chartData.map((item) => item.revenue), 1);
  const maxOrders = Math.max(...chartData.map((item) => item.orders), 1);
  const orderAxisSteps = 4;

  const orderPoints = chartData
    .map((item, index) => {
      const x =
        chartData.length === 1 ? 0 : (index / (chartData.length - 1)) * 100;
      const y = 100 - (item.orders / maxOrders) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 rounded-full border-b-2 border-amber-500 animate-spin" />
      </div>
    );
  }

  if (!user?.is_admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Dashboard de Vendas
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Resumo de performance para acompanhamento de vendas e arrecadação.
          </p>

          <div className="mt-5 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Meses
              </span>
              {monthOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setMode("month");
                    setSelectedMonths(option.value);
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                    mode === "month" && selectedMonths === option.value
                      ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100"
                      : "bg-white text-slate-700 border-slate-300 hover:border-slate-400 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                Dias
              </span>
              {dayOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setMode("day");
                    setSelectedDays(option.value);
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                    mode === "day" && selectedDays === option.value
                      ? "bg-amber-500 text-white border-amber-500"
                      : "bg-white text-slate-700 border-slate-300 hover:border-slate-400 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total de vendas
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {summary.totalSales}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Itens vendidos
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {summary.itemsSold}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Arrecadação
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {currency(summary.grossRevenue)}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Receita paga
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {currency(summary.paidRevenue)}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ticket médio
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {currency(summary.averageTicket)}
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">
              Arrecadação por período
            </h2>
            <div className="h-64 flex items-end gap-2">
              {chartData.map((item) => (
                <div
                  key={item.key}
                  className="flex-1 min-w-0 h-full flex flex-col items-center justify-end gap-2"
                >
                  <div
                    className="w-full bg-amber-400/90 hover:bg-amber-500 transition rounded-t-md"
                    style={{
                      minHeight: "3px",
                      height: `${(item.revenue / maxRevenue) * 100}%`,
                    }}
                    title={`${item.label}: ${currency(item.revenue)}`}
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">
              Quantidade de vendas
            </h2>
            <div className="h-64 w-full rounded-xl bg-slate-50 dark:bg-slate-800 p-3 flex gap-3">
              <div className="h-full flex flex-col justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                {Array.from({ length: orderAxisSteps + 1 }).map((_, index) => {
                  const value = Math.round(
                    maxOrders - (maxOrders / orderAxisSteps) * index,
                  );
                  return <span key={index}>{value}</span>;
                })}
              </div>

              <svg viewBox="0 0 100 100" className="w-full h-full">
                {Array.from({ length: orderAxisSteps + 1 }).map((_, index) => {
                  const y = (index / orderAxisSteps) * 100;
                  return (
                    <line
                      key={index}
                      x1="0"
                      y1={y}
                      x2="100"
                      y2={y}
                      stroke="rgb(148 163 184)"
                      strokeOpacity="0.35"
                      strokeDasharray="2 2"
                    />
                  );
                })}

                <polyline
                  fill="none"
                  stroke="rgb(59 130 246)"
                  strokeWidth="2"
                  points={orderPoints}
                />
                {chartData.map((item, index) => {
                  const x =
                    chartData.length === 1
                      ? 0
                      : (index / (chartData.length - 1)) * 100;
                  const y = 100 - (item.orders / maxOrders) * 100;
                  return (
                    <circle
                      key={item.key}
                      cx={x}
                      cy={y}
                      r="1.5"
                      fill="rgb(59 130 246)"
                    >
                      <title>{`${item.label}: ${item.orders} vendas`}</title>
                    </circle>
                  );
                })}
              </svg>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
