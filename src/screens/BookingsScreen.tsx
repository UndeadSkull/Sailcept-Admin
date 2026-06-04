import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutAnimation, Pressable, ScrollView, Text, UIManager, View, Platform } from "react-native";
import AppHeader from "../components/AppHeader";
import { Card, PageHeader } from "../components";
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

const ALL_BOOKINGS: BookingRecord[] = [
  {
    id: "booking-1", guestName: "Ethan Walker", boatName: "Vembanad Crest", bookingId: "#SC-2025-0041",
    details: [["Cruise type", "Day cruise"], ["Date & time", "15 Jan 2025 · 11:00 AM - 5:00 PM"], ["Configuration", "2 adults · 1 room · Private · Premium"], ["Total agreed price", "INR 12,500"], ["Inclusions", "Meals, water, A/C, fishing equipment"], ["Pickup arranged", "Taxi confirmed · Alleppey Jetty"], ["Meal preference", "Vegetarian · Anniversary decoration"]],
    notes: "Sailcept commitments: cruise-time support, check-in coordination, taxi pickup, operator compliance enforcement, backup boat if required.",
  },
  {
    id: "booking-2", guestName: "Olivia Bennett", boatName: "Vembanad Crest", bookingId: "#SC-2025-0042",
    details: [["Cruise type", "Overnight stay"], ["Date & time", "18 Jan 2025 · 3:00 PM - Next day 11:00 AM"], ["Configuration", "4 adults · 2 rooms · Private · Luxury"], ["Total agreed price", "INR 28,000"], ["Inclusions", "All meals, spa, sunset deck access"], ["Pickup arranged", "Hotel pickup confirmed"], ["Special requests", "Champagne breakfast on day 2"]],
    notes: "Premium service package. Guest is VIP. Ensure extra staff on board.",
  },
  {
    id: "booking-3", guestName: "Nora Ali", boatName: "Backwater Pearl", bookingId: "#SC-2025-0050",
    details: [["Cruise type", "Day cruise"], ["Date & time", "21 Jan 2025 · 10:00 AM - 4:00 PM"], ["Configuration", "3 adults · 1 room · Private · Standard"], ["Total agreed price", "INR 10,800"], ["Inclusions", "Meals, tea service, local guide"]],
    notes: "Standard service package with guided village stop.",
  },
  {
    id: "booking-4", guestName: "Rohan P.K", boatName: "Kerala Dream", bookingId: "#SC-2025-0053",
    details: [["Cruise type", "Overnight stay"], ["Date & time", "27 Jan 2025 · 4:00 PM - Next day 10:00 AM"], ["Configuration", "4 adults · 2 rooms · Private · Luxury"], ["Total agreed price", "INR 31,500"], ["Inclusions", "All meals, deck dinner, sunrise cruise"]],
    notes: "Luxury package with chef special menu requested.",
  },
  {
    id: "booking-5", guestName: "Mason Reed", boatName: "Backwater Pearl", bookingId: "#SC-2025-0054",
    details: [["Cruise type", "Day cruise"], ["Date & time", "12 Jan 2025 · 10:30 AM - 4:30 PM"], ["Configuration", "3 adults · 1 room · Private · Standard"], ["Total agreed price", "INR 10,800"]],
    notes: "Guest requested local cuisine lunch and calm-route itinerary.",
  },
  {
    id: "booking-6", guestName: "Ava Stone", boatName: "Backwater Pearl", bookingId: "#SC-2025-0055",
    details: [["Cruise type", "Night stay"], ["Date & time", "20 Jan 2025 · 6:00 PM - 10:00 PM"], ["Configuration", "5 guests · Shared · Premium"], ["Total agreed price", "INR 18,900"]],
    notes: "Shared night package with onboard music setup confirmed.",
  },
  {
    id: "booking-7", guestName: "Noah Patel", boatName: "Kerala Dream", bookingId: "#SC-2025-0056",
    details: [["Cruise type", "Overnight stay"], ["Date & time", "16 Jan 2025 · 3:00 PM - Next day 11:00 AM"], ["Configuration", "4 adults · 2 rooms · Private · Luxury"], ["Total agreed price", "INR 31,500"]],
    notes: "Luxury itinerary with sunrise breakfast arrangement.",
  },
  {
    id: "booking-8", guestName: "Liam Carter", boatName: "Kerala Dream", bookingId: "#SC-2025-0057",
    details: [["Cruise type", "Day cruise"], ["Date & time", "23 Jan 2025 · 11:00 AM - 5:00 PM"], ["Configuration", "2 adults · 1 room · Private · Premium"], ["Total agreed price", "INR 12,500"]],
    notes: "Anniversary day trip with decoration and photo-stop included.",
  },
];

type Props = MainTabScreenProps<"Bookings">;

export default function BookingsScreen({ route }: Props) {
  const { selectedBoat } = useBoat();
  const focusGuest = route?.params?.focusGuest;
  const focusToken = route?.params?.focusToken;

  const [expandedBookings, setExpandedBookings] = useState<Set<string>>(new Set());
  const scrollRef = useRef<ScrollView>(null);
  const bookingYById = useRef<Record<string, number>>({});

  const visibleBookings = ALL_BOOKINGS.filter((b) => b.boatName === selectedBoat);
  const focusedBookingId = useMemo(() => {
    if (!focusGuest) return undefined;
    return visibleBookings.find((b) => b.guestName.toLowerCase() === focusGuest.toLowerCase())?.id;
  }, [focusGuest, visibleBookings]);

  const toggleBooking = (bookingId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const next = new Set(expandedBookings);
    if (next.has(bookingId)) next.delete(bookingId);
    else next.add(bookingId);
    setExpandedBookings(next);
  };

  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    if (!focusedBookingId) return;
    requestAnimationFrame(() => {
      const y = bookingYById.current[focusedBookingId];
      if (typeof y === "number") {
        scrollRef.current?.scrollTo({ y: Math.max(0, y - 90), animated: true });
      }
    });
  }, [focusedBookingId, focusToken]);

  return (
    <View style={styles.flex1}>
      <AppHeader />
      <ScrollView ref={scrollRef} contentContainerStyle={styles.pageScrollContent}>
        <PageHeader
          title="Bookings"
          sub={`Track accepted bookings with complete trip details and guest preferences. · Boat: ${selectedBoat}`}
        />
        <View style={styles.verticalGap12}>
          {visibleBookings.map((booking) => {
            const isExpanded =
              expandedBookings.has(booking.id) || booking.id === focusedBookingId;
            return (
              <Pressable
                key={booking.id}
                onPress={() => toggleBooking(booking.id)}
                onLayout={(e) => { bookingYById.current[booking.id] = e.nativeEvent.layout.y; }}
                style={[styles.card, styles.expandableBookingCard]}
              >
                <View style={styles.bookingSummaryRow}>
                  <View style={styles.flex1}>
                    <Text style={styles.cardTitle}>{booking.guestName} · {booking.boatName}</Text>
                    <Text style={styles.cardSub}>{booking.bookingId}</Text>
                  </View>
                  <Text style={styles.expandIcon}>{isExpanded ? "▼" : "▶"}</Text>
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
              <Text style={styles.detailMuted}>No confirmed bookings found for {selectedBoat}.</Text>
            </Card>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
