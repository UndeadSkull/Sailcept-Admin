import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiResponse } from "../data/auth";
import { Notification } from "../data/notifications";

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

async function saveState(updated: Notification[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save notifications to storage:", error);
  }
}

export async function fetchNotifications(): Promise<ApiResponse<Notification[]>> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { data: JSON.parse(stored), error: null };
    } else {
      await saveState(DEFAULT_NOTIFICATIONS);
      return { data: DEFAULT_NOTIFICATIONS, error: null };
    }
  } catch (err) {
    console.error(err);
    return {
      data: DEFAULT_NOTIFICATIONS,
      error: { message: "Failed to load notifications from storage.", code: "STORAGE_ERROR" },
    };
  }
}

export async function markNotificationRead(id: string, currentList: Notification[]): Promise<ApiResponse<Notification[]>> {
  const updated = currentList.map((n) => (n.id === id ? { ...n, read: true } : n));
  await saveState(updated);
  return { data: updated, error: null };
}

export async function markNotificationUnread(id: string, currentList: Notification[]): Promise<ApiResponse<Notification[]>> {
  const updated = currentList.map((n) => (n.id === id ? { ...n, read: false } : n));
  await saveState(updated);
  return { data: updated, error: null };
}

export async function markAllNotificationsRead(currentList: Notification[]): Promise<ApiResponse<Notification[]>> {
  const updated = currentList.map((n) => ({ ...n, read: true }));
  await saveState(updated);
  return { data: updated, error: null };
}

export async function respondToRequestNotification(
  id: string,
  outcome: "accepted" | "rejected",
  currentList: Notification[]
): Promise<ApiResponse<Notification[]>> {
  const updated = currentList.map((n) => (n.id === id ? { ...n, read: true, outcome } : n));
  await saveState(updated);
  return { data: updated, error: null };
}
