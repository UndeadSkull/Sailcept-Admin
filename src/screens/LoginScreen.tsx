import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import styles from "../styles";
import { LogoFillGradient } from "../components/AppLogo";

export default function LoginScreen() {
  const { login } = useAuth();

  const [sailceptId, setSailceptId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setError("");
    const trimmedId = sailceptId.trim();
    if (!trimmedId) {
      setError("Please enter your Sailcept ID.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(trimmedId, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.flex1}
    >
      <ScrollView
        contentContainerStyle={styles.loginScrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.loginWrapper}>
          {/* Logo & Brand Section */}
          <View style={styles.loginHeader}>
            <View style={styles.loginLogoBox}>
              <LogoFillGradient size={64} />
            </View>
            <Text style={styles.loginBrandOverline}>Sailcept</Text>
            <Text style={styles.loginBrandTitle}>Operator Dashboard</Text>
          </View>

          {/* Login Card Container */}
          <View style={styles.loginCard}>
            <View style={styles.loginCardContent}>
              <Text style={styles.loginTitle}>Welcome back</Text>
              <Text style={styles.loginSub}>
                Enter your Sailcept credentials to start an authenticated operator session.
              </Text>

              {error ? (
                <View style={styles.loginErrorBox}>
                  <Text style={styles.loginErrorText}>{error}</Text>
                </View>
              ) : null}

              {/* Sailcept ID Input */}
              <View style={styles.loginInputLabelContainer}>
                <Text style={styles.loginInputLabel}>Sailcept ID</Text>
              </View>
              <View style={[styles.loginPhoneInputWrapper, { marginBottom: 14, minHeight: 46 }]}>
                <TextInput
                  style={styles.loginPhoneInput}
                  value={sailceptId}
                  onChangeText={(val) => {
                    setError("");
                    setSailceptId(val);
                  }}
                  placeholder="Enter your Sailcept ID"
                  placeholderTextColor="#8ea0b6"
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Sailcept ID input"
                />
              </View>

              {/* Password Input */}
              <View style={styles.loginInputLabelContainer}>
                <Text style={styles.loginInputLabel}>Password</Text>
              </View>
              <View style={[styles.loginPhoneInputWrapper, { marginBottom: 20, minHeight: 46 }]}>
                <TextInput
                  style={styles.loginPhoneInput}
                  value={password}
                  onChangeText={(val) => {
                    setError("");
                    setPassword(val);
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor="#8ea0b6"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  onSubmitEditing={handleLogin}
                  accessibilityLabel="Password input"
                />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.loginPrimaryButton,
                  (pressed || isSubmitting) && styles.loginPrimaryButtonPressed,
                ]}
                onPress={handleLogin}
                disabled={isSubmitting}
                accessibilityLabel="Log In Button"
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#faf6f1" />
                ) : (
                  <Text style={styles.loginPrimaryButtonText}>
                    Log In
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
