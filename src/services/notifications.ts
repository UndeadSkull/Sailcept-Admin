import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiResponse, PageResponse } from "../data/auth";
import { Notification } from "../data/notifications";
import { ENDPOINTS } from "../config/api";
import { apiClient } from "./apiClient";

const STORAGE_KEY = "@sailcept_admin_notifications_state";

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "cancellation",
    title: "Booking Cancelled",
    description: "Sophie Laurent cancelled booking ALP-12082026-0173 for Lake Riviera on 12 Aug 2026.",
    date: "MON 3 AUG 2026",
    timeGroup: "MON 3 AUG 2026",
    read: false,
    targetScreen: "Bookings",
  },
  {
    id: "n2",
    type: "booking_confirmed",
    title: "Booking Confirmed",
    description: "Booking ALP-30062026-0182 for Priyanka Reddy on Lake Ripples for 30 Jun 2026 has been confirmed.",
    date: "SUN 28 JUN 2026",
    timeGroup: "SUN 28 JUN 2026",
    read: false,
    targetScreen: "Bookings",
  },
  {
    id: "n3",
    type: "booking_confirmed",
    title: "New Added Booking",
    description: "Direct booking AB-28062026-4471 for Neha Kapoor on Lake Royale for 28 Jun 2026 was added.",
    date: "SUN 21 JUN 2026",
    timeGroup: "SUN 21 JUN 2026",
    read: false,
    targetScreen: "Bookings",
  },
  {
    id: "n4",
    type: "new_request",
    title: "New Booking Request",
    description: "Priya Nair requested an Overnight stay on Lake Riviera for 25 Jun 2026.",
    date: "THU 18 JUN 2026",
    timeGroup: "THU 18 JUN 2026",
    read: true,
    targetScreen: "Requests",
  },
  {
    id: "n5",
    type: "extra_added",
    title: "Special Request Added",
    description: "Guest added 'Honeymoon cake' request for booking ALP-15062026-0142.",
    date: "WED 17 JUN 2026",
    timeGroup: "WED 17 JUN 2026",
    read: true,
    targetScreen: "Bookings",
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
  const apiRes = await fetchNotificationsFeedApi();
  if (apiRes.data?.content) {
    const list: Notification[] = apiRes.data.content.map((item: any) => ({
      id: item.notificationId || item.id,
      type: item.type || item.notificationTypeCode || "new_request",
      title: item.title || "Notification",
      description: item.message || item.description || "",
      date: item.createdAt || new Date().toISOString(),
      timeGroup: item.createdAt || "",
      read: item.isRead !== undefined ? item.isRead : item.read,
      targetScreen: item.category === "REQUEST" ? "Requests" : "Bookings",
    }));
    return { data: list, error: null };
  }
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
  markNotificationReadApi(id).catch(() => {});
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
  markAllNotificationsReadApi().catch(() => {});
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

// -------------------------------------------------------------
// CANONICAL NOTIFICATION APIs (Sailcept Operator API Guide 2026)
// -------------------------------------------------------------

export async function fetchNotificationsFeedApi(params?: {
  readStatus?: "UNREAD" | "READ";
  month?: string;
  year?: number;
  page?: number;
  size?: number;
}): Promise<ApiResponse<PageResponse<any>>> {
  const queryParts: string[] = [`readStatus=${params?.readStatus || "UNREAD"}`];
  if (params?.month) queryParts.push(`month=${params.month}`);
  if (params?.year) queryParts.push(`year=${params.year}`);
  if (params?.page !== undefined) queryParts.push(`page=${params.page}`);
  if (params?.size !== undefined) queryParts.push(`size=${params.size}`);

  return apiClient.get<PageResponse<any>>(`${ENDPOINTS.NOTIFICATIONS}?${queryParts.join("&")}`);
}

export async function fetchUnreadNotificationCountApi(): Promise<ApiResponse<{ unreadCount: number }>> {
  return apiClient.get<{ unreadCount: number }>(ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT);
}

export async function fetchNotificationDetailApi(notificationId: string): Promise<ApiResponse<any>> {
  return apiClient.get<any>(`${ENDPOINTS.NOTIFICATIONS}/${notificationId}`);
}

export async function markNotificationReadApi(notificationId: string): Promise<ApiResponse<any>> {
  return apiClient.patch<any>(`${ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`);
}

export async function markAllNotificationsReadApi(): Promise<ApiResponse<any>> {
  return apiClient.patch<any>(ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ);
}

