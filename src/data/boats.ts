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
  id: number;
  name: string;
  experienceTier: ExperienceTier;
  bookingType: BookingType;
  maxGuests: number;
  bedrooms: number;
  maxGuestsPerRoom: string;
  features: string[];
  cruiseTypes: CruiseType[];
  roomSettings: RoomSettings;
  // Extended profile properties from mockup
  registrationNumber?: string;
  boardingLocation?: string;
  configuration?: string;
  checkInOut?: Record<string, { in: string; out: string }>;
  comfortLevel?: string;
  accessibleDeckAreas?: string[];
  bedTypes?: string[];
  cotMat?: boolean;
  wheelchairAccessible?: boolean;
  privateParking?: boolean;
  wifi?: boolean;
  ac?: boolean;
  acType?: string[];
  bathroomType?: string[];
  bathroomAmenities?: string[];
  hotWater?: boolean;
  powerBackupGenerator?: boolean;
  otherAmenities?: string[];
  diets?: string[];
  extraActivities?: string[];
  compliance?: {
    vesselRegistrationCertificate?: string;
    certificateOfSurvey?: string;
    insuranceCertificate?: string;
    pollutionCompliance?: string;
  };
};

export type BoatListItem = {
  id: number;
  name: string;
};
