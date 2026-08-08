import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Notification } from "../data/notifications";
import {
  fetchNotifications,
  markNotificationRead,
  markNotificationUnread,
  markAllNotificationsRead,
  respondToRequestNotification,
} from "../services/notifications";
import { useAuth } from "./AuthContext";

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAsUnread: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  respondToRequest: (id: string, outcome: "accepted" | "rejected") => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  isLoading: true,
  refreshNotifications: async () => {},
  markAsRead: async () => {},
  markAsUnread: async () => {},
  markAllAsRead: async () => {},
  respondToRequest: async () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetchNotifications();
      if (response.data && !response.error) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error("Failed to load notifications from service:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load notifications only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshNotifications();
    } else {
      setNotifications([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, refreshNotifications]);

  const markAsRead = async (id: string) => {
    try {
      const response = await markNotificationRead(id, notifications);
      if (response.data && !response.error) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAsUnread = async (id: string) => {
    try {
      const response = await markNotificationUnread(id, notifications);
      if (response.data && !response.error) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error("Failed to mark notification as unread:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await markAllNotificationsRead(notifications);
      if (response.data && !response.error) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const respondToRequest = async (id: string, outcome: "accepted" | "rejected") => {
    try {
      const response = await respondToRequestNotification(id, outcome, notifications);
      if (response.data && !response.error) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error("Failed to respond to request notification:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        refreshNotifications,
        markAsRead,
        markAsUnread,
        markAllAsRead,
        respondToRequest,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
