import React, { useState, useEffect, useCallback } from "react";
import { Pressable, ScrollView, Text, View, ActivityIndicator, Alert, Modal, TextInput, Switch, StyleSheet, RefreshControl } from "react-native";
import { ArrowLeft, Calendar, ChevronDown, ChevronUp, ArrowRight, Sun, Moon, Sunrise, Pencil, Trash, X, CheckCircle, Info, Ship } from "lucide-react-native";
import { useBoat } from "../context/BoatContext";
import { useNavigation } from "@react-navigation/native";
import { fetchBookings, saveDirectBooking, deleteBooking, Booking, DietEntry, MONTHS, BOAT_BH_CONFIGS, BOAT_TOTAL_BH, SHARED_BOATS, SHARED_BOAT_TOTAL_UNITS, TRIP_TYPES, AVAILABILITY_TYPE_ICONS, getAvailabilityStatus, buildDefaultPricing, toISODate, fromISODate, formatDateRange, getMinimumRooms, getCotsMattresses, isContactUnlocked, dateOpenState as initialDateOpenState, blockedDates as initialBlockedDates, safeParseDate, isBookingCoveringDate } from "../services/bookings";
import { COLORS } from "../styles";
import {
  fetchAvailabilityCalendar,
  fetchAvailabilitySelection,
  updateAvailabilityDateStatus,
  updateAvailabilityRates,
  updateAvailabilitySharedInventory,
} from "../services/availability";
import {
  AvailabilityCalendarResponse,
  AvailabilitySelectionResponse,
  AvailabilityDay,
  RateTierDto,
} from "../data/availability";

// Freeze reference date to June 18, 2026
const now = new Date("2026-06-18T10:00:00");

const toBackendCruiseType = (uiType: string): string => {
  if (uiType === "Day Cruise") return "DAY";
  if (uiType === "Night Stay") return "NIGHT";
  if (uiType === "Overnight Stay") return "OVERNIGHT";
  return uiType.toUpperCase();
};

export default function AvailabilityScreen() {
  const navigation = useNavigation();
  const { boats } = useBoat();
  const [localBoatName, setLocalBoatName] = useState<string | null>(null);

  // Reset local boat selection on focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setLocalBoatName(null);
    });
    return unsubscribe;
  }, [navigation]);

  // Screen state
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [allBlockedDates, setAllBlockedDates] = useState<any[]>(initialBlockedDates);
  const [localDateOpenState, setLocalDateOpenState] = useState<Record<string, boolean>>(initialDateOpenState);
  const [localTripPricing, setLocalTripPricing] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Backend Availability API state
  const [calendarData, setCalendarData] = useState<AvailabilityCalendarResponse | null>(null);
  const [selectionData, setSelectionData] = useState<AvailabilitySelectionResponse | null>(null);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [isSelectionLoading, setIsSelectionLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  // Calendar Selection State
  const today = new Date();
  const [availabilityMonth, setAvailabilityMonth] = useState({ month: today.getMonth(), year: today.getFullYear() });
  const [availabilitySelection, setAvailabilitySelection] = useState<number[]>([]);
  const [expandedTripType, setExpandedTripType] = useState<string | null>(null);
  
  // Rate Editing drafts
  const [priceDrafts, setPriceDrafts] = useState<Record<string, any>>({});
  const [confirmRatesError, setConfirmRatesError] = useState<string | null>(null);
  const [confirmRatesSuccess, setConfirmRatesSuccess] = useState<string | null>(null);

  // Shared units edit state
  const [localSharedUnits, setLocalSharedUnits] = useState<Record<string, number>>({});
  const [unitsEditingKey, setUnitsEditingKey] = useState<string | null>(null);
  const [unitsDraft, setUnitsDraft] = useState("");

  // Modals state
  const [addBookingFormOpen, setAddBookingFormOpen] = useState(false);
  const [modifyBookingListOpen, setModifyBookingListOpen] = useState(false);
  const [modifySelectedBookingId, setModifySelectedBookingId] = useState<number | null>(null);
  const [modifyDeleteConfirmOpen, setModifyDeleteConfirmOpen] = useState(false);

  // Dropdowns
  const [availabilityMonthPickerOpen, setAvailabilityMonthPickerOpen] = useState(false);
  const [availabilityYearPickerOpen, setAvailabilityYearPickerOpen] = useState(false);

  // Form fields state
  const [addBookingForm, setAddBookingForm] = useState<{
    editingBookingId?: number;
    originalBoat?: string;
    originalDbDates?: string[];
    source: string;
    guest: string;
    boat: string;
    rooms: number;
    type: string;
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    kids: number;
    cots: number;
    dietBreakdown: DietEntry[];
    phone: string;
    specialRequests: string;
    price: string;
  }>({
    source: "Direct Booking",
    guest: "",
    boat: "",
    rooms: 1,
    type: "Day Cruise",
    checkIn: "",
    checkOut: "",
    adults: 2,
    children: 0,
    kids: 0,
    cots: 0,
    dietBreakdown: [{ type: "Veg", count: 2 }],
    phone: "",
    specialRequests: "",
    price: "",
  });

  const selectedBoatObj = boats.find((b) => b.name === localBoatName);
  const selectedBoatId = selectedBoatObj?.id ? Number(selectedBoatObj.id) : 1;
  const currentMonthStr = `${availabilityMonth.year}-${String(availabilityMonth.month + 1).padStart(2, "0")}`;

  // Fetch month calendar from backend API
  const loadCalendar = useCallback(async () => {
    if (!localBoatName) return;
    setIsCalendarLoading(true);
    try {
      const res = await fetchAvailabilityCalendar(selectedBoatId, currentMonthStr);
      if (res.data) {
        setCalendarData(res.data);
      }
    } catch (err) {
      console.error("Failed to load availability calendar:", err);
    } finally {
      setIsCalendarLoading(false);
    }
  }, [localBoatName, selectedBoatId, currentMonthStr]);

  // Fetch range selection from backend API
  const loadSelection = useCallback(async (minDay: number, maxDay: number) => {
    if (!localBoatName) return;
    const fromDateStr = `${availabilityMonth.year}-${String(availabilityMonth.month + 1).padStart(2, "0")}-${String(minDay).padStart(2, "0")}`;
    const toDateStr = `${availabilityMonth.year}-${String(availabilityMonth.month + 1).padStart(2, "0")}-${String(maxDay).padStart(2, "0")}`;
    
    setIsSelectionLoading(true);
    try {
      const res = await fetchAvailabilitySelection(selectedBoatId, fromDateStr, toDateStr);
      if (res.data) {
        setSelectionData(res.data);
      }
    } catch (err) {
      console.error("Failed to load availability selection:", err);
    } finally {
      setIsSelectionLoading(false);
    }
  }, [localBoatName, selectedBoatId, availabilityMonth]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await fetchBookings(0);
      if (response.data) {
        setAllBookings(response.data);
      }
      await loadCalendar();
    } catch (err) {
      console.error("Failed to load availability bookings:", err);
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
      await loadCalendar();
      if (availabilitySelection.length > 0) {
        const min = Math.min(...availabilitySelection);
        const max = Math.max(...availabilitySelection);
        await loadSelection(min, max);
      }
    } catch (err) {
      console.error("Failed to refresh availability bookings:", err);
    } finally {
      setRefreshing(false);
    }
  }, [loadCalendar, loadSelection, availabilitySelection]);

  useEffect(() => {
    loadData();
  }, [localBoatName, availabilityMonth]);

  // Handle selection changes
  useEffect(() => {
    if (availabilitySelection.length > 0) {
      const min = Math.min(...availabilitySelection);
      const max = Math.max(...availabilitySelection);
      loadSelection(min, max);
    } else {
      setSelectionData(null);
    }
  }, [availabilitySelection, loadSelection]);

  if (!localBoatName) {
    // Show Houseboats list to choose from (if global is "All")
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 18 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.teal]} tintColor={COLORS.teal} />}
        >
          <Text style={{ fontSize: 26, fontWeight: "800", color: COLORS.navy, marginBottom: 6 }}>
            Availability
          </Text>
          <Text style={{ fontSize: 13, color: COLORS.muted, marginBottom: 20 }}>
            Select a houseboat to manage open dates, pricing, and direct bookings.
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -6 }}>
            {boats.map((b) => (
              <View key={b.id} style={{ width: "50%", padding: 6 }}>
                <Pressable
                  testID={`boat-card-${b.name.toLowerCase().replace(/\s+/g, "-")}`}
                  onPress={() => setLocalBoatName(b.name)}
                  style={{
                    backgroundColor: COLORS.white,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    borderRadius: 16,
                    aspectRatio: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 12,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: COLORS.tealLight,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 10,
                    }}
                  >
                    <Ship size={20} color={COLORS.teal} />
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.navy, textAlign: "center" }}>
                    {b.name}
                  </Text>
                  <Text style={{ fontSize: 10, fontWeight: "600", color: COLORS.muted, marginTop: 4, textAlign: "center" }}>
                    {BOAT_BH_CONFIGS[b.name]?.map(bh => `${bh}BH`).join(" / ") || `${BOAT_TOTAL_BH[b.name] || 1}BH`}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // Active Boat Details
  const boat = localBoatName;
  const isShared = SHARED_BOATS.has(boat) || calendarData?.shared === true;
  const totalUnits = calendarData?.physicalRoomCount ?? (isShared ? SHARED_BOAT_TOTAL_UNITS[boat] : null);

  // Calendar calculations
  const firstOfMonth = new Date(availabilityMonth.year, availabilityMonth.month, 1);
  const daysInMonth = new Date(availabilityMonth.year, availabilityMonth.month + 1, 0).getDate();
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
    const currentDate = new Date();
    return (
      day === currentDate.getDate() &&
      availabilityMonth.month === currentDate.getMonth() &&
      availabilityMonth.year === currentDate.getFullYear()
    );
  };

  const isInSelection = (day: number) => {
    if (availabilitySelection.length === 0) return false;
    if (availabilitySelection.length === 1) return availabilitySelection[0] === day;
    const min = Math.min(...availabilitySelection);
    const max = Math.max(...availabilitySelection);
    return day >= min && day <= max;
  };

  const dateStrFor = (day: number) => {
    const d = new Date(availabilityMonth.year, availabilityMonth.month, day);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).replace(/,/g, "");
  };

  const isoDateStrFor = (day: number) => {
    const m = String(availabilityMonth.month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${availabilityMonth.year}-${m}-${d}`;
  };

  const handleDayTap = (day: number) => {
    setConfirmRatesError(null);
    setConfirmRatesSuccess(null);
    setPriceDrafts({});
    setAvailabilitySelection((prev) => {
      if (prev.length === 0) return [day];
      if (prev.length === 1) {
        if (prev[0] === day) return [];
        return [prev[0], day];
      }
      return [day];
    });
    setExpandedTripType(null);
  };

  const MIN_MONTH = 5; // June
  const MIN_YEAR = 2026;
  const isAtFloor = availabilityMonth.year === MIN_YEAR && availabilityMonth.month === MIN_MONTH;

  const goToMonth = (delta: number) => {
    setAvailabilitySelection([]);
    setExpandedTripType(null);
    setPriceDrafts({});
    setConfirmRatesError(null);
    setConfirmRatesSuccess(null);

    let month = availabilityMonth.month + delta;
    let year = availabilityMonth.year;
    if (month < 0) {
      month = 11;
      year -= 1;
    } else if (month > 11) {
      month = 0;
      year += 1;
    }
    if (year < MIN_YEAR || (year === MIN_YEAR && month < MIN_MONTH)) {
      setAvailabilityMonth({ month: MIN_MONTH, year: MIN_YEAR });
    } else {
      setAvailabilityMonth({ month, year });
    }
  };

  const STATUS_COLORS: Record<string, string> = { green: COLORS.green, amber: COLORS.amber, red: COLORS.red };
  const STATUS_TINTS: Record<string, string> = { green: "#DCFCE7", amber: "#FEF3C7", red: "#FEE2E2", empty: COLORS.bg };

  const selectedDateLabel = (() => {
    if (availabilitySelection.length === 0) return null;
    if (availabilitySelection.length === 1) return dateStrFor(availabilitySelection[0]);
    const min = Math.min(...availabilitySelection);
    const max = Math.max(...availabilitySelection);
    return `${dateStrFor(min)} to ${dateStrFor(max)}`;
  })();

  // Resolve selection dates array
  const getSelectedDates = () => {
    if (availabilitySelection.length === 0) return [];
    if (availabilitySelection.length === 1) return [dateStrFor(availabilitySelection[0])];
    const min = Math.min(...availabilitySelection);
    const max = Math.max(...availabilitySelection);
    const arr = [];
    for (let d = min; d <= max; d++) {
      arr.push(dateStrFor(d));
    }
    return arr;
  };

  const selectedDates = getSelectedDates();
  const firstDateStr = selectedDates[0] || "";

  // Derive selection Date Open status from selectionData or fallback
  const isDateOpen = selectionData
    ? selectionData.manualSalesRangeState === "OPEN"
    : firstDateStr ? localDateOpenState[`${boat}|${firstDateStr}`] === true : false;

  const hasRealBookingOnSelection = selectionData
    ? selectionData.allowedActions?.canClose === false
    : selectedDates.some((dateStr) =>
        allBookings.some((b) => b.boat === boat && isBookingCoveringDate(b, dateStr))
      );

  // Toggle Date Status (PUT /date-status)
  const handleToggleDateStatus = async (newIsOpen: boolean) => {
    if (availabilitySelection.length === 0) return;
    const min = Math.min(...availabilitySelection);
    const max = Math.max(...availabilitySelection);
    const fromDate = isoDateStrFor(min);
    const toDate = isoDateStrFor(max);

    setIsMutating(true);
    try {
      const res = await updateAvailabilityDateStatus(selectedBoatId, {
        fromDate,
        toDate,
        isOpen: newIsOpen,
      });
      if (res.data) {
        setSelectionData(res.data);
        await loadCalendar();
      } else if (res.error) {
        const errorMsg = typeof res.error === "string" ? res.error : (res.error as any)?.message || "Failed to update date status";
        Alert.alert("Error", errorMsg);
      }
    } catch (err) {
      console.error("Failed to update date status:", err);
    } finally {
      setIsMutating(false);
    }
  };

  // Submit Rates (PUT /rates)
  const handleConfirmRates = async (type: string) => {
    if (availabilitySelection.length === 0) return;
    const min = Math.min(...availabilitySelection);
    const max = Math.max(...availabilitySelection);
    const fromDate = isoDateStrFor(min);
    const toDate = isoDateStrFor(max);

    const bhTiers = BOAT_BH_CONFIGS[boat] || [BOAT_TOTAL_BH[boat]];
    const confirmedEntry = localTripPricing[`${boat}|${firstDateStr}|${type}`];

    const tiersPayload: RateTierDto[] = bhTiers.map((bh, idx) => {
      const draftKey = `${type}|${bh}`;
      const existing = confirmedEntry?.tiers?.[bh];
      const fallback = buildDefaultPricing(boat)[type]?.tiers?.[bh];
      const draft = priceDrafts[draftKey] || {
        base: existing?.base ?? fallback?.base ?? 0,
        extraAdult: existing?.extraAdult ?? fallback?.extraAdult ?? 0,
        extraChild: existing?.extraChild ?? fallback?.extraChild ?? 0,
        open: existing?.open ?? false,
      };

      return {
        boatConfigurationId: bh,
        isOpen: draft.open,
        basePrice: draft.base,
        extraAdultPrice: draft.extraAdult,
        extraChildPrice: draft.extraChild,
      };
    });

    const isAnyOpen = tiersPayload.some((t) => t.isOpen);
    if (!isAnyOpen) {
      setConfirmRatesError(type);
      return;
    }

    setIsMutating(true);
    setConfirmRatesError(null);
    try {
      const res = await updateAvailabilityRates(selectedBoatId, {
        fromDate,
        toDate,
        cruiseType: toBackendCruiseType(type),
        tiers: tiersPayload,
      });
      if (res.data) {
        setSelectionData(res.data);
        await loadCalendar();
        setConfirmRatesSuccess(type);
        setTimeout(() => setConfirmRatesSuccess(null), 2500);

        // Update local pricing cache
        setLocalTripPricing((prev) => {
          const next = { ...prev };
          const tiersObj: Record<number, any> = {};
          tiersPayload.forEach((t) => {
            tiersObj[t.boatConfigurationId] = {
              base: t.basePrice,
              extraAdult: t.extraAdultPrice,
              extraChild: t.extraChildPrice,
              open: t.isOpen,
            };
          });
          selectedDates.forEach((dateStr) => {
            next[`${boat}|${dateStr}|${type}`] = { tiers: tiersObj };
          });
          return next;
        });

        // Clear drafts for this type
        setPriceDrafts((prev) => {
          const next = { ...prev };
          delete next[`_editing_${type}`];
          bhTiers.forEach((bh) => delete next[`${type}|${bh}`]);
          return next;
        });
      } else if (res.error) {
        const errorMsg = typeof res.error === "string" ? res.error : (res.error as any)?.message || "Failed to update rates";
        setConfirmRatesError(errorMsg);
      }
    } catch (err) {
      console.error("Failed to update rates:", err);
    } finally {
      setIsMutating(false);
    }
  };

  // Set Shared Inventory Limit (PUT /shared-inventory)
  const handleUpdateSharedInventory = async (limit: number) => {
    if (availabilitySelection.length === 0) return;
    const min = Math.min(...availabilitySelection);
    const max = Math.max(...availabilitySelection);
    const fromDate = isoDateStrFor(min);
    const toDate = isoDateStrFor(max);

    setIsMutating(true);
    try {
      const res = await updateAvailabilitySharedInventory(selectedBoatId, {
        fromDate,
        toDate,
        sellableRoomLimit: limit,
      });
      if (res.data) {
        setSelectionData(res.data);
        await loadCalendar();
      } else if (res.error) {
        const errorMsg = typeof res.error === "string" ? res.error : (res.error as any)?.message || "Failed to update shared inventory";
        Alert.alert("Error", errorMsg);
      }
    } catch (err) {
      console.error("Failed to update shared inventory:", err);
    } finally {
      setIsMutating(false);
    }
  };

  const getFormattedNextDay = (dateStr: string) => {
    const d = safeParseDate(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const next = new Date(d.getTime() + 24 * 60 * 60 * 1000);
    return fromISODate(toISODate(next.toISOString()));
  };

  // Handle Form changes
  const updateField = (key: string, value: any) => {
    setAddBookingForm((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "type" || key === "checkIn") {
        const currentType = key === "type" ? value : prev.type;
        const currentCheckIn = key === "checkIn" ? value : prev.checkIn;

        if (currentType === "Day Cruise") {
          next.checkOut = currentCheckIn;
        } else if (currentType === "Night Stay") {
          next.checkOut = getFormattedNextDay(currentCheckIn);
        } else if (currentType === "Overnight Stay") {
          const cin = safeParseDate(currentCheckIn);
          const cout = safeParseDate(next.checkOut);
          if (isNaN(cout.getTime()) || cout <= cin) {
            next.checkOut = getFormattedNextDay(currentCheckIn);
          }
        }
      }
      
      // Auto adjustments
      if (key === "adults" || key === "children") {
        const adultsVal = key === "adults" ? Number(value) : prev.adults;
        const kidsVal = key === "children" ? Number(value) : prev.children;
        const totalGuests = adultsVal + kidsVal;
        
        const minRooms = Math.max(1, Math.ceil(totalGuests / 3));
        if (next.rooms < minRooms) {
          next.rooms = minRooms;
        }
        next.cots = Math.max(0, totalGuests - next.rooms * 2);
      }
      return next;
    });
  };

  const addDietRow = () => {
    setAddBookingForm(prev => ({
      ...prev,
      dietBreakdown: [...prev.dietBreakdown, { type: "Veg", count: 1 }]
    }));
  };

  const removeDietRow = (index: number) => {
    setAddBookingForm(prev => ({
      ...prev,
      dietBreakdown: prev.dietBreakdown.filter((_, idx) => idx !== index)
    }));
  };

  const updateDiet = (index: number, key: keyof DietEntry, val: any) => {
    setAddBookingForm(prev => {
      const breakdown = [...prev.dietBreakdown];
      breakdown[index] = { ...breakdown[index], [key]: key === "count" ? Number(val) : val };
      return { ...prev, dietBreakdown: breakdown };
    });
  };

  const handleConfirmDirectBooking = async () => {
    // Validations
    if (!addBookingForm.guest.trim()) {
      Alert.alert("Required", "Please enter guest name");
      return;
    }
    const totalCountable = addBookingForm.adults + addBookingForm.children;
    const dietTotal = addBookingForm.dietBreakdown.reduce((sum, d) => sum + d.count, 0);
    if (dietTotal !== totalCountable) {
      Alert.alert("Diet Mismatch", `Diet breakdown sum (${dietTotal}) must equal total guests (${totalCountable})`);
      return;
    }

    const firstDate = safeParseDate(addBookingForm.checkIn);
    const secondDate = safeParseDate(addBookingForm.checkOut);
    if (addBookingForm.type === "Overnight Stay" && secondDate <= firstDate) {
      Alert.alert("Date Error", "Check-out date must be after check-in date");
      return;
    }

    setIsLoading(true);
    try {
      const typeLabel = addBookingForm.type === "Day Cruise" ? "Day cruise" : addBookingForm.type === "Overnight Stay" ? "Overnight stay" : "Night stay";
      const formattedBooking: Booking = {
        id: addBookingForm.editingBookingId ?? Date.now(),
        bookingId: `AB-${Date.now().toString().slice(-4)}`,
        guest: addBookingForm.guest,
        phone: addBookingForm.phone,
        boat: addBookingForm.boat,
        type: typeLabel,
        date: fromISODate(toISODate(addBookingForm.checkIn)),
        dateEnd: fromISODate(toISODate(addBookingForm.checkOut)),
        adults: addBookingForm.adults,
        children: addBookingForm.children,
        kids: addBookingForm.kids,
        rooms: addBookingForm.rooms,
        cots: addBookingForm.cots,
        dietBreakdown: addBookingForm.dietBreakdown,
        specialRequests: addBookingForm.specialRequests ? addBookingForm.specialRequests.split(",").map(r => r.trim()) : [],
        price: Number(addBookingForm.price) || 0,
        isDirect: true,
        bookingSource: addBookingForm.source,
      };

      const res = await saveDirectBooking(formattedBooking);
      if (res.data) {
        await loadData();
        setAddBookingFormOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDeleteBooking = async (bookingId: number) => {
    setIsLoading(true);
    try {
      await deleteBooking(bookingId);
      await loadData();
      setModifyDeleteConfirmOpen(false);
      setModifySelectedBookingId(null);
      setModifyBookingListOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 18, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.teal]} tintColor={COLORS.teal} />}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <Pressable onPress={() => setLocalBoatName(null)} style={{ padding: 4 }}>
            <ArrowLeft size={20} color={COLORS.navy} />
          </Pressable>
          <Text style={{ fontSize: 26, fontWeight: "800", color: COLORS.navy }}>{boat}</Text>
        </View>

        {isLoading || isCalendarLoading ? (
          <View style={{ paddingVertical: 100, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color={COLORS.teal} />
            <Text style={{ marginTop: 10, color: COLORS.muted, fontSize: 14 }}>Loading availability calendar...</Text>
          </View>
        ) : (
          <>
            {/* Availability Calendar */}
            <View
              style={{
                backgroundColor: COLORS.white,
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 24,
                padding: 16,
                marginBottom: 16,
              }}
            >
              {/* Month navigation */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <Pressable onPress={() => { if (!isAtFloor) goToMonth(-1); }} style={{ opacity: isAtFloor ? 0.3 : 1, padding: 6 }}>
                  <ArrowLeft size={16} color={COLORS.navy} />
                </Pressable>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Calendar size={15} color={COLORS.teal} />
                  <Pressable onPress={() => { setAvailabilityMonthPickerOpen(!availabilityMonthPickerOpen); setAvailabilityYearPickerOpen(false); }} style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                    <Text testID="home-calendar-month-title" style={{ fontSize: 14, fontWeight: "700", color: COLORS.navy }}>{MONTHS[availabilityMonth.month]}</Text>
                    <ChevronDown size={12} color={COLORS.muted} />
                  </Pressable>
                  <Pressable onPress={() => { setAvailabilityYearPickerOpen(!availabilityYearPickerOpen); setAvailabilityMonthPickerOpen(false); }} style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                    <Text testID="calendar-month-title" style={{ fontSize: 14, fontWeight: "700", color: COLORS.navy }}>{availabilityMonth.year}</Text>
                    <ChevronDown size={12} color={COLORS.muted} />
                  </Pressable>
                </View>

                <Pressable testID="home-month-next" onPress={() => goToMonth(1)} style={{ padding: 6 }}>
                  <ArrowRight size={16} color={COLORS.navy} />
                </Pressable>
              </View>

              {/* Weekday headers */}
              <View style={{ flexDirection: "row", marginBottom: 8 }}>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <Text key={d} style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: "700", color: COLORS.muted }}>{d}</Text>
                ))}
              </View>

              {/* Calendar cells grid */}
              <View style={{ flexDirection: "column", gap: 6 }}>
                {rows.map((row, rowIdx) => (
                  <View key={rowIdx} style={{ flexDirection: "row", gap: 6 }}>
                    {row.map((day, cellIdx) => {
                      if (!day) return <View key={`blank-${rowIdx}-${cellIdx}`} style={{ flex: 1, aspectRatio: 1 }} />;

                      const isoDate = isoDateStrFor(day);
                      const availDay = calendarData?.days?.find((d) => d.date === isoDate);
                      const mockResult = getAvailabilityStatus(boat, dateStrFor(day), allBookings, allBlockedDates, localDateOpenState, localTripPricing);

                      const selected = isInSelection(day);
                      const isClosed = availDay ? availDay.manualSalesState === "CLOSED" : mockResult.status === "closed";
                      const hasAddedBooking = availDay ? availDay.hasAddedBooking : mockResult.hasDirectBooking;

                      let background = selected
                        ? COLORS.tealMedium
                        : isClosed
                        ? "#E2E8F0"
                        : mockResult.status === "empty"
                        ? STATUS_TINTS.empty
                        : STATUS_TINTS[mockResult.background ?? ""] || COLORS.white;

                      // Derive dot indicators from API cruiseTypes if available
                      const openDots: string[] = [];
                      if (!isClosed && availDay?.cruiseTypes) {
                        availDay.cruiseTypes.forEach((ct) => {
                          if (ct.offered) {
                            if (ct.inventoryState === "SOLD_OUT") openDots.push("red");
                            else if (ct.effectiveSalesState === "SELLABLE") openDots.push("green");
                            else openDots.push("amber");
                          }
                        });
                      } else if (!isClosed && mockResult.circles) {
                        TRIP_TYPES.forEach((type) => {
                          const col = mockResult.circles[type as keyof typeof mockResult.circles];
                          if (col) openDots.push(col);
                        });
                      }

                      return (
                        <Pressable
                          key={day}
                          testID={`calendar-day-${isoDate}`}
                          onPress={() => handleDayTap(day)}
                          style={{
                            flex: 1,
                            aspectRatio: 1,
                            borderRadius: 10,
                            backgroundColor: background,
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: selected ? 0 : isTodayDay(day) ? 2.5 : !isClosed ? 1 : 0,
                            borderColor: isTodayDay(day) ? COLORS.navy : COLORS.border,
                          }}
                        >
                          {!isClosed && hasAddedBooking && (
                            <Text style={{ fontSize: 7, fontWeight: "800", color: selected ? COLORS.white : COLORS.navy, marginBottom: 1 }}>AB</Text>
                          )}
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: selected || isTodayDay(day) ? "700" : "500",
                              color: selected ? COLORS.white : isClosed ? COLORS.muted : COLORS.navy,
                            }}
                          >
                            {day}
                          </Text>
                          {!isClosed && openDots.length > 0 && (
                            <View style={{ flexDirection: "row", gap: 2, marginTop: 2 }}>
                              {openDots.map((color, idx) => (
                                <View key={idx} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: STATUS_COLORS[color] || COLORS.green, borderWidth: selected ? 1 : 0, borderColor: COLORS.white }} />
                              ))}
                            </View>
                          )}
                          {isClosed && (
                            <View style={{ position: "absolute", top: 2, right: 2 }}>
                              <X size={9} color={COLORS.muted} />
                            </View>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
              </View>

              {/* Legend */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: COLORS.border, justifyContent: "center" }}>
                {[
                  { label: "Available", color: COLORS.green },
                  { label: "Partially Booked", color: COLORS.amber },
                  { label: "Booked", color: COLORS.red },
                  { label: "No price set", empty: true },
                  { label: "Closed", icon: true },
                  { label: "Added Booking", ab: true },
                ].map((item) => (
                  <View key={item.label} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    {item.ab ? (
                      <Text style={{ fontSize: 10, fontWeight: "800", color: COLORS.navy }}>AB</Text>
                    ) : item.icon ? (
                      <X size={10} color={COLORS.muted} />
                    ) : item.empty ? (
                      <View style={{ width: 8, height: 8, borderRadius: 4, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bg }} />
                    ) : (
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color }} />
                    )}
                    <Text style={{ fontSize: 11, color: COLORS.muted }}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Config controls panel */}
            {availabilitySelection.length > 0 && (
              <View
                style={{
                  backgroundColor: COLORS.white,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 24,
                  padding: 18,
                  marginBottom: 16,
                }}
              >
                {isSelectionLoading ? (
                  <ActivityIndicator size="small" color={COLORS.teal} style={{ paddingVertical: 20 }} />
                ) : (
                  <>
                    {/* Blocking reasons alert banner if present */}
                    {selectionData?.allowedActions?.blockingReasons && selectionData.allowedActions.blockingReasons.length > 0 && (
                      <View style={{ backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FCA5A5", borderRadius: 12, padding: 10, marginBottom: 14 }}>
                        {selectionData.allowedActions.blockingReasons.map((reason, idx) => (
                          <Text key={idx} style={{ fontSize: 12, color: COLORS.red, fontWeight: "600" }}>• {reason}</Text>
                        ))}
                      </View>
                    )}

                    {/* Date Status toggle row */}
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: 18 }}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.navy }}>Date Status</Text>
                        <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>
                          {hasRealBookingOnSelection ? "Has a confirmed booking — can't be closed" : "Closed by default until opened"}
                        </Text>
                      </View>

                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <View style={{ backgroundColor: isDateOpen ? COLORS.tealLight : COLORS.border, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
                          <Text style={{ fontSize: 11, fontWeight: "700", color: isDateOpen ? COLORS.teal : COLORS.muted }}>
                            {isDateOpen ? "Open" : "Closed"}
                          </Text>
                        </View>
                        <Switch
                          value={isDateOpen}
                          disabled={hasRealBookingOnSelection || isMutating || (selectionData?.allowedActions ? (!isDateOpen && !selectionData.allowedActions.canOpen) || (isDateOpen && !selectionData.allowedActions.canClose) : false)}
                          onValueChange={(val) => {
                            handleToggleDateStatus(val);
                            setLocalDateOpenState((prev) => {
                              const next = { ...prev };
                              selectedDates.forEach((dateStr) => {
                                next[`${boat}|${dateStr}`] = val;
                              });
                              return next;
                            });
                          }}
                          trackColor={{ false: COLORS.border, true: COLORS.teal }}
                        />
                      </View>
                    </View>

                    {/* Subtitle */}
                    <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.navy, marginBottom: 4 }}>Open/Close Cruise Types</Text>
                    <Text style={{ fontSize: 12, color: COLORS.muted, marginBottom: 16 }}>
                      Choose which cruise types are open to booking for the selected dates.
                    </Text>

                    {/* Shared unit indicator */}
                    {isShared && isDateOpen && totalUnits && (() => {
                      const firstDateData = selectionData?.dates?.[0];
                      const firstCt = firstDateData?.cruiseTypes?.[0];
                      const bookedRoomsOnSelection = firstCt?.bookedRooms ?? selectedDates.reduce((max, dateStr) => {
                        const sum = allBookings
                          .filter(b => b.boat === boat && isBookingCoveringDate(b, dateStr))
                          .reduce((acc, b) => acc + (b.rooms || 1), 0);
                        return Math.max(max, sum);
                      }, 0);

                      const sellableLimit = firstCt?.sellableRoomLimit ?? Math.max(0, totalUnits - bookedRoomsOnSelection);
                      const sharedKey = `${boat}|${firstDateStr}`;
                      const currentAvailableUnits = localSharedUnits[sharedKey] ?? sellableLimit;

                      return (
                        <View style={{ backgroundColor: COLORS.bg, borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border }}>
                          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <View>
                              <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.navy }}>Rooms available</Text>
                              <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>
                                Configured: {totalUnits} · Booked: {bookedRoomsOnSelection}
                              </Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                              <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.teal }}>{currentAvailableUnits}</Text>
                              <Pressable
                                onPress={() => setUnitsEditingKey(unitsEditingKey === sharedKey ? null : sharedKey)}
                                style={{ backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.teal, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}
                              >
                                <Text style={{ fontSize: 11, fontWeight: "700", color: COLORS.teal }}>
                                  {unitsEditingKey === sharedKey ? "Done" : "Edit"}
                                </Text>
                              </Pressable>
                            </View>
                          </View>

                          {unitsEditingKey === sharedKey && (
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border }}>
                              <Text style={{ fontSize: 12, color: COLORS.navy, fontWeight: "600" }}>Available units (Max {totalUnits}):</Text>
                              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <Pressable
                                  onPress={() => {
                                    const val = Math.max(0, currentAvailableUnits - 1);
                                    setLocalSharedUnits(prev => ({ ...prev, [sharedKey]: val }));
                                    handleUpdateSharedInventory(val);
                                  }}
                                  style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center" }}
                                >
                                  <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.navy }}>-</Text>
                                </Pressable>
                                <Text style={{ fontSize: 15, fontWeight: "800", color: COLORS.navy, minWidth: 20, textAlign: "center" }}>{currentAvailableUnits}</Text>
                                <Pressable
                                  onPress={() => {
                                    const val = Math.min(totalUnits, currentAvailableUnits + 1);
                                    setLocalSharedUnits(prev => ({ ...prev, [sharedKey]: val }));
                                    handleUpdateSharedInventory(val);
                                  }}
                                  style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center" }}
                                >
                                  <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.navy }}>+</Text>
                                </Pressable>
                              </View>
                            </View>
                          )}
                        </View>
                      );
                    })()}

                    {/* Trip pricing list */}
                    <View style={{ gap: 10, opacity: isDateOpen ? 1 : 0.5, pointerEvents: isDateOpen ? "auto" : "none" }}>
                      {TRIP_TYPES.map((type) => {
                        const isExpanded = expandedTripType === type;
                        const bhTiers = BOAT_BH_CONFIGS[boat] || [BOAT_TOTAL_BH[boat]];
                        const firstKey = `${boat}|${firstDateStr}|${type}`;
                        const confirmedEntry = localTripPricing[firstKey];

                        const backendCt = selectionData?.dates?.[0]?.cruiseTypes?.find(
                          (ct) => ct.cruiseType.toUpperCase() === toBackendCruiseType(type)
                        );

                        const isTypeOpen = backendCt
                          ? backendCt.pricingState === "OPEN"
                          : bhTiers.some((bh) => {
                              const dk = `${type}|${bh}`;
                              if (priceDrafts[dk] !== undefined) return priceDrafts[dk].open;
                              return confirmedEntry?.tiers?.[bh]?.open ?? false;
                            });

                        return (
                          <View key={type} style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, overflow: "hidden" }}>
                            {/* Header row */}
                            <Pressable
                              onPress={() => {
                                if (!isDateOpen) return;
                                setExpandedTripType(isExpanded ? null : type);
                                setConfirmRatesError(null);
                              }}
                              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12 }}
                            >
                              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.tealLight, alignItems: "center", justifyContent: "center" }}>
                                  {type === "Day Cruise" ? <Sun size={17} color={COLORS.teal} /> : type === "Overnight Stay" ? <Moon size={17} color={COLORS.teal} /> : <Sunrise size={17} color={COLORS.teal} />}
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                  <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.navy }}>{type}</Text>
                                  {!isShared && (
                                    <Text style={{ fontSize: 12, fontWeight: "700", color: COLORS.muted }}>
                                      {bhTiers.map((bh, idx) => {
                                        const tierOpen = confirmedEntry?.tiers?.[bh]?.open === true || isTypeOpen;
                                        return (
                                          <Text key={bh}>
                                            <Text style={{ color: tierOpen ? COLORS.teal : COLORS.muted }}>{bh}BH</Text>
                                            {idx < bhTiers.length - 1 ? <Text style={{ color: COLORS.muted }}>/</Text> : null}
                                          </Text>
                                        );
                                      })}
                                    </Text>
                                  )}
                                </View>
                              </View>

                              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <View style={{ backgroundColor: isTypeOpen ? COLORS.tealLight : COLORS.border, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
                                  <Text style={{ fontSize: 11, fontWeight: "700", color: isTypeOpen ? COLORS.teal : COLORS.muted }}>
                                    {isTypeOpen ? "Open" : "Closed"}
                                  </Text>
                                </View>
                                {isExpanded ? <ChevronUp size={14} color={COLORS.muted} /> : <ChevronDown size={14} color={COLORS.muted} />}
                              </View>
                            </Pressable>

                            {/* Expanded content */}
                            {isExpanded && (
                              <View style={{ paddingHorizontal: 12, paddingBottom: 14, borderTopWidth: 1, borderTopColor: COLORS.border }}>
                                {/* Confirmed banner or Edit link */}
                                {confirmedEntry && !priceDrafts[`_editing_${type}`] && (
                                  <View style={{ marginTop: 10, marginBottom: 10, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: COLORS.tealLight, borderRadius: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                    <Text style={{ fontSize: 11, color: COLORS.teal, fontWeight: "600" }}>Confirmed rates set for this date</Text>
                                    <Pressable onPress={() => setPriceDrafts(prev => ({ ...prev, [`_editing_${type}`]: true }))}>
                                      <Text style={{ fontSize: 11, color: COLORS.teal, fontWeight: "700", textDecorationLine: "underline" }}>Edit</Text>
                                    </Pressable>
                                  </View>
                                )}

                                {/* Per-BH tier rows */}
                                {bhTiers.map((bh) => {
                                  const draftKey = `${type}|${bh}`;
                                  const existing = confirmedEntry?.tiers?.[bh];
                                  const fallback = buildDefaultPricing(boat)[type]?.tiers?.[bh];
                                  const draft = priceDrafts[draftKey] || {
                                    base: existing?.base ?? fallback?.base ?? 0,
                                    extraAdult: existing?.extraAdult ?? fallback?.extraAdult ?? 0,
                                    extraChild: existing?.extraChild ?? fallback?.extraChild ?? 0,
                                    open: existing?.open ?? false,
                                  };
                                  const showAsReadonly = confirmedEntry && !priceDrafts[`_editing_${type}`];
                                  const tierOpen = draft.open;
                                  const closingBlocked = tierOpen && hasRealBookingOnSelection;

                                  return (
                                    <View
                                      key={bh}
                                      style={{
                                        marginTop: 12,
                                        paddingLeft: 10,
                                        borderLeftWidth: 2,
                                        borderLeftColor: tierOpen ? COLORS.teal : COLORS.border,
                                      }}
                                    >
                                      {/* BH label + open/close toggle */}
                                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                                        <Text style={{ fontSize: 12, fontWeight: "700", color: COLORS.navy }}>
                                          {isShared ? null : `${bh}BH`}
                                        </Text>
                                        {!showAsReadonly ? (
                                          <Pressable
                                            onPress={() => {
                                              if (closingBlocked) {
                                                setConfirmRatesError(`${type}|${bh}|booked`);
                                                return;
                                              }
                                              const nextTierOpen = !tierOpen;
                                              setPriceDrafts(prev => ({ ...prev, [draftKey]: { ...draft, open: nextTierOpen } }));
                                              if (nextTierOpen) setConfirmRatesError(null);
                                            }}
                                            style={{ flexDirection: "row", alignItems: "center", gap: 6, opacity: closingBlocked ? 0.6 : 1 }}
                                          >
                                            <Text style={{ fontSize: 10, fontWeight: "700", color: tierOpen ? COLORS.teal : COLORS.muted }}>
                                              {tierOpen ? "Open" : "Closed"}
                                            </Text>
                                            <View style={{ width: 30, height: 18, borderRadius: 999, backgroundColor: tierOpen ? COLORS.teal : COLORS.border, position: "relative" }}>
                                              <View
                                                style={{
                                                  width: 13,
                                                  height: 13,
                                                  borderRadius: 7,
                                                  backgroundColor: COLORS.white,
                                                  position: "absolute",
                                                  top: 2.5,
                                                  left: tierOpen ? 14 : 2.5,
                                                }}
                                              />
                                            </View>
                                          </Pressable>
                                        ) : (
                                          <Text style={{ fontSize: 10, fontWeight: "700", color: tierOpen ? COLORS.teal : COLORS.muted }}>
                                            {tierOpen ? "Open" : "Closed"}
                                          </Text>
                                        )}
                                      </View>

                                      {/* Closing blocked error */}
                                      {confirmRatesError === `${type}|${bh}|booked` && (
                                        <Text style={{ fontSize: 11, fontWeight: "600", color: COLORS.red, marginBottom: 8 }}>
                                          This date already has a confirmed booking and can't be closed.
                                        </Text>
                                      )}

                                      {/* Price fields */}
                                      {([
                                        { label: "Base Price", field: "base" },
                                        { label: "Extra Adult Price", field: "extraAdult" },
                                        { label: "Extra Child Price", field: "extraChild" },
                                      ] as { label: string; field: "base" | "extraAdult" | "extraChild" }[]).map(({ label, field }) => (
                                        <View key={field} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                                          <Text style={{ fontSize: 12, color: COLORS.muted }}>{label}</Text>
                                          {showAsReadonly ? (
                                            <Text style={{ fontSize: 12, fontWeight: "700", color: COLORS.navy }}>
                                              ₹{(draft[field] as number).toLocaleString("en-IN")}
                                            </Text>
                                          ) : (
                                            <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                                              <Text style={{ fontSize: 12, color: COLORS.muted }}>₹</Text>
                                              <TextInput
                                                keyboardType="numeric"
                                                value={String(draft[field])}
                                                onChangeText={(val) => {
                                                  const value = parseInt(val, 10) || 0;
                                                  setPriceDrafts(prev => ({ ...prev, [draftKey]: { ...draft, [field]: value } }));
                                                }}
                                                style={{
                                                  width: 90,
                                                  fontSize: 12,
                                                  fontWeight: "700",
                                                  color: COLORS.navy,
                                                  borderWidth: 1,
                                                  borderColor: COLORS.border,
                                                  borderRadius: 8,
                                                  paddingHorizontal: 8,
                                                  paddingVertical: 4,
                                                  textAlign: "right",
                                                }}
                                              />
                                            </View>
                                          )}
                                        </View>
                                      ))}
                                    </View>
                                  );
                                })}

                                {/* Confirm Rates button */}
                                {(!confirmedEntry || priceDrafts[`_editing_${type}`]) && (
                                  <>
                                    {confirmRatesError === type && (
                                      <Text style={{ marginTop: 10, fontSize: 12, fontWeight: "600", color: COLORS.red }}>
                                        To confirm rates, you must open at least 1 configuration.
                                      </Text>
                                    )}
                                    <Pressable
                                      onPress={() => handleConfirmRates(type)}
                                      disabled={isMutating}
                                      style={{
                                        marginTop: 14,
                                        backgroundColor: confirmRatesSuccess === type ? COLORS.green : COLORS.teal,
                                        borderRadius: 10,
                                        paddingVertical: 10,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 6,
                                      }}
                                    >
                                      {confirmRatesSuccess === type ? (
                                        <>
                                          <CheckCircle size={15} color={COLORS.white} />
                                          <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.white }}>Rates Confirmed!</Text>
                                        </>
                                      ) : (
                                        <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.white }}>
                                          {isMutating ? "Saving..." : "Confirm Rates"}
                                        </Text>
                                      )}
                                    </Pressable>
                                  </>
                                )}
                              </View>
                            )}
                          </View>
                        );
                      })}
                    </View>

                    {/* Overlapping Added Bookings list from API */}
                    {selectionData?.addedBookings && selectionData.addedBookings.length > 0 && (
                      <View style={{ marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: COLORS.border }}>
                        <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.navy, marginBottom: 8 }}>Added Bookings</Text>
                        {selectionData.addedBookings.map((b) => (
                          <View key={b.bookingId} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 }}>
                            <Text style={{ fontSize: 12, fontWeight: "600", color: COLORS.navy }}>{b.guestName} ({b.bookingCode})</Text>
                            <Text style={{ fontSize: 11, color: COLORS.muted }}>{b.cruiseTypeLabel || b.cruiseType}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Add/Modify Booking actions */}
                    {isDateOpen && (
                      <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
                        {/* Modify Booking button if there is a direct booking */}
                        {allBookings.filter((b) => b.boat === boat && b.isDirect && b.status !== "cancelled" && b.status !== "deleted" && selectedDates.includes(b.date)).length > 0 && (
                          <Pressable
                            onPress={() => {
                              setModifySelectedBookingId(null);
                              setModifyBookingListOpen(true);
                            }}
                            style={{
                              flex: 1,
                              backgroundColor: COLORS.bg,
                              borderWidth: 1,
                              borderColor: COLORS.border,
                              borderRadius: 14,
                              padding: 14,
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <Pencil size={18} color={COLORS.navy} />
                            <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.navy }}>Modify Booking</Text>
                          </Pressable>
                        )}

                        <Pressable
                          onPress={() => {
                            const firstDate = selectedDates[0];
                            const bhTiers = BOAT_BH_CONFIGS[boat] || [BOAT_TOTAL_BH[boat]];
                            setAddBookingForm({
                              editingBookingId: undefined,
                              source: "Direct Booking",
                              guest: "",
                              boat,
                              rooms: bhTiers[0],
                              type: "Day Cruise",
                              checkIn: firstDate,
                              checkOut: firstDate,
                              adults: 2,
                              children: 0,
                              kids: 0,
                              cots: 0,
                              dietBreakdown: [{ type: "Veg", count: 2 }],
                              phone: "",
                              specialRequests: "",
                              price: "18500",
                            });
                            setAddBookingFormOpen(true);
                          }}
                          style={{
                            flex: 1,
                            backgroundColor: COLORS.bg,
                            borderWidth: 1,
                            borderColor: COLORS.border,
                            borderRadius: 14,
                            padding: 14,
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Calendar size={18} color={COLORS.navy} />
                          <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.navy }}>Add Booking</Text>
                        </Pressable>
                      </View>
                    )}
                  </>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Add Booking Modal Dialog */}
      {addBookingFormOpen && (
        <Modal visible={addBookingFormOpen} animationType="slide">
          <View style={{ flex: 1, backgroundColor: COLORS.white }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
              <Text style={{ fontSize: 17, fontWeight: "800", color: COLORS.navy }}>
                {addBookingForm.editingBookingId ? "Edit Direct Booking" : "Add Direct Booking"}
              </Text>
              <Pressable onPress={() => setAddBookingFormOpen(false)} style={{ padding: 4 }}>
                <X size={20} color={COLORS.muted} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: 18, gap: 14 }}>
              {/* Form Input fields */}
              <View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: COLORS.muted, textTransform: "uppercase" }}>Booking Source</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 10, marginTop: 6, color: COLORS.navy, fontSize: 14 }}
                  value={addBookingForm.source}
                  onChangeText={(val) => updateField("source", val)}
                />
              </View>

              <View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: COLORS.muted, textTransform: "uppercase" }}>Guest Name</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 10, marginTop: 6, color: COLORS.navy, fontSize: 14 }}
                  placeholder="e.g. John Doe"
                  value={addBookingForm.guest}
                  onChangeText={(val) => updateField("guest", val)}
                />
              </View>

              <View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: COLORS.muted, textTransform: "uppercase" }}>Cruise Type</Text>
                <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                  {TRIP_TYPES.map((t) => (
                    <Pressable
                      key={t}
                      onPress={() => updateField("type", t)}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: addBookingForm.type === t ? COLORS.teal : COLORS.border,
                        backgroundColor: addBookingForm.type === t ? COLORS.tealLight : COLORS.white,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: "700", color: addBookingForm.type === t ? COLORS.teal : COLORS.navy }}>{t}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Dates */}
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: COLORS.muted, textTransform: "uppercase" }}>Check-in</Text>
                  <TextInput
                    style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 10, marginTop: 6, color: COLORS.navy, fontSize: 14 }}
                    value={addBookingForm.checkIn}
                    onChangeText={(val) => updateField("checkIn", val)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: COLORS.muted, textTransform: "uppercase" }}>
                    Check-out {addBookingForm.type !== "Overnight Stay" ? "(Locked)" : ""}
                  </Text>
                  <TextInput
                    editable={addBookingForm.type === "Overnight Stay"}
                    style={{
                      borderWidth: 1,
                      borderColor: COLORS.border,
                      borderRadius: 10,
                      padding: 10,
                      marginTop: 6,
                      color: addBookingForm.type === "Overnight Stay" ? COLORS.navy : COLORS.muted,
                      backgroundColor: addBookingForm.type === "Overnight Stay" ? COLORS.white : COLORS.bg,
                      fontSize: 14,
                    }}
                    value={addBookingForm.checkOut}
                    onChangeText={(val) => updateField("checkOut", val)}
                  />
                </View>
              </View>

              {/* Guests */}
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: COLORS.muted, textTransform: "uppercase" }}>Adults (13+)</Text>
                  <TextInput
                    keyboardType="numeric"
                    style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 10, marginTop: 6, color: COLORS.navy, fontSize: 14 }}
                    value={String(addBookingForm.adults)}
                    onChangeText={(val) => updateField("adults", Math.max(0, parseInt(val, 10) || 0))}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: COLORS.muted, textTransform: "uppercase" }}>Children (6-12)</Text>
                  <TextInput
                    keyboardType="numeric"
                    style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 10, marginTop: 6, color: COLORS.navy, fontSize: 14 }}
                    value={String(addBookingForm.children)}
                    onChangeText={(val) => updateField("children", Math.max(0, parseInt(val, 10) || 0))}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: COLORS.muted, textTransform: "uppercase" }}>Kids (0-5)</Text>
                  <TextInput
                    keyboardType="numeric"
                    style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 10, marginTop: 6, color: COLORS.navy, fontSize: 14 }}
                    value={String(addBookingForm.kids)}
                    onChangeText={(val) => updateField("kids", Math.max(0, parseInt(val, 10) || 0))}
                  />
                </View>
              </View>

              {/* Rooms and Cots */}
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: COLORS.muted, textTransform: "uppercase" }}>Rooms</Text>
                  <TextInput
                    keyboardType="numeric"
                    style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 10, marginTop: 6, color: COLORS.navy, fontSize: 14 }}
                    value={String(addBookingForm.rooms)}
                    onChangeText={(val) => updateField("rooms", Math.max(1, parseInt(val, 10) || 1))}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: COLORS.muted, textTransform: "uppercase" }}>Cots</Text>
                  <TextInput
                    keyboardType="numeric"
                    style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 10, marginTop: 6, color: COLORS.navy, fontSize: 14 }}
                    value={String(addBookingForm.cots)}
                    onChangeText={(val) => updateField("cots", Math.max(0, parseInt(val, 10) || 0))}
                  />
                </View>
              </View>

              {/* Diets Breakdown */}
              <View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: COLORS.muted, textTransform: "uppercase", marginBottom: 6 }}>Diet per Guest</Text>
                <View style={{ gap: 8 }}>
                  {addBookingForm.dietBreakdown.map((diet, idx) => (
                    <View key={idx} style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                      <TextInput
                        style={{ flex: 1.5, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 8, color: COLORS.navy, fontSize: 14 }}
                        value={diet.type}
                        placeholder="Type (e.g. Veg)"
                        onChangeText={(val) => updateDiet(idx, "type", val)}
                      />
                      <TextInput
                        keyboardType="numeric"
                        style={{ flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 8, color: COLORS.navy, fontSize: 14 }}
                        value={String(diet.count)}
                        onChangeText={(val) => updateDiet(idx, "count", Math.max(0, parseInt(val, 10) || 0))}
                      />
                      <Pressable onPress={() => removeDietRow(idx)} style={{ padding: 4 }}>
                        <X size={16} color={COLORS.muted} />
                      </Pressable>
                    </View>
                  ))}
                  <Pressable onPress={addDietRow} style={{ marginTop: 4 }}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: COLORS.teal }}>+ Add diet type</Text>
                  </Pressable>
                </View>
              </View>

              <View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: COLORS.muted, textTransform: "uppercase" }}>Contact Phone</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 10, marginTop: 6, color: COLORS.navy, fontSize: 14 }}
                  placeholder="+91 98765 43210"
                  value={addBookingForm.phone}
                  onChangeText={(val) => updateField("phone", val)}
                />
              </View>

              <View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: COLORS.muted, textTransform: "uppercase" }}>Special Requests</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 10, marginTop: 6, color: COLORS.navy, fontSize: 14 }}
                  placeholder="Anniversary cake, separate parking"
                  value={addBookingForm.specialRequests}
                  onChangeText={(val) => updateField("specialRequests", val)}
                />
              </View>

              <View>
                <Text style={{ fontSize: 11, fontWeight: "700", color: COLORS.muted, textTransform: "uppercase" }}>Booking Price (₹)</Text>
                <TextInput
                  keyboardType="numeric"
                  style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 10, marginTop: 6, color: COLORS.navy, fontSize: 14 }}
                  value={addBookingForm.price}
                  onChangeText={(val) => updateField("price", val)}
                />
              </View>

              {/* Submit button */}
              <Pressable
                onPress={handleConfirmDirectBooking}
                style={{
                  backgroundColor: COLORS.teal,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: "center",
                  marginTop: 10,
                  marginBottom: 30,
                }}
              >
                <Text style={{ color: COLORS.white, fontSize: 14, fontWeight: "700" }}>
                  {addBookingForm.editingBookingId ? "Save Changes" : "Confirm Booking"}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </Modal>
      )}

      {/* Modify Bookings List Modal Dialog */}
      {modifyBookingListOpen && (
        <Modal transparent visible={modifyBookingListOpen} animationType="slide">
          <View style={{ flex: 1, backgroundColor: "rgba(15,23,42,0.5)", justifyContent: "flex-end" }}>
            <View style={{ backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, maxHeight: "85%" }}>
              
              {/* Header */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <Text style={{ fontSize: 17, fontWeight: "800", color: COLORS.navy }}>
                  {modifySelectedBookingId ? "Booking Details" : "Modify Booking"}
                </Text>
                <Pressable onPress={() => { setModifyBookingListOpen(false); setModifySelectedBookingId(null); setModifyDeleteConfirmOpen(false); }} style={{ padding: 4 }}>
                  <X size={18} color={COLORS.muted} />
                </Pressable>
              </View>

              {/* Show list of modifiable bookings */}
              {!modifySelectedBookingId && (
                <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 20 }}>
                  {allBookings.filter(b => b.boat === boat && b.isDirect && b.status !== "cancelled" && b.status !== "deleted" && selectedDates.includes(b.date)).map((b) => (
                    <Pressable
                      key={b.id}
                      onPress={() => setModifySelectedBookingId(b.id)}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: COLORS.border,
                        borderRadius: 14,
                        padding: 14,
                      }}
                    >
                      <View>
                        <Text style={{ fontWeight: "700", fontSize: 14, color: COLORS.navy }}>{b.guest}</Text>
                        <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{b.type} · {b.rooms}BH</Text>
                      </View>
                      <ArrowRight size={16} color={COLORS.muted} />
                    </Pressable>
                  ))}
                </ScrollView>
              )}

              {/* Show selected booking details */}
              {modifySelectedBookingId && (() => {
                const selectedBooking = allBookings.find(b => b.id === modifySelectedBookingId);
                if (!selectedBooking) return null;

                if (modifyDeleteConfirmOpen) {
                  return (
                    <View style={{ paddingVertical: 20, alignItems: "center" }}>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.navy, marginBottom: 20, textAlign: "center" }}>
                        Do you confirm the cancellation of this booking?
                      </Text>
                      <View style={{ flexDirection: "row", gap: 10, width: "100%" }}>
                        <Pressable
                          onPress={() => setModifyDeleteConfirmOpen(false)}
                          style={{ flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingVertical: 12, alignItems: "center" }}
                        >
                          <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.navy }}>No</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleConfirmDeleteBooking(selectedBooking.id)}
                          style={{ flex: 1, backgroundColor: COLORS.red, borderRadius: 12, paddingVertical: 12, alignItems: "center" }}
                        >
                          <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.white }}>Yes</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                }

                return (
                  <View>
                    {/* Back arrow */}
                    <Pressable
                      onPress={() => setModifySelectedBookingId(null)}
                      style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 }}
                    >
                      <ArrowLeft size={14} color={COLORS.teal} />
                      <Text style={{ fontSize: 12, fontWeight: "600", color: COLORS.teal }}>Back to list</Text>
                    </Pressable>

                    {/* Details Card */}
                    <View style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 16, marginBottom: 18, gap: 10 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Text style={{ fontWeight: "700", fontSize: 15, color: COLORS.navy }}>{selectedBooking.guest}</Text>
                        <View style={{ backgroundColor: COLORS.tealLight, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                          <Text style={{ fontSize: 10, fontWeight: "700", color: COLORS.navy, textTransform: "uppercase" }}>Direct</Text>
                        </View>
                      </View>

                      {[
                        ["Cruise Type", selectedBooking.type],
                        ["Dates", formatDateRange(selectedBooking.date, selectedBooking.dateEnd)],
                        ["Houseboat", selectedBooking.boat],
                        ["Rooms", `${selectedBooking.rooms}BH`],
                        ["Guests", `${selectedBooking.adults} adults · ${selectedBooking.children} children`],
                        ["Phone", selectedBooking.phone],
                        ["Price", `₹${selectedBooking.price?.toLocaleString("en-IN")}`],
                      ].map(([lbl, val]) => (
                        <View key={lbl} style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 6, borderTopWidth: 1, borderTopColor: COLORS.border }}>
                          <Text style={{ fontSize: 12, color: COLORS.muted }}>{lbl}</Text>
                          <Text style={{ fontSize: 12, fontWeight: "600", color: COLORS.navy, textAlign: "right" }}>{val}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Actions */}
                    <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
                      <Pressable
                        onPress={() => {
                          // Start Edit booking
                          setAddBookingForm({
                            editingBookingId: selectedBooking.id,
                            originalBoat: selectedBooking.boat,
                            source: selectedBooking.bookingSource || "Direct Booking",
                            guest: selectedBooking.guest,
                            boat: selectedBooking.boat,
                            rooms: selectedBooking.rooms,
                            type: selectedBooking.type === "Day cruise" ? "Day Cruise" : selectedBooking.type === "Overnight stay" ? "Overnight Stay" : "Night Stay",
                            checkIn: toISODate(selectedBooking.date),
                            checkOut: toISODate(selectedBooking.dateEnd),
                            adults: selectedBooking.adults,
                            children: selectedBooking.children,
                            kids: selectedBooking.kids ?? 0,
                            cots: selectedBooking.cots ?? 0,
                            dietBreakdown: selectedBooking.dietBreakdown ?? [{ type: "Veg", count: 2 }],
                            phone: selectedBooking.phone,
                            specialRequests: (selectedBooking.specialRequests || []).join(", "),
                            price: String(selectedBooking.price),
                          });
                          setModifyBookingListOpen(false);
                          setAddBookingFormOpen(true);
                        }}
                        style={{
                          flex: 1,
                          borderWidth: 1,
                          borderColor: COLORS.teal,
                          borderRadius: 12,
                          paddingVertical: 12,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: COLORS.teal, fontSize: 13, fontWeight: "700" }}>Edit Booking</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => setModifyDeleteConfirmOpen(true)}
                        style={{
                          flex: 1,
                          backgroundColor: COLORS.red,
                          borderRadius: 12,
                          paddingVertical: 12,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: COLORS.white, fontSize: 13, fontWeight: "700" }}>Delete Booking</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })()}
            </View>
          </View>
        </Modal>
      )}

      {/* Month dropdown list modal overlay */}
      {availabilityMonthPickerOpen && (
        <Modal transparent visible={availabilityMonthPickerOpen} animationType="none" onRequestClose={() => setAvailabilityMonthPickerOpen(false)}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setAvailabilityMonthPickerOpen(false)} />
          <View
            style={{
              position: "absolute",
              top: 154,
              left: 50,
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
                const isBeforeFloor = availabilityMonth.year === MIN_YEAR && i < MIN_MONTH;
                if (isBeforeFloor) return null;
                const isCurrent = availabilityMonth.month === i;
                return (
                  <Pressable
                    key={m}
                    onPress={() => {
                      setAvailabilityMonth((prev) => ({ ...prev, month: i }));
                      setAvailabilityMonthPickerOpen(false);
                      setAvailabilitySelection([]);
                    }}
                    style={{ paddingHorizontal: 16, paddingVertical: 9, backgroundColor: isCurrent ? COLORS.tealLight : "transparent" }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: isCurrent ? "700" : "500", color: isCurrent ? COLORS.teal : COLORS.navy }}>{m}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Modal>
      )}

      {/* Year dropdown list modal overlay */}
      {availabilityYearPickerOpen && (
        <Modal transparent visible={availabilityYearPickerOpen} animationType="none" onRequestClose={() => setAvailabilityYearPickerOpen(false)}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setAvailabilityYearPickerOpen(false)} />
          <View
            style={{
              position: "absolute",
              top: 154,
              left: 180,
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
                const isCurrent = availabilityMonth.year === year;
                return (
                  <Pressable
                    key={year}
                    onPress={() => {
                      setAvailabilityMonth((prev) => {
                        const month = year === MIN_YEAR && prev.month < MIN_MONTH ? MIN_MONTH : prev.month;
                        return { month, year };
                      });
                      setAvailabilityYearPickerOpen(false);
                      setAvailabilitySelection([]);
                    }}
                    style={{ paddingHorizontal: 16, paddingVertical: 9, backgroundColor: isCurrent ? COLORS.tealLight : "transparent" }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: isCurrent ? "700" : "500", color: isCurrent ? COLORS.teal : COLORS.navy }}>{year}</Text>
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
