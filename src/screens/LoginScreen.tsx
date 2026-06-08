import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  LayoutAnimation,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft } from "lucide-react-native";
import styles from "../styles";

export default function LoginScreen() {
  const { login } = useAuth();
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const otpInputRef = useRef<TextInput>(null);

  // Focus the OTP text input when transitioning to OTP step
  useEffect(() => {
    if (step === "otp") {
      // Small timeout to allow transition layout to settle
      const timeout = setTimeout(() => {
        otpInputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [step]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleSendOTP = () => {
    setError("");
    const cleanedPhone = phoneNumber.replace(/[^0-9]/g, "");
    if (cleanedPhone.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSubmitting(true);

    // Simulate OTP generation delay
    setTimeout(() => {
      setIsSubmitting(false);
      setStep("otp");
      setTimer(30);
    }, 1000);
  };

  const handleVerifyOTP = async () => {
    setError("");
    if (otp.length < 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (otp === "123456") {
        await login(`${countryCode}${phoneNumber}`);
      } else {
        setError("Invalid verification code. Use '123456' for testing.");
        setIsSubmitting(false);
      }
    } catch (err) {
      setError("Authentication failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = () => {
    setError("");
    setOtp("");
    setTimer(30);
    
    // Simulate sending OTP
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    otpInputRef.current?.focus();
  };

  const goBackToPhone = () => {
    setError("");
    setOtp("");
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setStep("phone");
  };

  // Render styled OTP boxes using a hidden text input overlay
  const renderOtpBoxes = () => {
    const boxes = [];
    for (let i = 0; i < 6; i++) {
      const char = otp[i] || "";
      const isFocused = otp.length === i && step === "otp";
      
      boxes.push(
        <View
          key={i}
          style={[
            styles.loginOtpBox,
            isFocused && styles.loginOtpBoxFocused,
            error ? styles.loginOtpBoxError : null,
          ]}
        >
          <Text style={styles.loginOtpBoxText}>{char}</Text>
          {isFocused && <View style={styles.loginOtpCursor} />}
        </View>
      );
    }
    return boxes;
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
            {step === "phone" ? (
              // Step 1: Enter Phone Number
              <View style={styles.loginCardContent}>
                <Text style={styles.loginTitle}>Welcome back</Text>
                <Text style={styles.loginSub}>
                  Enter your mobile number to receive a secure login code.
                </Text>

                {error ? (
                  <View style={styles.loginErrorBox}>
                    <Text style={styles.loginErrorText}>{error}</Text>
                  </View>
                ) : null}

                <View style={styles.loginInputLabelContainer}>
                  <Text style={styles.loginInputLabel}>Phone Number</Text>
                </View>

                <View style={styles.loginPhoneRow}>
                  {/* Country Code Selector Box */}
                  <View style={styles.loginCountryBox}>
                    <TextInput
                      style={styles.loginCountryInput}
                      value={countryCode}
                      onChangeText={setCountryCode}
                      keyboardType="phone-pad"
                      maxLength={4}
                      placeholder="+1"
                      placeholderTextColor="#8ea0b6"
                      accessibilityLabel="Country code input"
                    />
                  </View>

                  {/* Phone Input */}
                  <View style={styles.loginPhoneInputWrapper}>
                    <TextInput
                      style={styles.loginPhoneInput}
                      value={phoneNumber}
                      onChangeText={(val) => {
                        setError("");
                        setPhoneNumber(val.replace(/[^0-9]/g, ""));
                      }}
                      keyboardType="phone-pad"
                      placeholder="000 000 0000"
                      placeholderTextColor="#8ea0b6"
                      maxLength={15}
                      onSubmitEditing={handleSendOTP}
                      accessibilityLabel="Phone number input"
                    />
                  </View>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.loginPrimaryButton,
                    (pressed || isSubmitting) && styles.loginPrimaryButtonPressed,
                  ]}
                  onPress={handleSendOTP}
                  disabled={isSubmitting}
                  accessibilityLabel="Send OTP verification code"
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#faf6f1" />
                  ) : (
                    <Text style={styles.loginPrimaryButtonText}>
                      Send Verification Code
                    </Text>
                  )}
                </Pressable>

                <Text style={styles.loginSecuredNotice}>
                  By continuing, you agree to our terms of service.
                </Text>
              </View>
            ) : (
              // Step 2: Enter OTP Code
              <View style={styles.loginCardContent}>
                <Pressable
                  style={styles.loginBackButton}
                  onPress={goBackToPhone}
                  accessibilityLabel="Go back to phone input"
                >
                  <ArrowLeft size={16} color="#1a7f7f" />
                  <Text style={styles.loginBackButtonText}>Edit Number</Text>
                </Pressable>

                <Text style={styles.loginTitle}>Enter code</Text>
                <Text style={styles.loginSub}>
                  We sent a 6-digit verification code to{" "}
                  <Text style={{ fontWeight: "700", color: "#102949" }}>
                    {countryCode} {phoneNumber}
                  </Text>
                </Text>

                {error ? (
                  <View style={styles.loginErrorBox}>
                    <Text style={styles.loginErrorText}>{error}</Text>
                  </View>
                ) : null}

                {/* OTP Digit Box Row */}
                <Pressable
                  style={styles.loginOtpRow}
                  onPress={() => otpInputRef.current?.focus()}
                  accessibilityLabel="Enter verification code"
                >
                  {renderOtpBoxes()}
                </Pressable>

                {/* Hidden Text Input that captures OTP input */}
                <TextInput
                  ref={otpInputRef}
                  style={styles.loginHiddenOtpInput}
                  value={otp}
                  onChangeText={(val) => {
                    setError("");
                    const cleanVal = val.replace(/[^0-9]/g, "");
                    setOtp(cleanVal);
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  textContentType="oneTimeCode"
                  autoComplete="one-time-code"
                />

                <Pressable
                  style={({ pressed }) => [
                    styles.loginPrimaryButton,
                    (pressed || isSubmitting) && styles.loginPrimaryButtonPressed,
                    otp.length < 6 && styles.loginPrimaryButtonDisabled,
                  ]}
                  onPress={handleVerifyOTP}
                  disabled={isSubmitting || otp.length < 6}
                  accessibilityLabel="Verify OTP code"
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#faf6f1" />
                  ) : (
                    <Text style={styles.loginPrimaryButtonText}>
                      Verify & Log In
                    </Text>
                  )}
                </Pressable>

                {/* Countdown & Resend Option */}
                <View style={styles.loginTimerContainer}>
                  {timer > 0 ? (
                    <Text style={styles.loginTimerText}>
                      Resend code in <Text style={{ fontWeight: "700" }}>{timer}s</Text>
                    </Text>
                  ) : (
                    <Pressable
                      onPress={handleResendOTP}
                      style={styles.loginResendButton}
                      accessibilityLabel="Resend verification code"
                    >
                      <Text style={styles.loginResendButtonText}>Resend Code</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Tester Helper Box */}
          <View style={styles.loginTesterHelper}>
            <Text style={styles.loginTesterHelperTitle}>Tester Note:</Text>
            <Text style={styles.loginTesterHelperText}>
              • Enter any phone number.{"\n"}
              • Enter code <Text style={{ fontWeight: "800" }}>123456</Text> to authenticate.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
