import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phoneNumber: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

const AUTH_TOKEN_KEY = "@sailcept_admin_auth_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if token exists on app launch
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error loading auth token:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (phoneNumber: string) => {
    try {
      // Simulate network request/verification delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      // Save dummy token in AsyncStorage
      const dummyToken = `dummy-token-${phoneNumber}-${Date.now()}`;
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, dummyToken);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error setting auth token:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error clearing auth token:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
