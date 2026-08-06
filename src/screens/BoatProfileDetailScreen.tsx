import React, { useEffect, useState, useCallback } from "react";
import { ActivityIndicator, ScrollView, Text, View, RefreshControl } from "react-native";
import { Card, PageHeader } from "../components";
import { useBoat } from "../context/BoatContext";
import { fetchBoatDetails } from "../services/boats";
import { Boat } from "../data/boats";
import type { RootStackScreenProps } from "../navigation/types";
import { COLORS } from "../styles";
import styles from "../styles";

type Props = RootStackScreenProps<"BoatAssetModal">;

export default function BoatProfileDetailScreen({ route, navigation }: Props) {
  const { boats } = useBoat();
  const boatId = route.params.boatId ?? (boats.length > 0 ? boats[0].id : 1);
  const fallbackName = boats.find((b) => b.id === boatId)?.name || "";

  const [boat, setBoat] = useState<Boat | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await fetchBoatDetails(boatId);
      if (res.data) {
        setBoat(res.data);
      } else if (res.error) {
        setErrorMsg(res.error.message);
      }
    } catch (err) {
      setErrorMsg("Failed to load boat details");
    }
  }, [boatId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setErrorMsg(null);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setErrorMsg(null);

    fetchBoatDetails(boatId)
      .then((res) => {
        if (!isMounted) return;
        if (res.data) {
          setBoat(res.data);
        } else if (res.error) {
          setErrorMsg(res.error.message);
        }
      })
      .catch((err) => {
        if (isMounted) setErrorMsg("Failed to load boat details");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [boatId]);

  const displayTitle = boat?.name || fallbackName || `Boat #${boatId}`;

  return (
    <ScrollView 
      contentContainerStyle={styles.pageScrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.teal]} tintColor={COLORS.teal} />}
    >
      <PageHeader
        title="Boat asset definition"
        sub={`These details are permanent truths about your boat. They drive all matching logic. · Boat: ${displayTitle}`}
        onBack={() => navigation.goBack()}
      />

      {isLoading ? (
        <View style={{ paddingVertical: 40, alignItems: "center" }}>
          <ActivityIndicator size="large" color={COLORS.teal} />
        </View>
      ) : errorMsg ? (
        <Card title="Unable to load boat profile">
          <Text style={{ color: COLORS.red, padding: 12 }}>{errorMsg}</Text>
        </Card>
      ) : boat ? (
        <>
          <Card title="Identity & classification">
            <View style={styles.verticalGap10}>
              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>Boat name</Text>
                <Text style={styles.metaValue}>{boat.name}</Text>
              </View>
              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>Experience tier</Text>
                <Text style={styles.metaValue}>{boat.experienceTier || "N/A"}</Text>
              </View>
              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>Booking type</Text>
                <Text style={styles.metaValue}>{boat.bookingType || "N/A"}</Text>
              </View>
              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>Bedrooms count</Text>
                <Text style={styles.metaValue}>{boat.bedrooms} bedrooms</Text>
              </View>
              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>Max capacity (guests)</Text>
                <Text style={styles.metaValue}>{boat.maxGuests} guests</Text>
              </View>
            </View>
          </Card>

          {boat.registrationNumber && (
            <Card title="Registration & Boarding">
              <View style={styles.verticalGap10}>
                <View style={styles.metaBox}>
                  <Text style={styles.metaLabel}>Registration Number</Text>
                  <Text style={styles.metaValue}>{boat.registrationNumber}</Text>
                </View>
                {boat.boardingLocation && (
                  <View style={styles.metaBox}>
                    <Text style={styles.metaLabel}>Boarding Location</Text>
                    <Text style={styles.metaValue}>{boat.boardingLocation}</Text>
                  </View>
                )}
              </View>
            </Card>
          )}

          {boat.features && boat.features.length > 0 && (
            <Card title="Features">
              <View style={styles.pillWrap}>
                {boat.features.map((feature) => (
                  <View key={feature} style={[styles.featurePill, styles.featurePillEnabled]}>
                    <Text style={styles.featurePillEnabledText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </Card>
          )}

          {boat.cruiseTypes && boat.cruiseTypes.length > 0 && (
            <Card title="Supported cruise types" sub="Only enable cruise types you are fully equipped to deliver.">
              <View style={styles.pillWrap}>
                {boat.cruiseTypes.map((type) => (
                  <View
                    key={type.label}
                    style={[styles.featurePill, type.on ? styles.cruisePillEnabled : styles.cruisePillDisabled]}
                  >
                    <Text style={type.on ? styles.cruisePillEnabledText : styles.cruisePillDisabledText}>
                      {type.label}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          )}
        </>
      ) : null}
    </ScrollView>
  );
}
