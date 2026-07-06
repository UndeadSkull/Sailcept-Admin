import { ApiResponse } from "../data/auth";

export type DashboardStat = {
  label: string;
  value: string;
  caption: string;
  tab?: "Availability" | "Requests" | "Bookings" | "More";
  isPending?: boolean;
};

export type UpcomingCruise = {
  name: string;
  dateLine: string;
  status: string;
  config: string;
  bookingId: string;
};

const now = new Date();
const currentYear = now.getFullYear();
const currentMonthIndex = now.getMonth();
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const currentMonthStr = months[currentMonthIndex];

const statsByBoatId: Record<number, DashboardStat[]> = {
  1: [
    {
      label: "Open dates this month",
      value: "18",
      caption: "of 31 days",
      tab: "Availability",
    },
    {
      label: "Pending requests",
      value: "3",
      caption: "Awaiting response",
      tab: "Requests",
      isPending: true,
    },
    {
      label: "Confirmed bookings",
      value: "11",
      caption: "This month",
      tab: "Bookings",
    },
    { label: "Revenue (month)", value: "INR 1.4L", caption: "Normal + peak" },
  ],
  2: [
    {
      label: "Open dates this month",
      value: "22",
      caption: "of 31 days",
      tab: "Availability",
    },
    {
      label: "Pending requests",
      value: "1",
      caption: "Awaiting response",
      tab: "Requests",
      isPending: true,
    },
    {
      label: "Confirmed bookings",
      value: "6",
      caption: "This month",
      tab: "Bookings",
    },
    { label: "Revenue (month)", value: "INR 82k", caption: "Normal + peak" },
  ],
  3: [
    {
      label: "Open dates this month",
      value: "14",
      caption: "of 31 days",
      tab: "Availability",
    },
    {
      label: "Pending requests",
      value: "4",
      caption: "Awaiting response",
      tab: "Requests",
      isPending: true,
    },
    {
      label: "Confirmed bookings",
      value: "13",
      caption: "This month",
      tab: "Bookings",
    },
    { label: "Revenue (month)", value: "INR 1.9L", caption: "Normal + peak" },
  ],
};

const cruisesByBoatId: Record<number, UpcomingCruise[]> = {
  1: [
    {
      name: "Ethan Walker",
      dateLine: `Day cruise · 15 ${currentMonthStr} ${currentYear}`,
      status: "Confirmed",
      config: "Premium · Private · 2 adults",
      bookingId: "booking-1",
    },
    {
      name: "Olivia Bennett",
      dateLine: `Overnight stay · 18 ${currentMonthStr} ${currentYear}`,
      status: "Confirmed",
      config: "Luxury · Private · 4 adults",
      bookingId: "booking-2",
    },
    {
      name: "Lucas Martin",
      dateLine: `Night stay · 22 ${currentMonthStr} ${currentYear}`,
      status: "Confirmed",
      config: "Premium · Shared · 6 guests",
      bookingId: "booking-lucas-martin",
    },
  ],
  2: [
    {
      name: "Mason Reed",
      dateLine: `Day cruise · 12 ${currentMonthStr} ${currentYear}`,
      status: "Confirmed",
      config: "Standard · Private · 3 adults",
      bookingId: "booking-mason-reed",
    },
    {
      name: "Ava Stone",
      dateLine: `Night stay · 20 ${currentMonthStr} ${currentYear}`,
      status: "Confirmed",
      config: "Premium · Shared · 5 guests",
      bookingId: "booking-ava-stone",
    },
  ],
  3: [
    {
      name: "Noah Patel",
      dateLine: `Overnight stay · 16 ${currentMonthStr} ${currentYear}`,
      status: "Confirmed",
      config: "Luxury · Private · 4 adults",
      bookingId: "booking-noah-patel",
    },
    {
      name: "Liam Carter",
      dateLine: `Day cruise · 23 ${currentMonthStr} ${currentYear}`,
      status: "Confirmed",
      config: "Premium · Private · 2 adults",
      bookingId: "booking-liam-carter",
    },
  ],
};

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, process.env.NODE_ENV === "test" ? 0 : ms));

export async function fetchDashboardStats(boatId: number): Promise<ApiResponse<DashboardStat[]>> {
  await delay(300);
  const stats = statsByBoatId[boatId] || statsByBoatId[1];
  return { data: stats, error: null };
}

export async function fetchUpcomingCruises(boatId: number): Promise<ApiResponse<UpcomingCruise[]>> {
  await delay(300);
  const cruises = cruisesByBoatId[boatId] || cruisesByBoatId[1];
  return { data: cruises, error: null };
}
