import { Pressable, ScrollView, Text, View } from "react-native";
import { Ship, User, Star, FileText, Settings } from "lucide-react-native";
import { PageHeader } from "../components";
import type { MoreStackScreenProps } from "../navigation/types";
import styles from "../styles";

type MenuItem = {
  label: string;
  sub: string;
  icon: React.ReactNode;
  onPress: () => void;
};

type Props = MoreStackScreenProps<"MoreMenu">;

export default function MoreMenuScreen({ navigation }: Props) {
  const items: MenuItem[] = [
    {
      label: "Profile",
      sub: "Your account details",
      icon: <User size={20} color="#1a7f7f" strokeWidth={2} />,
      onPress: () => navigation.navigate("UserProfile"),
    },
    {
      label: "Boat profiles",
      sub: "View and edit boat asset details",
      icon: <Ship size={20} color="#1a7f7f" strokeWidth={2} />,
      onPress: () => navigation.navigate("BoatProfilesList"),
    },
    {
      label: "Reviews",
      sub: "Guest reviews and ratings",
      icon: <Star size={20} color="#1a7f7f" strokeWidth={2} />,
      onPress: () => navigation.navigate("Reviews"),
    },
    {
      label: "Invoices",
      sub: "Billing and payment history",
      icon: <FileText size={20} color="#1a7f7f" strokeWidth={2} />,
      onPress: () => navigation.navigate("Invoices"),
    },
    {
      label: "Settings",
      sub: "App preferences and notifications",
      icon: <Settings size={20} color="#1a7f7f" strokeWidth={2} />,
      onPress: () => navigation.navigate("Settings"),
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.pageScrollContent}>
      <PageHeader title="More" sub="Manage your account, boats, and app settings." />
      <View style={styles.card}>
        <View style={styles.verticalGap8}>
          {items.map((item, idx) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              style={({ pressed }) => [
                {
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  paddingVertical: 14,
                  paddingHorizontal: 4,
                  borderBottomWidth: idx < items.length - 1 ? 1 : 0,
                  borderBottomColor: "#e8ebe9",
                  opacity: pressed ? 0.60 : 1,
                },
              ]}
            >
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#e6f5f4", alignItems: "center", justifyContent: "center" }}>
                {item.icon}
              </View>
              <View style={styles.flex1}>
                <Text style={{ color: "#0f2748", fontWeight: "600", fontSize: 15 }}>{item.label}</Text>
                <Text style={{ color: "#6a7f97", fontSize: 12, marginTop: 2 }}>{item.sub}</Text>
              </View>
              <Text style={{ color: "#9aafbf", fontSize: 18 }}>›</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
