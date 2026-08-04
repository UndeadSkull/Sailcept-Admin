import { ApiResponse } from "../data/auth";
import { Boat, BoatListItem } from "../data/boats";

export const mockBoats: Record<number, Boat> = {
  1: {
    id: 1,
    name: "Lake Ripples",
    experienceTier: "Luxury",
    bookingType: "Private only",
    maxGuests: 3,
    bedrooms: 1,
    maxGuestsPerRoom: "2 + 1 extra bed",
    features: ["Upper Deck", "Sun Deck", "Outdoor Dining Area"],
    cruiseTypes: [
      { label: "Day cruise", on: true },
      { label: "Overnight stay", on: true },
      { label: "Night stay", on: true },
    ],
    roomSettings: { maxGuests: "2 guests", extraBed: "Allowed", children: "Allowed" },
    registrationNumber: "KIV/ALP/HB/0243/08",
    boardingLocation: "Finishing Point, Alappuzha",
    configuration: "1BH",
    checkInOut: {
      "Day Cruise": { in: "11:30 AM", out: "05:00 PM" },
      "Overnight Stay": { in: "12:00 PM", out: "09:00 AM (next day)" },
      "Night Stay": { in: "05:30 PM", out: "09:00 AM (next day)" },
    },
    comfortLevel: "Luxury",
    accessibleDeckAreas: ["Upper Deck", "Sun Deck", "Outdoor Dining Area"],
    bedTypes: ["Double bed", "Twin bed"],
    cotMat: true,
    wheelchairAccessible: true,
    privateParking: true,
    wifi: true,
    ac: true,
    acType: ["Full Time AC (24/7)", "Night AC only", "Scheduled AC Hours", "AC in Bedrooms only", "Fans only"],
    bathroomType: ["Ensuite bathroom in each bedroom", "Shower", "Jacuzzi", "Bath tub", "Western toilet"],
    hotWater: true,
    bathroomAmenities: ["Towels", "Hand soap", "Shower gel", "Shampoo", "Toilet paper", "Tissues"],
    powerBackupGenerator: true,
    otherAmenities: ["Kid's chair", "Sun loungers on deck", "Mini-bar", "Mosquito nets", "Smart TV", "Bluetooth speakers"],
    diets: ["Vegetarian", "Vegan", "Jain", "Non-veg", "Halal"],
    extraActivities: ["Board games / Card games", "Fishing equipment", "Walk on paddy fields", "Kayaking", "Speedboat", "Country boat ride", "Cooking class", "Massage (off boat)", "Bicycles"],
    compliance: { vesselRegistrationCertificate: "Valid", certificateOfSurvey: "Valid", insuranceCertificate: "Valid", pollutionCompliance: "Valid" }
  },
  2: {
    id: 2,
    name: "Lake Royale",
    experienceTier: "Luxury",
    bookingType: "Private only",
    maxGuests: 6,
    bedrooms: 2,
    maxGuestsPerRoom: "2 + 1 extra bed",
    features: ["Upper Deck", "Sun Deck", "Outdoor Dining Area"],
    cruiseTypes: [
      { label: "Day cruise", on: true },
      { label: "Overnight stay", on: true },
      { label: "Night stay", on: true },
    ],
    roomSettings: { maxGuests: "2 guests", extraBed: "Allowed", children: "Allowed" },
    registrationNumber: "KIV/ALP/HB/0487/13",
    boardingLocation: "Punnamada Jetty, Alappuzha",
    configuration: "1BH / 2BH",
    checkInOut: {
      "Day Cruise": { in: "11:30 AM", out: "05:00 PM" },
      "Overnight Stay": { in: "12:00 PM", out: "09:00 AM (next day)" },
      "Night Stay": { in: "05:30 PM", out: "09:00 AM (next day)" },
    },
    comfortLevel: "Luxury",
    accessibleDeckAreas: ["Upper Deck", "Sun Deck", "Outdoor Dining Area"],
    bedTypes: ["Double bed", "Twin bed"],
    cotMat: true,
    wheelchairAccessible: true,
    privateParking: true,
    wifi: true,
    ac: true,
    acType: ["Full Time AC (24/7)"],
    bathroomType: ["Ensuite bathroom in each bedroom", "Shower", "Western toilet"],
    hotWater: true,
    bathroomAmenities: ["Towels", "Hand soap", "Shower gel", "Shampoo", "Toilet paper", "Tissues"],
    powerBackupGenerator: true,
    otherAmenities: ["Sun loungers on deck", "Mini-bar", "Mosquito nets", "Smart TV"],
    diets: ["Vegetarian", "Vegan", "Jain", "Non-veg", "Halal"],
    extraActivities: ["Board games / Card games", "Fishing equipment", "Kayaking", "Speedboat", "Country boat ride"],
    compliance: { vesselRegistrationCertificate: "Valid", certificateOfSurvey: "Valid", insuranceCertificate: "Valid", pollutionCompliance: "Valid" }
  },
  3: {
    id: 3,
    name: "Lake Riviera",
    experienceTier: "Luxury",
    bookingType: "Private only",
    maxGuests: 12,
    bedrooms: 4,
    maxGuestsPerRoom: "2 + 1 extra bed",
    features: ["Upper Deck", "Sun Deck", "Outdoor Dining Area"],
    cruiseTypes: [
      { label: "Day cruise", on: true },
      { label: "Overnight stay", on: true },
      { label: "Night stay", on: true },
    ],
    roomSettings: { maxGuests: "2 guests", extraBed: "Allowed", children: "Allowed" },
    registrationNumber: "KIV/ALP/HB/0658/17",
    boardingLocation: "Finishing Point, Alappuzha",
    configuration: "2BH / 3BH / 4BH",
    checkInOut: {
      "Day Cruise": { in: "11:30 AM", out: "05:00 PM" },
      "Overnight Stay": { in: "12:00 PM", out: "09:00 AM (next day)" },
      "Night Stay": { in: "05:30 PM", out: "09:00 AM (next day)" },
    },
    comfortLevel: "Luxury",
    accessibleDeckAreas: ["Upper Deck", "Sun Deck", "Outdoor Dining Area"],
    bedTypes: ["Double bed", "Twin bed"],
    cotMat: true,
    wheelchairAccessible: true,
    privateParking: true,
    wifi: true,
    ac: true,
    acType: ["Full Time AC (24/7)"],
    bathroomType: ["Ensuite bathroom in each bedroom", "Shower", "Jacuzzi", "Western toilet"],
    hotWater: true,
    bathroomAmenities: ["Towels", "Hand soap", "Shower gel", "Shampoo", "Toilet paper", "Tissues"],
    powerBackupGenerator: true,
    otherAmenities: ["Kid's chair", "Sun loungers on deck", "Mini-bar", "Mosquito nets", "Smart TV", "Bluetooth speakers"],
    diets: ["Vegetarian", "Vegan", "Jain", "Non-veg", "Halal"],
    extraActivities: ["Board games / Card games", "Fishing equipment", "Walk on paddy fields", "Kayaking", "Speedboat", "Country boat ride", "Cooking class", "Massage (off boat)", "Bicycles"],
    compliance: { vesselRegistrationCertificate: "Valid", certificateOfSurvey: "Valid", insuranceCertificate: "Valid", pollutionCompliance: "Valid" }
  },
  4: {
    id: 4,
    name: "Floating Dreams",
    experienceTier: "Premium",
    bookingType: "Private only",
    maxGuests: 15,
    bedrooms: 5,
    maxGuestsPerRoom: "2 + 1 extra bed",
    features: ["Upper Deck", "Sun Deck", "Outdoor Dining Area"],
    cruiseTypes: [
      { label: "Day cruise", on: true },
      { label: "Overnight stay", on: true },
      { label: "Night stay", on: true },
    ],
    roomSettings: { maxGuests: "2 guests", extraBed: "Allowed", children: "Allowed" },
    registrationNumber: "KIV/ALP/HB/0911/11",
    boardingLocation: "Finishing Point, Alappuzha",
    configuration: "3BH / 4BH / 5BH",
    checkInOut: {
      "Day Cruise": { in: "11:30 AM", out: "05:00 PM" },
      "Overnight Stay": { in: "12:00 PM", out: "09:00 AM (next day)" },
      "Night Stay": { in: "05:30 PM", out: "09:00 AM (next day)" },
    },
    comfortLevel: "Premium",
    accessibleDeckAreas: ["Upper Deck", "Sun Deck", "Outdoor Dining Area"],
    bedTypes: ["Double bed", "Twin bed"],
    cotMat: true,
    wheelchairAccessible: true,
    privateParking: true,
    wifi: true,
    ac: true,
    acType: ["Full Time AC (24/7)"],
    bathroomType: ["Ensuite bathroom in each bedroom", "Shower", "Western toilet"],
    hotWater: true,
    bathroomAmenities: ["Towels", "Hand soap", "Shower gel", "Shampoo", "Toilet paper", "Tissues"],
    powerBackupGenerator: true,
    otherAmenities: ["Kid's chair", "Sun loungers on deck", "Mini-bar", "Mosquito nets", "Smart TV", "Bluetooth speakers"],
    diets: ["Vegetarian", "Vegan", "Jain", "Non-veg", "Halal"],
    extraActivities: ["Board games / Card games", "Fishing equipment", "Walk on paddy fields", "Kayaking", "Speedboat", "Country boat ride", "Cooking class", "Massage (off boat)", "Bicycles"],
    compliance: { vesselRegistrationCertificate: "Valid", certificateOfSurvey: "Valid", insuranceCertificate: "Valid", pollutionCompliance: "Valid" }
  },
  5: {
    id: 5,
    name: "Whale Cruise",
    experienceTier: "Premium",
    bookingType: "Shared",
    maxGuests: 42,
    bedrooms: 14,
    maxGuestsPerRoom: "2 + 1 extra bed",
    features: ["Upper Deck", "Sun Deck", "Outdoor Dining Area"],
    cruiseTypes: [
      { label: "Day cruise", on: true },
      { label: "Overnight stay", on: true },
      { label: "Night stay", on: true },
    ],
    roomSettings: { maxGuests: "2 guests", extraBed: "Allowed", children: "Allowed" },
    registrationNumber: "KIV/ALP/HB/1124/19",
    boardingLocation: "Punnamada Jetty, Alappuzha",
    configuration: "14BH",
    checkInOut: {
      "Day Cruise": { in: "11:30 AM", out: "05:00 PM" },
      "Overnight Stay": { in: "12:00 PM", out: "09:00 AM (next day)" },
      "Night Stay": { in: "05:30 PM", out: "09:00 AM (next day)" },
    },
    comfortLevel: "Premium",
    accessibleDeckAreas: ["Upper Deck", "Sun Deck", "Outdoor Dining Area"],
    bedTypes: ["Double bed", "Twin bed"],
    cotMat: true,
    wheelchairAccessible: true,
    privateParking: true,
    wifi: true,
    ac: true,
    acType: ["Full Time AC (24/7)"],
    bathroomType: ["Ensuite bathroom in each bedroom", "Shower", "Western toilet"],
    hotWater: true,
    bathroomAmenities: ["Towels", "Hand soap", "Shower gel", "Shampoo", "Toilet paper", "Tissues"],
    powerBackupGenerator: true,
    otherAmenities: ["Sun loungers on deck", "Mini-bar", "Mosquito nets", "Smart TV"],
    diets: ["Vegetarian", "Vegan", "Jain", "Non-veg", "Halal"],
    extraActivities: ["Board games / Card games", "Fishing equipment", "Kayaking", "Speedboat", "Country boat ride"],
    compliance: { vesselRegistrationCertificate: "Valid", certificateOfSurvey: "Valid", insuranceCertificate: "Valid", pollutionCompliance: "Valid" }
  }
};

import { ENDPOINTS } from "../config/api";
import { apiClient } from "./apiClient";
import {
  BoatListItemResponse,
  BoatDetailResponse,
  BoatDocumentDetailsResponse,
  CancellationPolicyResponse,
} from "../data/boats";

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, process.env.NODE_ENV === "test" ? 0 : ms));

export async function fetchBoats(): Promise<ApiResponse<BoatListItem[]>> {
  const res = await apiClient.get<BoatListItemResponse[] | BoatListItem[]>(ENDPOINTS.BOATS);
  if (res.data && Array.isArray(res.data) && res.data.length > 0) {
    const list: BoatListItem[] = res.data.map((item: any) => ({
      id: item.boatId !== undefined ? item.boatId : item.id,
      name: item.boatName !== undefined ? item.boatName : item.name,
    }));
    return { data: list, error: null };
  }
  await delay(200);
  const list = Object.values(mockBoats).map((b) => ({ id: b.id, name: b.name }));
  return { data: list, error: null };
}

export async function fetchBoatDetails(boatId: number): Promise<ApiResponse<Boat>> {
  const res = await apiClient.get<BoatDetailResponse>(`${ENDPOINTS.BOATS}/${boatId}`);
  if (res.data && res.data.name) {
    return { data: res.data, error: null };
  }
  await delay(200);
  const boat = mockBoats[boatId];
  if (!boat) {
    return {
      data: null,
      error: { message: `Boat with ID "${boatId}" not found.`, code: "NOT_FOUND" },
    };
  }
  return { data: { ...boat }, error: null };
}

export async function fetchBoatDocumentDetails(boatId: number): Promise<ApiResponse<BoatDocumentDetailsResponse>> {
  const res = await apiClient.get<BoatDocumentDetailsResponse>(`${ENDPOINTS.BOATS}/${boatId}/document`);
  if (res.data) {
    return res;
  }
  const boat = mockBoats[boatId];
  return {
    data: {
      boatId,
      vesselRegistrationNumber: boat?.registrationNumber || null,
      surveyCertificateExpiryDate: "2027-12-31",
      insuranceCertificateExpiryDate: "2027-06-30",
      pollutionDocumentExpiryDate: "2026-11-30",
    },
    error: null,
  };
}

export async function fetchCancellationPolicies(
  boatId: number,
  activeOnly = true
): Promise<ApiResponse<CancellationPolicyResponse[]>> {
  const res = await apiClient.get<CancellationPolicyResponse[]>(
    `${ENDPOINTS.BOATS}/${boatId}/cancellation-policies?activeOnly=${activeOnly}`
  );
  if (res.data) {
    return res;
  }
  return {
    data: [
      {
        policyId: 1,
        boatId,
        cruiseApplicability: "ALL",
        freeCancellationCutoffHours: 48,
        partialRefundCutoffHours: 24,
        refundPercentage: 50,
        resaleSettings: "AUTO_RELIST",
        policyText: "Free cancellation up to 48 hours prior to service start.",
        isActive: true,
      },
    ],
    error: null,
  };
}

export async function updateBoatDetails(
  boatId: number,
  updatedDetails: Partial<Boat>
): Promise<ApiResponse<Boat>> {
  await delay(200);
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

