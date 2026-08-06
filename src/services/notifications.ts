import { ApiResponse, PageResponse } from "../data/auth";
import { Notification } from "../data/notifications";
import { ENDPOINTS } from "../config/api";
import { apiClient } from "./apiClient";

export async function fetchNotifications(): Promise<ApiResponse<Notification[]>> {
  const apiRes = await fetchNotificationsFeedApi();
  if (apiRes.data?.content) {
    const list: Notification[] = apiRes.data.content.map((item: any) => ({
      id: String(item.notificationId || item.id),
      type: item.type || item.notificationTypeCode || "new_request",
      title: item.title || "Notification",
      description: item.message || item.description || "",
      date: item.createdAt || new Date().toISOString(),
      timeGroup: item.createdAt || "",
      read: item.isRead !== undefined ? item.isRead : Boolean(item.read),
      targetScreen: item.category === "REQUEST" ? "Requests" : "Bookings",
    }));
    return { data: list, error: null };
  }
  return { data: apiRes.data ? [] : null, error: apiRes.error };
}

export async function markNotificationRead(id: string, currentList: Notification[]): Promise<ApiResponse<Notification[]>> {
  await markNotificationReadApi(id);
  const updated = currentList.map((n) => (n.id === id ? { ...n, read: true } : n));
  return { data: updated, error: null };
}

export async function markNotificationUnread(id: string, currentList: Notification[]): Promise<ApiResponse<Notification[]>> {
  const updated = currentList.map((n) => (n.id === id ? { ...n, read: false } : n));
  return { data: updated, error: null };
}

export async function markAllNotificationsRead(currentList: Notification[]): Promise<ApiResponse<Notification[]>> {
  await markAllNotificationsReadApi();
  const updated = currentList.map((n) => ({ ...n, read: true }));
  return { data: updated, error: null };
}

export async function respondToRequestNotification(
  id: string,
  outcome: "accepted" | "rejected",
  currentList: Notification[]
): Promise<ApiResponse<Notification[]>> {
  const updated = currentList.map((n) => (n.id === id ? { ...n, read: true, outcome } : n));
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
