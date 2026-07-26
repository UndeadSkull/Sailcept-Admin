import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { fetchBoats } from "../services/boats";
import { BoatListItem } from "../data/boats";
import { requests } from "../services/bookings";

type BoatContextValue = {
  boats: BoatListItem[];
  selectedBoat: number;
  setSelectedBoat: (boatId: number) => void;
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
  selectedBoat: 0,
  setSelectedBoat: () => {},
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
  const [boats, setBoats] = useState<BoatListItem[]>([]);
  const [selectedBoat, setSelectedBoat] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [requestsCount, setRequestsCount] = useState<number>(requests.length);

  const refreshRequestsCount = useCallback(() => {
    setRequestsCount(requests.length);
  }, []);

  const loadBoats = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBoats();
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <BoatContext.Provider
      value={{
        boats,
        selectedBoat,
        setSelectedBoat,
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
