import { StatusBar } from "expo-status-bar";
import { FontAwesome5 } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookCheck,
  CalendarDays,
  Check,
  LayoutGrid,
  Menu,
  Ship,
  User,
  X,
} from "lucide-react-native";
import {
  LayoutAnimation,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type RouteKey =
  | "dashboard"
  | "boat"
  | "profile"
  | "calendar"
  | "enquiries"
  | "bookings";

type Enquiry = {
  name: string;
  dateLine: string;
  status: "Date locked" | "Confirmed" | "Pending" | "Rejected";
  config: string;
};

type SelectOption = {
  label: string;
  value: string;
};

const navItems: Array<{
  key: RouteKey;
  label: string;
}> = [
  { key: "dashboard", label: "Overview" },
  { key: "calendar", label: "Calendar" },
  { key: "enquiries", label: "Enquiries" },
  { key: "bookings", label: "Bookings" },
];

function BottomNavIcon({
  route,
  active,
}: {
  route: RouteKey;
  active: boolean;
}) {
  const color = active ? "#1a7f7f" : "#6d8299";
  const size = 14;

  if (route === "dashboard") {
    return <LayoutGrid size={size} color={color} strokeWidth={2.2} />;
  }

  if (route === "calendar") {
    return <CalendarDays size={size} color={color} strokeWidth={2.2} />;
  }

  if (route === "enquiries") {
    return <Menu size={size} color={color} strokeWidth={2.2} />;
  }

  if (route === "bookings") {
    return <BookCheck size={size} color={color} strokeWidth={2.2} />;
  }

  return null;
}

const enquiryStatusStyle: Record<
  Enquiry["status"],
  { bg: string; text: string; border: string }
> = {
  "Date locked": { bg: "#fff1d6", text: "#8f6300", border: "#f5d392" },
  Confirmed: { bg: "#dcfce8", text: "#0f7a4f", border: "#9dd8bc" },
  Pending: { bg: "#e6f5f4", text: "#1a7f7f", border: "#9dd8bc" },
  Rejected: { bg: "#ffe5e8", text: "#9f1836", border: "#f3b2c0" },
};

function PageHeader({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.pageHeader}>
      <View style={styles.flex1}>
        <Text style={styles.pageTitle}>{title}</Text>
        <Text style={styles.pageSub}>{sub}</Text>
      </View>
      {children}
    </View>
  );
}

function Card({
  title,
  sub,
  children,
}: {
  title?: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
      {sub ? <Text style={styles.cardSub}>{sub}</Text> : null}
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

function OptionSelect({
  value,
  options,
  onChange,
  disabled,
}: {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  return (
    <Pressable
      onPress={() => {
        if (disabled) {
          return;
        }
        const next = (index + 1) % options.length;
        onChange(options[next].value);
      }}
      style={[
        styles.selectButton,
        disabled ? styles.selectButtonDisabled : null,
      ]}
    >
      <Text
        style={[
          styles.selectButtonText,
          disabled ? styles.selectButtonTextDisabled : null,
        ]}
      >
        {options[index].label}
      </Text>
    </Pressable>
  );
}

function StatusPill({ status }: { status: Enquiry["status"] }) {
  return (
    <View
      style={[
        styles.statusPill,
        {
          backgroundColor: enquiryStatusStyle[status].bg,
          borderColor: enquiryStatusStyle[status].border,
        },
      ]}
    >
      <Text
        style={[
          styles.statusPillText,
          { color: enquiryStatusStyle[status].text },
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

function CruiseTypeIcon({
  type,
  size = "compact",
}: {
  type: "day" | "overnight" | "night";
  size?: "compact" | "regular";
}) {
  const iconProps = {
    size: size === "regular" ? 12 : 7,
  };

  if (type === "day") {
    return (
      <FontAwesome5 name="sun" size={iconProps.size} color={"#1a7f7f"} solid />
    );
  }

  if (type === "overnight") {
    return (
      <FontAwesome5 name="bed" size={iconProps.size} color={"#1a7f7f"} solid />
    );
  }

  return (
    <FontAwesome5 name="moon" size={iconProps.size} color={"#1a7f7f"} solid />
  );
}

function DashboardPage({
  selectedBoat,
  onNavigate,
  onOpenUpcomingCruise,
}: {
  selectedBoat: string;
  onNavigate: (route: RouteKey) => void;
  onOpenUpcomingCruise: (guestName: string) => void;
}) {
  const statsByBoat: Record<
    string,
    Array<{
      label: string;
      value: string;
      caption: string;
      onPress?: () => void;
      isPending?: boolean;
    }>
  > = {
    "Vembanad Crest": [
      {
        label: "Open dates this month",
        value: "18",
        caption: "of 31 days",
        onPress: () => onNavigate("calendar"),
      },
      {
        label: "Pending enquiries",
        value: "3",
        caption: "Awaiting response",
        onPress: () => onNavigate("enquiries"),
        isPending: true,
      },
      {
        label: "Confirmed bookings",
        value: "11",
        caption: "This month",
        onPress: () => onNavigate("bookings"),
      },
      {
        label: "Revenue (month)",
        value: "INR 1.4L",
        caption: "Normal + peak",
      },
    ],
    "Backwater Pearl": [
      {
        label: "Open dates this month",
        value: "22",
        caption: "of 31 days",
        onPress: () => onNavigate("calendar"),
      },
      {
        label: "Pending enquiries",
        value: "1",
        caption: "Awaiting response",
        onPress: () => onNavigate("enquiries"),
        isPending: true,
      },
      {
        label: "Confirmed bookings",
        value: "6",
        caption: "This month",
        onPress: () => onNavigate("bookings"),
      },
      {
        label: "Revenue (month)",
        value: "INR 82k",
        caption: "Normal + peak",
      },
    ],
    "Kerala Dream": [
      {
        label: "Open dates this month",
        value: "14",
        caption: "of 31 days",
        onPress: () => onNavigate("calendar"),
      },
      {
        label: "Pending enquiries",
        value: "4",
        caption: "Awaiting response",
        onPress: () => onNavigate("enquiries"),
        isPending: true,
      },
      {
        label: "Confirmed bookings",
        value: "13",
        caption: "This month",
        onPress: () => onNavigate("bookings"),
      },
      {
        label: "Revenue (month)",
        value: "INR 1.9L",
        caption: "Normal + peak",
      },
    ],
  };

  const cruisesByBoat: Record<string, Enquiry[]> = {
    "Vembanad Crest": [
      {
        name: "Ethan Walker",
        dateLine: "Day cruise · 15 Jan 2025",
        status: "Confirmed",
        config: "Premium · Private · 2 adults",
      },
      {
        name: "Olivia Bennett",
        dateLine: "Overnight stay · 18 Jan 2025",
        status: "Confirmed",
        config: "Luxury · Private · 4 adults",
      },
      {
        name: "Lucas Martin",
        dateLine: "Night stay · 22 Jan 2025",
        status: "Confirmed",
        config: "Premium · Shared · 6 guests",
      },
    ],
    "Backwater Pearl": [
      {
        name: "Mason Reed",
        dateLine: "Day cruise · 12 Jan 2025",
        status: "Confirmed",
        config: "Standard · Private · 3 adults",
      },
      {
        name: "Ava Stone",
        dateLine: "Night stay · 20 Jan 2025",
        status: "Confirmed",
        config: "Premium · Shared · 5 guests",
      },
    ],
    "Kerala Dream": [
      {
        name: "Noah Patel",
        dateLine: "Overnight stay · 16 Jan 2025",
        status: "Confirmed",
        config: "Luxury · Private · 4 adults",
      },
      {
        name: "Liam Carter",
        dateLine: "Day cruise · 23 Jan 2025",
        status: "Confirmed",
        config: "Premium · Private · 2 adults",
      },
    ],
  };

  const upcomingCruises = cruisesByBoat[selectedBoat] ?? cruisesByBoat["Vembanad Crest"];
  const stats = statsByBoat[selectedBoat] ?? statsByBoat["Vembanad Crest"];

  return (
    <ScrollView contentContainerStyle={styles.pageScrollContent}>
      <PageHeader
        title="Overview"
        sub={`Your houseboat performance at a glance · Boat: ${selectedBoat}`}
      />

      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <Pressable
            key={stat.label}
            onPress={stat.onPress}
            disabled={!stat.onPress}
            style={[
              styles.statCard,
              stat.isPending ? styles.statCardPending : null,
            ]}
          >
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statCaption}>{stat.caption}</Text>
          </Pressable>
        ))}
      </View>

      <Card title="Upcoming cruises">
        <View style={styles.verticalGap12}>
          {upcomingCruises.map((cruise) => (
            <Pressable
              key={cruise.name}
              onPress={() => onOpenUpcomingCruise(cruise.name)}
              style={({ pressed }) => [
                styles.listCard,
                pressed ? styles.listCardPressed : null,
              ]}
            >
              <View style={styles.rowBetweenTop}>
                <View style={styles.flex1}>
                  <Text style={styles.listCardTitle}>{cruise.name}</Text>
                  <Text style={styles.listCardSub}>{cruise.dateLine}</Text>
                </View>
                {/* <StatusPill status={cruise.status} /> */}
              </View>
              <Text style={styles.listCardMeta}>{cruise.config}</Text>
            </Pressable>
          ))}
        </View>
      </Card>
    </ScrollView>
  );
}

function BoatAssetPage({ selectedBoat }: { selectedBoat: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [identity, setIdentity] = useState({
    boatName: "Vembanad Crest",
    experienceTier: "Premium",
    bookingType: "Private only",
    maxGuests: 6,
    bedrooms: 2,
    maxGuestsPerRoom: "2 + 1 extra bed",
  });
  const [features, setFeatures] = useState<string[]>([
    "Full upper deck",
    "Sundeck",
  ]);
  const [cruiseTypes, setCruiseTypes] = useState([
    { label: "Day cruise", on: true },
    { label: "Overnight stay", on: true },
    { label: "Night stay", on: false },
  ]);
  const [roomSettings, setRoomSettings] = useState({
    maxGuests: "2 guests",
    extraBed: "Allowed",
    children: "Allowed",
  });

  useEffect(() => {
    setIdentity((current) => ({ ...current, boatName: selectedBoat }));
  }, [selectedBoat]);

  const allStructuralFeatures = [
    "Full upper deck",
    "Partial deck",
    "Sundeck",
    "Balcony",
  ];
  const roomRules: Array<{ label: string; options: string[] }> = [
    { label: "Max guests", options: ["2 guests", "3 guests"] },
    { label: "Extra bed", options: ["Allowed", "Not allowed"] },
    { label: "Children", options: ["Allowed", "Not allowed"] },
  ];

  function toggleFeature(feature: string) {
    setFeatures((current) =>
      current.includes(feature)
        ? current.filter((item) => item !== feature)
        : [...current, feature],
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.pageScrollContent}>
      <PageHeader
        title="Boat asset definition"
        sub={`These details are permanent truths about your boat. They drive all matching logic. · Boat: ${selectedBoat}`}
      >
        <View style={styles.rowGap8}>
          {isEditing ? (
            <>
              <Pressable
                onPress={() => setIsEditing(false)}
                style={styles.outlineButton}
              >
                <Text style={styles.outlineButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => setIsEditing(false)}
                style={styles.softBlueButton}
              >
                <Text style={styles.softBlueButtonText}>Save</Text>
              </Pressable>
            </>
          ) : (
            null
            // <Pressable
            //   onPress={() => setIsEditing(true)}
            //   style={styles.softBlueButton}
            // >
            //   <Text style={styles.softBlueButtonText}>Edit</Text>
            // </Pressable>
          )}
        </View>
      </PageHeader>

      <Card title="Identity & classification">
        <View style={styles.verticalGap10}>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Boat name</Text>
            {isEditing ? (
              <TextInput
                value={identity.boatName}
                onChangeText={(text) =>
                  setIdentity((current) => ({ ...current, boatName: text }))
                }
                style={styles.input}
              />
            ) : (
              <Text style={styles.metaValue}>{identity.boatName}</Text>
            )}
          </View>

          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Experience tier</Text>
            {isEditing ? (
              <OptionSelect
                value={identity.experienceTier}
                onChange={(value) =>
                  setIdentity((current) => ({
                    ...current,
                    experienceTier: value,
                  }))
                }
                options={[
                  { label: "Premium", value: "Premium" },
                  { label: "Luxury", value: "Luxury" },
                  { label: "Standard", value: "Standard" },
                ]}
              />
            ) : (
              <Text style={styles.metaValue}>{identity.experienceTier}</Text>
            )}
          </View>

          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Booking type</Text>
            {isEditing ? (
              <OptionSelect
                value={identity.bookingType}
                onChange={(value) =>
                  setIdentity((current) => ({ ...current, bookingType: value }))
                }
                options={[
                  { label: "Private only", value: "Private only" },
                  { label: "Shared", value: "Shared" },
                  { label: "Private + shared", value: "Private + shared" },
                ]}
              />
            ) : (
              <Text style={styles.metaValue}>{identity.bookingType}</Text>
            )}
          </View>

          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Max guests</Text>
            {isEditing ? (
              <TextInput
                value={String(identity.maxGuests)}
                keyboardType="numeric"
                onChangeText={(value) =>
                  setIdentity((current) => ({
                    ...current,
                    maxGuests: Number(value) || 0,
                  }))
                }
                style={styles.input}
              />
            ) : (
              <Text style={styles.metaValue}>{identity.maxGuests} persons</Text>
            )}
          </View>

          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Bedrooms</Text>
            {isEditing ? (
              <TextInput
                value={String(identity.bedrooms)}
                keyboardType="numeric"
                onChangeText={(value) =>
                  setIdentity((current) => ({
                    ...current,
                    bedrooms: Number(value) || 0,
                  }))
                }
                style={styles.input}
              />
            ) : (
              <Text style={styles.metaValue}>{identity.bedrooms} bedrooms</Text>
            )}
          </View>

          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Max guests per room</Text>
            {isEditing ? (
              <TextInput
                value={identity.maxGuestsPerRoom}
                onChangeText={(value) =>
                  setIdentity((current) => ({
                    ...current,
                    maxGuestsPerRoom: value,
                  }))
                }
                style={styles.input}
              />
            ) : (
              <Text style={styles.metaValue}>{identity.maxGuestsPerRoom}</Text>
            )}
          </View>
        </View>
      </Card>

      <Card title="Structural features">
        {isEditing ? (
          <View style={styles.verticalGap8}>
            {allStructuralFeatures.map((feature) => {
              const enabled = features.includes(feature);

              return (
                <Pressable
                  key={feature}
                  style={styles.featureRow}
                  onPress={() => toggleFeature(feature)}
                >
                  <Text style={styles.featureRowText}>{feature}</Text>
                  <Switch
                    value={enabled}
                    onValueChange={() => toggleFeature(feature)}
                  />
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.pillWrap}>
            {allStructuralFeatures.map((feature) => {
              const enabled = features.includes(feature);

              return (
                <View
                  key={feature}
                  style={[
                    styles.featurePill,
                    enabled
                      ? styles.featurePillEnabled
                      : styles.featurePillDisabled,
                  ]}
                >
                  <Text
                    style={
                      enabled
                        ? styles.featurePillEnabledText
                        : styles.featurePillDisabledText
                    }
                  >
                    {feature}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </Card>

      <Card
        title="Supported cruise types"
        sub="Only enable cruise types you are fully equipped to deliver."
      >
        {isEditing ? (
          <View style={styles.verticalGap8}>
            {cruiseTypes.map((type) => (
              <View key={type.label} style={styles.featureRow}>
                <Text style={styles.featureRowText}>{type.label}</Text>
                <Switch
                  value={type.on}
                  onValueChange={(value) =>
                    setCruiseTypes((current) =>
                      current.map((item) =>
                        item.label === type.label
                          ? { ...item, on: value }
                          : item,
                      ),
                    )
                  }
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.pillWrap}>
            {cruiseTypes.map((type) => (
              <View
                key={type.label}
                style={[
                  styles.featurePill,
                  type.on
                    ? styles.cruisePillEnabled
                    : styles.cruisePillDisabled,
                ]}
              >
                <Text
                  style={
                    type.on
                      ? styles.cruisePillEnabledText
                      : styles.cruisePillDisabledText
                  }
                >
                  {type.label}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      <Card title="Room layout rules">
        <View style={styles.innerPanel}>
          <Text style={styles.innerPanelTitle}>Room 1</Text>
          <View style={styles.verticalGap10}>
            {roomRules.map(({ label, options }) => {
              const selectedValue =
                label === "Max guests"
                  ? roomSettings.maxGuests
                  : label === "Extra bed"
                    ? roomSettings.extraBed
                    : roomSettings.children;

              return (
                <View key={label}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <OptionSelect
                    value={selectedValue}
                    disabled={!isEditing}
                    onChange={(value) => {
                      setRoomSettings((current) => {
                        if (label === "Max guests") {
                          return { ...current, maxGuests: value };
                        }
                        if (label === "Extra bed") {
                          return { ...current, extraBed: value };
                        }

                        return { ...current, children: value };
                      });
                    }}
                    options={options.map((option) => ({
                      label: option,
                      value: option,
                    }))}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

function CalendarPage({ selectedBoat }: { selectedBoat: string }) {
  type DayBooking = {
    dayCruise: boolean;
    overnightCruise: boolean;
    nightCruise: boolean;
    details: string;
    dayCruisePrice?: number;
    overnightCruisePrice?: number;
    nightCruisePrice?: number;
  };

  type SelectedDate = {
    year: number;
    month: number;
    day: number;
  };

  function normalizeBooking(booking: DayBooking): DayBooking {
    if (booking.overnightCruise && booking.nightCruise) {
      return {
        ...booking,
        nightCruise: false,
      };
    }

    return booking;
  }

  function getDateKey(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

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

  const calendarDays = useMemo(() => {
    const blanks = Array.from(
      { length: firstDayWeekIndex },
      () => null as number | null,
    );
    const monthDays = Array.from(
      { length: daysInVisibleMonth },
      (_, index) => index + 1,
    );
    return [...blanks, ...monthDays];
  }, [firstDayWeekIndex, daysInVisibleMonth]);

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

  const availabilityToggles: Array<{
    label: string;
    enabled: boolean;
    key: "dayCruise" | "overnightCruise" | "nightCruise";
  }> = [
    {
      label: "Day cruise",
      enabled: selectedBooking.dayCruise,
      key: "dayCruise",
    },
    {
      label: "Overnight stay",
      enabled: selectedBooking.overnightCruise,
      key: "overnightCruise",
    },
    {
      label: "Night stay",
      enabled: selectedBooking.nightCruise,
      key: "nightCruise",
    },
  ];

  function updateSelectedDayAvailability(
    key: "dayCruise" | "overnightCruise" | "nightCruise",
    value: boolean,
  ) {
    if (!selectedDate) {
      return;
    }

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

      const nextBooking: DayBooking = {
        ...currentDayBooking,
        [key]: value,
      };

      if (value && key === "overnightCruise") {
        nextBooking.nightCruise = false;
      }
      if (value && key === "nightCruise") {
        nextBooking.overnightCruise = false;
      }

      return {
        ...current,
        [selectedDateKey]: normalizeBooking(nextBooking),
      };
    });
  }

  function handleDayPress(day: number) {
    if (isBulkPricingMode) {
      setSelectedDates((current) =>
        current.includes(day)
          ? current.filter((item) => item !== day)
          : [...current, day],
      );
      return;
    }

    const dateKey = getDateKey(visibleYear, visibleMonthIndex, day);
    const existingBooking = bookingsByDate[dateKey];
    setModalDayCruisePrice(
      existingBooking?.dayCruisePrice
        ? String(existingBooking.dayCruisePrice)
        : "",
    );
    setModalOvernightPrice(
      existingBooking?.overnightCruisePrice
        ? String(existingBooking.overnightCruisePrice)
        : "",
    );
    setModalNightPrice(
      existingBooking?.nightCruisePrice
        ? String(existingBooking.nightCruisePrice)
        : "",
    );
    setSelectedDate({
      year: visibleYear,
      month: visibleMonthIndex,
      day,
    });
  }

  function handleDayLongPress(day: number) {
    setSelectedDate(null);
    setIsBulkPricingMode(true);
    setSelectedDates((current) =>
      current.includes(day) ? current : [...current, day],
    );
  }

  function applyPriceToSelectedDates() {
    const parsedDayCruise = bulkDayCruisePrice
      ? Number(bulkDayCruisePrice)
      : undefined;
    const parsedOvernight = bulkOvernightPrice
      ? Number(bulkOvernightPrice)
      : undefined;
    const parsedNight = bulkNightPrice ? Number(bulkNightPrice) : undefined;

    const hasAnyPrice =
      (parsedDayCruise && parsedDayCruise > 0) ||
      (parsedOvernight && parsedOvernight > 0) ||
      (parsedNight && parsedNight > 0);

    if (!hasAnyPrice || selectedDates.length === 0) {
      return;
    }

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
          ...(parsedDayCruise && parsedDayCruise > 0
            ? { dayCruisePrice: parsedDayCruise }
            : {}),
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

        <Card title="">
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
                                  ? `${Math.round(booking.dayCruisePrice / 1000)}k`
                                  : "—"}
                              </Text>
                              {booking.dayCruise ? (
                                <Check
                                  size={6}
                                  color="#0f7a4f"
                                  strokeWidth={3}
                                />
                              ) : (
                                <View style={styles.dayCellTickPlaceholder} />
                              )}
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
                                  ? `${Math.round(booking.overnightCruisePrice / 1000)}k`
                                  : "—"}
                              </Text>
                              {booking.overnightCruise ? (
                                <Check
                                  size={6}
                                  color="#0f7a4f"
                                  strokeWidth={3}
                                />
                              ) : (
                                <View style={styles.dayCellTickPlaceholder} />
                              )}
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
                                  ? `${Math.round(booking.nightCruisePrice / 1000)}k`
                                  : "—"}
                              </Text>
                              {booking.nightCruise ? (
                                <Check
                                  size={6}
                                  color="#0f7a4f"
                                  strokeWidth={3}
                                />
                              ) : (
                                <View style={styles.dayCellTickPlaceholder} />
                              )}
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
        </Card>
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
                  onChangeText={(value) =>
                    setBulkDayCruisePrice(value.replace(/[^0-9]/g, ""))
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
                  onChangeText={(value) =>
                    setBulkOvernightPrice(value.replace(/[^0-9]/g, ""))
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
                  onChangeText={(value) =>
                    setBulkNightPrice(value.replace(/[^0-9]/g, ""))
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
              {`${selectedDate.day} ${new Date(
                selectedDate.year,
                selectedDate.month,
                selectedDate.day,
              ).toLocaleString("en-US", {
                month: "short",
                year: "numeric",
              })}`}
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
                  onChangeText={(value) =>
                    setModalDayCruisePrice(value.replace(/[^0-9]/g, ""))
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
                onValueChange={(value) =>
                  updateSelectedDayAvailability("dayCruise", value)
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
                  onChangeText={(value) =>
                    setModalOvernightPrice(value.replace(/[^0-9]/g, ""))
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
                onValueChange={(value) =>
                  updateSelectedDayAvailability("overnightCruise", value)
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
                  onChangeText={(value) =>
                    setModalNightPrice(value.replace(/[^0-9]/g, ""))
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
                onValueChange={(value) =>
                  updateSelectedDayAvailability("nightCruise", value)
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
                const parsedDayCruise = modalDayCruisePrice
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
                      dayCruisePrice: parsedDayCruise,
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

function EnquiriesPage({ selectedBoat }: { selectedBoat: string }) {
  const [activeTab, setActiveTab] = useState<"pending" | "history">(
    "pending",
  );

  const cards: Array<
    Enquiry & {
      boatName: string;
      subtitle: string;
      details: string;
      request?: string;
      outcome?: "accepted" | "rejected";
      actedOn?: string;
    }
  > = [
    {
      name: "Ethan Walker",
      boatName: "Vembanad Crest",
      dateLine: "Received 2 hrs ago - Date held until 6 PM today",
      subtitle: "Day cruise · 15 Jan 2025",
      status: "Date locked",
      config: "Price shown to guest: INR 12,500",
      details:
        "Premium · Private · 2 adults, 0 children · 1 room · 2 guests per room · No extra bed",
      request:
        "Special request: Vegetarian meals preferred. Celebrating anniversary.",
    },
    {
      name: "Emma Collins",
      boatName: "Kerala Dream",
      dateLine: "Received yesterday - Overnight stay · 22 Jan",
      subtitle: "Overnight stay · 22 Jan 2025",
      status: "Pending",
      config: "Price shown to guest: INR 21,000",
      details:
        "Premium · Private · 4 adults, 1 child · 2 rooms · Room 1: 2 guests · Room 2: 2 guests + 1 extra bed",
    },
    {
      name: "Sofia Turner",
      boatName: "Vembanad Crest",
      dateLine: "Handled 3 days ago - Day cruise · 10 Jan",
      subtitle: "Day cruise · 10 Jan 2025",
      status: "Confirmed",
      config: "Final booking value: INR 13,000",
      details:
        "Deluxe · Private · 2 adults, 1 child · 1 room · Extra bed included",
      outcome: "accepted",
      actedOn: "Accepted by admin on 08 Jan, 4:42 PM",
    },
    {
      name: "Noah Parker",
      boatName: "Backwater Pearl",
      dateLine: "Handled 4 days ago - Night cruise · 09 Jan",
      subtitle: "Night cruise · 09 Jan 2025",
      status: "Rejected",
      config: "Quoted value: INR 18,500",
      details: "Premium · Shared · 3 adults · 2 rooms",
      outcome: "rejected",
      actedOn: "Rejected by admin on 07 Jan, 6:10 PM",
    },
  ];

  const pendingCards = cards.filter(
    (card) => !card.outcome && card.boatName === selectedBoat,
  );
  const historyCards = cards.filter(
    (card) => card.outcome && card.boatName === selectedBoat,
  );
  const visibleCards = activeTab === "pending" ? pendingCards : historyCards;

  const swipeResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 18 && Math.abs(gesture.dx) > Math.abs(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < -48) {
          setActiveTab("history");
          return;
        }
        if (gesture.dx > 48) {
          setActiveTab("pending");
        }
      },
    }),
  ).current;

  return (
    <ScrollView
      contentContainerStyle={styles.pageScrollContent}
      {...swipeResponder.panHandlers}
    >
      <PageHeader
        title="Enquiries"
        sub={`Temporary date locks are active. Respond to avoid automatic expiry. · Boat: ${selectedBoat}`}
      />

      <View style={styles.enquiryTabRow}>
        <Pressable
          onPress={() => setActiveTab("pending")}
          style={[
            styles.enquiryTabButton,
            activeTab === "pending" ? styles.enquiryTabButtonActive : null,
          ]}
        >
          <Text
            style={[
              styles.enquiryTabText,
              activeTab === "pending" ? styles.enquiryTabTextActive : null,
            ]}
          >
            Pending enquiries
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("history")}
          style={[
            styles.enquiryTabButton,
            activeTab === "history" ? styles.enquiryTabButtonActive : null,
          ]}
        >
          <Text
            style={[
              styles.enquiryTabText,
              activeTab === "history" ? styles.enquiryTabTextActive : null,
            ]}
          >
            History
          </Text>
        </Pressable>
      </View>

      {visibleCards.map((card) => (
        <Card key={card.name} title={card.name} sub={card.dateLine}>
          <View style={styles.inlineWrapRow}>
            <StatusPill status={card.status} />
            <Text style={styles.inlineMuted}>{card.subtitle}</Text>
          </View>
          <Text style={styles.detailText}>{card.details}</Text>
          <Text style={styles.detailStrong}>{card.config}</Text>
          {card.request ? (
            <Text style={styles.detailMuted}>{card.request}</Text>
          ) : null}
          {activeTab === "pending" ? (
            <View style={styles.buttonRowBetween}>
              <Pressable style={styles.declineButton}>
                <Text style={styles.actionButtonText}>Decline</Text>
              </Pressable>
              <Pressable style={styles.acceptButton}>
                <Text style={styles.actionButtonText}>Accept booking</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={styles.detailMuted}>{card.actedOn}</Text>
          )}
        </Card>
      ))}

      {visibleCards.length === 0 ? (
        <Card title="No enquiries">
          <Text style={styles.detailMuted}>
            {activeTab === "pending"
              ? "There are no pending enquiries right now."
              : "Accepted and rejected enquiries will appear here."}
          </Text>
        </Card>
      ) : null}
    </ScrollView>
  );
}

type BookingRecord = {
  id: string;
  guestName: string;
  boatName: string;
  bookingId: string;
  details: Array<[string, string]>;
  notes: string;
};

function BookingsPage({
  selectedBoat,
  focusGuest,
  focusToken,
}: {
  selectedBoat: string;
  focusGuest?: string;
  focusToken?: number;
}) {
  const [expandedBookings, setExpandedBookings] = useState<Set<string>>(
    new Set()
  );
  const scrollRef = useRef<ScrollView>(null);
  const bookingYById = useRef<Record<string, number>>({});

  const bookings: BookingRecord[] = [
    {
      id: "booking-1",
      guestName: "Ethan Walker",
      boatName: "Vembanad Crest",
      bookingId: "#SC-2025-0041",
      details: [
        ["Cruise type", "Day cruise"],
        ["Date & time", "15 Jan 2025 · 11:00 AM - 5:00 PM"],
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
        ["Date & time", "18 Jan 2025 · 3:00 PM - Next day 11:00 AM"],
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
        ["Date & time", "21 Jan 2025 · 10:00 AM - 4:00 PM"],
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
        ["Date & time", "27 Jan 2025 · 4:00 PM - Next day 10:00 AM"],
        ["Configuration", "4 adults · 2 rooms · Private · Luxury"],
        ["Total agreed price", "INR 31,500"],
        ["Inclusions", "All meals, deck dinner, sunrise cruise"],
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
        ["Date & time", "12 Jan 2025 · 10:30 AM - 4:30 PM"],
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
        ["Date & time", "20 Jan 2025 · 6:00 PM - 10:00 PM"],
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
        ["Date & time", "16 Jan 2025 · 3:00 PM - Next day 11:00 AM"],
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
        ["Date & time", "23 Jan 2025 · 11:00 AM - 5:00 PM"],
        ["Configuration", "2 adults · 1 room · Private · Premium"],
        ["Total agreed price", "INR 12,500"],
      ],
      notes: "Anniversary day trip with decoration and photo-stop included.",
    },
  ];

  const visibleBookings = bookings.filter(
    (booking) => booking.boatName === selectedBoat,
  );

  const toggleBooking = (bookingId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newExpanded = new Set(expandedBookings);
    if (newExpanded.has(bookingId)) {
      newExpanded.delete(bookingId);
    } else {
      newExpanded.add(bookingId);
    }
    setExpandedBookings(newExpanded);
  };

  useEffect(() => {
    if (!focusGuest) {
      return;
    }

    const targetBooking = visibleBookings.find(
      (booking) =>
        booking.guestName.toLowerCase() === focusGuest.toLowerCase(),
    );

    if (!targetBooking) {
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedBookings((current) => {
      if (current.has(targetBooking.id)) {
        return current;
      }
      const next = new Set(current);
      next.add(targetBooking.id);
      return next;
    });

    requestAnimationFrame(() => {
      const targetY = bookingYById.current[targetBooking.id];
      if (typeof targetY === "number") {
        scrollRef.current?.scrollTo({
          y: Math.max(0, targetY - 90),
          animated: true,
        });
      }
    });
  }, [focusGuest, focusToken, visibleBookings]);

  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={styles.pageScrollContent}
    >
      <PageHeader
        title="Bookings"
        sub={`Track accepted bookings with complete trip details and guest preferences. · Boat: ${selectedBoat}`}
      />

      <View style={styles.verticalGap12}>
        {visibleBookings.map((booking) => {
          const isExpanded = expandedBookings.has(booking.id);
          return (
            <Pressable
              key={booking.id}
              onPress={() => toggleBooking(booking.id)}
              onLayout={(event) => {
                bookingYById.current[booking.id] = event.nativeEvent.layout.y;
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
        {visibleBookings.length === 0 ? (
          <Card title="No bookings">
            <Text style={styles.detailMuted}>
              No confirmed bookings found for {selectedBoat}.
            </Text>
          </Card>
        ) : null}
      </View>
    </ScrollView>
  );
}

function ProfilePage({
  user,
  boats,
}: {
  user: { name: string; phone: string; email: string };
  boats: string[];
}) {
  return (
    <ScrollView contentContainerStyle={styles.pageScrollContent}>
      <PageHeader
        title="Profile"
        sub="View user details and registered boat list."
      />

      <Card title="User details">
        <View style={styles.verticalGap10}>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Name</Text>
            <Text style={styles.metaValue}>{user.name}</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Phone number</Text>
            <Text style={styles.metaValue}>{user.phone}</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Email</Text>
            <Text style={styles.metaValue}>{user.email}</Text>
          </View>
        </View>
      </Card>

      <Card title="Boat list">
        <View style={styles.verticalGap8}>
          {boats.map((boat) => (
            <View key={boat} style={styles.profileBoatRow}>
              <Ship size={13} color="#0c5eac" strokeWidth={2.2} />
              <Text style={styles.profileBoatText}>{boat}</Text>
            </View>
          ))}
        </View>
      </Card>
    </ScrollView>
  );
}

function AppLayout() {
  const [activeRoute, setActiveRoute] = useState<RouteKey>("dashboard");
  const [selectedBoat, setSelectedBoat] = useState<string>("Vembanad Crest");
  const [boatDropdownOpen, setBoatDropdownOpen] = useState<boolean>(false);
  const [bookingFocus, setBookingFocus] = useState<{
    guestName: string;
    token: number;
  } | null>(null);

  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const boats = ["Vembanad Crest", "Backwater Pearl", "Kerala Dream"];
  const userProfile = {
    name: "Ethan Walker",
    phone: "+1 415 555 0134",
    email: "ethan.walker@sailcept.com",
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.appRoot}>
        {boatDropdownOpen ? (
          <Pressable
            onPress={() => setBoatDropdownOpen(false)}
            style={styles.dropdownBackdrop}
            testID="boat-dropdown-backdrop"
          />
        ) : null}
        <View style={styles.mobileTopBar}>
          <Pressable
            style={styles.brandRow}
            onPress={() => setActiveRoute("dashboard")}
          >
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>≈</Text>
            </View>
            <View>
              <Text style={styles.brandOverline}>Sailcept</Text>
              <Text style={styles.brandTitle}>Admin</Text>
            </View>
          </Pressable>

          <View style={styles.headerRightSection}>
            <View style={styles.boatSwitcherWrapper}>
              <Pressable
                onPress={() => setBoatDropdownOpen(!boatDropdownOpen)}
                style={[
                  styles.profileChip,
                  styles.boatSwitcherChip,
                ]}
                testID="boat-selector-trigger"
              >
                <Text
                  style={[styles.profileChipText, styles.boatSwitcherChipText]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedBoat}
                </Text>
                <Text style={styles.dropdownArrow}>
                  {boatDropdownOpen ? "▲" : "▼"}
                </Text>
              </Pressable>

              {boatDropdownOpen && (
                <View style={styles.boatDropdown}>
                  {boats.map((boat) => (
                    <Pressable
                      key={boat}
                      testID={`boat-option-${boat.replace(/\s+/g, "-").toLowerCase()}`}
                      onPress={() => {
                        setSelectedBoat(boat);
                        setBoatDropdownOpen(false);
                      }}
                      style={[
                        styles.boatDropdownItem,
                        selectedBoat === boat
                          ? styles.boatDropdownItemActive
                          : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.boatDropdownItemText,
                          selectedBoat === boat
                            ? styles.boatDropdownItemTextActive
                            : null,
                        ]}
                      >
                        {boat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <Pressable
              onPress={() => {
                setBoatDropdownOpen(false);
                setActiveRoute("boat");
              }}
              style={[
                styles.profileChip,
                activeRoute === "boat" ? styles.profileChipActive : null,
              ]}
              testID="header-boat-button"
            >
              <Ship
                size={12}
                color={activeRoute === "boat" ? "#0c5eac" : "#5d7089"}
              />
            </Pressable>

            <Pressable
              onPress={() => {
                setBoatDropdownOpen(false);
                setActiveRoute("profile");
              }}
              style={[
                styles.profileChip,
                activeRoute === "profile" ? styles.profileChipActive : null,
              ]}
              testID="header-profile-button"
            >
              <User
                size={12}
                color={activeRoute === "profile" ? "#0c5eac" : "#5d7089"}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.mainArea}>
          {activeRoute === "dashboard" ? (
            <DashboardPage
              selectedBoat={selectedBoat}
              onNavigate={setActiveRoute}
              onOpenUpcomingCruise={(guestName) => {
                setBoatDropdownOpen(false);
                setBookingFocus({ guestName, token: Date.now() });
                setActiveRoute("bookings");
              }}
            />
          ) : null}
          {activeRoute === "boat" ? <BoatAssetPage selectedBoat={selectedBoat} /> : null}
          {activeRoute === "profile" ? (
            <ProfilePage user={userProfile} boats={boats} />
          ) : null}
          {activeRoute === "calendar" ? <CalendarPage selectedBoat={selectedBoat} /> : null}
          {activeRoute === "enquiries" ? <EnquiriesPage selectedBoat={selectedBoat} /> : null}
          {activeRoute === "bookings" ? (
            <BookingsPage
              selectedBoat={selectedBoat}
              focusGuest={bookingFocus?.guestName}
              focusToken={bookingFocus?.token}
            />
          ) : null}
        </View>

        <View style={styles.bottomNavShell}>
          <View style={styles.bottomNavRow}>
            {navItems.map((item) => {
              const isActive = activeRoute === item.key;

              return (
                <Pressable
                  key={item.key}
                  onPress={() => {
                    setBoatDropdownOpen(false);
                    setActiveRoute(item.key);
                  }}
                  style={[
                    styles.bottomNavItem,
                    isActive ? styles.bottomNavItemActive : null,
                  ]}
                >
                  <View style={styles.bottomNavIcon}>
                    <BottomNavIcon route={item.key} active={isActive} />
                  </View>
                  <Text
                    style={[
                      styles.bottomNavLabel,
                      isActive ? styles.bottomNavLabelActive : null,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default AppLayout;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#faf6f1",
  },
  appRoot: {
    flex: 1,
    backgroundColor: "#f5f1edff",
  },
  dropdownBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9,
  },
  mobileTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "#faf6f1f2",
    borderBottomWidth: 1,
    borderBottomColor: "#cde3db",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoBox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a7f7f",
  },
  logoText: {
    color: "#faf6f1",
    fontSize: 20,
    lineHeight: 22,
    fontWeight: "800",
  },
  brandOverline: {
    color: "#8193ac",
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  brandTitle: {
    color: "#0f274d",
    fontWeight: "700",
    fontSize: 14,
  },
  profileChip: {
    borderWidth: 1,
    borderColor: "#bfd5cc",
    backgroundColor: "#faf6f1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  profileChipActive: {
    borderColor: "#4a9f9f",
    backgroundColor: "#e6f5f4",
  },
  profileChipText: {
    fontSize: 12,
    color: "#5d7089",
    fontWeight: "600",
  },
  profileChipTextActive: {
    color: "#1a7f7f",
  },
  headerRightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  boatSwitcherWrapper: {
    position: "relative",
  },
  boatSwitcherChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: 176,
  },
  boatSwitcherChipText: {
    maxWidth: 132,
  },
  dropdownArrow: {
    fontSize: 10,
    color: "#5d7089",
  },
  boatDropdown: {
    position: "absolute",
    top: 38,
    right: 0,
    backgroundColor: "#faf6f1",
    borderWidth: 1,
    borderColor: "#bfd5cc",
    borderRadius: 8,
    zIndex: 100,
    minWidth: 160,
    shadowColor: "#1a7f7f",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  boatDropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e8ebe9",
  },
  boatDropdownItemActive: {
    backgroundColor: "#e6f5f4",
  },
  boatDropdownItemText: {
    fontSize: 13,
    color: "#5d7089",
    fontWeight: "500",
  },
  boatDropdownItemTextActive: {
    color: "#1a7f7f",
    fontWeight: "600",
  },
  mainArea: {
    flex: 1,
    paddingTop: 66,
  },
  pageScrollContent: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    paddingBottom: 110,
    gap: 12,
  },
  pageHeader: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
  },
  pageTitle: {
    color: "#0f284e",
    fontSize: 26,
    fontWeight: "700",
  },
  pageSub: {
    color: "#60748e",
    fontSize: 13,
    marginTop: 2,
  },
  card: {
    borderWidth: 1,
    borderColor: "#cde3db",
    backgroundColor: "#faf6f1ee",
    borderRadius: 16,
    padding: 14,
  },
  cardTitle: {
    color: "#102949",
    fontSize: 15,
    fontWeight: "700",
  },
  cardSub: {
    color: "#6b8099",
    fontSize: 12,
    marginTop: 3,
  },
  cardBody: {
    marginTop: 10,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    width: "48%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#cde3db",
    backgroundColor: "#faf6f1ee",
    padding: 12,
  },
  statLabel: {
    color: "#697b93",
    fontSize: 11,
  },
  statValue: {
    color: "#102949",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 6,
  },
  statCaption: {
    color: "#8ea0b6",
    fontSize: 11,
  },
  statCardPending: {
    borderColor: "#fca5a5",
    backgroundColor: "#ffe8e8",
  },

  listCard: {
    borderWidth: 1,
    borderColor: "#cde3db",
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  listCardPressed: {
    opacity: 0.82,
    borderColor: "#4a9f9f",
  },
  rowBetweenTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  listCardTitle: {
    color: "#0f2748",
    fontWeight: "600",
    fontSize: 14,
  },
  listCardSub: {
    color: "#64788f",
    fontSize: 12,
    marginTop: 2,
  },
  listCardMeta: {
    color: "#546b86",
    fontSize: 13,
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "600",
  },
  bookingSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  expandIcon: {
    fontSize: 12,
    color: "#6a7f97",
    fontWeight: "600",
  },
  bookingDetailsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e8ebe9",
  },
  expandableBookingCard: {
    marginBottom: 0,
  },
  rowGap8: {
    flexDirection: "row",
    gap: 8,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#bfd5cc",
    borderRadius: 8,
    backgroundColor: "#faf6f1",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  outlineButtonText: {
    color: "#5d7289",
    fontSize: 12,
    fontWeight: "600",
  },
  softBlueButton: {
    borderWidth: 1,
    borderColor: "#4a9f9f",
    borderRadius: 8,
    backgroundColor: "#e6f5f4",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  softBlueButtonText: {
    color: "#1a7f7f",
    fontSize: 12,
    fontWeight: "600",
  },
  verticalGap10: {
    gap: 10,
  },
  verticalGap8: {
    gap: 8,
  },
  metaBox: {
    borderWidth: 1,
    borderColor: "#cde3db",
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#f5f2ed",
  },
  metaLabel: {
    color: "#6a7f97",
    fontSize: 11,
  },
  metaValue: {
    color: "#0f284d",
    fontSize: 14,
    marginTop: 4,
    fontWeight: "500",
  },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#bfd5cc",
    borderRadius: 9,
    backgroundColor: "#faf6f1",
    color: "#102949",
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  selectButton: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#bfd5cc",
    borderRadius: 9,
    backgroundColor: "#faf6f1",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  selectButtonDisabled: {
    backgroundColor: "#ebe8e3",
  },
  selectButtonText: {
    color: "#13345a",
    fontSize: 13,
    fontWeight: "500",
  },
  selectButtonTextDisabled: {
    color: "#7d8fa4",
  },
  featureRow: {
    borderWidth: 1,
    borderColor: "#cde3db",
    borderRadius: 10,
    backgroundColor: "#faf6f1",
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  featureRowText: {
    color: "#234058",
    fontSize: 13,
  },
  pillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  featurePill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  featurePillEnabled: {
    borderColor: "#4a9f9f",
    backgroundColor: "#e6f5f4",
  },
  featurePillDisabled: {
    borderColor: "#bfd5cc",
    backgroundColor: "#eff4f9",
  },
  featurePillEnabledText: {
    color: "#1a7f7f",
    fontSize: 11,
    fontWeight: "600",
  },
  featurePillDisabledText: {
    color: "#6f8195",
    fontSize: 11,
    fontWeight: "600",
  },
  cruisePillEnabled: {
    borderColor: "#9dd8bc",
    backgroundColor: "#dcfce8",
  },
  cruisePillDisabled: {
    borderColor: "#bfd5cc",
    backgroundColor: "#eff4f9",
  },
  cruisePillEnabledText: {
    color: "#0f7a4f",
    fontSize: 11,
    fontWeight: "600",
  },
  cruisePillDisabledText: {
    color: "#6f8195",
    fontSize: 11,
    fontWeight: "600",
  },
  innerPanel: {
    borderWidth: 1,
    borderColor: "#cde3db",
    borderRadius: 12,
    padding: 10,
  },
  innerPanelTitle: {
    color: "#102949",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  fieldLabel: {
    color: "#6a7f97",
    fontSize: 11,
  },
  calendarGrid: {
    gap: 4,
    flex: 1,
  },
  calendarWeekRow: {
    flexDirection: "row",
    gap: 4,
    flex: 1,
  },
  dayCell: {
    flex: 1,
    flexBasis: 0,
    minHeight: 64,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 3,
    alignItems: "center",
    justifyContent: "flex-start",
    borderWidth: 1,
  },
  dayCellFull: {
    backgroundColor: "#ffe5e5",//light red
    borderColor: "#ffcccc",//light red
  },
  dayCellPartial: {
    backgroundColor: "#fff1d6",
    borderColor: "#f5d392",
  },
  dayCellEmpty: {
    backgroundColor: "#dbf8ea",
    borderColor: "#9dd8bc",
  },
  dayCellSelected: {
    borderColor: "#1a7f7f",
    borderWidth: 2,
  },
  dayCellBulkSelected: {
    borderColor: "#1a7f7f",
    borderWidth: 2,
    backgroundColor: "#e6f5f4",
    shadowColor: "#1a7f7f",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.24,
    shadowRadius: 4,
    elevation: 3,
  },
  dayCellBlank: {
    flex: 1,
    flexBasis: 0,
    minHeight: 64,
  },
  dayCellNumber: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1d3450",
  },
  dayCellIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minHeight: 12,
  },
  dayCellPrice: {
    fontSize: 8,
    color: "#1a7f7f",
    fontWeight: "700",
  },
  dayCellBulkBadge: {
    fontSize: 10,
    color: "#1a7f7f",
    fontWeight: "800",
  },
  dayCellCruiseRows: {
    width: "100%",
    gap: 2,
    marginTop: 2,
  },
  dayCellCruiseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  dayCellCruisePrice: {
    flex: 1,
    fontSize: 9,
    color: "#1a7f7f",
    fontWeight: "700",
  },
  dayCellCruiseIconBadge: {
    alignItems: "center",
    justifyContent: "center",
  },
  dayCruiseIconBadge: {
    backgroundColor: "#c79021",
  },
  overnightCruiseIconBadge: {
    backgroundColor: "#2f8a3f",
  },
  nightCruiseIconBadge: {
    backgroundColor: "#1a7f7f",
  },
  dayCellTickPlaceholder: {
    width: 7,
    height: 7,
  },
  cruisePriceRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cde3db",
    borderRadius: 10,
    backgroundColor: "#faf6f1",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  cruiseCombinedRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cde3db",
    borderRadius: 10,
    backgroundColor: "#faf6f1",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  cruisePriceLabel: {
    color: "#234058",
    fontSize: 13,
    flex: 1,
  },
  cruisePriceField: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#bfd5cc",
    borderRadius: 9,
    backgroundColor: "#f5f2ed",
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
    minWidth: 90,
  },
  bulkCheckBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#1a7f7f",
    alignItems: "center",
    justifyContent: "center",
  },
  calendarPageRoot: {
    flex: 1,
  },
  bulkPricingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e8f0f8",
  },
  bulkPricingTextBlock: {
    flex: 1,
  },
  bulkPricingLabel: {
    color: "#102949",
    fontSize: 13,
    fontWeight: "600",
  },
  bulkPricingSubLabel: {
    color: "#6b8099",
    fontSize: 11,
    marginTop: 1,
  },
  bulkToggleButton: {
    borderWidth: 1,
    borderColor: "#bfd5cc",
    borderRadius: 8,
    backgroundColor: "#faf6f1",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bulkToggleButtonCancel: {
    borderColor: "#4a9f9f",
    backgroundColor: "#e6f5f4",
  },
  bulkToggleButtonText: {
    color: "#5d7289",
    fontSize: 12,
    fontWeight: "600",
  },
  bulkToggleButtonCancelText: {
    color: "#1a7f7f",
  },
  bottomSheet: {
    backgroundColor: "#faf6f1",
    borderTopWidth: 1,
    borderTopColor: "#cde3db",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 10,
    shadowColor: "#1a7f7f",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  bulkPriceModalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: "#faf6f1",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#cde3db",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 12,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottomSheetInfo: {
    flex: 1,
  },
  bottomSheetTitle: {
    color: "#102949",
    fontSize: 13,
    fontWeight: "700",
  },
  bottomSheetSub: {
    color: "#6b8099",
    fontSize: 11,
    marginTop: 1,
  },
  bottomSheetCloseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#bfd5cc",
    backgroundColor: "#ebe8e3",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomSheetInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bottomSheetPriceField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#bfd5cc",
    borderRadius: 9,
    backgroundColor: "#faf6f1",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
  },
  bottomSheetRupee: {
    color: "#5a7090",
    fontSize: 14,
    fontWeight: "600",
  },
  bottomSheetInput: {
    flex: 1,
    color: "#102949",
    fontSize: 14,
    padding: 0,
  },
  applyPriceButton: {
    borderRadius: 10,
    backgroundColor: "#1a7f7f",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  applyPriceButtonDisabled: {
    backgroundColor: "#a8c9c5",
  },
  applyPriceButtonText: {
    color: "#faf6f1",
    fontSize: 13,
    fontWeight: "600",
  },
  bulkPricingOpenButton: {
    borderRadius: 10,
    backgroundColor: "#1a7f7f",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 120,
  },
  bulkPricingOpenButtonDisabled: {
    backgroundColor: "#a8c9c5",
  },
  calendarMonthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  monthChevronButton: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#bfd5cc",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#faf6f1",
  },
  monthChevronText: {
    color: "#1a7f7f",
    fontSize: 20,
    lineHeight: 22,
    fontWeight: "700",
  },
  calendarMonthTitle: {
    color: "#102949",
    fontSize: 15,
    fontWeight: "700",
  },
  weekdayHeaderText: {
    flex: 1,
    textAlign: "center",
    color: "#62768f",
    fontSize: 11,
    fontWeight: "600",
    paddingBottom: 4,
  },
  primaryButton: {
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: "#1a7f7f",
    alignItems: "center",
    paddingVertical: 10,
  },
  primaryButtonDisabled: {
    backgroundColor: "#a8c9c5",
  },
  primaryButtonText: {
    color: "#faf6f1",
    fontSize: 13,
    fontWeight: "600",
  },
  bulkModeButtonActive: {
    borderColor: "#9fc6ec",
    backgroundColor: "#e6f5f4",
  },
  bulkModeButtonTextActive: {
    color: "#1a7f7f",
  },
  bulkInfoText: {
    color: "#5a6d82",
    fontSize: 12,
  },
  calendarRuleText: {
    color: "#5a6d82",
    fontSize: 12,
  },
  bulkPricingPanel: {
    backgroundColor: "#faf6f1",
    borderTopWidth: 1,
    borderTopColor: "#cde3db",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 96,
    gap: 10,
    shadowColor: "#1a7f7f",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  dayEditPanel: {
    backgroundColor: "#faf6f1",
    borderTopWidth: 1,
    borderTopColor: "#cde3db",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 96,
    gap: 12,
    shadowColor: "#1a7f7f",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#12253d66",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 1,
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: "#faf6f1",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#cde3db",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 12,
  },
  modalDragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d0dce8",
    alignSelf: "center",
    marginBottom: 4,
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    color: "#102949",
    fontSize: 16,
    fontWeight: "700",
  },
  enquiryTabRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#cde3db",
    borderRadius: 12,
    backgroundColor: "#f5f2ed",
    padding: 4,
    gap: 6,
  },
  enquiryTabButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  enquiryTabButtonActive: {
    backgroundColor: "#faf6f1",
    borderWidth: 1,
    borderColor: "#4a9f9f",
  },
  enquiryTabText: {
    color: "#5d7289",
    fontSize: 12,
    fontWeight: "600",
  },
  enquiryTabTextActive: {
    color: "#1a7f7f",
  },
  inlineWrapRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  inlineMuted: {
    color: "#6c8098",
    fontSize: 11,
  },
  detailText: {
    marginTop: 10,
    color: "#5a6d82",
    fontSize: 13,
  },
  detailStrong: {
    marginTop: 8,
    color: "#334b67",
    fontSize: 13,
    fontWeight: "500",
  },
  detailMuted: {
    marginTop: 8,
    color: "#7a8da4",
    fontSize: 12,
  },
  acceptButton: {
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: "#109c61",
    paddingHorizontal: 24,
    paddingVertical: 12,
    flex: 1,
    alignItems: "center",
  },
  declineButton: {
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: "#cf3850",
    paddingHorizontal: 24,
    paddingVertical: 12,
    flex: 1,
    alignItems: "center",
    marginRight: 8,
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  buttonRowBetween: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  bookingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e8ebe9",
    paddingVertical: 6,
    gap: 8,
  },
  bookingRowKey: {
    color: "#6b8098",
    fontSize: 12,
    flex: 1,
  },
  bookingRowValue: {
    color: "#193555",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
  },
  profileBoatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#cde3db",
    borderRadius: 10,
    backgroundColor: "#f5f2ed",
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  profileBoatText: {
    color: "#13345a",
    fontSize: 13,
    fontWeight: "500",
  },
  noteBox: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: "#e6f5f4",
    padding: 10,
  },
  noteText: {
    color: "#5a6d82",
    fontSize: 11,
    lineHeight: 17,
  },
  bottomNavShell: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
    borderWidth: 1,
    borderColor: "#cde3db",
    borderRadius: 999,
    backgroundColor: "#faf6f1",
    shadowColor: "#1a7f7f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  bottomNavRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bottomNavItem: {
    flex: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    gap: 1,
  },
  bottomNavItemActive: {
    backgroundColor: "#e6f5f4",
  },
  bottomNavIcon: {
    minHeight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomNavLabel: {
    fontSize: 10,
    color: "#6d8299",
    fontWeight: "500",
  },
  bottomNavLabelActive: {
    color: "#1a7f7f",
    fontWeight: "700",
  },
  flex1: {
    flex: 1,
  },
  verticalGap12: {
    gap: 12,
  },
});
