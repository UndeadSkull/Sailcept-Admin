import { ENDPOINTS } from "../config/api";
import { ApiResponse } from "../data/auth";
import { apiClient } from "./apiClient";

export type DeliveryMethods = {
  pushEnabled: boolean;
  smsEnabled: boolean;
};

export type NotificationPreferenceItem = {
  notificationTypeId: number;
  code: string;
  displayName: string;
  isMandatory: boolean;
  enabled: boolean;
};

export type NotificationSettingsGroup = {
  categoryName: string;
  items: NotificationPreferenceItem[];
};

export type NotificationSettingsResponse = {
  deliveryMethods: DeliveryMethods;
  groups: NotificationSettingsGroup[];
};

export type DndSettingsResponse = {
  dndEnabled: boolean;
  fromTime: string;
  untilTime: string;
  repeatDays: string[];
  timezone: string;
};

export async function fetchNotificationSettings(): Promise<ApiResponse<NotificationSettingsResponse>> {
  return apiClient.get<NotificationSettingsResponse>(ENDPOINTS.SETTINGS_NOTIFICATIONS);
}

export async function updateNotificationSettings(payload: {
  deliveryMethods?: Partial<DeliveryMethods>;
  preferences?: Array<{ notificationTypeId: number; enabled: boolean }>;
}): Promise<ApiResponse<NotificationSettingsResponse>> {
  return apiClient.patch<NotificationSettingsResponse>(ENDPOINTS.SETTINGS_NOTIFICATIONS, payload);
}

export async function fetchDndSettings(): Promise<ApiResponse<DndSettingsResponse>> {
  return apiClient.get<DndSettingsResponse>(ENDPOINTS.SETTINGS_DND);
}

export async function updateDndSettings(
  payload: DndSettingsResponse
): Promise<ApiResponse<DndSettingsResponse>> {
  return apiClient.put<DndSettingsResponse>(ENDPOINTS.SETTINGS_DND, payload);
}
