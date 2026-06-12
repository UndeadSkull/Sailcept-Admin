import { ApiResponse } from "../data/auth";
import { Boat } from "../data/boats";

const mockBoats: Record<string, Boat> = {
  "Vembanad Crest": {
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
  "Backwater Pearl": {
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
  "Kerala Dream": {
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

export async function fetchBoats(): Promise<ApiResponse<string[]>> {
  await delay(400);
  return { data: Object.keys(mockBoats), error: null };
}

export async function fetchBoatDetails(boatName: string): Promise<ApiResponse<Boat>> {
  await delay(500);
  const boat = mockBoats[boatName];
  if (!boat) {
    return {
      data: null,
      error: { message: `Boat with name "${boatName}" not found.`, code: "NOT_FOUND" },
    };
  }
  return { data: { ...boat }, error: null };
}

export async function updateBoatDetails(
  boatName: string,
  updatedDetails: Partial<Boat>
): Promise<ApiResponse<Boat>> {
  await delay(600);
  const boat = mockBoats[boatName];
  if (!boat) {
    return {
      data: null,
      error: { message: `Boat with name "${boatName}" not found.`, code: "NOT_FOUND" },
    };
  }
  const updated = {
    ...boat,
    ...updatedDetails,
    name: updatedDetails.name ?? boat.name,
  };
  if (updatedDetails.name && updatedDetails.name !== boatName) {
    delete mockBoats[boatName];
    mockBoats[updatedDetails.name] = updated;
  } else {
    mockBoats[boatName] = updated;
  }
  return { data: updated, error: null };
}
