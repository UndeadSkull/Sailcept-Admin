import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Pressable, ScrollView, Text, View, ActivityIndicator } from "react-native";
import { Card, PageHeader } from "../components";
import { useBoat } from "../context/BoatContext";
import { fetchDashboardStats, fetchUpcomingCruises, DashboardStat, UpcomingCruise } from "../services/dashboard";
import type { MainTabParamList } from "../navigation/types";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import styles from "../styles";

type TabNav = BottomTabNavigationProp<MainTabParamList>;

export default function DashboardScreen() {
  const navigation = useNavigation<TabNav>();
  const { selectedBoat, boats } = useBoat();

  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [upcomingCruises, setUpcomingCruises] = useState<UpcomingCruise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!selectedBoat) return;
    setIsLoading(true);

    Promise.all([
      fetchDashboardStats(selectedBoat),
      fetchUpcomingCruises(selectedBoat),
    ])
      .then(([statsRes, cruisesRes]) => {
        if (!active) return;
        if (statsRes.data) {
          setStats(statsRes.data);
        }
        if (cruisesRes.data) {
          setUpcomingCruises(cruisesRes.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load dashboard data:", err);
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedBoat]);

  const selectedBoatName = boats.find((b) => b.id === selectedBoat)?.name || "";

  return (
    <View style={styles.flex1}>
      <ScrollView contentContainerStyle={styles.pageScrollContent}>
        <PageHeader
          title="Overview"
          sub={`Your houseboat performance at a glance · Boat: ${selectedBoatName}`}
        />

        {isLoading ? (
          <View style={{ paddingVertical: 100, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#0c5eac" />
            <Text style={{ marginTop: 10, color: "#4f6e8c", fontSize: 14 }}>Loading performance metrics...</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsGrid}>
              {stats.map((stat) => (
                <Pressable
                  key={stat.label}
                  onPress={
                    stat.tab
                      ? () => {
                          if (stat.tab === "Availability") {
                            navigation.navigate("Availability", { selectBoatId: selectedBoat });
                          } else {
                            navigation.navigate(stat.tab as Exclude<keyof MainTabParamList, "Availability">);
                          }
                        }
                      : undefined
                  }
                  disabled={!stat.tab}
                  style={({ pressed }) => [
                    styles.statCard,
                    stat.isPending ? styles.statCardPending : null,
                    { opacity: pressed ? 0.6 : 1 },
                  ]}
                >
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statCaption}>{stat.caption}</Text>
                </Pressable>
              ))}
            </View>

            <Card title="Upcoming cruises">
              <View style={styles.verticalGap12}>
                {upcomingCruises.length === 0 ? (
                  <Text style={styles.detailMuted}>No upcoming cruises scheduled.</Text>
                ) : (
                  upcomingCruises.map((cruise) => (
                    <Pressable
                      key={cruise.name}
                      onPress={() =>
                        navigation.navigate("Bookings", {
                          focusGuest: cruise.name,
                          focusToken: Date.now(),
                        })
                      }
                      style={({ pressed }) => [
                        styles.listCard,
                        pressed ? styles.listCardPressed : null,
                      ]}
                    >
                      <View style={styles.rowBetweenTop}>
                        <View style={styles.flex1}>
                          <Text style={styles.listCardTitle}>{cruise.name}</Text>
                          <Text style={styles.listCardSub}>{cruise.dateLine}</Text>
                        </View>
                      </View>
                      <Text style={styles.listCardMeta}>{cruise.config}</Text>
                    </Pressable>
                  ))
                )}
              </View>
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}
