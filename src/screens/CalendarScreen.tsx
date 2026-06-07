import { Check, CalendarDays, X } from "lucide-react-native";
import { useState, useCallback } from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { CruiseTypeIcon, PageHeader } from "../components";
import { useBoat } from "../context/BoatContext";
import styles from "../styles";

type DayBooking = {
  dayCruise: boolean;
  overnightCruise: boolean;
  nightCruise: boolean;
  details: string;
  dayCruisePrice?: number;
  overnightCruisePrice?: number;
  nightCruisePrice?: number;
};

type SelectedDate = { year: number; month: number; day: number };

function normalizeBooking(booking: DayBooking): DayBooking {
  if (booking.overnightCruise && booking.nightCruise) {
    return { ...booking, nightCruise: false };
  }
  return booking;
}

function getDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function CalendarScreen() {
  const { boats } = useBoat();
  const [activeBoatForCalendar, setActiveBoatForCalendar] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (activeBoatForCalendar === null) return;

      const onBackPress = () => {
        setActiveBoatForCalendar(null);
        return true;
      };

      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () => {
        subscription.remove();
      };
    }, [activeBoatForCalendar])
  );

  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();

  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(todayYear, todayMonth, 1),
  );
  const [isBulkPricingMode, setIsBulkPricingMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState<number[]>([]);
  const [bulkDayCruisePrice, setBulkDayCruisePrice] = useState("");
  const [bulkOvernightPrice, setBulkOvernightPrice] = useState("");
  const [bulkNightPrice, setBulkNightPrice] = useState("");
  const [selectedDate, setSelectedDate] = useState<SelectedDate | null>(null);
  const [modalDayCruisePrice, setModalDayCruisePrice] = useState("");
  const [modalOvernightPrice, setModalOvernightPrice] = useState("");
  const [modalNightPrice, setModalNightPrice] = useState("");

  const [bookingsByBoat, setBookingsByBoat] = useState<
    Record<string, Record<string, DayBooking>>
  >(() => ({
    "Vembanad Crest": {
      [getDateKey(todayYear, todayMonth, 2)]: normalizeBooking({
        dayCruise: true,
        overnightCruise: false,
        nightCruise: false,
        details: "Corporate day outing for 8 guests.",
        dayCruisePrice: 12500,
      }),
      [getDateKey(todayYear, todayMonth, 5)]: normalizeBooking({
        dayCruise: true,
        overnightCruise: true,
        nightCruise: false,
        details: "Wedding group full-day charter with overnight extension.",
        dayCruisePrice: 14000,
        overnightCruisePrice: 14000,
      }),
      [getDateKey(todayYear, todayMonth, 9)]: normalizeBooking({
        dayCruise: false,
        overnightCruise: true,
        nightCruise: false,
        details: "Family overnight package.",
        overnightCruisePrice: 21000,
      }),
      [getDateKey(todayYear, todayMonth, 13)]: normalizeBooking({
        dayCruise: true,
        overnightCruise: false,
        nightCruise: true,
        details: "Festival special day and night package booking.",
        dayCruisePrice: 11500,
        nightCruisePrice: 12000,
      }),
      [getDateKey(todayYear, todayMonth, 18)]: normalizeBooking({
        dayCruise: false,
        overnightCruise: false,
        nightCruise: true,
        details: "Couple moonlight cruise with dinner.",
        nightCruisePrice: 14500,
      }),
      [getDateKey(todayYear, todayMonth, 24)]: normalizeBooking({
        dayCruise: true,
        overnightCruise: false,
        nightCruise: true,
        details: "Private anniversary plan with sunset and night ride.",
        dayCruisePrice: 12000,
        nightCruisePrice: 14000,
      }),
    },
    "Backwater Pearl": {
      [getDateKey(todayYear, todayMonth, 3)]: normalizeBooking({
        dayCruise: true,
        overnightCruise: false,
        nightCruise: false,
        details: "Corporate lunch cruise.",
        dayCruisePrice: 10000,
      }),
      [getDateKey(todayYear, todayMonth, 8)]: normalizeBooking({
        dayCruise: false,
        overnightCruise: true,
        nightCruise: false,
        details: "Weekend stay for family.",
        overnightCruisePrice: 18000,
      }),
      [getDateKey(todayYear, todayMonth, 12)]: normalizeBooking({
        dayCruise: true,
        overnightCruise: false,
        nightCruise: true,
        details: "Day and night celebration.",
        dayCruisePrice: 11000,
        nightCruisePrice: 11500,
      }),
      [getDateKey(todayYear, todayMonth, 20)]: normalizeBooking({
        dayCruise: false,
        overnightCruise: false,
        nightCruise: true,
        details: "Dinner cruise.",
        nightCruisePrice: 13000,
      }),
      [getDateKey(todayYear, todayMonth, 26)]: normalizeBooking({
        dayCruise: true,
        overnightCruise: true,
        nightCruise: false,
        details: "Premium overnight cruise.",
        dayCruisePrice: 12500,
        overnightCruisePrice: 15000,
      }),
    },
    "Kerala Dream": {
      [getDateKey(todayYear, todayMonth, 4)]: normalizeBooking({
        dayCruise: true,
        overnightCruise: false,
        nightCruise: true,
        details: "Sightseeing tour.",
        dayCruisePrice: 13000,
        nightCruisePrice: 13500,
      }),
      [getDateKey(todayYear, todayMonth, 7)]: normalizeBooking({
        dayCruise: true,
        overnightCruise: true,
        nightCruise: false,
        details: "Honeymoon special package.",
        dayCruisePrice: 15000,
        overnightCruisePrice: 22000,
      }),
      [getDateKey(todayYear, todayMonth, 15)]: normalizeBooking({
        dayCruise: false,
        overnightCruise: true,
        nightCruise: false,
        details: "Overnight backwater explore.",
        overnightCruisePrice: 19500,
      }),
      [getDateKey(todayYear, todayMonth, 16)]: normalizeBooking({
        dayCruise: false,
        overnightCruise: false,
        nightCruise: true,
        details: "Night photography ride.",
        nightCruisePrice: 15000,
      }),
      [getDateKey(todayYear, todayMonth, 22)]: normalizeBooking({
        dayCruise: true,
        overnightCruise: false,
        nightCruise: false,
        details: "Photography crew day trip.",
        dayCruisePrice: 14000,
      }),
      [getDateKey(todayYear, todayMonth, 28)]: normalizeBooking({
        dayCruise: true,
        overnightCruise: false,
        nightCruise: true,
        details: "Sunset & dinner cruise.",
        dayCruisePrice: 12000,
        nightCruisePrice: 14000,
      }),
    },
  }));

  const bookingsByDate = activeBoatForCalendar ? (bookingsByBoat[activeBoatForCalendar] ?? {}) : {};

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

  const selectedBooking = selectedDate
    ? (bookingsByDate[
        getDateKey(selectedDate.year, selectedDate.month, selectedDate.day)
      ] ?? {
        dayCruise: false,
        overnightCruise: false,
        nightCruise: false,
        details: "No bookings for this day.",
      })
    : {
        dayCruise: false,
        overnightCruise: false,
        nightCruise: false,
        details: "No bookings for this day.",
      };

  function updateSelectedDayAvailability(
    key: "dayCruise" | "overnightCruise" | "nightCruise",
    value: boolean,
  ) {
    if (!selectedDate || !activeBoatForCalendar) return;
    const selectedDateKey = getDateKey(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day,
    );
    setBookingsByBoat((current) => {
      const boatBookings = current[activeBoatForCalendar] ?? {};
      const currentDayBooking = boatBookings[selectedDateKey] ?? {
        dayCruise: false,
        overnightCruise: false,
        nightCruise: false,
        details: "No bookings for this day.",
      };
      const nextBooking: DayBooking = { ...currentDayBooking, [key]: value };
      if (value && key === "overnightCruise") nextBooking.nightCruise = false;
      if (value && key === "nightCruise") nextBooking.overnightCruise = false;
      return {
        ...current,
        [activeBoatForCalendar]: {
          ...boatBookings,
          [selectedDateKey]: normalizeBooking(nextBooking),
        },
      };
    });
  }

  function handleDayPress(day: number) {
    if (isBulkPricingMode) {
      setSelectedDates((current) =>
        current.includes(day)
          ? current.filter((d) => d !== day)
          : [...current, day],
      );
      return;
    }
    const dateKey = getDateKey(visibleYear, visibleMonthIndex, day);
    const existing = bookingsByDate[dateKey];
    setModalDayCruisePrice(
      existing?.dayCruisePrice ? String(existing.dayCruisePrice) : "",
    );
    setModalOvernightPrice(
      existing?.overnightCruisePrice
        ? String(existing.overnightCruisePrice)
        : "",
    );
    setModalNightPrice(
      existing?.nightCruisePrice ? String(existing.nightCruisePrice) : "",
    );
    setSelectedDate({ year: visibleYear, month: visibleMonthIndex, day });
  }

  function handleDayLongPress(day: number) {
    setSelectedDate(null);
    setIsBulkPricingMode(true);
    setSelectedDates((current) =>
      current.includes(day) ? current : [...current, day],
    );
  }

  function applyPriceToSelectedDates() {
    if (!activeBoatForCalendar) return;
    const parsedDay = bulkDayCruisePrice
      ? Number(bulkDayCruisePrice)
      : undefined;
    const parsedOvernight = bulkOvernightPrice
      ? Number(bulkOvernightPrice)
      : undefined;
    const parsedNight = bulkNightPrice ? Number(bulkNightPrice) : undefined;
    const hasAnyPrice =
      (parsedDay && parsedDay > 0) ||
      (parsedOvernight && parsedOvernight > 0) ||
      (parsedNight && parsedNight > 0);
    if (!hasAnyPrice || selectedDates.length === 0) return;
    setBookingsByBoat((current) => {
      const boatBookings = { ...(current[activeBoatForCalendar] ?? {}) };
      selectedDates.forEach((day) => {
        const dateKey = getDateKey(visibleYear, visibleMonthIndex, day);
        const existing = boatBookings[dateKey] ?? {
          dayCruise: false,
          overnightCruise: false,
          nightCruise: false,
          details: "No bookings for this day.",
        };
        boatBookings[dateKey] = normalizeBooking({
          ...existing,
          ...(parsedDay && parsedDay > 0 ? { dayCruisePrice: parsedDay } : {}),
          ...(parsedOvernight && parsedOvernight > 0
            ? { overnightCruisePrice: parsedOvernight }
            : {}),
          ...(parsedNight && parsedNight > 0
            ? { nightCruisePrice: parsedNight }
            : {}),
        });
      });
      return {
        ...current,
        [activeBoatForCalendar]: boatBookings,
      };
    });
    setSelectedDates([]);
    setBulkDayCruisePrice("");
    setBulkOvernightPrice("");
    setBulkNightPrice("");
  }

  function moveMonth(delta: number) {
    setVisibleMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + delta, 1),
    );
    setSelectedDates([]);
    setSelectedDate(null);
  }

  function cancelBulkMode() {
    setIsBulkPricingMode(false);
    setSelectedDates([]);
    setBulkDayCruisePrice("");
    setBulkOvernightPrice("");
    setBulkNightPrice("");
  }

  if (activeBoatForCalendar === null) {
    const currentMonthTitle = today.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

    const daysInCurrentMonth = new Date(
      todayYear,
      todayMonth + 1,
      0,
    ).getDate();
    const firstDayWeekIndexCurrent = new Date(
      todayYear,
      todayMonth,
      1,
    ).getDay();

    const miniCalendarDays = [
      ...Array.from({ length: firstDayWeekIndexCurrent }, () => null as number | null),
      ...Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1),
    ];

    const miniCalendarWeeks: Array<Array<number | null>> = [];
    for (let i = 0; i < miniCalendarDays.length; i += 7) {
      miniCalendarWeeks.push(miniCalendarDays.slice(i, i + 7));
    }

    const miniWeekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

    return (
      <ScrollView contentContainerStyle={styles.pageScrollContent}>
        <PageHeader
          title="Availability"
          sub={`Select a boat to manage detailed availability · ${currentMonthTitle}`}
        />

        <View style={styles.boatGrid}>
          {boats.map((boat) => (
            <Pressable
              key={boat}
              onPress={() => {
                setActiveBoatForCalendar(boat);
                // Sync the visible month with the today date when selecting a boat
                setVisibleMonth(new Date(todayYear, todayMonth, 1));
              }}
              style={({ pressed }) => [
                styles.boatCard,
                pressed ? styles.boatCardPressed : null,
              ]}
              testID={`boat-card-${boat.replace(/\s+/g, "-").toLowerCase()}`}
            >
              <Text style={styles.boatCardTitle} numberOfLines={1}>{boat}</Text>
              
              <View style={styles.miniCalendarContainer}>
                <View style={styles.miniCalendarHeader}>
                  {miniWeekdayLabels.map((l, idx) => (
                    <Text key={idx} style={styles.miniCalendarHeaderLabel}>{l}</Text>
                  ))}
                </View>
                <View style={styles.miniCalendarGrid}>
                  {miniCalendarWeeks.map((week, weekIdx) => (
                    <View key={weekIdx} style={styles.miniCalendarWeekRow}>
                      {week.map((day, dayIdx) => {
                        if (day === null) {
                          return <View key={`empty-${dayIdx}`} style={styles.miniCalendarCellBlank} />;
                        }
                        const dateKey = getDateKey(todayYear, todayMonth, day);
                        const booking = bookingsByBoat[boat]?.[dateKey];
                        const allCruisesBooked = booking?.dayCruise && (booking?.overnightCruise || booking?.nightCruise);
                        const anyCruiseBooked = booking?.dayCruise || booking?.overnightCruise || booking?.nightCruise;
                        
                        let cellColor = "#dbf8ea";
                        let borderColor = "#9dd8bc";
                        if (allCruisesBooked) {
                          cellColor = "#ffe5e5";
                          borderColor = "#ffcccc";
                        } else if (anyCruiseBooked) {
                          cellColor = "#fff1d6";
                          borderColor = "#f5d392";
                        }
                        
                        return (
                          <View
                            key={day}
                            style={[
                              styles.miniCalendarCell,
                              { backgroundColor: cellColor, borderColor: borderColor }
                            ]}
                          />
                        );
                      })}
                      {week.length < 7 && Array.from({ length: 7 - week.length }).map((_, padIdx) => (
                        <View key={`pad-${padIdx}`} style={styles.miniCalendarCellBlank} />
                      ))}
                    </View>
                  ))}
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.calendarLegendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#dbf8ea", borderColor: "#9dd8bc" }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#fff1d6", borderColor: "#f5d392" }]} />
            <Text style={styles.legendText}>Partially Booked</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#ffe5e5", borderColor: "#ffcccc" }]} />
            <Text style={styles.legendText}>Fully Booked</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.calendarPageRoot}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.pageScrollContent}>
        <PageHeader
          title={activeBoatForCalendar}
          sub="Set bulk prices for multiple dates and manage cruise availability by date."
          onBack={() => setActiveBoatForCalendar(null)}
        />

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

          <View style={styles.calendarGrid}>
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
                    const dateKey = getDateKey(
                      visibleYear,
                      visibleMonthIndex,
                      day,
                    );
                    const booking = bookingsByDate[dateKey];
                    const allCruisesBooked =
                      booking?.dayCruise &&
                      (booking?.overnightCruise || booking?.nightCruise);
                    const anyCruiseBooked =
                      booking?.dayCruise ||
                      booking?.overnightCruise ||
                      booking?.nightCruise;
                    const bulkSelected = selectedDates.includes(day);
                    const isEditingDate =
                      selectedDate?.year === visibleYear &&
                      selectedDate?.month === visibleMonthIndex &&
                      selectedDate?.day === day;

                    return (
                      <Pressable
                        key={day}
                        onPress={() => handleDayPress(day)}
                        onLongPress={() => handleDayLongPress(day)}
                        delayLongPress={220}
                        testID={`calendar-day-${dateKey}`}
                        style={[
                          styles.dayCell,
                          allCruisesBooked
                            ? styles.dayCellFull
                            : anyCruiseBooked
                              ? styles.dayCellPartial
                              : styles.dayCellEmpty,
                          bulkSelected ? styles.dayCellBulkSelected : null,
                          isEditingDate ? styles.dayCellSelected : null,
                        ]}
                      >
                        {bulkSelected ? (
                          <View style={styles.bulkCheckBadge}>
                            <Check size={8} color="#ffffff" strokeWidth={3} />
                          </View>
                        ) : null}
                        <Text style={styles.dayCellNumber}>{day}</Text>
                        <View style={styles.dayCellCruiseRows}>
                          {booking?.dayCruise || booking?.dayCruisePrice ? (
                            <View style={styles.dayCellCruiseRow}>
                              <CruiseTypeIcon type="day" />
                              <Text
                                style={styles.dayCellCruisePrice}
                                numberOfLines={1}
                              >
                                {booking.dayCruisePrice
                                  ? booking.dayCruisePrice
                                  : "—"}
                              </Text>
                            </View>
                          ) : null}
                          {booking?.overnightCruise ||
                          booking?.overnightCruisePrice ? (
                            <View style={styles.dayCellCruiseRow}>
                              <CruiseTypeIcon type="overnight" />
                              <Text
                                style={styles.dayCellCruisePrice}
                                numberOfLines={1}
                              >
                                {booking.overnightCruisePrice
                                  ? booking.overnightCruisePrice
                                  : "—"}
                              </Text>
                            </View>
                          ) : null}
                          {booking?.nightCruise || booking?.nightCruisePrice ? (
                            <View style={styles.dayCellCruiseRow}>
                              <CruiseTypeIcon type="night" />
                              <Text
                                style={styles.dayCellCruisePrice}
                                numberOfLines={1}
                              >
                                {booking.nightCruisePrice
                                  ? booking.nightCruisePrice
                                  : "—"}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ),
            )}
          </View>

          <View style={styles.bulkPricingRow}>
            <CalendarDays size={16} color="#1a7f7f" strokeWidth={2.2} />
            <View style={styles.bulkPricingTextBlock}>
              <Text style={styles.bulkPricingLabel}>Bulk price editing</Text>
              <Text style={styles.bulkPricingSubLabel}>
                Select multiple dates and apply one price.
              </Text>
            </View>
            <Pressable
              onPress={() => {
                if (isBulkPricingMode) {
                  cancelBulkMode();
                } else {
                  setIsBulkPricingMode(true);
                }
              }}
              style={[
                styles.bulkToggleButton,
                isBulkPricingMode ? styles.bulkToggleButtonCancel : null,
              ]}
            >
              <Text
                style={[
                  styles.bulkToggleButtonText,
                  isBulkPricingMode ? styles.bulkToggleButtonCancelText : null,
                ]}
              >
                {isBulkPricingMode ? "Cancel" : "Enable"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {isBulkPricingMode ? (
        <View style={styles.bulkPricingPanel}>
          <View style={styles.bottomSheetHeader}>
            <View style={styles.bottomSheetInfo}>
              <Text style={styles.bottomSheetTitle}>
                {selectedDates.length}{" "}
                {selectedDates.length === 1 ? "date" : "dates"} selected
              </Text>
              <Text style={styles.bottomSheetSub}>
                {selectedDates.length === 0
                  ? "Select dates on the calendar"
                  : "Tap more dates or apply price"}
              </Text>
            </View>
            <Pressable
              onPress={cancelBulkMode}
              style={styles.bottomSheetCloseButton}
            >
              <X size={16} color="#5a6d82" strokeWidth={2.2} />
            </Pressable>
          </View>
          <View style={styles.verticalGap8}>
            <View style={styles.cruisePriceRow}>
              <CruiseTypeIcon type="day" size="regular" />
              <Text style={styles.cruisePriceLabel}>Day cruise</Text>
              <View style={styles.cruisePriceField}>
                <Text style={styles.bottomSheetRupee}>₹</Text>
                <TextInput
                  value={bulkDayCruisePrice}
                  onChangeText={(v) =>
                    setBulkDayCruisePrice(v.replace(/[^0-9]/g, ""))
                  }
                  keyboardType="numeric"
                  placeholder="Price"
                  placeholderTextColor="#9aafbf"
                  style={styles.bottomSheetInput}
                  testID="bulk-price-day"
                />
              </View>
            </View>
            <View style={styles.cruisePriceRow}>
              <CruiseTypeIcon type="overnight" size="regular" />
              <Text style={styles.cruisePriceLabel}>Overnight</Text>
              <View style={styles.cruisePriceField}>
                <Text style={styles.bottomSheetRupee}>₹</Text>
                <TextInput
                  value={bulkOvernightPrice}
                  onChangeText={(v) =>
                    setBulkOvernightPrice(v.replace(/[^0-9]/g, ""))
                  }
                  keyboardType="numeric"
                  placeholder="Price"
                  placeholderTextColor="#9aafbf"
                  style={styles.bottomSheetInput}
                  testID="bulk-price-overnight"
                />
              </View>
            </View>
            <View style={styles.cruisePriceRow}>
              <CruiseTypeIcon type="night" size="regular" />
              <Text style={styles.cruisePriceLabel}>Night stay</Text>
              <View style={styles.cruisePriceField}>
                <Text style={styles.bottomSheetRupee}>₹</Text>
                <TextInput
                  value={bulkNightPrice}
                  onChangeText={(v) =>
                    setBulkNightPrice(v.replace(/[^0-9]/g, ""))
                  }
                  keyboardType="numeric"
                  placeholder="Price"
                  placeholderTextColor="#9aafbf"
                  style={styles.bottomSheetInput}
                  testID="bulk-price-night"
                />
              </View>
            </View>
            <Pressable
              onPress={applyPriceToSelectedDates}
              disabled={
                selectedDates.length === 0 ||
                (!bulkDayCruisePrice && !bulkOvernightPrice && !bulkNightPrice)
              }
              style={[
                styles.applyPriceButton,
                selectedDates.length === 0 ||
                (!bulkDayCruisePrice && !bulkOvernightPrice && !bulkNightPrice)
                  ? styles.applyPriceButtonDisabled
                  : null,
              ]}
            >
              <Text style={styles.applyPriceButtonText}>Apply Price</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {selectedDate && !isBulkPricingMode ? (
        <View style={styles.dayEditPanel} testID="day-edit-modal">
          <View style={styles.modalDragHandle} />
          <View style={styles.modalTitleRow}>
            <Text style={styles.modalTitle}>
              {`${selectedDate.day} ${new Date(selectedDate.year, selectedDate.month, selectedDate.day).toLocaleString("en-US", { month: "short", year: "numeric" })}`}
            </Text>
            <Pressable
              onPress={() => setSelectedDate(null)}
              style={styles.bottomSheetCloseButton}
            >
              <X size={16} color="#5a6d82" strokeWidth={2.2} />
            </Pressable>
          </View>
          <Text style={styles.calendarRuleText}>
            Overnight stay and Night stay cannot be booked together.
          </Text>
          <View style={styles.verticalGap8}>
            <View style={styles.cruiseCombinedRow}>
              <CruiseTypeIcon type="day" size="regular" />
              <Text style={styles.cruisePriceLabel}>Day cruise</Text>
              <View style={styles.cruisePriceField}>
                <Text style={styles.bottomSheetRupee}>₹</Text>
                <TextInput
                  value={modalDayCruisePrice}
                  onChangeText={(v) =>
                    setModalDayCruisePrice(v.replace(/[^0-9]/g, ""))
                  }
                  keyboardType="numeric"
                  placeholder="Price"
                  placeholderTextColor="#9aafbf"
                  style={styles.bottomSheetInput}
                  testID="modal-price-input-day"
                />
              </View>
              <Switch
                value={selectedBooking.dayCruise}
                onValueChange={(v) =>
                  updateSelectedDayAvailability("dayCruise", v)
                }
                testID="availability-switch-dayCruise"
              />
            </View>
            <View style={styles.cruiseCombinedRow}>
              <CruiseTypeIcon type="overnight" size="regular" />
              <Text style={styles.cruisePriceLabel}>Overnight</Text>
              <View style={styles.cruisePriceField}>
                <Text style={styles.bottomSheetRupee}>₹</Text>
                <TextInput
                  value={modalOvernightPrice}
                  onChangeText={(v) =>
                    setModalOvernightPrice(v.replace(/[^0-9]/g, ""))
                  }
                  keyboardType="numeric"
                  placeholder="Price"
                  placeholderTextColor="#9aafbf"
                  style={styles.bottomSheetInput}
                  testID="modal-price-input-overnight"
                />
              </View>
              <Switch
                value={selectedBooking.overnightCruise}
                onValueChange={(v) =>
                  updateSelectedDayAvailability("overnightCruise", v)
                }
                testID="availability-switch-overnightCruise"
              />
            </View>
            <View style={styles.cruiseCombinedRow}>
              <CruiseTypeIcon type="night" size="regular" />
              <Text style={styles.cruisePriceLabel}>Night stay</Text>
              <View style={styles.cruisePriceField}>
                <Text style={styles.bottomSheetRupee}>₹</Text>
                <TextInput
                  value={modalNightPrice}
                  onChangeText={(v) =>
                    setModalNightPrice(v.replace(/[^0-9]/g, ""))
                  }
                  keyboardType="numeric"
                  placeholder="Price"
                  placeholderTextColor="#9aafbf"
                  style={styles.bottomSheetInput}
                  testID="modal-price-input-night"
                />
              </View>
              <Switch
                value={selectedBooking.nightCruise}
                onValueChange={(v) =>
                  updateSelectedDayAvailability("nightCruise", v)
                }
                testID="availability-switch-nightCruise"
              />
            </View>
          </View>
          <Pressable
            onPress={() => {
              if (selectedDate && activeBoatForCalendar) {
                const dateKey = getDateKey(
                  selectedDate.year,
                  selectedDate.month,
                  selectedDate.day,
                );
                const parsedDay = modalDayCruisePrice
                  ? Number(modalDayCruisePrice)
                  : undefined;
                const parsedOvernight = modalOvernightPrice
                  ? Number(modalOvernightPrice)
                  : undefined;
                const parsedNight = modalNightPrice
                  ? Number(modalNightPrice)
                  : undefined;
                setBookingsByBoat((current) => {
                  const boatBookings = current[activeBoatForCalendar] ?? {};
                  const existing = boatBookings[dateKey] ?? {
                    dayCruise: false,
                    overnightCruise: false,
                    nightCruise: false,
                    details: "No bookings for this day.",
                  };
                  return {
                    ...current,
                    [activeBoatForCalendar]: {
                      ...boatBookings,
                      [dateKey]: normalizeBooking({
                        ...existing,
                        dayCruisePrice: parsedDay,
                        overnightCruisePrice: parsedOvernight,
                        nightCruisePrice: parsedNight,
                      }),
                    },
                  };
                });
              }
              setSelectedDate(null);
            }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Done</Text>
          </Pressable>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}
