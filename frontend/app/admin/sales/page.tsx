"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Backbutton } from "@/app/components/Backbutton";
import { salesApi } from "@/lib/api/sales";
import { productsApi, Product } from "@/lib/api/products";
import { usersApi } from "@/lib/api/users";

interface User {
  id: number;
  name: string;
  username: string;
  telephone?: string;
  is_admin: boolean;
}

interface Sale {
  id: number;
  user_id: number;
  product_id: number;
  count: number;
  value: number;
  user: {
    name: string;
    username: string;
  };
  product: {
    name: string;
    price: number;
    category: {
      id: number;
      name: string;
    };
  };
  was_paid: boolean;
  created_at: string;
}

export default function AdminSalesPage() {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Estados principais
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estados do modal
  const [showModal, setShowModal] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState({
    user_id: 0,
    product_id: 0,
    count: 1,
    was_paid: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Estados do modal de exclusão
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtros
  const [filterByUser, setFilterByUser] = useState<number | null>(null);
  const [filterByPayment, setFilterByPayment] = useState<
    "all" | "paid" | "pending"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Redirecionar se não é admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.is_admin)) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Carregar dados
  const loadData = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError("");

    try {
      const [salesData, productsData, usersData] = await Promise.all([
        salesApi.getAllSales(token),
        productsApi.getAllProducts(token),
        usersApi.getAllUsers(token),
      ]);

      setSales(Array.isArray(salesData) ? salesData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);

      // Inicializar form
      if (usersData.length > 0) {
        setFormData((prev) => ({
          ...prev,
          user_id: usersData[0].id,
        }));
      }
      if (productsData.length > 0) {
        setFormData((prev) => ({
          ...prev,
          product_id: productsData[0].id,
        }));
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar dados";
      console.error("Erro ao carregar dados:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token && user?.is_admin) {
      loadData();
    }
  }, [token, user, loadData]);

  // Abrir modal para criar venda
  const openCreateModal = () => {
    setEditingSale(null);
    setFormData({
      user_id: users.length > 0 ? users[0].id : 0,
      product_id: products.length > 0 ? products[0].id : 0,
      count: 1,
      was_paid: false,
    });
    setShowModal(true);
  };

  // Abrir modal para editar venda
  const openEditModal = (sale: Sale) => {
    setEditingSale(sale);
    setFormData({
      user_id: sale.user_id,
      product_id: sale.product_id,
      count: sale.count,
      was_paid: sale.was_paid,
    });
    setShowModal(true);
  };

  // Salvar venda (criar ou atualizar)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    // Validar campos obrigatórios
    if (!formData.user_id || !formData.product_id) {
      setError("Cliente e Produto são obrigatórios");
      return;
    }

    if (formData.count <= 0) {
      setError("Quantidade deve ser maior que 0");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingSale) {
        // Atualizar venda (PUT) - atualizar todos os campos
        const updateData = {
          user_id: formData.user_id,
          product_id: formData.product_id,
          count: formData.count,
          was_paid: formData.was_paid,
        };

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/sales/update/${editingSale.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          },
        );

        if (!response.ok) {
          throw new Error("Erro ao atualizar venda");
        }

        const updatedSale = await response.json();
        setSales(sales.map((s) => (s.id === updatedSale.id ? updatedSale : s)));
        setSuccess("Venda atualizada com sucesso!");
      } else {
        // Criar venda
        const response = await salesApi.createSale(formData, token);

        if (response.error || response.detail) {
          throw new Error(
            response.detail || response.error || "Erro ao criar venda",
          );
        }

        setSales([...sales, response]);
        setSuccess("Venda criada com sucesso!");
      }

      setShowModal(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao salvar venda";
      console.error("Erro ao salvar venda:", err);
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Abrir modal de confirmação para deletar
  const openDeleteModal = (sale: Sale) => {
    setSaleToDelete(sale);
    setShowDeleteModal(true);
  };

  // Deletar venda
  const handleDelete = async () => {
    if (!token || !saleToDelete) return;

    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sales/delete/${saleToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao deletar venda");
      }

      setSales(sales.filter((s) => s.id !== saleToDelete.id));
      setSuccess("Venda deletada com sucesso!");
      setShowDeleteModal(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao deletar venda";
      console.error("Erro ao deletar venda:", err);
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtrar vendas
  const filteredSales = sales.filter((sale) => {
    let matches = true;

    if (filterByUser && sale.user_id !== filterByUser) {
      matches = false;
    }

    if (filterByPayment === "paid" && !sale.was_paid) {
      matches = false;
    }

    if (filterByPayment === "pending" && sale.was_paid) {
      matches = false;
    }

    if (
      searchTerm &&
      !sale.product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !sale.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      matches = false;
    }

    return matches;
  });

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Carregando vendas...
          </p>
        </div>
      </div>
    );
  }

  if (!user?.is_admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">
            Acesso negado. Apenas administradores podem gerenciar vendas.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-6">
      <Backbutton />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gerenciar Vendas
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Adicione, edite e remova vendas de clientes
        </p>
      </div>

      {/* Mensagens de erro e sucesso */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/20 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 dark:bg-green-500/10 border border-green-300 dark:border-green-500/20 rounded-lg text-green-700 dark:text-green-400">
          {success}
        </div>
      )}

      {/* Filtros e botão de criar */}
      <div className="bg-white dark:bg-slate-800/50 backdrop-blur border border-gray-200 dark:border-slate-700/50 rounded-xl p-4 sm:p-6 mb-6">
        {/* Busca */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por cliente ou produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600/50 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Filtro por cliente */}
          <select
            value={filterByUser || ""}
            onChange={(e) =>
              setFilterByUser(e.target.value ? Number(e.target.value) : null)
            }
            className="px-3 py-2 bg-gray-100 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600/50 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-amber-500/50 truncate"
            title={users.find((u) => u.id === filterByUser)?.name}
          >
            <option value="">Clientes</option>
            {[...users]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((u) => (
                <option key={u.id} value={u.id} title={u.name}>
                  {u.name}
                </option>
              ))}
          </select>

          {/* Filtro por pagamento */}
          <select
            value={filterByPayment}
            onChange={(e) =>
              setFilterByPayment(e.target.value as "all" | "paid" | "pending")
            }
            className="px-3 py-2 bg-gray-100 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600/50 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">Todas</option>
            <option value="pending">Pendentes</option>
            <option value="paid">Pagas</option>
          </select>

          {/* Botão de criar */}
          <button
            onClick={openCreateModal}
            className="col-span-2 sm:col-span-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm sm:text-base rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            + Venda
          </button>
        </div>
      </div>

      {/* Tabela de vendas */}
      <div className="bg-white dark:bg-slate-800/50 backdrop-blur border border-gray-200 dark:border-slate-700/50 rounded-xl overflow-hidden">
        {filteredSales.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <p className="text-lg mb-2">Nenhuma venda encontrada</p>
            <p className="text-sm">Crie uma nova venda para começar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Produto
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Qtd
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Data
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-b border-gray-200 dark:border-slate-700/30 hover:bg-gray-100 dark:hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {sale.user.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {sale.product.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white">
                      {sale.count}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-amber-600 dark:text-amber-400 font-medium">
                      R$ {sale.value.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          sale.was_paid
                            ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                            : "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                        }`}
                      >
                        {sale.was_paid ? "✓ Paga" : "⏳ Pendente"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-400">
                      {new Date(sale.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditModal(sale)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => openDeleteModal(sale)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Deletar"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de criar/editar venda */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingSale ? "Editar Venda" : "Nova Venda"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cliente *
                </label>
                <select
                  value={formData.user_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      user_id: Number(e.target.value),
                    })
                  }
                  required
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600/50 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-amber-500/50"
                >
                  <option value="">Selecione um cliente</option>
                  {[...users]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.username})
                      </option>
                    ))}
                </select>
              </div>

              {/* Produto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Produto *
                </label>
                <select
                  value={formData.product_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      product_id: Number(e.target.value),
                    })
                  }
                  required
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600/50 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-amber-500/50"
                >
                  <option value="">Selecione um produto</option>
                  {[...products]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - R$ {p.price.toFixed(2)}
                      </option>
                    ))}
                </select>
              </div>

              {/* Quantidade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantidade *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.count || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      count: Number(e.target.value) || 0,
                    })
                  }
                  required
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600/50 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Status de pagamento */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="was_paid"
                  checked={formData.was_paid}
                  onChange={(e) =>
                    setFormData({ ...formData, was_paid: e.target.checked })
                  }
                  className="w-4 h-4 rounded accent-amber-500"
                />
                <label
                  htmlFor="was_paid"
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  Marcar como paga
                </label>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                >
                  {isSaving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmação para deletar */}
      {showDeleteModal && saleToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Deletar Venda
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Tem certeza que deseja deletar a venda de{" "}
              <span className="font-semibold">{saleToDelete.product.name}</span>{" "}
              para{" "}
              <span className="font-semibold">{saleToDelete.user.name}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                {isDeleting ? "Deletando..." : "Deletar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
