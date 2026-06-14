import React, { useState, useEffect } from "react";
import { Pressable, ScrollView, Text, View, ActivityIndicator, Alert } from "react-native";
import { Card, PageHeader, StatusPill } from "../components";
import { useBoat } from "../context/BoatContext";
import { fetchRequests, submitRequestOutcome } from "../services/bookings";
import { BookingRequest } from "../data/bookings";
import styles from "../styles";

export default function RequestsScreen() {
  const { selectedBoat, boats } = useBoat();
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [cards, setCards] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const loadRequests = async () => {
      setIsLoading(true);
      try {
        const response = await fetchRequests(selectedBoat);
        if (active && response.data) {
          setCards(response.data);
        }
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to load booking requests.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadRequests();
    return () => {
      active = false;
    };
  }, [selectedBoat]);

  const handleRespond = async (guestName: string, outcome: "accepted" | "rejected") => {
    setIsActionLoading(true);
    try {
      const response = await submitRequestOutcome(selectedBoat, guestName, outcome);
      if (response.error) {
        Alert.alert("Error", response.error.message);
      } else {
        // Reload requests list
        const res = await fetchRequests(selectedBoat);
        if (res.data) {
          setCards(res.data);
        }
      }
    } catch {
      Alert.alert("Error", "Failed to process booking request response.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const pendingCards = cards.filter(
    (c) => !c.outcome && c.boatId === selectedBoat
  );
  const historyCards = cards.filter(
    (c) => c.outcome && c.boatId === selectedBoat
  );
  const visibleCards = activeTab === "pending" ? pendingCards : historyCards;

  const selectedBoatName = boats.find((b) => b.id === selectedBoat)?.name || "";

  return (
    <View style={styles.flex1}>
      <ScrollView contentContainerStyle={styles.pageScrollContent}>
        <PageHeader
          title="Requests"
          sub={`Temporary date locks are active. Respond to avoid automatic expiry. · Boat: ${selectedBoatName}`}
        />

        <View style={styles.requestTabRow}>
          <Pressable
            onPress={() => setActiveTab("pending")}
            style={[
              styles.requestTabButton,
              activeTab === "pending" ? styles.requestTabButtonActive : null,
            ]}
          >
            <Text
              style={[
                styles.requestTabText,
                activeTab === "pending" ? styles.requestTabTextActive : null,
              ]}
            >
              Pending requests
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("history")}
            style={[
              styles.requestTabButton,
              activeTab === "history" ? styles.requestTabButtonActive : null,
            ]}
          >
            <Text
              style={[
                styles.requestTabText,
                activeTab === "history" ? styles.requestTabTextActive : null,
              ]}
            >
              History
            </Text>
          </Pressable>
        </View>

        {isLoading || isActionLoading ? (
          <View style={{ paddingVertical: 60, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#0c5eac" />
            <Text style={{ marginTop: 10, color: "#4f6e8c", fontSize: 14 }}>
              {isActionLoading ? "Updating request status..." : "Loading requests..."}
            </Text>
          </View>
        ) : (
          <>
            {visibleCards.map((card) => (
              <Card key={card.name} title={card.name} sub={card.dateLine}>
                <View style={styles.inlineWrapRow}>
                  <StatusPill status={card.status as "Date locked" | "Confirmed" | "Pending" | "Rejected"} />
                  <Text style={styles.inlineMuted}>{card.subtitle}</Text>
                </View>
                <Text style={styles.detailText}>{card.details}</Text>
                <Text style={styles.detailStrong}>{card.config}</Text>
                {card.request ? (
                  <Text style={styles.detailMuted}>{card.request}</Text>
                ) : null}
                {activeTab === "pending" ? (
                  <View style={styles.buttonRowBetween}>
                    <Pressable
                      style={styles.declineButton}
                      onPress={() => handleRespond(card.name, "rejected")}
                    >
                      <Text style={styles.actionButtonText}>Decline</Text>
                    </Pressable>
                    <Pressable
                      style={styles.acceptButton}
                      onPress={() => handleRespond(card.name, "accepted")}
                    >
                      <Text style={styles.actionButtonText}>Accept booking</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Text style={styles.detailMuted}>{card.actedOn}</Text>
                )}
              </Card>
            ))}

            {visibleCards.length === 0 ? (
              <Card title="No requests">
                <Text style={styles.detailMuted}>
                  {activeTab === "pending"
                    ? "There are no pending requests right now."
                    : "Accepted and rejected requests will appear here."}
                </Text>
              </Card>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
