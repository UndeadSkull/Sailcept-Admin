import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type RouteKey = 'dashboard' | 'boat' | 'calendar' | 'enquiries' | 'bookings';

type Enquiry = {
  name: string;
  dateLine: string;
  status: 'Date locked' | 'Confirmed' | 'Pending';
  config: string;
};

type SelectOption = {
  label: string;
  value: string;
};

const navItems: Array<{
  key: RouteKey;
  label: string;
  icon: string;
}> = [
  { key: 'dashboard', label: 'Overview', icon: '▦' },
  { key: 'calendar', label: 'Calendar', icon: '◫' },
  { key: 'enquiries', label: 'Enquiries', icon: '☰' },
  { key: 'bookings', label: 'Bookings', icon: '▤' },
];

const enquiryStatusStyle: Record<Enquiry['status'], { bg: string; text: string; border: string }> = {
  'Date locked': { bg: '#fff1d6', text: '#8f6300', border: '#f5d392' },
  Confirmed: { bg: '#dcfce8', text: '#0f7a4f', border: '#9dd8bc' },
  Pending: { bg: '#e0f2ff', text: '#1a5f94', border: '#aad1ef' },
};

function PageHeader({ title, sub, children }: { title: string; sub: string; children?: React.ReactNode }) {
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

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
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
      style={[styles.selectButton, disabled ? styles.selectButtonDisabled : null]}
    >
      <Text style={[styles.selectButtonText, disabled ? styles.selectButtonTextDisabled : null]}>
        {options[index].label}
      </Text>
    </Pressable>
  );
}

function StatusPill({ status }: { status: Enquiry['status'] }) {
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
      <Text style={[styles.statusPillText, { color: enquiryStatusStyle[status].text }]}>{status}</Text>
    </View>
  );
}

function DashboardPage() {
  const enquiries: Enquiry[] = [
    {
      name: 'Arjun Menon',
      dateLine: 'Day cruise · 15 Jan 2025',
      status: 'Date locked',
      config: 'Premium · Private · 2 adults · 1 room · Full upper deck · INR 12,500',
    },
    {
      name: 'Priya Sharma',
      dateLine: 'Overnight stay · 18 Jan 2025',
      status: 'Confirmed',
      config: 'Luxury · Private · 4 adults · 2 rooms · INR 28,000',
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.pageScrollContent}>
      <PageHeader title="Overview" sub="Your houseboat performance at a glance" />

      <View style={styles.statsGrid}>
        {[
          ['Open dates this month', '18', 'of 31 days'],
          ['Pending enquiries', '3', 'Awaiting response'],
          ['Confirmed bookings', '11', 'This month'],
          ['Revenue (month)', 'INR 1.4L', 'Normal + peak'],
        ].map(([label, value, caption]) => (
          <View key={label} style={styles.statCard}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statCaption}>{caption}</Text>
          </View>
        ))}
      </View>

      <Card title="Recent enquiries">
        <View style={styles.verticalGap12}>
          {enquiries.map((enquiry) => (
            <View key={enquiry.name} style={styles.listCard}>
              <View style={styles.rowBetweenTop}>
                <View style={styles.flex1}>
                  <Text style={styles.listCardTitle}>{enquiry.name}</Text>
                  <Text style={styles.listCardSub}>{enquiry.dateLine}</Text>
                </View>
                <StatusPill status={enquiry.status} />
              </View>
              <Text style={styles.listCardMeta}>{enquiry.config}</Text>
            </View>
          ))}
        </View>
      </Card>
    </ScrollView>
  );
}

function BoatAssetPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [identity, setIdentity] = useState({
    boatName: 'Vembanad Crest',
    experienceTier: 'Premium',
    bookingType: 'Private only',
    maxGuests: 6,
    bedrooms: 2,
    maxGuestsPerRoom: '2 + 1 extra bed',
  });
  const [features, setFeatures] = useState<string[]>(['Full upper deck', 'Sundeck']);
  const [cruiseTypes, setCruiseTypes] = useState([
    { label: 'Day cruise', on: true },
    { label: 'Overnight stay', on: true },
    { label: 'Night stay', on: false },
  ]);
  const [roomSettings, setRoomSettings] = useState({
    maxGuests: '2 guests',
    extraBed: 'Allowed',
    children: 'Allowed',
  });

  const allStructuralFeatures = ['Full upper deck', 'Partial deck', 'Sundeck', 'Balcony'];
  const roomRules: Array<{ label: string; options: string[] }> = [
    { label: 'Max guests', options: ['2 guests', '3 guests'] },
    { label: 'Extra bed', options: ['Allowed', 'Not allowed'] },
    { label: 'Children', options: ['Allowed', 'Not allowed'] },
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
        sub="These details are permanent truths about your boat. They drive all matching logic."
      >
        <View style={styles.rowGap8}>
          {isEditing ? (
            <>
              <Pressable onPress={() => setIsEditing(false)} style={styles.outlineButton}>
                <Text style={styles.outlineButtonText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={() => setIsEditing(false)} style={styles.softBlueButton}>
                <Text style={styles.softBlueButtonText}>Save</Text>
              </Pressable>
            </>
          ) : (
            <Pressable onPress={() => setIsEditing(true)} style={styles.softBlueButton}>
              <Text style={styles.softBlueButtonText}>Edit</Text>
            </Pressable>
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
                onChangeText={(text) => setIdentity((current) => ({ ...current, boatName: text }))}
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
                onChange={(value) => setIdentity((current) => ({ ...current, experienceTier: value }))}
                options={[
                  { label: 'Premium', value: 'Premium' },
                  { label: 'Luxury', value: 'Luxury' },
                  { label: 'Standard', value: 'Standard' },
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
                onChange={(value) => setIdentity((current) => ({ ...current, bookingType: value }))}
                options={[
                  { label: 'Private only', value: 'Private only' },
                  { label: 'Shared', value: 'Shared' },
                  { label: 'Private + shared', value: 'Private + shared' },
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
                <Pressable key={feature} style={styles.featureRow} onPress={() => toggleFeature(feature)}>
                  <Text style={styles.featureRowText}>{feature}</Text>
                  <Switch value={enabled} onValueChange={() => toggleFeature(feature)} />
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
                    enabled ? styles.featurePillEnabled : styles.featurePillDisabled,
                  ]}
                >
                  <Text style={enabled ? styles.featurePillEnabledText : styles.featurePillDisabledText}>
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
                        item.label === type.label ? { ...item, on: value } : item,
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
                  type.on ? styles.cruisePillEnabled : styles.cruisePillDisabled,
                ]}
              >
                <Text style={type.on ? styles.cruisePillEnabledText : styles.cruisePillDisabledText}>
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
                label === 'Max guests'
                  ? roomSettings.maxGuests
                  : label === 'Extra bed'
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
                        if (label === 'Max guests') {
                          return { ...current, maxGuests: value };
                        }
                        if (label === 'Extra bed') {
                          return { ...current, extraBed: value };
                        }

                        return { ...current, children: value };
                      });
                    }}
                    options={options.map((option) => ({ label: option, value: option }))}
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

function CalendarPage() {
  type DayBooking = {
    dayCruise: boolean;
    overnightCruise: boolean;
    nightCruise: boolean;
    details: string;
    price?: number;
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
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();

  const [visibleMonth, setVisibleMonth] = useState(() => new Date(todayYear, todayMonth, 1));
  const [isBulkPricingMode, setIsBulkPricingMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState<number[]>([]);
  const [priceInput, setPriceInput] = useState('');
  const [selectedDate, setSelectedDate] = useState<SelectedDate | null>(null);
  const [modalPriceInput, setModalPriceInput] = useState('');
  const [bookingsByDate, setBookingsByDate] = useState<Record<string, DayBooking>>(() => ({
    [getDateKey(todayYear, todayMonth, 2)]: normalizeBooking({
      dayCruise: true,
      overnightCruise: false,
      nightCruise: false,
      details: 'Corporate day outing for 8 guests.',
      price: 12500,
    }),
    [getDateKey(todayYear, todayMonth, 5)]: normalizeBooking({
      dayCruise: true,
      overnightCruise: true,
      nightCruise: false,
      details: 'Wedding group full-day charter with overnight extension.',
      price: 28000,
    }),
    [getDateKey(todayYear, todayMonth, 9)]: normalizeBooking({
      dayCruise: false,
      overnightCruise: true,
      nightCruise: false,
      details: 'Family overnight package.',
      price: 21000,
    }),
    [getDateKey(todayYear, todayMonth, 13)]: normalizeBooking({
      dayCruise: true,
      overnightCruise: false,
      nightCruise: true,
      details: 'Festival special day and night package booking.',
      price: 23500,
    }),
    [getDateKey(todayYear, todayMonth, 18)]: normalizeBooking({
      dayCruise: false,
      overnightCruise: false,
      nightCruise: true,
      details: 'Couple moonlight cruise with dinner.',
      price: 14500,
    }),
    [getDateKey(todayYear, todayMonth, 24)]: normalizeBooking({
      dayCruise: true,
      overnightCruise: false,
      nightCruise: true,
      details: 'Private anniversary plan with sunset and night ride.',
      price: 26000,
    }),
  }));

  const visibleYear = visibleMonth.getFullYear();
  const visibleMonthIndex = visibleMonth.getMonth();
  const daysInVisibleMonth = new Date(visibleYear, visibleMonthIndex + 1, 0).getDate();
  const firstDayWeekIndex = new Date(visibleYear, visibleMonthIndex, 1).getDay();

  const calendarDays = useMemo(() => {
    const blanks = Array.from({ length: firstDayWeekIndex }, () => null as number | null);
    const monthDays = Array.from({ length: daysInVisibleMonth }, (_, index) => index + 1);
    return [...blanks, ...monthDays];
  }, [firstDayWeekIndex, daysInVisibleMonth]);

  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const visibleMonthTitle = visibleMonth.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const selectedBooking = selectedDate
    ? bookingsByDate[getDateKey(selectedDate.year, selectedDate.month, selectedDate.day)] ?? {
        dayCruise: false,
        overnightCruise: false,
        nightCruise: false,
        details: 'No bookings for this day.',
        price: undefined,
      }
    : {
        dayCruise: false,
        overnightCruise: false,
        nightCruise: false,
        details: 'No bookings for this day.',
        price: undefined,
      };

  const availabilityToggles: Array<{
    label: string;
    enabled: boolean;
    key: 'dayCruise' | 'overnightCruise' | 'nightCruise';
  }> = [
    { label: 'Day cruise', enabled: selectedBooking.dayCruise, key: 'dayCruise' },
    {
      label: 'Overnight stay',
      enabled: selectedBooking.overnightCruise,
      key: 'overnightCruise',
    },
    { label: 'Night stay', enabled: selectedBooking.nightCruise, key: 'nightCruise' },
  ];

  function updateSelectedDayAvailability(
    key: 'dayCruise' | 'overnightCruise' | 'nightCruise',
    value: boolean,
  ) {
    if (!selectedDate) {
      return;
    }

    const selectedDateKey = getDateKey(selectedDate.year, selectedDate.month, selectedDate.day);

    setBookingsByDate((current) => {
      const currentDayBooking = current[selectedDateKey] ?? {
        dayCruise: false,
        overnightCruise: false,
        nightCruise: false,
        details: 'No bookings for this day.',
        price: undefined,
      };

      const nextBooking: DayBooking = {
        ...currentDayBooking,
        [key]: value,
      };

      if (value && key === 'overnightCruise') {
        nextBooking.nightCruise = false;
      }
      if (value && key === 'nightCruise') {
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
        current.includes(day) ? current.filter((item) => item !== day) : [...current, day],
      );
      return;
    }

    const dateKey = getDateKey(visibleYear, visibleMonthIndex, day);
    const existingPrice = bookingsByDate[dateKey]?.price;
    setModalPriceInput(existingPrice ? String(existingPrice) : '');
    setSelectedDate({
      year: visibleYear,
      month: visibleMonthIndex,
      day,
    });
  }

  function applyPriceToSelectedDates() {
    const parsedPrice = Number(priceInput);
    if (!parsedPrice || parsedPrice <= 0 || selectedDates.length === 0) {
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
          details: 'No bookings for this day.',
          price: undefined,
        };

        next[dateKey] = normalizeBooking({
          ...existing,
          price: parsedPrice,
        });
      });

      return next;
    });

    setSelectedDates([]);
    setPriceInput('');
  }

  function moveMonth(delta: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
    setSelectedDates([]);
    setSelectedDate(null);
  }

  return (
    <ScrollView contentContainerStyle={styles.pageScrollContent}>
      <PageHeader
        title="Availability calendar"
        sub="Set bulk prices for multiple dates and manage cruise availability by date."
      />

      <Card title="Bulk price assignment" sub="Select dates, assign one price, and overwrite existing rates.">
        <View style={styles.verticalGap10}>
          <Pressable
            onPress={() => {
              setIsBulkPricingMode((current) => {
                const nextMode = !current;
                if (!nextMode) {
                  setSelectedDates([]);
                  setPriceInput('');
                }
                return nextMode;
              });
            }}
            style={[styles.outlineButton, isBulkPricingMode ? styles.bulkModeButtonActive : null]}
          >
            <Text style={[styles.outlineButtonText, isBulkPricingMode ? styles.bulkModeButtonTextActive : null]}>
              {isBulkPricingMode ? 'Exit bulk price mode' : 'Enable bulk price mode'}
            </Text>
          </Pressable>

          {isBulkPricingMode ? (
            <>
              <Text style={styles.bulkInfoText}>{selectedDates.length} dates selected</Text>
              <TextInput
                value={priceInput}
                onChangeText={(value) => setPriceInput(value.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                placeholder="Enter price in INR"
                style={styles.input}
              />
              <Pressable
                onPress={applyPriceToSelectedDates}
                style={[
                  styles.primaryButton,
                  selectedDates.length === 0 || !priceInput ? styles.primaryButtonDisabled : null,
                ]}
              >
                <Text style={styles.primaryButtonText}>Apply price to selected dates</Text>
              </Pressable>
            </>
          ) : null}
        </View>
      </Card>

      <Card title="Monthly availability">
        <View style={styles.calendarMonthRow}>
          <Pressable onPress={() => moveMonth(-1)} style={styles.monthChevronButton} testID="month-prev">
            <Text style={styles.monthChevronText}>‹</Text>
          </Pressable>
          <Text style={styles.calendarMonthTitle} testID="calendar-month-title">
            {visibleMonthTitle}
          </Text>
          <Pressable onPress={() => moveMonth(1)} style={styles.monthChevronButton} testID="month-next">
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
          {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, weekIndex) => (
            <View key={weekIndex} style={styles.calendarWeekRow}>
              {calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7).map((day, cellIndex) => {
                if (!day) {
                  return <View key={`blank-${weekIndex}-${cellIndex}`} style={styles.dayCellBlank} />;
                }

                const dateKey = getDateKey(visibleYear, visibleMonthIndex, day);
                const booking = bookingsByDate[dateKey];
                const allCruisesBooked =
                  booking?.dayCruise && (booking?.overnightCruise || booking?.nightCruise);
                const anyCruiseBooked =
                  booking?.dayCruise || booking?.overnightCruise || booking?.nightCruise;
                const bulkSelected = selectedDates.includes(day);
                const isEditingDate =
                  selectedDate?.year === visibleYear &&
                  selectedDate?.month === visibleMonthIndex &&
                  selectedDate?.day === day;

                return (
                  <Pressable
                    key={day}
                    onPress={() => handleDayPress(day)}
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
                    <Text style={styles.dayCellNumber}>{day}</Text>
                    <Text style={styles.dayCellIcons}>
                      {booking?.dayCruise ? '☀' : ''}
                      {booking?.overnightCruise ? ' ⌂' : ''}
                      {booking?.nightCruise ? ' ☾' : ''}
                    </Text>
                    {bulkSelected ? <Text style={styles.dayCellBulkBadge}>●</Text> : null}
                    {booking?.price ? <Text style={styles.dayCellPrice}>₹ {booking.price}</Text> : null}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </Card>

      <Modal
        visible={Boolean(selectedDate) && !isBulkPricingMode}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedDate(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard} testID="day-edit-modal">
            <Text style={styles.modalTitle}>
              {selectedDate
                ? `${selectedDate.day} ${new Date(
                    selectedDate.year,
                    selectedDate.month,
                    selectedDate.day,
                  ).toLocaleString('en-US', { month: 'short', year: 'numeric' })}`
                : ''}
            </Text>
            <Text style={styles.calendarRuleText}>Overnight stay and Night stay cannot be booked together.</Text>
            <TextInput
              value={modalPriceInput}
              onChangeText={(value) => setModalPriceInput(value.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              placeholder="Price in INR (optional)"
              style={styles.input}
              testID="modal-price-input"
            />
            <View style={styles.verticalGap10}>
              {availabilityToggles.map(({ label, enabled, key }) => (
                <View key={label} style={styles.featureRow}>
                  <Text style={styles.featureRowText}>{label}</Text>
                  <Switch
                    value={enabled}
                    onValueChange={(value) => updateSelectedDayAvailability(key, value)}
                    testID={`availability-switch-${key}`}
                  />
                </View>
              ))}
            </View>
            <Pressable
              onPress={() => {
                if (selectedDate) {
                  const dateKey = getDateKey(selectedDate.year, selectedDate.month, selectedDate.day);
                  const parsedPrice = modalPriceInput ? Number(modalPriceInput) : undefined;
                  setBookingsByDate((current) => {
                    const existing = current[dateKey] ?? {
                      dayCruise: false,
                      overnightCruise: false,
                      nightCruise: false,
                      details: 'No bookings for this day.',
                      price: undefined,
                    };
                    return {
                      ...current,
                      [dateKey]: normalizeBooking({ ...existing, price: parsedPrice }),
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
        </View>
      </Modal>
    </ScrollView>
  );
}

function EnquiriesPage() {
  const cards: Array<Enquiry & { subtitle: string; details: string; request?: string }> = [
    {
      name: 'Arjun Menon',
      dateLine: 'Received 2 hrs ago - Date held until 6 PM today',
      subtitle: 'Day cruise · 15 Jan 2025',
      status: 'Date locked',
      config: 'Price shown to guest: INR 12,500',
      details:
        'Premium · Private · 2 adults, 0 children · 1 room · 2 guests per room · No extra bed',
      request: 'Special request: Vegetarian meals preferred. Celebrating anniversary.',
    },
    {
      name: 'Ritu Nair',
      dateLine: 'Received yesterday - Overnight stay · 22 Jan',
      subtitle: 'Overnight stay · 22 Jan 2025',
      status: 'Pending',
      config: 'Price shown to guest: INR 21,000',
      details:
        'Premium · Private · 4 adults, 1 child · 2 rooms · Room 1: 2 guests · Room 2: 2 guests + 1 extra bed',
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.pageScrollContent}>
      <PageHeader
        title="Enquiries"
        sub="Temporary date locks are active. Respond to avoid automatic expiry."
      />

      {cards.map((card) => (
        <Card key={card.name} title={card.name} sub={card.dateLine}>
          <View style={styles.inlineWrapRow}>
            <StatusPill status={card.status} />
            <Text style={styles.inlineMuted}>{card.subtitle}</Text>
          </View>
          <Text style={styles.detailText}>{card.details}</Text>
          <Text style={styles.detailStrong}>{card.config}</Text>
          {card.request ? <Text style={styles.detailMuted}>{card.request}</Text> : null}
          <View style={styles.rowGap8}>
            <Pressable style={styles.acceptButton}>
              <Text style={styles.actionButtonText}>Accept booking</Text>
            </Pressable>
            <Pressable style={styles.declineButton}>
              <Text style={styles.actionButtonText}>Decline</Text>
            </Pressable>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

function BookingsPage() {
  return (
    <ScrollView contentContainerStyle={styles.pageScrollContent}>
      <PageHeader
        title="Bookings"
        sub="Track accepted bookings with complete trip details and guest preferences."
      />

      <Card title="Arjun Menon · Vembanad Crest" sub="#SC-2025-0041">
        <View style={styles.verticalGap8}>
          {[
            ['Cruise type', 'Day cruise'],
            ['Date & time', '15 Jan 2025 · 11:00 AM - 5:00 PM'],
            ['Configuration', '2 adults · 1 room · Private · Premium'],
            ['Total agreed price', 'INR 12,500'],
            ['Inclusions', 'Meals, water, A/C, fishing equipment'],
            ['Pickup arranged', 'Taxi confirmed · Alleppey Jetty'],
            ['Meal preference', 'Vegetarian · Anniversary decoration'],
          ].map(([key, value]) => (
            <View key={key} style={styles.bookingRow}>
              <Text style={styles.bookingRowKey}>{key}</Text>
              <Text style={styles.bookingRowValue}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.noteText}>
            Sailcept commitments: cruise-time support, check-in coordination, taxi pickup,
            operator compliance enforcement, backup boat if required.
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}

function AppLayout() {
  const [activeRoute, setActiveRoute] = useState<RouteKey>('dashboard');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.appRoot}>
        <View style={styles.mobileTopBar}>
          <View style={styles.brandRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>≈</Text>
            </View>
            <View>
              <Text style={styles.brandOverline}>Sailcept</Text>
              <Text style={styles.brandTitle}>Admin</Text>
            </View>
          </View>

          <Pressable
            onPress={() => setActiveRoute('boat')}
            style={[
              styles.profileChip,
              activeRoute === 'boat' ? styles.profileChipActive : null,
            ]}
          >
            <Text style={[styles.profileChipText, activeRoute === 'boat' ? styles.profileChipTextActive : null]}>
              Boat
            </Text>
          </Pressable>
        </View>

        <View style={styles.mainArea}>
          {activeRoute === 'dashboard' ? <DashboardPage /> : null}
          {activeRoute === 'boat' ? <BoatAssetPage /> : null}
          {activeRoute === 'calendar' ? <CalendarPage /> : null}
          {activeRoute === 'enquiries' ? <EnquiriesPage /> : null}
          {activeRoute === 'bookings' ? <BookingsPage /> : null}
        </View>

        <View style={styles.bottomNavShell}>
          <View style={styles.bottomNavRow}>
            {navItems.map((item) => {
              const isActive = activeRoute === item.key;

              return (
                <Pressable
                  key={item.key}
                  onPress={() => setActiveRoute(item.key)}
                  style={[styles.bottomNavItem, isActive ? styles.bottomNavItemActive : null]}
                >
                  <Text style={[styles.bottomNavIcon, isActive ? styles.bottomNavIconActive : null]}>
                    {item.icon}
                  </Text>
                  <Text style={[styles.bottomNavLabel, isActive ? styles.bottomNavLabelActive : null]}>
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
    backgroundColor: '#ffffff',
  },
  appRoot: {
    flex: 1,
    backgroundColor: '#eff7ff',
  },
  mobileTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#fffffff2',
    borderBottomWidth: 1,
    borderBottomColor: '#d7e7fb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f74cf',
  },
  logoText: {
    color: '#ffffff',
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '800',
  },
  brandOverline: {
    color: '#8193ac',
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  brandTitle: {
    color: '#0f274d',
    fontWeight: '700',
    fontSize: 14,
  },
  profileChip: {
    borderWidth: 1,
    borderColor: '#cfdbe8',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  profileChipActive: {
    borderColor: '#9fc6ec',
    backgroundColor: '#e6f2ff',
  },
  profileChipText: {
    fontSize: 12,
    color: '#5d7089',
    fontWeight: '600',
  },
  profileChipTextActive: {
    color: '#0c5eac',
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
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  pageTitle: {
    color: '#0f284e',
    fontSize: 26,
    fontWeight: '700',
  },
  pageSub: {
    color: '#60748e',
    fontSize: 13,
    marginTop: 2,
  },
  card: {
    borderWidth: 1,
    borderColor: '#d8e8fb',
    backgroundColor: '#ffffffee',
    borderRadius: 16,
    padding: 14,
  },
  cardTitle: {
    color: '#102949',
    fontSize: 15,
    fontWeight: '700',
  },
  cardSub: {
    color: '#6b8099',
    fontSize: 12,
    marginTop: 3,
  },
  cardBody: {
    marginTop: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d8e8fb',
    backgroundColor: '#ffffffee',
    padding: 12,
  },
  statLabel: {
    color: '#697b93',
    fontSize: 11,
  },
  statValue: {
    color: '#102949',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 6,
  },
  statCaption: {
    color: '#8ea0b6',
    fontSize: 11,
  },
  verticalGap12: {
    gap: 12,
  },
  listCard: {
    borderWidth: 1,
    borderColor: '#d8e8fb',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  rowBetweenTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  listCardTitle: {
    color: '#0f2748',
    fontWeight: '600',
    fontSize: 14,
  },
  listCardSub: {
    color: '#64788f',
    fontSize: 12,
    marginTop: 2,
  },
  listCardMeta: {
    color: '#546b86',
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
    fontWeight: '600',
  },
  rowGap8: {
    flexDirection: 'row',
    gap: 8,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#d2dbe6',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  outlineButtonText: {
    color: '#5d7289',
    fontSize: 12,
    fontWeight: '600',
  },
  softBlueButton: {
    borderWidth: 1,
    borderColor: '#abd0f2',
    borderRadius: 8,
    backgroundColor: '#dff1ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  softBlueButtonText: {
    color: '#0d63b4',
    fontSize: 12,
    fontWeight: '600',
  },
  verticalGap10: {
    gap: 10,
  },
  verticalGap8: {
    gap: 8,
  },
  metaBox: {
    borderWidth: 1,
    borderColor: '#d8e8fb',
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#f5faff',
  },
  metaLabel: {
    color: '#6a7f97',
    fontSize: 11,
  },
  metaValue: {
    color: '#0f284d',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#cfddea',
    borderRadius: 9,
    backgroundColor: '#ffffff',
    color: '#102949',
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  selectButton: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#cfddea',
    borderRadius: 9,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  selectButtonDisabled: {
    backgroundColor: '#eef4fa',
  },
  selectButtonText: {
    color: '#13345a',
    fontSize: 13,
    fontWeight: '500',
  },
  selectButtonTextDisabled: {
    color: '#7d8fa4',
  },
  featureRow: {
    borderWidth: 1,
    borderColor: '#d5e2ef',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  featureRowText: {
    color: '#234058',
    fontSize: 13,
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featurePill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  featurePillEnabled: {
    borderColor: '#a8cdf0',
    backgroundColor: '#e4f1ff',
  },
  featurePillDisabled: {
    borderColor: '#d3dde7',
    backgroundColor: '#eff4f9',
  },
  featurePillEnabledText: {
    color: '#0d62b2',
    fontSize: 11,
    fontWeight: '600',
  },
  featurePillDisabledText: {
    color: '#6f8195',
    fontSize: 11,
    fontWeight: '600',
  },
  cruisePillEnabled: {
    borderColor: '#9dd8bc',
    backgroundColor: '#dcfce8',
  },
  cruisePillDisabled: {
    borderColor: '#d3dde7',
    backgroundColor: '#eff4f9',
  },
  cruisePillEnabledText: {
    color: '#0f7a4f',
    fontSize: 11,
    fontWeight: '600',
  },
  cruisePillDisabledText: {
    color: '#6f8195',
    fontSize: 11,
    fontWeight: '600',
  },
  innerPanel: {
    borderWidth: 1,
    borderColor: '#d8e8fb',
    borderRadius: 12,
    padding: 10,
  },
  innerPanelTitle: {
    color: '#102949',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  fieldLabel: {
    color: '#6a7f97',
    fontSize: 11,
  },
  calendarGrid: {
    gap: 4,
  },
  calendarWeekRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dayCell: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  dayCellFull: {
    backgroundColor: '#dbf8ea',
    borderColor: '#9dd8bc',
  },
  dayCellPartial: {
    backgroundColor: '#fff1d6',
    borderColor: '#f5d392',
  },
  dayCellEmpty: {
    backgroundColor: '#eff4f9',
    borderColor: '#d3dde7',
  },
  dayCellSelected: {
    borderColor: '#2f8ae3',
    borderWidth: 2,
  },
  dayCellBulkSelected: {
    borderColor: '#0f74cf',
    borderWidth: 2,
    backgroundColor: '#d9ecff',
    shadowColor: '#0b61b0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.24,
    shadowRadius: 4,
    elevation: 3,
  },
  dayCellBlank: {
    flex: 1,
    minHeight: 48,
  },
  dayCellNumber: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1d3450',
  },
  dayCellIcons: {
    fontSize: 9,
    color: '#516980',
  },
  dayCellPrice: {
    fontSize: 8,
    color: '#0f5f9f',
    fontWeight: '700',
  },
  dayCellBulkBadge: {
    fontSize: 10,
    color: '#0c63b2',
    fontWeight: '800',
  },
  calendarMonthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  monthChevronButton: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cfddea',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  monthChevronText: {
    color: '#1b4e7e',
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '700',
  },
  calendarMonthTitle: {
    color: '#102949',
    fontSize: 15,
    fontWeight: '700',
  },
  weekdayHeaderText: {
    flex: 1,
    textAlign: 'center',
    color: '#62768f',
    fontSize: 11,
    fontWeight: '600',
    paddingBottom: 4,
  },
  primaryButton: {
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: '#1175ce',
    alignItems: 'center',
    paddingVertical: 10,
  },
  primaryButtonDisabled: {
    backgroundColor: '#9bc1e7',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  bulkModeButtonActive: {
    borderColor: '#9fc6ec',
    backgroundColor: '#e6f2ff',
  },
  bulkModeButtonTextActive: {
    color: '#0c5eac',
  },
  bulkInfoText: {
    color: '#5a6d82',
    fontSize: 12,
  },
  calendarRuleText: {
    color: '#5a6d82',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#12253d66',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalCard: {
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d4e5f8',
    padding: 14,
    gap: 10,
  },
  modalTitle: {
    color: '#102949',
    fontSize: 16,
    fontWeight: '700',
  },
  inlineWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  inlineMuted: {
    color: '#6c8098',
    fontSize: 11,
  },
  detailText: {
    marginTop: 10,
    color: '#5a6d82',
    fontSize: 13,
  },
  detailStrong: {
    marginTop: 8,
    color: '#334b67',
    fontSize: 13,
    fontWeight: '500',
  },
  detailMuted: {
    marginTop: 8,
    color: '#7a8da4',
    fontSize: 12,
  },
  acceptButton: {
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: '#109c61',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  declineButton: {
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: '#cf3850',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#edf2f7',
    paddingVertical: 6,
    gap: 8,
  },
  bookingRowKey: {
    color: '#6b8098',
    fontSize: 12,
    flex: 1,
  },
  bookingRowValue: {
    color: '#193555',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  noteBox: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: '#eaf5ff',
    padding: 10,
  },
  noteText: {
    color: '#5a6d82',
    fontSize: 11,
    lineHeight: 17,
  },
  bottomNavShell: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    borderWidth: 1,
    borderColor: '#d2e4f8',
    borderRadius: 999,
    backgroundColor: '#ffffff',
    shadowColor: '#007fd8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  bottomNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomNavItem: {
    flex: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 1,
  },
  bottomNavItemActive: {
    backgroundColor: '#e1f1ff',
  },
  bottomNavIcon: {
    fontSize: 14,
    color: '#6d8299',
    fontWeight: '700',
  },
  bottomNavIconActive: {
    color: '#0d63b4',
  },
  bottomNavLabel: {
    fontSize: 10,
    color: '#6d8299',
    fontWeight: '500',
  },
  bottomNavLabelActive: {
    color: '#0d63b4',
    fontWeight: '700',
  },
  flex1: {
    flex: 1,
  },
});
