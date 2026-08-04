import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Pressable, ScrollView, Text, View, ActivityIndicator } from "react-native";
import { BookingCard, BoatSelector } from "../components";
import { useBoat } from "../context/BoatContext";
import { fetchUpcomingCruisesApi, fetchRequests, fetchRequestHistory, Booking, safeParseDate } from "../services/bookings";
import { fetchOverviewStats, OverviewStatsResponse } from "../services/dashboard";
import { COLORS } from "../styles";

import type { MainTabScreenProps } from "../navigation/types";

type NavigationProp = MainTabScreenProps<"Overview">["navigation"];

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { boats, searchQuery } = useBoat();
  const [selectedBoat, setSelectedBoat] = useState<number>(0);

  const [stats, setStats] = useState<OverviewStatsResponse | null>(null);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedBooking, setExpandedBooking] = useState<number | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const targetBoatId = selectedBoat > 0 ? selectedBoat : undefined;

      const [statsRes, bookingsRes] = await Promise.all([
        fetchOverviewStats(targetBoatId),
        fetchUpcomingCruisesApi(selectedBoat),
      ]);

      if (statsRes.data) {
        setStats(statsRes.data);
      }
      if (bookingsRes.data) {
        setAllBookings(bookingsRes.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setSelectedBoat(0);
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    loadData();
  }, [selectedBoat]);

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

  // Filter list based on selected boat and search query
  const filteredBookings = allBookings.filter((b) => {
    const boatMatch = selectedBoat === 0 || b.boat === selectedBoatName;
    return boatMatch && matchesSearch(b);
  });

  // Upcoming cruises
  const upcomingCruises = filteredBookings.filter((b) => {
    const bookingDate = safeParseDate(b.date);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
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

  // Stat card renderer
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

  const formattedAsOfDate = stats?.asOfDate
    ? new Date(stats.asOfDate).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 18, paddingBottom: 120 }}>
        {/* Header information */}
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
          <View>
            <Text style={{ fontSize: 26, fontWeight: "800", color: COLORS.navy }}>Overview</Text>
            <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>{formattedAsOfDate}</Text>
          </View>
          <BoatSelector selectedBoat={selectedBoat} setSelectedBoat={setSelectedBoat} />
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
              {renderStatCard("Today's trips", String(stats?.todaysTrips ?? 0), false, () => {
                navigation.navigate("Bookings");
              })}
              {renderStatCard("Pending requests", String(stats?.pendingRequests ?? 0), true, () => {
                navigation.navigate("Requests");
              })}
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
              {renderStatCard(
                "Confirmed bookings this month",
                String(stats?.confirmedBookingsThisMonth ?? 0)
              )}
              {renderStatCard(
                "Booking conversion rate (last 30 days)",
                `${stats?.bookingConversionRateLast30Days ?? 0}%`
              )}
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
