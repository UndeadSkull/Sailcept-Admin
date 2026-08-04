import { ApiResponse, PageResponse } from "../data/auth";
import { Booking, BlockedDate, BookingRequest, DayBooking, DietEntry } from "../data/bookings";
export type { Booking, BlockedDate, BookingRequest, DayBooking, DietEntry };
import { mockBoats } from "./boats";
export { reviews, fetchReviews, initialReviews } from "./reviews";
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

// Mock data from mockup
export const initialBookings: Booking[] = [
  { id: 10, bookingId: "ALP-03062026-0130", guest: "Daniel Foster", phone: "+44 7700 900130", boat: "Lake Ripples", type: "Overnight stay", date: "3 Jun 2026", dateEnd: "4 Jun 2026", comfort: "Luxury", mode: "Private", adults: 2, children: 0, rooms: 1, dietBreakdown: [{ type: "Veg", count: 2 }], accessibility: "None", specialRequests: ["Parking needed"], price: 22500, ghat: "Finishing Point, Alappuzha", checkIn: "12:00", checkOut: "09:00", meal: "Veg only", paymentStatus: "Captured" },
  { id: 11, bookingId: "ALP-10062026-0136", guest: "Maria Santos", phone: "+34 612 345 678", boat: "Lake Royale", type: "Day cruise", date: "10 Jun 2026", dateEnd: "10 Jun 2026", comfort: "Premium", mode: "Shared", adults: 3, children: 1, rooms: 2, dietBreakdown: [{ type: "Non-veg", count: 3 }, { type: "Veg", count: 1 }], accessibility: "None", specialRequests: ["Extra dishes"], price: 19800, ghat: "Punnamada Jetty, Alappuzha", checkIn: "09:00", checkOut: "16:00", meal: "Non-veg", paymentStatus: "Captured" },
  { id: 1, bookingId: "ALP-15062026-0142", guest: "Ethan Walker", phone: "+44 7700 900142", boat: "Lake Ripples", type: "Day cruise", date: "15 Jun 2026", dateEnd: "15 Jun 2026", comfort: "Premium", mode: "Private", adults: 2, children: 0, rooms: 1, dietBreakdown: [{ type: "Veg", count: 2 }], accessibility: "None", specialRequests: [], price: 15800, ghat: "Finishing Point, Alappuzha", checkIn: "08:30", checkOut: "17:00", meal: "Veg only", paymentStatus: "Captured" },
  { id: 12, bookingId: "ALP-17062026-0145", guest: "Sara Kim", phone: "+82 10 1234 5678", boat: "Lake Riviera", type: "Day cruise", date: "17 Jun 2026", dateEnd: "17 Jun 2026", comfort: "Deluxe", mode: "Private", adults: 2, children: 0, rooms: 1, dietBreakdown: [{ type: "Jain", count: 1 }, { type: "Veg", count: 1 }], accessibility: "None", specialRequests: ["Speedboat"], price: 17200, ghat: "Finishing Point, Alappuzha", checkIn: "09:00", checkOut: "16:00", meal: "Veg only", paymentStatus: "Captured" },
  { id: 2, bookingId: "ALP-18062026-0149", guest: "Olivia Bennett", phone: "+33 6 12 34 56 78", boat: "Lake Royale", type: "Overnight stay", date: "18 Jun 2026", dateEnd: "19 Jun 2026", comfort: "Luxury", mode: "Private", adults: 2, children: 2, kids: 1, rooms: 2, dietBreakdown: [{ type: "Non-veg", count: 2 }, { type: "Halal", count: 2 }], accessibility: "None", specialRequests: ["Birthday cake", "Country boat"], price: 26500, ghat: "Punnamada Jetty, Alappuzha", checkIn: "12:00", checkOut: "09:00", meal: "Non-veg, no shellfish", paymentStatus: "Captured" },
  { id: 3, bookingId: "ALP-22062026-0151", guest: "Lucas Martin", phone: "+1 415 555 0151", boat: "Lake Riviera", type: "Night stay", date: "22 Jun 2026", dateEnd: "23 Jun 2026", comfort: "Premium", mode: "Shared", adults: 4, children: 2, rooms: 3, dietBreakdown: [{ type: "Non-veg", count: 4 }, { type: "Veg", count: 2 }], accessibility: "Reduced mobility", specialRequests: ["Parking needed", "Massage"], price: 31000, ghat: "Finishing Point, Alappuzha", checkIn: "17:00", checkOut: "08:00", meal: "No restrictions noted", paymentStatus: "Pending" },
  { id: 13, bookingId: "ALP-19062026-0162", guest: "Noah Bennett", phone: "+44 7700 900162", boat: "Lake Riviera", type: "Day cruise", date: "19 Jun 2026", dateEnd: "19 Jun 2026", comfort: "Premium", mode: "Private", adults: 2, children: 0, rooms: 1, dietBreakdown: [{ type: "Veg", count: 2 }], accessibility: "None", specialRequests: ["Kayaking"], price: 16500, ghat: "Finishing Point, Alappuzha", checkIn: "09:00", checkOut: "16:00", meal: "Veg only", paymentStatus: "Captured" },
  { id: 14, bookingId: "ALP-24062026-0163", guest: "Isabella Cruz", phone: "+34 612 987 654", boat: "Lake Riviera", type: "Overnight stay", date: "24 Jun 2026", dateEnd: "25 Jun 2026", comfort: "Luxury", mode: "Private", adults: 2, children: 1, rooms: 1, dietBreakdown: [{ type: "Non-veg", count: 3 }], accessibility: "None", specialRequests: ["Honeymoon cake"], price: 24000, ghat: "Finishing Point, Alappuzha", checkIn: "12:00", checkOut: "09:00", meal: "Non-veg", paymentStatus: "Captured" },
  { id: 15, bookingId: "ALP-27062026-0164", guest: "Ravi Shankar", phone: "+91 98201 23456", boat: "Lake Riviera", type: "Day cruise", date: "27 Jun 2026", dateEnd: "27 Jun 2026", comfort: "Deluxe", mode: "Shared", adults: 3, children: 0, rooms: 1, dietBreakdown: [{ type: "Veg", count: 3 }], accessibility: "None", specialRequests: ["Country boat"], price: 18900, ghat: "Finishing Point, Alappuzha", checkIn: "09:00", checkOut: "16:00", meal: "Veg only", paymentStatus: "Captured" },
  { id: 20, bookingId: "ALP-05082026-0171", guest: "Karan Mehta", phone: "+91 98111 22334", boat: "Lake Royale", type: "Day cruise", date: "5 Aug 2026", dateEnd: "5 Aug 2026", comfort: "Premium", mode: "Private", adults: 2, children: 0, rooms: 1, dietBreakdown: [{ type: "Veg", count: 2 }], accessibility: "None", specialRequests: [], price: 17500, ghat: "Punnamada Jetty, Alappuzha", checkIn: "09:00", checkOut: "16:00", meal: "Veg only", paymentStatus: "Refunded", status: "cancelled", cancelledAt: new Date(2026, 6, 30, 11, 15) },
  { id: 21, bookingId: "ALP-12082026-0173", guest: "Sophie Laurent", phone: "+33 6 98 76 54 32", boat: "Lake Riviera", type: "Overnight stay", date: "12 Aug 2026", dateEnd: "13 Aug 2026", comfort: "Luxury", mode: "Private", adults: 2, children: 1, rooms: 1, dietBreakdown: [{ type: "Non-veg", count: 3 }], accessibility: "None", specialRequests: ["Honeymoon cake"], price: 29500, ghat: "Finishing Point, Alappuzha", checkIn: "12:00", checkOut: "09:00", meal: "Non-veg", paymentStatus: "Refunded", status: "cancelled", cancelledAt: new Date(2026, 7, 2, 16, 40) },
  { id: 22, bookingId: "ALP-22062026-0175", guest: "Rohan Desai", phone: "+91 98450 11223", boat: "Lake Riviera", type: "Day cruise", date: "22 Jun 2026", dateEnd: "22 Jun 2026", comfort: "Premium", mode: "Private", adults: 2, children: 0, rooms: 1, dietBreakdown: [{ type: "Veg", count: 2 }], accessibility: "None", specialRequests: [], price: 15500, ghat: "Finishing Point, Alappuzha", checkIn: "09:00", checkOut: "16:00", meal: "Veg only", paymentStatus: "Captured" },
  { id: 23, bookingId: "AB-28062026-4471", guest: "Neha Kapoor", phone: "+91 98220 55671", boat: "Lake Royale", type: "Overnight stay", date: "28 Jun 2026", dateEnd: "30 Jun 2026", comfort: "Premium", mode: "Private", adults: 2, children: 1, rooms: 2, dietBreakdown: [{ type: "Veg", count: 3 }], accessibility: "None", specialRequests: [], price: 31500, ghat: "Punnamada Jetty, Alappuzha", checkIn: "12:00", checkOut: "09:00", meal: "Veg only", paymentStatus: "Captured", isDirect: true, bookingSource: "Make My Trip" },
  { id: 24, bookingId: "AB-25062026-8302", guest: "Vikram Shah", phone: "+91 99876 54321", boat: "Floating Dreams", type: "Day cruise", date: "25 Jun 2026", dateEnd: "25 Jun 2026", comfort: "Deluxe", mode: "Private", adults: 4, children: 0, rooms: 3, dietBreakdown: [{ type: "Non-veg", count: 4 }], accessibility: "None", specialRequests: [], price: 19500, ghat: "Finishing Point, Alappuzha", checkIn: "11:00", checkOut: "17:00", meal: "Non-veg", paymentStatus: "Captured", isDirect: true, bookingSource: "Direct Booking" },
  { id: 25, bookingId: "ALP-30062026-0182", guest: "Priyanka Reddy", phone: "+91 98123 45678", boat: "Lake Ripples", type: "Day cruise", date: "30 Jun 2026", dateEnd: "30 Jun 2026", comfort: "Premium", mode: "Private", adults: 2, children: 1, rooms: 1, dietBreakdown: [{ type: "Veg", count: 3 }], accessibility: "None", specialRequests: ["Massage"], updatedSpecialRequests: ["Massage"], price: 16500, ghat: "Punnamada Jetty, Alappuzha", checkIn: "09:00", checkOut: "16:00", meal: "Veg only", paymentStatus: "Captured", isUpdated: true },
  { id: 26, bookingId: "AB-23062026-7741", guest: "Fatima Al Zaabi", phone: "+971 50 123 4567", boat: "Whale Cruise", type: "Day cruise", date: "23 Jun 2026", dateEnd: "23 Jun 2026", comfort: "Deluxe", mode: "Shared", adults: 8, children: 2, rooms: 5, dietBreakdown: [{ type: "Halal", count: 10 }], accessibility: "None", specialRequests: [], price: 32500, ghat: "Punnamada Jetty, Alappuzha", checkIn: "11:00", checkOut: "17:00", meal: "Non-veg", paymentStatus: "Captured", isDirect: true, bookingSource: "Direct Booking" },
  { id: 27, bookingId: "ALP-05072026-0201", guest: "Arjun Mehta", phone: "+91 98100 22334", boat: "Lake Riviera", type: "Overnight stay", date: "5 Jul 2026", dateEnd: "6 Jul 2026", adults: 4, children: 0, kids: 0, rooms: 2, cots: 0, dietBreakdown: [{ type: "Vegetarian", count: 4 }], accessibility: "None", specialRequests: [], price: 28000, ghat: "Punnamada Jetty, Alappuzha", checkIn: "12:00", checkOut: "09:00", meal: "Veg", paymentStatus: "Captured", status: "confirmed", isDirect: false, bookingSource: "Sailcept" },
  { id: 28, bookingId: "ALP-12072026-0202", guest: "Priya Sharma", phone: "+91 99001 55678", boat: "Floating Dreams", type: "Night stay", date: "12 Jul 2026", dateEnd: "13 Jul 2026", adults: 6, children: 2, kids: 0, rooms: 3, cots: 1, dietBreakdown: [{ type: "Non-veg", count: 6 }, { type: "Vegetarian", count: 2 }], accessibility: "None", specialRequests: [], price: 45000, ghat: "Punnamada Jetty, Alappuzha", checkIn: "17:30", checkOut: "09:00", meal: "Mixed", paymentStatus: "Captured", status: "confirmed", isDirect: false, bookingSource: "Sailcept" },
  { id: 29, bookingId: "ALP-18072026-0203", guest: "Tom Hughes", phone: "+44 7700 900123", boat: "Lake Royale", type: "Overnight stay", date: "18 Jul 2026", dateEnd: "19 Jul 2026", adults: 2, children: 0, kids: 0, rooms: 1, cots: 0, dietBreakdown: [{ type: "Non-veg", count: 2 }], accessibility: "None", specialRequests: [], price: 18500, ghat: "Punnamada Jetty, Alappuzha", checkIn: "12:00", checkOut: "09:00", meal: "Non-veg", paymentStatus: "Captured", status: "confirmed", isDirect: false, bookingSource: "Sailcept" },
  { id: 30, bookingId: "ALP-25072026-0204", guest: "Meera Nair", phone: "+91 94470 11223", boat: "Lake Ripples", type: "Day cruise", date: "25 Jul 2026", dateEnd: "25 Jul 2026", adults: 2, children: 1, kids: 0, rooms: 1, cots: 0, dietBreakdown: [{ type: "Vegetarian", count: 3 }], accessibility: "None", specialRequests: [], price: 12000, ghat: "Punnamada Jetty, Alappuzha", checkIn: "11:30", checkOut: "17:00", meal: "Veg", paymentStatus: "Captured", status: "confirmed", isDirect: false, bookingSource: "Sailcept" },
  { id: 31, bookingId: "ALP-08072026-0205", guest: "Lena Fischer", phone: "+49 170 9876543", boat: "Lake Royale", type: "Overnight stay", date: "8 Jul 2026", dateEnd: "9 Jul 2026", adults: 2, children: 0, kids: 0, rooms: 1, cots: 0, dietBreakdown: [{ type: "Veg", count: 2 }], accessibility: "None", specialRequests: [], price: 18500, ghat: "Punnamada Jetty, Alappuzha", checkIn: "12:00", checkOut: "09:00", meal: "Veg only", paymentStatus: "Refunded", status: "cancelled", cancelledAt: new Date(2026, 6, 2, 10, 30), isDirect: false, bookingSource: "Sailcept" },
  { id: 32, bookingId: "AB-14072026-5521", guest: "Rajesh Nambiar", phone: "+91 98400 77612", boat: "Floating Dreams", type: "Overnight stay", date: "14 Jul 2026", dateEnd: "15 Jul 2026", adults: 4, children: 1, kids: 0, rooms: 3, cots: 0, dietBreakdown: [{ type: "Non-veg", count: 3 }, { type: "Veg", count: 2 }], accessibility: "None", specialRequests: ["Extra dishes"], price: 38000, ghat: "Punnamada Jetty, Alappuzha", checkIn: "12:00", checkOut: "09:00", meal: "Mixed", paymentStatus: "Captured", status: "confirmed", isDirect: true, bookingSource: "Make My Trip" },
  { id: 33, bookingId: "ALP-09062026-0210", guest: "Clara Dubois", phone: "+33 6 45 67 89 01", boat: "Lake Riviera", type: "Day cruise", date: "9 Jun 2026", dateEnd: "9 Jun 2026", adults: 2, children: 0, kids: 0, rooms: 2, cots: 0, dietBreakdown: [{ type: "Veg", count: 2 }], accessibility: "None", specialRequests: ["Kayaking"], updatedSpecialRequests: ["Kayaking"], price: 17500, ghat: "Finishing Point, Alappuzha", checkIn: "09:00", checkOut: "16:00", meal: "Veg only", paymentStatus: "Captured", isUpdated: true },
  { id: 34, bookingId: "ALP-11062026-0211", guest: "Samuel Okonkwo", phone: "+234 803 123 4567", boat: "Lake Royale", type: "Day cruise", date: "11 Jun 2026", dateEnd: "11 Jun 2026", adults: 2, children: 1, kids: 0, rooms: 1, cots: 0, dietBreakdown: [{ type: "Non-veg", count: 3 }], accessibility: "None", specialRequests: [], price: 16000, ghat: "Punnamada Jetty, Alappuzha", checkIn: "09:00", checkOut: "16:00", meal: "Non-veg", paymentStatus: "Refunded", status: "cancelled", cancelledAt: new Date(2026, 5, 8, 14, 0) },
  { id: 35, bookingId: "AB-14062026-0212", guest: "Yuki Tanaka", phone: "+81 90 1234 5678", boat: "Lake Ripples", type: "Overnight stay", date: "14 Jun 2026", dateEnd: "15 Jun 2026", adults: 2, children: 0, kids: 0, rooms: 1, cots: 0, dietBreakdown: [{ type: "Veg", count: 2 }], accessibility: "None", specialRequests: [], price: 22000, ghat: "Finishing Point, Alappuzha", checkIn: "12:00", checkOut: "09:00", meal: "Veg only", paymentStatus: "Captured", status: "deleted", isDirect: true, bookingSource: "Direct Booking" },
  { id: 36, bookingId: "AB-20062026-0213", guest: "Marco Ferretti", phone: "+39 333 987 6543", boat: "Floating Dreams", type: "Day cruise", date: "20 Jun 2026", dateEnd: "20 Jun 2026", adults: 3, children: 0, kids: 0, rooms: 3, cots: 0, dietBreakdown: [{ type: "Non-veg", count: 3 }], accessibility: "None", specialRequests: ["Speedboat"], price: 21000, ghat: "Finishing Point, Alappuzha", checkIn: "11:00", checkOut: "17:00", meal: "Non-veg", paymentStatus: "Captured", status: "deleted", isDirect: true, bookingSource: "Booking.com" },
  { id: 38, bookingId: "AB-21062026-6634", guest: "Karim Benali", phone: "+33 6 22 33 44 55", boat: "Lake Ripples", type: "Night stay", date: "21 Jun 2026", dateEnd: "22 Jun 2026", adults: 2, children: 0, kids: 0, rooms: 1, cots: 0, dietBreakdown: [{ type: "Non-veg", count: 2 }], accessibility: "None", specialRequests: [], price: 24500, ghat: "Finishing Point, Alappuzha", checkIn: "17:30", checkOut: "09:00", meal: "Non-veg", paymentStatus: "Captured", status: "confirmed", isDirect: true, isEdited: true, bookingSource: "Airbnb" },
];

export const initialRequests: Booking[] = [
  { id: 1, bookingId: "ALP-25062026-0156", guest: "Priya Nair", phone: "+91 98765 43210", boat: "Lake Riviera", type: "Overnight stay", date: "25 Jun 2026", dateEnd: "26 Jun 2026", comfort: "Deluxe", mode: "Private", adults: 2, children: 0, kids: 0, rooms: 1, dietBreakdown: [{ type: "Vegan", count: 1 }, { type: "Veg", count: 1 }], accessibility: "None", specialRequests: ["Honeymoon cake", "Kayaking"], price: 18500, requestedAt: new Date("2026-06-18T09:00:00") },
  { id: 2, bookingId: "ALP-28062026-0158", guest: "Tom Hughes", phone: "+44 7700 900158", boat: "Lake Ripples", type: "Day cruise", date: "28 Jun 2026", dateEnd: "28 Jun 2026", comfort: "Premium", mode: "Private", adults: 2, children: 0, kids: 0, rooms: 1, dietBreakdown: [{ type: "Non-veg", count: 2 }], accessibility: "Wheelchair", specialRequests: ["Parking needed", "Speedboat"], price: 16800, requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 - 15 * 60 * 1000) },
  { id: 3, bookingId: "ALP-01072026-0160", guest: "Aisha Khan", phone: "+971 50 123 4567", boat: "Lake Royale", type: "Overnight stay", date: "1 Jul 2026", dateEnd: "2 Jul 2026", comfort: "Luxury", mode: "Private", adults: 4, children: 0, kids: 0, rooms: 2, dietBreakdown: [{ type: "Halal", count: 3 }, { type: "Veg", count: 1 }], accessibility: "Reduced mobility", specialRequests: ["Extra dishes", "Massage", "Country boat"], price: 32000, requestedAt: new Date(Date.now() - 8 * 60 * 60 * 1000) },
];

export const initialRequestHistory: Booking[] = [
  { id: 4, bookingId: "ALP-10062026-0138", guest: "James Carter", phone: "+1 212 555 0190", boat: "Lake Ripples", type: "Day cruise", date: "10 Jun 2026", dateEnd: "10 Jun 2026", comfort: "Premium", mode: "Private", adults: 2, children: 0, kids: 0, rooms: 1, dietBreakdown: [{ type: "Veg", count: 2 }], accessibility: "None", specialRequests: ["Parking needed"], price: 16200, outcome: "accepted", requestedAt: new Date("2026-06-09T09:00:00"), decidedAt: new Date("2026-06-09T16:00:00") },
  { id: 5, bookingId: "ALP-12062026-0140", guest: "Layla Haddad", phone: "+971 50 987 6543", boat: "Lake Royale", type: "Overnight stay", date: "12 Jun 2026", dateEnd: "13 Jun 2026", comfort: "Deluxe", mode: "Shared", adults: 3, children: 1, kids: 0, rooms: 2, dietBreakdown: [{ type: "Jain", count: 2 }, { type: "Veg", count: 2 }], accessibility: "None", specialRequests: ["Birthday cake", "Massage"], price: 21500, outcome: "declined", requestedAt: new Date("2026-06-10T20:00:00"), decidedAt: new Date("2026-06-11T09:30:00") },
  { id: 6, bookingId: "ALP-13062026-0141", guest: "Marco Rossi", phone: "+39 339 123 4567", boat: "Lake Riviera", type: "Night stay", date: "13 Jun 2026", dateEnd: "14 Jun 2026", comfort: "Luxury", mode: "Private", adults: 2, children: 0, kids: 0, rooms: 1, dietBreakdown: [{ type: "Non-veg", count: 2 }], accessibility: "None", specialRequests: ["Honeymoon cake"], price: 28000, outcome: "accepted", requestedAt: new Date("2026-06-12T08:15:00"), decidedAt: new Date("2026-06-12T18:45:00") },
  { id: 7, bookingId: "ALP-16062026-0144", guest: "Hannah Müller", phone: "+49 170 1234567", boat: "Floating Dreams", type: "Day cruise", date: "16 Jun 2026", dateEnd: "16 Jun 2026", comfort: "Premium", mode: "Shared", adults: 4, children: 0, kids: 0, rooms: 2, dietBreakdown: [{ type: "Vegan", count: 1 }, { type: "Veg", count: 3 }], accessibility: "Wheelchair", specialRequests: ["Parking needed", "Country boat"], price: 19800, outcome: "declined", requestedAt: new Date("2026-06-14T19:30:00"), decidedAt: new Date("2026-06-15T11:00:00") },
  { id: 8, bookingId: "ALP-08062026-0209", guest: "Pierre Moreau", phone: "+33 6 11 22 33 44", boat: "Lake Riviera", type: "Day cruise", date: "8 Jun 2026", dateEnd: "8 Jun 2026", comfort: "Luxury", mode: "Private", adults: 2, children: 0, kids: 0, rooms: 2, dietBreakdown: [{ type: "Veg", count: 2 }], accessibility: "None", specialRequests: [], price: 17000, outcome: "accepted", requestedAt: new Date("2026-06-07T08:00:00"), decidedAt: new Date("2026-06-07T15:30:00") },
];

export const initialBlockedDates = [
  { boat: "Lake Ripples", date: "26 Jun 2026", reason: "direct", tripType: "Day Cruise" },
  { boat: "Lake Royale", date: "28 Jun 2026", reason: "direct", tripType: "Overnight Stay" },
  { boat: "Lake Royale", date: "29 Jun 2026", reason: "direct", tripType: "Overnight Stay" },
  { boat: "Floating Dreams", date: "25 Jun 2026", reason: "direct", tripType: "Day Cruise" },
];

export const initialDateOpenState: Record<string, boolean> = {
  "Lake Royale|29 Jun 2026": true,
};

// In-memory databases
export let bookings = [...initialBookings];
export let requests = [...initialRequests];
export let requestHistory = [...initialRequestHistory];
export let blockedDates = [...initialBlockedDates];
export let dateOpenState = { ...initialDateOpenState };
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

export function isContactUnlocked(tripDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const trip = new Date(tripDate);
  trip.setHours(0, 0, 0, 0);
  const daysUntilTrip = (trip.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
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

// Service APIs
const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, process.env.NODE_ENV === "test" ? 0 : ms));

export async function fetchBookings(boatId: number): Promise<ApiResponse<Booking[]>> {
  await delay(400);
  const boatName = BOAT_NAME_MAP[boatId];
  if (boatId === 0 || !boatName) {
    return { data: bookings, error: null };
  }
  const filtered = bookings.filter((b) => b.boat === boatName);
  return { data: filtered, error: null };
}

export async function fetchRequests(boatId: number): Promise<ApiResponse<Booking[]>> {
  await delay(400);
  const boatName = BOAT_NAME_MAP[boatId];
  if (boatId === 0 || !boatName) {
    return { data: requests, error: null };
  }
  const filtered = requests.filter((r) => r.boat === boatName);
  return { data: filtered, error: null };
}

export async function fetchRequestHistory(boatId: number): Promise<ApiResponse<Booking[]>> {
  await delay(400);
  const boatName = BOAT_NAME_MAP[boatId];
  if (boatId === 0 || !boatName) {
    return { data: requestHistory, error: null };
  }
  const filtered = requestHistory.filter((r) => r.boat === boatName);
  return { data: filtered, error: null };
}

export async function submitRequestOutcome(
  idOrBoatId: number,
  outcomeOrGuestName: any,
  outcomeIfThreeArgs?: "accepted" | "declined" | "rejected"
): Promise<ApiResponse<Booking>> {
  await delay(500);

  let targetId = idOrBoatId;
  let targetOutcome = outcomeOrGuestName;

  if (outcomeIfThreeArgs !== undefined) {
    const boatName = BOAT_NAME_MAP[idOrBoatId] || "";
    const guestName = outcomeOrGuestName;
    const req = requests.find(r => r.guest === guestName && (idOrBoatId === 0 || r.boat === boatName));
    if (!req) {
      return { data: null, error: { message: "Request not found", code: "NOT_FOUND" } };
    }
    targetId = req.id;
    targetOutcome = outcomeIfThreeArgs === "rejected" ? "declined" : outcomeIfThreeArgs;
  } else {
    if (targetOutcome === "rejected" || targetOutcome === "declined") {
      targetOutcome = "declined";
    }
  }

  const reqIdx = requests.findIndex((r) => r.id === targetId);
  if (reqIdx === -1) {
    return { data: null, error: { message: "Request not found", code: "NOT_FOUND" } };
  }
  const req = requests[reqIdx];
  requests.splice(reqIdx, 1);
  const decided = {
    ...req,
    outcome: targetOutcome,
    decidedAt: new Date(),
    status: targetOutcome === "accepted" ? "confirmed" : "declined"
  };
  requestHistory.push(decided);
  if (targetOutcome === "accepted") {
    bookings.push({
      ...decided,
      bookingSource: decided.bookingSource || "Sailcept"
    });
    // Add to blocked dates
    const dbDates: string[] = [];
    if (decided.type === "Overnight stay") {
      let cursor = new Date(decided.date);
      const lastBlockedDate = new Date(decided.dateEnd);
      lastBlockedDate.setDate(lastBlockedDate.getDate() - 1);
      while (cursor <= lastBlockedDate) {
        dbDates.push(cursor.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).replace(/,/g, ""));
        cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
      }
    } else {
      dbDates.push(decided.date);
    }
    dbDates.forEach(date => {
      dateOpenState[`${decided.boat}|${date}`] = true;
      blockedDates.push({
        boat: decided.boat,
        date,
        reason: "direct",
        tripType: decided.type === "Day cruise" ? "Day Cruise" : decided.type === "Overnight stay" ? "Overnight Stay" : "Night Stay"
      });
    });
  }
  return { data: decided, error: null };
}

export async function updateCalendarBookingsStore(
  newBookings: Booking[],
  newBlockedDates: typeof blockedDates,
  newDateOpenState: typeof dateOpenState
) {
  bookings = [...newBookings];
  blockedDates = [...newBlockedDates];
  dateOpenState = { ...newDateOpenState };
  dateTripPricing = buildBackfilledPricing(bookings);
  return { data: null, error: null };
}

export async function saveDirectBooking(booking: Booking): Promise<ApiResponse<Booking>> {
  await delay(500);
  const isEditing = bookings.some(b => b.id === booking.id);
  
  const dbDates: string[] = [];
  const availabilityType = booking.type === "Day cruise" ? "Day Cruise" : booking.type === "Overnight stay" ? "Overnight Stay" : "Night Stay";
  
  if (booking.type === "Overnight stay") {
    let cursor = new Date(booking.date);
    const lastBlockedDate = new Date(booking.dateEnd);
    lastBlockedDate.setDate(lastBlockedDate.getDate() - 1);
    while (cursor <= lastBlockedDate) {
      dbDates.push(cursor.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).replace(/,/g, ""));
      cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
    }
  } else {
    dbDates.push(booking.date);
  }

  if (!booking.bookingId || !booking.bookingId.match(/^AB-\d{8}-\d{4}$/)) {
    booking.bookingId = formatABBookingId(booking.date);
  }

  if (isEditing) {
    bookings = bookings.map(b => b.id === booking.id ? booking : b);
    // Remove old blocked dates and write new ones
    blockedDates = [
      ...blockedDates.filter(bd => !(bd.boat === booking.boat && bd.reason === "direct" && bd.tripType === availabilityType)),
      ...dbDates.map(date => ({ boat: booking.boat, date, reason: "direct", tripType: availabilityType }))
    ];
  } else {
    bookings.push(booking);
    blockedDates = [
      ...blockedDates,
      ...dbDates.map(date => ({ boat: booking.boat, date, reason: "direct", tripType: availabilityType }))
    ];
  }

  dbDates.forEach(date => {
    dateOpenState[`${booking.boat}|${date}`] = true;
  });

  dateTripPricing = buildBackfilledPricing(bookings);
  return { data: booking, error: null };
}

export async function deleteBooking(id: number): Promise<ApiResponse<void>> {
  await delay(500);
  const booking = bookings.find(b => b.id === id);
  if (!booking) return { data: null, error: { message: "Booking not found", code: "NOT_FOUND" } };
  
  bookings = bookings.map(b => b.id === id ? { ...b, status: "deleted" } : b);
  
  const availabilityType = booking.type === "Day cruise" ? "Day Cruise" : booking.type === "Overnight stay" ? "Overnight Stay" : "Night Stay";
  const datesToFree: string[] = [];
  if (booking.type === "Overnight stay") {
    let cursor = new Date(booking.date);
    const lastBlockedDate = new Date(booking.dateEnd);
    lastBlockedDate.setDate(lastBlockedDate.getDate() - 1);
    while (cursor <= lastBlockedDate) {
      datesToFree.push(cursor.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).replace(/,/g, ""));
      cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
    }
  } else {
    datesToFree.push(booking.date);
  }

  blockedDates = blockedDates.filter(bd => !(bd.boat === booking.boat && datesToFree.includes(bd.date) && bd.reason === "direct" && bd.tripType === availabilityType));
  dateTripPricing = buildBackfilledPricing(bookings);
  
  return { data: null, error: null };
}

export async function fetchBookingDetail(bookingId: string): Promise<ApiResponse<Booking>> {
  const apiRes = await fetchBookingDetailByIdApi(bookingId);
  if (apiRes.data) return { data: apiRes.data as any, error: null };
  await delay(100);
  const booking = bookings.find((b) => b.bookingId === bookingId);
  if (!booking) return { data: null, error: { message: "Booking not found", code: "NOT_FOUND" } };
  return { data: booking, error: null };
}

export async function fetchRequestDetail(requestName: string, boatId: number): Promise<ApiResponse<Booking>> {
  const boatName = BOAT_NAME_MAP[boatId] || "";
  const req = requests.find(r => (r.guest === requestName || r.bookingId === requestName) && (boatId === 0 || r.boat === boatName));
  if (req?.bookingId) {
    const apiRes = await fetchRequestDetailByIdApi(req.bookingId);
    if (apiRes.data) return { data: apiRes.data as any, error: null };
  }
  await delay(100);
  if (!req) return { data: null, error: { message: "Request not found", code: "NOT_FOUND" } };
  return { data: req, error: null };
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

