import React, { useEffect, useState, useCallback } from "react";
import { Pressable, ScrollView, Text, View, ActivityIndicator, Modal, StyleSheet, RefreshControl } from "react-native";
import { Calendar, ChevronDown, ChevronUp, ArrowLeft, ArrowRight, ClipboardList } from "lucide-react-native";
import { BookingCard, BoatSelector } from "../components";
import { useBoat } from "../context/BoatContext";
import { fetchBookings, Booking, MONTHS, safeParseDate, BOAT_ID_MAP } from "../services/bookings";
import type { MainTabScreenProps } from "../navigation/types";
import { COLORS } from "../styles";

// Freeze reference point to June 18, 2026
const now = new Date("2026-06-18T10:00:00");

export default function BookingsScreen({ route, navigation }: MainTabScreenProps<"Bookings">) {
  const { boats, searchQuery } = useBoat();
  const [selectedBoat, setSelectedBoat] = useState<number>(0);

  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedBooking, setExpandedBooking] = useState<number | null>(null);

  // Calendar states
  const [calendarMonth, setCalendarMonth] = useState({ month: 5, year: 2026 }); // June 2026
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<{ day: number; month: number; year: number } | null>(null);
  const [bookingsFilter, setBookingsFilter] = useState<"all" | "today" | "date">("all");

  // Dropdowns and filters
  const [bookingsStatusFilter, setBookingsStatusFilter] = useState<string | null>(null);
  const [bookingsStatusDropdownOpen, setBookingsStatusDropdownOpen] = useState(false);
  const [calendarMonthPickerOpen, setCalendarMonthPickerOpen] = useState(false);
  const [calendarYearPickerOpen, setCalendarYearPickerOpen] = useState(false);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetchBookings(0); // Fetch all to filter locally
      if (response.data) {
        setAllBookings(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await fetchBookings(0);
      if (response.data) {
        setAllBookings(response.data);
      }
    } catch (err) {
      console.error("Failed to refresh bookings:", err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (!route.params?.focusBookingId) {
        setSelectedBoat(0);
      }
    });
    return unsubscribe;
  }, [navigation, route.params?.focusBookingId]);

  useEffect(() => {
    loadBookings();
  }, [selectedBoat]); // Reload when boat selection changes

  // Automatically focus, select boat/date, and expand booking when target booking param changes
  useEffect(() => {
    if (allBookings.length > 0 && route.params?.focusBookingId) {
      const targetId = route.params.focusBookingId;
      const b = allBookings.find((x) => x.bookingId === targetId);
      if (b) {
        // 1. Select the corresponding boat
        const boatId = BOAT_ID_MAP[b.boat];
        if (boatId !== undefined) {
          setSelectedBoat(boatId);
        }

        // 2. Parse date and select it
        const bookingDate = safeParseDate(b.date);
        const day = bookingDate.getDate();
        const month = bookingDate.getMonth();
        const year = bookingDate.getFullYear();

        setCalendarMonth({ month, year });
        setSelectedCalendarDate({ day, month, year });
        setBookingsFilter("date");

        // 3. Expand the booking card
        setExpandedBooking(b.id);

        // Clear route params so it doesn't trigger again on navigation change
        navigation.setParams({ focusBookingId: undefined });
      }
    }
  }, [allBookings, route.params?.focusBookingId, setSelectedBoat, navigation]);

  // Resolve boat name
  const selectedBoatName = selectedBoat === 0 ? "All" : boats.find((b) => b.id === selectedBoat)?.name || "";

  // Filter by boat name
  const boatFilteredBookings = allBookings.filter((b) => {
    return selectedBoat === 0 || b.boat === selectedBoatName;
  });

  // Filter by search query
  const searchFilteredBookings = boatFilteredBookings.filter((b) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const guestMatch = b.guest ? b.guest.toLowerCase().includes(query) : false;
    const idMatch = b.bookingId ? b.bookingId.toLowerCase().includes(query) : false;
    const boatMatch = b.boat ? b.boat.toLowerCase().includes(query) : false;
    return guestMatch || idMatch || boatMatch;
  });

  // Today's trips (June 18, 2026)
  const todayStr = "18 Jun 2026";
  const todaysTrips = searchFilteredBookings.filter(
    (b) => b.date === todayStr && b.status !== "cancelled" && b.status !== "deleted"
  );

  // Month filtered bookings
  const monthFilteredBookings = searchFilteredBookings.filter((b) => {
    const d = safeParseDate(b.date);
    return d.getMonth() === calendarMonth.month && d.getFullYear() === calendarMonth.year;
  });

  // Date filtered bookings
  const dateFilteredBookings = searchFilteredBookings.filter((b) => {
    if (!selectedCalendarDate) return false;
    const d = safeParseDate(b.date);
    return (
      d.getDate() === selectedCalendarDate.day &&
      d.getMonth() === selectedCalendarDate.month &&
      d.getFullYear() === selectedCalendarDate.year
    );
  });

  // Apply status filter
  const applyBookingsStatusFilter = (list: Booking[]) => {
    if (!bookingsStatusFilter) return list;
    if (bookingsStatusFilter === "confirmed") {
      return list.filter((b) => b.status !== "cancelled" && b.status !== "deleted" && !b.isUpdated && !b.isDirect);
    }
    if (bookingsStatusFilter === "cancelled") {
      return list.filter((b) => b.status === "cancelled");
    }
    if (bookingsStatusFilter === "updated") {
      return list.filter((b) => b.isUpdated);
    }
    if (bookingsStatusFilter === "added") {
      return list.filter((b) => b.isDirect && b.status !== "deleted" && b.status !== "cancelled");
    }
    return list;
  };

  // Resolve current active list
  const getActiveList = () => {
    let list: Booking[] = [];
    if (bookingsFilter === "today") {
      list = todaysTrips;
    } else if (bookingsFilter === "date") {
      list = dateFilteredBookings;
    } else {
      list = monthFilteredBookings;
    }
    return applyBookingsStatusFilter(list);
  };

  const activeList = getActiveList();

  // Calendar logic
  const bookedDatesInMonth = new Set(
    monthFilteredBookings
      .filter((b) => b.status !== "cancelled" && b.status !== "deleted")
      .map((b) => {
        const d = safeParseDate(b.date);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      })
  );

  const firstOfMonth = new Date(calendarMonth.year, calendarMonth.month, 1);
  const daysInMonth = new Date(calendarMonth.year, calendarMonth.month + 1, 0).getDate();
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // Monday start
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  // Group cells into rows of 7
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  const isTodayDay = (day: number) => {
    return (
      day === now.getDate() &&
      calendarMonth.month === now.getMonth() &&
      calendarMonth.year === now.getFullYear()
    );
  };

  const hasBooking = (day: number) => {
    return bookedDatesInMonth.has(`${calendarMonth.year}-${calendarMonth.month}-${day}`);
  };

  const MIN_MONTH = 5; // June
  const MIN_YEAR = 2026;
  const isAtFloor = calendarMonth.year === MIN_YEAR && calendarMonth.month === MIN_MONTH;

  const goToMonth = (delta: number) => {
    let month = calendarMonth.month + delta;
    let year = calendarMonth.year;
    if (month < 0) {
      month = 11;
      year -= 1;
    } else if (month > 11) {
      month = 0;
      year += 1;
    }
    if (year < MIN_YEAR || (year === MIN_YEAR && month < MIN_MONTH)) {
      setCalendarMonth({ month: MIN_MONTH, year: MIN_YEAR });
    } else {
      setCalendarMonth({ month, year });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 18, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.teal]} tintColor={COLORS.teal} />}
      >
        {/* Page Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <Text style={{ fontSize: 26, fontWeight: "800", color: COLORS.navy }}>Bookings</Text>
          <BoatSelector selectedBoat={selectedBoat} setSelectedBoat={setSelectedBoat} />
        </View>

        {isLoading ? (
          <View style={{ paddingVertical: 100, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color={COLORS.teal} />
            <Text style={{ marginTop: 10, color: COLORS.muted, fontSize: 14 }}>Loading bookings...</Text>
          </View>
        ) : (
          <>
            {/* Filter Bar */}
            <View style={{ marginBottom: 14, zIndex: 10 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: COLORS.navy, textTransform: "uppercase" }}>
                  {bookingsFilter === "today"
                    ? `${applyBookingsStatusFilter(todaysTrips).length} check-in${applyBookingsStatusFilter(todaysTrips).length !== 1 ? "s" : ""} today`
                    : bookingsFilter === "date" && selectedCalendarDate
                    ? `${applyBookingsStatusFilter(dateFilteredBookings).length} booking${applyBookingsStatusFilter(dateFilteredBookings).length !== 1 ? "s" : ""} on ${selectedCalendarDate.day} ${MONTHS[selectedCalendarDate.month]} ${selectedCalendarDate.year}`
                    : `${applyBookingsStatusFilter(monthFilteredBookings).length} booking${applyBookingsStatusFilter(monthFilteredBookings).length !== 1 ? "s" : ""} in ${MONTHS[calendarMonth.month]} ${calendarMonth.year}`}
                </Text>

                <View>
                  <Pressable
                    onPress={() => setBookingsStatusDropdownOpen(!bookingsStatusDropdownOpen)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      backgroundColor: bookingsStatusFilter ? COLORS.tealLight : COLORS.bg,
                      borderWidth: 1,
                      borderColor: bookingsStatusFilter ? COLORS.teal : COLORS.border,
                      borderRadius: 999,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: bookingsStatusFilter ? COLORS.teal : COLORS.muted,
                      }}
                    >
                      {bookingsStatusFilter
                        ? { confirmed: "Confirmed", cancelled: "Cancelled", updated: "Updated", added: "Added" }[bookingsStatusFilter]
                        : "Filter"}
                    </Text>
                    {bookingsStatusDropdownOpen ? (
                      <ChevronUp size={12} color={bookingsStatusFilter ? COLORS.teal : COLORS.muted} />
                    ) : (
                      <ChevronDown size={12} color={bookingsStatusFilter ? COLORS.teal : COLORS.muted} />
                    )}
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Calendar Card */}
            <View
              style={{
                backgroundColor: COLORS.white,
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 24,
                padding: 16,
                marginBottom: 20,
              }}
            >
              {/* Month/Year selector header */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <Pressable
                  onPress={() => {
                    if (!isAtFloor) goToMonth(-1);
                  }}
                  style={{ opacity: isAtFloor ? 0.3 : 1, padding: 6 }}
                >
                  <ArrowLeft size={16} color={COLORS.navy} />
                </Pressable>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Calendar size={15} color={COLORS.teal} />

                  {/* Month selection */}
                  <View>
                    <Pressable
                      onPress={() => {
                        setCalendarMonthPickerOpen(!calendarMonthPickerOpen);
                        setCalendarYearPickerOpen(false);
                      }}
                      style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.navy }}>
                        {MONTHS[calendarMonth.month]}
                      </Text>
                      <ChevronDown size={12} color={COLORS.muted} />
                    </Pressable>
                  </View>

                  {/* Year selection */}
                  <View>
                    <Pressable
                      onPress={() => {
                        setCalendarYearPickerOpen(!calendarYearPickerOpen);
                        setCalendarMonthPickerOpen(false);
                      }}
                      style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.navy }}>
                        {calendarMonth.year}
                      </Text>
                      <ChevronDown size={12} color={COLORS.muted} />
                    </Pressable>
                  </View>
                </View>

                <Pressable onPress={() => goToMonth(1)} style={{ padding: 6 }}>
                  <ArrowRight size={16} color={COLORS.navy} />
                </Pressable>
              </View>

              {/* Weekday headers */}
              <View style={{ flexDirection: "row", marginBottom: 8 }}>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <Text
                    key={d}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontSize: 11,
                      fontWeight: "700",
                      color: COLORS.muted,
                    }}
                  >
                    {d}
                  </Text>
                ))}
              </View>

              {/* Calendar Grid cells */}
              <View style={{ flexDirection: "column", gap: 6 }}>
                {rows.map((row, rowIdx) => (
                  <View key={rowIdx} style={{ flexDirection: "row", gap: 6 }}>
                    {row.map((day, cellIdx) => {
                      if (!day) {
                        return <View key={`blank-${rowIdx}-${cellIdx}`} style={{ flex: 1, aspectRatio: 1 }} />;
                      }

                      const isSelected =
                        selectedCalendarDate &&
                        selectedCalendarDate.day === day &&
                        selectedCalendarDate.month === calendarMonth.month &&
                        selectedCalendarDate.year === calendarMonth.year;

                      return (
                        <Pressable
                          key={day}
                          onPress={() => {
                            setSelectedCalendarDate({
                              day,
                              month: calendarMonth.month,
                              year: calendarMonth.year,
                            });
                            setBookingsFilter("date");
                          }}
                          style={{
                            flex: 1,
                            aspectRatio: 1,
                            backgroundColor: isSelected ? COLORS.tealMedium : COLORS.bg,
                            borderRadius: 10,
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: day && isTodayDay(day) && !isSelected ? 2.5 : 0,
                            borderColor: COLORS.navy,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: isTodayDay(day) || isSelected ? "700" : "500",
                              color: isSelected ? COLORS.white : COLORS.navy,
                            }}
                          >
                            {day}
                          </Text>
                          <View
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: hasBooking(day) ? (isSelected ? COLORS.white : COLORS.teal) : "transparent",
                              marginTop: 3,
                            }}
                          />
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>

            {/* Bookings List below Calendar */}
            <View>
              {activeList.length === 0 ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    paddingVertical: 18,
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    borderRadius: 16,
                    backgroundColor: COLORS.white,
                  }}
                >
                  <ClipboardList size={16} color={COLORS.muted} />
                  <Text style={{ fontSize: 13, color: COLORS.muted }}>
                    {bookingsStatusFilter
                      ? `No ${{ confirmed: "confirmed", cancelled: "cancelled", updated: "updated", added: "added" }[bookingsStatusFilter]} bookings`
                      : "No bookings"}{" "}
                    {bookingsFilter === "today"
                      ? "today"
                      : bookingsFilter === "date" && selectedCalendarDate
                      ? `on ${selectedCalendarDate.day} ${MONTHS[selectedCalendarDate.month]} ${selectedCalendarDate.year}`
                      : `in ${MONTHS[calendarMonth.month]} ${calendarMonth.year}`}
                    {selectedBoat !== 0 ? ` for ${selectedBoatName}` : ""}
                  </Text>
                </View>
              ) : (
                activeList.map((b) => (
                  <BookingCard
                    key={b.id}
                    b={b}
                    expanded={expandedBooking === b.id}
                    onToggle={() => {
                      setExpandedBooking(expandedBooking === b.id ? null : b.id);
                    }}
                  />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Bookings Status filter options dropdown */}
      {bookingsStatusDropdownOpen && (
        <Modal
          transparent
          visible={bookingsStatusDropdownOpen}
          animationType="none"
          onRequestClose={() => setBookingsStatusDropdownOpen(false)}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setBookingsStatusDropdownOpen(false)} />
          <View
            style={{
              position: "absolute",
              top: 154, // position below the filter button
              right: 18,
              backgroundColor: COLORS.white,
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 14,
              minWidth: 170,
              shadowColor: COLORS.navy,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 16,
              elevation: 5,
              paddingVertical: 6,
            }}
          >
            {[
              { key: null, label: "Show all bookings" },
              { key: "confirmed", label: "Confirmed bookings" },
              { key: "cancelled", label: "Cancelled bookings" },
              { key: "updated", label: "Updated bookings" },
              { key: "added", label: "Added bookings" },
            ].map((opt) => (
              <Pressable
                key={opt.key ?? "all"}
                onPress={() => {
                  setBookingsStatusFilter(opt.key);
                  setBookingsStatusDropdownOpen(false);
                  if (opt.key === null) {
                    setBookingsFilter("all");
                    setSelectedCalendarDate(null);
                  }
                }}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  backgroundColor: bookingsStatusFilter === opt.key ? COLORS.tealLight : "transparent",
                  borderBottomWidth: opt.key === null ? 1 : 0,
                  borderBottomColor: COLORS.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: bookingsStatusFilter === opt.key ? "700" : "500",
                    color: bookingsStatusFilter === opt.key ? COLORS.teal : COLORS.navy,
                    textAlign: "center",
                  }}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Modal>
      )}

      {/* Month Selection Modal Dropdown */}
      {calendarMonthPickerOpen && (
        <Modal
          transparent
          visible={calendarMonthPickerOpen}
          animationType="none"
          onRequestClose={() => setCalendarMonthPickerOpen(false)}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setCalendarMonthPickerOpen(false)} />
          <View
            style={{
              position: "absolute",
              top: 250, // position around the header year/month text
              left: 60,
              backgroundColor: COLORS.white,
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 16,
              minWidth: 150,
              maxHeight: 260,
              shadowColor: COLORS.navy,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 16,
              elevation: 5,
              paddingVertical: 6,
            }}
          >
            <ScrollView>
              {MONTHS.map((m, i) => {
                const isBeforeFloor = calendarMonth.year === MIN_YEAR && i < MIN_MONTH;
                if (isBeforeFloor) return null;
                const isCurrent = calendarMonth.month === i;
                return (
                  <Pressable
                    key={m}
                    onPress={() => {
                      setCalendarMonth((prev) => ({ ...prev, month: i }));
                      setCalendarMonthPickerOpen(false);
                    }}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 9,
                      backgroundColor: isCurrent ? COLORS.tealLight : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: isCurrent ? "700" : "500",
                        color: isCurrent ? COLORS.teal : COLORS.navy,
                      }}
                    >
                      {m}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Modal>
      )}

      {/* Year Selection Modal Dropdown */}
      {calendarYearPickerOpen && (
        <Modal
          transparent
          visible={calendarYearPickerOpen}
          animationType="none"
          onRequestClose={() => setCalendarYearPickerOpen(false)}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setCalendarYearPickerOpen(false)} />
          <View
            style={{
              position: "absolute",
              top: 250,
              left: 200,
              backgroundColor: COLORS.white,
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 16,
              minWidth: 100,
              maxHeight: 220,
              shadowColor: COLORS.navy,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 16,
              elevation: 5,
              paddingVertical: 6,
            }}
          >
            <ScrollView>
              {Array.from({ length: 8 }, (_, idx) => MIN_YEAR + idx).map((year) => {
                const isCurrent = calendarMonth.year === year;
                return (
                  <Pressable
                    key={year}
                    onPress={() => {
                      setCalendarMonth((prev) => {
                        const month = year === MIN_YEAR && prev.month < MIN_MONTH ? MIN_MONTH : prev.month;
                        return { month, year };
                      });
                      setCalendarYearPickerOpen(false);
                    }}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 9,
                      backgroundColor: isCurrent ? COLORS.tealLight : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: isCurrent ? "700" : "500",
                        color: isCurrent ? COLORS.teal : COLORS.navy,
                      }}
                    >
                      {year}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
}
