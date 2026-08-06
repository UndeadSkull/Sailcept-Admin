import React, { useState, useCallback } from "react";
import { Pressable, ScrollView, Text, View, ActivityIndicator, RefreshControl } from "react-native";
import { Ship, ChevronRight } from "lucide-react-native";
import { PageHeader } from "../components";
import { useBoat } from "../context/BoatContext";
import { COLORS } from "../styles";

export default function BoatProfilesListScreen({ navigation }: { navigation: any }) {
  const { boats, isLoading, refreshBoats } = useBoat();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshBoats();
    setRefreshing(false);
  }, [refreshBoats]);

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 18, paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.teal]} tintColor={COLORS.teal} />}
    >
      <PageHeader
        title="Boat profiles"
        sub="View boat attributes, regulatory compliance and cancellation policies."
        onBack={() => navigation.goBack()}
      />

      {isLoading ? (
        <View style={{ paddingVertical: 100, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={COLORS.teal} />
        </View>
      ) : (
        <View style={{ gap: 12, marginTop: 12 }}>
          {boats.map((b) => (
            <View
              key={b.id}
              style={{
                backgroundColor: COLORS.white,
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 20,
                overflow: "hidden",
              }}
            >
              <Pressable
                onPress={() => navigation.navigate("BoatProfileDetail", { boatId: b.id })}
                style={({ pressed }) => [
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    padding: 16,
                    backgroundColor: pressed ? COLORS.bg : COLORS.white,
                  },
                ]}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: COLORS.tealLight,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ship size={18} color={COLORS.teal} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.navy }}>{b.name}</Text>
                  <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>
                    Houseboat #{b.id}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={{ backgroundColor: COLORS.green, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 9, fontWeight: "700", color: COLORS.white, letterSpacing: 0.5 }}>ACTIVE</Text>
                  </View>
                  <ChevronRight size={16} color={COLORS.muted} />
                </View>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
