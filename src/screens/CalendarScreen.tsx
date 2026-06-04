import { Check, CalendarDays, X } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
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
  const { selectedBoat } = useBoat();

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
  const [bookingsByDate, setBookingsByDate] = useState<
    Record<string, DayBooking>
  >(() => ({
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
  }));

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
    if (!selectedDate) return;
    const selectedDateKey = getDateKey(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day,
    );
    setBookingsByDate((current) => {
      const currentDayBooking = current[selectedDateKey] ?? {
        dayCruise: false,
        overnightCruise: false,
        nightCruise: false,
        details: "No bookings for this day.",
      };
      const nextBooking: DayBooking = { ...currentDayBooking, [key]: value };
      if (value && key === "overnightCruise") nextBooking.nightCruise = false;
      if (value && key === "nightCruise") nextBooking.overnightCruise = false;
      return { ...current, [selectedDateKey]: normalizeBooking(nextBooking) };
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
    setBookingsByDate((current) => {
      const next = { ...current };
      selectedDates.forEach((day) => {
        const dateKey = getDateKey(visibleYear, visibleMonthIndex, day);
        const existing = current[dateKey] ?? {
          dayCruise: false,
          overnightCruise: false,
          nightCruise: false,
          details: "No bookings for this day.",
        };
        next[dateKey] = normalizeBooking({
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
      return next;
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

  return (
    <KeyboardAvoidingView
      style={styles.calendarPageRoot}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.pageScrollContent}>
        <PageHeader
          title="Availability calendar"
          sub={`Set bulk prices for multiple dates and manage cruise availability by date. · Boat: ${selectedBoat}`}
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
              if (selectedDate) {
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
                setBookingsByDate((current) => {
                  const existing = current[dateKey] ?? {
                    dayCruise: false,
                    overnightCruise: false,
                    nightCruise: false,
                    details: "No bookings for this day.",
                  };
                  return {
                    ...current,
                    [dateKey]: normalizeBooking({
                      ...existing,
                      dayCruisePrice: parsedDay,
                      overnightCruisePrice: parsedOvernight,
                      nightCruisePrice: parsedNight,
                    }),
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
