export type BookingRecord = {
  id: string;
  guestName: string;
  boatName: string;
  bookingId: string;
  details: Array<[string, string]>;
  notes: string;
};

export type BookingRequest = {
  name: string;
  boatName: string;
  dateLine: string;
  subtitle: string;
  status: string;
  config: string;
  details: string;
  request?: string;
  outcome?: "accepted" | "rejected";
  actedOn?: string;
};

export type DayBooking = {
  dayCruise: boolean;
  overnightCruise: boolean;
  nightCruise: boolean;
  details: string;
  dayCruiseDetails?: string;
  overnightCruiseDetails?: string;
  nightCruiseDetails?: string;
  dayCruiseGuestName?: string;
  dayCruiseGuestCount?: string;
  dayCruiseNotes?: string;
  overnightCruiseGuestName?: string;
  overnightCruiseGuestCount?: string;
  overnightCruiseNotes?: string;
  nightCruiseGuestName?: string;
  nightCruiseGuestCount?: string;
  nightCruiseNotes?: string;
  dayCruisePrice?: number;
  dayCruiseExtraGuest?: number;
  dayCruiseExtraRoom?: number;
  dayCruiseExtraGuestQty?: number;
  dayCruiseExtraRoomQty?: number;
  overnightCruisePrice?: number;
  overnightExtraBed?: number;
  overnightExtraCot?: number;
  overnightExtraBedQty?: number;
  overnightExtraCotQty?: number;
  nightCruisePrice?: number;
  nightCruiseExtraGuest?: number;
  nightCruiseExtraRoom?: number;
  nightCruiseExtraGuestQty?: number;
  nightCruiseExtraRoomQty?: number;
  dayCruiseBookedAmount?: number;
  overnightCruiseBookedAmount?: number;
  nightCruiseBookedAmount?: number;
};
