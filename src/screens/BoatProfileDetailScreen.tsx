import React, { useState, useEffect } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View, ActivityIndicator, Alert } from "react-native";
import { Card, OptionSelect, PageHeader } from "../components";
import { useBoat } from "../context/BoatContext";
import { fetchBoatDetails, updateBoatDetails } from "../services/boats";
import type { RootStackScreenProps } from "../navigation/types";
import styles from "../styles";
import { Boat, ExperienceTier, BookingType } from "../data/boats";

const allStructuralFeatures = ["Full upper deck", "Partial deck", "Sundeck", "Balcony"];
const roomRules: Array<{ label: string; options: string[] }> = [
  { label: "Max guests", options: ["2 guests", "3 guests"] },
  { label: "Extra bed", options: ["Allowed", "Not allowed"] },
  { label: "Children", options: ["Allowed", "Not allowed"] },
];

type Props = RootStackScreenProps<"BoatAssetModal">;

export default function BoatProfileDetailScreen({ route, navigation }: Props) {
  const { selectedBoat, refreshBoats, setSelectedBoat } = useBoat();
  const boatName = route.params.boatName ?? selectedBoat;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [identity, setIdentity] = useState({
    boatName: "",
    experienceTier: "Premium" as ExperienceTier,
    bookingType: "Private only" as BookingType,
    maxGuests: 6,
    bedrooms: 2,
    maxGuestsPerRoom: "2 + 1 extra bed",
  });
  const [features, setFeatures] = useState<string[]>([]);
  const [cruiseTypes, setCruiseTypes] = useState([
    { label: "Day cruise", on: false },
    { label: "Overnight stay", on: false },
    { label: "Night stay", on: false },
  ]);
  const [roomSettings, setRoomSettings] = useState({ maxGuests: "2 guests", extraBed: "Allowed", children: "Allowed" });

  useEffect(() => {
    const loadBoatDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetchBoatDetails(boatName);
        if (response.error) {
          Alert.alert("Error", response.error.message);
        } else if (response.data) {
          const boat = response.data;
          setIdentity({
            boatName: boat.name,
            experienceTier: boat.experienceTier,
            bookingType: boat.bookingType,
            maxGuests: boat.maxGuests,
            bedrooms: boat.bedrooms,
            maxGuestsPerRoom: boat.maxGuestsPerRoom,
          });
          setFeatures(boat.features);
          setCruiseTypes(boat.cruiseTypes);
          setRoomSettings(boat.roomSettings);
        }
      } catch {
        Alert.alert("Error", "Failed to fetch boat specification details.");
      } finally {
        setIsLoading(false);
      }
    };

    loadBoatDetails();
  }, [boatName]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedBoatPayload: Partial<Boat> = {
        name: identity.boatName,
        experienceTier: identity.experienceTier,
        bookingType: identity.bookingType,
        maxGuests: identity.maxGuests,
        bedrooms: identity.bedrooms,
        maxGuestsPerRoom: identity.maxGuestsPerRoom,
        features,
        cruiseTypes,
        roomSettings,
      };

      const response = await updateBoatDetails(boatName, updatedBoatPayload);
      setIsSaving(false);

      if (response.error) {
        Alert.alert("Save Error", response.error.message);
      } else if (response.data) {
        setIsEditing(false);
        // Refresh the list of boats in the global context
        await refreshBoats();
        // If the boat name was renamed and it was the selected one, update the selection
        if (boatName === selectedBoat && identity.boatName !== selectedBoat) {
          setSelectedBoat(identity.boatName);
        }
      }
    } catch {
      setIsSaving(false);
      Alert.alert("Error", "An error occurred while saving the boat details.");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reload state from current boatName
    navigation.replace("BoatAssetModal", { boatName });
  };

  function toggleFeature(feature: string) {
    setFeatures((current) =>
      current.includes(feature) ? current.filter((f) => f !== feature) : [...current, feature],
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f6f8fa" }}>
        <ActivityIndicator size="large" color="#0c5eac" />
        <Text style={{ marginTop: 10, color: "#4f6e8c" }}>Loading boat definition...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.pageScrollContent}>
      <PageHeader
        title="Boat asset definition"
        sub={`These details are permanent truths about your boat. They drive all matching logic. · Boat: ${boatName}`}
        onBack={() => navigation.goBack()}
      >
        <View style={styles.rowGap8}>
          {isEditing ? (
            <>
              <Pressable onPress={handleCancel} disabled={isSaving} style={styles.outlineButton}>
                <Text style={styles.outlineButtonText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSave} disabled={isSaving} style={styles.softBlueButton}>
                {isSaving ? (
                  <ActivityIndicator size="small" color="#faf6f1" />
                ) : (
                  <Text style={styles.softBlueButtonText}>Save</Text>
                )}
              </Pressable>
            </>
          ) : (
            <Pressable onPress={() => setIsEditing(true)} style={styles.softBlueButton}>
              <Text style={styles.softBlueButtonText}>Edit</Text>
            </Pressable>
          )}
        </View>
      </PageHeader>

      <Card title="Identity & classification">
        <View style={styles.verticalGap10}>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Boat name</Text>
            {isEditing ? (
              <TextInput value={identity.boatName} onChangeText={(t) => setIdentity((c) => ({ ...c, boatName: t }))} style={styles.input} />
            ) : (
              <Text style={styles.metaValue}>{identity.boatName}</Text>
            )}
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Experience tier</Text>
            {isEditing ? (
              <OptionSelect value={identity.experienceTier} onChange={(v) => setIdentity((c) => ({ ...c, experienceTier: v as ExperienceTier }))} options={[{ label: "Premium", value: "Premium" }, { label: "Luxury", value: "Luxury" }, { label: "Standard", value: "Standard" }]} />
            ) : (
              <Text style={styles.metaValue}>{identity.experienceTier}</Text>
            )}
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Booking type</Text>
            {isEditing ? (
              <OptionSelect value={identity.bookingType} onChange={(v) => setIdentity((c) => ({ ...c, bookingType: v as BookingType }))} options={[{ label: "Private only", value: "Private only" }, { label: "Shared", value: "Shared" }, { label: "Private + shared", value: "Private + shared" }]} />
            ) : (
              <Text style={styles.metaValue}>{identity.bookingType}</Text>
            )}
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Max guests</Text>
            {isEditing ? (
              <TextInput value={String(identity.maxGuests)} keyboardType="numeric" onChangeText={(v) => setIdentity((c) => ({ ...c, maxGuests: Number(v) || 0 }))} style={styles.input} />
            ) : (
              <Text style={styles.metaValue}>{identity.maxGuests} persons</Text>
            )}
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Bedrooms</Text>
            {isEditing ? (
              <TextInput value={String(identity.bedrooms)} keyboardType="numeric" onChangeText={(v) => setIdentity((c) => ({ ...c, bedrooms: Number(v) || 0 }))} style={styles.input} />
            ) : (
              <Text style={styles.metaValue}>{identity.bedrooms} bedrooms</Text>
            )}
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Max guests per room</Text>
            {isEditing ? (
              <TextInput value={identity.maxGuestsPerRoom} onChangeText={(v) => setIdentity((c) => ({ ...c, maxGuestsPerRoom: v }))} style={styles.input} />
            ) : (
              <Text style={styles.metaValue}>{identity.maxGuestsPerRoom}</Text>
            )}
          </View>
        </View>
      </Card>

      <Card title="Structural features">
        {isEditing ? (
          <View style={styles.verticalGap8}>
            {allStructuralFeatures.map((feature) => {
              const enabled = features.includes(feature);
              return (
                <Pressable key={feature} style={styles.featureRow} onPress={() => toggleFeature(feature)}>
                  <Text style={styles.featureRowText}>{feature}</Text>
                  <Switch value={enabled} onValueChange={() => toggleFeature(feature)} />
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.pillWrap}>
            {allStructuralFeatures.map((feature) => {
              const enabled = features.includes(feature);
              return (
                <View key={feature} style={[styles.featurePill, enabled ? styles.featurePillEnabled : styles.featurePillDisabled]}>
                  <Text style={enabled ? styles.featurePillEnabledText : styles.featurePillDisabledText}>{feature}</Text>
                </View>
              );
            })}
          </View>
        )}
      </Card>

      <Card title="Supported cruise types" sub="Only enable cruise types you are fully equipped to deliver.">
        {isEditing ? (
          <View style={styles.verticalGap8}>
            {cruiseTypes.map((type) => (
              <View key={type.label} style={styles.featureRow}>
                <Text style={styles.featureRowText}>{type.label}</Text>
                <Switch value={type.on} onValueChange={(v) => setCruiseTypes((c) => c.map((t) => t.label === type.label ? { ...t, on: v } : t))} />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.pillWrap}>
            {cruiseTypes.map((type) => (
              <View key={type.label} style={[styles.featurePill, type.on ? styles.cruisePillEnabled : styles.cruisePillDisabled]}>
                <Text style={type.on ? styles.cruisePillEnabledText : styles.cruisePillDisabledText}>{type.label}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      <Card title="Room layout rules">
        <View style={styles.innerPanel}>
          <Text style={styles.innerPanelTitle}>Room 1</Text>
          <View style={styles.verticalGap10}>
            {roomRules.map(({ label, options }) => {
              const selectedValue = label === "Max guests" ? roomSettings.maxGuests : label === "Extra bed" ? roomSettings.extraBed : roomSettings.children;
              return (
                <View key={label}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <OptionSelect
                    value={selectedValue}
                    disabled={!isEditing}
                    onChange={(v) => setRoomSettings((c) => {
                      if (label === "Max guests") return { ...c, maxGuests: v };
                      if (label === "Extra bed") return { ...c, extraBed: v };
                      return { ...c, children: v };
                    })}
                    options={options.map((o) => ({ label: o, value: o }))}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}
