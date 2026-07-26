import { ApiResponse } from "../data/auth";
import { Booking } from "../data/bookings";
import { bookings } from "./bookings";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Searches bookings (simulating an API call with dummy data)
 */
export async function searchBookingsApi(query: string): Promise<ApiResponse<Booking[]>> {
  // Simulate network latency
  await delay(300);

  if (!query || query.trim() === "") {
    return { data: [], error: null };
  }

  const cleanQuery = query.toLowerCase().trim();

  // Search bookings by guest name, booking ID, or boat name
  const filtered = bookings.filter((b) => {
    const guestMatch = b.guest ? b.guest.toLowerCase().includes(cleanQuery) : false;
    const idMatch = b.bookingId ? b.bookingId.toLowerCase().includes(cleanQuery) : false;
    const boatMatch = b.boat ? b.boat.toLowerCase().includes(cleanQuery) : false;
    return guestMatch || idMatch || boatMatch;
  });

  return { data: filtered, error: null };
}
