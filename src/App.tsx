import React, { useState, useEffect } from "react";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { BoatProvider } from "./context/BoatContext";
import AppNavigator from "./navigation/AppNavigator";
import styles from "./styles";
import AppHeader from "./components/AppHeader";

export default function App() {
  const navigationRef = useNavigationContainerRef();
  const [currentRouteName, setCurrentRouteName] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = navigationRef.addListener("state", () => {
      const route = navigationRef.getCurrentRoute() as any;
      setCurrentRouteName(route ? route.name : null);
    });
    return unsubscribe;
  }, [navigationRef]);

  return (
    <BoatProvider>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <NavigationContainer ref={navigationRef}>
            <AppHeader currentRouteName={currentRouteName} />
            <StatusBar style="dark" />
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </BoatProvider>
  );
}
