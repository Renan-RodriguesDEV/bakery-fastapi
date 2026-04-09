"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

function generateNotificationId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchProductMissingStock = async () => {
    const urlAPI = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    // Função para buscar produtos com estoque baixo
    // Pode ser implementada uma chamada à API aqui
    console.log("[WebSocket] Verificando produtos com estoque baixo...");
    const response = await fetch(`${urlAPI}/ws/check/stock`);
    if (response.ok) {
      console.log("[WebSocket] Verificação de estoque concluída.");
      return await response.json();
    } else {
      console.error("[WebSocket] Falha ao verificar estoque.");
      throw new Error("Falha ao verificar estoque");
    }
  };
  const fetchProductValidityIsNext = async () => {
    const urlAPI = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    // Função para buscar produtos com validade próxima/vencida
    // Pode ser implementada uma chamada à API aqui
    console.log(
      "[WebSocket] Verificando produtos com validade próxima/vencida...",
    );
    const response = await fetch(`${urlAPI}/ws/check/validity`);
    if (response.ok) {
      console.log("[WebSocket] Verificação de validade concluída.");
      return await response.json();
    } else {
      console.error("[WebSocket] Falha ao verificar validade.");
      throw new Error("Falha ao verificar validade");
    }
  };
  // Conecta ao WebSocket apenas uma vez, no mount do provider
  useEffect(() => {
    const urlAPI =
      process.env.NEXT_PUBLIC_API_URL?.replace("http", "ws") ||
      "ws://localhost:8000";
    const wsUrl = `${urlAPI}/ws/stock`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log("[WebSocket] Conectado ao servidor de notificações");
    };

    websocket.onmessage = (event) => {
      // Ignora PING
      if (event.data === "PING") {
        console.log("[WebSocket] Ping recebido");
        return;
      }

      console.log("[WebSocket] Notificação recebida:", event.data);

      const notification: Notification = {
        id: generateNotificationId(),
        message: event.data,
        timestamp: new Date(),
        read: false,
      };

      setNotifications((prev) => [notification, ...prev]);
    };

    websocket.onerror = (error) => {
      console.error("[WebSocket] Erro:", error);
    };

    websocket.onclose = () => {
      console.log("[WebSocket] Desconectado");
      // Tenta reconectar após 5 segundos
      setTimeout(() => {
        console.log("[WebSocket] Tentando reconectar...");
      }, 5000);
    };

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, []);

  // Verifica estoque e validade a cada 24h
  useEffect(() => {
    const checkProductStatus = async () => {
      try {
        await fetchProductMissingStock();
        await fetchProductValidityIsNext();
      } catch (error) {
        console.error(
          "[WebSocket] Erro ao verificar status dos produtos:",
          error,
        );
      }
    };

    // Executa na primeira vez imediatamente
    checkProductStatus();

    // Depois executa a cada 24h
    const intervalId = setInterval(checkProductStatus, 3600000 * 24);

    return () => clearInterval(intervalId);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications deve ser usado dentro de NotificationProvider",
    );
  }
  return context;
}
