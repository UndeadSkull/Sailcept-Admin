import React, { useState, useRef, useEffect } from "react";
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

interface FormContainerProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  formRef: React.RefObject<HTMLFormElement | null>;
}

function FormContainer({ children, onSubmit, formRef }: FormContainerProps) {
  if (Platform.OS === "web") {
    return (
      <form
        ref={formRef}
        onSubmit={onSubmit}
        action="#"
        method="post"
        style={{ display: "flex", flexDirection: "column", width: "100%", margin: 0, padding: 0 }}
      >
        {children}
        <button
          type="submit"
          style={{ display: "none" }}
          tabIndex={-1}
          aria-hidden="true"
        />
      </form>
    );
  }
  return <View style={{ width: "100%" }}>{children}</View>;
}

export default function LoginScreen() {
  const { login } = useAuth();

  const [sailceptId, setSailceptId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const idInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Synchronize browser autofill with React state and ensure DOM attributes on web
  useEffect(() => {
    if (Platform.OS === "web") {
      const idEl = idInputRef.current as unknown as HTMLInputElement | null;
      const pwdEl = passwordInputRef.current as unknown as HTMLInputElement | null;

      const handleIdInput = () => {
        if (idEl) setSailceptId(idEl.value);
      };
      const handlePwdInput = () => {
        if (pwdEl) setPassword(pwdEl.value);
      };

      if (idEl) {
        idEl.setAttribute("name", "username");
        idEl.setAttribute("autocomplete", "username");
        idEl.addEventListener("input", handleIdInput);
        idEl.addEventListener("change", handleIdInput);
        if (idEl.value) {
          setSailceptId(idEl.value);
        }
      }

      if (pwdEl) {
        pwdEl.setAttribute("name", "password");
        pwdEl.setAttribute("autocomplete", "current-password");
        pwdEl.addEventListener("input", handlePwdInput);
        pwdEl.addEventListener("change", handlePwdInput);
        if (pwdEl.value) {
          setPassword(pwdEl.value);
        }
      }

      return () => {
        if (idEl) {
          idEl.removeEventListener("input", handleIdInput);
          idEl.removeEventListener("change", handleIdInput);
        }
        if (pwdEl) {
          pwdEl.removeEventListener("input", handlePwdInput);
          pwdEl.removeEventListener("change", handlePwdInput);
        }
      };
    }
  }, []);

  const handleLogin = async () => {
    setError("");

    let currentId = sailceptId;
    let currentPassword = password;

    // Fallback: Read directly from DOM element if autofilled without triggering React state
    if (Platform.OS === "web") {
      const idEl = idInputRef.current as unknown as HTMLInputElement | null;
      const pwdEl = passwordInputRef.current as unknown as HTMLInputElement | null;
      if (!currentId && idEl?.value) {
        currentId = idEl.value;
      }
      if (!currentPassword && pwdEl?.value) {
        currentPassword = pwdEl.value;
      }
    }

    const trimmedId = currentId.trim();
    if (!trimmedId) {
      setError("Please enter your Sailcept ID.");
      return;
    }
    if (!currentPassword) {
      setError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(trimmedId, currentPassword);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    handleLogin();
  };

  const triggerSubmit = () => {
    if (Platform.OS === "web" && formRef.current?.requestSubmit) {
      formRef.current.requestSubmit();
    } else {
      handleLogin();
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

              <FormContainer onSubmit={handleSubmit} formRef={formRef}>
                {/* Sailcept ID Input */}
                <View style={styles.loginInputLabelContainer}>
                  <Text style={styles.loginInputLabel}>Sailcept ID</Text>
                </View>
                <View style={[styles.loginPhoneInputWrapper, { marginBottom: 14, minHeight: 46 }]}>
                  <TextInput
                    ref={idInputRef}
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
                    autoComplete="username"
                    textContentType="username"
                    importantForAutofill="yes"
                    nativeID="username"
                    id="username"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                    accessibilityLabel="Sailcept ID input"
                    {...({ name: "username" } as unknown as { name?: string })}
                  />
                </View>

                {/* Password Input */}
                <View style={styles.loginInputLabelContainer}>
                  <Text style={styles.loginInputLabel}>Password</Text>
                </View>
                <View style={[styles.loginPhoneInputWrapper, { marginBottom: 20, minHeight: 46 }]}>
                  <TextInput
                    ref={passwordInputRef}
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
                    autoComplete="current-password"
                    textContentType="password"
                    importantForAutofill="yes"
                    nativeID="password"
                    id="password"
                    returnKeyType="done"
                    onSubmitEditing={triggerSubmit}
                    accessibilityLabel="Password input"
                    {...({ name: "password" } as unknown as { name?: string })}
                  />
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.loginPrimaryButton,
                    (pressed || isSubmitting) && styles.loginPrimaryButtonPressed,
                  ]}
                  onPress={triggerSubmit}
                  disabled={isSubmitting}
                  accessibilityLabel="Log In Button"
                  accessibilityRole="button"
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#faf6f1" />
                  ) : (
                    <Text style={styles.loginPrimaryButtonText}>
                      Log In
                    </Text>
                  )}
                </Pressable>
              </FormContainer>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
