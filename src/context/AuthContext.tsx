import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, ApiResponse } from "../data/auth";
import { loginWithPhone, verifyOtpCode, logoutUser } from "../services/auth";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (phoneNumber: string) => Promise<ApiResponse<void>>;
  verifyOtp: (phoneNumber: string, code: string) => Promise<ApiResponse<{ token: string; user: User }>>;
  logout: () => Promise<ApiResponse<void>>;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => ({ data: null, error: { message: "Not implemented" } }),
  verifyOtp: async () => ({ data: null, error: { message: "Not implemented" } }),
  logout: async () => ({ data: null, error: { message: "Not implemented" } }),
});

const AUTH_TOKEN_KEY = "@sailcept_admin_auth_token";
const AUTH_USER_KEY = "@sailcept_admin_auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if token and user exist on app launch
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
          const storedUser = await AsyncStorage.getItem(AUTH_USER_KEY);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            setUser({
              name: "Manager",
              phone: "+15555555555",
              email: "manager@sailcept.com",
            });
          }
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error loading auth status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (phoneNumber: string): Promise<ApiResponse<void>> => {
    try {
      const response = await loginWithPhone(phoneNumber);
      return response;
    } catch (error) {
      console.error("Error setting auth token:", error);
      return { data: null, error: { message: "An unexpected error occurred." } };
    }
  };

  const verifyOtp = async (phoneNumber: string, code: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    try {
      const response = await verifyOtpCode(phoneNumber, code);
      if (response.data && !response.error) {
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.data.user));
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
      return response;
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return { data: null, error: { message: "An unexpected verification error occurred." } };
    }
  };

  const logout = async (): Promise<ApiResponse<void>> => {
    try {
      const response = await logoutUser();
      if (!response.error) {
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        await AsyncStorage.removeItem(AUTH_USER_KEY);
        setUser(null);
        setIsAuthenticated(false);
      }
      return response;
    } catch (error) {
      console.error("Error clearing auth token:", error);
      return { data: null, error: { message: "An unexpected error occurred during logout." } };
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
