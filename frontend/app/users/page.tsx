"use client";

import { useAuth } from "@/hooks/useAuth";
import { usersApi } from "@/lib/api/users";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Backbutton } from "@/app/components/Backbutton";

interface User {
  id: number;
  name: string;
  username: string;
  telephone: string | null;
  is_admin: boolean;
  created_at: string;
}

interface FormData {
  name: string;
  username: string;
  password: string;
  telephone: string;
  is_admin: boolean;
}

export default function UsersPage() {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Estados principais
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Estados do modal
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    username: "",
    password: "",
    telephone: "",
    is_admin: false,
  });

  // Estados de confirmação de exclusão
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirecionar se não é admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.is_admin)) {
      router.push("/");
    }
  }, [isAuthenticated, user, isLoading, authLoading, router]);

  // Carregar usuários
  const loadUsers = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError("");

    try {
      const data = await usersApi.getAllUsers(token);
      setUsers(data);
    } catch (err: any) {
      setError("Erro ao carregar usuários");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.is_admin && token) {
      loadUsers();
    }
  }, [token, user, loadUsers]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      username: "",
      password: "",
      telephone: "",
      is_admin: false,
    });
    setEditingUser(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (userToEdit: User) => {
    if (userToEdit.is_admin) {
      setError("Usuários admin não podem ser editados por esta tela.");
      return;
    }
    setEditingUser(userToEdit);
    setFormData({
      name: userToEdit.name,
      username: userToEdit.username,
      password: "",
      telephone: userToEdit.telephone || "",
      is_admin: userToEdit.is_admin,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      // Validações
      if (!formData.name.trim()) {
        setError("Nome é obrigatório");
        setIsSaving(false);
        return;
      }

      if (!formData.username.trim()) {
        setError("Email é obrigatório");
        setIsSaving(false);
        return;
      }

      if (!editingUser && !formData.password) {
        setError("Senha é obrigatória para novo usuário");
        setIsSaving(false);
        return;
      }

      if (formData.password && formData.password.length < 6) {
        setError("Senha deve ter no mínimo 6 caracteres");
        setIsSaving(false);
        return;
      }

      if (editingUser) {
        // Atualizar usuário
        const updateData: any = {
          name: formData.name,
          username: formData.username,
          telephone: formData.telephone || undefined,
        };

        if (formData.password) {
          updateData.password = formData.password;
        }

        const response = await usersApi.updateUser(
          editingUser.id,
          updateData,
          token!,
        );

        if (response.error) {
          throw new Error(response.detail || "Erro ao atualizar usuário");
        }

        setSuccess("Usuário atualizado com sucesso!");
        setShowModal(false);
        loadUsers();
      } else {
        // Criar novo usuário
        const response = await usersApi.createUser({
          name: formData.name,
          username: formData.username,
          password: formData.password,
          telephone: formData.telephone || undefined,
          is_admin: formData.is_admin,
        });

        if (response.error) {
          throw new Error(response.detail || "Erro ao criar usuário");
        }

        setSuccess("Usuário criado com sucesso!");
        setShowModal(false);
        loadUsers();
      }

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar usuário");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (userToDelete: User) => {
    setUserToDelete(userToDelete);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      const success = await usersApi.deleteUser(userToDelete.id, token!);

      if (!success) {
        throw new Error("Erro ao deletar usuário");
      }

      setSuccess("Usuário deletado com sucesso!");
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      loadUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Erro ao deletar usuário");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtrar usuários
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="z-40 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            👥 Gerenciar Usuários
          </h1>
          <Backbutton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 rounded-lg text-green-700 dark:text-green-200 flex items-center gap-2">
            <span>✅</span>
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded-lg text-red-700 dark:text-red-200 flex items-center gap-2">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg transition"
          >
            ➕ Novo Usuário
          </button>
        </div>

        {/* Users Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-12 border border-gray-200 dark:border-slate-700 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Nenhum usuário encontrado
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm
                ? "Tente ajustar seus critérios de busca"
                : "Crie seu primeiro usuário clicando no botão abaixo"}
            </p>
            {!searchTerm && (
              <button
                onClick={openCreateModal}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg transition"
              >
                ➕ Novo Usuário
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Nome
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Telefone
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                        {u.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {u.username}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {u.telephone || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {u.is_admin ? (
                          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold">
                            👑 Admin
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                            👤 Cliente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {u.is_admin ? (
                          <span className="inline-flex px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg font-medium">
                            Protegido
                          </span>
                        ) : (
                          <div className="space-x-2 flex">
                            <button
                              onClick={() => openEditModal(u)}
                              className="px-3 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg transition font-medium"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => handleDeleteClick(u)}
                              className="px-3 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg transition font-medium"
                            >
                              🗑️ Deletar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingUser ? "✏️ Editar Usuário" : "➕ Novo Usuário"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {editingUser
                    ? "Nova Senha (deixe em branco para manter)"
                    : "Senha *"}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required={!editingUser}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Telefone (opcional)
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_admin"
                      checked={formData.is_admin}
                      onChange={handleInputChange}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Administrador
                    </span>
                  </label>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold rounded-lg transition"
                >
                  {isSaving ? "Salvando..." : "💾 Salvar"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-white font-semibold rounded-lg transition"
                >
                  ✖️ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              ⚠️ Confirmar Exclusão
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Tem certeza que deseja deletar o usuário?
            </p>
            <p className="text-gray-900 dark:text-white font-semibold mb-6">
              {userToDelete.name} ({userToDelete.username})
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setUserToDelete(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-white font-semibold rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
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
