'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

export interface Notification {
  id: number;
  user_id: number;
  type: 'stock' | 'payment';
  title: string;
  message: string;
  is_read: boolean;
  related_id: number | null;
  created_at: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_BASE_URL = API_BASE_URL.replace('http', 'ws');

export function useNotifications(userId: number | null, token: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);

  // Fetch existing notifications
  const fetchNotifications = useCallback(async () => {
    if (!token || !userId) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, userId]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: number) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [token]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/mark-all-read`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [token]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: number) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        setNotifications((prev) => {
          const notification = prev.find((n) => n.id === notificationId);
          if (notification && !notification.is_read) {
            setUnreadCount((count) => Math.max(0, count - 1));
          }
          return prev.filter((n) => n.id !== notificationId);
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [token]);

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (!userId || isConnectingRef.current || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    isConnectingRef.current = true;

    try {
      const ws = new WebSocket(`${WS_BASE_URL}/notifications/ws/${userId}`);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        isConnectingRef.current = false;
        
        // Send ping every 30 seconds to keep connection alive
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send('ping');
          }
        }, 30000);
        
        ws.addEventListener('close', () => {
          clearInterval(pingInterval);
        });
      };

      ws.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          
          // Add new notification to the list
          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        isConnectingRef.current = false;
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        isConnectingRef.current = false;
        wsRef.current = null;
        
        // Reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      isConnectingRef.current = false;
    }
  }, [userId]);

  // Initial fetch and WebSocket connection
  useEffect(() => {
    if (userId && token) {
      fetchNotifications();
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [userId, token, fetchNotifications, connectWebSocket]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
}
