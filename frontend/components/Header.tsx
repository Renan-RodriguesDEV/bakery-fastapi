"use client";

import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationBell } from "./NotificationBell";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Header() {
  const { user, logout, token } = useAuth();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    setAccessToken(token);
  }, [token]);

  const { 
    notifications, 
    unreadCount, 
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification 
  } = useNotifications(user?.id || null, accessToken);

  if (!user) return null;

  return (
    <header className="z-40 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl">
            <span className="text-lg">🍞</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Padaria FastAPI
          </h1>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
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

        <div className="flex items-center gap-4">
          {/* Notification Bell - Only for admins */}
          {user.is_admin && (
            <NotificationBell
              unreadCount={unreadCount}
              notifications={notifications}
              isLoading={isLoading}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onDelete={deleteNotification}
            />
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
            onClick={logout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition duration-200"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
