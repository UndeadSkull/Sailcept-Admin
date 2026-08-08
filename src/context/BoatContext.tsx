import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { fetchBoats } from "../services/boats";
import { BoatListItem } from "../data/boats";
import { requests } from "../services/bookings";
import { useAuth } from "./AuthContext";

type BoatContextValue = {
  boats: BoatListItem[];
  isLoading: boolean;
  refreshBoats: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  requestsCount: number;
  refreshRequestsCount: () => void;
};

const BoatContext = createContext<BoatContextValue>({
  boats: [],
  isLoading: true,
  refreshBoats: async () => {},
  searchQuery: "",
  setSearchQuery: () => {},
  searchOpen: false,
  setSearchOpen: () => {},
  requestsCount: 0,
  refreshRequestsCount: () => {},
});

export function BoatProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [boats, setBoats] = useState<BoatListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [requestsCount, setRequestsCount] = useState<number>(requests.length);

  const refreshRequestsCount = useCallback(() => {
    setRequestsCount(requests.length);
  }, []);

  const loadBoats = useCallback(async () => {
    if (!isAuthenticated) {
      setBoats([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetchBoats();
      if (response.data && !response.error) {
        setBoats(response.data);
      }
    } catch (error) {
      console.error("Failed to load boats in BoatContext:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadBoats();
    } else {
      setBoats([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, loadBoats]);

  return (
    <BoatContext.Provider
      value={{
        boats,
        isLoading,
        refreshBoats: loadBoats,
        searchQuery,
        setSearchQuery,
        searchOpen,
        setSearchOpen,
        requestsCount,
        refreshRequestsCount,
      }}
    >
      {children}
    </BoatContext.Provider>
  );
}

export function useBoat() {
  return useContext(BoatContext);
}
