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
} from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Gesture, GestureDetector, GestureHandlerRootView, Directions } from "react-native-gesture-handler";
import {
  useFocusEffect,
  useRoute,
  useNavigation,
} from "@react-navigation/native";
import Animated, { FadeIn, FadeOut, Keyframe, runOnJS, SlideInRight, SlideInLeft } from "react-native-reanimated";
import { CruiseTypeIcon, PageHeader } from "../components";
import { useBoat } from "../context/BoatContext";
import styles from "../styles";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

type DayBooking = {
  dayCruise: boolean;
  overnightCruise: boolean;
  nightCruise: boolean;
  details: string;
  dayCruisePrice?: number;
  dayCruiseExtraGuest?: number;
  dayCruiseExtraRoom?: number;
  overnightCruisePrice?: number;
  overnightExtraBed?: number;
  overnightExtraCot?: number;
  nightCruisePrice?: number;
  nightCruiseExtraGuest?: number;
  nightCruiseExtraRoom?: number;
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

export default function AvailabilityScreen() {
  const { boats } = useBoat();
  const [activeBoatForCalendar, setActiveBoatForCalendar] = useState<
    string | null
  >(null);
  const [zoomOrigin, setZoomOrigin] = useState({
    x: screenWidth / 2,
    y: screenHeight / 2,
  });
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (route.params?.selectBoat) {
      const boat = route.params.selectBoat;
      navigation.setParams({ selectBoat: undefined });
      setZoomOrigin({ x: screenWidth / 2, y: screenHeight / 2 });
      setActiveBoatForCalendar(boat);
    }
  }, [route.params?.selectBoat]);

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
    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
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

  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();

  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(todayYear, todayMonth, 1),
  );
  const [isBulkPricingMode, setIsBulkPricingMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState<number[]>([]);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
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

  const bottomSheetRef = useRef<BottomSheet>(null);
  const sheetSnapPoints = useMemo(() => ["75%", "95%"], []);

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
    .onEnd(() => {
      runOnJS(moveMonth)(1);
    });

  const swipeRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      runOnJS(moveMonth)(-1);
    });

  const calendarSwipeGesture = Gesture.Simultaneous(swipeLeft, swipeRight);

  const currentMonthTitle = today.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const daysInCurrentMonth = new Date(todayYear, todayMonth + 1, 0).getDate();
  const firstDayWeekIndexCurrent = new Date(todayYear, todayMonth, 1).getDay();

  const miniCalendarDays = [
    ...Array.from(
      { length: firstDayWeekIndexCurrent },
      () => null as number | null,
    ),
    ...Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1),
  ];

  const miniCalendarWeeks: Array<Array<number | null>> = [];
  for (let i = 0; i < miniCalendarDays.length; i += 7) {
    miniCalendarWeeks.push(miniCalendarDays.slice(i, i + 7));
  }

  const miniWeekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  // Custom keyframes to scale from/to the exact page coordinate tapped by the user
  const enteringAnimation = new Keyframe({
    from: {
      transform: [
        { translateX: zoomOrigin.x - screenWidth / 2 },
        { translateY: zoomOrigin.y - screenHeight / 2 },
        { scale: 0.5 },
      ],
      opacity: 0,
    },
    to: {
      transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1 }],
      opacity: 1,
    },
  }).duration(200);

  const exitingAnimation = new Keyframe({
    from: {
      transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1 }],
      opacity: 1,
    },
    to: {
      transform: [
        { translateX: zoomOrigin.x - screenWidth / 2 },
        { translateY: zoomOrigin.y - screenHeight / 2 },
        { scale: 0.05 },
      ],
      opacity: 0,
    },
  }).duration(150);

  const homeEnteringAnimation = new Keyframe({
    from: {
      transform: [
        { translateX: screenWidth / 2 - zoomOrigin.x },
        { translateY: screenHeight / 2 - zoomOrigin.y },
        { scale: 1.5 },
      ],
      opacity: 0,
    },
    to: {
      transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1.0 }],
      opacity: 1,
    },
  }).duration(200);

  const homeExitingAnimation = new Keyframe({
    from: {
      transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1.0 }],
      opacity: 1,
    },
    to: {
      transform: [
        { translateX: screenWidth / 2 - zoomOrigin.x },
        { translateY: screenHeight / 2 - zoomOrigin.y },
        { scale: 1.5 },
      ],
      opacity: 0,
    },
  }).duration(150);

  function handleSheetChange(index: number) {
    sheetOpenRef.current = index >= 0;
    if (index === -1) {
      setSelectedDate(null);
      setIsSheetForBulk(false);
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
        <Animated.View
          key="home"
          entering={homeEnteringAnimation}
          exiting={homeExitingAnimation}
          style={styles.flex1}
        >
          <ScrollView contentContainerStyle={styles.pageScrollContent}>
            <PageHeader
              title="Availability"
              sub={`Select a boat to manage detailed availability · ${currentMonthTitle}`}
            />

            <View style={styles.boatGrid}>
              {boats.map((boat) => (
                <Pressable
                  key={boat}
                  onPress={(event) => {
                    const pageX = event?.nativeEvent?.pageX;
                    const pageY = event?.nativeEvent?.pageY;
                    setZoomOrigin({
                      x: pageX ?? screenWidth / 2,
                      y: pageY ?? screenHeight / 2,
                    });
                    if (process.env.NODE_ENV === "test") {
                      setActiveBoatForCalendar(boat);
                      setVisibleMonth(new Date(todayYear, todayMonth, 1));
                    } else {
                      // Defer view toggle state updates to the next frame to ensure the
                      // home view re-renders with the correct zoomOrigin before unmounting.
                      requestAnimationFrame(() => {
                        setActiveBoatForCalendar(boat);
                        setVisibleMonth(new Date(todayYear, todayMonth, 1));
                      });
                    }
                  }}
                  style={({ pressed }) => [
                    styles.boatCard,
                    pressed ? styles.boatCardPressed : null,
                  ]}
                  testID={`boat-card-${boat.replace(/\s+/g, "-").toLowerCase()}`}
                >
                  <Text style={styles.boatCardTitle} numberOfLines={1}>
                    {boat}
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
                              todayYear,
                              todayMonth,
                              day,
                            );
                            const booking = bookingsByBoat[boat]?.[dateKey];
                            const allCruisesBooked =
                              booking?.dayCruise &&
                              (booking?.overnightCruise ||
                                booking?.nightCruise);
                            const anyCruiseBooked =
                              booking?.dayCruise ||
                              booking?.overnightCruise ||
                              booking?.nightCruise;

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

            <View style={styles.calendarLegendRow}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: "#dbf8ea", borderColor: "#9dd8bc" },
                  ]}
                />
                <Text style={styles.legendText}>Available</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: "#fff1d6", borderColor: "#f5d392" },
                  ]}
                />
                <Text style={styles.legendText}>Partially Booked</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: "#ffe5e5", borderColor: "#ffcccc" },
                  ]}
                />
                <Text style={styles.legendText}>Fully Booked</Text>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      ) : (
        <Animated.View
          key="detail"
          entering={enteringAnimation}
          exiting={exitingAnimation}
          style={styles.flex1}
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
              <Animated.View
                key={`${visibleYear}-${visibleMonthIndex}`}
                entering={slideDirection === 'left' ? SlideInRight.duration(200) : SlideInLeft.duration(200)}
                exiting={FadeOut.duration(100)}
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
                                    {formatLocalPrice(booking.dayCruisePrice)}
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
                                    {formatLocalPrice(booking.overnightCruisePrice)}
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
                                    {formatLocalPrice(booking.nightCruisePrice)}
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
              </Animated.View>
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

        </Animated.View>
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
                    <View style={selectedBooking.dayCruise ? styles.bookedPill : styles.notBookedPill}>
                      {selectedBooking.dayCruise ? (
                        <Check size={12} color="#ffffff" strokeWidth={2.5} />
                      ) : null}
                      <Text style={selectedBooking.dayCruise ? styles.bookedPillText : styles.notBookedPillText}>
                        {selectedBooking.dayCruise ? "Booked" : "Not booked"}
                      </Text>
                    </View>
                  )}
                </View>
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
              </View>

              {/* Overnight Card */}
              <View style={styles.cruiseCard}>
                <View style={styles.cruiseCardHeader}>
                  <CruiseTypeIcon type="overnight" size="regular" />
                  <Text style={styles.cruiseCardLabel}>Overnight</Text>
                  {!isSheetForBulk && (
                    <View style={selectedBooking.overnightCruise ? styles.bookedPill : styles.notBookedPill}>
                      {selectedBooking.overnightCruise ? (
                        <Check size={12} color="#ffffff" strokeWidth={2.5} />
                      ) : null}
                      <Text style={selectedBooking.overnightCruise ? styles.bookedPillText : styles.notBookedPillText}>
                        {selectedBooking.overnightCruise ? "Booked" : "Not booked"}
                      </Text>
                    </View>
                  )}
                </View>
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
              </View>

              {/* Night Stay Card */}
              <View style={styles.cruiseCard}>
                <View style={styles.cruiseCardHeader}>
                  <CruiseTypeIcon type="night" size="regular" />
                  <Text style={styles.cruiseCardLabel}>Night stay</Text>
                  {!isSheetForBulk && (
                    <View style={selectedBooking.nightCruise ? styles.bookedPill : styles.notBookedPill}>
                      {selectedBooking.nightCruise ? (
                        <Check size={12} color="#ffffff" strokeWidth={2.5} />
                      ) : null}
                      <Text style={selectedBooking.nightCruise ? styles.bookedPillText : styles.notBookedPillText}>
                        {selectedBooking.nightCruise ? "Booked" : "Not booked"}
                      </Text>
                    </View>
                  )}
                </View>
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
    </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}
