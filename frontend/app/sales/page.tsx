"use client";

import { salesApi } from "@/lib/api/sales";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { Backbutton } from "@/app/components/Backbutton";

interface Sale {
  id: number;
  user_id: number;
  product_id: number;
  count: number;
  value: number;
  user: {
    name: string;
    username: string;
    password: string;
    telephone?: string;
  };
  product: {
    name: string;
    price: number;
    category: {
      id: number;
      name: string;
    };
    validity: string;
  };
  was_paid: boolean;
  created_at: string;
}

export default function SalesPage() {
  const { user, isLoading, token } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSales, setSelectedSales] = useState<Set<number>>(new Set());
  const [filterByUser, setFilterByUser] = useState<number | null>(null);
  const [filterByPayment, setFilterByPayment] = useState<
    "all" | "paid" | "pending"
  >("all");
  const [sortBy, setSortBy] = useState<
    "date" | "status" | "client" | "pending"
  >("date");
  const [marking, setMarking] = useState(false);
  const [paymentLinks, setPaymentLinks] = useState<Record<number, string>>({});
  const [loadingPayment, setLoadingPayment] = useState<Set<number>>(new Set());
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [selectedSaleForPickup, setSelectedSaleForPickup] =
    useState<Sale | null>(null);
  const [loadingPickup, setLoadingPickup] = useState(false);

  const handleRequestPickup = async (sale: Sale) => {
    if (!token) return;

    setLoadingPickup(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/i-go-get/${sale.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao solicitar retirada");
      }

      setSelectedSaleForPickup(sale);
      setShowPickupModal(true);
    } catch (err) {
      console.error("Erro ao solicitar retirada:", err);
      setError("Erro ao solicitar retirada. Tente novamente.");
    } finally {
      setLoadingPickup(false);
    }
  };

  const handleGeneratePaymentLink = async (saleId: number) => {
    if (!token) return;

    try {
      setLoadingPayment((prev) => new Set(prev).add(saleId));
      setError(null);

      const sale = sales.find((s) => s.id === saleId);
      if (!sale) {
        setError("Venda nao encontrada");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/${saleId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "Pagamento de Venda",
            quantity: 1,
            unit_price: sale.value,
          }),
        },
      );

      if (!response.ok) {
        console.log("Response not ok:", response);
        throw new Error("Erro ao gerar link de pagamento");
      }

      const data = await response.json();
      console.log("Payment link data:", data);
      const initPoint = data.data.payment.init_point;

      setPaymentLinks((prev) => ({
        ...prev,
        [saleId]: initPoint,
      }));
    } catch (err) {
      console.error("Erro ao gerar link de pagamento:", err);
      setError("Erro ao gerar link de pagamento. Tente novamente.");
    } finally {
      setLoadingPayment((prev) => {
        const newSet = new Set(prev);
        newSet.delete(saleId);
        return newSet;
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedSales.size === sortedSales.length) {
      setSelectedSales(new Set());
    } else {
      const allIds = new Set(sortedSales.map((s) => s.id));
      setSelectedSales(allIds);
    }
  };

  const filteredSales = filterByUser
    ? sales.filter((s) => s.user_id === filterByUser)
    : sales;

  const paymentFilteredSales = filteredSales.filter((s) => {
    if (filterByPayment === "paid") return s.was_paid;
    if (filterByPayment === "pending") return !s.was_paid;
    return true;
  });

  const sortedSales = [...paymentFilteredSales].sort((a, b) => {
    if (sortBy === "date") {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    if (sortBy === "status") {
      if (a.was_paid === b.was_paid) {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      return a.was_paid ? 1 : -1;
    }
    if (sortBy === "pending") {
      if (a.was_paid === b.was_paid) {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      return a.was_paid ? 1 : -1;
    }
    if (sortBy === "client") {
      const nameA = a.user.name.toUpperCase();
      const nameB = b.user.name.toUpperCase();
      if (nameA !== nameB) {
        return nameA.localeCompare(nameB);
      }
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return 0;
  });

  useEffect(() => {
    const loadSalesData = async () => {
      if (!token || !user) return;

      try {
        setLoadingData(true);
        setError(null);

        const data = user.is_admin
          ? await salesApi.getAllSales(token)
          : await salesApi.getSalesFiltered({ user_id: user.id }, token);

        setSales(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao carregar vendas:", err);
        setError("Erro ao carregar vendas. Tente novamente.");
        setSales([]);
      } finally {
        setLoadingData(false);
      }
    };

    loadSalesData();
  }, [token, user]);

  const handleMarkAsPaid = async (type: "single" | "user" | "all") => {
    if (!token) return;

    try {
      setMarking(true);
      setError(null);

      if (type === "single" && selectedSales.size > 0) {
        await salesApi.markMultipleSalesAsPaid(
          Array.from(selectedSales),
          token,
        );
      } else if (type === "user" && filterByUser) {
        const userSales = sales
          .filter((s) => s.user_id === filterByUser && !s.was_paid)
          .map((s) => s.id);
        if (userSales.length > 0) {
          await salesApi.markMultipleSalesAsPaid(userSales, token);
        }
      } else if (type === "all") {
        const unpaidSales = sales.filter((s) => !s.was_paid).map((s) => s.id);
        if (unpaidSales.length > 0) {
          await salesApi.markMultipleSalesAsPaid(unpaidSales, token);
        }
      } else {
        setError("Selecione vendas para marcar como paga");
        return;
      }

      // Recarregar dados após marcar como pago
      setLoadingData(true);
      try {
        const updatedSales = user?.is_admin
          ? await salesApi.getAllSales(token)
          : await salesApi.getSalesFiltered({ user_id: user?.id }, token);
        setSales(Array.isArray(updatedSales) ? updatedSales : []);
      } catch (err) {
        console.error("Erro ao recarregar vendas:", err);
      } finally {
        setLoadingData(false);
      }
      setSelectedSales(new Set());
      setFilterByUser(null);
    } catch (err) {
      console.error("Erro ao marcar como pago:", err);
      setError("Erro ao marcar vendas como pagas. Tente novamente.");
    } finally {
      setMarking(false);
    }
  };

  if (isLoading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const uniqueUsers = Array.from(
    new Map(sales.map((s) => [s.user_id, s.user])).values(),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="z-40 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {user?.is_admin ? "💰 Histórico de Vendas" : "📋 Minhas Compras"}
          </h1>
          <Backbutton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg text-red-700 dark:text-red-200">
            ⚠️ {error}
          </div>
        )}

        {sales.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-12 border border-gray-200 dark:border-slate-700 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {user?.is_admin
                ? "Nenhuma venda registrada"
                : "Você ainda não fez nenhuma compra"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {user?.is_admin
                ? "As vendas aparecerão aqui quando houver transações no sistema."
                : "Comece a explorar nossos produtos e faça sua primeira compra!"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Controles de Admin */}
            {user?.is_admin && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Filtrar por Cliente
                    </label>
                    <select
                      value={filterByUser || ""}
                      onChange={(e) =>
                        setFilterByUser(
                          e.target.value ? parseInt(e.target.value) : null,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Todos os clientes</option>
                      {[...uniqueUsers]
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((u) => (
                          <option
                            key={u.name}
                            value={
                              sales.find((s) => s.user.name === u.name)?.user_id
                            }
                          >
                            {u.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status de Pagamento
                    </label>
                    <select
                      value={filterByPayment}
                      onChange={(e) =>
                        setFilterByPayment(
                          e.target.value as "all" | "paid" | "pending",
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">Todas</option>
                      <option value="paid">✓ Pagas</option>
                      <option value="pending">⏳ Pendentes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ordenar por
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(
                          e.target.value as
                            | "date"
                            | "status"
                            | "client"
                            | "pending",
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    >
                      <option value="date">📅 Data (Recente)</option>
                      <option value="pending">⏳ Pendentes Primeiro</option>
                      <option value="status">✓ Status</option>
                      <option value="client">👤 Cliente</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleMarkAsPaid("all")}
                    disabled={
                      marking ||
                      sortedSales.filter((s) => !s.was_paid).length === 0
                    }
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
                  >
                    {marking ? "Processando..." : "✓ Marcar TODAS como Pago"}
                  </button>

                  {filterByUser && (
                    <>
                      <button
                        onClick={() => handleMarkAsPaid("user")}
                        disabled={
                          marking ||
                          !sortedSales.some(
                            (s) => s.user_id === filterByUser && !s.was_paid,
                          )
                        }
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
                      >
                        {marking
                          ? "Processando..."
                          : "✓ Marcar Cliente como Pago"}
                      </button>
                      <button
                        onClick={() => setFilterByUser(null)}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                      >
                        Limpar Filtro
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Controles para Cliente */}
            {!user?.is_admin && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status de Pagamento
                    </label>
                    <select
                      value={filterByPayment}
                      onChange={(e) =>
                        setFilterByPayment(
                          e.target.value as "all" | "paid" | "pending",
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">Todas</option>
                      <option value="paid">✓ Pagas</option>
                      <option value="pending">⏳ Pendentes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ordenar por
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(
                          e.target.value as
                            | "date"
                            | "status"
                            | "client"
                            | "pending",
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    >
                      <option value="date">📅 Data (Recente)</option>
                      <option value="pending">⏳ Pendentes Primeiro</option>
                      <option value="status">✓ Status</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            {!user?.is_admin && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl shadow-lg p-6 border border-blue-200 dark:border-blue-700">
                <div className="flex gap-4">
                  <div className="text-4xl">ℹ️</div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
                      Como funciona o pagamento
                    </h3>
                    <p className="text-blue-800 dark:text-blue-300">
                      1. Clique em <strong>&quot;Gerar Link&quot;</strong> para
                      criar um link de pagamento único
                      <br />
                      2. Clique em <strong>
                        &quot;Ir ao Checkout&quot;
                      </strong>{" "}
                      para abrir a tela de pagamento no Mercado Pago
                      <br />
                      3. Após o pagamento aprovado, sua compra será marcada como
                      paga automaticamente
                      <br />
                      Você poderá acompanhar o status aqui em &quot;⏳
                      Pendentes&quot; ou &quot;✓ Pagas&quot;.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-slate-700">
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                      <thead className="bg-gray-50 dark:bg-slate-900">
                        <tr>
                          {user?.is_admin && (
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={
                                  selectedSales.size === sortedSales.length &&
                                  sortedSales.length > 0
                                }
                                onChange={handleSelectAll}
                                className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 cursor-pointer"
                              />
                            </th>
                          )}
                          <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                            #ID
                          </th>
                          {user?.is_admin && (
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                              Usuário
                            </th>
                          )}
                          <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                            Produto
                          </th>
                          <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                            Qtde
                          </th>
                          <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                            Valor
                          </th>
                          <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                            Status
                          </th>
                          <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                            Data
                          </th>
                          {user?.is_admin && (
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                              Ação
                            </th>
                          )}
                          {!user?.is_admin && (
                            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                              Pagamento
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                        {sortedSales.map((sale) => (
                          <tr
                            key={sale.id}
                            className="hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                          >
                            {user?.is_admin && (
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 dark:text-gray-300 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedSales.has(sale.id)}
                                  onChange={() => {
                                    const newSelected = new Set(selectedSales);
                                    if (newSelected.has(sale.id)) {
                                      newSelected.delete(sale.id);
                                    } else {
                                      newSelected.add(sale.id);
                                    }
                                    setSelectedSales(newSelected);
                                  }}
                                  disabled={sale.was_paid}
                                  className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                              </td>
                            )}
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 dark:text-gray-300 whitespace-nowrap">
                              #{sale.id}
                            </td>
                            {user?.is_admin && (
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 dark:text-gray-300 max-w-[120px] truncate">
                                {sale.user.name}
                              </td>
                            )}
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 dark:text-gray-300 max-w-[150px] truncate">
                              {sale.product.name}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 dark:text-gray-300 whitespace-nowrap">
                              {sale.count}x
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                              R$ {sale.value.toFixed(2)}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm whitespace-nowrap">
                              <span
                                className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap ${
                                  sale.was_paid
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                    : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                                }`}
                              >
                                {sale.was_paid ? "✓" : "⏳"}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {new Date(sale.created_at).toLocaleDateString(
                                "pt-BR",
                                { day: "2-digit", month: "2-digit" },
                              )}
                            </td>
                            {user?.is_admin && (
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm whitespace-nowrap">
                                {!sale.was_paid && (
                                  <button
                                    onClick={() => {
                                      setSelectedSales(new Set([sale.id]));
                                      handleMarkAsPaid("single");
                                    }}
                                    disabled={marking}
                                    className="px-2 sm:px-3 py-1 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white rounded text-[10px] sm:text-xs font-medium transition"
                                  >
                                    {marking ? "..." : "Pagar"}
                                  </button>
                                )}
                              </td>
                            )}
                            {!user?.is_admin && (
                              <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm whitespace-nowrap">
                                <div className="flex flex-row gap-2 items-center flex-wrap">
                                  {!sale.was_paid && !paymentLinks[sale.id] ? (
                                    <button
                                      onClick={() =>
                                        handleGeneratePaymentLink(sale.id)
                                      }
                                      disabled={loadingPayment.has(sale.id)}
                                      className="px-2 sm:px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-[10px] sm:text-xs font-medium transition whitespace-nowrap"
                                    >
                                      {loadingPayment.has(sale.id)
                                        ? "Gerando..."
                                        : "Gerar Link"}
                                    </button>
                                  ) : null}

                                  {!sale.was_paid && paymentLinks[sale.id] ? (
                                    <a
                                      href={paymentLinks[sale.id]}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                                    >
                                      💳 Ir ao Checkout
                                    </a>
                                  ) : null}

                                  <button
                                    onClick={() => handleRequestPickup(sale)}
                                    disabled={loadingPickup}
                                    className="px-2 sm:px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded text-[10px] sm:text-xs font-medium transition whitespace-nowrap"
                                  >
                                    {loadingPickup ? "..." : "📦 Retirar"}
                                  </button>

                                  {sale.was_paid ? (
                                    <span className="px-2 sm:px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-[10px] sm:text-xs font-semibold">
                                      ✓ Pago
                                    </span>
                                  ) : null}
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Botão de ação para múltiplas seleções */}
            {user?.is_admin && selectedSales.size > 0 && (
              <div className="fixed bottom-8 right-8 bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 border border-gray-200 dark:border-slate-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {selectedSales.size} venda(s) selecionada(s)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMarkAsPaid("single")}
                    disabled={marking}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition"
                  >
                    {marking ? "Processando..." : "✓ Marcar como Pago"}
                  </button>
                  <button
                    onClick={() => setSelectedSales(new Set())}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            )}

            {/* Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Total de Transações
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {sortedSales.length}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Valor Total
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  R${" "}
                  {sortedSales.reduce((sum, s) => sum + s.value, 0).toFixed(2)}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Pagos
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {sortedSales.filter((s) => s.was_paid).length}/
                  {sortedSales.length}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Pendentes
                </p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {sortedSales.filter((s) => !s.was_paid).length}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {showPickupModal && selectedSaleForPickup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-fuchsia-700 px-6 py-8 text-white">
              <div className="text-center">
                <div className="text-5xl mb-3">✅</div>
                <h2 className="text-2xl font-bold">Retirada Solicitada</h2>
                <p className="text-purple-100 mt-2">
                  O vendedor foi notificado por e-mail.
                </p>
              </div>
            </div>

            <div className="px-6 py-6 space-y-4">
              <div className="bg-purple-50 dark:bg-slate-700/40 rounded-xl p-4 border border-purple-200 dark:border-slate-600">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Informacoes da venda
                </h3>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex justify-between gap-4">
                    <span>Pedido:</span>
                    <span className="font-semibold">
                      #{selectedSaleForPickup.id}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Produto:</span>
                    <span className="font-semibold text-right">
                      {selectedSaleForPickup.product.name}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Quantidade:</span>
                    <span className="font-semibold">
                      {selectedSaleForPickup.count}x
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Valor:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      R$ {selectedSaleForPickup.value.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Local de retirada
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Dirija-se a loja fisica para retirar seu pedido e informe o
                  numero da venda ao atendente.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Horario sugerido: Segunda a Sexta, das 8h as 18h.
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  ✓ Solicitacao enviada com sucesso. Em breve o vendedor entrara
                  em contato, se necessario.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-700/50 px-6 py-4">
              <button
                onClick={() => {
                  setShowPickupModal(false);
                  setSelectedSaleForPickup(null);
                }}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
