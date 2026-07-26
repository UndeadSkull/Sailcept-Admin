import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Pressable, ScrollView, Text, View, ActivityIndicator } from "react-native";
import { BookingCard, BoatSelector } from "../components";
import { useBoat } from "../context/BoatContext";
import { fetchBookings, fetchRequests, fetchRequestHistory, Booking, formatToday, safeParseDate } from "../services/bookings";
import { COLORS } from "../styles";

import type { MainTabScreenProps } from "../navigation/types";

type NavigationProp = MainTabScreenProps<"Overview">["navigation"];

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { selectedBoat, boats, searchQuery } = useBoat();

  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [allRequests, setAllRequests] = useState<Booking[]>([]);
  const [allHistory, setAllHistory] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedBooking, setExpandedBooking] = useState<number | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data for filtering
      const [bookingsRes, requestsRes, historyRes] = await Promise.all([
        fetchBookings(0), // fetch all boats bookings
        fetchRequests(0), // fetch all requests
        fetchRequestHistory(0), // fetch all history
      ]);

      if (bookingsRes.data) setAllBookings(bookingsRes.data);
      if (requestsRes.data) setAllRequests(requestsRes.data);
      if (historyRes.data) setAllHistory(historyRes.data);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBoat]); // Reload when selectedBoat changes

  // Helper to check if a booking matches search query
  const matchesSearch = (b: Booking) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const guestMatch = b.guest ? b.guest.toLowerCase().includes(query) : false;
    const idMatch = b.bookingId ? b.bookingId.toLowerCase().includes(query) : false;
    const boatMatch = b.boat ? b.boat.toLowerCase().includes(query) : false;
    return guestMatch || idMatch || boatMatch;
  };

  // Resolve boat name
  const selectedBoatName = selectedBoat === 0 ? "All" : boats.find((b) => b.id === selectedBoat)?.name || "";

  // Filter lists based on selected boat and search query
  const filteredBookings = allBookings.filter((b) => {
    const boatMatch = selectedBoat === 0 || b.boat === selectedBoatName;
    return boatMatch && matchesSearch(b);
  });

  const filteredRequests = allRequests.filter((r) => {
    const boatMatch = selectedBoat === 0 || r.boat === selectedBoatName;
    return boatMatch && matchesSearch(r);
  });

  const filteredHistory = allHistory.filter((h) => {
    const boatMatch = selectedBoat === 0 || h.boat === selectedBoatName;
    return boatMatch && matchesSearch(h);
  });

  // Calculate stats
  const todayStr = "18 Jun 2026"; // mockup today date
  const todaysTrips = filteredBookings.filter(
    (b) => b.date === todayStr && b.status !== "cancelled" && b.status !== "deleted"
  );

  const confirmedBookingsThisMonth = filteredBookings.filter(
    (b) => b.date.includes("Jun 2026") && b.status !== "cancelled" && b.status !== "deleted"
  );

  // Conversion rate: accepted / (accepted + declined)
  const acceptedRequests = filteredHistory.filter((h) => h.outcome === "accepted").length;
  const declinedRequests = filteredHistory.filter((h) => h.outcome === "declined").length;
  const totalDecided = acceptedRequests + declinedRequests;
  const conversionRate = totalDecided > 0 ? Math.round((acceptedRequests / totalDecided) * 100) : 0;

  // Filter upcoming cruises: date >= June 18, 2026 and not cancelled/deleted
  const upcomingCruises = filteredBookings.filter((b) => {
    const bookingDate = safeParseDate(b.date);
    const todayStart = new Date(2026, 5, 18); // June 18
    return bookingDate >= todayStart && b.status !== "cancelled" && b.status !== "deleted";
  });

  // Sort and group upcoming cruises by date
  const sortedCruises = [...upcomingCruises].sort(
    (a, b) => safeParseDate(a.date).getTime() - safeParseDate(b.date).getTime()
  );

  const groupedCruises = sortedCruises.reduce<Record<string, Booking[]>>((groups, b) => {
    const key = b.date;
    if (!groups[key]) groups[key] = [];
    groups[key].push(b);
    return groups;
  }, {});

  // Custom Stat Card row renderer
  const renderStatCard = (label: string, value: string, isAccent = false, onPress?: () => void) => {
    return (
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [
          {
            flex: 1,
            backgroundColor: isAccent ? "#FFF1F2" : COLORS.white,
            borderWidth: 1,
            borderColor: isAccent ? "#FECDD3" : COLORS.border,
            borderRadius: 16,
            padding: 16,
            justifyContent: "space-between",
            opacity: pressed ? 0.7 : 1,
            minHeight: 88,
          },
        ]}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            color: isAccent ? "#991B1B" : COLORS.muted,
            lineHeight: 16,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "800",
            color: isAccent ? COLORS.red : COLORS.navy,
            marginTop: 6,
          }}
        >
          {value}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 18, paddingBottom: 120 }}>
        {/* Header information */}
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
          <View>
            <Text style={{ fontSize: 22, fontWeight: "800", color: COLORS.navy }}>Overview</Text>
            <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>{formatToday()}</Text>
          </View>
          <BoatSelector />
        </View>

        {isLoading ? (
          <View style={{ paddingVertical: 100, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color={COLORS.teal} />
            <Text style={{ marginTop: 10, color: COLORS.muted, fontSize: 14 }}>Loading performance metrics...</Text>
          </View>
        ) : (
          <>
            {/* Stats rows */}
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
              {renderStatCard("Today's trips", String(todaysTrips.length), false, () => {
                navigation.navigate("Bookings"); // Go to bookings
              })}
              {renderStatCard("Pending requests", String(filteredRequests.length), true, () => {
                navigation.navigate("Requests"); // Go to requests
              })}
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
              {renderStatCard("Confirmed bookings this month", String(confirmedBookingsThisMonth.length))}
              {renderStatCard("Booking conversion rate (last 30 days)", `${conversionRate}%`)}
            </View>

            {/* Upcoming cruises section */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.navy, marginBottom: 12 }}>
                Upcoming cruises
              </Text>

              {upcomingCruises.length === 0 ? (
                <View style={{ paddingVertical: 40, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 13, color: COLORS.muted }}>No upcoming cruises scheduled.</Text>
                </View>
              ) : (
                Object.entries(groupedCruises).map(([dateKey, group]) => {
                  const dateLabel = safeParseDate(dateKey)
                    .toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
                    .replace(",", "");
                  return (
                    <View key={dateKey} style={{ marginBottom: 16 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "700",
                          color: COLORS.muted,
                          marginBottom: 8,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        {dateLabel}
                      </Text>
                      <View style={{ flexDirection: "column" }}>
                        {group.map((b) => (
                          <BookingCard
                            key={b.id}
                            b={b}
                            expanded={expandedBooking === b.id}
                            onToggle={() => {
                              setExpandedBooking(expandedBooking === b.id ? null : b.id);
                            }}
                          />
                        ))}
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
