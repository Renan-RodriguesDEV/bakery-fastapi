"use client";

import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Header() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, clearNotifications } =
    useNotifications();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  if (!user) return null;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="w-full mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink"
          >
            <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex-shrink-0">
              <span className="text-base sm:text-lg">🍞</span>
            </div>
            <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
              Padaria da Vila - Itaí/SP
            </h1>
          </Link>

          <nav className="hidden md:flex items-center gap-4 lg:gap-6 flex-shrink-0">
            {!user.is_admin && (
              <>
                <Link
                  href="/products"
                  className="text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium"
                >
                  Produtos
                </Link>
                <Link
                  href="/carts"
                  className="text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium"
                >
                  Carrinho
                </Link>
                <Link
                  href="/sales"
                  className="text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium"
                >
                  Minhas Compras
                </Link>
              </>
            )}

            {user.is_admin && (
              <>
                <Link
                  href="/products"
                  className="text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium"
                >
                  Produtos
                </Link>
                <Link
                  href="/users"
                  className="text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium"
                >
                  Usuários
                </Link>
                <Link
                  href="/sales"
                  className="text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium"
                >
                  Vendas
                </Link>
              </>
            )}
          </nav>

          {/* Desktop - User info e botões */}
          <div className="hidden md:flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Ícone de Notificações */}

            {user.is_admin && (
              <div className="relative">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="relative p-1.5 sm:p-2 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 px-4 py-2 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {user.username}
              </span>
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full ${
                  user.is_admin
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                }`}
              >
                {user.is_admin ? "Admin" : "Cliente"}
              </span>
            </div>

            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition duration-200"
            >
              Sair
            </button>
          </div>

          {/* Mobile - Menu hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition flex-shrink-0"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="px-4 py-3 space-y-2">
              {/* User Info */}
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-slate-700">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user.username}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-bold rounded-full ${
                    user.is_admin
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  }`}
                >
                  {user.is_admin ? "Admin" : "Cliente"}
                </span>
              </div>

              {/* Notificações para Admin */}
              {user.is_admin && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsModalOpen(true);
                  }}
                  className="w-full text-left py-2 px-2 text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium flex items-center justify-between hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                >
                  <span>🔔 Notificações</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                  router.push("/login");
                }}
                className="w-full mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition text-center"
              >
                🚪 Sair
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Modal de Notificações */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-96 flex flex-col">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Notificações
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="flex-1 overflow-y-auto p-4">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Nenhuma notificação
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg cursor-pointer transition ${
                        notification.read
                          ? "bg-gray-100 dark:bg-slate-700"
                          : "bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800"
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-1">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 dark:text-gray-200">
                            {notification.message}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                            {new Date(
                              notification.timestamp,
                            ).toLocaleTimeString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                <button
                  onClick={() => {
                    clearNotifications();
                    setIsModalOpen(false);
                  }}
                  className="w-full px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition"
                >
                  Limpar Notificações
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
