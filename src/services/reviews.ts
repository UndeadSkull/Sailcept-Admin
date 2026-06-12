import { ApiResponse } from "../data/auth";
import { Review } from "../data/reviews";

const MOCK_REVIEWS: Review[] = [
  {
    id: "rev-1",
    boatName: "Vembanad Crest",
    guestName: "Sarah M.",
    rating: 5,
    comment: "Outstanding service and crew! Highly recommended.",
    date: "5 days ago",
  },
  {
    id: "rev-2",
    boatName: "Backwater Pearl",
    guestName: "John D.",
    rating: 4,
    comment: "Very relaxing trip, the lunch was superb.",
    date: "1 week ago",
  },
];

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, process.env.NODE_ENV === "test" ? 0 : ms));

export async function fetchReviews(boatName?: string): Promise<ApiResponse<Review[]>> {
  await delay(400);
  if (boatName) {
    return { data: MOCK_REVIEWS.filter((r) => r.boatName === boatName), error: null };
  } else {
    return { data: MOCK_REVIEWS, error: null };
  }
}
