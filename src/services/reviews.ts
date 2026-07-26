import { ApiResponse } from "../data/auth";
import { Review } from "../data/reviews";

export const initialReviews: Review[] = [
  { id: "r1", boat: "Lake Ripples", guest: "Daniel Foster", rating: 5, cruiseType: "Overnight Stay", date: "3 Jun 2026", text: "Absolutely magical experience. The crew was incredibly attentive and the food was outstanding. Waking up on the backwaters at sunrise is something I'll never forget. Highly recommend Lake Ripples to anyone visiting Kerala." },
  { id: "r2", boat: "Lake Ripples", guest: "Amara Osei", rating: 4, cruiseType: "Day Cruise", date: "11 Jun 2026", text: "Really lovely day on the water. The houseboat was clean and comfortable, and the staff were friendly throughout. The lunch served was fresh and delicious. Overall a wonderful experience on the backwaters." },
  { id: "r3", boat: "Lake Ripples", guest: "Priyanka Reddy", rating: 5, cruiseType: "Day Cruise", date: "30 Jun 2026", text: "Perfect from start to finish. The crew anticipated every need and the scenery along the route was stunning. The freshly prepared fish curry for lunch was one of the best meals we've had in Kerala." },
  { id: "r4", boat: "Lake Royale", guest: "Maria Santos", rating: 5, cruiseType: "Day Cruise", date: "10 Jun 2026", text: "Lake Royale exceeded all expectations. The attention to detail was impressive — from the floral decorations to the personalised menu. Felt like a five-star hotel on water. Our guide was knowledgeable and made the whole journey special." },
  { id: "r5", boat: "Lake Royale", guest: "Olivia Bennett", rating: 5, cruiseType: "Overnight Stay", date: "18 Jun 2026", text: "We celebrated our anniversary here and it was perfect. Sailcept organised a birthday cake as requested and the crew sang for us. The rooms were spacious and the AC worked well throughout the night. Will definitely return." },
  { id: "r6", boat: "Lake Royale", guest: "Layla Haddad", rating: 4, cruiseType: "Overnight Stay", date: "12 Jun 2026", text: "Beautiful boat with great amenities. The food was varied and catered well to our dietary requirements. Staff were very helpful and accommodating throughout — made us feel genuinely welcome from the moment we boarded." },
  { id: "r7", boat: "Lake Riviera", guest: "Isabella Cruz", rating: 5, cruiseType: "Overnight Stay", date: "24 Jun 2026", text: "Truly one of the best experiences of our Kerala trip. The Lake Riviera is a beautiful vessel and the crew made us feel so welcome. The evening anchoring spot was peaceful and the stars were incredible. Breakfast in the morning was a highlight." },
  { id: "r8", boat: "Lake Riviera", guest: "Rohan Desai", rating: 4, cruiseType: "Day Cruise", date: "22 Jun 2026", text: "Great day cruise on the backwaters. The boat was spacious and well-equipped. Our guide pointed out local bird species and gave interesting commentary about village life along the route. A very authentic Kerala experience." },
  { id: "r9", boat: "Lake Riviera", guest: "Aisha Khan", rating: 5, cruiseType: "Night Stay", date: "3 Jul 2026", text: "The night stay was an experience unlike anything else. Drifting to sleep on the quiet backwaters and waking up to birdsong was magical. The crew had breakfast ready the moment we stirred. Could not have asked for more." },
  { id: "r10", boat: "Floating Dreams", guest: "Hannah Müller", rating: 5, cruiseType: "Day Cruise", date: "16 Jun 2026", text: "Floating Dreams is aptly named — it truly felt like a dream. The largest and most luxurious houseboat we've been on. Every detail was thought through. The crew were professional, the food was exceptional, and the backwaters route they chose was breathtaking." },
  { id: "r11", boat: "Floating Dreams", guest: "Vikram Shah", rating: 4, cruiseType: "Day Cruise", date: "25 Jun 2026", text: "Fantastic experience for a group. The deck space was generous and great for our party. The BBQ lunch was a real highlight. The crew handled everything professionally and we never felt rushed." },
  { id: "r12", boat: "Floating Dreams", guest: "Sophie Laurent", rating: 5, cruiseType: "Overnight Stay", date: "2 Jul 2026", text: "Hands down the most memorable night of our India trip. The houseboat is enormous and beautifully appointed. The sunset from the upper deck was extraordinary. The chef prepared an incredible Kerala feast for dinner — absolutely outstanding." },
];

export let reviews: Review[] = [...initialReviews];

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, process.env.NODE_ENV === "test" ? 0 : ms));

export async function fetchReviews(boatId?: number): Promise<ApiResponse<Review[]>> {
  await delay(400);
  // boatId 0 = all boats
  if (!boatId || boatId === 0) {
    return { data: reviews, error: null };
  }
  const { BOAT_NAME_MAP } = await import("./bookings");
  const boatName = BOAT_NAME_MAP[boatId];
  if (!boatName) return { data: reviews, error: null };
  return { data: reviews.filter((r) => r.boat === boatName), error: null };
}
