import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { User, Ship, Star, CreditCard, Settings, FileText, HelpCircle, LogOut, ChevronRight } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../styles";

type MenuItem = {
  label: string;
  sub: string;
  icon: React.ReactNode;
  onPress: () => void;
  isDestructive?: boolean;
};

export default function MoreMenuScreen({ navigation }: { navigation: any }) {
  const { logout } = useAuth();

  const items: MenuItem[] = [
    {
      label: "Profile",
      sub: "Operator profile details",
      icon: <User size={18} color={COLORS.teal} strokeWidth={2.2} />,
      onPress: () => navigation.navigate("UserProfile"),
    },
    {
      label: "Boat profiles",
      sub: "View and edit boat attributes & policies",
      icon: <Ship size={18} color={COLORS.teal} strokeWidth={2.2} />,
      onPress: () => navigation.navigate("BoatProfilesList"),
    },
    {
      label: "Reviews",
      sub: "Guest reviews, ratings and breakdown",
      icon: <Star size={18} color={COLORS.teal} strokeWidth={2.2} />,
      onPress: () => navigation.navigate("Reviews"),
    },
    {
      label: "Finance",
      sub: "Earnings, payouts, invoices and bank settings",
      icon: <CreditCard size={18} color={COLORS.teal} strokeWidth={2.2} />,
      onPress: () => navigation.navigate("Finance"),
    },
    {
      label: "Settings",
      sub: "Notifications, DND, security & accounts",
      icon: <Settings size={18} color={COLORS.teal} strokeWidth={2.2} />,
      onPress: () => navigation.navigate("Settings"),
    },
    {
      label: "Legal",
      sub: "Privacy policy, compliance & terms",
      icon: <FileText size={18} color={COLORS.teal} strokeWidth={2.2} />,
      onPress: () => navigation.navigate("Legal"),
    },
    {
      label: "Need Help?",
      sub: "Contact support for issues",
      icon: <HelpCircle size={18} color={COLORS.teal} strokeWidth={2.2} />,
      onPress: () => navigation.navigate("GetHelp"),
    },
    {
      label: "Log Out",
      sub: "Sign out of your account",
      icon: <LogOut size={18} color={COLORS.red} strokeWidth={2.2} />,
      onPress: () => logout(),
      isDestructive: true,
    },
  ];

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 18, paddingBottom: 120 }}>
      {/* Title */}
      <View style={{ marginBottom: 18 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", color: COLORS.navy }}>More</Text>
        <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>
          Manage your account, houseboats, finance and preferences.
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
        {items.map((item, idx) => (
          <Pressable
            key={item.label}
            onPress={item.onPress}
            style={({ pressed }) => [
              {
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                paddingVertical: 15,
                paddingHorizontal: 18,
                borderBottomWidth: idx < items.length - 1 ? 1 : 0,
                borderBottomColor: COLORS.border,
                backgroundColor: pressed ? COLORS.bg : "transparent",
              },
            ]}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: item.isDestructive ? "#FEE2E2" : COLORS.tealLight,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {item.icon}
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: item.isDestructive ? COLORS.red : COLORS.navy,
                  fontWeight: "700",
                  fontSize: 15,
                }}
              >
                {item.label}
              </Text>
              <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 3 }}>
                {item.sub}
              </Text>
            </View>
            <ChevronRight size={16} color={COLORS.muted} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
