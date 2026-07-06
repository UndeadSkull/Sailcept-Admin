import React from "react";
import { Pressable, Text, View, Linking, StyleSheet } from "react-native";
import { Users, Sun, Moon, Sunrise, MessageCircle, Phone } from "lucide-react-native";
import { Booking, DietEntry } from "../data/bookings";
import { COLORS } from "../styles";
import { formatDateRange, getCotsMattresses, isContactUnlocked } from "../services/bookings";

type BookingCardProps = {
  b: Booking;
  expanded: boolean;
  onToggle: () => void;
  isRequest?: boolean;
  onDecision?: (id: number, outcome: "accepted" | "declined") => void;
  historyOutcome?: { outcome: "accepted" | "declined" };
  highlighted?: boolean;
};

const TYPE_ICONS: Record<string, React.ComponentType<any>> = {
  "Day cruise": Sun,
  "Overnight stay": Moon,
  "Night stay": Sunrise,
  "Day Cruise": Sun,
  "Overnight Stay": Moon,
  "Night Stay": Sunrise,
};

const CHECK_IN_TIMES: Record<string, string> = {
  "Day cruise": "11:00AM",
  "Overnight stay": "12:00PM",
  "Night stay": "05:30PM",
  "Day Cruise": "11:00AM",
  "Overnight Stay": "12:00PM",
  "Night Stay": "05:30PM",
};

export default function BookingCard({
  b,
  expanded,
  onToggle,
  isRequest = false,
  onDecision,
  historyOutcome,
  highlighted = false,
}: BookingCardProps) {
  const phoneDigits = b.phone ? b.phone.replace(/[^\d+]/g, "") : "";
  const unlocked = b.date ? isContactUnlocked(b.date) && historyOutcome?.outcome !== "declined" : false;

  const handleWhatsApp = () => {
    if (!unlocked) return;
    const cleanNum = phoneDigits.replace("+", "");
    Linking.openURL(`https://wa.me/${cleanNum}`).catch((err) =>
      console.error("Failed to open WhatsApp:", err)
    );
  };

  const handleCall = () => {
    if (!unlocked) return;
    Linking.openURL(`tel:${phoneDigits}`).catch((err) =>
      console.error("Failed to make call:", err)
    );
  };

  // Determine left border color
  let leftBorderColor = COLORS.teal;
  if (b.status === "cancelled") leftBorderColor = COLORS.red;
  else if (b.status === "deleted") leftBorderColor = COLORS.muted;
  else if (b.isUpdated) leftBorderColor = COLORS.amber;
  else if (b.isDirect) leftBorderColor = "#000000";
  else if (historyOutcome) {
    leftBorderColor = historyOutcome.outcome === "accepted" ? COLORS.teal : COLORS.red;
  }

  const IconComp = TYPE_ICONS[b.type] || Sun;

  return (
    <Pressable
      onPress={onToggle}
      style={{
        backgroundColor: highlighted ? COLORS.tealLight : COLORS.white,
        borderWidth: 1,
        borderColor: highlighted ? COLORS.teal : COLORS.border,
        borderLeftWidth: 3,
        borderLeftColor: leftBorderColor,
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 10,
      }}
    >
      <View style={{ padding: 18 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
              <Text style={{ fontWeight: "700", fontSize: 15, color: COLORS.navy }}>{b.guest}</Text>
              {b.status === "deleted" && (
                <View style={{ backgroundColor: COLORS.muted, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: COLORS.white, textTransform: "uppercase" }}>Deleted</Text>
                </View>
              )}
              {b.isDirect && (
                <View style={{ backgroundColor: COLORS.tealLight, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: COLORS.navy, textTransform: "uppercase" }}>{b.bookingSource || "Direct"}</Text>
                </View>
              )}
              {b.status === "cancelled" && (
                <View style={{ backgroundColor: COLORS.red, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: COLORS.white, textTransform: "uppercase" }}>Cancelled</Text>
                </View>
              )}
              {b.isUpdated && (
                <View style={{ backgroundColor: COLORS.amber, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: COLORS.white, textTransform: "uppercase" }}>Updated</Text>
                </View>
              )}
            </View>
            <Text style={{ fontSize: 12, color: COLORS.navy, marginBottom: 6, fontWeight: "500" }}>{formatDateRange(b.date, b.dateEnd)}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Users size={13} color={COLORS.muted} />
              <Text style={{ fontSize: 12, color: COLORS.muted }}>
                {b.adults} adult{b.adults !== 1 ? "s" : ""} · {b.children} child{b.children !== 1 ? "ren" : ""} · {b.kids || 0} kid{(b.kids || 0) !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>

          <View style={{ alignItems: "flex-end", minWidth: 90 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <IconComp size={14} color={COLORS.muted} />
              <Text style={{ fontSize: 13, color: COLORS.muted }}>{b.type}</Text>
            </View>
            <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.navy, marginTop: 6 }}>{b.boat}</Text>
            <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{b.rooms}BH</Text>
          </View>
        </View>
      </View>

      {expanded && (
        <View style={{ borderTopWidth: 1, borderTopColor: COLORS.border, padding: 18, backgroundColor: COLORS.bg }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.navy, marginBottom: 6 }}>{b.bookingId}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Text style={{ fontSize: 13, color: COLORS.navy, fontWeight: "600" }}>{b.rooms} room{b.rooms !== 1 ? "s" : ""}</Text>
                <Text style={{ color: COLORS.border }}>|</Text>
                <Text style={{ fontSize: 13, color: COLORS.navy, fontWeight: "600" }}>Cot/Mat: {getCotsMattresses(b)}</Text>
              </View>

              <View style={{ marginTop: 10, gap: 5 }}>
                <Text style={{ fontSize: 12, color: COLORS.navy }}>
                  <Text style={{ color: COLORS.muted }}>Check-in: </Text>
                  <Text style={{ fontWeight: "600" }}>{CHECK_IN_TIMES[b.type] || "Not specified"}</Text>
                </Text>
                <Text style={{ fontSize: 12, color: COLORS.navy }}>
                  <Text style={{ color: COLORS.muted }}>Diet: </Text>
                  <Text style={{ fontWeight: "600" }}>
                    {b.dietBreakdown && b.dietBreakdown.length > 0
                      ? b.dietBreakdown.map((d: DietEntry) => `${d.count} ${d.type}`).join(", ")
                      : "Not specified"}
                  </Text>
                </Text>
                {b.accessibility && b.accessibility !== "None" && (
                  <Text style={{ fontSize: 12, color: COLORS.navy }}>
                    <Text style={{ color: COLORS.muted }}>Accessibility: </Text>
                    <Text style={{ fontWeight: "600" }}>{b.accessibility}</Text>
                  </Text>
                )}
                {b.specialRequests && b.specialRequests.length > 0 && (
                  <Text style={{ fontSize: 12, color: COLORS.navy }}>
                    <Text style={{ color: COLORS.muted }}>Special requests: </Text>
                    {b.specialRequests.map((req, idx) => {
                      const isUpdatedField = b.updatedSpecialRequests?.includes(req);
                      return (
                        <Text key={req}>
                          <Text style={{ fontWeight: "600", color: isUpdatedField ? COLORS.white : COLORS.navy, backgroundColor: isUpdatedField ? COLORS.amber : "transparent" }}>
                            {isUpdatedField ? ` ${req} ` : req}
                          </Text>
                          {idx < (b.specialRequests?.length ?? 0) - 1 ? ", " : ""}
                        </Text>
                      );
                    })}
                  </Text>
                )}
                <Text style={{ fontSize: 12, color: COLORS.navy }}>
                  <Text style={{ color: COLORS.muted }}>Price: </Text>
                  <Text style={{ fontWeight: "700", color: COLORS.teal }}>₹{b.price?.toLocaleString("en-IN")}</Text>
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                onPress={handleWhatsApp}
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: unlocked ? "#25D366" : COLORS.border,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MessageCircle size={19} color={unlocked ? COLORS.white : COLORS.muted} />
              </Pressable>
              <Pressable
                onPress={handleCall}
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: unlocked ? COLORS.teal : COLORS.border,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Phone size={19} color={unlocked ? COLORS.white : COLORS.muted} />
              </Pressable>
            </View>
          </View>

          {isRequest && onDecision && (
            <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
              <Pressable
                onPress={() => onDecision(b.id, "accepted")}
                style={{
                  flex: 1,
                  backgroundColor: COLORS.teal,
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: COLORS.white, fontSize: 13, fontWeight: "600" }}>Accept</Text>
              </Pressable>
              <Pressable
                onPress={() => onDecision(b.id, "declined")}
                style={{
                  flex: 1,
                  backgroundColor: COLORS.white,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: "600" }}>Decline</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}
