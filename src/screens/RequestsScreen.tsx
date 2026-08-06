import React, { useState, useEffect, useCallback } from "react";
import { Pressable, ScrollView, Text, View, ActivityIndicator, Alert, Modal, StyleSheet, RefreshControl } from "react-native";
import { Inbox, ChevronDown, ChevronUp } from "lucide-react-native";
import { BookingCard, BoatSelector } from "../components";
import { useBoat } from "../context/BoatContext";
import { useNavigation } from "@react-navigation/native";
import { fetchRequests, fetchRequestHistory, submitRequestOutcome, Booking, MONTHS, getWaitingHours, getWaitingColor, safeParseDate } from "../services/bookings";
import { COLORS } from "../styles";

export default function RequestsScreen() {
  const navigation = useNavigation();
  const { boats, searchQuery, refreshRequestsCount } = useBoat();
  const [selectedBoat, setSelectedBoat] = useState<number>(0);
  const [requestsView, setRequestsView] = useState<"pending" | "history">("pending");

  const [allRequests, setAllRequests] = useState<Booking[]>([]);
  const [allHistory, setAllHistory] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedBooking, setExpandedBooking] = useState<number | null>(null);

  // History filtering
  const [historyMonth, setHistoryMonth] = useState(5); // June
  const [historyYear, setHistoryYear] = useState(2026);
  const [historyMonthOpen, setHistoryMonthOpen] = useState(false);
  const [historyYearOpen, setHistoryYearOpen] = useState(false);

  // Decision Modal
  const [decisionRequest, setDecisionRequest] = useState<Booking | null>(null);
  const [decisionOutcome, setDecisionOutcome] = useState<"accepted" | "declined" | null>(null);

  const loadRequestsData = async () => {
    setIsLoading(true);
    try {
      const [reqsRes, histRes] = await Promise.all([
        fetchRequests(0), // fetch all to filter locally
        fetchRequestHistory(0),
      ]);
      if (reqsRes.data) setAllRequests(reqsRes.data);
      if (histRes.data) setAllHistory(histRes.data);
      refreshRequestsCount();
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [reqsRes, histRes] = await Promise.all([
        fetchRequests(0),
        fetchRequestHistory(0),
      ]);
      if (reqsRes.data) setAllRequests(reqsRes.data);
      if (histRes.data) setAllHistory(histRes.data);
      refreshRequestsCount();
    } catch (err) {
      console.error("Failed to refresh requests:", err);
    } finally {
      setRefreshing(false);
    }
  }, [refreshRequestsCount]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setSelectedBoat(0);
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    loadRequestsData();
  }, [selectedBoat]);

  // Resolve boat name
  const selectedBoatName = selectedBoat === 0 ? "All" : boats.find((b) => b.id === selectedBoat)?.name || "";

  // Filter lists based on selected boat and search query
  const matchesSearch = (b: Booking) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const guestMatch = b.guest ? b.guest.toLowerCase().includes(query) : false;
    const idMatch = b.bookingId ? b.bookingId.toLowerCase().includes(query) : false;
    const boatMatch = b.boat ? b.boat.toLowerCase().includes(query) : false;
    return guestMatch || idMatch || boatMatch;
  };

  const filteredRequests = allRequests.filter((r) => {
    const boatMatch = selectedBoat === 0 || r.boat === selectedBoatName;
    return boatMatch && matchesSearch(r);
  });

  const filteredHistory = allHistory.filter((h) => {
    const boatMatch = selectedBoat === 0 || h.boat === selectedBoatName;
    const dateMatch = h.decidedAt
      ? safeParseDate(h.decidedAt).getMonth() === historyMonth && safeParseDate(h.decidedAt).getFullYear() === historyYear
      : true; // fallback
    return boatMatch && dateMatch && matchesSearch(h);
  });

  const handleDecisionConfirm = async () => {
    if (!decisionRequest || !decisionOutcome) return;
    setIsLoading(true);
    try {
      const res = await submitRequestOutcome(decisionRequest.id, decisionOutcome);
      if (res.error) {
        Alert.alert("Error", res.error.message);
      } else {
        // Success, reload data
        await loadRequestsData();
      }
    } catch (err) {
      console.error("Failed to submit request outcome:", err);
    } finally {
      setDecisionRequest(null);
      setDecisionOutcome(null);
      setIsLoading(false);
    }
  };

  const years = [2026, 2027, 2028];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 18, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.teal]} tintColor={COLORS.teal} />}
      >
        {/* Title */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Text style={{ fontSize: 26, fontWeight: "800", color: COLORS.navy }}>Requests</Text>
          <BoatSelector selectedBoat={selectedBoat} setSelectedBoat={setSelectedBoat} />
        </View>

        {/* Tab row */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
          {["pending", "history"].map((v) => (
            <Pressable
              key={v}
              onPress={() => setRequestsView(v as "pending" | "history")}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: requestsView === v ? COLORS.teal : COLORS.border,
                backgroundColor: requestsView === v ? COLORS.tealLight : COLORS.white,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: requestsView === v ? COLORS.teal : COLORS.muted,
                  textTransform: "capitalize",
                }}
              >
                {v}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* History filters */}
        {requestsView === "history" && (
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16, zIndex: 10 }}>
            {/* Month Filter */}
            <View style={{ flex: 1 }}>
              <Pressable
                onPress={() => {
                  setHistoryMonthOpen(!historyMonthOpen);
                  setHistoryYearOpen(false);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  backgroundColor: COLORS.white,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.navy }}>
                  {MONTHS[historyMonth]}
                </Text>
                {historyMonthOpen ? (
                  <ChevronUp size={14} color={COLORS.muted} />
                ) : (
                  <ChevronDown size={14} color={COLORS.muted} />
                )}
              </Pressable>
            </View>

            {/* Year Filter */}
            <View style={{ flex: 1 }}>
              <Pressable
                onPress={() => {
                  setHistoryYearOpen(!historyYearOpen);
                  setHistoryMonthOpen(false);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  backgroundColor: COLORS.white,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.navy }}>
                  {historyYear}
                </Text>
                {historyYearOpen ? (
                  <ChevronUp size={14} color={COLORS.muted} />
                ) : (
                  <ChevronDown size={14} color={COLORS.muted} />
                )}
              </Pressable>
            </View>
          </View>
        )}

        {isLoading ? (
          <View style={{ paddingVertical: 80, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color={COLORS.teal} />
            <Text style={{ marginTop: 10, color: COLORS.muted, fontSize: 14 }}>Loading request data...</Text>
          </View>
        ) : (
          <>
            {requestsView === "pending" ? (
              <View>
                <Text style={{ fontSize: 13, color: COLORS.muted, marginBottom: 12 }}>
                  {filteredRequests.length} awaiting your response
                </Text>

                {filteredRequests.length === 0 ? (
                  <View style={{ paddingVertical: 60, alignItems: "center" }}>
                    <Inbox size={40} color={COLORS.muted} strokeWidth={1.5} style={{ marginBottom: 12 }} />
                    <Text style={{ fontSize: 15, fontWeight: "600", color: COLORS.navy }}>No pending requests</Text>
                    <Text style={{ fontSize: 13, marginTop: 6, color: COLORS.muted }}>You're all caught up</Text>
                  </View>
                ) : (
                  [...filteredRequests]
                    .sort((a, b) => safeParseDate(a.requestedAt ?? 0).getTime() - safeParseDate(b.requestedAt ?? 0).getTime())
                    .map((r) => {
                      const hours = r.requestedAt ? getWaitingHours(r.requestedAt) : 0;
                      const dateLabel = r.requestedAt
                        ? safeParseDate(r.requestedAt)
                            .toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
                            .replace(",", "")
                        : "";

                      // Deadline = requestedAt + 12h
                      const deadlineDate = r.requestedAt
                        ? new Date(safeParseDate(r.requestedAt).getTime() + 12 * 60 * 60 * 1000)
                        : new Date();
                      const deadlineColor = getWaitingColor(hours);
                      const deadlineStr = deadlineDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                      const deadlineIsNextDay = r.requestedAt
                        ? deadlineDate.toDateString() !== safeParseDate(r.requestedAt).toDateString()
                        : false;
                      const deadlineLabel = `Respond by ${deadlineStr}${deadlineIsNextDay ? " (next day)" : ""}`;

                      return (
                        <View key={r.id} style={{ marginBottom: 16 }}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 8,
                            }}
                          >
                            <Text style={{ fontSize: 11, fontWeight: "700", color: COLORS.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>
                              {dateLabel}
                            </Text>
                            <Text style={{ color: COLORS.border }}>|</Text>
                            <Text style={{ fontSize: 11, fontWeight: "700", color: deadlineColor }}>
                              {deadlineLabel}
                            </Text>
                          </View>
                          <BookingCard
                            b={r}
                            expanded={expandedBooking === r.id}
                            onToggle={() => {
                              setExpandedBooking(expandedBooking === r.id ? null : r.id);
                            }}
                            isRequest
                            onDecision={(id, outcome) => {
                              setDecisionRequest(r);
                              setDecisionOutcome(outcome);
                            }}
                          />
                        </View>
                      );
                    })
                )}
              </View>
            ) : (
              <View>
                <Text style={{ fontSize: 13, color: COLORS.muted, marginBottom: 12 }}>
                  {filteredHistory.length} requests processed in {MONTHS[historyMonth]} {historyYear}
                </Text>

                {filteredHistory.length === 0 ? (
                  <View style={{ paddingVertical: 60, alignItems: "center" }}>
                    <Inbox size={40} color={COLORS.muted} strokeWidth={1.5} style={{ marginBottom: 12 }} />
                    <Text style={{ fontSize: 13, color: COLORS.muted }}>No request history found for this period.</Text>
                  </View>
                ) : (
                  [...filteredHistory]
                    .sort((a, b) => safeParseDate(b.decidedAt ?? 0).getTime() - safeParseDate(a.decidedAt ?? 0).getTime())
                    .map((h) => {
                      const decDateLabel = h.decidedAt
                        ? safeParseDate(h.decidedAt)
                            .toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
                            .replace(",", "")
                        : "";
                      const decTimeLabel = h.decidedAt
                        ? safeParseDate(h.decidedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
                        : "";

                      return (
                        <View key={h.id} style={{ marginBottom: 16 }}>
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: "700",
                              color: COLORS.muted,
                              marginBottom: 8,
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                            }}
                          >
                            {h.outcome === "accepted" ? "Accepted" : "Declined"} on {decDateLabel} · {decTimeLabel}
                          </Text>
                          <BookingCard
                            b={h}
                            expanded={expandedBooking === h.id}
                            onToggle={() => {
                              setExpandedBooking(expandedBooking === h.id ? null : h.id);
                            }}
                            historyOutcome={{ outcome: h.outcome ?? "accepted" }}
                          />
                        </View>
                      );
                    })
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Request Decision Confirmation Overlay Modal */}
      {decisionRequest && decisionOutcome && (
        <Modal transparent visible animationType="fade">
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(15, 23, 42, 0.5)",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <View
              style={{
                backgroundColor: COLORS.white,
                borderRadius: 24,
                padding: 24,
                width: "100%",
                maxWidth: 340,
                shadowColor: COLORS.navy,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "800", color: COLORS.navy, marginBottom: 10 }}>
                Confirm Action
              </Text>
              <Text style={{ fontSize: 13, color: COLORS.muted, lineHeight: 20, marginBottom: 20 }}>
                Are you sure you want to <Text style={{ fontWeight: "700", color: COLORS.navy }}>{decisionOutcome}</Text> the request from <Text style={{ fontWeight: "700", color: COLORS.navy }}>{decisionRequest.guest}</Text>?
              </Text>

              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable
                  onPress={() => {
                    setDecisionRequest(null);
                    setDecisionOutcome(null);
                  }}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.navy }}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleDecisionConfirm}
                  style={{
                    flex: 1,
                    backgroundColor: decisionOutcome === "accepted" ? COLORS.teal : COLORS.red,
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.white }}>
                    Confirm
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Month Dropdown List Modal Overlay */}
      {historyMonthOpen && (
        <Modal
          transparent
          visible={historyMonthOpen}
          animationType="none"
          onRequestClose={() => setHistoryMonthOpen(false)}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setHistoryMonthOpen(false)} />
          <View
            style={{
              position: "absolute",
              top: 154,
              left: 18,
              backgroundColor: COLORS.white,
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 16,
              minWidth: 150,
              maxHeight: 260,
              shadowColor: COLORS.navy,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 16,
              elevation: 5,
              paddingVertical: 6,
            }}
          >
            <ScrollView>
              {MONTHS.map((m, i) => {
                const isCurrent = historyMonth === i;
                return (
                  <Pressable
                    key={m}
                    onPress={() => {
                      setHistoryMonth(i);
                      setHistoryMonthOpen(false);
                    }}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 9,
                      backgroundColor: isCurrent ? COLORS.tealLight : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: isCurrent ? "700" : "500",
                        color: isCurrent ? COLORS.teal : COLORS.navy,
                      }}
                    >
                      {m}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Modal>
      )}

      {/* Year Dropdown List Modal Overlay */}
      {historyYearOpen && (
        <Modal
          transparent
          visible={historyYearOpen}
          animationType="none"
          onRequestClose={() => setHistoryYearOpen(false)}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setHistoryYearOpen(false)} />
          <View
            style={{
              position: "absolute",
              top: 154,
              right: 18,
              backgroundColor: COLORS.white,
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 16,
              minWidth: 100,
              maxHeight: 220,
              shadowColor: COLORS.navy,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 16,
              elevation: 5,
              paddingVertical: 6,
            }}
          >
            <ScrollView>
              {years.map((year) => {
                const isCurrent = historyYear === year;
                return (
                  <Pressable
                    key={year}
                    onPress={() => {
                      setHistoryYear(year);
                      setHistoryYearOpen(false);
                    }}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 9,
                      backgroundColor: isCurrent ? COLORS.tealLight : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: isCurrent ? "700" : "500",
                        color: isCurrent ? COLORS.teal : COLORS.navy,
                      }}
                    >
                      {year}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
}
