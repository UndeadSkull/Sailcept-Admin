import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../data/auth";
import { AUTH_TOKEN_KEY } from "../services/apiClient";
import { getOperatorProfile, loginOperator } from "../services/auth";

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (sailceptId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => {},
  logout: async () => {},
});

const USER_ID_KEY = "@sailcept_admin_user_id";
const SAILCEPT_ID_KEY = "@sailcept_admin_sailcept_id";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if token exists on app launch
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        const storedSailceptId = await AsyncStorage.getItem(SAILCEPT_ID_KEY);
        const storedUserId = await AsyncStorage.getItem(USER_ID_KEY);

        if (token) {
          setIsAuthenticated(true);
          const initialUser: User = {
            sailceptId: storedSailceptId || "Operator",
            boatOwnerUserId: storedUserId ? Number(storedUserId) : undefined,
            name: storedSailceptId || "Operator",
            email: storedSailceptId ? `${storedSailceptId.toLowerCase()}@sailcept.com` : "operator@sailcept.com",
            phone: "",
          };
          setUser(initialUser);

          // Attempt to fetch full profile asynchronously
          const profileRes = await getOperatorProfile();
          if (profileRes.data) {
            setUser({
              ...initialUser,
              ...profileRes.data,
            });
          }
        }
      } catch (error) {
        console.error("Error loading auth token:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (sailceptId: string, password: string) => {
    try {
      const response = await loginOperator({ sailceptId, password });

      if (response.error || !response.data) {
        throw new Error(response.error?.message || "Authentication failed. Please check your credentials.");
      }

      const { accessToken, boatOwnerUserId, sailceptId: returnedSailceptId } = response.data;
      const finalSailceptId = returnedSailceptId || sailceptId;

      await AsyncStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      await AsyncStorage.setItem(SAILCEPT_ID_KEY, finalSailceptId);
      if (boatOwnerUserId) {
        await AsyncStorage.setItem(USER_ID_KEY, String(boatOwnerUserId));
      }

      const newUser: User = {
        sailceptId: finalSailceptId,
        boatOwnerUserId,
        name: finalSailceptId,
        email: `${finalSailceptId.toLowerCase()}@sailcept.com`,
        phone: "",
      };

      setUser(newUser);
      setIsAuthenticated(true);

      // Attempt to load full profile details if available
      getOperatorProfile().then((profileRes) => {
        if (profileRes.data) {
          setUser((prev) => (prev ? { ...prev, ...profileRes.data } : prev));
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, SAILCEPT_ID_KEY, USER_ID_KEY]);
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
