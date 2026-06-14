import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../data/auth";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => {},
  logout: async () => {},
});

const AUTH_TOKEN_KEY = "@sailcept_admin_auth_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if token exists on app launch
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
          setIsAuthenticated(true);
          setUser({
            name: "Ethan Walker",
            phone: "+1 415 555 0134",
            email: "ethan.walker@sailcept.com",
          });
        }
      } catch (error) {
        console.error("Error loading auth token:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // Simulate network request delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      // Save dummy token in AsyncStorage
      const dummyToken = `dummy-token-${username}-${Date.now()}`;
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, dummyToken);
      setUser({
        name: "Ethan Walker",
        phone: "+1 415 555 0134",
        email: "ethan.walker@sailcept.com",
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error setting auth token:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error clearing auth token:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
