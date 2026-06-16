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
} from "lucide-react-native";
import { PageHeader } from "../components";
import { fetchBookingDetail } from "../services/bookings";
import { BookingRecord } from "../data/bookings";
import type { RootStackScreenProps } from "../navigation/types";
import styles from "../styles";

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
  const [booking, setBooking] = useState<BookingRecord | null>(null);
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

  return (
    <View style={styles.detailPageRoot}>
      <ScrollView contentContainerStyle={styles.detailScrollContent}>
        <PageHeader
          title="Booking Details"
          sub={booking ? `ID: ${booking.bookingId}` : "Fetching details..."}
          onBack={() => navigation.goBack()}
        />

        {isLoading ? (
          <View style={{ paddingVertical: 100, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#1a7f7f" />
            <Text style={{ marginTop: 10, color: "#6d8299", fontSize: 14 }}>Loading booking details...</Text>
          </View>
        ) : errorMsg ? (
          <View style={[styles.detailCard, { alignItems: "center", paddingVertical: 40 }]}>
            <Text style={{ color: "#cf3850", fontSize: 16, fontWeight: "600" }}>Error</Text>
            <Text style={{ color: "#6d8299", marginTop: 8, textAlign: "center" }}>{errorMsg}</Text>
          </View>
        ) : booking ? (
          <>
            <View style={styles.detailCard}>
              <View style={styles.detailHeaderRow}>
                <View style={styles.flex1}>
                  <Text style={styles.detailTitle}>{booking.guestName}</Text>
                  <Text style={styles.detailSub}>{booking.boatName || "Houseboat"}</Text>
                </View>
              </View>

              <View style={styles.detailDivider} />

              <View style={styles.verticalGap12}>
                {booking.details.map(([key, value]) => {
                  const IconComponent = DETAIL_ICONS[key.toLowerCase()] || ClipboardList;
                  const isPrice = key.toLowerCase().includes("price") || key.toLowerCase().includes("amount");

                  return (
                    <View key={key} style={styles.detailRow}>
                      <View style={styles.detailRowIconContainer}>
                        <IconComponent
                          size={13}
                          color={isPrice ? "#1a7f7f" : "#6d8299"}
                        />
                      </View>
                      <View style={styles.detailRowContent}>
                        <Text style={styles.detailRowLabel}>{key}</Text>
                        <Text
                          style={[
                            styles.detailRowValue,
                            isPrice ? { color: "#1a7f7f", fontWeight: "700" } : null,
                          ]}
                        >
                          {value}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {booking.notes ? (
              <View style={styles.detailNotesBox}>
                <Text style={styles.detailNotesTitle}>Important Notes / commitments</Text>
                <Text style={styles.detailNotesText}>{booking.notes}</Text>
              </View>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
