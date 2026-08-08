export interface AvailabilityDayCruiseType {
  cruiseType: string;
  offered: boolean;
  pricingState: "OPEN" | "CLOSED" | "NOT_SET" | string;
  effectiveSalesState: "SELLABLE" | "STOP_SELL" | "PAST_CUTOFF" | "UNAVAILABLE" | string;
  inventoryState: "AVAILABLE" | "SOLD_OUT" | string;
  sellableRoomLimit: number;
  heldRooms: number;
  bookedRooms: number;
  remainingRooms: number;
}

export interface AvailabilityDay {
  date: string; // YYYY-MM-DD
  manualSalesState: "OPEN" | "CLOSED" | string;
  hasAddedBooking: boolean;
  cruiseTypes: AvailabilityDayCruiseType[];
}

export interface AvailabilityCalendarResponse {
  boatId: number;
  month: string; // YYYY-MM
  shared: boolean;
  physicalRoomCount: number;
  days: AvailabilityDay[];
}

export interface AddedBooking {
  bookingId: number;
  bookingCode: string;
  guestName: string;
  cruiseType: string;
  cruiseTypeLabel: string;
  checkInDate: string;
  checkOutDate: string;
  bookingStatus: string;
  bookingChannel: string;
  bookingChannelLabel: string;
}

export interface AllowedActions {
  canOpen: boolean;
  canClose: boolean;
  canSetRates: boolean;
  canSetSharedInventory: boolean;
  canAddBooking: boolean;
  blockingReasons: string[];
}

export interface AvailabilitySelectionResponse {
  boatId: number;
  shared: boolean;
  physicalRoomCount: number;
  fromDate: string;
  toDate: string;
  manualSalesRangeState: "OPEN" | "CLOSED" | "MIXED" | string;
  pricingRangeState: "OPEN" | "CLOSED" | "MIXED" | string;
  sharedInventoryRangeState: "UNIFORM" | "MIXED" | string;
  dates: AvailabilityDay[];
  addedBookings: AddedBooking[];
  allowedActions: AllowedActions;
}

export interface DateStatusRequest {
  fromDate: string;
  toDate: string;
  isOpen: boolean;
}

export interface RateTierDto {
  boatConfigurationId: number;
  isOpen: boolean;
  basePrice: number;
  extraAdultPrice: number;
  extraChildPrice: number;
}

export interface RatesRequest {
  fromDate: string;
  toDate: string;
  cruiseType: string;
  tiers: RateTierDto[];
}

export interface SharedInventoryRequest {
  fromDate: string;
  toDate: string;
  sellableRoomLimit: number;
}
