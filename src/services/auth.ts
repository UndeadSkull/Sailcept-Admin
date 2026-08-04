import { ENDPOINTS } from "../config/api";
import { ApiResponse, LoginRequest, LoginResponse, ProfileResponse, User } from "../data/auth";
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

export async function fetchOperatorProfileApi(): Promise<ApiResponse<ProfileResponse>> {
  return apiClient.get<ProfileResponse>(ENDPOINTS.PROFILE);
}

export async function getOperatorProfile(): Promise<ApiResponse<User>> {
  const profileRes = await fetchOperatorProfileApi();
  if (profileRes.data) {
    const user: User = {
      sailceptId: profileRes.data.sailceptId,
      boatOwnerUserId: profileRes.data.userId || profileRes.data.ownerId,
      name: profileRes.data.ownerName || "Operator",
      phone: profileRes.data.contactPhone || "",
      email: profileRes.data.contactEmail || "",
    };
    return { data: user, error: null };
  }
  return apiClient.get<User>(ENDPOINTS.PROFILE);
}

export async function logoutUser(): Promise<ApiResponse<void>> {
  return { data: null, error: null };
}

export async function getCurrentUser(): Promise<ApiResponse<User>> {
  return getOperatorProfile();
}

