import { ApiResponse } from "../data/auth";
import { BookingRecord, BookingRequest, DayBooking } from "../data/bookings";

// Mock data initialization
const now = new Date();
const currentYear = now.getFullYear();
const currentMonthIndex = now.getMonth();
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const currentMonthStr = months[currentMonthIndex];

const mockBookings: BookingRecord[] = [
  {
    id: "booking-1",
    guestName: "Ethan Walker",
    boatName: "Vembanad Crest",
    bookingId: "#SC-2025-0041",
    details: [
      ["Cruise type", "Day cruise"],
      ["Date & time", `15 ${currentMonthStr} ${currentYear} · 11:00 AM - 5:00 PM`],
      ["Configuration", "2 adults · 1 room · Private · Premium"],
      ["Total agreed price", "INR 12,500"],
      ["Inclusions", "Meals, water, A/C, fishing equipment"],
      ["Pickup arranged", "Taxi confirmed · Alleppey Jetty"],
      ["Meal preference", "Vegetarian · Anniversary decoration"],
    ],
    notes: "Sailcept commitments: cruise-time support, check-in coordination, taxi pickup, operator compliance enforcement, backup boat if required.",
  },
  {
    id: "booking-2",
    guestName: "Olivia Bennett",
    boatName: "Vembanad Crest",
    bookingId: "#SC-2025-0042",
    details: [
      ["Cruise type", "Overnight stay"],
      ["Date & time", `18 ${currentMonthStr} ${currentYear} · 3:00 PM - Next day 11:00 AM`],
      ["Configuration", "4 adults · 2 rooms · Private · Luxury"],
      ["Total agreed price", "INR 28,000"],
      ["Inclusions", "All meals, spa, sunset deck access"],
      ["Pickup arranged", "Hotel pickup confirmed"],
      ["Special requests", "Champagne breakfast on day 2"],
    ],
    notes: "Premium service package. Guest is VIP. Ensure extra staff on board.",
  },
  {
    id: "booking-3",
    guestName: "Nora Ali",
    boatName: "Backwater Pearl",
    bookingId: "#SC-2025-0050",
    details: [
      ["Cruise type", "Day cruise"],
      ["Date & time", `21 ${currentMonthStr} ${currentYear} · 10:00 AM - 4:00 PM`],
      ["Configuration", "3 adults · 1 room · Private · Standard"],
      ["Total agreed price", "INR 10,800"],
      ["Inclusions", "Meals, tea service, local guide"],
    ],
    notes: "Local experience focus. Wants traditional Kerala style lunch.",
  },
];

const mockRequests: BookingRequest[] = [
  {
    name: "Ethan Walker",
    boatName: "Vembanad Crest",
    dateLine: "Received 2 hrs ago - Date held until 6 PM today",
    subtitle: "Day cruise · 15 Jan 2025",
    status: "Date locked",
    config: "Price shown to guest: INR 12,500",
    details: "Premium · Private · 2 adults, 0 children · 1 room · 2 guests per room · No extra bed",
    request: "Special request: Vegetarian meals preferred. Celebrating anniversary.",
  },
  {
    name: "Emma Collins",
    boatName: "Kerala Dream",
    dateLine: "Received yesterday - Overnight stay · 22 Jan",
    subtitle: "Overnight stay · 22 Jan 2025",
    status: "Pending",
    config: "Price shown to guest: INR 21,000",
    details: "Premium · Private · 4 adults, 1 child · 2 rooms · Room 1: 2 guests · Room 2: 2 guests + 1 extra bed",
  },
  {
    name: "Sofia Turner",
    boatName: "Vembanad Crest",
    dateLine: "Handled 3 days ago - Day cruise · 10 Jan",
    subtitle: "Day cruise · 10 Jan 2025",
    status: "Confirmed",
    config: "Final booking value: INR 13,000",
    details: "Deluxe · Private · 2 adults, 1 child · 1 room · Extra bed included",
    outcome: "accepted",
    actedOn: "Accepted by admin on 08 Jan, 4:42 PM",
  },
  {
    name: "Noah Parker",
    boatName: "Backwater Pearl",
    dateLine: "Handled 4 days ago - Night cruise · 09 Jan",
    subtitle: "Night cruise · 09 Jan 2025",
    status: "Rejected",
    config: "Quoted value: INR 18,500",
    details: "Premium · Shared · 3 adults · 2 rooms",
    outcome: "rejected",
    actedOn: "Rejected by admin on 07 Jan, 6:10 PM",
  },
];

function getDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function normalizeBooking(booking: DayBooking): DayBooking {
  const normalized = { ...booking };
  if (normalized.overnightCruise && normalized.nightCruise) {
    normalized.nightCruise = false;
  }
  if (normalized.details) {
    if (normalized.dayCruise && !normalized.dayCruiseDetails) {
      normalized.dayCruiseDetails = normalized.details;
    }
    if (normalized.overnightCruise && !normalized.overnightCruiseDetails) {
      normalized.overnightCruiseDetails = normalized.details;
    }
    if (normalized.nightCruise && !normalized.nightCruiseDetails) {
      normalized.nightCruiseDetails = normalized.details;
    }
  }
  if (normalized.dayCruise && normalized.dayCruiseBookedAmount === undefined) {
    normalized.dayCruiseBookedAmount = normalized.dayCruisePrice;
  }
  if (normalized.overnightCruise && normalized.overnightCruiseBookedAmount === undefined) {
    normalized.overnightCruiseBookedAmount = normalized.overnightCruisePrice;
  }
  if (normalized.nightCruise && normalized.nightCruiseBookedAmount === undefined) {
    normalized.nightCruiseBookedAmount = normalized.nightCruisePrice;
  }
  if (normalized.dayCruiseExtraGuest !== undefined && normalized.dayCruiseExtraGuestQty === undefined) {
    normalized.dayCruiseExtraGuestQty = 1;
  }
  if (normalized.dayCruiseExtraRoom !== undefined && normalized.dayCruiseExtraRoomQty === undefined) {
    normalized.dayCruiseExtraRoomQty = 1;
  }
  if (normalized.overnightExtraBed !== undefined && normalized.overnightExtraBedQty === undefined) {
    normalized.overnightExtraBedQty = 1;
  }
  if (normalized.overnightExtraCot !== undefined && normalized.overnightExtraCotQty === undefined) {
    normalized.overnightExtraCotQty = 1;
  }
  if (normalized.nightCruiseExtraGuest !== undefined && normalized.nightCruiseExtraGuestQty === undefined) {
    normalized.nightCruiseExtraGuestQty = 1;
  }
  if (normalized.nightCruiseExtraRoom !== undefined && normalized.nightCruiseExtraRoomQty === undefined) {
    normalized.nightCruiseExtraRoomQty = 1;
  }
  return normalized;
}

const mockCalendarBookings: Record<string, Record<string, DayBooking>> = {
  "Vembanad Crest": {
    [getDateKey(currentYear, currentMonthIndex, 2)]: normalizeBooking({
      dayCruise: true,
      overnightCruise: false,
      nightCruise: false,
      details: "Corporate day outing for 8 guests.",
      dayCruisePrice: 12500,
    }),
    [getDateKey(currentYear, currentMonthIndex, 5)]: normalizeBooking({
      dayCruise: true,
      overnightCruise: true,
      nightCruise: false,
      details: "Wedding group full-day charter with overnight extension.",
      dayCruisePrice: 14000,
      overnightCruisePrice: 14000,
    }),
    [getDateKey(currentYear, currentMonthIndex, 9)]: normalizeBooking({
      dayCruise: false,
      overnightCruise: true,
      nightCruise: false,
      details: "Family overnight package.",
      overnightCruisePrice: 21000,
    }),
    [getDateKey(currentYear, currentMonthIndex, 13)]: normalizeBooking({
      dayCruise: true,
      overnightCruise: false,
      nightCruise: true,
      details: "Festival special day and night package booking.",
      dayCruisePrice: 11500,
      nightCruisePrice: 12000,
    }),
    [getDateKey(currentYear, currentMonthIndex, 18)]: normalizeBooking({
      dayCruise: false,
      overnightCruise: false,
      nightCruise: true,
      details: "Couple moonlight cruise with dinner.",
      nightCruisePrice: 14500,
    }),
    [getDateKey(currentYear, currentMonthIndex, 24)]: normalizeBooking({
      dayCruise: true,
      overnightCruise: false,
      nightCruise: true,
      details: "Private anniversary plan with sunset and night ride.",
      dayCruisePrice: 12000,
      nightCruisePrice: 14000,
    }),
  },
  "Backwater Pearl": {
    [getDateKey(currentYear, currentMonthIndex, 3)]: normalizeBooking({
      dayCruise: true,
      overnightCruise: false,
      nightCruise: false,
      details: "Corporate retreat.",
      dayCruisePrice: 10800,
    }),
  },
  "Kerala Dream": {
    [getDateKey(currentYear, currentMonthIndex, 10)]: normalizeBooking({
      dayCruise: true,
      overnightCruise: true,
      nightCruise: true,
      details: "Grand celebration booking.",
      dayCruisePrice: 18000,
      overnightCruisePrice: 28000,
      nightCruisePrice: 20000,
    }),
  },
};

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, process.env.NODE_ENV === "test" ? 0 : ms));

export async function fetchBookings(boatName: string): Promise<ApiResponse<BookingRecord[]>> {
  await delay(500);
  const filtered = mockBookings.filter((b) => b.boatName === boatName);
  return { data: filtered, error: null };
}

export async function fetchRequests(boatName: string): Promise<ApiResponse<BookingRequest[]>> {
  await delay(500);
  const filtered = mockRequests.filter((r) => r.boatName === boatName);
  return { data: filtered, error: null };
}

export async function submitRequestOutcome(
  boatName: string,
  guestName: string,
  outcome: "accepted" | "rejected"
): Promise<ApiResponse<BookingRequest>> {
  await delay(600);
  const req = mockRequests.find((r) => r.boatName === boatName && r.name === guestName);
  if (!req) {
    return {
      data: null,
      error: { message: `Request for guest "${guestName}" not found.`, code: "NOT_FOUND" },
    };
  }
  req.outcome = outcome;
  req.status = outcome === "accepted" ? "Confirmed" : "Rejected";
  req.actedOn = `Handled by admin just now`;
  return { data: { ...req }, error: null };
}

export async function fetchCalendarBookings(boatName: string): Promise<ApiResponse<Record<string, DayBooking>>> {
  await delay(500);
  const bookings = mockCalendarBookings[boatName] || {};
  return { data: { ...bookings }, error: null };
}

export async function updateCalendarBookings(
  boatName: string,
  dateKey: string,
  booking: DayBooking
): Promise<ApiResponse<DayBooking>> {
  await delay(500);
  if (!mockCalendarBookings[boatName]) {
    mockCalendarBookings[boatName] = {};
  }
  const normalized = normalizeBooking(booking);
  mockCalendarBookings[boatName][dateKey] = normalized;
  return { data: normalized, error: null };
}

export async function bulkUpdateCalendarPricing(
  boatName: string,
  dateKeys: string[],
  pricing: {
    dayCruisePrice?: number;
    overnightCruisePrice?: number;
    nightCruisePrice?: number;
  }
): Promise<ApiResponse<void>> {
  await delay(600);
  if (!mockCalendarBookings[boatName]) {
    mockCalendarBookings[boatName] = {};
  }

  dateKeys.forEach((key) => {
    const existing = mockCalendarBookings[boatName][key] || {
      dayCruise: false,
      overnightCruise: false,
      nightCruise: false,
      details: "",
    };

    const updated = normalizeBooking({
      ...existing,
      dayCruisePrice: pricing.dayCruisePrice !== undefined ? pricing.dayCruisePrice : existing.dayCruisePrice,
      overnightCruisePrice: pricing.overnightCruisePrice !== undefined ? pricing.overnightCruisePrice : existing.overnightCruisePrice,
      nightCruisePrice: pricing.nightCruisePrice !== undefined ? pricing.nightCruisePrice : existing.nightCruisePrice,
    });

    mockCalendarBookings[boatName][key] = updated;
  });

  return { data: null, error: null };
}

export async function saveAllCalendarBookings(
  boatName: string,
  bookings: Record<string, DayBooking>
): Promise<ApiResponse<void>> {
  mockCalendarBookings[boatName] = bookings;
  return { data: null, error: null };
}
