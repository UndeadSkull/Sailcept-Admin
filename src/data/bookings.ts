export type DietEntry = {
  type: string;
  count: number;
};

export type Booking = {
  id: number;
  bookingId: string;
  guest: string;
  phone: string;
  boat: string;
  type: string; // "Day cruise" | "Overnight stay" | "Night stay"
  date: string;
  dateEnd: string;
  comfort?: string;
  mode?: string;
  adults: number;
  children: number;
  kids?: number;
  rooms: number;
  cots?: number;
  dietBreakdown?: DietEntry[];
  accessibility?: string;
  specialRequests?: string[];
  updatedSpecialRequests?: string[];
  price: number;
  ghat?: string;
  checkIn?: string;
  checkOut?: string;
  meal?: string;
  paymentStatus?: string;
  status?: string; // "cancelled" | "deleted" | "confirmed"
  isDirect?: boolean;
  isEdited?: boolean;
  isUpdated?: boolean;
  bookingSource?: string;
  cancelledAt?: Date;
  requestedAt?: Date;
  decidedAt?: Date;
  outcome?: "accepted" | "declined";
};

export type BlockedDate = {
  boat: string;
  date: string;
  reason: string;
  tripType: string;
};

export type ConfigPricing = {
  dayCruisePrice?: number;
  dayCruiseExtraGuest?: number;
  dayCruiseExtraRoom?: number;
  dayCruiseClosed?: boolean;
  overnightCruisePrice?: number;
  overnightExtraBed?: number;
  overnightExtraCot?: number;
  overnightExtraGuest?: number;
  overnightExtraRoom?: number;
  overnightCruiseClosed?: boolean;
  nightCruisePrice?: number;
  nightCruiseExtraGuest?: number;
  nightCruiseExtraRoom?: number;
  nightExtraBed?: number;
  nightExtraCot?: number;
  nightCruiseClosed?: boolean;
};

export type DayBooking = {
  dayCruise: boolean;
  overnightCruise: boolean;
  nightCruise: boolean;
  details: string;
  isClosed?: boolean;
  dayCruiseClosed?: boolean;
  overnightCruiseClosed?: boolean;
  nightCruiseClosed?: boolean;
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
  dayCruiseIsOffline?: boolean;
  overnightCruiseIsOffline?: boolean;
  nightCruiseIsOffline?: boolean;
  dayCruisePrice?: number;
  dayCruiseExtraGuest?: number;
  dayCruiseExtraRoom?: number;
  dayCruiseExtraGuestQty?: number;
  dayCruiseExtraRoomQty?: number;
  overnightCruisePrice?: number;
  overnightExtraBed?: number;
  overnightExtraCot?: number;
  overnightExtraGuest?: number;
  overnightExtraRoom?: number;
  overnightExtraBedQty?: number;
  overnightExtraCotQty?: number;
  overnightExtraGuestQty?: number;
  overnightExtraRoomQty?: number;
  nightCruisePrice?: number;
  nightCruiseExtraGuest?: number;
  nightCruiseExtraRoom?: number;
  nightExtraBed?: number;
  nightExtraCot?: number;
  nightCruiseExtraGuestQty?: number;
  nightCruiseExtraRoomQty?: number;
  nightExtraBedQty?: number;
  nightExtraCotQty?: number;
  dayCruiseBookedAmount?: number;
  overnightCruiseBookedAmount?: number;
  nightCruiseBookedAmount?: number;
  dayCruiseBookedConfig?: string;
  overnightCruiseBookedConfig?: string;
  nightCruiseBookedConfig?: string;
  configs?: Record<string, ConfigPricing>;
};

export type BookingRecord = {
  id: string;
  guestName: string;
  boatId: number;
  boatName?: string;
  bookingId: string;
  details: Array<[string, string]>;
  notes: string;
};

export type BookingRequest = {
  name: string;
  boatId: number;
  boatName?: string;
  dateLine: string;
  subtitle: string;
  status: string;
  config: string;
  details: string;
  request?: string;
  outcome?: "accepted" | "rejected";
  actedOn?: string;
};
