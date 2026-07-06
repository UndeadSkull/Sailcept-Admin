import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Pressable, Text, View, TextInput, Modal, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Bell, Search, X, ChevronDown } from "lucide-react-native";
import { useBoat } from "../context/BoatContext";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import type { RootStackParamList } from "../navigation/types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { COLORS } from "../styles";

type RootNav = NativeStackNavigationProp<RootStackParamList>;

export default function AppHeader({ currentRouteName }: { currentRouteName: string | null }) {
  const navigation = useNavigation<RootNav>();
  const { boats, selectedBoat, setSelectedBoat, searchQuery, setSearchQuery, searchOpen, setSearchOpen } = useBoat();
  const { isAuthenticated } = useAuth();
  const { unreadCount } = useNotification();
  const [boatDropdownOpen, setBoatDropdownOpen] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  // Define selected boat display text
  const selectedBoatName = selectedBoat === 0 ? "All Houseboats" : boats.find((b) => b.id === selectedBoat)?.name || "";

  return (
    <View style={{ zIndex: 100 }}>
      <LinearGradient
        colors={["#1a0533", "#4a1060", "#c2185b", "#e57c3a", "#1a0533"]}
        locations={[0, 0.3, 0.6, 0.85, 1.0]}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.9, y: 0.9 }}
        style={{ paddingHorizontal: 18, paddingVertical: 14 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo Title */}
          <Pressable onPress={() => { navigation.navigate("MainTabs"); setSearchQuery(""); setSearchOpen(false); }}>
            <Text style={{ fontSize: 22, color: COLORS.white, fontWeight: "900", letterSpacing: -0.8 }}>
              Sailcept
            </Text>
          </Pressable>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {/* Search Icon */}
            <Pressable
              onPress={() => {
                setSearchOpen(!searchOpen);
                setBoatDropdownOpen(false);
              }}
              style={{
                width: 36,
                height: 36,
                backgroundColor: COLORS.white,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Search size={16} color={COLORS.teal} strokeWidth={2.5} />
            </Pressable>

            {/* Boat Dropdown Selector */}
            <Pressable
              onPress={() => {
                setBoatDropdownOpen(!boatDropdownOpen);
                setSearchOpen(false);
              }}
              style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 4 }}
            >
              <Text style={{ fontSize: 13, fontWeight: "800", color: COLORS.white }}>
                {selectedBoatName}
              </Text>
              <ChevronDown size={14} color={COLORS.white} strokeWidth={2.5} />
            </Pressable>

            {/* Notification Bell */}
            <Pressable
              onPress={() => navigation.navigate("Notifications")}
              style={{
                position: "relative",
                width: 36,
                height: 36,
                backgroundColor: COLORS.white,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Bell size={16} color={COLORS.teal} strokeWidth={2.5} />
              {unreadCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 8,
                    height: 8,
                    backgroundColor: COLORS.red,
                    borderRadius: 4,
                  }}
                />
              )}
            </Pressable>
          </View>
        </View>

        {/* Search Input field */}
        {searchOpen && (
          <View
            style={{
              marginTop: 12,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <Search size={16} color={COLORS.white} />
            <TextInput
              style={{
                marginLeft: 8,
                flex: 1,
                color: COLORS.white,
                fontSize: 13,
                fontWeight: "500",
                padding: 0,
              }}
              placeholder="Search guest name or booking ID..."
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")} style={{ padding: 4 }}>
                <X size={14} color={COLORS.white} />
              </Pressable>
            )}
          </View>
        )}
      </LinearGradient>

      {/* Boat Selection Dropdown List Modal Overlay */}
      {boatDropdownOpen && (
        <Modal
          transparent
          visible={boatDropdownOpen}
          animationType="none"
          onRequestClose={() => setBoatDropdownOpen(false)}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setBoatDropdownOpen(false)}
          />
          <View
            style={{
              position: "absolute",
              top: 56, // below the header elements
              right: 18,
              backgroundColor: COLORS.white,
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 12,
              paddingVertical: 6,
              zIndex: 100,
              minWidth: 160,
              shadowColor: COLORS.navy,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <Pressable
              onPress={() => {
                setSelectedBoat(0);
                setBoatDropdownOpen(false);
              }}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: selectedBoat === 0 ? COLORS.tealLight : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: selectedBoat === 0 ? "700" : "500",
                  color: selectedBoat === 0 ? COLORS.teal : COLORS.navy,
                }}
              >
                All Houseboats
              </Text>
            </Pressable>
            {boats.map((b) => (
              <Pressable
                key={b.id}
                onPress={() => {
                  setSelectedBoat(b.id);
                  setBoatDropdownOpen(false);
                }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: selectedBoat === b.id ? COLORS.tealLight : "transparent",
                  borderTopWidth: 1,
                  borderTopColor: COLORS.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: selectedBoat === b.id ? "700" : "500",
                    color: selectedBoat === b.id ? COLORS.teal : COLORS.navy,
                  }}
                >
                  {b.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </Modal>
      )}
    </View>
  );
}
