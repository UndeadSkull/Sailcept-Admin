import { ApiResponse, PageResponse } from "../data/auth";
import { Booking, BlockedDate, BookingRequest, DayBooking, DietEntry, RawBookingDto, RawRequestDto } from "../data/bookings";
export type { Booking, BlockedDate, BookingRequest, DayBooking, DietEntry, RawBookingDto, RawRequestDto };
export { fetchReviews } from "./reviews";
import { ENDPOINTS } from "../config/api";
import { apiClient } from "./apiClient";


export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const BOAT_ID_MAP: Record<string, number> = {
  "Lake Ripples": 1,
  "Lake Royale": 2,
  "Lake Riviera": 3,
  "Floating Dreams": 4,
  "Whale Cruise": 5,
};

export const BOAT_NAME_MAP: Record<number, string> = {
  1: "Lake Ripples",
  2: "Lake Royale",
  3: "Lake Riviera",
  4: "Floating Dreams",
  5: "Whale Cruise",
};

export const TRIP_TYPES = ["Day Cruise", "Overnight Stay", "Night Stay"];

export const COMFORT_COLORS = {
  Luxury: "#0F172A",
  Premium: "#F97316",
  Deluxe: "#EC4899",
};

export const TYPE_ICONS = {
  "Day cruise": "sun",
  "Overnight stay": "moonStar",
  "Night stay": "sunrise",
};

export const AVAILABILITY_TYPE_ICONS = {
  "Day Cruise": "sun",
  "Overnight Stay": "moonStar",
  "Night Stay": "sunrise",
};

export const CHECK_IN_TIMES = {
  "Day cruise": "11:00AM",
  "Overnight stay": "12:00PM",
  "Night stay": "05:30PM",
};

// In-memory containers (populated via APIs)
export const initialBookings: Booking[] = [];
export const initialRequests: Booking[] = [];
export const initialRequestHistory: Booking[] = [];
export const initialBlockedDates: BlockedDate[] = [];
export const initialDateOpenState: Record<string, boolean> = {};

export let bookings: Booking[] = [];
export let requests: Booking[] = [];
export let requestHistory: Booking[] = [];
export let blockedDates: BlockedDate[] = [];
export let dateOpenState: Record<string, boolean> = {};
export let sharedUnitsState: Record<string, number> = {};

export const SHARED_BOATS = new Set(["Whale Cruise"]);
export const SHARED_BOAT_TOTAL_UNITS: Record<string, number> = { "Whale Cruise": 14 };

export const BOAT_TOTAL_BH: Record<string, number> = {
  "Lake Ripples": 1,
  "Lake Royale": 2,
  "Lake Riviera": 4,
  "Floating Dreams": 5,
  "Whale Cruise": 1,
};

export const BOAT_BH_CONFIGS: Record<string, number[]> = {
  "Lake Ripples": [1],
  "Lake Royale": [1, 2],
  "Lake Riviera": [2, 3, 4],
  "Floating Dreams": [3, 4, 5],
  "Whale Cruise": [1],
};

// Functions to build databases on the fly
export function buildDefaultPricing(boatName: string) {
  const bhTiers = BOAT_BH_CONFIGS[boatName] || [BOAT_TOTAL_BH[boatName]];
  const pricing: Record<string, { open: boolean; tiers: Record<number, any> }> = {};
  TRIP_TYPES.forEach((type, typeIndex) => {
    const tiers: Record<number, any> = {};
    bhTiers.forEach(bh => {
      const basePerBH = 6000 + typeIndex * 2000;
      tiers[bh] = {
        base: basePerBH * bh,
        extraAdult: 700 + typeIndex * 100,
        extraChild: 350 + typeIndex * 50,
      };
    });
    pricing[type] = { open: true, tiers };
  });
  return pricing;
}

export const BOOKING_TYPE_TO_AVAILABILITY_TYPE: Record<string, string> = {
  "Day cruise": "Day Cruise",
  "Overnight stay": "Overnight Stay",
  "Night stay": "Night Stay",
};

export function buildBackfilledPricing(allBookings: Booking[]) {
  const seeded: Record<string, { tiers: Record<number, any> }> = {};
  allBookings.forEach(b => {
    const availabilityType = BOOKING_TYPE_TO_AVAILABILITY_TYPE[b.type];
    if (!availabilityType) return;
    const defaults = buildDefaultPricing(b.boat);
    const bhTiers = BOAT_BH_CONFIGS[b.boat] || [BOAT_TOTAL_BH[b.boat]];
    const bookedBH = defaults[availabilityType]?.tiers?.[b.rooms] ? b.rooms : bhTiers[0];
    const key = `${b.boat}|${b.date}|${availabilityType}`;
    const tiers: Record<number, any> = {};
    bhTiers.forEach(bh => {
      const base = defaults[availabilityType]?.tiers?.[bh];
      tiers[bh] = { ...base, open: bh === bookedBH };
    });
    seeded[key] = { tiers };
  });
  return seeded;
}

export function buildBackfilledOpenState(allBookings: Booking[]) {
  const seeded: Record<string, boolean> = {};
  allBookings.forEach(b => {
    seeded[`${b.boat}|${b.date}`] = true;
  });
  return seeded;
}

// Initial pricing state
export let dateTripPricing: Record<string, { tiers: Record<number, any> }> = buildBackfilledPricing(bookings);
// In case dateOpenState is empty, backfill it from bookings
bookings.forEach(b => {
  dateOpenState[`${b.boat}|${b.date}`] = true;
});

// Helper utilities
export function safeParseDate(dateVal: any): Date {
  if (!dateVal) return new Date(NaN);
  if (dateVal instanceof Date) return dateVal;
  
  const dateStr = String(dateVal).trim();
  
  // 1. Check if it matches "D MMM YYYY" or "DD MMM YYYY" (e.g. "3 Jun 2026" or "25 Jun 2026")
  const matchDmy = dateStr.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/);
  if (matchDmy) {
    const day = parseInt(matchDmy[1], 10);
    const monthStr = matchDmy[2].toLowerCase().substring(0, 3);
    const year = parseInt(matchDmy[3], 10);
    
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    const month = months[monthStr];
    if (month !== undefined) {
      return new Date(year, month, day);
    }
  }
  
  // 2. Check if it matches ISO-like format "YYYY-MM-DD"
  const matchYmd = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2}))?/);
  if (matchYmd) {
    const year = parseInt(matchYmd[1], 10);
    const month = parseInt(matchYmd[2], 10) - 1;
    const day = parseInt(matchYmd[3], 10);
    const hour = matchYmd[4] ? parseInt(matchYmd[4], 10) : 0;
    const minute = matchYmd[5] ? parseInt(matchYmd[5], 10) : 0;
    const second = matchYmd[6] ? parseInt(matchYmd[6], 10) : 0;
    return new Date(year, month, day, hour, minute, second);
  }

  // 3. Fallback to standard parsing
  return new Date(dateStr);
}

export function isBookingCoveringDate(b: Booking, dateStr: string): boolean {
  if (b.status === "cancelled" || b.status === "deleted") return false;
  const targetDate = safeParseDate(dateStr);
  if (isNaN(targetDate.getTime())) return false;

  const startDate = safeParseDate(b.date);
  if (isNaN(startDate.getTime())) return false;

  if (b.type === "Overnight stay" || b.type === "Overnight Stay") {
    const endDate = safeParseDate(b.dateEnd);
    if (!isNaN(endDate.getTime()) && endDate > startDate) {
      const t = targetDate.getTime();
      const s = startDate.getTime();
      const e = endDate.getTime();
      return t >= s && t < e;
    }
  }
  return targetDate.getTime() === startDate.getTime();
}

export function formatABBookingId(dateStr: string): string {
  const d = safeParseDate(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear());
  const random4 = Math.floor(1000 + Math.random() * 9000);
  return `AB-${day}${month}${year}-${random4}`;
}


export function toISODate(dateStr: string) {
  if (!dateStr) return "";
  const d = safeParseDate(dateStr);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function fromISODate(isoStr: string) {
  if (!isoStr) return "";
  const d = safeParseDate(isoStr + (isoStr.includes("T") ? "" : "T00:00:00"));
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).replace(/,/g, "");
}

export function formatDateRange(start: string, end: string) {
  const startDate = safeParseDate(start);
  const endDate = safeParseDate(end);
  const fullFmt: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short", year: "numeric" };
  const startDisplay = startDate.toLocaleDateString("en-GB", fullFmt).replace(",", "");
  const endDisplay = endDate.toLocaleDateString("en-GB", fullFmt).replace(",", "");
  return `${startDisplay} | ${endDisplay}`;
}

export function formatToday() {
  const fullFmt: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short", year: "numeric" };
  return new Date().toLocaleDateString("en-GB", fullFmt).replace(",", "");
}

export function getWaitingHours(requestedAt: Date) {
  const diffMs = new Date().getTime() - safeParseDate(requestedAt).getTime();
  return diffMs / (1000 * 60 * 60);
}

export function getWaitingColor(hours: number) {
  if (hours < 6) return "#10B981"; // green
  if (hours < 11) return "#F59E0B"; // amber
  return "#EF4444"; // red
}

export function formatWaitingTime(hours: number) {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return minutes > 0 ? `${wholeHours}h${String(minutes).padStart(2, "0")}min` : `${wholeHours}h`;
}

export function getCotsMattresses(b: Booking) {
  if (typeof b.cots === "number") return b.cots;
  const countableGuests = b.adults + b.children;
  return Math.max(0, countableGuests - b.rooms * 2);
}

export function getMinimumRooms(b: { adults: number; children: number }) {
  const countableGuests = b.adults + b.children;
  return Math.max(1, Math.ceil(countableGuests / 3));
}

function parseLocalYMD(dateStr: string): Date {
  if (!dateStr) return new Date();
  const clean = dateStr.split("T")[0];
  const parts = clean.split("-");
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    return new Date(y, m, d, 0, 0, 0, 0);
  }
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isContactUnlocked(
  bookingOrDate: string | { date?: string; contactUnlockDate?: string; contactAvailable?: boolean },
  contactUnlockDate?: string,
  contactAvailable?: boolean
): boolean {
  if (typeof bookingOrDate === "object" && bookingOrDate !== null) {
    if (bookingOrDate.contactAvailable !== undefined) {
      return bookingOrDate.contactAvailable;
    }
    if (bookingOrDate.contactUnlockDate) {
      contactUnlockDate = bookingOrDate.contactUnlockDate;
    }
    bookingOrDate = bookingOrDate.date || "";
  }

  if (contactAvailable !== undefined) {
    return contactAvailable;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (contactUnlockDate) {
    const unlockDate = parseLocalYMD(contactUnlockDate);
    return today.getTime() >= unlockDate.getTime();
  }

  if (!bookingOrDate) return false;

  const trip = parseLocalYMD(bookingOrDate);
  const daysUntilTrip = Math.round((trip.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntilTrip <= 4;
}

export function isUnderRoomed(b: { adults: number; children: number; rooms: number }) {
  return b.rooms < getMinimumRooms(b);
}

export function getAvailabilityStatus(
  boat: string,
  dateStr: string,
  allBookings: Booking[],
  allBlockedDates: typeof blockedDates,
  allDateOpenState: typeof dateOpenState,
  allDateTripPricing: typeof dateTripPricing
) {
  const isDateOpen = allDateOpenState[`${boat}|${dateStr}`] === true;
  if (!isDateOpen) return { status: "closed" };

  const isTripTypeOpenAndPriced = (type: string) => {
    const entry = allDateTripPricing[`${boat}|${dateStr}|${type}`];
    if (!entry?.tiers) return false;
    return Object.values(entry.tiers).some((tier: any) => tier.open);
  };
  const openTypes = {
    "Day Cruise": isTripTypeOpenAndPriced("Day Cruise"),
    "Overnight Stay": isTripTypeOpenAndPriced("Overnight Stay"),
    "Night Stay": isTripTypeOpenAndPriced("Night Stay"),
  };

  const sameDayBookings = allBookings.filter(
    b => b.boat === boat && isBookingCoveringDate(b, dateStr)
  );
  const sameDayDirectBookings = allBlockedDates.filter(
    b => b.boat === boat && b.date === dateStr && b.reason === "direct"
  );
  const hasDirectBooking = sameDayDirectBookings.length > 0 || sameDayBookings.some(b => b.isDirect);

  const isBooked = (type: string) => {
    const bookingTypeMap: Record<string, string> = { "Day Cruise": "Day cruise", "Overnight Stay": "Overnight stay", "Night Stay": "Night stay" };
    const targetType = bookingTypeMap[type] || type;
    const realBooked = sameDayBookings.some(b => b.type === targetType || b.type === type);
    const directBooked = sameDayDirectBookings.some(b => b.tripType === type);
    return realBooked || directBooked;
  };

  const dayBooked = isBooked("Day Cruise");
  const overnightBooked = isBooked("Overnight Stay");
  const nightBooked = isBooked("Night Stay");

  const isVisible = {
    "Day Cruise": openTypes["Day Cruise"] || dayBooked || overnightBooked,
    "Overnight Stay": openTypes["Overnight Stay"] || overnightBooked || dayBooked || nightBooked,
    "Night Stay": openTypes["Night Stay"] || nightBooked || overnightBooked,
  };

  const circles = {
    "Day Cruise": isVisible["Day Cruise"] ? ((dayBooked || overnightBooked) ? "red" : "green") : null,
    "Overnight Stay": isVisible["Overnight Stay"] ? ((overnightBooked || dayBooked || nightBooked) ? "red" : "green") : null,
    "Night Stay": isVisible["Night Stay"] ? ((nightBooked || overnightBooked) ? "red" : "green") : null,
  };

  const openCircleColors = Object.values(circles).filter(c => c !== null);

  if (openCircleColors.length === 0) {
    return { status: "empty", circles, hasDirectBooking };
  }

  const allRed = openCircleColors.every(c => c === "red");
  const someRed = openCircleColors.some(c => c === "red");
  const background = allRed ? "red" : someRed ? "amber" : "green";

  return { status: "open", circles, background, hasDirectBooking };
}

export function mapBookingSummaryToBooking(r: RawBookingDto | RawRequestDto | any): Booking {
  if (!r) return {} as Booking;
  const dateStr = r.travelDate ? (r.travelDate.includes("-") ? fromISODate(r.travelDate) : r.travelDate) : (r.date || "");
  const dateEndStr = r.travelEndDate ? (r.travelEndDate.includes("-") ? fromISODate(r.travelEndDate) : r.travelEndDate) : (r.dateEnd || dateStr);

  let specialRequestsArray: string[] = [];
  if (Array.isArray(r.specialRequests)) {
    specialRequestsArray = r.specialRequests;
  } else if (typeof r.specialRequests === "string" && r.specialRequests.trim() !== "") {
    specialRequestsArray = [r.specialRequests];
  }

  let dietBreakdownList: DietEntry[] | undefined = undefined;
  if (Array.isArray(r.dietBreakdown)) {
    dietBreakdownList = r.dietBreakdown;
  } else if (typeof r.dietBreakdown === "string" && r.dietBreakdown.trim() !== "") {
    try {
      dietBreakdownList = JSON.parse(r.dietBreakdown);
    } catch {
      // ignore
    }
  }

  const rawId = r.bookingId || r.requestId || r.id || 0;
  const numId = typeof rawId === "number" ? rawId : parseInt(rawId, 10) || 0;
  const bookingCodeStr = r.bookingCode || r.requestReference || (typeof r.bookingId === "string" ? r.bookingId : String(r.id || ""));
  const priceVal = r.finalPrice !== undefined ? r.finalPrice : (r.quotedPrice !== undefined ? r.quotedPrice : (r.price !== undefined ? r.price : 0));

  return {
    id: numId,
    bookingId: bookingCodeStr,
    bookingCode: r.bookingCode,
    requestReference: r.requestReference,
    guest: r.guestName || r.guest || "",
    phone: r.customerPhone || r.guestPhone || r.phone || r.contactPhone || "",
    boat: r.boatName || r.boat || "",
    boatId: r.boatId,
    boatConfigurationId: r.boatConfigurationId,
    configurationCode: r.configurationCode,
    boatType: r.boatType,
    cruiseType: r.cruiseType,
    type: r.cruiseTypeLabel || r.cruiseTypeCode || r.type || "Day Cruise",
    date: dateStr,
    dateEnd: dateEndStr,
    serviceStartAt: r.serviceStartAt,
    serviceEndAt: r.serviceEndAt,
    operationalCutoffAt: r.operationalCutoffAt,
    comfort: r.comfortLevelLabel || r.comfortLevel || r.comfort,
    mode: r.bookingMode || r.mode || r.boatType || "Private",
    adults: r.adultsCount !== undefined ? r.adultsCount : (r.adultCount !== undefined ? r.adultCount : (r.adults || 0)),
    children: r.childrenCount !== undefined ? r.childrenCount : (r.childCount !== undefined ? r.childCount : (r.children || 0)),
    kids: r.kidsCount !== undefined ? r.kidsCount : (r.infantCount !== undefined ? r.infantCount : (r.kids || 0)),
    rooms: r.roomsCount !== undefined ? r.roomsCount : (r.roomCount !== undefined ? r.roomCount : (r.rooms || 1)),
    cots: r.extraBedCount !== undefined ? r.extraBedCount : (r.cots || 0),
    dietBreakdown: dietBreakdownList,
    accessibility: r.accessibility,
    specialRequests: specialRequestsArray,
    updatedSpecialRequests: r.updatedSpecialRequests,
    price: priceVal,
    currency: r.currency || "INR",
    ghat: r.ghat || r.boardingLocation,
    checkIn: r.checkInTime || r.checkIn || (r.serviceStartAt ? r.serviceStartAt.substring(11, 16) : ""),
    checkOut: r.checkOutTime || r.checkOut || (r.serviceEndAt ? r.serviceEndAt.substring(11, 16) : ""),
    meal: r.meal,
    paymentStatus: r.bookingStatusLabel || r.paymentStatus || r.paymentState,
    paymentState: r.paymentState,
    paymentActionRequired: r.paymentActionRequired,
    status: r.bookingStatus || r.status || r.operatorState,
    operatorState: r.operatorState,
    operatorStateLabel: r.operatorStateLabel,
    attentionLevel: r.attentionLevel,
    holdState: r.holdState,
    contactAvailable: r.contactAvailable,
    contactUnlockDate: r.contactUnlockDate,
    allowedActions: r.allowedActions,
    isDirect: r.isDirect !== undefined ? r.isDirect : r.isAdded,
    isAdded: r.isAdded,
    isUpdated: r.isUpdated,
    isEdited: r.isEdited,
    bookingSource: r.bookingChannelLabel || r.bookingSource || r.channel || "",
  };
}

export async function fetchBookings(boatId: number): Promise<ApiResponse<Booking[]>> {
  const apiRes = await fetchBookingsApi({ scope: "upcoming", boatId: boatId > 0 ? boatId : undefined });
  if (apiRes.data?.content) {
    const list: Booking[] = apiRes.data.content.map(mapBookingSummaryToBooking);
    return { data: list, error: null };
  }
  if (Array.isArray(apiRes.data)) {
    const list: Booking[] = (apiRes.data as any[]).map(mapBookingSummaryToBooking);
    return { data: list, error: null };
  }
  return { data: apiRes.data ? [] : null, error: apiRes.error };
}

export async function fetchRequests(boatId: number): Promise<ApiResponse<Booking[]>> {
  const apiRes = await fetchRequestsApi({ view: "PENDING", boatId: boatId > 0 ? boatId : undefined });
  if (apiRes.data?.content) {
    const list: Booking[] = apiRes.data.content.map(mapBookingSummaryToBooking);
    return { data: list, error: null };
  }
  if (Array.isArray(apiRes.data)) {
    const list: Booking[] = (apiRes.data as any[]).map(mapBookingSummaryToBooking);
    return { data: list, error: null };
  }
  return { data: apiRes.data ? [] : null, error: apiRes.error };
}

export async function fetchRequestHistory(boatId: number): Promise<ApiResponse<Booking[]>> {
  const apiRes = await fetchRequestsApi({ view: "HISTORY", boatId: boatId > 0 ? boatId : undefined });
  if (apiRes.data?.content) {
    const list: Booking[] = apiRes.data.content.map(mapBookingSummaryToBooking);
    return { data: list, error: null };
  }
  if (Array.isArray(apiRes.data)) {
    const list: Booking[] = (apiRes.data as any[]).map(mapBookingSummaryToBooking);
    return { data: list, error: null };
  }
  return { data: apiRes.data ? [] : null, error: apiRes.error };
}

export async function submitRequestOutcome(
  idOrBoatId: number | string,
  outcomeOrGuestName: any,
  outcomeIfThreeArgs?: "accepted" | "declined" | "rejected"
): Promise<ApiResponse<any>> {
  let requestId = String(idOrBoatId);
  let outcome = outcomeOrGuestName;

  if (outcomeIfThreeArgs !== undefined) {
    outcome = outcomeIfThreeArgs;
    requestId = String(outcomeOrGuestName);
  }

  if (outcome === "accepted") {
    return acceptRequestApi(requestId);
  } else {
    return declineRequestApi(requestId);
  }
}

export async function saveDirectBooking(booking: Booking): Promise<ApiResponse<Booking>> {
  const payload = {
    boatId: BOAT_ID_MAP[booking.boat] || booking.id,
    guestName: booking.guest,
    guestPhone: booking.phone,
    cruiseTypeCode: booking.type,
    travelDate: booking.date,
    travelEndDate: booking.dateEnd,
    adultCount: booking.adults,
    childCount: booking.children,
    roomCount: booking.rooms,
    price: booking.price,
    specialRequests: booking.specialRequests,
    bookingSource: booking.bookingSource || "Direct Booking",
  };

  let res: ApiResponse<any>;
  if (booking.bookingId && booking.bookingId.startsWith("AB-")) {
    res = await updateAddedBookingApi(booking.bookingId, payload);
  } else {
    res = await createAddedBookingApi(payload);
  }

  if (res.data) {
    return { data: mapBookingSummaryToBooking(res.data), error: null };
  }
  return { data: null, error: res.error };
}

export async function deleteBooking(id: number | string): Promise<ApiResponse<void>> {
  const res = await deleteAddedBookingApi(String(id));
  return { data: null, error: res.error };
}

export async function fetchUpcomingCruisesApi(boatId: number): Promise<ApiResponse<Booking[]>> {
  const apiRes = await fetchBookingsApi({ scope: "upcoming", boatId: boatId > 0 ? boatId : undefined });
  if (apiRes.data?.content) {
    const list: Booking[] = apiRes.data.content.map(mapBookingSummaryToBooking);
    return { data: list, error: null };
  }
  if (Array.isArray(apiRes.data)) {
    const list: Booking[] = (apiRes.data as any[]).map(mapBookingSummaryToBooking);
    return { data: list, error: null };
  }
  return { data: apiRes.data ? [] : null, error: apiRes.error };
}

export async function fetchBookingDetail(bookingId: string): Promise<ApiResponse<Booking>> {
  const apiRes = await fetchBookingDetailByIdApi(bookingId);
  if (apiRes.data) return { data: mapBookingSummaryToBooking(apiRes.data), error: null };
  return { data: null, error: apiRes.error };
}

export async function fetchRequestDetail(requestName: string, boatId: number): Promise<ApiResponse<Booking>> {
  const apiRes = await fetchRequestDetailByIdApi(requestName);
  if (apiRes.data) return { data: mapBookingSummaryToBooking(apiRes.data), error: null };
  return { data: null, error: apiRes.error };
}


// -------------------------------------------------------------
// CANONICAL API INTEGRATION (Sailcept Operator API Guide 2026)
// Base path: /api/v1/operator
// -------------------------------------------------------------

// Booking Requests APIs
export async function fetchRequestsApi(params: {
  view: "PENDING" | "HISTORY";
  boatId?: number;
  page?: number;
  size?: number;
  month?: string;
  year?: number;
  outcome?: string;
}): Promise<ApiResponse<PageResponse<any>>> {
  const queryParts: string[] = [`view=${params.view}`];
  if (params.boatId && params.boatId > 0) queryParts.push(`boatId=${params.boatId}`);
  if (params.page !== undefined) queryParts.push(`page=${params.page}`);
  if (params.size !== undefined) queryParts.push(`size=${params.size}`);
  if (params.month) queryParts.push(`month=${params.month}`);
  if (params.year) queryParts.push(`year=${params.year}`);
  if (params.outcome) queryParts.push(`outcome=${params.outcome}`);

  return apiClient.get<PageResponse<any>>(`${ENDPOINTS.REQUESTS}?${queryParts.join("&")}`);
}

export async function fetchRequestDetailByIdApi(requestId: string): Promise<ApiResponse<any>> {
  return apiClient.get<any>(`${ENDPOINTS.REQUESTS}/${requestId}`);
}

export async function acceptRequestApi(requestId: string): Promise<ApiResponse<any>> {
  return apiClient.post<any>(`${ENDPOINTS.REQUESTS}/${requestId}/accept`);
}

export async function declineRequestApi(requestId: string, reason?: string): Promise<ApiResponse<any>> {
  return apiClient.post<any>(`${ENDPOINTS.REQUESTS}/${requestId}/decline`, reason ? { reason } : undefined);
}

// Bookings APIs
export async function fetchBookingsApi(params: {
  scope: "upcoming" | "today" | "date" | "month";
  date?: string;
  month?: string;
  status?: string;
  boatId?: number;
  page?: number;
  size?: number;
}): Promise<ApiResponse<PageResponse<any>>> {
  const queryParts: string[] = [`scope=${params.scope}`];
  if (params.date) queryParts.push(`date=${params.date}`);
  if (params.month) queryParts.push(`month=${params.month}`);
  if (params.status) queryParts.push(`status=${params.status}`);
  if (params.boatId && params.boatId > 0) queryParts.push(`boatId=${params.boatId}`);
  if (params.page !== undefined) queryParts.push(`page=${params.page}`);
  if (params.size !== undefined) queryParts.push(`size=${params.size}`);

  return apiClient.get<PageResponse<any>>(`${ENDPOINTS.BOOKINGS}?${queryParts.join("&")}`);
}

export async function fetchBookingCalendarApi(month: string, boatId?: number): Promise<ApiResponse<any>> {
  const query = boatId && boatId > 0 ? `?month=${month}&boatId=${boatId}` : `?month=${month}`;
  return apiClient.get<any>(`${ENDPOINTS.BOOKINGS_CALENDAR}${query}`);
}

export async function fetchBookingDetailByIdApi(bookingId: string): Promise<ApiResponse<any>> {
  return apiClient.get<any>(`${ENDPOINTS.BOOKINGS}/${bookingId}`);
}

// Operator-Added Bookings APIs
export async function fetchAddedBookingOptionsApi(boatId: number): Promise<ApiResponse<any>> {
  return apiClient.get<any>(`${ENDPOINTS.BOOKINGS_ADDED_OPTIONS}?boatId=${boatId}`);
}

export async function createAddedBookingApi(payload: any, idempotencyKey?: string): Promise<ApiResponse<any>> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }
  return apiClient.post<any>(ENDPOINTS.BOOKINGS_ADDED, payload, { headers });
}

export async function updateAddedBookingApi(bookingId: string, payload: any): Promise<ApiResponse<any>> {
  return apiClient.put<any>(`${ENDPOINTS.BOOKINGS_ADDED}/${bookingId}`, payload);
}

export async function deleteAddedBookingApi(bookingId: string): Promise<ApiResponse<any>> {
  return apiClient.delete<any>(`${ENDPOINTS.BOOKINGS_ADDED}/${bookingId}`);
}

// Availability APIs
export async function fetchAvailabilityCalendarApi(boatId: number, month: string): Promise<ApiResponse<any>> {
  return apiClient.get<any>(`${ENDPOINTS.AVAILABILITY_CALENDAR}/${boatId}/calendar?month=${month}`);
}

export async function fetchAvailabilitySelectionApi(boatId: number, from: string, to: string): Promise<ApiResponse<any>> {
  return apiClient.get<any>(`${ENDPOINTS.AVAILABILITY_CALENDAR}/${boatId}/selection?from=${from}&to=${to}`);
}

export async function updateDateStatusApi(boatId: number, fromDate: string, toDate: string, isOpen: boolean): Promise<ApiResponse<any>> {
  return apiClient.put<any>(`${ENDPOINTS.AVAILABILITY_CALENDAR}/${boatId}/date-status`, { fromDate, toDate, isOpen });
}

export async function updateRatesApi(boatId: number, fromDate: string, toDate: string, cruiseType: string, tiers: any[]): Promise<ApiResponse<any>> {
  return apiClient.put<any>(`${ENDPOINTS.AVAILABILITY_CALENDAR}/${boatId}/rates`, { fromDate, toDate, cruiseType, tiers });
}

export async function updateSharedInventoryApi(boatId: number, fromDate: string, toDate: string, sellableRoomLimit: number): Promise<ApiResponse<any>> {
  return apiClient.put<any>(`${ENDPOINTS.AVAILABILITY_CALENDAR}/${boatId}/shared-inventory`, { fromDate, toDate, sellableRoomLimit });
}

