import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, ActivityIndicator, Pressable, Alert } from "react-native";
import {
  Calendar,
  DollarSign,
  Compass,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react-native";
import { PageHeader } from "../components";
import { fetchRequestDetail, submitRequestOutcome, Booking, formatDateRange, getWaitingHours, getWaitingColor, safeParseDate } from "../services/bookings";
import type { RootStackScreenProps } from "../navigation/types";
import { COLORS } from "../styles";

type Props = RootStackScreenProps<"RequestDetail">;

export default function RequestDetailScreen({ route, navigation }: Props) {
  const { requestName, boatId } = route.params;
  const [request, setRequest] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadRequest = () => {
    setIsLoading(true);
    fetchRequestDetail(requestName, boatId)
      .then((res) => {
        if (res.error) {
          setErrorMsg(res.error.message);
        } else if (res.data) {
          setRequest(res.data);
        }
      })
      .catch((err) => {
        setErrorMsg("An unexpected error occurred.");
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadRequest();
  }, [requestName, boatId]);

  const handleRespond = async (outcome: "accepted" | "declined") => {
    if (!request) return;
    setIsActionLoading(true);
    try {
      const response = await submitRequestOutcome(request.id, outcome);
      if (response.error) {
        Alert.alert("Error", response.error.message);
      } else if (response.data) {
        setRequest(response.data);
        Alert.alert("Success", `Request has been ${outcome === "accepted" ? "accepted" : "declined"}.`);
        navigation.goBack();
      }
    } catch {
      Alert.alert("Error", "Failed to process booking request response.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const isPending = request && request.status === "pending";

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 18, paddingBottom: 120 }}>
        <PageHeader
          title="Request Details"
          sub={request ? `Boat: ${request.boat || "Houseboat"}` : "Fetching request..."}
          onBack={() => navigation.goBack()}
        />

        {isLoading || isActionLoading ? (
          <View style={{ paddingVertical: 100, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color={COLORS.teal} />
            <Text style={{ marginTop: 10, color: COLORS.muted, fontSize: 14 }}>
              {isActionLoading ? "Updating request status..." : "Loading request details..."}
            </Text>
          </View>
        ) : errorMsg ? (
          <View style={{ backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, padding: 24, alignItems: "center" }}>
            <Text style={{ color: COLORS.red, fontSize: 16, fontWeight: "600" }}>Error</Text>
            <Text style={{ color: COLORS.muted, marginTop: 8, textAlign: "center" }}>{errorMsg}</Text>
          </View>
        ) : request ? (
          <>
            <View style={{ backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, padding: 18, marginBottom: 16 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ fontWeight: "800", fontSize: 18, color: COLORS.navy }}>{request.guest}</Text>
                  <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>{request.boat}</Text>
                </View>
                <View style={{ backgroundColor: request.status === "pending" ? COLORS.tealLight : COLORS.border, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: request.status === "pending" ? COLORS.teal : COLORS.muted, textTransform: "capitalize" }}>
                    {request.status}
                  </Text>
                </View>
              </View>

              <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical: 12 }} />

              <View style={{ gap: 12 }}>
                {/* Status hold */}
                {request.requestedAt && (
                  <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.tealLight, alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                      <Clock size={13} color={COLORS.muted} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, fontWeight: "700", color: COLORS.muted, textTransform: "uppercase" }}>Status Timeline / hold</Text>
                      {(() => {
                        const hours = getWaitingHours(request.requestedAt);
                        const deadlineColor = getWaitingColor(hours);
                        const deadlineDate = new Date(safeParseDate(request.requestedAt).getTime() + 12 * 60 * 60 * 1000);
                        const deadlineStr = deadlineDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                        return (
                          <Text style={{ fontSize: 13, fontWeight: "600", color: deadlineColor, marginTop: 2 }}>
                            Requested on {request.requestedAt instanceof Date ? request.requestedAt.toLocaleDateString("en-GB") : String(request.requestedAt)} · Respond by {deadlineStr}
                          </Text>
                        );
                      })()}
                    </View>
                  </View>
                )}

                {/* Configuration */}
                <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.tealLight, alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                    <Compass size={13} color={COLORS.muted} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: COLORS.muted, textTransform: "uppercase" }}>Configuration & Guests</Text>
                    <Text style={{ fontSize: 13, fontWeight: "500", color: COLORS.navy, marginTop: 2, lineHeight: 18 }}>
                      {request.rooms}BH · {request.type} · {formatDateRange(request.date, request.dateEnd)} · {request.adults} Adults · {request.children ?? 0} Children
                    </Text>
                  </View>
                </View>

                {/* Price */}
                <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.tealLight, alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                    <DollarSign size={13} color={COLORS.teal} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: COLORS.muted, textTransform: "uppercase" }}>Price / Value</Text>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.teal, marginTop: 2 }}>
                      ₹{request.price?.toLocaleString("en-IN")}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {request.specialRequests && request.specialRequests.length > 0 && (
              <View style={{ backgroundColor: COLORS.tealLight, borderLeftWidth: 3, borderLeftColor: COLORS.teal, borderRadius: 10, padding: 14, marginBottom: 16 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: COLORS.teal, textTransform: "uppercase" }}>Special Requests</Text>
                <Text style={{ fontSize: 13, color: COLORS.navy, marginTop: 4 }}>{request.specialRequests.join(", ")}</Text>
              </View>
            )}

            {isPending && (
              <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
                <Pressable
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: COLORS.red,
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: "center",
                  }}
                  onPress={() => handleRespond("declined")}
                >
                  <Text style={{ color: COLORS.red, fontSize: 14, fontWeight: "700" }}>Decline</Text>
                </Pressable>
                <Pressable
                  style={{
                    flex: 1,
                    backgroundColor: COLORS.teal,
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: "center",
                  }}
                  onPress={() => handleRespond("accepted")}
                >
                  <Text style={{ color: COLORS.white, fontSize: 14, fontWeight: "700" }}>Accept Booking</Text>
                </Pressable>
              </View>
            )}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
