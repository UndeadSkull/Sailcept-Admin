import { useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { Card, OptionSelect, PageHeader } from "../components";
import { useBoat } from "../context/BoatContext";
import type { RootStackScreenProps } from "../navigation/types";
import styles from "../styles";

const allStructuralFeatures = ["Full upper deck", "Partial deck", "Sundeck", "Balcony"];

type Props = RootStackScreenProps<"BoatAssetModal">;

export default function BoatProfileDetailScreen({ route, navigation }: Props) {
  const { boats } = useBoat();
  const boatId = route.params.boatId ?? (boats.length > 0 ? boats[0].id : 1);
  const boatName = boats.find((b) => b.id === boatId)?.name || "";

  const [isEditing, setIsEditing] = useState(false);
  const [identity, setIdentity] = useState({
    boatName,
    experienceTier: "Premium",
    bookingType: "Private only",
    maxCapacity: 6,
    bedroomsCount: 2,
    bedsCount: 4,
    extraBedsCount: 1,
    extraCotsCount: 1,
    maxPassengerCapacityCert: 12,
    crewCountExcludingCaptain: 2,
  });
  const [features, setFeatures] = useState<string[]>(["Full upper deck", "Sundeck"]);
  const [cruiseTypes, setCruiseTypes] = useState([
    { label: "Day cruise", on: true },
    { label: "Overnight stay", on: true },
    { label: "Night stay", on: false },
  ]);

  function toggleFeature(feature: string) {
    setFeatures((current) =>
      current.includes(feature) ? current.filter((f) => f !== feature) : [...current, feature],
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
              <Pressable onPress={() => setIsEditing(false)} style={styles.outlineButton}>
                <Text style={styles.outlineButtonText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={() => setIsEditing(false)} style={styles.softBlueButton}>
                <Text style={styles.softBlueButtonText}>Save</Text>
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
              <OptionSelect value={identity.experienceTier} onChange={(v) => setIdentity((c) => ({ ...c, experienceTier: v }))} options={[{ label: "Premium", value: "Premium" }, { label: "Luxury", value: "Luxury" }, { label: "Standard", value: "Standard" }]} />
            ) : (
              <Text style={styles.metaValue}>{identity.experienceTier}</Text>
            )}
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Booking type</Text>
            {isEditing ? (
              <OptionSelect value={identity.bookingType} onChange={(v) => setIdentity((c) => ({ ...c, bookingType: v }))} options={[{ label: "Private only", value: "Private only" }, { label: "Shared", value: "Shared" }, { label: "Private + shared", value: "Private + shared" }]} />
            ) : (
              <Text style={styles.metaValue}>{identity.bookingType}</Text>
            )}
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Bedrooms count</Text>
            {isEditing ? (
              <TextInput value={String(identity.bedroomsCount)} keyboardType="numeric" onChangeText={(v) => setIdentity((c) => ({ ...c, bedroomsCount: Number(v) || 0 }))} style={styles.input} />
            ) : (
              <Text style={styles.metaValue}>{identity.bedroomsCount} bedrooms</Text>
            )}
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Max capacity (guests)</Text>
            {isEditing ? (
              <TextInput value={String(identity.maxCapacity)} keyboardType="numeric" onChangeText={(v) => setIdentity((c) => ({ ...c, maxCapacity: Number(v) || 0 }))} style={styles.input} />
            ) : (
              <Text style={styles.metaValue}>{identity.maxCapacity} guests</Text>
            )}
          </View>
        </View>
      </Card>

      <Card title="Aggregate capacity & crew" sub="Boat-wide layout metrics and capacity limits.">
        <View style={styles.verticalGap10}>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Beds count</Text>
            {isEditing ? (
              <TextInput value={String(identity.bedsCount)} keyboardType="numeric" onChangeText={(v) => setIdentity((c) => ({ ...c, bedsCount: Number(v) || 0 }))} style={styles.input} />
            ) : (
              <Text style={styles.metaValue}>{identity.bedsCount} beds</Text>
            )}
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Extra beds count</Text>
            {isEditing ? (
              <TextInput value={String(identity.extraBedsCount)} keyboardType="numeric" onChangeText={(v) => setIdentity((c) => ({ ...c, extraBedsCount: Number(v) || 0 }))} style={styles.input} />
            ) : (
              <Text style={styles.metaValue}>{identity.extraBedsCount} extra beds allowed</Text>
            )}
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Extra cots count</Text>
            {isEditing ? (
              <TextInput value={String(identity.extraCotsCount)} keyboardType="numeric" onChangeText={(v) => setIdentity((c) => ({ ...c, extraCotsCount: Number(v) || 0 }))} style={styles.input} />
            ) : (
              <Text style={styles.metaValue}>{identity.extraCotsCount} extra cots allowed</Text>
            )}
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Max passenger capacity certificate</Text>
            {isEditing ? (
              <TextInput value={String(identity.maxPassengerCapacityCert)} keyboardType="numeric" onChangeText={(v) => setIdentity((c) => ({ ...c, maxPassengerCapacityCert: Number(v) || 0 }))} style={styles.input} />
            ) : (
              <Text style={styles.metaValue}>{identity.maxPassengerCapacityCert} passengers max</Text>
            )}
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Crew count (excluding captain)</Text>
            {isEditing ? (
              <TextInput value={String(identity.crewCountExcludingCaptain)} keyboardType="numeric" onChangeText={(v) => setIdentity((c) => ({ ...c, crewCountExcludingCaptain: Number(v) || 0 }))} style={styles.input} />
            ) : (
              <Text style={styles.metaValue}>{identity.crewCountExcludingCaptain} members</Text>
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
    </ScrollView>
  );
}
