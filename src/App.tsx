import React, { useState, useEffect } from "react";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { BoatProvider } from "./context/BoatContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import AppNavigator from "./navigation/AppNavigator";
import styles from "./styles";
import AppHeader from "./components/AppHeader";

export default function App() {
  const navigationRef = useNavigationContainerRef();
  const [currentRouteName, setCurrentRouteName] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = navigationRef.addListener("state", () => {
      const route = navigationRef.getCurrentRoute() as { name: string } | undefined;
      setCurrentRouteName(route ? route.name : null);
    });
    return unsubscribe;
  }, [navigationRef]);

  return (
    <AuthProvider>
      <BoatProvider>
        <NotificationProvider>
          <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea}>
              <NavigationContainer ref={navigationRef}>
                <AppHeader currentRouteName={currentRouteName} />
                <StatusBar style="dark" />
                <AppNavigator />
              </NavigationContainer>
            </SafeAreaView>
          </SafeAreaProvider>
        </NotificationProvider>
      </BoatProvider>
    </AuthProvider>
  );
}
