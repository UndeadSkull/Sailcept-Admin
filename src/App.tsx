import React, { useState } from "react";
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



  return (
    <AuthProvider>
      <BoatProvider>
        <NotificationProvider>
          <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
              <NavigationContainer
                ref={navigationRef}
                onStateChange={() => {
                  const route = navigationRef.getCurrentRoute() as { name: string } | undefined;
                  setCurrentRouteName(route ? route.name : null);
                }}
              >
                <AppHeader currentRouteName={currentRouteName} />
                <StatusBar style="light" />
                <AppNavigator />
              </NavigationContainer>
            </SafeAreaView>
          </SafeAreaProvider>
        </NotificationProvider>
      </BoatProvider>
    </AuthProvider>
  );
}
