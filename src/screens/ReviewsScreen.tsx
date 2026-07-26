import React, { useState, useEffect } from "react";
import { Pressable, ScrollView, Text, View, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Star } from "lucide-react-native";
import { Card, BoatSelector } from "../components";
import { useBoat } from "../context/BoatContext";
import { fetchReviews } from "../services/bookings";
import { COLORS } from "../styles";

export default function ReviewsScreen() {
  const navigation = useNavigation();
  const { selectedBoat, searchQuery } = useBoat();

  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [starFilter, setStarFilter] = useState<number | null>(null);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const response = await fetchReviews(selectedBoat);
      if (response.data) {
        setReviewsList(response.data);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [selectedBoat]); // Reload when selected boat changes

  // Filter reviews
  const filteredReviews = reviewsList.filter((r) => {
    // Star filter
    if (starFilter !== null && r.rating !== starFilter) return false;

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const guestMatch = r.guest ? r.guest.toLowerCase().includes(query) : false;
      const textMatch = r.text ? r.text.toLowerCase().includes(query) : false;
      const boatMatch = r.boat ? r.boat.toLowerCase().includes(query) : false;
      return guestMatch || textMatch || boatMatch;
    }
    return true;
  });

  // Calculate rating breakdown
  const totalReviews = reviewsList.length;
  const averageRating = totalReviews > 0
    ? (reviewsList.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  const getDist = (star: number) => {
    const count = reviewsList.filter((r) => r.rating === star).length;
    const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { star, count, pct };
  };

  const dist = [5, 4, 3, 2, 1].map(getDist);

  // Helper to render stars
  const renderStars = (rating: number, size = 14) => {
    return (
      <View style={{ flexDirection: "row", gap: 2 }}>
        {Array.from({ length: 5 }).map((_, idx) => {
          const filled = idx < rating;
          return (
            <Star
              key={idx}
              size={size}
              color={filled ? COLORS.amber : COLORS.border}
              fill={filled ? COLORS.amber : "transparent"}
            />
          );
        })}
      </View>
    );
  };


  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 18, paddingBottom: 120 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
          <Pressable onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <ArrowLeft size={20} color={COLORS.navy} />
          </Pressable>
          <Text style={{ fontSize: 22, fontWeight: "800", color: COLORS.navy }}>Reviews</Text>
        </View>
        <BoatSelector />
      </View>

      {isLoading ? (
        <View style={{ paddingVertical: 100, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={COLORS.teal} />
        </View>
      ) : (
        <View style={{ gap: 16 }}>
          {/* Summary Card */}
          <Card>
            <View style={{ flexDirection: "row", gap: 18, alignItems: "center" }}>
              <View style={{ alignItems: "center", minWidth: 70 }}>
                <Text style={{ fontSize: 40, fontWeight: "800", color: COLORS.navy, lineHeight: 44 }}>
                  {averageRating}
                </Text>
                <View style={{ marginTop: 6 }}>
                  {renderStars(Math.round(Number(averageRating)), 12)}
                </View>
                <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>
                  {totalReviews} review{totalReviews !== 1 ? "s" : ""}
                </Text>
              </View>

              {/* Vertical Divider */}
              <View style={{ width: 1, backgroundColor: COLORS.border, alignSelf: "stretch" }} />

              {/* Breakdown Bars */}
              <View style={{ flex: 1, gap: 5 }}>
                {dist.map(({ star, count, pct }) => (
                  <Pressable
                    key={star}
                    onPress={() => setStarFilter(starFilter === star ? null : star)}
                    style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: "600", color: COLORS.muted, width: 12 }}>
                      {star}
                    </Text>
                    <Star size={10} color={COLORS.amber} fill={COLORS.amber} />
                    <View style={{ flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 999, overflow: "hidden" }}>
                      <View style={{ width: `${pct}%`, height: "100%", backgroundColor: COLORS.amber, borderRadius: 999 }} />
                    </View>
                    <Text style={{ fontSize: 11, color: COLORS.muted, width: 18, textAlign: "right" }}>
                      {count}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </Card>

          {/* List Title */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.navy }}>
              {starFilter ? `${starFilter}-Star Reviews` : "Guest Reviews"} ({filteredReviews.length})
            </Text>
            {starFilter && (
              <Pressable onPress={() => setStarFilter(null)} style={{ padding: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: COLORS.teal }}>Clear filter</Text>
              </Pressable>
            )}
          </View>

          {/* Reviews List */}
          {filteredReviews.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 13, color: COLORS.muted }}>No reviews found matching filters.</Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {filteredReviews.map((r) => (
                <View
                  key={r.id}
                  style={{
                    backgroundColor: COLORS.white,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    borderLeftWidth: 3,
                    borderLeftColor: "#7C3AED", // mockup violet accent
                    borderRadius: 18,
                    padding: 16,
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                    <View style={{ flex: 1 }}>
                      {renderStars(r.rating, 12)}
                      <Text style={{ fontWeight: "700", fontSize: 14, color: COLORS.navy, marginTop: 4 }}>
                        {r.guest}
                      </Text>
                      <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{r.date}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end", minWidth: 90 }}>
                      <Text style={{ fontSize: 12, fontWeight: "600", color: COLORS.muted }}>{r.cruiseType}</Text>
                      <Text style={{ fontSize: 12, fontWeight: "700", color: COLORS.navy, marginTop: 4 }}>{r.boat}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 13, color: COLORS.navy, lineHeight: 19 }}>{r.text}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
