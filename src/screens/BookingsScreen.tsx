import { useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutAnimation,
  Pressable,
  ScrollView,
  Text,
  UIManager,
  View,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView, Directions } from "react-native-gesture-handler";
import { Card, PageHeader, CruiseTypeIcon, CruiseCard } from "../components";
import { DISABLE_ANIMATIONS } from "../config/animations";
import { useBoat } from "../context/BoatContext";
import type { MainTabScreenProps } from "../navigation/types";
import styles from "../styles";
import { fetchBookings } from "../services/bookings";
import { BookingRecord } from "../data/bookings";


const now = new Date();
const currentYear = now.getFullYear();
const currentMonthIndex = now.getMonth();
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function getCruiseType(
  details: Array<[string, string]>,
): "day" | "overnight" | "night" | null {
  const cruiseTypeDetail = details.find(([key]) => key === "Cruise type");
  if (!cruiseTypeDetail) return null;
  const val = cruiseTypeDetail[1].toLowerCase();
  if (val.includes("overnight")) return "overnight";
  if (val.includes("day")) return "day";
  if (val.includes("night")) return "night";
  return null;
}

function getBookingDate(
  details: Array<[string, string]>,
): { year: number; month: number; day: number } | null {
  const dateTimeDetail = details.find(([key]) => key === "Date & time");
  if (!dateTimeDetail) return null;
  const dateStr = dateTimeDetail[1].split(" · ")[0];
  const parts = dateStr.trim().split(" ");
  if (parts.length < 3) return null;
  const day = parseInt(parts[0], 10);
  const monthStr = parts[1];
  const year = parseInt(parts[2], 10);

  const monthsAbbr = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthsAbbr.findIndex((m) => monthStr.startsWith(m));
  if (month === -1) return null;

  return { year, month, day };
}

function getDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

type Props = MainTabScreenProps<"Bookings">;

export default function BookingsScreen({ route, navigation }: Props) {
  const { selectedBoat, boats } = useBoat();
  const focusGuest = route?.params?.focusGuest;
  const focusToken = route?.params?.focusToken;
  const scrollRef = useRef<ScrollView>(null);
  const bookingYById = useRef<Record<string, number>>({});

  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(currentYear, currentMonthIndex, 1),
  );
  const [selectedDate, setSelectedDate] = useState<{
    year: number;
    month: number;
    day: number;
  }>(() => ({
    year: currentYear,
    month: currentMonthIndex,
    day: now.getDate(),
  }));
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedBookings, setExpandedBookings] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let active = true;
    const loadBookings = async () => {
      setIsLoading(true);
      try {
        const response = await fetchBookings(selectedBoat);
        if (active && response.data) {
          setBookings(response.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    loadBookings();
    return () => {
      active = false;
    };
  }, [selectedBoat]);

  const visibleBookings = bookings;

  const parsedBookings = useMemo(() => {
    return visibleBookings.map((b) => {
      const parsedDate = getBookingDate(b.details);
      const parsedType = getCruiseType(b.details);
      return {
        ...b,
        parsedDate,
        parsedType,
      };
    });
  }, [visibleBookings]);

  const bookingsByDateKey = useMemo(() => {
    const map: Record<string, typeof parsedBookings> = {};
    parsedBookings.forEach((b) => {
      if (b.parsedDate) {
        const key = getDateKey(
          b.parsedDate.year,
          b.parsedDate.month,
          b.parsedDate.day,
        );
        if (!map[key]) map[key] = [];
        map[key].push(b);
      }
    });
    return map;
  }, [parsedBookings]);

  const bookingsForSelectedDate = useMemo(() => {
    const key = getDateKey(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day,
    );
    return bookingsByDateKey[key] ?? [];
  }, [selectedDate, bookingsByDateKey]);

  const focusedBookingId = useMemo(() => {
    if (!focusGuest) return undefined;
    return visibleBookings.find(
      (b) => b.guestName.toLowerCase() === focusGuest.toLowerCase(),
    )?.id;
  }, [focusGuest, visibleBookings]);

  const toggleBooking = (bookingId: string) => {
    if (!DISABLE_ANIMATIONS) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    const next = new Set(expandedBookings);
    if (next.has(bookingId)) next.delete(bookingId);
    else next.add(bookingId);
    setExpandedBookings(next);
  };

  useEffect(() => {
    if (
      Platform.OS === "android" &&
      !(globalThis as any)?.nativeFabricUIManager &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // Synchronize calendar and selection if navigated with a focusGuest
  useEffect(() => {
    if (!focusGuest) return;
    const booking = parsedBookings.find(
      (b) => b.guestName.toLowerCase() === focusGuest.toLowerCase(),
    );
    if (booking && booking.parsedDate) {
      const { year, month, day } = booking.parsedDate;
      const bId = booking.id;
      const timer = setTimeout(() => {
        setSelectedDate({ year, month, day });
        setVisibleMonth(new Date(year, month, 1));
        navigation.navigate("BookingDetail", { bookingId: bId });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [focusGuest, focusToken, parsedBookings]);

  // Scroll to focused booking after layout
  useEffect(() => {
    if (!focusedBookingId) return;
    const timer = setTimeout(() => {
      const y = bookingYById.current[focusedBookingId];
      if (typeof y === "number") {
        scrollRef.current?.scrollTo({ y: Math.max(0, y - 90), animated: true });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [focusedBookingId, focusToken]);

  function moveMonth(delta: number) {
    setSlideDirection(delta > 0 ? 'left' : 'right');
    setVisibleMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + delta, 1),
    );
  }

  const swipeLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .runOnJS(true)
    .onEnd(() => {
      moveMonth(1);
    });

  const swipeRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .runOnJS(true)
    .onEnd(() => {
      moveMonth(-1);
    });

  const calendarSwipeGesture = Gesture.Simultaneous(swipeLeft, swipeRight);

  const visibleYear = visibleMonth.getFullYear();
  const visibleMonthIndex = visibleMonth.getMonth();
  const daysInVisibleMonth = new Date(
    visibleYear,
    visibleMonthIndex + 1,
    0,
  ).getDate();
  const firstDayWeekIndex = new Date(
    visibleYear,
    visibleMonthIndex,
    1,
  ).getDay();

  const calendarDays = [
    ...Array.from({ length: firstDayWeekIndex }, () => null as number | null),
    ...Array.from({ length: daysInVisibleMonth }, (_, i) => i + 1),
  ];

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const visibleMonthTitle = visibleMonth.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <GestureHandlerRootView style={styles.calendarPageRoot}>
      <View style={styles.flex1}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.pageScrollContent}
        >
        <PageHeader
          title="Bookings"
          sub={`Track accepted bookings with complete trip details and guest preferences. · Boat: ${boats.find((b) => b.id === selectedBoat)?.name || ""}`}
        />

        {isLoading ? (
          <View style={{ paddingVertical: 80, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#0c5eac" />
            <Text style={{ marginTop: 10, color: "#4f6e8c", fontSize: 14 }}>Loading bookings...</Text>
          </View>
        ) : (
          <>
        <View style={styles.card}>
          <View style={styles.calendarMonthRow}>
            <Pressable
              onPress={() => moveMonth(-1)}
              style={styles.monthChevronButton}
              testID="month-prev"
            >
              <Text style={styles.monthChevronText}>‹</Text>
            </Pressable>
            <Text
              style={styles.calendarMonthTitle}
              testID="calendar-month-title"
            >
              {visibleMonthTitle}
            </Text>
            <Pressable
              onPress={() => moveMonth(1)}
              style={styles.monthChevronButton}
              testID="month-next"
            >
              <Text style={styles.monthChevronText}>›</Text>
            </Pressable>
          </View>

          <View style={styles.calendarWeekRow}>
            {weekdayLabels.map((label) => (
              <Text key={label} style={styles.weekdayHeaderText}>
                {label}
              </Text>
            ))}
          </View>

          <GestureDetector gesture={calendarSwipeGesture}>
            <View
              key={`${visibleYear}-${visibleMonthIndex}`}
              style={styles.calendarGrid}
              testID="calendar-grid-view"
            >
              {Array.from(
                { length: Math.ceil(calendarDays.length / 7) },
                (_, weekIndex) => (
                  <View key={weekIndex} style={styles.calendarWeekRow}>
                    {[
                      ...calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7),
                      ...Array.from(
                        {
                          length: Math.max(
                            0,
                            7 -
                              calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7)
                                .length,
                          ),
                        },
                        () => null as number | null,
                      ),
                    ].map((day, cellIndex) => {
                      if (!day) {
                        return (
                          <View
                            key={`blank-${weekIndex}-${cellIndex}`}
                            style={styles.dayCellBlank}
                          />
                        );
                      }
                      const isSelected =
                        selectedDate.year === visibleYear &&
                        selectedDate.month === visibleMonthIndex &&
                        selectedDate.day === day;
                      const dateKey = getDateKey(
                        visibleYear,
                        visibleMonthIndex,
                        day,
                      );
                      const dayBookings = bookingsByDateKey[dateKey] ?? [];

                      return (
                        <Pressable
                          key={day}
                          onPress={() =>
                            setSelectedDate({
                              year: visibleYear,
                              month: visibleMonthIndex,
                              day,
                            })
                          }
                          style={[
                            styles.dayCell,
                            {
                              backgroundColor: "#faf6f1ee",
                              borderColor: "#cde3db",
                              borderWidth: 1,
                            },
                            isSelected ? styles.dayCellSelected : null,
                          ]}
                          testID={`calendar-day-${dateKey}`}
                        >
                          <Text style={styles.dayCellNumber}>{day}</Text>
                          {dayBookings.length > 0 && (
                            <View
                              style={{
                                flexDirection: "row",
                                gap: 3,
                                marginTop: 4,
                                flexWrap: "wrap",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              {dayBookings.map((b) => (
                                <CruiseTypeIcon
                                  key={b.id}
                                  type={b.parsedType || "day"}
                                  size="compact"
                                />
                              ))}
                            </View>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                ),
              )}
            </View>
          </GestureDetector>
        </View>

        {/* Bookings List below selected date */}
        <View style={styles.verticalGap12}>
          <Text style={[styles.cardTitle, { marginTop: 4, marginBottom: -4 }]}>
            Bookings for {selectedDate.day} {months[selectedDate.month]}{" "}
            {selectedDate.year}
          </Text>
          {bookingsForSelectedDate.map((booking) => {
            const dateLine = booking.details.find(([key]) => key === "Date & time")?.[1] || "";
            const config = booking.details.find(([key]) => key === "Configuration")?.[1] || "";
            const priceLine = booking.details.find(([key]) => key === "Total agreed price")?.[1] || "";

            return (
              <CruiseCard
                key={booking.id}
                title={`${booking.guestName} · ${booking.boatName || ""}`}
                subtitle={dateLine}
                cruiseType={booking.parsedType}
                status="Confirmed"
                config={config}
                priceLine={priceLine}
                onPress={() =>
                  navigation.navigate("BookingDetail", { bookingId: booking.id })
                }
              />
            );
          })}
          {bookingsForSelectedDate.length === 0 ? (
            <Card title="No bookings">
              <Text style={styles.detailMuted}>
                No confirmed bookings found for this day on {boats.find((b) => b.id === selectedBoat)?.name || ""}.
              </Text>
            </Card>
          ) : null}
        </View>
        </>
        )}
      </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
}
