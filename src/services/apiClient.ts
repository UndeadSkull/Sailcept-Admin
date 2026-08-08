import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/api";
import { ApiResponse } from "../data/auth";

export const AUTH_TOKEN_KEY = "@sailcept_admin_auth_token";

export type ApiFailureListener = (endpoint: string) => void;
const apiFailureListeners = new Set<ApiFailureListener>();

export function subscribeToApiFailure(listener: ApiFailureListener): () => void {
  apiFailureListeners.add(listener);
  return () => {
    apiFailureListeners.delete(listener);
  };
}

function notifyApiFailure(endpoint: string) {
  apiFailureListeners.forEach((listener) => {
    try {
      listener(endpoint);
    } catch (e) {
      console.error("Error in apiFailureListener:", e);
    }
  });
}

export type UnauthorizedListener = () => void;
const unauthorizedListeners = new Set<UnauthorizedListener>();

export function subscribeToUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
}

export async function handleLogout(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      AUTH_TOKEN_KEY,
      "@sailcept_admin_sailcept_id",
      "@sailcept_admin_user_id",
    ]);
  } catch (e) {
    console.error("Error clearing auth token on logout:", e);
  }
  unauthorizedListeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error("Error in unauthorizedListener:", e);
    }
  });
}

export type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string;
  skipAuth?: boolean;
};

export async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { body, headers, token, skipAuth, ...customConfig } = options;

  let authToken = token;
  if (!authToken && !skipAuth) {
    try {
      authToken = (await AsyncStorage.getItem(AUTH_TOKEN_KEY)) || undefined;
    } catch {
      // Ignore AsyncStorage error on auth lookup
    }
  }

  const reqHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(headers as Record<string, string>),
  };

  if (authToken) {
    reqHeaders["Authorization"] = `Bearer ${authToken}`;
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const fullUrl = cleanEndpoint.startsWith("http")
    ? cleanEndpoint
    : `${API_BASE_URL.replace(/\/+$/, "")}${cleanEndpoint}`;

  const config: RequestInit = {
    ...customConfig,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : undefined,
  };

  try {
    const response = await fetch(fullUrl, config);
    let data: unknown = null;

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { message: text } : null;
    }

    if (!response.ok) {
      if (response.status === 401) {
        await handleLogout();
      }

      const errObj = data as { message?: string; error?: string; code?: string } | null;
      const errorMessage =
        errObj?.message ||
        errObj?.error ||
        `Request failed with status ${response.status}`;
      
      notifyApiFailure(cleanEndpoint);

      return {
        data: null,
        error: {
          message: errorMessage,
          code: errObj?.code || `HTTP_${response.status}`,
        },
      };
    }

    return {
      data: data as T,
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error occurred";
    
    notifyApiFailure(cleanEndpoint);

    return {
      data: null,
      error: {
        message,
        code: "NETWORK_ERROR",
      },
    };
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "POST", body }),
  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PUT", body }),
  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PATCH", body }),
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};
