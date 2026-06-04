import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { BoatProvider } from "./context/BoatContext";
import AppNavigator from "./navigation/AppNavigator";

export default function App() {
  return (
    <BoatProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <AppNavigator />
      </NavigationContainer>
    </BoatProvider>
  );
}
