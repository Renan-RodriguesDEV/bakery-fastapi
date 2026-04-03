"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // 🔍 DEBUG: Monitorar estado na página home
  useEffect(() => {
    console.log(
      `[HOME] isLoading: ${isLoading}, isAuthenticated: ${isAuthenticated}, user: ${!!user}`,
    );

    if (!isLoading && !isAuthenticated) {
      console.log(
        `[HOME] Usuário não autenticado! Redirecionando para login...`,
      );
      router.push("/login");
    }
  });

  // 🔍 DEBUG: Verificar quando está no loading
  if (isLoading) {
    console.log(`[HOME] Renderizando loading spinner...`);
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // 🔍 DEBUG: Verificar se não está autenticado
  if (!isAuthenticated || !user) {
    console.log(
      `[HOME] Não autenticado ou usuário não carregado. isAuthenticated: ${isAuthenticated}, user: ${!!user}`,
    );
    return null;
  }

  console.log(`[HOME] Renderizando home page para usuário: ${user.name}`);

  // Funcionalidades para Cliente
  const clientFeatures = [
    {
      icon: "🛍️",
      title: "Meus Produtos",
      description: "Veja todos os produtos disponíveis para compra",
      href: "/products",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: "🛒",
      title: "Meu Carrinho",
      description: "Gerenciar itens do seu carrinho de compras",
      href: "/carts",
      color: "from-green-500 to-green-600",
    },
    {
      icon: "📋",
      title: "Minhas Compras",
      description: "Acompanhe o histórico de suas compras",
      href: "/sales",
      color: "from-purple-500 to-purple-600",
    },
  ];

  // Funcionalidades para Administrador
  const adminFeatures = [
    {
      icon: "📈",
      title: "Dashboard de Vendas",
      description: "Visualizar gráficos e estatísticas de arrecadação",
      href: "/admin/dashboard",
      color: "from-cyan-500 to-sky-600",
    },
    {
      icon: "📦",
      title: "Gerenciar Produtos",
      description: "Criar, atualizar e deletar produtos do catálogo",
      href: "/products",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: "👥",
      title: "Gerenciar Usuários",
      description: "Administrar usuários do sistema",
      href: "/users",
      color: "from-red-500 to-red-600",
    },
    {
      icon: "💰",
      title: "Histórico de Vendas",
      description: "Acompanhar todas as vendas realizadas",
      href: "/sales",
      color: "from-green-500 to-green-600",
    },
    {
      icon: "📊",
      title: "Gerenciar Vendas",
      description: "Criar, editar e gerenciar vendas do sistema",
      href: "/admin/sales",
      color: "from-amber-500 to-orange-600",
    },
  ];

  const features = user.is_admin ? adminFeatures : clientFeatures;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Main Content */}
      <main className="w-full mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-12 lg:py-16 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 break-words">
            Bem-vindo, <span className="break-all">{user.username}</span>! 👋
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
            {user.is_admin
              ? "Você está logado como administrador. Aqui você pode gerenciar todos os aspectos do sistema."
              : "Você está logado como cliente. Aqui você pode visualizar produtos e gerenciar suas compras."}
          </p>
        </div>

        {/* Role-Based Info Section */}
        <div className="mb-6 sm:mb-12 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            ℹ️ Informações da sua Conta
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-700 dark:to-slate-700 rounded-xl p-6 border border-blue-200 dark:border-slate-600">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Email
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {user.username}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-700 rounded-xl p-6 border border-green-200 dark:border-slate-600">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Tipo de Usuário
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {user.is_admin ? "👑 Administrador" : "👤 Cliente"}
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-8">
            {user.is_admin
              ? "⚙️ Funções Administrativas"
              : "🎯 Funcionalidades"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature) => (
              <Link key={feature.href} href={feature.href}>
                <div className="h-full bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 sm:transform sm:hover:scale-105 border border-gray-200 dark:border-slate-700 overflow-hidden cursor-pointer group">
                  {/* Icon Background */}
                  <div
                    className={`bg-gradient-to-br ${feature.color} h-20 sm:h-24 flex items-center justify-center text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-300`}
                  >
                    {feature.icon}
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-6">
                    <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-amber-500 group-hover:to-orange-500 group-hover:bg-clip-text transition-all break-words">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">
                      {feature.description}
                    </p>

                    {/* Arrow */}
                    <div className="flex items-center text-amber-500 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                      Acessar
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Restrictions Section */}
        <div className="mt-16 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-8">
          <h4 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-4">
            🎯 Dicas para Aproveitar
          </h4>
          {user.is_admin ? (
            <ul className="space-y-2 text-blue-800 dark:text-blue-300">
              <li className="flex items-center gap-2">
                <span className="text-lg">📦</span>
                <span>
                  <strong>Gerenciar Produtos:</strong> Acesse a seção de
                  produtos para criar, editar ou deletar itens do catálogo.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-lg">👥</span>
                <span>
                  <strong>Gerenciar Usuários:</strong> Visualize e administre
                  todos os usuários do sistema.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-lg">💰</span>
                <span>
                  <strong>Acompanhar Vendas:</strong> Monitore todas as
                  transações e vendas realizadas.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-lg">📊</span>
                <span>
                  <strong>Gerenciar Vendas:</strong> Crie, edite e gerencie
                  vendas do sistema de forma completa.
                </span>
              </li>
            </ul>
          ) : (
            <ul className="space-y-2 text-blue-800 dark:text-blue-300">
              <li className="flex items-center gap-2">
                <span className="text-lg">🛍️</span>
                <span>
                  <strong>Explorar Produtos:</strong> Veja todo o catálogo de
                  produtos disponíveis para compra.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-lg">🛒</span>
                <span>
                  <strong>Carrinho Inteligente:</strong> Adicione produtos ao
                  carrinho e customize as quantidades conforme necessário.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-lg">📋</span>
                <span>
                  <strong>Histórico de Compras:</strong> Acompanhe todas as suas
                  compras anteriores e pedidos.
                </span>
              </li>
            </ul>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600 dark:text-gray-400">
          <p>
            © 2026 Padaria da Vila by @Renan Rodrigues. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
