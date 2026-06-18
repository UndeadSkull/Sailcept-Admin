import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Card, OptionSelect, PageHeader } from "../components";
import { useBoat } from "../context/BoatContext";
import BoatProfilesListScreen from "../screens/BoatProfilesListScreen";
import InvoicesScreen from "../screens/InvoicesScreen";
import MoreMenuScreen from "../screens/MoreMenuScreen";
import ReviewsScreen from "../screens/ReviewsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import UserProfileScreen from "../screens/UserProfileScreen";
import styles from "../styles";
import type { MoreStackParamList, MoreStackScreenProps } from "./types";
import { DISABLE_ANIMATIONS } from "../config/animations";

const Stack = createNativeStackNavigator<MoreStackParamList>();

const allStructuralFeatures = [
  "Full upper deck",
  "Partial deck",
  "Sundeck",
  "Balcony",
];
const roomRules: Array<{ label: string; options: string[] }> = [
  { label: "Max guests", options: ["2 guests", "3 guests"] },
  { label: "Extra bed", options: ["Allowed", "Not allowed"] },
  { label: "Children", options: ["Allowed", "Not allowed"] },
];

function BoatProfileDetailInStack({
  route,
  navigation,
}: MoreStackScreenProps<"BoatProfileDetail">) {
  const { selectedBoat, boats } = useBoat();
  const boatId = route.params.boatId ?? selectedBoat;
  const boatName = boats.find((b) => b.id === boatId)?.name || "";

  const [isEditing, setIsEditing] = useState(false);
  const identity = {
    boatName,
    experienceTier: "Premium",
    bookingType: "Private only",
    maxGuests: 6,
    bedrooms: 2,
    maxGuestsPerRoom: "2 + 1 extra bed",
  };
  const features = ["Full upper deck", "Sundeck"];
  const cruiseTypes = [
    { label: "Day cruise", on: true },
    { label: "Overnight stay", on: true },
    { label: "Night stay", on: false },
  ];
  const [roomSettings, setRoomSettings] = useState({
    maxGuests: "2 guests",
    extraBed: "Allowed",
    children: "Allowed",
  });

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
              <Pressable
                onPress={() => setIsEditing(false)}
                style={styles.outlineButton}
              >
                <Text style={styles.outlineButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => setIsEditing(false)}
                style={styles.softBlueButton}
              >
                <Text style={styles.softBlueButtonText}>Save</Text>
              </Pressable>
            </>
          ) : null}
        </View>
      </PageHeader>

      <Card title="Identity & classification">
        <View style={styles.verticalGap10}>
          {[
            {
              label: "Boat name",
              value: identity.boatName,
              key: "boatName" as const,
            },
            { label: "Experience tier", value: identity.experienceTier },
            { label: "Booking type", value: identity.bookingType },
            { label: "Max guests", value: `${identity.maxGuests} persons` },
            { label: "Bedrooms", value: `${identity.bedrooms} bedrooms` },
            { label: "Max guests per room", value: identity.maxGuestsPerRoom },
          ].map(({ label, value }) => (
            <View key={label} style={styles.metaBox}>
              <Text style={styles.metaLabel}>{label}</Text>
              <Text style={styles.metaValue}>{value}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card title="Structural features">
        <View style={styles.pillWrap}>
          {allStructuralFeatures.map((feature) => {
            const enabled = features.includes(feature);
            return (
              <View
                key={feature}
                style={[
                  styles.featurePill,
                  enabled
                    ? styles.featurePillEnabled
                    : styles.featurePillDisabled,
                ]}
              >
                <Text
                  style={
                    enabled
                      ? styles.featurePillEnabledText
                      : styles.featurePillDisabledText
                  }
                >
                  {feature}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

      <Card
        title="Supported cruise types"
        sub="Only enable cruise types you are fully equipped to deliver."
      >
        <View style={styles.pillWrap}>
          {cruiseTypes.map((type) => (
            <View
              key={type.label}
              style={[
                styles.featurePill,
                type.on ? styles.cruisePillEnabled : styles.cruisePillDisabled,
              ]}
            >
              <Text
                style={
                  type.on
                    ? styles.cruisePillEnabledText
                    : styles.cruisePillDisabledText
                }
              >
                {type.label}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <Card title="Room layout rules">
        <View style={styles.innerPanel}>
          <Text style={styles.innerPanelTitle}>Room 1</Text>
          <View style={styles.verticalGap10}>
            {roomRules.map(({ label, options }) => {
              const selectedValue =
                label === "Max guests"
                  ? roomSettings.maxGuests
                  : label === "Extra bed"
                    ? roomSettings.extraBed
                    : roomSettings.children;
              return (
                <View key={label}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <OptionSelect
                    value={selectedValue}
                    disabled={!isEditing}
                    onChange={(v) =>
                      setRoomSettings((c) => {
                        if (label === "Max guests")
                          return { ...c, maxGuests: v };
                        if (label === "Extra bed") return { ...c, extraBed: v };
                        return { ...c, children: v };
                      })
                    }
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

export default function MoreStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#f5f1ed" },
        animation: DISABLE_ANIMATIONS ? "none" : undefined,
      }}
    >
      <Stack.Screen
        name="MoreMenu"
        component={MoreMenuScreen}
        options={{ title: "More" }}
      />
      <Stack.Screen
        name="BoatProfilesList"
        component={BoatProfilesListScreen}
        options={{ title: "Boat profiles" }}
      />
      <Stack.Screen
        name="BoatProfileDetail"
        component={BoatProfileDetailInStack}
        options={{ title: "Boat asset" }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ title: "Profile" }}
      />
      <Stack.Screen
        name="Reviews"
        component={ReviewsScreen}
        options={{ title: "Reviews" }}
      />
      <Stack.Screen
        name="Invoices"
        component={InvoicesScreen}
        options={{ title: "Invoices" }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
    </Stack.Navigator>
  );
}
