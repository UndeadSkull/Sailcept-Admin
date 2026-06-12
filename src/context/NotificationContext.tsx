import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type NotificationType =
  | "new_request"
  | "change_of_dates"
  | "cancellation"
  | "extra_added"
  | "booking_changes"
  | "reviews";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  date: string;
  timeGroup: "Today" | "Yesterday" | "Earlier";
  read: boolean;
  targetScreen: "Requests" | "Bookings" | "Reviews" | "More";
  targetParams?: any;
  outcome?: "accepted" | "rejected";
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAsUnread: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  respondToRequest: (id: string, outcome: "accepted" | "rejected") => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  isLoading: true,
  markAsRead: async () => {},
  markAsUnread: async () => {},
  markAllAsRead: async () => {},
  respondToRequest: async () => {},
});

const STORAGE_KEY = "@sailcept_admin_notifications_state";

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "new_request",
    title: "New Request Received",
    description: "Ethan Walker requested a Day cruise on Vembanad Crest for 15 Jan 2025.",
    date: "10 mins ago",
    timeGroup: "Today",
    read: false,
    targetScreen: "Requests",
  },
  {
    id: "n2",
    type: "change_of_dates",
    title: "Change of Dates Request",
    description: "Emma Collins requested to move her overnight stay to 22 Jan 2025.",
    date: "2 hours ago",
    timeGroup: "Today",
    read: false,
    targetScreen: "Requests",
  },
  {
    id: "n3",
    type: "cancellation",
    title: "Booking Cancelled",
    description: "Noah Parker cancelled booking #1042 for Kerala Dream on 09 Jan.",
    date: "Yesterday, 3:15 PM",
    timeGroup: "Yesterday",
    read: false,
    targetScreen: "Bookings",
    targetParams: { focusGuest: "Noah Parker", focusToken: 9 },
  },
  {
    id: "n4",
    type: "extra_added",
    title: "Extra Added after Booking",
    description: "Guest added 'Dinner Buffet (4 Pax)' to Booking #1093.",
    date: "Yesterday, 11:00 AM",
    timeGroup: "Yesterday",
    read: false,
    targetScreen: "Bookings",
    targetParams: { focusGuest: "Sofia Turner", focusToken: 1093 },
  },
  {
    id: "n5",
    type: "booking_changes",
    title: "Booking Details Updated",
    description: "Booking #1055 updated guest count from 2 to 4 adults.",
    date: "3 days ago",
    timeGroup: "Earlier",
    read: false,
    targetScreen: "Bookings",
    targetParams: { focusToken: 1055 },
  },
  {
    id: "n6",
    type: "reviews",
    title: "New 5-Star Review",
    description: "Sarah M.: 'Outstanding service and crew! Highly recommended.'",
    date: "5 days ago",
    timeGroup: "Earlier",
    read: false,
    targetScreen: "Reviews",
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load notifications on launch
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setNotifications(JSON.parse(stored));
        } else {
          // If no stored state, set default mock notifications and save them
          setNotifications(DEFAULT_NOTIFICATIONS);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
        }
      } catch (error) {
        console.error("Failed to load notifications from storage:", error);
        setNotifications(DEFAULT_NOTIFICATIONS);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const saveState = async (updated: Notification[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to save notifications to storage:", error);
    }
  };

  const markAsRead = async (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    await saveState(updated);
  };

  const markAsUnread = async (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: false } : n));
    setNotifications(updated);
    await saveState(updated);
  };

  const markAllAsRead = async () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    await saveState(updated);
  };

  const respondToRequest = async (id: string, outcome: "accepted" | "rejected") => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true, outcome } : n));
    setNotifications(updated);
    await saveState(updated);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
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
