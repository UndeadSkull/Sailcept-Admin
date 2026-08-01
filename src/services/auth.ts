import { ENDPOINTS } from "../config/api";
import { ApiResponse, LoginRequest, LoginResponse, User } from "../data/auth";
import { apiClient } from "./apiClient";

export async function loginOperator(
  credentials: LoginRequest
): Promise<ApiResponse<LoginResponse>> {
  return apiClient.post<LoginResponse>(
    ENDPOINTS.AUTH_LOGIN,
    {
      sailceptId: credentials.sailceptId.trim(),
      password: credentials.password,
    },
    { skipAuth: true }
  );
}

export async function getOperatorProfile(): Promise<ApiResponse<User>> {
  return apiClient.get<User>(ENDPOINTS.PROFILE);
}

export async function logoutUser(): Promise<ApiResponse<void>> {
  return { data: null, error: null };
}

export async function getCurrentUser(): Promise<ApiResponse<User>> {
  return getOperatorProfile();
}
