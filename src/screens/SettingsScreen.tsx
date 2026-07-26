import React, { useState } from "react";
import { Pressable, ScrollView, Text, View, TextInput, Switch, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Bell, Moon, Lock, XCircle, CheckCircle, ChevronRight, Eye, EyeOff } from "lucide-react-native";
import { Card, PageHeader } from "../components";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../styles";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { logout } = useAuth();

  // Local settings page: null (main settings), "notifications", "dnd", "security", "removeboat"
  const [settingsPage, setSettingsPage] = useState<string | null>(null);

  // Notifications Toggles
  const [notifToggles, setNotifToggles] = useState<Record<string, boolean>>({
    newBooking: true,
    bookingCancelled: true,
    bookingUpdated: true,
    pendingRequest: false,
    urgentRequest: true,
    instantBooking: true,
    paymentReceived: true,
    refundIssued: false,
    payoutSent: true,
    invoiceGenerated: false,
    passwordChanged: true,
    pushNotifications: true,
    sms: false,
  });

  // DND states
  const [dndEnabled, setDndEnabled] = useState(false);
  const [dndFrom, setDndFrom] = useState("22:00");
  const [dndUntil, setDndUntil] = useState("07:00");
  const [dndDays, setDndDays] = useState<Record<string, boolean>>({
    M: true, T: true, W: true, T2: true, F: true, S: false, S2: false
  });

  // Security password fields
  const [securityFields, setSecurityFields] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({
    current: false,
    newPass: false,
    confirm: false,
  });
  const [passwordSubmitted, setPasswordSubmitted] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  const toggleSwitch = (key: string, val: boolean) => {
    setNotifToggles((p) => ({ ...p, [key]: val }));
  };

  const renderToggleRow = (label: string, key: string) => {
    return (
      <View
        key={key}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 11,
          paddingHorizontal: 18,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
        }}
      >
        <Text style={{ fontSize: 13, color: COLORS.navy }}>{label}</Text>
        <Switch
          value={notifToggles[key]}
          onValueChange={(val) => toggleSwitch(key, val)}
          trackColor={{ false: COLORS.border, true: COLORS.teal }}
        />
      </View>
    );
  };

  const renderGroupLabel = (title: string) => {
    return (
      <Text
        style={{
          fontSize: 11,
          fontWeight: "700",
          color: COLORS.teal,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          paddingTop: 14,
          paddingHorizontal: 18,
          paddingBottom: 6,
        }}
      >
        {title}
      </Text>
    );
  };

  // Password submission logic
  const handleUpdatePassword = () => {
    setPasswordSubmitted(true);

    const { current, newPass, confirm } = securityFields;
    const pw = newPass;
    const passwordsMatch = newPass === confirm;
    const notSameAsCurrent = newPass !== current || current === "";

    const checks = [
      pw.length >= 10 && pw.length <= 15,
      /[A-Z]/.test(pw),
      /[a-z]/.test(pw),
      /[0-9]/.test(pw),
      /[!?@#$%&*]/.test(pw)
    ];

    const allOk = checks.every(ok => ok) && passwordsMatch && notSameAsCurrent && current !== "";

    if (allOk) {
      setPasswordUpdated(true);
      setTimeout(() => {
        logout(); // force log out
      }, 3000);
    } else {
      Alert.alert("Invalid Password", "Please satisfy all password requirements.");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 18, paddingBottom: 120 }}>
      {/* ── NOTIFICATIONS SUB-PAGE ── */}
      {settingsPage === "notifications" && (
        <View>
          <View style={{ marginBottom: 20, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Pressable onPress={() => setSettingsPage(null)} style={{ padding: 4 }}>
              <ArrowLeft size={20} color={COLORS.navy} />
            </Pressable>
            <Text style={{ fontSize: 26, fontWeight: "800", color: COLORS.navy }}>Notifications</Text>
          </View>

          <View style={{ backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, overflow: "hidden", marginBottom: 14 }}>
            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.navy }}>Enable notifications for</Text>
            </View>
            {renderGroupLabel("Bookings")}
            {renderToggleRow("New booking received", "newBooking")}
            {renderToggleRow("Booking cancelled", "bookingCancelled")}
            {renderToggleRow("Booking updated (dates, guests, rooms…)", "bookingUpdated")}
            {renderToggleRow("Pending request (more than 6 hours)", "pendingRequest")}
            {renderToggleRow("Urgent booking request", "urgentRequest")}
            {renderToggleRow("Instant booking", "instantBooking")}

            {renderGroupLabel("Payments")}
            {renderToggleRow("Payment received", "paymentReceived")}
            {renderToggleRow("Refund issued", "refundIssued")}
            {renderToggleRow("Payout sent", "payoutSent")}
            {renderToggleRow("Invoice generated", "invoiceGenerated")}

            {renderGroupLabel("Account & Security")}
            {renderToggleRow("Password changed", "passwordChanged")}
          </View>

          {/* Important alert info */}
          <View style={{ backgroundColor: "#FEF3C7", borderWidth: 1, borderColor: COLORS.amber, borderRadius: 16, padding: 16, marginBottom: 14 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#92400E", marginBottom: 6 }}>Important notifications</Text>
            <Text style={{ fontSize: 12, color: "#92400E", marginBottom: 8 }}>These alerts are always ON and cannot be disabled.</Text>
            {["Security-related events", "Critical system or booking issues"].map((t) => (
              <View key={t} style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
                <CheckCircle size={12} color={COLORS.amber} />
                <Text style={{ fontSize: 12, color: "#92400E" }}>{t}</Text>
              </View>
            ))}
          </View>

          <View style={{ backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, overflow: "hidden" }}>
            {renderGroupLabel("Delivery methods")}
            {renderToggleRow("Mobile push notifications", "pushNotifications")}
            {renderToggleRow("SMS (only for critical alerts)", "sms")}
          </View>
        </View>
      )}

      {/* ── DO NOT DISTURB SUB-PAGE ── */}
      {settingsPage === "dnd" && (
        <View>
          <View style={{ marginBottom: 20, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Pressable onPress={() => setSettingsPage(null)} style={{ padding: 4 }}>
              <ArrowLeft size={20} color={COLORS.navy} />
            </Pressable>
            <Text style={{ fontSize: 26, fontWeight: "800", color: COLORS.navy }}>Do Not Disturb</Text>
          </View>

          <View style={{ backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, overflow: "hidden", marginBottom: 14 }}>
            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.navy }}>Enable Do Not Disturb</Text>
                <Switch
                  value={dndEnabled}
                  onValueChange={setDndEnabled}
                  trackColor={{ false: COLORS.border, true: COLORS.teal }}
                />
              </View>
              <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 6 }}>
                When enabled, notifications will be paused during your selected hours.
              </Text>
            </View>

            <View style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 13, color: COLORS.navy, fontWeight: "600" }}>From</Text>
              <TextInput
                style={{ fontSize: 14, fontWeight: "700", color: COLORS.navy, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, minWidth: 100, textAlign: "center" }}
                value={dndFrom}
                onChangeText={setDndFrom}
              />
            </View>

            <View style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 13, color: COLORS.navy, fontWeight: "600" }}>Until</Text>
              <TextInput
                style={{ fontSize: 14, fontWeight: "700", color: COLORS.navy, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, minWidth: 100, textAlign: "center" }}
                value={dndUntil}
                onChangeText={setDndUntil}
              />
            </View>

            <View style={{ padding: 14 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.navy, marginBottom: 10 }}>Repeat On</Text>
              <View style={{ flexDirection: "row", gap: 5 }}>
                {Object.entries(dndDays).map(([day, checked]) => (
                  <Pressable
                    key={day}
                    onPress={() => setDndDays(p => ({ ...p, [day]: !p[day] }))}
                    style={{
                      flex: 1,
                      paddingVertical: 6,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: checked ? COLORS.teal : COLORS.border,
                      backgroundColor: checked ? COLORS.tealLight : COLORS.white,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: "600", color: checked ? COLORS.teal : COLORS.muted }}>
                      {day.substring(0, 1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <Pressable
            onPress={() => {
              if (dndEnabled) setSettingsPage(null);
            }}
            style={{
              backgroundColor: dndEnabled ? COLORS.teal : COLORS.border,
              borderRadius: 999,
              paddingVertical: 14,
              alignItems: "center",
              opacity: dndEnabled ? 1 : 0.5,
            }}
          >
            <Text style={{ color: COLORS.white, fontSize: 15, fontWeight: "700" }}>Save</Text>
          </Pressable>
        </View>
      )}

      {/* ── SECURITY SUB-PAGE ── */}
      {settingsPage === "security" && (() => {
        const { current, newPass, confirm } = securityFields;
        const pw = newPass;
        const passwordsMatch = newPass === confirm;
        const notSameAsCurrent = newPass !== current || current === "";
        
        const checks = [
          { label: "At least 10 characters / max 15 characters", ok: pw.length >= 10 && pw.length <= 15 },
          { label: "At least one uppercase letter", ok: /[A-Z]/.test(pw) },
          { label: "At least one lowercase letter", ok: /[a-z]/.test(pw) },
          { label: "At least one number", ok: /[0-9]/.test(pw) },
          { label: "At least one special character (! ? @ # $ % & *)", ok: /[!?@#$%&*]/.test(pw) },
        ];

        const allOk = checks.every(c => c.ok) && passwordsMatch && notSameAsCurrent && current !== "";

        if (passwordUpdated) {
          return (
            <View>
              <View style={{ marginBottom: 20, flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Text style={{ fontSize: 26, fontWeight: "800", color: COLORS.navy }}>Security</Text>
              </View>
              <View style={{ backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, padding: 24, alignItems: "center", marginBottom: 16 }}>
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#D1FAE5", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <CheckCircle size={28} color={COLORS.green} />
                </View>
                <Text style={{ fontSize: 18, fontWeight: "800", color: COLORS.navy, marginBottom: 10 }}>Password Updated</Text>
                <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.navy, textAlign: "center", lineHeight: 22 }}>
                  You will be logged out and redirected in a few seconds…
                </Text>
              </View>
            </View>
          );
        }

        return (
          <View>
            <View style={{ marginBottom: 20, flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Pressable onPress={() => setSettingsPage(null)} style={{ padding: 4 }}>
                <ArrowLeft size={20} color={COLORS.navy} />
              </Pressable>
              <Text style={{ fontSize: 26, fontWeight: "800", color: COLORS.navy }}>Security</Text>
            </View>

            <View style={{ backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, padding: 18, marginBottom: 14, gap: 14 }}>
              {[
                { label: "Current Password", key: "current" },
                { label: "New Password", key: "newPass" },
                { label: "Confirm New Password", key: "confirm" },
              ].map(({ label, key }) => (
                <View key={key}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.navy, marginBottom: 6 }}>{label}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, gap: 8 }}>
                    <TextInput
                      secureTextEntry={!showPasswords[key]}
                      style={{ flex: 1, fontSize: 14, color: COLORS.navy, padding: 0 }}
                      placeholder="••••••••••••"
                      value={securityFields[key as keyof typeof securityFields]}
                      onChangeText={(val) => {
                        setSecurityFields((p) => ({ ...p, [key]: val }));
                        setPasswordSubmitted(false);
                      }}
                    />
                    <Pressable onPress={() => setShowPasswords(p => ({ ...p, [key]: !p[key] }))}>
                      {showPasswords[key] ? <EyeOff size={16} color={COLORS.muted} /> : <Eye size={16} color={COLORS.muted} />}
                    </Pressable>
                  </View>
                  {key === "newPass" && current !== "" && newPass !== "" && newPass === current && (
                    <Text style={{ fontSize: 12, color: COLORS.red, marginTop: 5 }}>
                      New password must be different from current password.
                    </Text>
                  )}
                </View>
              ))}
            </View>

            <View style={{ backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, padding: 16, marginBottom: 14 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.navy, marginBottom: 10 }}>Password requirements</Text>
              {checks.map((c, idx) => {
                const failed = passwordSubmitted && !c.ok;
                return (
                  <View key={idx} style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <CheckCircle size={14} color={c.ok ? COLORS.green : failed ? COLORS.red : COLORS.muted} />
                    <Text style={{ fontSize: 12, color: c.ok ? COLORS.green : failed ? COLORS.red : COLORS.muted }}>
                      {c.label}
                    </Text>
                  </View>
                );
              })}
            </View>

            <Pressable
              onPress={handleUpdatePassword}
              style={{
                backgroundColor: COLORS.teal,
                borderRadius: 999,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: COLORS.white, fontSize: 15, fontWeight: "700" }}>Update Password</Text>
            </Pressable>
          </View>
        );
      })()}

      {/* ── REMOVE BOAT/ACCOUNT SUB-PAGE ── */}
      {settingsPage === "removeboat" && (
        <View>
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 2 }}>
              <Pressable onPress={() => setSettingsPage(null)} style={{ padding: 4 }}>
                <ArrowLeft size={20} color={COLORS.navy} />
              </Pressable>
              <Text style={{ fontSize: 26, fontWeight: "800", color: COLORS.navy }}>Remove Boat / Account</Text>
            </View>
            <Text style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>
              Need to remove a boat or close your operator account?
            </Text>
          </View>

          <View style={{ gap: 12 }}>
            <Pressable
              onPress={() => Alert.alert("Request Submitted", "Your request to remove a boat has been sent to the Sailcept support team.")}
              style={{
                backgroundColor: COLORS.white,
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 999,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.navy }}>Request Boat Removal</Text>
            </Pressable>
            
            <Pressable
              onPress={() => Alert.alert("Request Submitted", "Your account deletion request has been registered. Our legal team will reach out.")}
              style={{
                backgroundColor: "#FEE2E2",
                borderWidth: 1,
                borderColor: COLORS.red,
                borderRadius: 999,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.red }}>Request Account Deletion</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ── MAIN SETTINGS PAGE ── */}
      {settingsPage === null && (
        <View>
          <View style={{ marginBottom: 20, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Pressable onPress={() => navigation.goBack()} style={{ padding: 4 }}>
              <ArrowLeft size={20} color={COLORS.navy} />
            </Pressable>
            <Text style={{ fontSize: 26, fontWeight: "800", color: COLORS.navy }}>Settings</Text>
          </View>

          <View style={{ backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 24, overflow: "hidden", marginBottom: 16 }}>
            {[
              { icon: Bell, title: "Notifications", subtitle: "Manage your notification preferences", page: "notifications", color: COLORS.teal, bg: COLORS.tealLight },
              { icon: Moon, title: "Do Not Disturb", subtitle: "Silence notifications during scheduled hours", page: "dnd", color: COLORS.teal, bg: COLORS.tealLight },
              { icon: Lock, title: "Security", subtitle: "Change your password", page: "security", color: COLORS.teal, bg: COLORS.tealLight },
            ].map((item, idx, arr) => {
              const Icon = item.icon;
              return (
                <Pressable
                  key={item.title}
                  onPress={() => setSettingsPage(item.page)}
                  style={({ pressed }) => [
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 14,
                      paddingVertical: 16,
                      paddingHorizontal: 18,
                      borderBottomWidth: idx < arr.length - 1 ? 1 : 0,
                      borderBottomColor: COLORS.border,
                      backgroundColor: pressed ? COLORS.bg : "transparent",
                    },
                  ]}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: item.bg, alignItems: "center", justifyContent: "center" }}>
                    <Icon size={18} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "600", color: COLORS.navy }}>{item.title}</Text>
                    <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{item.subtitle}</Text>
                  </View>
                  <ChevronRight size={16} color={COLORS.muted} />
                </Pressable>
              );
            })}
          </View>

          <View style={{ backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 24, overflow: "hidden" }}>
            <Pressable
              onPress={() => setSettingsPage("removeboat")}
              style={({ pressed }) => [
                {
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  paddingVertical: 16,
                  paddingHorizontal: 18,
                  backgroundColor: pressed ? COLORS.bg : "transparent",
                },
              ]}
            >
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center" }}>
                <XCircle size={18} color={COLORS.red} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "600", color: COLORS.red }}>Remove Boat / Account</Text>
                <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>Delete a boat profile or operator account</Text>
              </View>
              <ChevronRight size={16} color={COLORS.muted} />
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
