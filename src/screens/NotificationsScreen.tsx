import React, { useState } from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { useNavigation, type NavigationProp, type ParamListBase } from "@react-navigation/native";
import {
  MessageSquarePlus,
  CalendarDays,
  XCircle,
  Sparkles,
  Edit3,
  Star,
  Check,
  CheckCheck,
} from "lucide-react-native";
import { PageHeader, Card } from "../components";
import { useNotification } from "../context/NotificationContext";
import { Notification } from "../data/notifications";
import styles from "../styles";

// Visual configurations for each notification type
const typeConfigs: Record<
  Notification["type"],
  { icon: React.ComponentType<{ size?: number; color?: string }>; color: string; bgColor: string }
> = {
  new_request: {
    icon: MessageSquarePlus,
    color: "#1a7f7f", // Teal
    bgColor: "#e6f5f4",
  },
  change_of_dates: {
    icon: CalendarDays,
    color: "#b07c00", // Gold/Orange
    bgColor: "#fff7e6",
  },
  cancellation: {
    icon: XCircle,
    color: "#cf3850", // Red
    bgColor: "#ffebee",
  },
  extra_added: {
    icon: Sparkles,
    color: "#0f7a4f", // Green
    bgColor: "#e8f7ed",
  },
  booking_changes: {
    icon: Edit3,
    color: "#2b5c8f", // Blue
    bgColor: "#eaf2fb",
  },
  reviews: {
    icon: Star,
    color: "#a17e00", // Yellow-gold
    bgColor: "#fef9e6",
  },
};

export default function NotificationsScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { notifications, markAsRead, markAsUnread, markAllAsRead, respondToRequest } = useNotification();
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "read">("all");

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.read;
    if (activeTab === "read") return n.read;
    return true;
  });

  // Organize by time groups
  const groups: Array<{ title: "Today" | "Yesterday" | "Earlier"; items: Notification[] }> = [
    { title: "Today", items: filteredNotifications.filter((n) => n.timeGroup === "Today") },
    { title: "Yesterday", items: filteredNotifications.filter((n) => n.timeGroup === "Yesterday") },
    { title: "Earlier", items: filteredNotifications.filter((n) => n.timeGroup === "Earlier") },
  ];

  const handleNotificationPress = async (notification: Notification) => {
    // 1. Mark as read
    await markAsRead(notification.id);

    // 2. Navigate to target screen
    if (notification.targetScreen === "Requests") {
      navigation.navigate("MainTabs", { screen: "Requests" });
    } else if (notification.targetScreen === "Bookings") {
      navigation.navigate("MainTabs", {
        screen: "Bookings",
        params: notification.targetParams,
      });
    } else if (notification.targetScreen === "Reviews") {
      navigation.navigate("MainTabs", {
        screen: "More",
        params: {
          screen: "Reviews",
        },
      });
    } else {
      navigation.navigate("MainTabs", { screen: "Overview" });
    }
  };

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <View style={styles.flex1}>
      <ScrollView contentContainerStyle={styles.pageScrollContent}>
        <PageHeader
          title="Notifications"
          sub="Stay updated on booking changes, requests, and guest feedback."
          onBack={() => navigation.goBack()}
        >
          {hasUnread && (
            <Pressable
              onPress={markAllAsRead}
              style={[styles.outlineButton, { flexDirection: "row", alignItems: "center", gap: 4 }]}
              testID="mark-all-read-btn"
            >
              <CheckCheck size={14} color="#5d7289" />
              <Text style={styles.outlineButtonText}>Mark all read</Text>
            </Pressable>
          )}
        </PageHeader>

        {/* Tab Switcher */}
        <View style={styles.requestTabRow}>
          {(["all", "unread", "read"] as const).map((tab) => {
            const isActive = activeTab === tab;
            const label = tab.charAt(0).toUpperCase() + tab.slice(1);
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.requestTabButton, isActive ? styles.requestTabButtonActive : null]}
              >
                <Text style={[styles.requestTabText, isActive ? styles.requestTabTextActive : null]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Notifications Grouped List */}
        {filteredNotifications.length > 0 ? (
          groups.map((group) => {
            if (group.items.length === 0) return null;
            return (
              <View key={group.title} style={styles.verticalGap10}>
                <Text
                  style={{
                    color: "#8193ac",
                    fontSize: 12,
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    marginTop: 8,
                    marginBottom: 2,
                  }}
                >
                  {group.title}
                </Text>
                {group.items.map((item) => {
                  const config = typeConfigs[item.type];
                  const IconComponent = config.icon;

                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => handleNotificationPress(item)}
                      style={({ pressed }) => [
                        styles.listCard,
                        pressed ? styles.listCardPressed : null,
                        {
                          backgroundColor: item.read ? "#faf6f199" : "#faf6f1",
                          borderLeftWidth: 4,
                          borderLeftColor: config.color,
                          opacity: item.read ? 0.78 : 1,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                          paddingVertical: 14,
                        },
                      ]}
                    >
                      {/* Left Icon Accent */}
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          backgroundColor: config.bgColor,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <IconComponent size={20} color={config.color} />
                      </View>

                      {/* Content */}
                      <View style={{ flex: 1, gap: 2 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Text
                            style={{
                              color: "#0f2748",
                              fontWeight: item.read ? "600" : "700",
                              fontSize: 14,
                            }}
                          >
                            {item.title}
                          </Text>
                          {!item.read && (
                            <View
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: 4,
                                backgroundColor: "#1a7f7f",
                              }}
                            />
                          )}
                        </View>
                        <Text
                          style={{
                            color: item.read ? "#64788f" : "#234058",
                            fontSize: 12.5,
                            lineHeight: 16,
                          }}
                        >
                          {item.description}
                        </Text>
                        <Text style={{ color: "#8ea0b6", fontSize: 10.5, marginTop: 2 }}>
                          {item.date}
                        </Text>

                        {/* Accept / Decline Action Buttons */}
                        {(item.type === "new_request" || item.type === "change_of_dates") && (
                          <View style={{ marginTop: 6 }}>
                            {item.outcome ? (
                              <Text
                                style={{
                                  fontSize: 11,
                                  fontWeight: "700",
                                  color: item.outcome === "accepted" ? "#0f7a4f" : "#cf3850",
                                }}
                              >
                                {item.outcome === "accepted" ? "✓ Request Accepted" : "✗ Request Declined"}
                              </Text>
                            ) : (
                              <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                                <Pressable
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    respondToRequest(item.id, "rejected");
                                  }}
                                  style={{
                                    backgroundColor: "#cf3850",
                                    paddingVertical: 5,
                                    paddingHorizontal: 12,
                                    borderRadius: 6,
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                  testID={`decline-btn-${item.id}`}
                                >
                                  <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600" }}>
                                    Decline
                                  </Text>
                                </Pressable>
                                <Pressable
                                  onPress={(e) => {
                                    e.stopPropagation();
                                    respondToRequest(item.id, "accepted");
                                  }}
                                  style={{
                                    backgroundColor: "#109c61",
                                    paddingVertical: 5,
                                    paddingHorizontal: 12,
                                    borderRadius: 6,
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                  testID={`accept-btn-${item.id}`}
                                >
                                  <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600" }}>
                                    Accept
                                  </Text>
                                </Pressable>
                              </View>
                            )}
                          </View>
                        )}
                      </View>

                      {/* Action Button: Mark read / unread */}
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation(); // prevent card tap navigate
                          if (item.read) {
                            markAsUnread(item.id);
                          } else {
                            markAsRead(item.id);
                          }
                        }}
                        style={{
                          padding: 8,
                          borderRadius: 8,
                          backgroundColor: item.read ? "#e8ebe9" : "#e6f5f4",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        testID={`mark-toggle-${item.id}`}
                      >
                        <Check size={14} color={item.read ? "#8ea0b6" : "#1a7f7f"} strokeWidth={3} />
                      </Pressable>
                    </Pressable>
                  );
                })}
              </View>
            );
          })
        ) : (
          <Card>
            <View style={{ paddingVertical: 24, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#64788f", fontSize: 14, fontWeight: "600", textAlign: "center" }}>
                No notifications found
              </Text>
              <Text style={{ color: "#8ea0b6", fontSize: 12, textAlign: "center", marginTop: 4 }}>
                {activeTab === "unread"
                  ? "You have caught up with all notifications!"
                  : activeTab === "read"
                  ? "Read notifications will appear here."
                  : "Notifications will appear here as they arrive."}
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
