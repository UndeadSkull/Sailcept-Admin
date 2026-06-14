import React from "react";
import { Pressable, ScrollView, Text, View, ActivityIndicator } from "react-native";
import { Ship } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { Card, PageHeader } from "../components";
import { useAuth } from "../context/AuthContext";
import { useBoat } from "../context/BoatContext";
import styles from "../styles";

export default function UserProfileScreen() {
  const navigation = useNavigation();
  const { logout, user, isLoading: authLoading } = useAuth();
  const { boats, isLoading: boatsLoading } = useBoat();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const isPageLoading = authLoading || boatsLoading;

  return (
    <ScrollView contentContainerStyle={styles.pageScrollContent}>
      <PageHeader
        title="Profile"
        sub="View user details and registered boat list."
        onBack={() => navigation.goBack()}
      />
      {isPageLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 200 }}>
          <ActivityIndicator size="large" color="#0c5eac" />
        </View>
      ) : (
        <>
          <Card title="User details">
            <View style={styles.verticalGap10}>
              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>Name</Text>
                <Text style={styles.metaValue}>{user?.name ?? "—"}</Text>
              </View>
              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>Phone number</Text>
                <Text style={styles.metaValue}>{user?.phone ?? "—"}</Text>
              </View>
              <View style={styles.metaBox}>
                <Text style={styles.metaLabel}>Email</Text>
                <Text style={styles.metaValue}>{user?.email ?? "—"}</Text>
              </View>
            </View>
          </Card>
          <Card title="Boat list">
            <View style={styles.verticalGap8}>
              {boats.map((boat) => (
                <View key={boat.id} style={styles.profileBoatRow}>
                  <Ship size={13} color="#0c5eac" strokeWidth={2.2} />
                  <Text style={styles.profileBoatText}>{boat.name}</Text>
                </View>
              ))}
            </View>
          </Card>

          <Pressable
            style={({ pressed }) => [
              styles.loginLogoutButton,
              pressed && styles.loginLogoutButtonPressed,
            ]}
            onPress={handleLogout}
            accessibilityLabel="Sign out of your account"
          >
            <Text style={styles.loginLogoutButtonText}>Sign Out</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}
