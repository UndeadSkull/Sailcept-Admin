import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, ChevronRight } from "lucide-react-native";
import { Card, PageHeader } from "../components";
import { COLORS } from "../styles";

type DocSection = {
  heading: string;
  body?: string;
  bullets?: string[];
  items?: { label: string; value: string }[];
};

type DocContent = {
  title: string;
  updated: string;
  sections: DocSection[];
};

export default function LegalScreen() {
  const navigation = useNavigation();
  const [activeDoc, setActiveDoc] = useState<string | null>(null);

  const docContent: Record<string, DocContent> = {
    privacy: {
      title: "Privacy Policy",
      updated: "Last updated: 26 June 2026",
      sections: [
        {
          heading: "Introduction",
          body: "Your privacy is important to us. This Privacy Policy explains how Sailcept Voyage Private Limited collects, uses, and protects your personal data as an operator on our platform under the Digital Personal Data Protection Act 2023 (DPDPA) and the Information Technology Act 2000.",
        },
        {
          heading: "Who We Are",
          body: "Sailcept Voyage Private Limited (SRN: AC3673896) is incorporated in India, operating a houseboat booking marketplace for the Kerala backwaters.\n\nContact: legal@sailcept.com",
        },
        {
          heading: "What Data We Collect",
          items: [
            { label: "Identity Data", value: "Full name, date of birth, PAN number, Aadhaar number, passport or government-issued ID" },
            { label: "Contact Data", value: "Email address, phone number, residential and business address" },
            { label: "Financial Data", value: "Bank account details, IFSC code, GSTIN, payout records, transaction history" },
            { label: "Boat & Compliance Data", value: "Vessel registration certificate, certificate of survey, insurance certificate, pollution compliance documents" },
          ],
        },
        {
          heading: "Your Rights Under DPDPA 2023",
          bullets: [
            "Right to access — request a copy of the personal data we hold about you",
            "Right to correction — request correction of inaccurate or incomplete data",
            "Right to erasure — request deletion of your data, subject to legal retention obligations",
            "Right to grievance redressal — raise a complaint with our Grievance Officer",
          ],
        },
      ],
    },
    compliance: {
      title: "Licences & Compliance",
      updated: "Last updated: 26 June 2026",
      sections: [
        {
          heading: "Introduction",
          body: "This page explains the regulatory and compliance requirements that apply to all houseboat operators listed on the Sailcept platform. It is your responsibility as an operator to understand and comply with these requirements.",
        },
        {
          heading: "Vessel Registration Certificate",
          body: "All houseboats operating commercially on Kerala's inland waterways must hold a valid Vessel Registration Certificate issued by the Kerala Inland Navigation Department or IWAI. Operating without a valid registration certificate is prohibited under the Kerala Inland Vessels Act.",
        },
        {
          heading: "Certificate of Survey",
          body: "A Certificate of Survey is mandatory for all commercial houseboats and certifies that the vessel is seaworthy and fit to carry passenger passengers safely. It is issued periodically following a physical inspection of the vessel.",
        },
        {
          heading: "Insurance Certificate",
          body: "All houseboats listed on Sailcept must hold valid commercial third-party passenger liability insurance covering guests aboard the vessel for the duration of all cruises.",
        },
      ],
    },
    terms: {
      title: "Operator Terms of Service",
      updated: "Last updated: 26 June 2026",
      sections: [
        {
          heading: "Contractual Relationship",
          body: "These Operator Terms of Service constitute a legally binding agreement between you and Sailcept Voyage Private Limited. By listing houseboats on the Sailcept platform, you agree to comply with these terms.",
        },
        {
          heading: "Listing Accuracy",
          body: "Operators represent that listings, pricing, and availability calendars are accurate and up-to-date. Sailcept reserves the right to suspend listings that repeatedly show incorrect availability or cancel confirmed guest bookings.",
        },
        {
          heading: "Fees & Commissions",
          body: "Sailcept charges a platform service commission of 10% on all booking amounts processed through the application. All payments are disbursed net of commission, GST compliance deduction, and applicable TDS under Section 194O of the Income Tax Act.",
        },
      ],
    },
  };

  if (activeDoc && docContent[activeDoc]) {
    const doc = docContent[activeDoc];
    return (
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 18, paddingBottom: 120 }}>
        {/* Sub-header */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Pressable onPress={() => setActiveDoc(null)} style={{ padding: 4 }}>
            <ArrowLeft size={20} color={COLORS.navy} />
          </Pressable>
          <View>
            <Text style={{ fontSize: 26, fontWeight: "800", color: COLORS.navy }}>{doc.title}</Text>
            <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{doc.updated}</Text>
          </View>
        </View>

        {/* Content sections */}
        <View style={{ gap: 16, marginTop: 10 }}>
          {doc.sections.map((sec, idx) => (
            <Card key={idx} title={sec.heading}>
              {sec.body && (
                <Text style={{ fontSize: 13, color: COLORS.navy, lineHeight: 20, marginTop: 6 }}>
                  {sec.body}
                </Text>
              )}
              {sec.bullets && (
                <View style={{ gap: 8, marginTop: 8 }}>
                  {sec.bullets.map((b, bulletIdx) => (
                    <View key={bulletIdx} style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
                      <Text style={{ color: COLORS.teal, fontWeight: "700" }}>•</Text>
                      <Text style={{ fontSize: 13, color: COLORS.navy, flex: 1, lineHeight: 18 }}>{b}</Text>
                    </View>
                  ))}
                </View>
              )}
              {sec.items && (
                <View style={{ gap: 10, marginTop: 8 }}>
                  {sec.items.map((item, itemIdx) => (
                    <View key={itemIdx} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottomWidth: itemIdx < (sec.items?.length ?? 0) - 1 ? 1 : 0, borderBottomColor: COLORS.border }}>
                      <Text style={{ fontSize: 12, color: COLORS.muted, flex: 1 }}>{item.label}</Text>
                      <Text style={{ fontSize: 12, fontWeight: "600", color: COLORS.navy, flex: 2, textAlign: "right" }}>{item.value}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 18, paddingBottom: 120 }}>
      <PageHeader
        title="Legal"
        sub="Read our privacy policy, operator terms, compliance guidelines and statements."
        onBack={() => navigation.goBack()}
      />

      <View
        style={{
          backgroundColor: COLORS.white,
          borderWidth: 1,
          borderColor: COLORS.border,
          borderRadius: 24,
          overflow: "hidden",
          marginTop: 12,
        }}
      >
        {[
          { key: "privacy", title: "Privacy Policy", sub: "Data collection, storage and principal rights" },
          { key: "compliance", title: "Licences & Compliance", sub: "Vessel registration, survey, insurance laws" },
          { key: "terms", title: "Operator Terms of Service", sub: "Operator agreement, listings, fees and policies" },
        ].map((item, idx, arr) => (
          <Pressable
            key={item.key}
            onPress={() => setActiveDoc(item.key)}
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
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: COLORS.navy }}>{item.title}</Text>
              <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{item.sub}</Text>
            </View>
            <ChevronRight size={16} color={COLORS.muted} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
