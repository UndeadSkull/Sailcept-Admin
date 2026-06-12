import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { fetchBoats } from "../services/boats";

type BoatContextValue = {
  boats: string[];
  selectedBoat: string;
  setSelectedBoat: (boat: string) => void;
  isLoading: boolean;
  refreshBoats: () => Promise<void>;
};

const BoatContext = createContext<BoatContextValue>({
  boats: [],
  selectedBoat: "",
  setSelectedBoat: () => {},
  isLoading: true,
  refreshBoats: async () => {},
});

export function BoatProvider({ children }: { children: ReactNode }) {
  const [boats, setBoats] = useState<string[]>([]);
  const [selectedBoat, setSelectedBoat] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadBoats = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchBoats();
      if (response.data && !response.error) {
        setBoats(response.data);
        if (response.data.length > 0) {
          setSelectedBoat((current) => current || (response.data ? response.data[0] : ""));
        }
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
    return () => clearTimeout(timer);
  }, [loadBoats]);

  return (
    <BoatContext.Provider
      value={{
        boats,
        selectedBoat,
        setSelectedBoat,
        isLoading,
        refreshBoats: loadBoats,
      }}
    >
      {children}
    </BoatContext.Provider>
  );
}

export function useBoat() {
  return useContext(BoatContext);
}
