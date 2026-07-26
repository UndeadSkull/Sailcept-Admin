import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, ActivityIndicator, Pressable } from "react-native";
import {
  Calendar,
  User,
  DollarSign,
  Compass,
  MapPin,
  Utensils,
  ClipboardList,
  Sparkles,
  ArrowLeft,
} from "lucide-react-native";
import { PageHeader } from "../components";
import { fetchBookingDetail, Booking, formatDateRange } from "../services/bookings";
import type { RootStackScreenProps } from "../navigation/types";
import { COLORS } from "../styles";

type Props = RootStackScreenProps<"BookingDetail">;

const DETAIL_ICONS: Record<string, React.ComponentType<any>> = {
  "cruise type": Compass,
  "date & time": Calendar,
  "configuration": User,
  "total agreed price": DollarSign,
  "inclusions": ClipboardList,
  "pickup arranged": MapPin,
  "meal preference": Utensils,
  "special requests": Sparkles,
};

export default function BookingDetailScreen({ route, navigation }: Props) {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    fetchBookingDetail(bookingId)
      .then((res) => {
        if (!active) return;
        if (res.error) {
          setErrorMsg(res.error.message);
        } else if (res.data) {
          setBooking(res.data);
        }
      })
      .catch((err) => {
        if (active) {
          setErrorMsg("An unexpected error occurred.");
          console.error(err);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [bookingId]);

  // Construct details list helper
  const getDetails = (b: Booking): Array<[string, string]> => {
    const datesVal = formatDateRange(b.date, b.dateEnd);
    return [
      ["Cruise Type", b.type],
      ["Date & Time", `${datesVal} (Check-in: ${b.checkIn ?? "12:00 PM"}, Check-out: ${b.checkOut ?? "9:00 AM"})`],
      ["Configuration", `${b.rooms}BH · ${b.adults} Adults · ${b.children ?? 0} Children`],
      ["Total Agreed Price", `₹${b.price?.toLocaleString("en-IN")}`],
      ["Pickup Arranged", b.ghat || "Finishing Point, Alappuzha"],
      ["Meal Preference", b.meal || (b.dietBreakdown ? b.dietBreakdown.map(d => `${d.count} ${d.type}`).join(", ") : "Veg only")],
      ["Special Requests", b.specialRequests && b.specialRequests.length > 0 ? b.specialRequests.join(", ") : "None"],
    ];
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 18, paddingBottom: 120 }}>
        <PageHeader
          title="Booking Details"
          sub={booking ? `ID: ${booking.bookingId}` : "Fetching details..."}
          onBack={() => navigation.goBack()}
        />

        {isLoading ? (
          <View style={{ paddingVertical: 100, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color={COLORS.teal} />
            <Text style={{ marginTop: 10, color: COLORS.muted, fontSize: 14 }}>Loading booking details...</Text>
          </View>
        ) : errorMsg ? (
          <View style={{ backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, padding: 24, alignItems: "center" }}>
            <Text style={{ color: COLORS.red, fontSize: 16, fontWeight: "600" }}>Error</Text>
            <Text style={{ color: COLORS.muted, marginTop: 8, textAlign: "center" }}>{errorMsg}</Text>
          </View>
        ) : booking ? (
          <>
            <View style={{ backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, padding: 18, marginBottom: 16 }}>
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: "800", fontSize: 18, color: COLORS.navy }}>{booking.guest}</Text>
                <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>{booking.boat}</Text>
              </View>

              <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical: 12 }} />

              <View style={{ gap: 12 }}>
                {getDetails(booking).map(([key, value]) => {
                  const IconComponent = DETAIL_ICONS[key.toLowerCase()] || ClipboardList;
                  const isPrice = key.toLowerCase().includes("price");

                  return (
                    <View key={key} style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
                      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.tealLight, alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                        <IconComponent size={13} color={isPrice ? COLORS.teal : COLORS.muted} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 11, fontWeight: "700", color: COLORS.muted, textTransform: "uppercase" }}>{key}</Text>
                        <Text style={{ fontSize: 13, fontWeight: isPrice ? "700" : "500", color: isPrice ? COLORS.teal : COLORS.navy, marginTop: 2, lineHeight: 18 }}>
                          {value}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {booking.accessibility && booking.accessibility !== "None" && (
              <View style={{ backgroundColor: COLORS.tealLight, borderLeftWidth: 3, borderLeftColor: COLORS.teal, borderRadius: 10, padding: 14 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: COLORS.teal, textTransform: "uppercase" }}>Accessibility Request</Text>
                <Text style={{ fontSize: 13, color: COLORS.navy, marginTop: 4 }}>{booking.accessibility}</Text>
              </View>
            )}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
