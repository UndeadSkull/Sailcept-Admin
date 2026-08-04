import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { Pressable, Text, View, TextInput, ActivityIndicator, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bell, Search, X } from "lucide-react-native";
import { useBoat } from "../context/BoatContext";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import type { RootStackParamList } from "../navigation/types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { COLORS } from "../styles";
import { searchBookingsApi } from "../services/search";
import { Booking } from "../data/bookings";
import { LogoFillWhite } from "./AppLogo";

type RootNav = NativeStackNavigationProp<RootStackParamList>;

export default function AppHeader({ currentRouteName }: { currentRouteName?: string | null }) {
  const navigation = useNavigation<RootNav>();
  const { searchQuery, setSearchQuery, searchOpen, setSearchOpen } = useBoat();
  const { isAuthenticated } = useAuth();
  const { unreadCount } = useNotification();
  const insets = useSafeAreaInsets();

  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [searchResults, setSearchResults] = useState<Booking[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the local search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(localQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [localQuery]);

  // Synchronize debouncedQuery to BoatContext searchQuery so screens filter as well
  useEffect(() => {
    setSearchQuery(debouncedQuery);
  }, [debouncedQuery, setSearchQuery]);

  // Fetch search results from dummy API on debounced query change
  useEffect(() => {
    let active = true;
    if (!debouncedQuery || debouncedQuery.trim() === "") {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchBookingsApi(debouncedQuery)
      .then((res) => {
        if (!active) return;
        if (res.data) {
          setSearchResults(res.data);
        }
      })
      .catch((err) => {
        console.error("Search API failed:", err);
      })
      .finally(() => {
        if (active) setIsSearching(false);
      });

    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  // Reset local state when search is closed
  useEffect(() => {
    if (!searchOpen) {
      setLocalQuery("");
      setDebouncedQuery("");
      setSearchResults([]);
    }
  }, [searchOpen]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <View style={{ zIndex: 9999, overflow: "visible" }}>
      <LinearGradient
        colors={["#4a1060", "#c2185b", "#e57c3a"]}
        locations={[0, 0.5, 1.0]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ paddingHorizontal: 18, paddingTop: insets.top + 14, paddingBottom: 14 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo Title */}
          <Pressable
            onPress={() => {
              navigation.navigate("MainTabs");
              setSearchQuery("");
              setSearchOpen(false);
            }}
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <LogoFillWhite size={36} color={COLORS.white} />
            <Text style={{ fontSize: 26, color: COLORS.white, fontWeight: "900", letterSpacing: -0.8 }}>
              Sailcept
            </Text>
          </Pressable>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {/* Search Icon */}
            <Pressable
              onPress={() => {
                setSearchOpen(!searchOpen);
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
      </LinearGradient>

      {/* Backdrop to close search on click outside */}
      {searchOpen && (
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            bottom: -1000,
            left: -1000,
            right: -1000,
            zIndex: 9998,
            backgroundColor: "transparent",
          }}
          onPress={() => setSearchOpen(false)}
        />
      )}

      {/* Absolute Search Input and Dropdown */}
      {searchOpen && (
        <View
          style={{
            position: "absolute",
            top: insets.top + 64,
            right: 12,
            width: "85%",
            zIndex: 10000,
            backgroundColor: "#FFFFFF",
            borderRadius: 22,
            padding: 12,
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          {/* Inner Input Wrapper */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              borderRadius: 14,
              paddingHorizontal: 16,
              height: 44,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                color: "#000000",
                fontSize: 14,
                fontWeight: "500",
                padding: 0,
              }}
              placeholder="Search name, surname or booking"
              placeholderTextColor="#94A3B8"
              value={localQuery}
              onChangeText={setLocalQuery}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus={true}
            />
            {localQuery.length > 0 && (
              <Pressable
                onPress={() => setLocalQuery("")}
                style={{ padding: 4, marginLeft: 8 }}
              >
                <X size={16} color="#94A3B8" />
              </Pressable>
            )}
          </View>

          {/* Autocomplete Dropdown */}
          {(isSearching || searchResults.length > 0 || (debouncedQuery.trim().length > 0)) && (
            <View
              style={{
                marginTop: 10,
                borderTopWidth: 1,
                borderTopColor: "#F1F5F9",
                paddingTop: 10,
              }}
            >
              {isSearching ? (
                <View style={{ paddingVertical: 20, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 }}>
                  <ActivityIndicator size="small" color="#000000" />
                  <Text style={{ color: "#64748B", fontSize: 13, fontWeight: "500" }}>Searching...</Text>
                </View>
              ) : searchResults.length > 0 ? (
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  style={{ maxHeight: 230 }}
                  contentContainerStyle={{ paddingVertical: 2 }}
                  nestedScrollEnabled={true}
                >
                  {searchResults.map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => {
                        setSearchOpen(false);
                        setLocalQuery("");
                        navigation.navigate("MainTabs", { screen: "Bookings", params: { focusBookingId: item.bookingId } });
                      }}
                      style={({ pressed }) => ({
                        paddingVertical: 10,
                        paddingHorizontal: 8,
                        borderRadius: 8,
                        marginBottom: 4,
                        backgroundColor: pressed ? "#F8FAFC" : "#FFFFFF",
                      })}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                        <Text style={{ fontWeight: "600", fontSize: 14, color: "#000000" }}>
                          {item.guest}
                        </Text>
                        <Text style={{ fontSize: 11, fontWeight: "600", color: "#64748B", textTransform: "uppercase" }}>
                          {item.boat}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={{ fontSize: 12, color: "#64748B" }}>
                          ID: {item.bookingId}
                        </Text>
                        <Text style={{ fontSize: 12, color: "#64748B" }}>
                          {item.date}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              ) : (
                <View style={{ paddingVertical: 20, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#64748B", fontSize: 13 }}>No results found</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}
