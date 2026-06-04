import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { BoatProvider } from "./context/BoatContext";
import AppNavigator from "./navigation/AppNavigator";
import styles from "./styles";
import AppHeader from "./components/AppHeader";

export default function App() {
  return (
    <BoatProvider>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <NavigationContainer>
            <AppHeader />
            <StatusBar style="dark" />
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </BoatProvider>
  );
}
