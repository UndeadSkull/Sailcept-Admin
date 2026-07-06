import React from "react";
import { Pressable, ScrollView, Text, View, Linking, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Phone, Mail, HelpCircle } from "lucide-react-native";
import { PageHeader } from "../components";
import { COLORS } from "../styles";

export default function GetHelpScreen() {
  const navigation = useNavigation();

  const handleCall = () => {
    Linking.openURL("tel:+919876543210").catch((err) => {
      console.error("Failed to open dialer:", err);
      Alert.alert("Error", "Could not launch phone dialer");
    });
  };

  const handleEmail = () => {
    Linking.openURL("mailto:support@sailcept.com").catch((err) => {
      console.error("Failed to open email client:", err);
      Alert.alert("Error", "Could not launch email client");
    });
  };

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 18, paddingBottom: 120 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <ArrowLeft size={20} color={COLORS.navy} />
        </Pressable>
        <Text style={{ fontSize: 22, fontWeight: "800", color: COLORS.navy }}>Need Help?</Text>
      </View>

      <View style={{ alignItems: "center", paddingVertical: 30, gap: 10 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.tealLight, alignItems: "center", justifyContent: "center" }}>
          <HelpCircle size={32} color={COLORS.teal} />
        </View>
        <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.navy, textAlign: "center" }}>
          Sailcept Operator Support
        </Text>
        <Text style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", paddingHorizontal: 30, lineHeight: 18 }}>
          Reach out to our support desk for booking changes, compliance updates, payouts or platform assistance.
        </Text>
      </View>

      <View
        style={{
          backgroundColor: COLORS.white,
          borderWidth: 1,
          borderColor: COLORS.border,
          borderRadius: 24,
          overflow: "hidden",
        }}
      >
        <Pressable
          onPress={handleCall}
          style={({ pressed }) => [
            {
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              paddingVertical: 16,
              paddingHorizontal: 18,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.border,
              backgroundColor: pressed ? COLORS.bg : "transparent",
            },
          ]}
        >
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.tealLight, alignItems: "center", justifyContent: "center" }}>
            <Phone size={18} color={COLORS.teal} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.navy }}>+91 98765 43210</Text>
            <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>Call us directly (9 AM - 6 PM)</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={handleEmail}
          style={({ pressed }) => [
            {
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              paddingVertical: 16,
              paddingHorizontal: 18,
              backgroundColor: pressed ? COLORS.bg : "transparent",
            },
          ]}
        >
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.tealLight, alignItems: "center", justifyContent: "center" }}>
            <Mail size={18} color={COLORS.teal} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.navy }}>support@sailcept.com</Text>
            <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>Send email (24/7 support)</Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}
