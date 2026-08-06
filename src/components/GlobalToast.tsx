import React, { useEffect, useRef, useState } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { AlertCircle, X } from "lucide-react-native";
import { subscribeToApiFailure } from "../services/apiClient";
import { COLORS } from "../styles";

export default function GlobalToast() {
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current; // Start 24px lower
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const hideToast = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 24,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setEndpoint(null);
    });
  };

  const showToast = (failedEndpoint: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setEndpoint(failedEndpoint);

    // Reset animations
    fadeAnim.setValue(0);
    slideAnim.setValue(24);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss after 4 seconds
    timerRef.current = setTimeout(() => {
      hideToast();
    }, 4000);
  };

  useEffect(() => {
    const unsubscribe = subscribeToApiFailure((failedEndpoint) => {
      showToast(failedEndpoint);
    });

    return () => {
      unsubscribe();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (!endpoint) return null;

  return (
    <Animated.View
      style={[
        toastStyles.toastContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
      testID="api-failure-toast"
    >
      <View style={toastStyles.toastContent}>
        <AlertCircle size={20} color={COLORS.red} style={toastStyles.icon} />
        <View style={toastStyles.textContainer}>
          <Text style={toastStyles.title}>API Request Failed</Text>
          <Text style={toastStyles.subtitle} numberOfLines={2}>
            {endpoint}
          </Text>
        </View>
        <Pressable 
          onPress={hideToast} 
          style={toastStyles.closeButton}
          testID="close-toast-button"
        >
          <X size={16} color={COLORS.muted} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const toastStyles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toastContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B", // slate-800
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.25)",
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    color: "#F8FAFC", // slate-50
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  subtitle: {
    color: "#94A3B8", // slate-400
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  closeButton: {
    padding: 4,
    marginLeft: 4,
  },
});
