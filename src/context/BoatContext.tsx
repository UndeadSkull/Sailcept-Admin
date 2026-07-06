import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { fetchBoats } from "../services/boats";
import { BoatListItem } from "../data/boats";

type BoatContextValue = {
  boats: BoatListItem[];
  selectedBoat: number;
  setSelectedBoat: (boatId: number) => void;
  isLoading: boolean;
  refreshBoats: () => Promise<void>;
};

const BoatContext = createContext<BoatContextValue>({
  boats: [],
  selectedBoat: 0,
  setSelectedBoat: () => {},
  isLoading: true,
  refreshBoats: async () => {},
});

export function BoatProvider({ children }: { children: ReactNode }) {
  const [boats, setBoats] = useState<BoatListItem[]>([]);
  const [selectedBoat, setSelectedBoat] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadBoats = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchBoats();
      if (response.data && !response.error) {
        setBoats(response.data);
        if (response.data.length > 0) {
          setSelectedBoat((current) => current || (response.data ? response.data[0].id : 0));
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
      }}
    >
      {children}
    </BoatContext.Provider>
  );
}

export function useBoat() {
  return useContext(BoatContext);
}
