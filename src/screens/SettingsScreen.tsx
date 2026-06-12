import React from "react";
import { ScrollView, Text, Pressable, View, Alert, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Card, PageHeader } from "../components";
import { useAuth } from "../context/AuthContext";
import styles from "../styles";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { logout } = useAuth();

  const handleResetStorage = async () => {
    const performReset = async () => {
      try {
        await AsyncStorage.clear();
        // Log out user since auth token is removed
        await logout();
      } catch (error) {
        console.error("Failed to clear AsyncStorage:", error);
      }
    };

    if (Platform.OS === "web") {
      const confirm = window.confirm(
        "Are you sure you want to reset all application data? This will clear all notifications and log you out."
      );
      if (confirm) {
        await performReset();
      }
    } else {
      Alert.alert(
        "Reset Application Data",
        "Are you sure you want to reset all application data? This will clear all notifications and log you out.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Reset", style: "destructive", onPress: performReset },
        ]
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.pageScrollContent}>
      <PageHeader
        title="Settings"
        sub="App preferences and configuration."
        onBack={() => navigation.goBack()}
      />
      <Card title="Database & Storage">
        <Text style={[styles.detailMuted, { marginBottom: 12, lineHeight: 18 }]}>
          Resetting application data will clear all locally stored data, including notification read statuses and mock actions, and log you out.
        </Text>
        <View style={{ flexDirection: "row" }}>
          <Pressable
            onPress={handleResetStorage}
            style={({ pressed }) => [
              styles.declineButton,
              pressed ? { opacity: 0.8 } : null,
              { marginTop: 4, flex: 0, paddingHorizontal: 16 },
            ]}
            testID="reset-storage-btn"
          >
            <Text style={styles.actionButtonText}>Reset Application Data</Text>
          </Pressable>
        </View>
      </Card>
    </ScrollView>
  );
}
