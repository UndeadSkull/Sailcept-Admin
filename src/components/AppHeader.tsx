import React from "react";
import { useNavigation } from "@react-navigation/native";
import { Pressable, Text, View, Platform, ActionSheetIOS } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useBoat } from "../context/BoatContext";
import type { RootStackParamList } from "../navigation/types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import styles from "../styles";

type RootNav = NativeStackNavigationProp<RootStackParamList>;

export default function AppHeader({ currentRouteName }: { currentRouteName: string | null }) {
  const navigation = useNavigation<RootNav>();
  const { boats, selectedBoat, setSelectedBoat } = useBoat();

  // If navigation is not initialized yet, default to showing the selector
  // (since the initial route is "Overview")
  const showBoatSelector = currentRouteName === null || currentRouteName === "Overview" || currentRouteName === "Enquiries";

  return (
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
        {showBoatSelector && (
          <View style={styles.boatSwitcherWrapper}>
            <Pressable
              onPress={() => {
                if (Platform.OS === "ios") {
                  ActionSheetIOS.showActionSheetWithOptions(
                    {
                      options: [...boats, "Cancel"],
                      cancelButtonIndex: boats.length,
                      title: "Select Boat",
                    },
                    (buttonIndex) => {
                      if (buttonIndex < boats.length) {
                        setSelectedBoat(boats[buttonIndex]);
                      }
                    }
                  );
                }
              }}
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
              <Text style={styles.dropdownArrow}>▼</Text>
            </Pressable>

            {Platform.OS !== "ios" && (
              <Picker
                selectedValue={selectedBoat}
                onValueChange={(itemValue) => setSelectedBoat(itemValue)}
                style={styles.pickerOverlay}
                testID="boat-picker"
              >
                {boats.map((boat) => (
                  <Picker.Item key={boat} label={boat} value={boat} />
                ))}
              </Picker>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
