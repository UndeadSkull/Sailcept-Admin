import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View } from "react-native";
import {
  ShoppingBag,
  CalendarDays,
  LayoutGrid,
  Inbox,
  MoreHorizontal,
} from "lucide-react-native";
import BookingsScreen from "../screens/BookingsScreen";
import AvailabilityScreen from "../screens/AvailabilityScreen";
import DashboardScreen from "../screens/DashboardScreen";
import RequestsScreen from "../screens/RequestsScreen";
import BoatProfileDetailScreen from "../screens/BoatProfileDetailScreen";
import UserProfileScreen from "../screens/UserProfileScreen";
import LoginScreen from "../screens/LoginScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import MoreStack from "./MoreStack";
import BookingDetailScreen from "../screens/BookingDetailScreen";
import RequestDetailScreen from "../screens/RequestDetailScreen";
import { useAuth } from "../context/AuthContext";
import { useBoat } from "../context/BoatContext";
import type { MainTabParamList, RootStackParamList } from "./types";
import { DISABLE_ANIMATIONS } from "../config/animations";

const Tab = createBottomTabNavigator<MainTabParamList>();
const Root = createNativeStackNavigator<RootStackParamList>();

const TAB_COLOR_ACTIVE = "#1a7f7f";
const TAB_COLOR_INACTIVE = "#6d8299";
const ICON_SIZE = 20;

const renderTabIcon = (IconComponent: any, color: string, focused: boolean) => (
  <View style={{ alignItems: "center", justifyContent: "center", width: "100%", height: "100%", position: "relative" }}>
    {focused && (
      <View
        style={{
          position: "absolute",
          top: -8,
          width: 32,
          height: 3,
          backgroundColor: TAB_COLOR_ACTIVE,
          borderRadius: 1.5,
        }}
      />
    )}
    <IconComponent size={ICON_SIZE} color={color} strokeWidth={2.2} />
  </View>
);

function MainTabs() {
  const { requestsCount } = useBoat();

  return (
    <Tab.Navigator
      screenOptions={{
        animation: DISABLE_ANIMATIONS ? "none" : "shift",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
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
          tabBarIcon: ({ color, focused }) => renderTabIcon(LayoutGrid, color, focused),
        }}
      />
      <Tab.Screen
        name="Requests"
        component={RequestsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => renderTabIcon(Inbox, color, focused),
          tabBarBadge: requestsCount > 0 ? requestsCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: "#EF4444",
            color: "#FFFFFF",
            fontSize: 10,
            lineHeight: 14,
            height: 16,
            minWidth: 16,
            borderRadius: 8,
          }
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => renderTabIcon(ShoppingBag, color, focused),
        }}
      />
      <Tab.Screen
        name="Availability"
        component={AvailabilityScreen}
        options={{
          tabBarIcon: ({ color, focused }) => renderTabIcon(CalendarDays, color, focused),
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreStack}
        options={{
          tabBarIcon: ({ color, focused }) => renderTabIcon(MoreHorizontal, color, focused),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <Root.Navigator screenOptions={{ headerShown: false, animation: DISABLE_ANIMATIONS ? "none" : undefined }}>
      {!isAuthenticated ? (
        <Root.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Root.Screen name="MainTabs" component={MainTabs} />
          <Root.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{
              title: "Notifications",
              headerShown: false,
              contentStyle: { backgroundColor: "#f5f1ed" },
            }}
          />
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
          <Root.Screen
            name="BookingDetail"
            component={BookingDetailScreen}
            options={{
              title: "Booking details",
              headerShown: false,
              contentStyle: { backgroundColor: "#f5f1ed" },
            }}
          />
          <Root.Screen
            name="RequestDetail"
            component={RequestDetailScreen}
            options={{
              title: "Request details",
              headerShown: false,
              contentStyle: { backgroundColor: "#f5f1ed" },
            }}
          />
        </>
      )}
    </Root.Navigator>
  );
}
