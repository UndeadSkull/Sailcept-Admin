import { useNavigation } from "@react-navigation/native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Card, PageHeader, type Request } from "../components";
import { useBoat } from "../context/BoatContext";
import type { MainTabParamList } from "../navigation/types";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import styles from "../styles";

type TabNav = BottomTabNavigationProp<MainTabParamList>;

const statsByBoat: Record<
  string,
  Array<{
    label: string;
    value: string;
    caption: string;
    tab?: keyof MainTabParamList;
    isPending?: boolean;
  }>
> = {
  "Vembanad Crest": [
    {
      label: "Open dates this month",
      value: "18",
      caption: "of 31 days",
      tab: "Calendar",
    },
    {
      label: "Pending requests",
      value: "3",
      caption: "Awaiting response",
      tab: "Requests",
      isPending: true,
    },
    {
      label: "Confirmed bookings",
      value: "11",
      caption: "This month",
      tab: "Bookings",
    },
    { label: "Revenue (month)", value: "INR 1.4L", caption: "Normal + peak" },
  ],
  "Backwater Pearl": [
    {
      label: "Open dates this month",
      value: "22",
      caption: "of 31 days",
      tab: "Calendar",
    },
    {
      label: "Pending requests",
      value: "1",
      caption: "Awaiting response",
      tab: "Requests",
      isPending: true,
    },
    {
      label: "Confirmed bookings",
      value: "6",
      caption: "This month",
      tab: "Bookings",
    },
    { label: "Revenue (month)", value: "INR 82k", caption: "Normal + peak" },
  ],
  "Kerala Dream": [
    {
      label: "Open dates this month",
      value: "14",
      caption: "of 31 days",
      tab: "Calendar",
    },
    {
      label: "Pending requests",
      value: "4",
      caption: "Awaiting response",
      tab: "Requests",
      isPending: true,
    },
    {
      label: "Confirmed bookings",
      value: "13",
      caption: "This month",
      tab: "Bookings",
    },
    { label: "Revenue (month)", value: "INR 1.9L", caption: "Normal + peak" },
  ],
};

const cruisesByBoat: Record<string, Request[]> = {
  "Vembanad Crest": [
    {
      name: "Ethan Walker",
      dateLine: "Day cruise · 15 Jan 2025",
      status: "Confirmed",
      config: "Premium · Private · 2 adults",
    },
    {
      name: "Olivia Bennett",
      dateLine: "Overnight stay · 18 Jan 2025",
      status: "Confirmed",
      config: "Luxury · Private · 4 adults",
    },
    {
      name: "Lucas Martin",
      dateLine: "Night stay · 22 Jan 2025",
      status: "Confirmed",
      config: "Premium · Shared · 6 guests",
    },
  ],
  "Backwater Pearl": [
    {
      name: "Mason Reed",
      dateLine: "Day cruise · 12 Jan 2025",
      status: "Confirmed",
      config: "Standard · Private · 3 adults",
    },
    {
      name: "Ava Stone",
      dateLine: "Night stay · 20 Jan 2025",
      status: "Confirmed",
      config: "Premium · Shared · 5 guests",
    },
  ],
  "Kerala Dream": [
    {
      name: "Noah Patel",
      dateLine: "Overnight stay · 16 Jan 2025",
      status: "Confirmed",
      config: "Luxury · Private · 4 adults",
    },
    {
      name: "Liam Carter",
      dateLine: "Day cruise · 23 Jan 2025",
      status: "Confirmed",
      config: "Premium · Private · 2 adults",
    },
  ],
};

export default function DashboardScreen() {
  const navigation = useNavigation<TabNav>();
  const { selectedBoat } = useBoat();

  const stats = statsByBoat[selectedBoat] ?? statsByBoat["Vembanad Crest"];
  const upcomingCruises =
    cruisesByBoat[selectedBoat] ?? cruisesByBoat["Vembanad Crest"];

  return (
    <View style={styles.flex1}>
      <ScrollView contentContainerStyle={styles.pageScrollContent}>
        <PageHeader
          title="Overview"
          sub={`Your houseboat performance at a glance · Boat: ${selectedBoat}`}
        />

        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <Pressable
              key={stat.label}
              onPress={
                stat.tab ? () => navigation.navigate(stat.tab!) : undefined
              }
              disabled={!stat.tab}
              style={({ pressed }) => [
                styles.statCard,
                stat.isPending ? styles.statCardPending : null,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statCaption}>{stat.caption}</Text>
            </Pressable>
          ))}
        </View>

        <Card title="Upcoming cruises">
          <View style={styles.verticalGap12}>
            {upcomingCruises.map((cruise) => (
              <Pressable
                key={cruise.name}
                onPress={() =>
                  navigation.navigate("Bookings", {
                    focusGuest: cruise.name,
                    focusToken: Date.now(),
                  })
                }
                style={({ pressed }) => [
                  styles.listCard,
                  pressed ? styles.listCardPressed : null,
                ]}
              >
                <View style={styles.rowBetweenTop}>
                  <View style={styles.flex1}>
                    <Text style={styles.listCardTitle}>{cruise.name}</Text>
                    <Text style={styles.listCardSub}>{cruise.dateLine}</Text>
                  </View>
                </View>
                <Text style={styles.listCardMeta}>{cruise.config}</Text>
              </Pressable>
            ))}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
