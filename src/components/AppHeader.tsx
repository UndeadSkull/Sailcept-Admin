import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ship, User } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { useBoat } from "../context/BoatContext";
import type { RootStackParamList } from "../navigation/types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import styles from "../styles";

type RootNav = NativeStackNavigationProp<RootStackParamList>;

export default function AppHeader() {
  const navigation = useNavigation<RootNav>();
  const { boats, selectedBoat, setSelectedBoat } = useBoat();
  const [boatDropdownOpen, setBoatDropdownOpen] = useState(false);

  return (
    <>
      {boatDropdownOpen ? (
        <Pressable
          onPress={() => setBoatDropdownOpen(false)}
          style={styles.dropdownBackdrop}
          testID="boat-dropdown-backdrop"
        />
      ) : null}
      <View style={styles.mobileTopBar}>
        <Pressable
          style={styles.brandRow}
          onPress={() => navigation.navigate("MainTabs")}
        >
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>≈</Text>
          </View>
          <View>
            <Text style={styles.brandOverline}>Sailcept</Text>
            <Text style={styles.brandTitle}>Admin</Text>
          </View>
        </Pressable>

        <View style={styles.headerRightSection}>
          <View style={styles.boatSwitcherWrapper}>
            <Pressable
              onPress={() => setBoatDropdownOpen(!boatDropdownOpen)}
              style={[styles.profileChip, styles.boatSwitcherChip]}
              testID="boat-selector-trigger"
            >
              <Text
                style={[styles.profileChipText, styles.boatSwitcherChipText]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {selectedBoat}
              </Text>
              <Text style={styles.dropdownArrow}>
                {boatDropdownOpen ? "▲" : "▼"}
              </Text>
            </Pressable>

            {boatDropdownOpen && (
              <View style={styles.boatDropdown}>
                {boats.map((boat) => (
                  <Pressable
                    key={boat}
                    testID={`boat-option-${boat.replace(/\s+/g, "-").toLowerCase()}`}
                    onPress={() => {
                      setSelectedBoat(boat);
                      setBoatDropdownOpen(false);
                    }}
                    style={[
                      styles.boatDropdownItem,
                      selectedBoat === boat ? styles.boatDropdownItemActive : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.boatDropdownItemText,
                        selectedBoat === boat
                          ? styles.boatDropdownItemTextActive
                          : null,
                      ]}
                    >
                      {boat}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <Pressable
            onPress={() => {
              setBoatDropdownOpen(false);
              navigation.navigate("BoatAssetModal", { boatName: selectedBoat });
            }}
            style={styles.profileChip}
            testID="header-boat-button"
          >
            <Ship size={12} color="#5d7089" />
          </Pressable>

          <Pressable
            onPress={() => {
              setBoatDropdownOpen(false);
              navigation.navigate("UserProfileModal");
            }}
            style={styles.profileChip}
            testID="header-profile-button"
          >
            <User size={12} color="#5d7089" />
          </Pressable>
        </View>
      </View>
    </>
  );
}
