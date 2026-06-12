export type ExperienceTier = "Premium" | "Luxury" | "Standard";
export type BookingType = "Private only" | "Shared" | "Private + shared";

export type RoomSettings = {
  maxGuests: string;
  extraBed: string;
  children: string;
};

export type CruiseType = {
  label: string;
  on: boolean;
};

export type Boat = {
  name: string;
  experienceTier: ExperienceTier;
  bookingType: BookingType;
  maxGuests: number;
  bedrooms: number;
  maxGuestsPerRoom: string;
  features: string[];
  cruiseTypes: CruiseType[];
  roomSettings: RoomSettings;
};
