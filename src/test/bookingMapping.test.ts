import { mapBookingSummaryToBooking, RawBookingDto, RawRequestDto } from "../services/bookings";

describe("Booking and Request DTO Mapping", () => {
  it("should correctly map a RawBookingDto", () => {
    const bookingSample: RawBookingDto = {
      bookingId: 9,
      bookingCode: "ALP-12082026-0009",
      boatId: 3,
      boatName: "Floating Dreams",
      boatConfigurationId: 6,
      configurationCode: "3BH",
      boatType: "PRIVATE",
      guestName: "Clara Dubois",
      travelDate: "2026-08-12",
      serviceStartAt: "2026-08-12T17:30:00+05:30",
      serviceEndAt: "2026-08-13T09:00:00+05:30",
      cruiseType: "NIGHT",
      cruiseTypeLabel: "Night Stay",
      adultsCount: 5,
      childrenCount: 1,
      kidsCount: 0,
      roomsCount: 3,
      bookingStatus: "CONFIRMED",
      bookingStatusLabel: "Confirmed",
      bookingCategory: "UPDATED",
      bookingSourceType: "REQUEST",
      bookingChannel: "SAILCEPT",
      bookingChannelLabel: "Sailcept",
      finalPrice: 34500.00,
      currency: "INR",
      isUpdated: true,
      isAdded: false,
      isEdited: false,
    };

    const result = mapBookingSummaryToBooking(bookingSample);

    expect(result.id).toBe(9);
    expect(result.bookingId).toBe("ALP-12082026-0009");
    expect(result.bookingCode).toBe("ALP-12082026-0009");
    expect(result.guest).toBe("Clara Dubois");
    expect(result.boat).toBe("Floating Dreams");
    expect(result.boatId).toBe(3);
    expect(result.boatConfigurationId).toBe(6);
    expect(result.configurationCode).toBe("3BH");
    expect(result.type).toBe("Night Stay");
    expect(result.adults).toBe(5);
    expect(result.children).toBe(1);
    expect(result.kids).toBe(0);
    expect(result.rooms).toBe(3);
    expect(result.price).toBe(34500.00);
    expect(result.currency).toBe("INR");
    expect(result.status).toBe("CONFIRMED");
    expect(result.isUpdated).toBe(true);
    expect(result.isAdded).toBe(false);
    expect(result.isEdited).toBe(false);
    expect(result.bookingSource).toBe("Sailcept");
    expect(result.checkIn).toBe("17:30");
    expect(result.checkOut).toBe("09:00");
  });

  it("should correctly map a RawRequestDto", () => {
    const requestSample: RawRequestDto = {
      requestId: 15,
      requestReference: "SRQ-20260805-001014",
      boatId: 3,
      boatName: "Floating Dreams",
      boatConfigurationId: 6,
      configurationCode: "3BH",
      guestName: "Neha Kapoor",
      travelDate: "2026-08-21",
      serviceStartAt: "2026-08-21T17:30:00+05:30",
      serviceEndAt: "2026-08-22T09:00:00+05:30",
      operationalCutoffAt: "2026-08-21T14:30:00+05:30",
      cruiseType: "NIGHT",
      cruiseTypeLabel: "Night Stay",
      boatType: "PRIVATE",
      adultsCount: 6,
      childrenCount: 0,
      kidsCount: 0,
      roomsCount: 3,
      quotedPrice: 34000.00,
      currency: "INR",
      requestedAt: "2026-08-05T10:56:36.230497+05:30",
      ownerDecisionAt: null,
      resolvedAt: null,
      finalizedAt: null,
      decisionSource: null,
      reasonCode: null,
      operatorState: "PENDING",
      operatorStateLabel: "Pending",
      attentionLevel: "URGENT",
      paymentState: "NONE",
      paymentActionRequired: false,
      paymentRetryExpiresAt: null,
      holdState: "HELD",
      resultingBookingId: null,
      resultingBookingCode: null,
      contactAvailable: false,
      contactUnlockDate: "2026-08-16",
      customerPhone: null,
      allowedActions: ["ACCEPT", "DECLINE"],
    };

    const result = mapBookingSummaryToBooking(requestSample);

    expect(result.id).toBe(15);
    expect(result.bookingId).toBe("SRQ-20260805-001014");
    expect(result.requestReference).toBe("SRQ-20260805-001014");
    expect(result.guest).toBe("Neha Kapoor");
    expect(result.boat).toBe("Floating Dreams");
    expect(result.boatId).toBe(3);
    expect(result.type).toBe("Night Stay");
    expect(result.adults).toBe(6);
    expect(result.children).toBe(0);
    expect(result.kids).toBe(0);
    expect(result.rooms).toBe(3);
    expect(result.price).toBe(34000.00);
    expect(result.status).toBe("PENDING");
    expect(result.operatorState).toBe("PENDING");
    expect(result.operatorStateLabel).toBe("Pending");
    expect(result.attentionLevel).toBe("URGENT");
    expect(result.holdState).toBe("HELD");
    expect(result.contactAvailable).toBe(false);
    expect(result.allowedActions).toEqual(["ACCEPT", "DECLINE"]);
  });
});
