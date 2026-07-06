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
    boatId: 1,
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
    boatId: 1,
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
    boatId: 2,
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
  {
    id: "booking-lucas-martin",
    guestName: "Lucas Martin",
    boatId: 1,
    boatName: "Vembanad Crest",
    bookingId: "#SC-2025-0043",
    details: [
      ["Cruise type", "Night stay"],
      ["Date & time", `22 ${currentMonthStr} ${currentYear} · 5:00 PM - 10:00 PM`],
      ["Configuration", "Premium · Shared · 6 guests"],
      ["Total agreed price", "INR 14,500"],
      ["Inclusions", "Dinner buffet, music entertainment, soft drinks"],
    ],
    notes: "Shared cruise booking. Check with lead operator for compliance.",
  },
  {
    id: "booking-mason-reed",
    guestName: "Mason Reed",
    boatId: 2,
    boatName: "Backwater Pearl",
    bookingId: "#SC-2025-0051",
    details: [
      ["Cruise type", "Day cruise"],
      ["Date & time", `12 ${currentMonthStr} ${currentYear} · 11:00 AM - 5:00 PM`],
      ["Configuration", "Standard · Private · 3 adults"],
      ["Total agreed price", "INR 10,800"],
      ["Inclusions", "Basic meals, sound system access"],
    ],
    notes: "Standard package booking.",
  },
  {
    id: "booking-ava-stone",
    guestName: "Ava Stone",
    boatId: 2,
    boatName: "Backwater Pearl",
    bookingId: "#SC-2025-0052",
    details: [
      ["Cruise type", "Night stay"],
      ["Date & time", `20 ${currentMonthStr} ${currentYear} · 5:00 PM - 10:00 PM`],
      ["Configuration", "Premium · Shared · 5 guests"],
      ["Total agreed price", "INR 12,000"],
      ["Inclusions", "Dinner, deck lights setup"],
    ],
    notes: "Shared night stay.",
  },
  {
    id: "booking-noah-patel",
    guestName: "Noah Patel",
    boatId: 3,
    boatName: "Kerala Dream",
    bookingId: "#SC-2025-0060",
    details: [
      ["Cruise type", "Overnight stay"],
      ["Date & time", `16 ${currentMonthStr} ${currentYear} · 3:00 PM - Next day 11:00 AM`],
      ["Configuration", "Luxury · Private · 4 adults"],
      ["Total agreed price", "INR 28,000"],
      ["Inclusions", "Premium meals, premium rooms, sundeck access"],
    ],
    notes: "Luxury private stay.",
  },
  {
    id: "booking-liam-carter",
    guestName: "Liam Carter",
    boatId: 3,
    boatName: "Kerala Dream",
    bookingId: "#SC-2025-0061",
    details: [
      ["Cruise type", "Day cruise"],
      ["Date & time", `23 ${currentMonthStr} ${currentYear} · 11:00 AM - 5:00 PM`],
      ["Configuration", "Premium · Private · 2 adults"],
      ["Total agreed price", "INR 12,500"],
      ["Inclusions", "Meals, welcome drinks, soft drinks"],
    ],
    notes: "Premium day outing.",
  },
];

const mockRequests: BookingRequest[] = [
  {
    name: "Ethan Walker",
    boatId: 1,
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
    boatId: 3,
    boatName: "Kerala Dream",
    dateLine: "Received yesterday - Overnight stay · 22 Jan",
    subtitle: "Overnight stay · 22 Jan 2025",
    status: "Pending",
    config: "Price shown to guest: INR 21,000",
    details: "Premium · Private · 4 adults, 1 child · 2 rooms · Room 1: 2 guests · Room 2: 2 guests + 1 extra bed",
  },
  {
    name: "Sofia Turner",
    boatId: 1,
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
    boatId: 2,
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
  normalized.isClosed = normalized.isClosed || false;
  normalized.dayCruiseClosed = normalized.dayCruiseClosed || false;
  normalized.overnightCruiseClosed = normalized.overnightCruiseClosed || false;
  normalized.nightCruiseClosed = normalized.nightCruiseClosed || false;
  
  if (!normalized.configs) {
    normalized.configs = {};
  }
  
  const configNames = ["1BH", "2BH", "3BH", "4BH"];
  configNames.forEach((configName, index) => {
    if (!normalized.configs![configName]) {
      const factor = 1 + index * 0.2; // 1BH = 1.0x, 2BH = 1.2x, 3BH = 1.4x, 4BH = 1.6x
      
      const dayBase = normalized.dayCruisePrice || 12000;
      const overnightBase = normalized.overnightCruisePrice || 22000;
      const nightBase = normalized.nightCruisePrice || 14000;
      
      normalized.configs![configName] = {
        dayCruisePrice: Math.round(dayBase * factor),
        dayCruiseExtraGuest: normalized.dayCruiseExtraGuest ?? 1500,
        dayCruiseExtraRoom: normalized.dayCruiseExtraRoom ?? 2500,
        dayCruiseClosed: normalized.dayCruiseClosed || false,
        
        overnightCruisePrice: Math.round(overnightBase * factor),
        overnightExtraBed: normalized.overnightExtraBed ?? 2000,
        overnightExtraCot: normalized.overnightExtraCot ?? 1500,
        overnightExtraGuest: normalized.overnightExtraGuest ?? 1800,
        overnightExtraRoom: normalized.overnightExtraRoom ?? 3000,
        overnightCruiseClosed: normalized.overnightCruiseClosed || false,
        
        nightCruisePrice: Math.round(nightBase * factor),
        nightCruiseExtraGuest: normalized.nightCruiseExtraGuest ?? 1500,
        nightCruiseExtraRoom: normalized.nightCruiseExtraRoom ?? 2500,
        nightExtraBed: normalized.nightExtraBed ?? 2000,
        nightExtraCot: normalized.nightExtraCot ?? 1500,
        nightCruiseClosed: normalized.nightCruiseClosed || false,
      };
    } else {
      // Ensure closed fields are initialized if config exists but they are missing
      const c = normalized.configs![configName];
      c.dayCruiseClosed = c.dayCruiseClosed || false;
      c.overnightCruiseClosed = c.overnightCruiseClosed || false;
      c.nightCruiseClosed = c.nightCruiseClosed || false;
    }
  });

  // Default booked configs to 1BH if not set but booked is true
  if (normalized.dayCruise && !normalized.dayCruiseBookedConfig) {
    normalized.dayCruiseBookedConfig = "1BH";
  }
  if (normalized.overnightCruise && !normalized.overnightCruiseBookedConfig) {
    normalized.overnightCruiseBookedConfig = "1BH";
  }
  if (normalized.nightCruise && !normalized.nightCruiseBookedConfig) {
    normalized.nightCruiseBookedConfig = "1BH";
  }

  // Sync 1BH config values to top-level fields for backward compatibility
  const c1 = normalized.configs!["1BH"];
  if (c1) {
    normalized.dayCruisePrice = c1.dayCruisePrice;
    normalized.dayCruiseExtraGuest = c1.dayCruiseExtraGuest;
    normalized.dayCruiseExtraRoom = c1.dayCruiseExtraRoom;
    normalized.dayCruiseClosed = c1.dayCruiseClosed;
    normalized.overnightCruisePrice = c1.overnightCruisePrice;
    normalized.overnightExtraBed = c1.overnightExtraBed;
    normalized.overnightExtraCot = c1.overnightExtraCot;
    normalized.overnightExtraGuest = c1.overnightExtraGuest;
    normalized.overnightExtraRoom = c1.overnightExtraRoom;
    normalized.overnightCruiseClosed = c1.overnightCruiseClosed;
    normalized.nightCruisePrice = c1.nightCruisePrice;
    normalized.nightCruiseExtraGuest = c1.nightCruiseExtraGuest;
    normalized.nightCruiseExtraRoom = c1.nightCruiseExtraRoom;
    normalized.nightExtraBed = c1.nightExtraBed;
    normalized.nightExtraCot = c1.nightExtraCot;
    normalized.nightCruiseClosed = c1.nightCruiseClosed;
  }

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
  if (normalized.overnightExtraGuest !== undefined && normalized.overnightExtraGuestQty === undefined) {
    normalized.overnightExtraGuestQty = 1;
  }
  if (normalized.overnightExtraRoom !== undefined && normalized.overnightExtraRoomQty === undefined) {
    normalized.overnightExtraRoomQty = 1;
  }
  if (normalized.nightCruiseExtraGuest !== undefined && normalized.nightCruiseExtraGuestQty === undefined) {
    normalized.nightCruiseExtraGuestQty = 1;
  }
  if (normalized.nightCruiseExtraRoom !== undefined && normalized.nightCruiseExtraRoomQty === undefined) {
    normalized.nightCruiseExtraRoomQty = 1;
  }
  if (normalized.nightExtraBed !== undefined && normalized.nightExtraBedQty === undefined) {
    normalized.nightExtraBedQty = 1;
  }
  if (normalized.nightExtraCot !== undefined && normalized.nightExtraCotQty === undefined) {
    normalized.nightExtraCotQty = 1;
  }
  return normalized;
}

const mockCalendarBookings: Record<number, Record<string, DayBooking>> = {
  1: {
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
  2: {
    [getDateKey(currentYear, currentMonthIndex, 3)]: normalizeBooking({
      dayCruise: true,
      overnightCruise: false,
      nightCruise: false,
      details: "Corporate retreat.",
      dayCruisePrice: 10800,
    }),
  },
  3: {
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

export async function fetchBookings(boatId: number): Promise<ApiResponse<BookingRecord[]>> {
  await delay(500);
  const filtered = mockBookings.filter((b) => b.boatId === boatId);
  return { data: filtered, error: null };
}

export async function fetchRequests(boatId: number): Promise<ApiResponse<BookingRequest[]>> {
  await delay(500);
  const filtered = mockRequests.filter((r) => r.boatId === boatId);
  return { data: filtered, error: null };
}

export async function submitRequestOutcome(
  boatId: number,
  guestName: string,
  outcome: "accepted" | "rejected"
): Promise<ApiResponse<BookingRequest>> {
  await delay(600);
  const req = mockRequests.find((r) => r.boatId === boatId && r.name === guestName);
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

export async function fetchCalendarBookings(boatId: number): Promise<ApiResponse<Record<string, DayBooking>>> {
  await delay(500);
  const bookings = mockCalendarBookings[boatId] || {};
  return { data: { ...bookings }, error: null };
}

export async function updateCalendarBookings(
  boatId: number,
  dateKey: string,
  booking: DayBooking
): Promise<ApiResponse<DayBooking>> {
  await delay(500);
  if (!mockCalendarBookings[boatId]) {
    mockCalendarBookings[boatId] = {};
  }
  const normalized = normalizeBooking(booking);
  mockCalendarBookings[boatId][dateKey] = normalized;
  return { data: normalized, error: null };
}

export async function bulkUpdateCalendarPricing(
  boatId: number,
  dateKeys: string[],
  pricing: {
    dayCruisePrice?: number;
    overnightCruisePrice?: number;
    nightCruisePrice?: number;
  }
): Promise<ApiResponse<void>> {
  await delay(600);
  if (!mockCalendarBookings[boatId]) {
    mockCalendarBookings[boatId] = {};
  }

  dateKeys.forEach((key) => {
    const existing = mockCalendarBookings[boatId][key] || {
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

    mockCalendarBookings[boatId][key] = updated;
  });

  return { data: null, error: null };
}

export async function saveAllCalendarBookings(
  boatId: number,
  bookings: Record<string, DayBooking>
): Promise<ApiResponse<void>> {
  mockCalendarBookings[boatId] = bookings;
  return { data: null, error: null };
}

export async function fetchBookingDetail(bookingId: string): Promise<ApiResponse<BookingRecord>> {
  await delay(400);
  const found = mockBookings.find((b) => b.id === bookingId);
  if (found) {
    return { data: found, error: null };
  }
  return {
    data: null,
    error: { message: `Booking not found for ID: ${bookingId}`, code: "NOT_FOUND" },
  };
}

export async function fetchRequestDetail(requestName: string, boatId: number): Promise<ApiResponse<BookingRequest>> {
  await delay(400);
  const found = mockRequests.find((r) => r.name === requestName && r.boatId === boatId);
  if (found) {
    return { data: found, error: null };
  }
  return {
    data: null,
    error: { message: `Request not found for ${requestName}`, code: "NOT_FOUND" },
  };
}

