import { useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutAnimation,
  Pressable,
  ScrollView,
  Text,
  UIManager,
  View,
  Platform,
} from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView, Directions } from "react-native-gesture-handler";
import Animated, { SlideInRight, SlideInLeft, runOnJS } from "react-native-reanimated";
import { Card, PageHeader, CruiseTypeIcon } from "../components";
import { useBoat } from "../context/BoatContext";
import type { MainTabScreenProps } from "../navigation/types";
import styles from "../styles";

type BookingRecord = {
  id: string;
  guestName: string;
  boatName: string;
  bookingId: string;
  details: Array<[string, string]>;
  notes: string;
};

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
const currentMonthStr = months[currentMonthIndex];

const ALL_BOOKINGS: BookingRecord[] = [
  {
    id: "booking-1",
    guestName: "Ethan Walker",
    boatName: "Vembanad Crest",
    bookingId: "#SC-2025-0041",
    details: [
      ["Cruise type", "Day cruise"],
      [
        "Date & time",
        `15 ${currentMonthStr} ${currentYear} · 11:00 AM - 5:00 PM`,
      ],
      ["Configuration", "2 adults · 1 room · Private · Premium"],
      ["Total agreed price", "INR 12,500"],
      ["Inclusions", "Meals, water, A/C, fishing equipment"],
      ["Pickup arranged", "Taxi confirmed · Alleppey Jetty"],
      ["Meal preference", "Vegetarian · Anniversary decoration"],
    ],
    notes:
      "Sailcept commitments: cruise-time support, check-in coordination, taxi pickup, operator compliance enforcement, backup boat if required.",
  },
  {
    id: "booking-2",
    guestName: "Olivia Bennett",
    boatName: "Vembanad Crest",
    bookingId: "#SC-2025-0042",
    details: [
      ["Cruise type", "Overnight stay"],
      [
        "Date & time",
        `18 ${currentMonthStr} ${currentYear} · 3:00 PM - Next day 11:00 AM`,
      ],
      ["Configuration", "4 adults · 2 rooms · Private · Luxury"],
      ["Total agreed price", "INR 28,000"],
      ["Inclusions", "All meals, spa, sunset deck access"],
      ["Pickup arranged", "Hotel pickup confirmed"],
      ["Special requests", "Champagne breakfast on day 2"],
    ],
    notes:
      "Premium service package. Guest is VIP. Ensure extra staff on board.",
  },
  {
    id: "booking-3",
    guestName: "Nora Ali",
    boatName: "Backwater Pearl",
    bookingId: "#SC-2025-0050",
    details: [
      ["Cruise type", "Day cruise"],
      [
        "Date & time",
        `21 ${currentMonthStr} ${currentYear} · 10:00 AM - 4:00 PM`,
      ],
      ["Configuration", "3 adults · 1 room · Private · Standard"],
      ["Total agreed price", "INR 10,800"],
      ["Inclusions", "Meals, tea service, local guide"],
    ],
    notes: "Standard service package with guided village stop.",
  },
  {
    id: "booking-4",
    guestName: "Rohan P.K",
    boatName: "Kerala Dream",
    bookingId: "#SC-2025-0053",
    details: [
      ["Cruise type", "Overnight stay"],
      [
        "Date & time",
        `27 ${currentMonthStr} ${currentYear} · 4:00 PM - Next day 10:00 AM`,
      ],
      ["Configuration", "4 adults · 2 rooms · Private · Luxury"],
      ["Total agreed price", "INR 31,500"],
      ["Inclusions", "All meals, deck dinner, sunset cruise"],
    ],
    notes: "Luxury package with chef special menu requested.",
  },
  {
    id: "booking-5",
    guestName: "Mason Reed",
    boatName: "Backwater Pearl",
    bookingId: "#SC-2025-0054",
    details: [
      ["Cruise type", "Day cruise"],
      [
        "Date & time",
        `12 ${currentMonthStr} ${currentYear} · 10:30 AM - 4:30 PM`,
      ],
      ["Configuration", "3 adults · 1 room · Private · Standard"],
      ["Total agreed price", "INR 10,800"],
    ],
    notes: "Guest requested local cuisine lunch and calm-route itinerary.",
  },
  {
    id: "booking-6",
    guestName: "Ava Stone",
    boatName: "Backwater Pearl",
    bookingId: "#SC-2025-0055",
    details: [
      ["Cruise type", "Night stay"],
      [
        "Date & time",
        `20 ${currentMonthStr} ${currentYear} · 6:00 PM - 10:00 PM`,
      ],
      ["Configuration", "5 guests · Shared · Premium"],
      ["Total agreed price", "INR 18,900"],
    ],
    notes: "Shared night package with onboard music setup confirmed.",
  },
  {
    id: "booking-7",
    guestName: "Noah Patel",
    boatName: "Kerala Dream",
    bookingId: "#SC-2025-0056",
    details: [
      ["Cruise type", "Overnight stay"],
      [
        "Date & time",
        `16 ${currentMonthStr} ${currentYear} · 3:00 PM - Next day 11:00 AM`,
      ],
      ["Configuration", "4 adults · 2 rooms · Private · Luxury"],
      ["Total agreed price", "INR 31,500"],
    ],
    notes: "Luxury itinerary with sunrise breakfast arrangement.",
  },
  {
    id: "booking-8",
    guestName: "Liam Carter",
    boatName: "Kerala Dream",
    bookingId: "#SC-2025-0057",
    details: [
      ["Cruise type", "Day cruise"],
      [
        "Date & time",
        `23 ${currentMonthStr} ${currentYear} · 11:00 AM - 5:00 PM`,
      ],
      ["Configuration", "2 adults · 1 room · Private · Premium"],
      ["Total agreed price", "INR 12,500"],
    ],
    notes: "Anniversary day trip with decoration and photo-stop included.",
  },
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

export default function BookingsScreen({ route }: Props) {
  const { selectedBoat } = useBoat();
  const focusGuest = route?.params?.focusGuest;
  const focusToken = route?.params?.focusToken;

  const [expandedBookings, setExpandedBookings] = useState<Set<string>>(
    new Set(),
  );
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

  const visibleBookings = useMemo(() => {
    return ALL_BOOKINGS.filter((b) => b.boatName === selectedBoat);
  }, [selectedBoat]);

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
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const next = new Set(expandedBookings);
    if (next.has(bookingId)) next.delete(bookingId);
    else next.add(bookingId);
    setExpandedBookings(next);
  };

  useEffect(() => {
    if (
      Platform.OS === "android" &&
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
      setSelectedDate({
        year: booking.parsedDate.year,
        month: booking.parsedDate.month,
        day: booking.parsedDate.day,
      });
      setVisibleMonth(
        new Date(booking.parsedDate.year, booking.parsedDate.month, 1),
      );
      setExpandedBookings(new Set([booking.id]));
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
    .onEnd(() => {
      runOnJS(moveMonth)(1);
    });

  const swipeRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      runOnJS(moveMonth)(-1);
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
          sub={`Track accepted bookings with complete trip details and guest preferences. · Boat: ${selectedBoat}`}
        />

        {/* Calendar Card */}
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
            <Animated.View
              style={styles.calendarGrid}
              entering={slideDirection === 'left' ? SlideInRight.duration(200) : SlideInLeft.duration(200)}
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
            </Animated.View>
          </GestureDetector>
        </View>

        {/* Bookings List below selected date */}
        <View style={styles.verticalGap12}>
          <Text style={[styles.cardTitle, { marginTop: 4, marginBottom: -4 }]}>
            Bookings for {selectedDate.day} {months[selectedDate.month]}{" "}
            {selectedDate.year}
          </Text>
          {bookingsForSelectedDate.map((booking) => {
            const isExpanded =
              expandedBookings.has(booking.id) ||
              booking.id === focusedBookingId;
            return (
              <Pressable
                key={booking.id}
                onPress={() => toggleBooking(booking.id)}
                onLayout={(e) => {
                  bookingYById.current[booking.id] = e.nativeEvent.layout.y;
                }}
                style={[styles.card, styles.expandableBookingCard]}
              >
                <View style={styles.bookingSummaryRow}>
                  <View style={styles.flex1}>
                    <Text style={styles.cardTitle}>
                      {booking.guestName} · {booking.boatName}
                    </Text>
                    <Text style={styles.cardSub}>{booking.bookingId}</Text>
                  </View>
                  <Text style={styles.expandIcon}>
                    {isExpanded ? "▼" : "▶"}
                  </Text>
                </View>
                {isExpanded && (
                  <View style={styles.bookingDetailsContainer}>
                    <View style={styles.verticalGap8}>
                      {booking.details.map(([key, value]) => (
                        <View key={key} style={styles.bookingRow}>
                          <Text style={styles.bookingRowKey}>{key}</Text>
                          <Text style={styles.bookingRowValue}>{value}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={styles.noteBox}>
                      <Text style={styles.noteText}>{booking.notes}</Text>
                    </View>
                  </View>
                )}
              </Pressable>
            );
          })}
          {bookingsForSelectedDate.length === 0 ? (
            <Card title="No bookings">
              <Text style={styles.detailMuted}>
                No confirmed bookings found for this day on {selectedBoat}.
              </Text>
            </Card>
          ) : null}
        </View>
      </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
}
