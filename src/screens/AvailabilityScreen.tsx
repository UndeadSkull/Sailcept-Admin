import { Check, CalendarDays, X, Info } from "lucide-react-native";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  BackHandler,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Modal,
} from "react-native";
import BottomSheet, { BottomSheetScrollView, BottomSheetRef } from "../components/BottomSheet";
import { Gesture, GestureDetector, GestureHandlerRootView, Directions } from "react-native-gesture-handler";
import {
  useFocusEffect,
  useRoute,
  useNavigation,
  type RouteProp,
  type NavigationProp,
} from "@react-navigation/native";
import type { MainTabParamList } from "../navigation/types";

import { CruiseTypeIcon, PageHeader } from "../components";
import { useBoat } from "../context/BoatContext";
import { DISABLE_ANIMATIONS } from "../config/animations";
import styles from "../styles";
import { fetchCalendarBookings, saveAllCalendarBookings } from "../services/bookings";
import { DayBooking } from "../data/bookings";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");



type SelectedDate = { year: number; month: number; day: number };

function normalizeBooking(booking: DayBooking): DayBooking {
  const normalized = { ...booking };
  if (normalized.overnightCruise && normalized.nightCruise) {
    normalized.nightCruise = false;
  }
  if (normalized.details) {
    if (normalized.dayCruise && !normalized.dayCruiseDetails) {
      normalized.dayCruiseDetails = normalized.details;
    }
    if (normalized.overnightCruise && !normalized.overnightCruiseDetails) {
      normalized.overnightCruiseDetails = normalized.details;
    }
    if (normalized.nightCruise && !normalized.nightCruiseDetails) {
      normalized.nightCruiseDetails = normalized.details;
    }
  }
  // Initialize booked amounts from rates if not present
  if (normalized.dayCruise && normalized.dayCruiseBookedAmount === undefined) {
    normalized.dayCruiseBookedAmount = normalized.dayCruisePrice;
  }
  if (normalized.overnightCruise && normalized.overnightCruiseBookedAmount === undefined) {
    normalized.overnightCruiseBookedAmount = normalized.overnightCruisePrice;
  }
  if (normalized.nightCruise && normalized.nightCruiseBookedAmount === undefined) {
    normalized.nightCruiseBookedAmount = normalized.nightCruisePrice;
  }

  // Initialize extra quantities to 1 if not present but rate is present
  if (normalized.dayCruiseExtraGuest !== undefined && normalized.dayCruiseExtraGuestQty === undefined) {
    normalized.dayCruiseExtraGuestQty = 1;
  }
  if (normalized.dayCruiseExtraRoom !== undefined && normalized.dayCruiseExtraRoomQty === undefined) {
    normalized.dayCruiseExtraRoomQty = 1;
  }
  if (normalized.overnightExtraBed !== undefined && normalized.overnightExtraBedQty === undefined) {
    normalized.overnightExtraBedQty = 1;
  }
  if (normalized.overnightExtraCot !== undefined && normalized.overnightExtraCotQty === undefined) {
    normalized.overnightExtraCotQty = 1;
  }
  if (normalized.nightCruiseExtraGuest !== undefined && normalized.nightCruiseExtraGuestQty === undefined) {
    normalized.nightCruiseExtraGuestQty = 1;
  }
  if (normalized.nightCruiseExtraRoom !== undefined && normalized.nightCruiseExtraRoomQty === undefined) {
    normalized.nightCruiseExtraRoomQty = 1;
  }
  return normalized;
}

function getDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatLocalPrice(price?: number): string {
  if (price === undefined || price === null) return "—";
  return price.toLocaleString("en-IN");
}

function formatLocalNumber(val?: number): string {
  if (val === undefined || val === null) return "";
  return val.toLocaleString("en-IN");
}

function formatInputWithCommas(v: string): string {
  const digits = v.replace(/[^0-9]/g, "");
  if (!digits) return "";
  const num = parseInt(digits, 10);
  return isNaN(num) ? "" : num.toLocaleString("en-IN");
}

function parsePriceString(val: string): number | undefined {
  if (!val) return undefined;
  const cleaned = val.replace(/,/g, "");
  const num = Number(cleaned);
  return isNaN(num) ? undefined : num;
}

function SkeletonCard({
  miniWeekdayLabels,
  miniCalendarWeeks,
}: {
  miniWeekdayLabels: string[];
  miniCalendarWeeks: Array<Array<number | null>>;
}) {
  return (
    <View style={styles.boatCard} testID="skeleton-boat-card">
      <View
        style={[
          {
            width: 80,
            height: 14,
            borderRadius: 4,
            backgroundColor: "#e2e8f0",
            marginBottom: 10,
            opacity: 0.5,
          },
        ]}
      />

      <View style={styles.miniCalendarContainer}>
        <View style={styles.miniCalendarHeader}>
          {miniWeekdayLabels.map((l, idx) => (
            <Text key={idx} style={[styles.miniCalendarHeaderLabel, { opacity: 0.5 }]}>
              {l}
            </Text>
          ))}
        </View>
        <View style={styles.miniCalendarGrid}>
          {miniCalendarWeeks.map((week, weekIdx) => (
            <View key={weekIdx} style={styles.miniCalendarWeekRow}>
              {week.map((day, dayIdx) => {
                if (day === null) {
                  return (
                    <View
                      key={`empty-${dayIdx}`}
                      style={styles.miniCalendarCellBlank}
                    />
                  );
                }

                return (
                  <View
                    key={day}
                    style={[
                      styles.miniCalendarCell,
                      {
                        backgroundColor: "#eceff1",
                        borderColor: "#cfd8dc",
                        opacity: 0.5,
                      },
                    ]}
                  />
                );
              })}
              {week.length < 7 &&
                Array.from({ length: 7 - week.length }).map(
                  (_, padIdx) => (
                    <View
                      key={`pad-${padIdx}`}
                      style={styles.miniCalendarCellBlank}
                    />
                  ),
                )}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export default function AvailabilityScreen() {
  const { boats } = useBoat();
  const [activeBoatForCalendar, setActiveBoatForCalendar] = useState<
    number | null
  >(null);
  const [zoomOrigin, setZoomOrigin] = useState({
    x: screenWidth / 2,
    y: screenHeight / 2,
  });
  const route = useRoute<RouteProp<{ Availability: { selectBoatId?: number } }, 'Availability'>>();
  const navigation = useNavigation<NavigationProp<MainTabParamList, 'Availability'>>();

  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();

  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(todayYear, todayMonth, 1),
  );
  const [isBulkPricingMode, setIsBulkPricingMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState<number[]>([]);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const [isCalendarFirstMount, setIsCalendarFirstMount] = useState(true);
  const [isSheetForBulk, setIsSheetForBulk] = useState(false);
  const [selectedDate, setSelectedDate] = useState<SelectedDate | null>(null);
  const [modalDayCruisePrice, setModalDayCruisePrice] = useState("");
  const [modalOvernightPrice, setModalOvernightPrice] = useState("");
  const [modalNightPrice, setModalNightPrice] = useState("");
  const [modalDayExtraGuest, setModalDayExtraGuest] = useState("");
  const [modalDayExtraRoom, setModalDayExtraRoom] = useState("");
  const [modalOvernightExtraBed, setModalOvernightExtraBed] = useState("");
  const [modalOvernightExtraCot, setModalOvernightExtraCot] = useState("");
  const [modalNightExtraGuest, setModalNightExtraGuest] = useState("");
  const [modalNightExtraRoom, setModalNightExtraRoom] = useState("");

  const [activeAddBookingType, setActiveAddBookingType] = useState<"day" | "overnight" | "night" | null>(null);
  const [bookingGuestName, setBookingGuestName] = useState("");
  const [bookingGuestCount, setBookingGuestCount] = useState("");
  const [bookingSpecialNotes, setBookingSpecialNotes] = useState("");
  const [bookingBasePrice, setBookingBasePrice] = useState("");
  const [bookingExtra1, setBookingExtra1] = useState("");
  const [bookingExtra2, setBookingExtra2] = useState("");
  const [bookingExtra1Qty, setBookingExtra1Qty] = useState("0");
  const [bookingExtra2Qty, setBookingExtra2Qty] = useState("0");
  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
  const [bookingBookedAmount, setBookingBookedAmount] = useState("");
  const [isBookedAmountManuallyEdited, setIsBookedAmountManuallyEdited] = useState(false);

  useEffect(() => {
    if (route.params?.selectBoatId) {
      const boatId = route.params.selectBoatId;
      navigation.setParams({ selectBoatId: undefined });
      const timer = setTimeout(() => {
        setZoomOrigin({ x: screenWidth / 2, y: screenHeight / 2 });
        setActiveBoatForCalendar(boatId);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [route.params?.selectBoatId, navigation]);

  const sheetOpenRef = useRef(false);
  const bulkModeRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (activeBoatForCalendar === null) return;

      const onBackPress = () => {
        // If bottom sheet is open, close it first
        if (sheetOpenRef.current) {
          bottomSheetRef.current?.close();
          setSelectedDate(null);
          setIsSheetForBulk(false);
          sheetOpenRef.current = false;
          return true;
        }
        // If in bulk pricing mode, exit it
        if (bulkModeRef.current) {
          setIsBulkPricingMode(false);
          setSelectedDates([]);
          setIsSheetForBulk(false);
          bulkModeRef.current = false;
          return true;
        }
        // Otherwise go back to availability home
        setActiveBoatForCalendar(null);
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => {
        subscription.remove();
      };
    }, [activeBoatForCalendar]),
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e: { preventDefault: () => void }) => {
      // If bottom sheet is open, close it first
      if (sheetOpenRef.current) {
        e.preventDefault();
        bottomSheetRef.current?.close();
        setSelectedDate(null);
        setIsSheetForBulk(false);
        sheetOpenRef.current = false;
        return;
      }
      // If in bulk pricing mode, exit it
      if (bulkModeRef.current) {
        e.preventDefault();
        setIsBulkPricingMode(false);
        setSelectedDates([]);
        setIsSheetForBulk(false);
        bulkModeRef.current = false;
        return;
      }
      // If calendar is open, go back to availability home
      if (activeBoatForCalendar !== null) {
        e.preventDefault();
        setActiveBoatForCalendar(null);
        return;
      }
    });

    return unsubscribe;
  }, [navigation, activeBoatForCalendar]);

  useEffect(() => {
    if (activeBoatForCalendar === null) {
      const timer = setTimeout(() => {
        setIsCalendarFirstMount(true);
      }, 0);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setIsCalendarFirstMount(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeBoatForCalendar]);

  useEffect(() => {
    if (!isBookedAmountManuallyEdited) {
      const base = parsePriceString(bookingBasePrice) || 0;
      const extra1 = parsePriceString(bookingExtra1) || 0;
      const qty1 = parseInt(bookingExtra1Qty, 10) || 0;
      const extra2 = parsePriceString(bookingExtra2) || 0;
      const qty2 = parseInt(bookingExtra2Qty, 10) || 0;
      const total = base + (extra1 * qty1) + (extra2 * qty2);
      const timer = setTimeout(() => {
        setBookingBookedAmount(total > 0 ? formatLocalNumber(total) : "");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [bookingBasePrice, bookingExtra1, bookingExtra2, bookingExtra1Qty, bookingExtra2Qty, isBookedAmountManuallyEdited]);

  const bottomSheetRef = useRef<BottomSheetRef>(null);
  const sheetSnapPoints = useMemo(() => ["75%", "95%"], []);

  const [bookingsByBoat, setBookingsByBoat] = useState<
    Record<number, Record<string, DayBooking>>
  >({});
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);

  useEffect(() => {
    let active = true;
    const loadCalendar = async () => {
      if (boats.length === 0) return;
      setIsLoadingCalendar(true);
      try {
        const allBookings: Record<number, Record<string, DayBooking>> = {};
        for (const boat of boats) {
          const res = await fetchCalendarBookings(boat.id);
          if (res.data) {
            allBookings[boat.id] = res.data;
          }
        }
        if (active) {
          setBookingsByBoat(allBookings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setIsLoadingCalendar(false);
      }
    };
    loadCalendar();
    return () => {
      active = false;
    };
  }, [boats]);

  useEffect(() => {
    if (isLoadingCalendar || !activeBoatForCalendar) return;
    const boatBookings = bookingsByBoat[activeBoatForCalendar];
    if (boatBookings) {
      saveAllCalendarBookings(activeBoatForCalendar, boatBookings);
    }
  }, [bookingsByBoat, activeBoatForCalendar, isLoadingCalendar]);

  const bookingsByDate = activeBoatForCalendar
    ? (bookingsByBoat[activeBoatForCalendar] ?? {})
    : {};

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



  function saveBooking(
    type: "day" | "overnight" | "night",
    guestName: string,
    guestCount: string,
    notes: string,
    basePrice: string,
    extra1: string,
    extra2: string,
    bookedAmount: string,
    extra1Qty: string,
    extra2Qty: string,
  ) {
    if (!selectedDate || !activeBoatForCalendar) return;
    const dateKey = getDateKey(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day,
    );

    const guestText = guestName.trim() || "Guest";
    const countText = guestCount.trim() ? `${guestCount.trim()} guests` : "";
    const notesText = notes.trim() ? `Notes: ${notes.trim()}` : "";
    const detailParts = [guestText, countText, notesText].filter(Boolean);
    const constructedDetails = detailParts.join(" · ");

    const parsedBase = parsePriceString(basePrice);
    const parsedExtra1 = parsePriceString(extra1);
    const parsedExtra2 = parsePriceString(extra2);
    const parsedBookedAmount = parsePriceString(bookedAmount);

    const parsedQty1 = parseInt(extra1Qty, 10) || 0;
    const parsedQty2 = parseInt(extra2Qty, 10) || 0;

    setBookingsByBoat((current) => {
      const boatBookings = current[activeBoatForCalendar] ?? {};
      const currentDayBooking = boatBookings[dateKey] ?? {
        dayCruise: false,
        overnightCruise: false,
        nightCruise: false,
        details: "",
      };

      const key = type === "day" ? "dayCruise" : type === "overnight" ? "overnightCruise" : "nightCruise";
      const detailsKey = type === "day" ? "dayCruiseDetails" : type === "overnight" ? "overnightCruiseDetails" : "nightCruiseDetails";
      const guestNameKey = type === "day" ? "dayCruiseGuestName" : type === "overnight" ? "overnightCruiseGuestName" : "nightCruiseGuestName";
      const guestCountKey = type === "day" ? "dayCruiseGuestCount" : type === "overnight" ? "overnightCruiseGuestCount" : "nightCruiseGuestCount";
      const notesKey = type === "day" ? "dayCruiseNotes" : type === "overnight" ? "overnightCruiseNotes" : "nightCruiseNotes";

      let priceUpdates: Partial<DayBooking> = {};
      if (type === "day") {
        priceUpdates = {
          dayCruisePrice: parsedBase,
          dayCruiseExtraGuest: parsedExtra1,
          dayCruiseExtraRoom: parsedExtra2,
          dayCruiseBookedAmount: parsedBookedAmount,
          dayCruiseExtraGuestQty: parsedQty1,
          dayCruiseExtraRoomQty: parsedQty2,
        };
      } else if (type === "overnight") {
        priceUpdates = {
          overnightCruisePrice: parsedBase,
          overnightExtraBed: parsedExtra1,
          overnightExtraCot: parsedExtra2,
          overnightCruiseBookedAmount: parsedBookedAmount,
          overnightExtraBedQty: parsedQty1,
          overnightExtraCotQty: parsedQty2,
        };
      } else if (type === "night") {
        priceUpdates = {
          nightCruisePrice: parsedBase,
          nightCruiseExtraGuest: parsedExtra1,
          nightCruiseExtraRoom: parsedExtra2,
          nightCruiseBookedAmount: parsedBookedAmount,
          nightCruiseExtraGuestQty: parsedQty1,
          nightCruiseExtraRoomQty: parsedQty2,
        };
      }

      const nextBooking: DayBooking = {
        ...currentDayBooking,
        [key]: true,
        [detailsKey]: constructedDetails,
        [guestNameKey]: guestName.trim(),
        [guestCountKey]: guestCount.trim(),
        [notesKey]: notes.trim(),
        ...priceUpdates,
      };

      if (type === "overnight") {
        nextBooking.nightCruise = false;
        nextBooking.nightCruiseDetails = undefined;
        nextBooking.nightCruiseGuestName = undefined;
        nextBooking.nightCruiseGuestCount = undefined;
        nextBooking.nightCruiseNotes = undefined;
        nextBooking.nightCruiseBookedAmount = undefined;
        nextBooking.nightCruiseExtraGuestQty = undefined;
        nextBooking.nightCruiseExtraRoomQty = undefined;
      } else if (type === "night") {
        nextBooking.overnightCruise = false;
        nextBooking.overnightCruiseDetails = undefined;
        nextBooking.overnightCruiseGuestName = undefined;
        nextBooking.overnightCruiseGuestCount = undefined;
        nextBooking.overnightCruiseNotes = undefined;
        nextBooking.overnightCruiseBookedAmount = undefined;
        nextBooking.overnightExtraBedQty = undefined;
        nextBooking.overnightExtraCotQty = undefined;
      }

      return {
        ...current,
        [activeBoatForCalendar]: {
          ...boatBookings,
          [dateKey]: normalizeBooking(nextBooking),
        },
      };
    });

    if (type === "day") {
      setModalDayCruisePrice(basePrice);
      setModalDayExtraGuest(extra1);
      setModalDayExtraRoom(extra2);
    } else if (type === "overnight") {
      setModalOvernightPrice(basePrice);
      setModalOvernightExtraBed(extra1);
      setModalOvernightExtraCot(extra2);
    } else if (type === "night") {
      setModalNightPrice(basePrice);
      setModalNightExtraGuest(extra1);
      setModalNightExtraRoom(extra2);
    }
  }

  function removeBooking(type: "day" | "overnight" | "night") {
    if (!selectedDate || !activeBoatForCalendar) return;
    const dateKey = getDateKey(
      selectedDate.year,
      selectedDate.month,
      selectedDate.day,
    );

    setBookingsByBoat((current) => {
      const boatBookings = current[activeBoatForCalendar] ?? {};
      const currentDayBooking = boatBookings[dateKey];
      if (!currentDayBooking) return current;

      const key = type === "day" ? "dayCruise" : type === "overnight" ? "overnightCruise" : "nightCruise";
      const detailsKey = type === "day" ? "dayCruiseDetails" : type === "overnight" ? "overnightCruiseDetails" : "nightCruiseDetails";
      const guestNameKey = type === "day" ? "dayCruiseGuestName" : type === "overnight" ? "overnightCruiseGuestName" : "nightCruiseGuestName";
      const guestCountKey = type === "day" ? "dayCruiseGuestCount" : type === "overnight" ? "overnightCruiseGuestCount" : "nightCruiseGuestCount";
      const notesKey = type === "day" ? "dayCruiseNotes" : type === "overnight" ? "overnightCruiseNotes" : "nightCruiseNotes";
      const bookedAmountKey = type === "day" ? "dayCruiseBookedAmount" : type === "overnight" ? "overnightCruiseBookedAmount" : "nightCruiseBookedAmount";

      const nextBooking: DayBooking = {
        ...currentDayBooking,
        [key]: false,
        [detailsKey]: undefined,
        [guestNameKey]: undefined,
        [guestCountKey]: undefined,
        [notesKey]: undefined,
        [bookedAmountKey]: undefined,
      };

      if (type === "day") {
        nextBooking.dayCruiseExtraGuestQty = undefined;
        nextBooking.dayCruiseExtraRoomQty = undefined;
      } else if (type === "overnight") {
        nextBooking.overnightExtraBedQty = undefined;
        nextBooking.overnightExtraCotQty = undefined;
      } else if (type === "night") {
        nextBooking.nightCruiseExtraGuestQty = undefined;
        nextBooking.nightCruiseExtraRoomQty = undefined;
      }

      return {
        ...current,
        [activeBoatForCalendar]: {
          ...boatBookings,
          [dateKey]: normalizeBooking(nextBooking),
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
    setModalDayCruisePrice(formatLocalNumber(existing?.dayCruisePrice));
    setModalDayExtraGuest(formatLocalNumber(existing?.dayCruiseExtraGuest));
    setModalDayExtraRoom(formatLocalNumber(existing?.dayCruiseExtraRoom));
    setModalOvernightPrice(formatLocalNumber(existing?.overnightCruisePrice));
    setModalOvernightExtraBed(formatLocalNumber(existing?.overnightExtraBed));
    setModalOvernightExtraCot(formatLocalNumber(existing?.overnightExtraCot));
    setModalNightPrice(formatLocalNumber(existing?.nightCruisePrice));
    setModalNightExtraGuest(formatLocalNumber(existing?.nightCruiseExtraGuest));
    setModalNightExtraRoom(formatLocalNumber(existing?.nightCruiseExtraRoom));
    setIsSheetForBulk(false);
    setSelectedDate({ year: visibleYear, month: visibleMonthIndex, day });
    sheetOpenRef.current = true;
    bottomSheetRef.current?.snapToIndex(0);
  }

  function handleDayLongPress(day: number) {
    setSelectedDate(null);
    setIsSheetForBulk(false);
    setIsBulkPricingMode(true);
    bulkModeRef.current = true;
    setSelectedDates((current) =>
      current.includes(day) ? current : [...current, day],
    );
  }

  function handleOpenBulkEditSheet() {
    setModalDayCruisePrice("");
    setModalDayExtraGuest("");
    setModalDayExtraRoom("");
    setModalOvernightPrice("");
    setModalOvernightExtraBed("");
    setModalOvernightExtraCot("");
    setModalNightPrice("");
    setModalNightExtraGuest("");
    setModalNightExtraRoom("");

    setIsSheetForBulk(true);
    sheetOpenRef.current = true;
    bottomSheetRef.current?.snapToIndex(0);
  }

  function moveMonth(delta: number) {
    setSlideDirection(delta > 0 ? 'left' : 'right');
    setVisibleMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + delta, 1),
    );
    setSelectedDates([]);
    setSelectedDate(null);
  }

  function cancelBulkMode() {
    setIsBulkPricingMode(false);
    bulkModeRef.current = false;
    setSelectedDates([]);
    setIsSheetForBulk(false);
    sheetOpenRef.current = false;
    bottomSheetRef.current?.close();
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

  const miniCalendarDays = [
    ...Array.from(
      { length: firstDayWeekIndex },
      () => null as number | null,
    ),
    ...Array.from({ length: daysInVisibleMonth }, (_, i) => i + 1),
  ];

  const miniCalendarWeeks: Array<Array<number | null>> = [];
  for (let i = 0; i < miniCalendarDays.length; i += 7) {
    miniCalendarWeeks.push(miniCalendarDays.slice(i, i + 7));
  }

  const miniWeekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  // Custom keyframes to scale from/to the exact page coordinate tapped by the user


  function handleSheetChange(index: number) {
    sheetOpenRef.current = index >= 0;
    if (index === -1) {
      setSelectedDate(null);
      setIsSheetForBulk(false);
      setActiveAddBookingType(null);
      setBookingGuestName("");
      setBookingGuestCount("");
      setBookingSpecialNotes("");
      setBookingBasePrice("");
      setBookingExtra1("");
      setBookingExtra2("");
      setBookingBookedAmount("");
      setIsBookingModalVisible(false);
    }
  }

  function handleSaveChanges() {
    if (!activeBoatForCalendar) return;

    if (isSheetForBulk) {
      const parsedDay = parsePriceString(modalDayCruisePrice);
      const parsedDayExtraGuest = parsePriceString(modalDayExtraGuest);
      const parsedDayExtraRoom = parsePriceString(modalDayExtraRoom);
      const parsedOvernight = parsePriceString(modalOvernightPrice);
      const parsedOvernightExtraBed = parsePriceString(modalOvernightExtraBed);
      const parsedOvernightExtraCot = parsePriceString(modalOvernightExtraCot);
      const parsedNight = parsePriceString(modalNightPrice);
      const parsedNightExtraGuest = parsePriceString(modalNightExtraGuest);
      const parsedNightExtraRoom = parsePriceString(modalNightExtraRoom);

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
            dayCruisePrice: parsedDay !== undefined ? parsedDay : existing.dayCruisePrice,
            dayCruiseExtraGuest: parsedDayExtraGuest !== undefined ? parsedDayExtraGuest : existing.dayCruiseExtraGuest,
            dayCruiseExtraRoom: parsedDayExtraRoom !== undefined ? parsedDayExtraRoom : existing.dayCruiseExtraRoom,
            overnightCruisePrice: parsedOvernight !== undefined ? parsedOvernight : existing.overnightCruisePrice,
            overnightExtraBed: parsedOvernightExtraBed !== undefined ? parsedOvernightExtraBed : existing.overnightExtraBed,
            overnightExtraCot: parsedOvernightExtraCot !== undefined ? parsedOvernightExtraCot : existing.overnightExtraCot,
            nightCruisePrice: parsedNight !== undefined ? parsedNight : existing.nightCruisePrice,
            nightCruiseExtraGuest: parsedNightExtraGuest !== undefined ? parsedNightExtraGuest : existing.nightCruiseExtraGuest,
            nightCruiseExtraRoom: parsedNightExtraRoom !== undefined ? parsedNightExtraRoom : existing.nightCruiseExtraRoom,
          });
        });
        return {
          ...current,
          [activeBoatForCalendar]: boatBookings,
        };
      });

      bottomSheetRef.current?.close();
      sheetOpenRef.current = false;
      setSelectedDates([]);
      setIsBulkPricingMode(false);
      bulkModeRef.current = false;
      setIsSheetForBulk(false);
    } else if (selectedDate) {
      const dateKey = getDateKey(
        selectedDate.year,
        selectedDate.month,
        selectedDate.day,
      );
      const parsedDay = parsePriceString(modalDayCruisePrice);
      const parsedDayExtraGuest = parsePriceString(modalDayExtraGuest);
      const parsedDayExtraRoom = parsePriceString(modalDayExtraRoom);
      const parsedOvernight = parsePriceString(modalOvernightPrice);
      const parsedOvernightExtraBed = parsePriceString(modalOvernightExtraBed);
      const parsedOvernightExtraCot = parsePriceString(modalOvernightExtraCot);
      const parsedNight = parsePriceString(modalNightPrice);
      const parsedNightExtraGuest = parsePriceString(modalNightExtraGuest);
      const parsedNightExtraRoom = parsePriceString(modalNightExtraRoom);
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
              dayCruiseExtraGuest: parsedDayExtraGuest,
              dayCruiseExtraRoom: parsedDayExtraRoom,
              overnightCruisePrice: parsedOvernight,
              overnightExtraBed: parsedOvernightExtraBed,
              overnightExtraCot: parsedOvernightExtraCot,
              nightCruisePrice: parsedNight,
              nightCruiseExtraGuest: parsedNightExtraGuest,
              nightCruiseExtraRoom: parsedNightExtraRoom,
            }),
          },
        };
      });
      bottomSheetRef.current?.close();
      setSelectedDate(null);
      sheetOpenRef.current = false;
    }
  }

  return (
    <GestureHandlerRootView style={styles.calendarPageRoot}>
    <KeyboardAvoidingView
      style={styles.calendarPageRoot}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {activeBoatForCalendar === null ? (
        <View
          key="home"
          style={styles.flex1}
        >
          <ScrollView contentContainerStyle={styles.pageScrollContent}>
            <PageHeader
              title="Availability"
              sub={`Select a boat to manage detailed availability · ${visibleMonthTitle}`}
            />

            <View style={[styles.card, { marginBottom: 16 }]}>
              <View style={[styles.calendarMonthRow, { marginBottom: 0 }]}>
                <Pressable
                  onPress={() => moveMonth(-1)}
                  style={styles.monthChevronButton}
                  testID="home-month-prev"
                >
                  <Text style={styles.monthChevronText}>‹</Text>
                </Pressable>
                <Text
                  style={styles.calendarMonthTitle}
                  testID="home-calendar-month-title"
                >
                  {visibleMonthTitle}
                </Text>
                <Pressable
                  onPress={() => moveMonth(1)}
                  style={styles.monthChevronButton}
                  testID="home-month-next"
                >
                  <Text style={styles.monthChevronText}>›</Text>
                </Pressable>
              </View>
            </View>

            {isLoadingCalendar ? (
              <View style={styles.boatGrid} testID="skeleton-loading-grid">
                {(boats.length > 0 ? boats : Array.from({ length: 4 })).map((item, idx) => (
                  <SkeletonCard
                    key={item && typeof item === "object" && "id" in item ? (item as any).id : idx}
                    miniWeekdayLabels={miniWeekdayLabels}
                    miniCalendarWeeks={miniCalendarWeeks}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.boatGrid}>
                {boats.map((boat) => (
                  <Pressable
                    key={boat.id}
                    onPress={(event) => {
                      const pageX = event?.nativeEvent?.pageX;
                      const pageY = event?.nativeEvent?.pageY;
                      setZoomOrigin({
                        x: pageX ?? screenWidth / 2,
                        y: pageY ?? screenHeight / 2,
                      });
                      if (process.env.NODE_ENV === "test") {
                        setActiveBoatForCalendar(boat.id);
                      } else {
                        // Defer view toggle state updates to the next frame to ensure the
                        // home view re-renders with the correct zoomOrigin before unmounting.
                        requestAnimationFrame(() => {
                          setActiveBoatForCalendar(boat.id);
                        });
                      }
                    }}
                    style={({ pressed }) => [
                      styles.boatCard,
                      pressed ? styles.boatCardPressed : null,
                    ]}
                    testID={`boat-card-${boat.name.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    <Text style={styles.boatCardTitle} numberOfLines={1}>
                      {boat.name}
                    </Text>

                    <View style={styles.miniCalendarContainer}>
                      <View style={styles.miniCalendarHeader}>
                        {miniWeekdayLabels.map((l, idx) => (
                          <Text key={idx} style={styles.miniCalendarHeaderLabel}>
                            {l}
                          </Text>
                        ))}
                      </View>
                      <View style={styles.miniCalendarGrid}>
                        {miniCalendarWeeks.map((week, weekIdx) => (
                          <View key={weekIdx} style={styles.miniCalendarWeekRow}>
                            {week.map((day, dayIdx) => {
                              if (day === null) {
                                return (
                                  <View
                                    key={`empty-${dayIdx}`}
                                    style={styles.miniCalendarCellBlank}
                                  />
                                );
                              }
                              const dateKey = getDateKey(
                                visibleYear,
                                visibleMonthIndex,
                                day,
                              );
                              const booking = bookingsByBoat[boat.id]?.[dateKey];
                              const allCruisesBooked =
                                booking?.dayCruise &&
                                (booking?.overnightCruise ||
                                  booking?.nightCruise);
                              const anyCruiseBooked =
                                booking?.dayCruise ||
                                booking?.overnightCruise ||
                                booking?.nightCruise;

                              let cellColor = styles.dayCellEmpty.backgroundColor;
                              let borderColor = styles.dayCellEmpty.borderColor;
                              if (allCruisesBooked) {
                                cellColor = styles.dayCellFull.backgroundColor;
                                borderColor = styles.dayCellFull.borderColor;
                              } else if (anyCruiseBooked) {
                                cellColor = styles.dayCellPartial.backgroundColor;
                                borderColor = styles.dayCellPartial.borderColor;
                              }

                              return (
                                <View
                                  key={day}
                                  style={[
                                    styles.miniCalendarCell,
                                    {
                                      backgroundColor: cellColor,
                                      borderColor: borderColor,
                                    },
                                  ]}
                                />
                              );
                            })}
                            {week.length < 7 &&
                              Array.from({ length: 7 - week.length }).map(
                                (_, padIdx) => (
                                  <View
                                    key={`pad-${padIdx}`}
                                    style={styles.miniCalendarCellBlank}
                                  />
                                ),
                              )}
                          </View>
                        ))}
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}

            <View style={styles.calendarLegendRow}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    {
                      backgroundColor: styles.dayCellEmpty.backgroundColor,
                      borderColor: styles.dayCellEmpty.borderColor,
                    },
                  ]}
                />
                <Text style={styles.legendText}>Available</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    {
                      backgroundColor: styles.dayCellPartial.backgroundColor,
                      borderColor: styles.dayCellPartial.borderColor,
                    },
                  ]}
                />
                <Text style={styles.legendText}>Partially Booked</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    {
                      backgroundColor: styles.dayCellFull.backgroundColor,
                      borderColor: styles.dayCellFull.borderColor,
                    },
                  ]}
                />
                <Text style={styles.legendText}>Fully Booked</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      ) : (
        <View
          key="detail"
          style={styles.flex1}
        >
          <ScrollView contentContainerStyle={styles.pageScrollContent}>
            <PageHeader
              title={boats.find((b) => b.id === activeBoatForCalendar)?.name || ""}
              sub={`Manage detailed availability, override prices, and view bookings. · Date: ${visibleMonthTitle}`}
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
                {weekdayLabels.map((label, idx) => (
                  <Text
                    key={label}
                    style={[
                      styles.weekdayHeaderText,
                      (idx === 0 || idx === 6) ? styles.weekdayHeaderTextWeekend : null,
                    ]}
                  >
                    {label}
                  </Text>
                ))}
              </View>

              <GestureDetector gesture={calendarSwipeGesture}>
              <View style={{ overflow: 'hidden', flex: 1 }}>
              <View
                key={`${visibleYear}-${visibleMonthIndex}`}
                style={styles.calendarGrid}
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
                                calendarDays.slice(
                                  weekIndex * 7,
                                  weekIndex * 7 + 7,
                                ).length,
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
                                <Check
                                  size={8}
                                  color="#ffffff"
                                  strokeWidth={3}
                                />
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
                                    {formatLocalPrice(booking.dayCruise ? (booking.dayCruiseBookedAmount ?? booking.dayCruisePrice) : booking.dayCruisePrice)}
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
                                    {formatLocalPrice(booking.overnightCruise ? (booking.overnightCruiseBookedAmount ?? booking.overnightCruisePrice) : booking.overnightCruisePrice)}
                                  </Text>
                                </View>
                              ) : null}
                              {booking?.nightCruise ||
                              booking?.nightCruisePrice ? (
                                <View style={styles.dayCellCruiseRow}>
                                  <CruiseTypeIcon type="night" />
                                  <Text
                                    style={styles.dayCellCruisePrice}
                                    numberOfLines={1}
                                  >
                                    {formatLocalPrice(booking.nightCruise ? (booking.nightCruiseBookedAmount ?? booking.nightCruisePrice) : booking.nightCruisePrice)}
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
              </View>
              </GestureDetector>

              <View style={styles.bulkPricingRow}>
                <CalendarDays size={16} color="#1a7f7f" strokeWidth={2.2} />
                <View style={styles.bulkPricingTextBlock}>
                  <Text style={styles.bulkPricingLabel}>
                    Bulk price editing
                  </Text>
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
                      bulkModeRef.current = true;
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
                      isBulkPricingMode
                        ? styles.bulkToggleButtonCancelText
                        : null,
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
                      : "Tap more dates to add, then tap Edit"}
                  </Text>
                </View>
                <Pressable
                  onPress={cancelBulkMode}
                  style={styles.bottomSheetCloseButton}
                  testID="bulk-close-button"
                >
                  <X size={16} color="#5a6d82" strokeWidth={2.2} />
                </Pressable>
              </View>
              <Pressable
                onPress={handleOpenBulkEditSheet}
                disabled={selectedDates.length === 0}
                style={[
                  styles.applyPriceButton,
                  selectedDates.length === 0 ? styles.applyPriceButtonDisabled : null,
                ]}
                testID="edit-selected-dates-button"
              >
                <Text style={styles.applyPriceButtonText}>Edit Selected Dates</Text>
              </Pressable>
            </View>
          ) : null}

        </View>
      )}

      {/* Native Draggable Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={sheetSnapPoints}
        enablePanDownToClose
        onChange={handleSheetChange}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetHandleIndicator}
      >
        <BottomSheetScrollView contentContainerStyle={styles.sheetScroll}>
          {(selectedDate || (isSheetForBulk && selectedDates.length > 0)) ? (
            <>
              {/* Header: Date + actions */}
              <View style={styles.sheetDateHeader}>
                <Text style={styles.sheetDateText}>
                  {isSheetForBulk
                    ? `Bulk Edit: ${selectedDates.length} ${selectedDates.length === 1 ? "date" : "dates"} selected`
                    : selectedDate
                      ? `${selectedDate.day} ${new Date(selectedDate.year, selectedDate.month, selectedDate.day).toLocaleString("en-US", { month: "short" })} ${selectedDate.year}`
                      : ""}
                </Text>
              </View>

              {/* Info banner */}
              <View style={styles.sheetInfoBanner}>
                <Info size={16} color="#5a6d82" strokeWidth={2} />
                <Text style={styles.sheetInfoText}>
                  Overnight stay and Night stay cannot be booked together.
                </Text>
              </View>

              {/* Day Cruise Card */}
              <View style={styles.cruiseCard}>
                <View style={styles.cruiseCardHeader}>
                  <CruiseTypeIcon type="day" size="regular" />
                  <Text style={styles.cruiseCardLabel}>Day cruise</Text>
                  {!isSheetForBulk && (
                    <>
                      {selectedBooking.dayCruise ? (
                        <View style={styles.bookedPill}>
                          <Check size={12} color="#ffffff" strokeWidth={2.5} />
                          <Text style={styles.bookedPillText}>Booked</Text>
                        </View>
                      ) : (
                        <Pressable
                          onPress={() => {
                            setBookingGuestName("");
                            setBookingGuestCount("");
                            setBookingSpecialNotes("");
                            setBookingBasePrice(modalDayCruisePrice);
                            setBookingExtra1(modalDayExtraGuest);
                            setBookingExtra2(modalDayExtraRoom);
                            setBookingExtra1Qty("0");
                            setBookingExtra2Qty("0");
                            setIsBookedAmountManuallyEdited(false);
                            setBookingBookedAmount(modalDayCruisePrice);
                            setActiveAddBookingType("day");
                            setIsBookingModalVisible(true);
                          }}
                          style={styles.addBookingButtonPill}
                          testID="add-booking-button-day"
                        >
                          <Text style={styles.addBookingButtonPillText}>+ Add booking</Text>
                        </Pressable>
                      )}
                    </>
                  )}
                </View>

                {/* Booking details when booked */}
                {!isSheetForBulk && selectedBooking.dayCruise && (
                  <View style={styles.bookingDetailsDisplay}>
                    <Text style={styles.bookingDetailsText}>
                      {selectedBooking.dayCruiseDetails || "No details provided"}
                    </Text>
                    
                    {/* Prices summary */}
                    <View style={styles.bookedPriceSummary}>
                      <Text style={styles.bookedPriceItem}>
                        Base Rate: ₹{formatLocalPrice(selectedBooking.dayCruisePrice)}
                      </Text>
                      {selectedBooking.dayCruiseExtraGuest !== undefined && (
                        <Text style={styles.bookedPriceItem}>
                          Extra Guest (x{selectedBooking.dayCruiseExtraGuestQty ?? 1}): ₹{formatLocalPrice(selectedBooking.dayCruiseExtraGuest * (selectedBooking.dayCruiseExtraGuestQty ?? 1))}
                        </Text>
                      )}
                      {selectedBooking.dayCruiseExtraRoom !== undefined && (
                        <Text style={styles.bookedPriceItem}>
                          Extra Room (x{selectedBooking.dayCruiseExtraRoomQty ?? 1}): ₹{formatLocalPrice(selectedBooking.dayCruiseExtraRoom * (selectedBooking.dayCruiseExtraRoomQty ?? 1))}
                        </Text>
                      )}
                      <Text style={[styles.bookedPriceItem, styles.bookedAmountHighlight]}>
                        Booked For: ₹{formatLocalPrice(selectedBooking.dayCruiseBookedAmount ?? selectedBooking.dayCruisePrice)}
                      </Text>
                    </View>

                    <View style={styles.formActionsRow}>
                      <Pressable
                        onPress={() => {
                          let guestName = selectedBooking.dayCruiseGuestName || "";
                          let guestCount = selectedBooking.dayCruiseGuestCount || "";
                          let notes = selectedBooking.dayCruiseNotes || "";
                          if (!guestName && !guestCount && !notes && selectedBooking.dayCruiseDetails) {
                            const parts = selectedBooking.dayCruiseDetails.split(" · ");
                            guestName = parts[0] || "";
                            if (parts[1] && parts[1].includes("guests")) {
                              guestCount = parts[1].replace(/[^0-9]/g, "");
                            }
                            const notesPart = parts.find(p => p.startsWith("Notes: "));
                            if (notesPart) {
                              notes = notesPart.replace("Notes: ", "");
                            } else if (parts.length > 2) {
                              notes = parts[2];
                            }
                          }
                          setBookingGuestName(guestName);
                          setBookingGuestCount(guestCount);
                          setBookingSpecialNotes(notes);
                          setBookingBasePrice(selectedBooking.dayCruisePrice ? formatLocalNumber(selectedBooking.dayCruisePrice) : "");
                          setBookingExtra1(selectedBooking.dayCruiseExtraGuest ? formatLocalNumber(selectedBooking.dayCruiseExtraGuest) : "");
                          setBookingExtra2(selectedBooking.dayCruiseExtraRoom ? formatLocalNumber(selectedBooking.dayCruiseExtraRoom) : "");
                          setBookingExtra1Qty(selectedBooking.dayCruiseExtraGuestQty !== undefined ? String(selectedBooking.dayCruiseExtraGuestQty) : "1");
                          setBookingExtra2Qty(selectedBooking.dayCruiseExtraRoomQty !== undefined ? String(selectedBooking.dayCruiseExtraRoomQty) : "1");
                          setBookingBookedAmount(selectedBooking.dayCruiseBookedAmount ? formatLocalNumber(selectedBooking.dayCruiseBookedAmount) : (selectedBooking.dayCruisePrice ? formatLocalNumber(selectedBooking.dayCruisePrice) : ""));
                          setIsBookedAmountManuallyEdited(true);
                          setActiveAddBookingType("day");
                          setIsBookingModalVisible(true);
                        }}
                        style={styles.editBookingButton}
                        testID="edit-booking-button-day"
                      >
                        <Text style={styles.editBookingButtonText}>Edit</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => removeBooking("day")}
                        style={styles.removeBookingButton}
                        testID="remove-booking-button-day"
                      >
                        <Text style={styles.removeBookingButtonText}>Remove booking</Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* Price fields only visible when not booked, OR when editing in bulk */}
                {(isSheetForBulk || !selectedBooking.dayCruise) && (
                  <View style={styles.priceFieldsRow}>
                    <View style={styles.priceFieldBox}>
                      <Text style={styles.priceFieldLabel}>Base price</Text>
                      <View style={styles.priceFieldInput}>
                        <Text style={styles.priceFieldRupee}>₹</Text>
                        <TextInput
                          value={modalDayCruisePrice}
                          onChangeText={(v) => setModalDayCruisePrice(formatInputWithCommas(v))}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#9aafbf"
                          style={styles.priceFieldTextInput}
                          testID="modal-price-input-day"
                        />
                      </View>
                    </View>
                    <View style={styles.priceFieldBox}>
                      <Text style={styles.priceFieldLabel}>Extra guest</Text>
                      <View style={styles.priceFieldInput}>
                        <Text style={styles.priceFieldRupee}>₹</Text>
                        <TextInput
                          value={modalDayExtraGuest}
                          onChangeText={(v) => setModalDayExtraGuest(formatInputWithCommas(v))}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#9aafbf"
                          style={styles.priceFieldTextInput}
                          testID="modal-day-extra-guest"
                        />
                      </View>
                    </View>
                    <View style={styles.priceFieldBox}>
                      <Text style={styles.priceFieldLabel}>Extra room</Text>
                      <View style={styles.priceFieldInput}>
                        <Text style={styles.priceFieldRupee}>₹</Text>
                        <TextInput
                          value={modalDayExtraRoom}
                          onChangeText={(v) => setModalDayExtraRoom(formatInputWithCommas(v))}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#9aafbf"
                          style={styles.priceFieldTextInput}
                          testID="modal-day-extra-room"
                        />
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* Overnight Card */}
              <View style={styles.cruiseCard}>
                <View style={styles.cruiseCardHeader}>
                  <CruiseTypeIcon type="overnight" size="regular" />
                  <Text style={styles.cruiseCardLabel}>Overnight</Text>
                  {!isSheetForBulk && (
                    <>
                      {selectedBooking.overnightCruise ? (
                        <View style={styles.bookedPill}>
                          <Check size={12} color="#ffffff" strokeWidth={2.5} />
                          <Text style={styles.bookedPillText}>Booked</Text>
                        </View>
                      ) : (
                        <Pressable
                          onPress={() => {
                            setBookingGuestName("");
                            setBookingGuestCount("");
                            setBookingSpecialNotes("");
                            setBookingBasePrice(modalOvernightPrice);
                            setBookingExtra1(modalOvernightExtraBed);
                            setBookingExtra2(modalOvernightExtraCot);
                            setBookingExtra1Qty("0");
                            setBookingExtra2Qty("0");
                            setIsBookedAmountManuallyEdited(false);
                            setBookingBookedAmount(modalOvernightPrice);
                            setActiveAddBookingType("overnight");
                            setIsBookingModalVisible(true);
                          }}
                          style={styles.addBookingButtonPill}
                          testID="add-booking-button-overnight"
                        >
                          <Text style={styles.addBookingButtonPillText}>+ Add booking</Text>
                        </Pressable>
                      )}
                    </>
                  )}
                </View>

                {/* Booking details when booked */}
                {!isSheetForBulk && selectedBooking.overnightCruise && (
                  <View style={styles.bookingDetailsDisplay}>
                    <Text style={styles.bookingDetailsText}>
                      {selectedBooking.overnightCruiseDetails || "No details provided"}
                    </Text>
                    
                    {/* Prices summary */}
                    <View style={styles.bookedPriceSummary}>
                      <Text style={styles.bookedPriceItem}>
                        Base Rate: ₹{formatLocalPrice(selectedBooking.overnightCruisePrice)}
                      </Text>
                      {selectedBooking.overnightExtraBed !== undefined && (
                        <Text style={styles.bookedPriceItem}>
                          Extra Bed (x{selectedBooking.overnightExtraBedQty ?? 1}): ₹{formatLocalPrice(selectedBooking.overnightExtraBed * (selectedBooking.overnightExtraBedQty ?? 1))}
                        </Text>
                      )}
                      {selectedBooking.overnightExtraCot !== undefined && (
                        <Text style={styles.bookedPriceItem}>
                          Extra Cot (x{selectedBooking.overnightExtraCotQty ?? 1}): ₹{formatLocalPrice(selectedBooking.overnightExtraCot * (selectedBooking.overnightExtraCotQty ?? 1))}
                        </Text>
                      )}
                      <Text style={[styles.bookedPriceItem, styles.bookedAmountHighlight]}>
                        Booked For: ₹{formatLocalPrice(selectedBooking.overnightCruiseBookedAmount ?? selectedBooking.overnightCruisePrice)}
                      </Text>
                    </View>

                    <View style={styles.formActionsRow}>
                      <Pressable
                        onPress={() => {
                          let guestName = selectedBooking.overnightCruiseGuestName || "";
                          let guestCount = selectedBooking.overnightCruiseGuestCount || "";
                          let notes = selectedBooking.overnightCruiseNotes || "";
                          if (!guestName && !guestCount && !notes && selectedBooking.overnightCruiseDetails) {
                            const parts = selectedBooking.overnightCruiseDetails.split(" · ");
                            guestName = parts[0] || "";
                            if (parts[1] && parts[1].includes("guests")) {
                              guestCount = parts[1].replace(/[^0-9]/g, "");
                            }
                            const notesPart = parts.find(p => p.startsWith("Notes: "));
                            if (notesPart) {
                              notes = notesPart.replace("Notes: ", "");
                            } else if (parts.length > 2) {
                              notes = parts[2];
                            }
                          }
                          setBookingGuestName(guestName);
                          setBookingGuestCount(guestCount);
                          setBookingSpecialNotes(notes);
                          setBookingBasePrice(selectedBooking.overnightCruisePrice ? formatLocalNumber(selectedBooking.overnightCruisePrice) : "");
                          setBookingExtra1(selectedBooking.overnightExtraBed ? formatLocalNumber(selectedBooking.overnightExtraBed) : "");
                          setBookingExtra2(selectedBooking.overnightExtraCot ? formatLocalNumber(selectedBooking.overnightExtraCot) : "");
                          setBookingExtra1Qty(selectedBooking.overnightExtraBedQty !== undefined ? String(selectedBooking.overnightExtraBedQty) : "1");
                          setBookingExtra2Qty(selectedBooking.overnightExtraCotQty !== undefined ? String(selectedBooking.overnightExtraCotQty) : "1");
                          setBookingBookedAmount(selectedBooking.overnightCruiseBookedAmount ? formatLocalNumber(selectedBooking.overnightCruiseBookedAmount) : (selectedBooking.overnightCruisePrice ? formatLocalNumber(selectedBooking.overnightCruisePrice) : ""));
                          setIsBookedAmountManuallyEdited(true);
                          setActiveAddBookingType("overnight");
                          setIsBookingModalVisible(true);
                        }}
                        style={styles.editBookingButton}
                        testID="edit-booking-button-overnight"
                      >
                        <Text style={styles.editBookingButtonText}>Edit</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => removeBooking("overnight")}
                        style={styles.removeBookingButton}
                        testID="remove-booking-button-overnight"
                      >
                        <Text style={styles.removeBookingButtonText}>Remove booking</Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* Price fields only visible when not booked, OR when editing in bulk */}
                {(isSheetForBulk || !selectedBooking.overnightCruise) && (
                  <View style={styles.priceFieldsRow}>
                    <View style={styles.priceFieldBox}>
                      <Text style={styles.priceFieldLabel}>Base price</Text>
                      <View style={styles.priceFieldInput}>
                        <Text style={styles.priceFieldRupee}>₹</Text>
                        <TextInput
                          value={modalOvernightPrice}
                          onChangeText={(v) => setModalOvernightPrice(formatInputWithCommas(v))}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#9aafbf"
                          style={styles.priceFieldTextInput}
                          testID="modal-price-input-overnight"
                        />
                      </View>
                    </View>
                    <View style={styles.priceFieldBox}>
                      <Text style={styles.priceFieldLabel}>Extra bed</Text>
                      <View style={styles.priceFieldInput}>
                        <Text style={styles.priceFieldRupee}>₹</Text>
                        <TextInput
                          value={modalOvernightExtraBed}
                          onChangeText={(v) => setModalOvernightExtraBed(formatInputWithCommas(v))}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#9aafbf"
                          style={styles.priceFieldTextInput}
                          testID="modal-overnight-extra-bed"
                        />
                      </View>
                    </View>
                    <View style={styles.priceFieldBox}>
                      <Text style={styles.priceFieldLabel}>Extra cot</Text>
                      <View style={styles.priceFieldInput}>
                        <Text style={styles.priceFieldRupee}>₹</Text>
                        <TextInput
                          value={modalOvernightExtraCot}
                          onChangeText={(v) => setModalOvernightExtraCot(formatInputWithCommas(v))}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#9aafbf"
                          style={styles.priceFieldTextInput}
                          testID="modal-overnight-extra-cot"
                        />
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* Night Stay Card */}
              <View style={styles.cruiseCard}>
                <View style={styles.cruiseCardHeader}>
                  <CruiseTypeIcon type="night" size="regular" />
                  <Text style={styles.cruiseCardLabel}>Night stay</Text>
                  {!isSheetForBulk && (
                    <>
                      {selectedBooking.nightCruise ? (
                        <View style={styles.bookedPill}>
                          <Check size={12} color="#ffffff" strokeWidth={2.5} />
                          <Text style={styles.bookedPillText}>Booked</Text>
                        </View>
                      ) : (
                        <Pressable
                          onPress={() => {
                            setBookingGuestName("");
                            setBookingGuestCount("");
                            setBookingSpecialNotes("");
                            setBookingBasePrice(modalNightPrice);
                            setBookingExtra1(modalNightExtraGuest);
                            setBookingExtra2(modalNightExtraRoom);
                            setBookingExtra1Qty("0");
                            setBookingExtra2Qty("0");
                            setIsBookedAmountManuallyEdited(false);
                            setBookingBookedAmount(modalNightPrice);
                            setActiveAddBookingType("night");
                            setIsBookingModalVisible(true);
                          }}
                          style={styles.addBookingButtonPill}
                          testID="add-booking-button-night"
                        >
                          <Text style={styles.addBookingButtonPillText}>+ Add booking</Text>
                        </Pressable>
                      )}
                    </>
                  )}
                </View>

                {/* Booking details when booked */}
                {!isSheetForBulk && selectedBooking.nightCruise && (
                  <View style={styles.bookingDetailsDisplay}>
                    <Text style={styles.bookingDetailsText}>
                      {selectedBooking.nightCruiseDetails || "No details provided"}
                    </Text>
                    
                    {/* Prices summary */}
                    <View style={styles.bookedPriceSummary}>
                      <Text style={styles.bookedPriceItem}>
                        Base Rate: ₹{formatLocalPrice(selectedBooking.nightCruisePrice)}
                      </Text>
                      {selectedBooking.nightCruiseExtraGuest !== undefined && (
                        <Text style={styles.bookedPriceItem}>
                          Extra Guest (x{selectedBooking.nightCruiseExtraGuestQty ?? 1}): ₹{formatLocalPrice(selectedBooking.nightCruiseExtraGuest * (selectedBooking.nightCruiseExtraGuestQty ?? 1))}
                        </Text>
                      )}
                      {selectedBooking.nightCruiseExtraRoom !== undefined && (
                        <Text style={styles.bookedPriceItem}>
                          Extra Room (x{selectedBooking.nightCruiseExtraRoomQty ?? 1}): ₹{formatLocalPrice(selectedBooking.nightCruiseExtraRoom * (selectedBooking.nightCruiseExtraRoomQty ?? 1))}
                        </Text>
                      )}
                      <Text style={[styles.bookedPriceItem, styles.bookedAmountHighlight]}>
                        Booked For: ₹{formatLocalPrice(selectedBooking.nightCruiseBookedAmount ?? selectedBooking.nightCruisePrice)}
                      </Text>
                    </View>

                    <View style={styles.formActionsRow}>
                      <Pressable
                        onPress={() => {
                          let guestName = selectedBooking.nightCruiseGuestName || "";
                          let guestCount = selectedBooking.nightCruiseGuestCount || "";
                          let notes = selectedBooking.nightCruiseNotes || "";
                          if (!guestName && !guestCount && !notes && selectedBooking.nightCruiseDetails) {
                            const parts = selectedBooking.nightCruiseDetails.split(" · ");
                            guestName = parts[0] || "";
                            if (parts[1] && parts[1].includes("guests")) {
                              guestCount = parts[1].replace(/[^0-9]/g, "");
                            }
                            const notesPart = parts.find(p => p.startsWith("Notes: "));
                            if (notesPart) {
                              notes = notesPart.replace("Notes: ", "");
                            } else if (parts.length > 2) {
                              notes = parts[2];
                            }
                          }
                          setBookingGuestName(guestName);
                          setBookingGuestCount(guestCount);
                          setBookingSpecialNotes(notes);
                          setBookingBasePrice(selectedBooking.nightCruisePrice ? formatLocalNumber(selectedBooking.nightCruisePrice) : "");
                          setBookingExtra1(selectedBooking.nightCruiseExtraGuest ? formatLocalNumber(selectedBooking.nightCruiseExtraGuest) : "");
                          setBookingExtra2(selectedBooking.nightCruiseExtraRoom ? formatLocalNumber(selectedBooking.nightCruiseExtraRoom) : "");
                          setBookingExtra1Qty(selectedBooking.nightCruiseExtraGuestQty !== undefined ? String(selectedBooking.nightCruiseExtraGuestQty) : "1");
                          setBookingExtra2Qty(selectedBooking.nightCruiseExtraRoomQty !== undefined ? String(selectedBooking.nightCruiseExtraRoomQty) : "1");
                          setBookingBookedAmount(selectedBooking.nightCruiseBookedAmount ? formatLocalNumber(selectedBooking.nightCruiseBookedAmount) : (selectedBooking.nightCruisePrice ? formatLocalNumber(selectedBooking.nightCruisePrice) : ""));
                          setIsBookedAmountManuallyEdited(true);
                          setActiveAddBookingType("night");
                          setIsBookingModalVisible(true);
                        }}
                        style={styles.editBookingButton}
                        testID="edit-booking-button-night"
                      >
                        <Text style={styles.editBookingButtonText}>Edit</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => removeBooking("night")}
                        style={styles.removeBookingButton}
                        testID="remove-booking-button-night"
                      >
                        <Text style={styles.removeBookingButtonText}>Remove booking</Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* Price fields only visible when not booked, OR when editing in bulk */}
                {(isSheetForBulk || !selectedBooking.nightCruise) && (
                  <View style={styles.priceFieldsRow}>
                    <View style={styles.priceFieldBox}>
                      <Text style={styles.priceFieldLabel}>Base price</Text>
                      <View style={styles.priceFieldInput}>
                        <Text style={styles.priceFieldRupee}>₹</Text>
                        <TextInput
                          value={modalNightPrice}
                          onChangeText={(v) => setModalNightPrice(formatInputWithCommas(v))}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#9aafbf"
                          style={styles.priceFieldTextInput}
                          testID="modal-price-input-night"
                        />
                      </View>
                    </View>
                    <View style={styles.priceFieldBox}>
                      <Text style={styles.priceFieldLabel}>Extra guest</Text>
                      <View style={styles.priceFieldInput}>
                        <Text style={styles.priceFieldRupee}>₹</Text>
                        <TextInput
                          value={modalNightExtraGuest}
                          onChangeText={(v) => setModalNightExtraGuest(formatInputWithCommas(v))}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#9aafbf"
                          style={styles.priceFieldTextInput}
                          testID="modal-night-extra-guest"
                        />
                      </View>
                    </View>
                    <View style={styles.priceFieldBox}>
                      <Text style={styles.priceFieldLabel}>Extra room</Text>
                      <View style={styles.priceFieldInput}>
                        <Text style={styles.priceFieldRupee}>₹</Text>
                        <TextInput
                          value={modalNightExtraRoom}
                          onChangeText={(v) => setModalNightExtraRoom(formatInputWithCommas(v))}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="#9aafbf"
                          style={styles.priceFieldTextInput}
                          testID="modal-night-extra-room"
                        />
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* Save Changes Button */}
              <Pressable
                onPress={handleSaveChanges}
                style={styles.saveChangesButton}
                testID="modal-save-changes-button"
              >
                <Text style={styles.saveChangesButtonText}>Save changes</Text>
              </Pressable>
            </>
          ) : null}
        </BottomSheetScrollView>
      </BottomSheet>

      {/* Booking Form Modal Overlay */}
      <Modal
        visible={isBookingModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsBookingModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.modalFormHeader}>
                <Text style={styles.modalTitle}>
                  {activeAddBookingType === "day"
                    ? (selectedBooking.dayCruise ? "Edit Offline Booking" : "Add Offline Booking")
                    : activeAddBookingType === "overnight"
                      ? (selectedBooking.overnightCruise ? "Edit Offline Booking" : "Add Offline Booking")
                      : (selectedBooking.nightCruise ? "Edit Offline Booking" : "Add Offline Booking")}
                </Text>
                <Text style={styles.modalHeaderSubtitle}>
                  {boats.find((b) => b.id === activeBoatForCalendar)?.name || ""} · {selectedDate?.day}{" "}
                  {selectedDate
                    ? new Date(
                        selectedDate.year,
                        selectedDate.month,
                        selectedDate.day,
                      ).toLocaleString("en-US", { month: "short" })
                    : ""}{" "}
                  {selectedDate?.year} · {activeAddBookingType === "day" ? "Day Cruise" : activeAddBookingType === "overnight" ? "Overnight stay" : "Night stay"}
                </Text>
              </View>

              {/* Guest Name */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Guest Name</Text>
                <TextInput
                  value={bookingGuestName}
                  onChangeText={setBookingGuestName}
                  placeholder="e.g. John Doe"
                  placeholderTextColor="#9aafbf"
                  style={styles.formInput}
                  testID="form-guest-name"
                />
              </View>

              {/* Number of Guests */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Number of Guests</Text>
                <TextInput
                  value={bookingGuestCount}
                  onChangeText={setBookingGuestCount}
                  placeholder="e.g. 4"
                  placeholderTextColor="#9aafbf"
                  keyboardType="numeric"
                  style={styles.formInput}
                  testID="form-guest-count"
                />
              </View>

              {/* Base Price Rate */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Base Price Rate (₹)</Text>
                <TextInput
                  value={bookingBasePrice}
                  onChangeText={(v) => setBookingBasePrice(formatInputWithCommas(v))}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9aafbf"
                  style={styles.formInput}
                  testID="form-base-price"
                />
              </View>

              {/* Extra 1 Rate & Quantity */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>
                  {activeAddBookingType === "overnight" ? "Extra Bed Price Rate (₹) & Quantity" : "Extra Guest Price Rate (₹) & Quantity"}
                </Text>
                <View style={styles.formRowWithCounter}>
                  <TextInput
                    value={bookingExtra1}
                    onChangeText={(v) => {
                      setBookingExtra1(formatInputWithCommas(v));
                      if (v && (parseInt(bookingExtra1Qty, 10) || 0) === 0) {
                        setBookingExtra1Qty("1");
                      }
                    }}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9aafbf"
                    style={[styles.formInput, { flex: 1, marginRight: 8 }]}
                    testID="form-extra-1"
                  />
                  <View style={styles.counterContainer}>
                    <Pressable
                      onPress={() => {
                        const cur = parseInt(bookingExtra1Qty, 10) || 0;
                        if (cur > 0) setBookingExtra1Qty(String(cur - 1));
                      }}
                      style={styles.counterButton}
                      testID="form-extra-1-dec"
                    >
                      <Text style={styles.counterButtonText}>-</Text>
                    </Pressable>
                    <TextInput
                      value={bookingExtra1Qty}
                      onChangeText={(v) => {
                        const digits = v.replace(/[^0-9]/g, "");
                        setBookingExtra1Qty(digits || "0");
                      }}
                      keyboardType="numeric"
                      style={styles.counterValueInput}
                      testID="form-extra-1-qty"
                    />
                    <Pressable
                      onPress={() => {
                        const cur = parseInt(bookingExtra1Qty, 10) || 0;
                        setBookingExtra1Qty(String(cur + 1));
                      }}
                      style={styles.counterButton}
                      testID="form-extra-1-inc"
                    >
                      <Text style={styles.counterButtonText}>+</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Extra 2 Rate & Quantity */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>
                  {activeAddBookingType === "overnight" ? "Extra Cot Price Rate (₹) & Quantity" : "Extra Room Price Rate (₹) & Quantity"}
                </Text>
                <View style={styles.formRowWithCounter}>
                  <TextInput
                    value={bookingExtra2}
                    onChangeText={(v) => {
                      setBookingExtra2(formatInputWithCommas(v));
                      if (v && (parseInt(bookingExtra2Qty, 10) || 0) === 0) {
                        setBookingExtra2Qty("1");
                      }
                    }}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#9aafbf"
                    style={[styles.formInput, { flex: 1, marginRight: 8 }]}
                    testID="form-extra-2"
                  />
                  <View style={styles.counterContainer}>
                    <Pressable
                      onPress={() => {
                        const cur = parseInt(bookingExtra2Qty, 10) || 0;
                        if (cur > 0) setBookingExtra2Qty(String(cur - 1));
                      }}
                      style={styles.counterButton}
                      testID="form-extra-2-dec"
                    >
                      <Text style={styles.counterButtonText}>-</Text>
                    </Pressable>
                    <TextInput
                      value={bookingExtra2Qty}
                      onChangeText={(v) => {
                        const digits = v.replace(/[^0-9]/g, "");
                        setBookingExtra2Qty(digits || "0");
                      }}
                      keyboardType="numeric"
                      style={styles.counterValueInput}
                      testID="form-extra-2-qty"
                    />
                    <Pressable
                      onPress={() => {
                        const cur = parseInt(bookingExtra2Qty, 10) || 0;
                        setBookingExtra2Qty(String(cur + 1));
                      }}
                      style={styles.counterButton}
                      testID="form-extra-2-inc"
                    >
                      <Text style={styles.counterButtonText}>+</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Booked Amount / Total Agreed Price */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Actual Booked Amount / Sold Price (₹)</Text>
                <TextInput
                  value={bookingBookedAmount}
                  onChangeText={(v) => {
                    setBookingBookedAmount(formatInputWithCommas(v));
                    setIsBookedAmountManuallyEdited(true);
                  }}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9aafbf"
                  style={[styles.formInput, { borderColor: "#1a7f7f", borderWidth: 1.5, fontSize: 15, fontWeight: "700" }]}
                  testID="form-booked-amount"
                />
              </View>

              {/* Special Notes */}
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Special Notes / Requests</Text>
                <TextInput
                  value={bookingSpecialNotes}
                  onChangeText={setBookingSpecialNotes}
                  placeholder="e.g. Vegetarian meals, anniversary setup"
                  placeholderTextColor="#9aafbf"
                  multiline={true}
                  numberOfLines={3}
                  style={[styles.formInput, styles.formInputMultiline]}
                  testID="form-notes"
                />
              </View>

              {/* Actions */}
              <View style={styles.formActionsRow}>
                <Pressable
                  onPress={() => setIsBookingModalVisible(false)}
                  style={styles.formCancelButton}
                  testID="form-cancel-button"
                >
                  <Text style={styles.formCancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (activeAddBookingType) {
                      saveBooking(
                        activeAddBookingType,
                        bookingGuestName,
                        bookingGuestCount,
                        bookingSpecialNotes,
                        bookingBasePrice,
                        bookingExtra1,
                        bookingExtra2,
                        bookingBookedAmount,
                        bookingExtra1Qty,
                        bookingExtra2Qty,
                      );
                    }
                    setIsBookingModalVisible(false);
                  }}
                  style={styles.formConfirmButton}
                  testID="form-confirm-button"
                >
                  <Text style={styles.formConfirmButtonText}>
                    {activeAddBookingType === "day"
                      ? (selectedBooking.dayCruise ? "Save changes" : "Confirm Booking")
                      : activeAddBookingType === "overnight"
                        ? (selectedBooking.overnightCruise ? "Save changes" : "Confirm Booking")
                        : (selectedBooking.nightCruise ? "Save changes" : "Confirm Booking")}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}
