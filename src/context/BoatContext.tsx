import { createContext, useContext, useState } from "react";

const BOATS = ["Vembanad Crest", "Backwater Pearl", "Kerala Dream"] as const;

type BoatContextValue = {
  boats: string[];
  selectedBoat: string;
  setSelectedBoat: (boat: string) => void;
};

const BoatContext = createContext<BoatContextValue>({
  boats: [...BOATS],
  selectedBoat: BOATS[0],
  setSelectedBoat: () => {},
});

export function BoatProvider({ children }: { children: React.ReactNode }) {
  const [selectedBoat, setSelectedBoat] = useState<string>(BOATS[0]);

  return (
    <BoatContext.Provider
      value={{ boats: [...BOATS], selectedBoat, setSelectedBoat }}
    >
      {children}
    </BoatContext.Provider>
  );
}

export function useBoat() {
  return useContext(BoatContext);
}
