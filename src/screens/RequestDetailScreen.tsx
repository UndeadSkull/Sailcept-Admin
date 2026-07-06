import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, ActivityIndicator, Pressable, Alert } from "react-native";
import {
  Calendar,
  DollarSign,
  Compass,
  AlertCircle,
  Clock,
  CheckCircle,
} from "lucide-react-native";
import { PageHeader, StatusPill } from "../components";
import { fetchRequestDetail, submitRequestOutcome } from "../services/bookings";
import { BookingRequest } from "../data/bookings";
import type { RootStackScreenProps } from "../navigation/types";
import styles from "../styles";

type Props = RootStackScreenProps<"RequestDetail">;

export default function RequestDetailScreen({ route, navigation }: Props) {
  const { requestName, boatId } = route.params;
  const [request, setRequest] = useState<BookingRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    fetchRequestDetail(requestName, boatId)
      .then((res) => {
        if (!active) return;
        if (res.error) {
          setErrorMsg(res.error.message);
        } else if (res.data) {
          setRequest(res.data);
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
  }, [requestName, boatId]);

  const handleRespond = async (outcome: "accepted" | "rejected") => {
    setIsActionLoading(true);
    try {
      const response = await submitRequestOutcome(boatId, requestName, outcome);
      if (response.error) {
        Alert.alert("Error", response.error.message);
      } else if (response.data) {
        setRequest(response.data);
        Alert.alert("Success", `Request has been ${outcome === "accepted" ? "accepted" : "declined"}.`);
      }
    } catch {
      Alert.alert("Error", "Failed to process booking request response.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const isPending = request && !request.outcome;

  return (
    <View style={styles.detailPageRoot}>
      <ScrollView contentContainerStyle={styles.detailScrollContent}>
        <PageHeader
          title="Request Details"
          sub={request ? `Boat: ${request.boatName || "Houseboat"}` : "Fetching request..."}
          onBack={() => navigation.goBack()}
        />

        {isLoading || isActionLoading ? (
          <View style={{ paddingVertical: 100, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#1a7f7f" />
            <Text style={{ marginTop: 10, color: "#6d8299", fontSize: 14 }}>
              {isActionLoading ? "Updating request status..." : "Loading request details..."}
            </Text>
          </View>
        ) : errorMsg ? (
          <View style={[styles.detailCard, { alignItems: "center", paddingVertical: 40 }]}>
            <Text style={{ color: "#cf3850", fontSize: 16, fontWeight: "600" }}>Error</Text>
            <Text style={{ color: "#6d8299", marginTop: 8, textAlign: "center" }}>{errorMsg}</Text>
          </View>
        ) : request ? (
          <>
            <View style={styles.detailCard}>
              <View style={styles.detailHeaderRow}>
                <View style={styles.flex1}>
                  <Text style={styles.detailTitle}>{request.name}</Text>
                  <Text style={styles.detailSub}>{request.subtitle}</Text>
                </View>
                <StatusPill status={request.status as any} />
              </View>

              <View style={styles.detailDivider} />

              <View style={styles.verticalGap12}>
                <View style={styles.detailRow}>
                  <View style={styles.detailRowIconContainer}>
                    <Clock size={13} color="#6d8299" />
                  </View>
                  <View style={styles.detailRowContent}>
                    <Text style={styles.detailRowLabel}>Status Timeline / hold</Text>
                    <Text style={styles.detailRowValue}>{request.dateLine}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailRowIconContainer}>
                    <Compass size={13} color="#6d8299" />
                  </View>
                  <View style={styles.detailRowContent}>
                    <Text style={styles.detailRowLabel}>Configuration & Guests</Text>
                    <Text style={styles.detailRowValue}>{request.details}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailRowIconContainer}>
                    <DollarSign size={13} color="#1a7f7f" />
                  </View>
                  <View style={styles.detailRowContent}>
                    <Text style={styles.detailRowLabel}>Price / Value</Text>
                    <Text style={[styles.detailRowValue, { color: "#1a7f7f", fontWeight: "700" }]}>
                      {request.config}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {request.request ? (
              <View style={[styles.detailNotesBox, { borderColor: "#cde3db", backgroundColor: "#faf6f1ee" }]}>
                <Text style={[styles.detailNotesTitle, { color: "#1a7f7f" }]}>Special Requests</Text>
                <Text style={[styles.detailNotesText, { color: "#3a504a" }]}>{request.request}</Text>
              </View>
            ) : null}

            {request.actedOn ? (
              <View style={[styles.detailNotesBox, { marginTop: 16 }]}>
                <Text style={styles.detailNotesTitle}>Action History</Text>
                <Text style={styles.detailNotesText}>{request.actedOn}</Text>
              </View>
            ) : null}

            {isPending && (
              <View style={[styles.buttonRowBetween, { marginTop: 24 }]}>
                <Pressable
                  style={[styles.declineButton, { flex: 1, marginRight: 8 }]}
                  onPress={() => handleRespond("rejected")}
                >
                  <Text style={styles.actionButtonText}>Decline</Text>
                </Pressable>
                <Pressable
                  style={[styles.acceptButton, { flex: 1, marginLeft: 8 }]}
                  onPress={() => handleRespond("accepted")}
                >
                  <Text style={styles.actionButtonText}>Accept Booking</Text>
                </Pressable>
              </View>
            )}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
