import React, { useState, useRef, useCallback } from "react";
import { ScrollView, Text, View, Pressable, Animated, RefreshControl } from "react-native";
import { useNavigation, type NavigationProp, type ParamListBase } from "@react-navigation/native";
import { ArrowLeft, Check, CheckCircle2, XCircle } from "lucide-react-native";
import { useNotification } from "../context/NotificationContext";
import { Notification } from "../data/notifications";
import { COLORS } from "../styles";

// Animated Card Component with touch scale and opacity spring transitions
function AnimatedNotificationCard({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress: () => void;
  style?: any;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.97,
        useNativeDriver: true,
        speed: 25,
        bounciness: 4,
      }),
      Animated.timing(opacity, {
        toValue: 0.88,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[style, { transform: [{ scale }], opacity }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

// Animated Action Button Component with spring bounce
function AnimatedActionButton({
  onPress,
  children,
  style,
  testID,
}: {
  onPress: (e: any) => void;
  children: React.ReactNode;
  style?: any;
  testID?: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.82,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 24,
      bounciness: 8,
    }).start();
  };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} testID={testID}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { notifications, refreshNotifications, markAsRead, markAsUnread, markAllAsRead } = useNotification();
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  }, [refreshNotifications]);

  // Tab filtering
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "pending") return !n.read;
    return n.read;
  });

  // Group notifications by date header string
  const groupedMap: Record<string, Notification[]> = {};
  filteredNotifications.forEach((n) => {
    const key = n.timeGroup || n.date || "EARLIER";
    if (!groupedMap[key]) groupedMap[key] = [];
    groupedMap[key].push(n);
  });

  const groupKeys = Object.keys(groupedMap);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationConfig = (type: Notification["type"]) => {
    if (type === "cancellation") {
      return {
        accentColor: "#EF4444",
        bgColor: "#FEE2E2",
        icon: XCircle,
        iconColor: "#EF4444",
      };
    }
    return {
      accentColor: COLORS.teal,
      bgColor: "#DCFCE7",
      icon: CheckCircle2,
      iconColor: COLORS.teal,
    };
  };

  const handleNotificationPress = async (notification: Notification) => {
    await markAsRead(notification.id);

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
        params: { screen: "Reviews" },
      });
    } else {
      navigation.navigate("MainTabs", { screen: "Overview" });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.teal]} tintColor={COLORS.teal} />}
      >
        
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Pressable onPress={() => navigation.goBack()} style={{ padding: 4 }} testID="back-btn">
              <ArrowLeft size={22} color={COLORS.navy} />
            </Pressable>
            <Text style={{ fontSize: 26, fontWeight: "800", color: COLORS.navy }}>Notifications</Text>
          </View>

          {unreadCount > 0 && (
            <AnimatedActionButton
              onPress={markAllAsRead}
              style={{
                borderWidth: 1.5,
                borderColor: COLORS.teal,
                backgroundColor: "#F0FDFA",
                borderRadius: 999,
                paddingHorizontal: 14,
                paddingVertical: 7,
              }}
              testID="mark-all-read-btn"
            >
              <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.teal }}>Mark all as read</Text>
            </AnimatedActionButton>
          )}
        </View>

        {/* Tab Switcher */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 14 }}>
          <Pressable
            onPress={() => setActiveTab("pending")}
            style={{
              flex: 1,
              backgroundColor: activeTab === "pending" ? "#DCFCE7" : COLORS.white,
              borderWidth: activeTab === "pending" ? 1.5 : 1,
              borderColor: activeTab === "pending" ? COLORS.teal : COLORS.border,
              borderRadius: 999,
              paddingVertical: 12,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: activeTab === "pending" ? COLORS.teal : COLORS.muted,
              }}
            >
              Pending
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab("history")}
            style={{
              flex: 1,
              backgroundColor: activeTab === "history" ? "#DCFCE7" : COLORS.white,
              borderWidth: activeTab === "history" ? 1.5 : 1,
              borderColor: activeTab === "history" ? COLORS.teal : COLORS.border,
              borderRadius: 999,
              paddingVertical: 12,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: activeTab === "history" ? COLORS.teal : COLORS.muted,
              }}
            >
              History
            </Text>
          </Pressable>
        </View>

        {/* Unread Info Text */}
        <Text style={{ fontSize: 13, color: COLORS.muted, marginBottom: 16 }}>
          {unreadCount > 0 ? `${unreadCount} to mark as read` : "No pending items to mark as read"}
        </Text>

        {/* Notifications List Grouped By Date */}
        {groupKeys.length > 0 ? (
          groupKeys.map((groupDate) => {
            const items = groupedMap[groupDate];
            return (
              <View key={groupDate} style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "800",
                    color: "#64748B",
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                    marginBottom: 10,
                  }}
                >
                  {groupDate}
                </Text>

                {items.map((item) => {
                  const config = getNotificationConfig(item.type);
                  const IconComponent = config.icon;

                  return (
                    <AnimatedNotificationCard
                      key={item.id}
                      onPress={() => handleNotificationPress(item)}
                      style={{
                        backgroundColor: COLORS.white,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: COLORS.border,
                        borderLeftWidth: 4,
                        borderLeftColor: config.accentColor,
                        padding: 16,
                        marginBottom: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 14,
                      }}
                    >
                      {/* Left Icon Badge */}
                      <View
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 21,
                          backgroundColor: config.bgColor,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <IconComponent size={20} color={config.iconColor} />
                      </View>

                      {/* Content */}
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.navy }}>
                            {item.title}
                          </Text>
                          {!item.read && (
                            <View
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: 3.5,
                                backgroundColor: COLORS.teal,
                              }}
                            />
                          )}
                        </View>
                        <Text
                          style={{
                            fontSize: 12.5,
                            color: COLORS.muted,
                            marginTop: 4,
                            lineHeight: 18,
                          }}
                        >
                          {item.description}
                        </Text>
                      </View>

                      {/* Right Action Button (Checkmark to mark read/unread) */}
                      <AnimatedActionButton
                        onPress={(e) => {
                          e.stopPropagation();
                          if (item.read) {
                            markAsUnread(item.id);
                          } else {
                            markAsRead(item.id);
                          }
                        }}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: "#DCFCE7",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        testID={`mark-toggle-${item.id}`}
                      >
                        <Check size={16} color={COLORS.teal} strokeWidth={3} />
                      </AnimatedActionButton>
                    </AnimatedNotificationCard>
                  );
                })}
              </View>
            );
          })
        ) : (
          <View
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: COLORS.border,
              paddingVertical: 40,
              paddingHorizontal: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.navy }}>No notifications</Text>
            <Text style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", marginTop: 4 }}>
              {activeTab === "pending"
                ? "You have caught up with all notifications!"
                : "No notifications in history."}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
