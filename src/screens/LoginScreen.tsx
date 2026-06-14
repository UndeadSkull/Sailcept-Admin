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

export default function LoginScreen() {
  const { login } = useAuth();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    setError("");
    const trimmedUser = username.trim();
    if (!trimmedUser) {
      setError("Please enter your username.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (trimmedUser.toLowerCase() === "admin" && password === "password") {
        await login(trimmedUser, password);
      } else {
        setError("Invalid username or password. Use 'admin' and 'password' for testing.");
        setIsSubmitting(false);
      }
    } catch (err) {
      setError("Authentication failed. Please try again.");
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
              <Text style={styles.loginLogoText}>≈</Text>
            </View>
            <Text style={styles.loginBrandOverline}>Sailcept</Text>
            <Text style={styles.loginBrandTitle}>Admin Dashboard</Text>
          </View>

          {/* Login Card Container */}
          <View style={styles.loginCard}>
            <View style={styles.loginCardContent}>
              <Text style={styles.loginTitle}>Welcome back</Text>
              <Text style={styles.loginSub}>
                Enter your credentials to access your operator dashboard.
              </Text>

              {error ? (
                <View style={styles.loginErrorBox}>
                  <Text style={styles.loginErrorText}>{error}</Text>
                </View>
              ) : null}

              {/* Username Input */}
              <View style={styles.loginInputLabelContainer}>
                <Text style={styles.loginInputLabel}>Username</Text>
              </View>
              <View style={[styles.loginPhoneInputWrapper, { marginBottom: 14, minHeight: 46 }]}>
                <TextInput
                  style={styles.loginPhoneInput}
                  value={username}
                  onChangeText={(val) => {
                    setError("");
                    setUsername(val);
                  }}
                  placeholder="Enter your username"
                  placeholderTextColor="#8ea0b6"
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Username input"
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

          {/* Tester Helper Box */}
          <View style={styles.loginTesterHelper}>
            <Text style={styles.loginTesterHelperTitle}>Tester Note:</Text>
            <Text style={styles.loginTesterHelperText}>
              • Enter username <Text style={{ fontWeight: "800" }}>admin</Text>{"\n"}
              • Enter password <Text style={{ fontWeight: "800" }}>password</Text> to authenticate.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
