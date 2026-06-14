import { ApiResponse } from "../data/auth";
import { Boat, BoatListItem } from "../data/boats";

const mockBoats: Record<number, Boat> = {
  1: {
    id: 1,
    name: "Vembanad Crest",
    experienceTier: "Premium",
    bookingType: "Private only",
    maxGuests: 6,
    bedrooms: 2,
    maxGuestsPerRoom: "2 + 1 extra bed",
    features: ["Full upper deck", "Sundeck"],
    cruiseTypes: [
      { label: "Day cruise", on: true },
      { label: "Overnight stay", on: true },
      { label: "Night stay", on: false },
    ],
    roomSettings: { maxGuests: "2 guests", extraBed: "Allowed", children: "Allowed" },
  },
  2: {
    id: 2,
    name: "Backwater Pearl",
    experienceTier: "Standard",
    bookingType: "Shared",
    maxGuests: 8,
    bedrooms: 3,
    maxGuestsPerRoom: "2 guests",
    features: ["Partial deck", "Sundeck"],
    cruiseTypes: [
      { label: "Day cruise", on: true },
      { label: "Overnight stay", on: false },
      { label: "Night stay", on: true },
    ],
    roomSettings: { maxGuests: "2 guests", extraBed: "Not allowed", children: "Allowed" },
  },
  3: {
    id: 3,
    name: "Kerala Dream",
    experienceTier: "Luxury",
    bookingType: "Private + shared",
    maxGuests: 12,
    bedrooms: 4,
    maxGuestsPerRoom: "3 guests",
    features: ["Full upper deck", "Sundeck", "Balcony"],
    cruiseTypes: [
      { label: "Day cruise", on: true },
      { label: "Overnight stay", on: true },
      { label: "Night stay", on: true },
    ],
    roomSettings: { maxGuests: "3 guests", extraBed: "Allowed", children: "Allowed" },
  },
};

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, process.env.NODE_ENV === "test" ? 0 : ms));

export async function fetchBoats(): Promise<ApiResponse<BoatListItem[]>> {
  await delay(400);
  const list = Object.values(mockBoats).map((b) => ({ id: b.id, name: b.name }));
  return { data: list, error: null };
}

export async function fetchBoatDetails(boatId: number): Promise<ApiResponse<Boat>> {
  await delay(500);
  const boat = mockBoats[boatId];
  if (!boat) {
    return {
      data: null,
      error: { message: `Boat with ID "${boatId}" not found.`, code: "NOT_FOUND" },
    };
  }
  return { data: { ...boat }, error: null };
}

export async function updateBoatDetails(
  boatId: number,
  updatedDetails: Partial<Boat>
): Promise<ApiResponse<Boat>> {
  await delay(600);
  const boat = mockBoats[boatId];
  if (!boat) {
    return {
      data: null,
      error: { message: `Boat with ID "${boatId}" not found.`, code: "NOT_FOUND" },
    };
  }
  const updated = {
    ...boat,
    ...updatedDetails,
    id: boat.id, // cannot change id
  };
  mockBoats[boatId] = updated;
  return { data: updated, error: null };
}
