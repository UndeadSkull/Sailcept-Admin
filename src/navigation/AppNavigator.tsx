import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  BookCheck,
  CalendarDays,
  LayoutGrid,
  Menu,
  MoreHorizontal,
} from "lucide-react-native";
import BookingsScreen from "../screens/BookingsScreen";
import CalendarScreen from "../screens/CalendarScreen";
import DashboardScreen from "../screens/DashboardScreen";
import RequestsScreen from "../screens/RequestsScreen";
import BoatProfileDetailScreen from "../screens/BoatProfileDetailScreen";
import UserProfileScreen from "../screens/UserProfileScreen";
import MoreStack from "./MoreStack";
import type { MainTabParamList, RootStackParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();
const Root = createNativeStackNavigator<RootStackParamList>();

const TAB_COLOR_ACTIVE = "#1a7f7f";
const TAB_COLOR_INACTIVE = "#6d8299";
const ICON_SIZE = 20;

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        animation: "shift",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#faf6f1",
          borderTopColor: "#cde3db",
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarActiveTintColor: TAB_COLOR_ACTIVE,
        tabBarInactiveTintColor: TAB_COLOR_INACTIVE,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="Overview"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <LayoutGrid size={ICON_SIZE} color={color} strokeWidth={2.2} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <CalendarDays size={ICON_SIZE} color={color} strokeWidth={2.2} />
          ),
        }}
      />
      <Tab.Screen
        name="Requests"
        component={RequestsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Menu size={ICON_SIZE} color={color} strokeWidth={2.2} />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <BookCheck size={ICON_SIZE} color={color} strokeWidth={2.2} />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreStack}
        options={{
          tabBarIcon: ({ color }) => (
            <MoreHorizontal size={ICON_SIZE} color={color} strokeWidth={2.2} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Root.Navigator screenOptions={{ headerShown: false }}>
      <Root.Screen name="MainTabs" component={MainTabs} />
      <Root.Screen
        name="BoatAssetModal"
        component={BoatProfileDetailScreen}
        options={{
          presentation: "modal",
          headerShown: false,
          title: "Boat asset",
          headerStyle: { backgroundColor: "#faf6f1" },
          headerTintColor: "#0f284e",
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: "#f5f1ed" },
        }}
      />
      <Root.Screen
        name="UserProfileModal"
        component={UserProfileScreen}
        options={{
          presentation: "modal",
          headerShown: false,
          title: "Profile",
          headerStyle: { backgroundColor: "#faf6f1" },
          headerTintColor: "#0f284e",
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: "#f5f1ed" },
        }}
      />
    </Root.Navigator>
  );
}
