import React, { useState } from "react";
import { Pressable, ScrollView, Text, View, ActivityIndicator } from "react-native";
import { Ship, ChevronDown, ChevronUp } from "lucide-react-native";
import { PageHeader } from "../components";
import { useBoat } from "../context/BoatContext";
import { mockBoats } from "../services/boats";
import { COLORS } from "../styles";

export default function BoatProfilesListScreen({ navigation }: { navigation: any }) {
  const { boats, isLoading } = useBoat();

  // Accordion states
  const [boatCardOpen, setBoatCardOpen] = useState<Record<number, boolean>>({});
  const [expandedBoatProfile, setExpandedBoatProfile] = useState<Record<number, string | null>>({});

  const toggleBoatCard = (id: number) => {
    setBoatCardOpen((prev) => ({ ...prev, [id]: !prev[id] }));
    setExpandedBoatProfile((prev) => ({ ...prev, [id]: null }));
  };

  const toggleSection = (id: number, section: string) => {
    setExpandedBoatProfile((prev) => ({
      ...prev,
      [id]: prev[id] === section ? null : section,
    }));
  };

  const renderRow = (label: string, value: any) => {
    return (
      <View
        key={label}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          paddingVertical: 10,
          paddingHorizontal: 18,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
        }}
      >
        <Text style={{ fontSize: 13, color: COLORS.muted, flex: 1 }}>{label}</Text>
        <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.navy, textAlign: "right", flex: 1 }}>
          {value !== undefined && value !== "" && value !== null ? String(value) : "—"}
        </Text>
      </View>
    );
  };

  const renderSectionHeader = (boatId: number, label: string, sectionKey: string) => {
    const isOpen = expandedBoatProfile[boatId] === sectionKey;
    return (
      <Pressable
        key={sectionKey}
        onPress={() => toggleSection(boatId, sectionKey)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 13,
          paddingHorizontal: 18,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.navy }}>{label}</Text>
        {isOpen ? <ChevronUp size={15} color={COLORS.muted} /> : <ChevronDown size={15} color={COLORS.muted} />}
      </Pressable>
    );
  };

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 18, paddingBottom: 120 }}>
      <PageHeader
        title="Boat profiles"
        sub="View boat attributes, regulatory compliance and cancellation policies."
        onBack={() => navigation.goBack()}
      />

      {isLoading ? (
        <View style={{ paddingVertical: 100, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={COLORS.teal} />
        </View>
      ) : (
        <View style={{ gap: 12, marginTop: 12 }}>
          {boats.map((b) => {
            const profile = mockBoats[b.id] || {};
            const isCardOpen = boatCardOpen[b.id] === true;
            const expandedSection = expandedBoatProfile[b.id];

            return (
              <View
                key={b.id}
                style={{
                  backgroundColor: COLORS.white,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 20,
                  overflow: "hidden",
                }}
              >
                {/* Header card */}
                <Pressable
                  onPress={() => toggleBoatCard(b.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    padding: 16,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: COLORS.tealLight,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ship size={18} color={COLORS.teal} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.navy }}>{b.name}</Text>
                    <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>
                      {profile.bedrooms} Bed Bedroom Houseboat · {profile.comfortLevel || "Premium"}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <View style={{ backgroundColor: COLORS.green, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 9, fontWeight: "700", color: COLORS.white, letterSpacing: 0.5 }}>ACTIVE</Text>
                    </View>
                    {isCardOpen ? <ChevronUp size={16} color={COLORS.muted} /> : <ChevronDown size={16} color={COLORS.muted} />}
                  </View>
                </Pressable>

                {isCardOpen && (
                  <View style={{ backgroundColor: COLORS.bg }}>
                    {/* Main Info */}
                    {renderSectionHeader(b.id, "Boat Main Information", "info")}
                    {expandedSection === "info" && (
                      <View>
                        {renderRow("Vessel Registration Number", profile.registrationNumber)}
                        {renderRow("Boarding Location", profile.boardingLocation)}
                        {renderRow("Houseboat Rooms", `${profile.bedrooms} Rooms`)}
                        {renderRow("Houseboat Configuration", profile.configuration)}
                        {renderRow("Max Guest Capacity", `${profile.maxGuests} Guests`)}
                        {renderRow("Comfort Level", profile.comfortLevel)}
                        {renderRow("Bed Types", profile.bedTypes?.join(" / "))}
                        {renderRow("Cot/Mat", profile.cotMat ? "Yes" : "No")}
                        {renderRow("Wheelchair Accessible", profile.wheelchairAccessible ? "Yes" : "No")}
                        {renderRow("Private Parking", profile.privateParking ? "Yes" : "No")}
                        {renderRow("Wi-Fi", profile.wifi ? "Yes" : "No")}
                        {renderRow("AC Support", profile.ac ? "Yes" : "No")}
                        {renderRow("AC Type", profile.acType?.join(", "))}
                        {renderRow("Bathroom Type", profile.bathroomType?.join(", "))}
                        {renderRow("Bathroom Amenities", profile.bathroomAmenities?.join(", "))}
                        {renderRow("Hot Water", profile.hotWater ? "Yes" : "No")}
                        {renderRow("Power Backup Generator", profile.powerBackupGenerator ? "Yes" : "No")}
                        {renderRow("Other Amenities", profile.otherAmenities?.join(", "))}
                        {renderRow("Guest Activities", profile.extraActivities?.join(", "))}
                        {renderRow("Diets on Demand", profile.diets?.join(", "))}
                      </View>
                    )}

                    {/* Documents */}
                    {renderSectionHeader(b.id, "Documents & Compliance", "compliance")}
                    {expandedSection === "compliance" && (
                      <View>
                        {renderRow("Vessel Registration Certificate", profile.compliance?.vesselRegistrationCertificate)}
                        {renderRow("Certificate of Survey", profile.compliance?.certificateOfSurvey)}
                        {renderRow("Insurance Certificate", profile.compliance?.insuranceCertificate)}
                        {renderRow("Pollution Compliance", profile.compliance?.pollutionCompliance)}
                      </View>
                    )}

                    {/* Policies */}
                    {renderSectionHeader(b.id, "Cancellation & Refund Policies", "cancellation")}
                    {expandedSection === "cancellation" && (
                      <View>
                        {renderRow("0 – 15 days before trip", "No refund")}
                        {renderRow("16 – 30 days before trip", "50% refund")}
                        {renderRow("31 – 45 days before trip", "75% refund")}
                        {renderRow("46+ days before trip", "100% refund")}
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
