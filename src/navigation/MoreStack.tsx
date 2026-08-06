import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MoreMenuScreen from "../screens/MoreMenuScreen";
import BoatProfilesListScreen from "../screens/BoatProfilesListScreen";
import UserProfileScreen from "../screens/UserProfileScreen";
import ReviewsScreen from "../screens/ReviewsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import LegalScreen from "../screens/LegalScreen";
import GetHelpScreen from "../screens/GetHelpScreen";
import type { MoreStackParamList } from "./types";
import { DISABLE_ANIMATIONS } from "../config/animations";

const Stack = createNativeStackNavigator<MoreStackParamList>();

export default function MoreStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F8FAFC" },
        animation: DISABLE_ANIMATIONS ? "none" : undefined,
      }}
    >
      <Stack.Screen
        name="MoreMenu"
        component={MoreMenuScreen}
        options={{ title: "More" }}
      />
      <Stack.Screen
        name="BoatProfilesList"
        component={BoatProfilesListScreen}
        options={{ title: "Boat profiles" }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ title: "Profile" }}
      />
      <Stack.Screen
        name="Reviews"
        component={ReviewsScreen}
        options={{ title: "Reviews" }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
      <Stack.Screen
        name="Legal"
        component={LegalScreen}
        options={{ title: "Legal" }}
      />
      <Stack.Screen
        name="GetHelp"
        component={GetHelpScreen}
        options={{ title: "Get Help" }}
      />
    </Stack.Navigator>
  );
}
