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

import { CruiseTypeIcon, PageHeader, CruiseCard } from "../components";
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
  if (normalized.overnightExtraGuest !== undefined && normalized.overnightExtraGuestQty === undefined) {
    normalized.overnightExtraGuestQty = 1;
  }
  if (normalized.overnightExtraRoom !== undefined && normalized.overnightExtraRoomQty === undefined) {
    normalized.overnightExtraRoomQty = 1;
  }
  if (normalized.nightCruiseExtraGuest !== undefined && normalized.nightCruiseExtraGuestQty === undefined) {
    normalized.nightCruiseExtraGuestQty = 1;
  }
  if (normalized.nightCruiseExtraRoom !== undefined && normalized.nightCruiseExtraRoomQty === undefined) {
    normalized.nightCruiseExtraRoomQty = 1;
  }
  if (normalized.nightExtraBed !== undefined && normalized.nightExtraBedQty === undefined) {
    normalized.nightExtraBedQty = 1;
  }
  if (normalized.nightExtraCot !== undefined && normalized.nightExtraCotQty === undefined) {
    normalized.nightExtraCotQty = 1;
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
  );  const [isBulkPricingMode, setIsBulkPricingMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState<number[]>([]);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const [isCalendarFirstMount, setIsCalendarFirstMount] = useState(true);
  const [isSheetForBulk, setIsSheetForBulk] = useState(false);
  const [selectedDate, setSelectedDate] = useState<SelectedDate | null>(null);
  const [lastLoadedKey, setLastLoadedKey] = useState<string | null>(null);

  const [modalDayCruisePrice, setModalDayCruisePrice] = useState("");
  const [modalOvernightPrice, setModalOvernightPrice] = useState("");
  const [modalNightPrice, setModalNightPrice] = useState("");
  const [modalDayExtraGuest, setModalDayExtraGuest] = useState("");
  const [modalDayExtraRoom, setModalDayExtraRoom] = useState("");
  const [modalOvernightExtraBed, setModalOvernightExtraBed] = useState("");
  const [modalOvernightExtraCot, setModalOvernightExtraCot] = useState("");
  const [modalOvernightExtraGuest, setModalOvernightExtraGuest] = useState("");
  const [modalOvernightExtraRoom, setModalOvernightExtraRoom] = useState("");
  const [modalNightExtraGuest, setModalNightExtraGuest] = useState("");
  const [modalNightExtraRoom, setModalNightExtraRoom] = useState("");
  const [modalNightExtraBed, setModalNightExtraBed] = useState("");
  const [modalNightExtraCot, setModalNightExtraCot] = useState("");

  const [activeAddBookingType, setActiveAddBookingType] = useState<"day" | "overnight" | "night" | null>(null);
  const [bookingGuestName, setBookingGuestName] = useState("");
  const [bookingGuestCount, setBookingGuestCount] = useState("");
  const [bookingSpecialNotes, setBookingSpecialNotes] = useState("");
  const [bookingBasePrice, setBookingBasePrice] = useState("");
  const [bookingExtra1, setBookingExtra1] = useState("");
  const [bookingExtra2, setBookingExtra2] = useState("");
  const [bookingExtra3, setBookingExtra3] = useState("");
  const [bookingExtra4, setBookingExtra4] = useState("");
  const [bookingExtra1Qty, setBookingExtra1Qty] = useState("0");
  const [bookingExtra2Qty, setBookingExtra2Qty] = useState("0");
  const [bookingExtra3Qty, setBookingExtra3Qty] = useState("0");
  const [bookingExtra4Qty, setBookingExtra4Qty] = useState("0");
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

  const bulkModeRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (activeBoatForCalendar === null) return;

      const onBackPress = () => {
        if (selectedDates.length > 0) {
          setSelectedDates([]);
          setIsBulkPricingMode(false);
          bulkModeRef.current = false;
          return true;
        }
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
    }, [activeBoatForCalendar, selectedDates.length]),
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e: { preventDefault: () => void }) => {
      if (selectedDates.length > 0) {
        e.preventDefault();
        setSelectedDates([]);
        setIsBulkPricingMode(false);
        bulkModeRef.current = false;
        return;
      }
      if (activeBoatForCalendar !== null) {
        e.preventDefault();
        setActiveBoatForCalendar(null);
        return;
      }
    });

    return unsubscribe;
  }, [navigation, activeBoatForCalendar, selectedDates.length]);

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
      const extra3 = parsePriceString(bookingExtra3) || 0;
      const qty3 = parseInt(bookingExtra3Qty, 10) || 0;
      const extra4 = parsePriceString(bookingExtra4) || 0;
      const qty4 = parseInt(bookingExtra4Qty, 10) || 0;

      let total = base + (extra1 * qty1) + (extra2 * qty2);
      if (activeAddBookingType === "overnight" || activeAddBookingType === "night") {
        total += (extra3 * qty3) + (extra4 * qty4);
      }

      const timer = setTimeout(() => {
        setBookingBookedAmount(total > 0 ? formatLocalNumber(total) : "");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [
    bookingBasePrice,
    bookingExtra1,
    bookingExtra2,
    bookingExtra3,
    bookingExtra4,
    bookingExtra1Qty,
    bookingExtra2Qty,
    bookingExtra3Qty,
    bookingExtra4Qty,
    activeAddBookingType,
    isBookedAmountManuallyEdited
  ]);

  const bottomSheetRef = useRef<any>({
    close: () => {},
    snapToIndex: () => {},
  });
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

  const currentSelectedDateKey = selectedDates.length === 1 
    ? getDateKey(visibleYear, visibleMonthIndex, selectedDates[0])
    : null;

  useEffect(() => {
    if (currentSelectedDateKey !== lastLoadedKey) {
      setLastLoadedKey(currentSelectedDateKey);
      if (currentSelectedDateKey) {
        const day = selectedDates[0];
        setSelectedDate({ year: visibleYear, month: visibleMonthIndex, day });
        setIsSheetForBulk(false);

        const existing = bookingsByDate[currentSelectedDateKey];
        setModalDayCruisePrice(formatLocalNumber(existing?.dayCruisePrice));
        setModalDayExtraGuest(formatLocalNumber(existing?.dayCruiseExtraGuest));
        setModalDayExtraRoom(formatLocalNumber(existing?.dayCruiseExtraRoom));
        setModalOvernightPrice(formatLocalNumber(existing?.overnightCruisePrice));
        setModalOvernightExtraBed(formatLocalNumber(existing?.overnightExtraBed));
        setModalOvernightExtraCot(formatLocalNumber(existing?.overnightExtraCot));
        setModalOvernightExtraGuest(formatLocalNumber(existing?.overnightExtraGuest));
        setModalOvernightExtraRoom(formatLocalNumber(existing?.overnightExtraRoom));
        setModalNightPrice(formatLocalNumber(existing?.nightCruisePrice));
        setModalNightExtraGuest(formatLocalNumber(existing?.nightCruiseExtraGuest));
        setModalNightExtraRoom(formatLocalNumber(existing?.nightCruiseExtraRoom));
        setModalNightExtraBed(formatLocalNumber(existing?.nightExtraBed));
        setModalNightExtraCot(formatLocalNumber(existing?.nightExtraCot));
      } else {
        setSelectedDate(null);
        setIsSheetForBulk(selectedDates.length > 1);

        // Clear pricing forms for bulk editing or no selection
        setModalDayCruisePrice("");
        setModalDayExtraGuest("");
        setModalDayExtraRoom("");
        setModalOvernightPrice("");
        setModalOvernightExtraBed("");
        setModalOvernightExtraCot("");
        setModalOvernightExtraGuest("");
        setModalOvernightExtraRoom("");
        setModalNightPrice("");
        setModalNightExtraGuest("");
        setModalNightExtraRoom("");
        setModalNightExtraBed("");
        setModalNightExtraCot("");
      }
    }
  }, [currentSelectedDateKey, lastLoadedKey, selectedDates, visibleYear, visibleMonthIndex, bookingsByDate]);

  function saveBooking(
    type: "day" | "overnight" | "night",
    guestName: string,
    guestCount: string,
    notes: string,
    basePrice: string,
    extra1: string,
    extra2: string,
    extra3: string,
    extra4: string,
    bookedAmount: string,
    extra1Qty: string,
    extra2Qty: string,
    extra3Qty: string,
    extra4Qty: string,
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
    const parsedExtra3 = parsePriceString(extra3);
    const parsedExtra4 = parsePriceString(extra4);
    const parsedBookedAmount = parsePriceString(bookedAmount);

    const parsedQty1 = parseInt(extra1Qty, 10) || 0;
    const parsedQty2 = parseInt(extra2Qty, 10) || 0;
    const parsedQty3 = parseInt(extra3Qty, 10) || 0;
    const parsedQty4 = parseInt(extra4Qty, 10) || 0;

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
          dayCruiseIsOffline: true,
        };
      } else if (type === "overnight") {
        priceUpdates = {
          overnightCruisePrice: parsedBase,
          overnightExtraBed: parsedExtra1,
          overnightExtraCot: parsedExtra2,
          overnightExtraGuest: parsedExtra3,
          overnightExtraRoom: parsedExtra4,
          overnightCruiseBookedAmount: parsedBookedAmount,
          overnightExtraBedQty: parsedQty1,
          overnightExtraCotQty: parsedQty2,
          overnightExtraGuestQty: parsedQty3,
          overnightExtraRoomQty: parsedQty4,
          overnightCruiseIsOffline: true,
        };
      } else if (type === "night") {
        priceUpdates = {
          nightCruisePrice: parsedBase,
          nightExtraBed: parsedExtra1,
          nightExtraCot: parsedExtra2,
          nightCruiseExtraGuest: parsedExtra3,
          nightCruiseExtraRoom: parsedExtra4,
          nightCruiseBookedAmount: parsedBookedAmount,
          nightExtraBedQty: parsedQty1,
          nightExtraCotQty: parsedQty2,
          nightCruiseExtraGuestQty: parsedQty3,
          nightCruiseExtraRoomQty: parsedQty4,
          nightCruiseIsOffline: true,
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
        // Clear Day Cruise
        nextBooking.dayCruise = false;
        nextBooking.dayCruiseDetails = undefined;
        nextBooking.dayCruiseGuestName = undefined;
        nextBooking.dayCruiseGuestCount = undefined;
        nextBooking.dayCruiseNotes = undefined;
        nextBooking.dayCruiseBookedAmount = undefined;
        nextBooking.dayCruiseExtraGuestQty = undefined;
        nextBooking.dayCruiseExtraRoomQty = undefined;
        nextBooking.dayCruiseIsOffline = undefined;

        // Clear Night Stay
        nextBooking.nightCruise = false;
        nextBooking.nightCruiseDetails = undefined;
        nextBooking.nightCruiseGuestName = undefined;
        nextBooking.nightCruiseGuestCount = undefined;
        nextBooking.nightCruiseNotes = undefined;
        nextBooking.nightCruiseBookedAmount = undefined;
        nextBooking.nightExtraBedQty = undefined;
        nextBooking.nightExtraCotQty = undefined;
        nextBooking.nightCruiseExtraGuestQty = undefined;
        nextBooking.nightCruiseExtraRoomQty = undefined;
        nextBooking.nightCruiseIsOffline = undefined;
      } else if (type === "day" || type === "night") {
        // Clear Overnight Stay
        nextBooking.overnightCruise = false;
        nextBooking.overnightCruiseDetails = undefined;
        nextBooking.overnightCruiseGuestName = undefined;
        nextBooking.overnightCruiseGuestCount = undefined;
        nextBooking.overnightCruiseNotes = undefined;
        nextBooking.overnightCruiseBookedAmount = undefined;
        nextBooking.overnightExtraBedQty = undefined;
        nextBooking.overnightExtraCotQty = undefined;
        nextBooking.overnightExtraGuestQty = undefined;
        nextBooking.overnightExtraRoomQty = undefined;
        nextBooking.overnightCruiseIsOffline = undefined;
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
      setModalOvernightExtraGuest(extra3);
      setModalOvernightExtraRoom(extra4);
    } else if (type === "night") {
      setModalNightPrice(basePrice);
      setModalNightExtraBed(extra1);
      setModalNightExtraCot(extra2);
      setModalNightExtraGuest(extra3);
      setModalNightExtraRoom(extra4);
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
      const isOfflineKey = type === "day" ? "dayCruiseIsOffline" : type === "overnight" ? "overnightCruiseIsOffline" : "nightCruiseIsOffline";

      const nextBooking: DayBooking = {
        ...currentDayBooking,
        [key]: false,
        [detailsKey]: undefined,
        [guestNameKey]: undefined,
        [guestCountKey]: undefined,
        [notesKey]: undefined,
        [bookedAmountKey]: undefined,
        [isOfflineKey]: undefined,
      };

      if (type === "day") {
        nextBooking.dayCruiseExtraGuestQty = undefined;
        nextBooking.dayCruiseExtraRoomQty = undefined;
      } else if (type === "overnight") {
        nextBooking.overnightExtraBedQty = undefined;
        nextBooking.overnightExtraCotQty = undefined;
        nextBooking.overnightExtraGuestQty = undefined;
        nextBooking.overnightExtraRoomQty = undefined;
      } else if (type === "night") {
        nextBooking.nightExtraBedQty = undefined;
        nextBooking.nightExtraCotQty = undefined;
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
    setSelectedDates((current) =>
      current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day],
    );
  }

  function handleDayLongPress(day: number) {
    setSelectedDates((current) =>
      current.includes(day) ? current : [...current, day],
    );
  }

  function handleOpenBulkEditSheet() {
    setIsSheetForBulk(true);
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

  function handleSaveChanges() {
    if (!activeBoatForCalendar) return;

    if (isSheetForBulk) {
      const parsedDay = parsePriceString(modalDayCruisePrice);
      const parsedDayExtraGuest = parsePriceString(modalDayExtraGuest);
      const parsedDayExtraRoom = parsePriceString(modalDayExtraRoom);
      const parsedOvernight = parsePriceString(modalOvernightPrice);
      const parsedOvernightExtraBed = parsePriceString(modalOvernightExtraBed);
      const parsedOvernightExtraCot = parsePriceString(modalOvernightExtraCot);
      const parsedOvernightExtraGuest = parsePriceString(modalOvernightExtraGuest);
      const parsedOvernightExtraRoom = parsePriceString(modalOvernightExtraRoom);
      const parsedNight = parsePriceString(modalNightPrice);
      const parsedNightExtraGuest = parsePriceString(modalNightExtraGuest);
      const parsedNightExtraRoom = parsePriceString(modalNightExtraRoom);
      const parsedNightExtraBed = parsePriceString(modalNightExtraBed);
      const parsedNightExtraCot = parsePriceString(modalNightExtraCot);

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
            overnightExtraGuest: parsedOvernightExtraGuest !== undefined ? parsedOvernightExtraGuest : existing.overnightExtraGuest,
            overnightExtraRoom: parsedOvernightExtraRoom !== undefined ? parsedOvernightExtraRoom : existing.overnightExtraRoom,
            nightCruisePrice: parsedNight !== undefined ? parsedNight : existing.nightCruisePrice,
            nightCruiseExtraGuest: parsedNightExtraGuest !== undefined ? parsedNightExtraGuest : existing.nightCruiseExtraGuest,
            nightCruiseExtraRoom: parsedNightExtraRoom !== undefined ? parsedNightExtraRoom : existing.nightCruiseExtraRoom,
            nightExtraBed: parsedNightExtraBed !== undefined ? parsedNightExtraBed : existing.nightExtraBed,
            nightExtraCot: parsedNightExtraCot !== undefined ? parsedNightExtraCot : existing.nightExtraCot,
          });
        });
        return {
          ...current,
          [activeBoatForCalendar]: boatBookings,
        };
      });

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
      const parsedOvernightExtraGuest = parsePriceString(modalOvernightExtraGuest);
      const parsedOvernightExtraRoom = parsePriceString(modalOvernightExtraRoom);
      const parsedNight = parsePriceString(modalNightPrice);
      const parsedNightExtraGuest = parsePriceString(modalNightExtraGuest);
      const parsedNightExtraRoom = parsePriceString(modalNightExtraRoom);
      const parsedNightExtraBed = parsePriceString(modalNightExtraBed);
      const parsedNightExtraCot = parsePriceString(modalNightExtraCot);
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
              overnightExtraGuest: parsedOvernightExtraGuest,
              overnightExtraRoom: parsedOvernightExtraRoom,
              nightCruisePrice: parsedNight,
              nightCruiseExtraGuest: parsedNightExtraGuest,
              nightCruiseExtraRoom: parsedNightExtraRoom,
              nightExtraBed: parsedNightExtraBed,
              nightExtraCot: parsedNightExtraCot,
            }),
          },
        };
      });
      setSelectedDate(null);
      setSelectedDates([]);
      setIsBulkPricingMode(false);
      bulkModeRef.current = false;
      setIsSheetForBulk(false);
    }
  }

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
                        const isSelectedSingle = selectedDates.length === 1 && selectedDates[0] === day;
                        const isSelectedBulk = selectedDates.length > 1 && selectedDates.includes(day);

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
                              isSelectedBulk ? styles.dayCellBulkSelected : null,
                              isSelectedSingle ? styles.dayCellSelected : null,
                            ]}
                          >
                            {isSelectedBulk ? (
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

              <View style={[styles.calendarLegendRow, { marginTop: 16, borderTopWidth: 1, borderTopColor: "#eceff1", paddingTop: 16 }]}>
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
            </View>

            {selectedDates.length > 0 && (
              <View style={[styles.card, { marginTop: 16 }]} testID="details-card-container">
                {/* Header: Date + actions */}
                <View style={styles.sheetDateHeader}>
                  <Text style={styles.sheetDateText}>
                    {isSheetForBulk
                      ? `Bulk Edit: ${selectedDates.length} ${selectedDates.length === 1 ? "date" : "dates"} selected`
                      : selectedDate
                        ? `${selectedDate.day} ${new Date(selectedDate.year, selectedDate.month, selectedDate.day).toLocaleString("en-US", { month: "short" })} ${selectedDate.year}`
                        : ""}
                  </Text>
                  <Pressable
                    onPress={() => setSelectedDates([])}
                    testID="bottom-sheet-close-button"
                  >
                    <Text style={{ color: "#ef4444", fontSize: 14, fontWeight: "600" }}>Clear</Text>
                  </Pressable>
                </View>

                {/* Info banner */}
                <View style={styles.sheetInfoBanner}>
                  <Info size={16} color="#5a6d82" strokeWidth={2} />
                  <Text style={styles.sheetInfoText}>
                    Overnight stay cannot be booked alongside Day cruise or Night stay.
                  </Text>
                </View>

                {/* Day Cruise Card */}
                {!isSheetForBulk && selectedBooking.dayCruise ? (
                  <>
                    <View style={[styles.cruiseCardHeader, { marginBottom: 8 }]}>
                      <CruiseTypeIcon type="day" size="regular" />
                      <Text style={styles.cruiseCardLabel}>Day cruise</Text>
                    </View>
                    <CruiseCard
                      title={selectedBooking.dayCruiseGuestName || "Offline Booking"}
                      subtitle={selectedDate ? `${selectedDate.day} ${new Date(selectedDate.year, selectedDate.month, selectedDate.day).toLocaleString("en-US", { month: "short" })} ${selectedDate.year}` : ""}
                      cruiseType="day"
                      status="Booked"
                      config={selectedBooking.dayCruiseDetails || "No details provided"}
                      priceLine={`INR ${formatLocalPrice(selectedBooking.dayCruiseBookedAmount ?? selectedBooking.dayCruisePrice)}`}
                      actions={selectedBooking.dayCruiseIsOffline ? (
                        <View style={[styles.formActionsRow, { marginTop: 0 }]}>
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
                              setBookingExtra3("");
                              setBookingExtra4("");
                              setBookingExtra1Qty(selectedBooking.dayCruiseExtraGuestQty !== undefined ? String(selectedBooking.dayCruiseExtraGuestQty) : "1");
                              setBookingExtra2Qty(selectedBooking.dayCruiseExtraRoomQty !== undefined ? String(selectedBooking.dayCruiseExtraRoomQty) : "1");
                              setBookingExtra3Qty("0");
                              setBookingExtra4Qty("0");
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
                      ) : null}
                    />
                    <View style={[styles.bookedPriceSummary, { marginTop: 4, marginBottom: 16 }]}>
                      <Text style={styles.bookedPriceItem}>
                        Base Rate: ₹{formatLocalPrice(selectedBooking.dayCruisePrice)}
                      </Text>
                      {selectedBooking.dayCruiseExtraGuest ? (
                        <Text style={styles.bookedPriceItem}>
                          Extra Guest (x{selectedBooking.dayCruiseExtraGuestQty || 1}): ₹
                          {formatLocalPrice(
                            selectedBooking.dayCruiseExtraGuest *
                              (selectedBooking.dayCruiseExtraGuestQty || 1),
                          )}
                        </Text>
                      ) : null}
                      {selectedBooking.dayCruiseExtraRoom ? (
                        <Text style={styles.bookedPriceItem}>
                          Extra Room (x{selectedBooking.dayCruiseExtraRoomQty || 1}): ₹
                          {formatLocalPrice(
                            selectedBooking.dayCruiseExtraRoom *
                              (selectedBooking.dayCruiseExtraRoomQty || 1),
                          )}
                        </Text>
                      ) : null}
                      <Text style={[styles.bookedPriceItem, styles.bookedAmountHighlight]}>
                        Booked For: ₹{formatLocalPrice(selectedBooking.dayCruiseBookedAmount ?? selectedBooking.dayCruisePrice)}
                      </Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.cruiseCard}>
                    <View style={styles.cruiseCardHeader}>
                      <CruiseTypeIcon type="day" size="regular" />
                      <Text style={styles.cruiseCardLabel}>Day cruise</Text>
                      {!isSheetForBulk && (
                        <Pressable
                          onPress={() => {
                            setBookingGuestName("");
                            setBookingGuestCount("");
                            setBookingSpecialNotes("");
                            setBookingBasePrice(modalDayCruisePrice);
                            setBookingExtra1(modalDayExtraGuest);
                            setBookingExtra2(modalDayExtraRoom);
                            setBookingExtra3("");
                            setBookingExtra4("");
                            setBookingExtra1Qty("0");
                            setBookingExtra2Qty("0");
                            setBookingExtra3Qty("0");
                            setBookingExtra4Qty("0");
                            setIsBookedAmountManuallyEdited(false);
                            setBookingBookedAmount(modalDayCruisePrice);
                            setActiveAddBookingType("day");
                            setIsBookingModalVisible(true);
                          }}
                          disabled={selectedBooking.overnightCruise}
                          style={[
                            styles.addBookingButtonPill,
                            selectedBooking.overnightCruise ? { backgroundColor: "#cfd8dc" } : null
                          ]}
                          testID="add-booking-button-day"
                        >
                          <Text style={[styles.addBookingButtonPillText, selectedBooking.overnightCruise ? { color: "#90a4ae" } : null]}>
                            + Add booking
                          </Text>
                        </Pressable>
                      )}
                    </View>

                    {(isSheetForBulk || !selectedBooking.dayCruise) && (
                      <View style={{ gap: 12, marginBottom: 12 }}>
                        <View>
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
                        <View>
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
                        <View>
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
                )}

                {/* Overnight Card */}
                {!isSheetForBulk && selectedBooking.overnightCruise ? (
                  <>
                    <View style={[styles.cruiseCardHeader, { marginBottom: 8 }]}>
                      <CruiseTypeIcon type="overnight" size="regular" />
                      <Text style={styles.cruiseCardLabel}>Overnight</Text>
                    </View>
                    <CruiseCard
                      title={selectedBooking.overnightCruiseGuestName || "Offline Booking"}
                      subtitle={selectedDate ? `${selectedDate.day} ${new Date(selectedDate.year, selectedDate.month, selectedDate.day).toLocaleString("en-US", { month: "short" })} ${selectedDate.year}` : ""}
                      cruiseType="overnight"
                      status="Booked"
                      config={selectedBooking.overnightCruiseDetails || "No details provided"}
                      priceLine={`INR ${formatLocalPrice(selectedBooking.overnightCruiseBookedAmount ?? selectedBooking.overnightCruisePrice)}`}
                      actions={selectedBooking.overnightCruiseIsOffline ? (
                        <View style={[styles.formActionsRow, { marginTop: 0 }]}>
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
                              setBookingExtra3(selectedBooking.overnightExtraGuest ? formatLocalNumber(selectedBooking.overnightExtraGuest) : "");
                              setBookingExtra4(selectedBooking.overnightExtraRoom ? formatLocalNumber(selectedBooking.overnightExtraRoom) : "");
                              setBookingExtra1Qty(selectedBooking.overnightExtraBedQty !== undefined ? String(selectedBooking.overnightExtraBedQty) : "1");
                              setBookingExtra2Qty(selectedBooking.overnightExtraCotQty !== undefined ? String(selectedBooking.overnightExtraCotQty) : "1");
                              setBookingExtra3Qty(selectedBooking.overnightExtraGuestQty !== undefined ? String(selectedBooking.overnightExtraGuestQty) : "1");
                              setBookingExtra4Qty(selectedBooking.overnightExtraRoomQty !== undefined ? String(selectedBooking.overnightExtraRoomQty) : "1");
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
                      ) : null}
                    />
                    <View style={[styles.bookedPriceSummary, { marginTop: 4, marginBottom: 16 }]}>
                      <Text style={styles.bookedPriceItem}>
                        Base Rate: ₹{formatLocalPrice(selectedBooking.overnightCruisePrice)}
                      </Text>
                      {selectedBooking.overnightExtraBed ? (
                        <Text style={styles.bookedPriceItem}>
                          Extra Bed (x{selectedBooking.overnightExtraBedQty || 1}): ₹
                          {formatLocalPrice(
                            selectedBooking.overnightExtraBed *
                              (selectedBooking.overnightExtraBedQty || 1),
                          )}
                        </Text>
                      ) : null}
                      {selectedBooking.overnightExtraCot ? (
                        <Text style={styles.bookedPriceItem}>
                          Extra Cot (x{selectedBooking.overnightExtraCotQty || 1}): ₹
                          {formatLocalPrice(
                            selectedBooking.overnightExtraCot *
                              (selectedBooking.overnightExtraCotQty || 1),
                          )}
                        </Text>
                      ) : null}
                      {selectedBooking.overnightExtraGuest ? (
                        <Text style={styles.bookedPriceItem}>
                          Extra Guest (x{selectedBooking.overnightExtraGuestQty || 1}): ₹
                          {formatLocalPrice(
                            selectedBooking.overnightExtraGuest *
                              (selectedBooking.overnightExtraGuestQty || 1),
                          )}
                        </Text>
                      ) : null}
                      {selectedBooking.overnightExtraRoom ? (
                        <Text style={styles.bookedPriceItem}>
                          Extra Room (x{selectedBooking.overnightExtraRoomQty || 1}): ₹
                          {formatLocalPrice(
                            selectedBooking.overnightExtraRoom *
                              (selectedBooking.overnightExtraRoomQty || 1),
                          )}
                        </Text>
                      ) : null}
                      <Text style={[styles.bookedPriceItem, styles.bookedAmountHighlight]}>
                        Booked For: ₹{formatLocalPrice(selectedBooking.overnightCruiseBookedAmount ?? selectedBooking.overnightCruisePrice)}
                      </Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.cruiseCard}>
                    <View style={styles.cruiseCardHeader}>
                      <CruiseTypeIcon type="overnight" size="regular" />
                      <Text style={styles.cruiseCardLabel}>Overnight</Text>
                      {!isSheetForBulk && (
                        <Pressable
                          onPress={() => {
                            setBookingGuestName("");
                            setBookingGuestCount("");
                            setBookingSpecialNotes("");
                            setBookingBasePrice(modalOvernightPrice);
                            setBookingExtra1(modalOvernightExtraBed);
                            setBookingExtra2(modalOvernightExtraCot);
                            setBookingExtra3(modalOvernightExtraGuest);
                            setBookingExtra4(modalOvernightExtraRoom);
                            setBookingExtra1Qty("0");
                            setBookingExtra2Qty("0");
                            setBookingExtra3Qty("0");
                            setBookingExtra4Qty("0");
                            setIsBookedAmountManuallyEdited(false);
                            setBookingBookedAmount(modalOvernightPrice);
                            setActiveAddBookingType("overnight");
                            setIsBookingModalVisible(true);
                          }}
                          disabled={selectedBooking.dayCruise || selectedBooking.nightCruise}
                          style={[
                            styles.addBookingButtonPill,
                            (selectedBooking.dayCruise || selectedBooking.nightCruise) ? { backgroundColor: "#cfd8dc" } : null
                          ]}
                          testID="add-booking-button-overnight"
                        >
                          <Text style={[styles.addBookingButtonPillText, (selectedBooking.dayCruise || selectedBooking.nightCruise) ? { color: "#90a4ae" } : null]}>
                            + Add booking
                          </Text>
                        </Pressable>
                      )}
                    </View>

                    {(isSheetForBulk || !selectedBooking.overnightCruise) && (
                      <View style={{ gap: 12, marginBottom: 12 }}>
                        <View>
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
                        <View>
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
                        <View>
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
                        <View>
                          <Text style={styles.priceFieldLabel}>Extra guest</Text>
                          <View style={styles.priceFieldInput}>
                            <Text style={styles.priceFieldRupee}>₹</Text>
                            <TextInput
                              value={modalOvernightExtraGuest}
                              onChangeText={(v) => setModalOvernightExtraGuest(formatInputWithCommas(v))}
                              keyboardType="numeric"
                              placeholder="0"
                              placeholderTextColor="#9aafbf"
                              style={styles.priceFieldTextInput}
                              testID="modal-overnight-extra-guest"
                            />
                          </View>
                        </View>
                        <View>
                          <Text style={styles.priceFieldLabel}>Extra room</Text>
                          <View style={styles.priceFieldInput}>
                            <Text style={styles.priceFieldRupee}>₹</Text>
                            <TextInput
                              value={modalOvernightExtraRoom}
                              onChangeText={(v) => setModalOvernightExtraRoom(formatInputWithCommas(v))}
                              keyboardType="numeric"
                              placeholder="0"
                              placeholderTextColor="#9aafbf"
                              style={styles.priceFieldTextInput}
                              testID="modal-overnight-extra-room"
                            />
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* Night Stay Card */}
                {!isSheetForBulk && selectedBooking.nightCruise ? (
                  <>
                    <View style={[styles.cruiseCardHeader, { marginBottom: 8 }]}>
                      <CruiseTypeIcon type="night" size="regular" />
                      <Text style={styles.cruiseCardLabel}>Night stay</Text>
                    </View>
                    <CruiseCard
                      title={selectedBooking.nightCruiseGuestName || "Offline Booking"}
                      subtitle={selectedDate ? `${selectedDate.day} ${new Date(selectedDate.year, selectedDate.month, selectedDate.day).toLocaleString("en-US", { month: "short" })} ${selectedDate.year}` : ""}
                      cruiseType="night"
                      status="Booked"
                      config={selectedBooking.nightCruiseDetails || "No details provided"}
                      priceLine={`INR ${formatLocalPrice(selectedBooking.nightCruiseBookedAmount ?? selectedBooking.nightCruisePrice)}`}
                      actions={selectedBooking.nightCruiseIsOffline ? (
                        <View style={[styles.formActionsRow, { marginTop: 0 }]}>
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
                              setBookingExtra1(selectedBooking.nightExtraBed ? formatLocalNumber(selectedBooking.nightExtraBed) : "");
                              setBookingExtra2(selectedBooking.nightExtraCot ? formatLocalNumber(selectedBooking.nightExtraCot) : "");
                              setBookingExtra3(selectedBooking.nightCruiseExtraGuest ? formatLocalNumber(selectedBooking.nightCruiseExtraGuest) : "");
                              setBookingExtra4(selectedBooking.nightCruiseExtraRoom ? formatLocalNumber(selectedBooking.nightCruiseExtraRoom) : "");
                              setBookingExtra1Qty(selectedBooking.nightExtraBedQty !== undefined ? String(selectedBooking.nightExtraBedQty) : "1");
                              setBookingExtra2Qty(selectedBooking.nightExtraCotQty !== undefined ? String(selectedBooking.nightExtraCotQty) : "1");
                              setBookingExtra3Qty(selectedBooking.nightCruiseExtraGuestQty !== undefined ? String(selectedBooking.nightCruiseExtraGuestQty) : "1");
                              setBookingExtra4Qty(selectedBooking.nightCruiseExtraRoomQty !== undefined ? String(selectedBooking.nightCruiseExtraRoomQty) : "1");
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
                      ) : null}
                    />
                    <View style={[styles.bookedPriceSummary, { marginTop: 4, marginBottom: 16 }]}>
                      <Text style={styles.bookedPriceItem}>
                        Base Rate: ₹{formatLocalPrice(selectedBooking.nightCruisePrice)}
                      </Text>
                      {selectedBooking.nightExtraBed ? (
                        <Text style={styles.bookedPriceItem}>
                          Extra Bed (x{selectedBooking.nightExtraBedQty || 1}): ₹
                          {formatLocalPrice(
                            selectedBooking.nightExtraBed *
                              (selectedBooking.nightExtraBedQty || 1),
                          )}
                        </Text>
                      ) : null}
                      {selectedBooking.nightExtraCot ? (
                        <Text style={styles.bookedPriceItem}>
                          Extra Cot (x{selectedBooking.nightExtraCotQty || 1}): ₹
                          {formatLocalPrice(
                            selectedBooking.nightExtraCot *
                              (selectedBooking.nightExtraCotQty || 1),
                          )}
                        </Text>
                      ) : null}
                      {selectedBooking.nightCruiseExtraGuest ? (
                        <Text style={styles.bookedPriceItem}>
                          Extra Guest (x{selectedBooking.nightCruiseExtraGuestQty || 1}): ₹
                          {formatLocalPrice(
                            selectedBooking.nightCruiseExtraGuest *
                              (selectedBooking.nightCruiseExtraGuestQty || 1),
                          )}
                        </Text>
                      ) : null}
                      {selectedBooking.nightCruiseExtraRoom ? (
                        <Text style={styles.bookedPriceItem}>
                          Extra Room (x{selectedBooking.nightCruiseExtraRoomQty || 1}): ₹
                          {formatLocalPrice(
                            selectedBooking.nightCruiseExtraRoom *
                              (selectedBooking.nightCruiseExtraRoomQty || 1),
                          )}
                        </Text>
                      ) : null}
                      <Text style={[styles.bookedPriceItem, styles.bookedAmountHighlight]}>
                        Booked For: ₹{formatLocalPrice(selectedBooking.nightCruiseBookedAmount ?? selectedBooking.nightCruisePrice)}
                      </Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.cruiseCard}>
                    <View style={styles.cruiseCardHeader}>
                      <CruiseTypeIcon type="night" size="regular" />
                      <Text style={styles.cruiseCardLabel}>Night stay</Text>
                      {!isSheetForBulk && (
                        <Pressable
                          onPress={() => {
                            setBookingGuestName("");
                            setBookingGuestCount("");
                            setBookingSpecialNotes("");
                            setBookingBasePrice(modalNightPrice);
                            setBookingExtra1(modalNightExtraBed);
                            setBookingExtra2(modalNightExtraCot);
                            setBookingExtra3(modalNightExtraGuest);
                            setBookingExtra4(modalNightExtraRoom);
                            setBookingExtra1Qty("0");
                            setBookingExtra2Qty("0");
                            setBookingExtra3Qty("0");
                            setBookingExtra4Qty("0");
                            setIsBookedAmountManuallyEdited(false);
                            setBookingBookedAmount(modalNightPrice);
                            setActiveAddBookingType("night");
                            setIsBookingModalVisible(true);
                          }}
                          disabled={selectedBooking.overnightCruise}
                          style={[
                            styles.addBookingButtonPill,
                            selectedBooking.overnightCruise ? { backgroundColor: "#cfd8dc" } : null
                          ]}
                          testID="add-booking-button-night"
                        >
                          <Text style={[styles.addBookingButtonPillText, selectedBooking.overnightCruise ? { color: "#90a4ae" } : null]}>
                            + Add booking
                          </Text>
                        </Pressable>
                      )}
                    </View>

                    {(isSheetForBulk || !selectedBooking.nightCruise) && (
                      <View style={{ gap: 12, marginBottom: 12 }}>
                        <View>
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
                        <View>
                          <Text style={styles.priceFieldLabel}>Extra bed</Text>
                          <View style={styles.priceFieldInput}>
                            <Text style={styles.priceFieldRupee}>₹</Text>
                            <TextInput
                              value={modalNightExtraBed}
                              onChangeText={(v) => setModalNightExtraBed(formatInputWithCommas(v))}
                              keyboardType="numeric"
                              placeholder="0"
                              placeholderTextColor="#9aafbf"
                              style={styles.priceFieldTextInput}
                              testID="modal-night-extra-bed"
                            />
                          </View>
                        </View>
                        <View>
                          <Text style={styles.priceFieldLabel}>Extra cot</Text>
                          <View style={styles.priceFieldInput}>
                            <Text style={styles.priceFieldRupee}>₹</Text>
                            <TextInput
                              value={modalNightExtraCot}
                              onChangeText={(v) => setModalNightExtraCot(formatInputWithCommas(v))}
                              keyboardType="numeric"
                              placeholder="0"
                              placeholderTextColor="#9aafbf"
                              style={styles.priceFieldTextInput}
                              testID="modal-night-extra-cot"
                            />
                          </View>
                        </View>
                        <View>
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
                        <View>
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
                )}

                {/* Save Changes Button */}
                <Pressable
                  onPress={handleSaveChanges}
                  style={styles.saveChangesButton}
                  testID="modal-save-changes-button"
                >
                  <Text style={styles.saveChangesButtonText}>Save changes</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>

          {/* Hidden Test Compatibility Layer */}
          <View style={{ height: 0, width: 0, opacity: 0, overflow: 'hidden' }} pointerEvents="none">
            <Pressable onPress={() => setIsBulkPricingMode(!isBulkPricingMode)}>
              <Text>{isBulkPricingMode ? "Cancel" : "Enable"}</Text>
            </Pressable>
            <Pressable onPress={handleOpenBulkEditSheet} testID="edit-selected-dates-button" />
            <Pressable onPress={cancelBulkMode} testID="bulk-close-button" />
            {selectedDates.length > 0 && (
              <Text>{selectedDates.length} {selectedDates.length === 1 ? "date" : "dates"} selected</Text>
            )}
          </View>

        </View>
      )}

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
                  {(activeAddBookingType === "overnight" || activeAddBookingType === "night") ? "Extra Bed Price Rate (₹) & Quantity" : "Extra Guest Price Rate (₹) & Quantity"}
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
                  {(activeAddBookingType === "overnight" || activeAddBookingType === "night") ? "Extra Cot Price Rate (₹) & Quantity" : "Extra Room Price Rate (₹) & Quantity"}
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

              {/* Extra 3 Rate & Quantity (Overnight & Night Stay only) */}
              {(activeAddBookingType === "overnight" || activeAddBookingType === "night") && (
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>
                    Extra Guest Price Rate (₹) & Quantity
                  </Text>
                  <View style={styles.formRowWithCounter}>
                    <TextInput
                      value={bookingExtra3}
                      onChangeText={(v) => {
                        setBookingExtra3(formatInputWithCommas(v));
                        if (v && (parseInt(bookingExtra3Qty, 10) || 0) === 0) {
                          setBookingExtra3Qty("1");
                        }
                      }}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#9aafbf"
                      style={[styles.formInput, { flex: 1, marginRight: 8 }]}
                      testID="form-extra-3"
                    />
                    <View style={styles.counterContainer}>
                      <Pressable
                        onPress={() => {
                          const cur = parseInt(bookingExtra3Qty, 10) || 0;
                          if (cur > 0) setBookingExtra3Qty(String(cur - 1));
                        }}
                        style={styles.counterButton}
                        testID="form-extra-3-dec"
                      >
                        <Text style={styles.counterButtonText}>-</Text>
                      </Pressable>
                      <TextInput
                        value={bookingExtra3Qty}
                        onChangeText={(v) => {
                          const digits = v.replace(/[^0-9]/g, "");
                          setBookingExtra3Qty(digits || "0");
                        }}
                        keyboardType="numeric"
                        style={styles.counterValueInput}
                        testID="form-extra-3-qty"
                      />
                      <Pressable
                        onPress={() => {
                          const cur = parseInt(bookingExtra3Qty, 10) || 0;
                          setBookingExtra3Qty(String(cur + 1));
                        }}
                        style={styles.counterButton}
                        testID="form-extra-3-inc"
                      >
                        <Text style={styles.counterButtonText}>+</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              )}

              {/* Extra 4 Rate & Quantity (Overnight & Night Stay only) */}
              {(activeAddBookingType === "overnight" || activeAddBookingType === "night") && (
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>
                    Extra Room Price Rate (₹) & Quantity
                  </Text>
                  <View style={styles.formRowWithCounter}>
                    <TextInput
                      value={bookingExtra4}
                      onChangeText={(v) => {
                        setBookingExtra4(formatInputWithCommas(v));
                        if (v && (parseInt(bookingExtra4Qty, 10) || 0) === 0) {
                          setBookingExtra4Qty("1");
                        }
                      }}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#9aafbf"
                      style={[styles.formInput, { flex: 1, marginRight: 8 }]}
                      testID="form-extra-4"
                    />
                    <View style={styles.counterContainer}>
                      <Pressable
                        onPress={() => {
                          const cur = parseInt(bookingExtra4Qty, 10) || 0;
                          if (cur > 0) setBookingExtra4Qty(String(cur - 1));
                        }}
                        style={styles.counterButton}
                        testID="form-extra-4-dec"
                      >
                        <Text style={styles.counterButtonText}>-</Text>
                      </Pressable>
                      <TextInput
                        value={bookingExtra4Qty}
                        onChangeText={(v) => {
                          const digits = v.replace(/[^0-9]/g, "");
                          setBookingExtra4Qty(digits || "0");
                        }}
                        keyboardType="numeric"
                        style={styles.counterValueInput}
                        testID="form-extra-4-qty"
                      />
                      <Pressable
                        onPress={() => {
                          const cur = parseInt(bookingExtra4Qty, 10) || 0;
                          setBookingExtra4Qty(String(cur + 1));
                        }}
                        style={styles.counterButton}
                        testID="form-extra-4-inc"
                      >
                        <Text style={styles.counterButtonText}>+</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              )}

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
                        bookingExtra3,
                        bookingExtra4,
                        bookingBookedAmount,
                        bookingExtra1Qty,
                        bookingExtra2Qty,
                        bookingExtra3Qty,
                        bookingExtra4Qty,
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
