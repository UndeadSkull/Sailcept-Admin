import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Card, PageHeader, StatusPill, type Enquiry } from "../components";
import { useBoat } from "../context/BoatContext";
import styles from "../styles";

type EnquiryCard = Enquiry & {
  boatName: string;
  subtitle: string;
  details: string;
  request?: string;
  outcome?: "accepted" | "rejected";
  actedOn?: string;
};

const ALL_CARDS: EnquiryCard[] = [
  {
    name: "Ethan Walker",
    boatName: "Vembanad Crest",
    dateLine: "Received 2 hrs ago - Date held until 6 PM today",
    subtitle: "Day cruise · 15 Jan 2025",
    status: "Date locked",
    config: "Price shown to guest: INR 12,500",
    details:
      "Premium · Private · 2 adults, 0 children · 1 room · 2 guests per room · No extra bed",
    request:
      "Special request: Vegetarian meals preferred. Celebrating anniversary.",
  },
  {
    name: "Emma Collins",
    boatName: "Kerala Dream",
    dateLine: "Received yesterday - Overnight stay · 22 Jan",
    subtitle: "Overnight stay · 22 Jan 2025",
    status: "Pending",
    config: "Price shown to guest: INR 21,000",
    details:
      "Premium · Private · 4 adults, 1 child · 2 rooms · Room 1: 2 guests · Room 2: 2 guests + 1 extra bed",
  },
  {
    name: "Sofia Turner",
    boatName: "Vembanad Crest",
    dateLine: "Handled 3 days ago - Day cruise · 10 Jan",
    subtitle: "Day cruise · 10 Jan 2025",
    status: "Confirmed",
    config: "Final booking value: INR 13,000",
    details:
      "Deluxe · Private · 2 adults, 1 child · 1 room · Extra bed included",
    outcome: "accepted",
    actedOn: "Accepted by admin on 08 Jan, 4:42 PM",
  },
  {
    name: "Noah Parker",
    boatName: "Backwater Pearl",
    dateLine: "Handled 4 days ago - Night cruise · 09 Jan",
    subtitle: "Night cruise · 09 Jan 2025",
    status: "Rejected",
    config: "Quoted value: INR 18,500",
    details: "Premium · Shared · 3 adults · 2 rooms",
    outcome: "rejected",
    actedOn: "Rejected by admin on 07 Jan, 6:10 PM",
  },
];

export default function EnquiriesScreen() {
  const { selectedBoat } = useBoat();
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

  const pendingCards = ALL_CARDS.filter(
    (c) => !c.outcome && c.boatName === selectedBoat,
  );
  const historyCards = ALL_CARDS.filter(
    (c) => c.outcome && c.boatName === selectedBoat,
  );
  const visibleCards = activeTab === "pending" ? pendingCards : historyCards;

  return (
    <View style={styles.flex1}>
      <ScrollView contentContainerStyle={styles.pageScrollContent}>
        <PageHeader
          title="Requests"
          sub={`Temporary date locks are active. Respond to avoid automatic expiry. · Boat: ${selectedBoat}`}
        />

        <View style={styles.enquiryTabRow}>
          <Pressable
            onPress={() => setActiveTab("pending")}
            style={[
              styles.enquiryTabButton,
              activeTab === "pending" ? styles.enquiryTabButtonActive : null,
            ]}
          >
            <Text
              style={[
                styles.enquiryTabText,
                activeTab === "pending" ? styles.enquiryTabTextActive : null,
              ]}
            >
              Pending enquiries
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("history")}
            style={[
              styles.enquiryTabButton,
              activeTab === "history" ? styles.enquiryTabButtonActive : null,
            ]}
          >
            <Text
              style={[
                styles.enquiryTabText,
                activeTab === "history" ? styles.enquiryTabTextActive : null,
              ]}
            >
              History
            </Text>
          </Pressable>
        </View>

        {visibleCards.map((card) => (
          <Card key={card.name} title={card.name} sub={card.dateLine}>
            <View style={styles.inlineWrapRow}>
              <StatusPill status={card.status} />
              <Text style={styles.inlineMuted}>{card.subtitle}</Text>
            </View>
            <Text style={styles.detailText}>{card.details}</Text>
            <Text style={styles.detailStrong}>{card.config}</Text>
            {card.request ? (
              <Text style={styles.detailMuted}>{card.request}</Text>
            ) : null}
            {activeTab === "pending" ? (
              <View style={styles.buttonRowBetween}>
                <Pressable style={styles.declineButton}>
                  <Text style={styles.actionButtonText}>Decline</Text>
                </Pressable>
                <Pressable style={styles.acceptButton}>
                  <Text style={styles.actionButtonText}>Accept booking</Text>
                </Pressable>
              </View>
            ) : (
              <Text style={styles.detailMuted}>{card.actedOn}</Text>
            )}
          </Card>
        ))}

        {visibleCards.length === 0 ? (
          <Card title="No enquiries">
            <Text style={styles.detailMuted}>
              {activeTab === "pending"
                ? "There are no pending enquiries right now."
                : "Accepted and rejected enquiries will appear here."}
            </Text>
          </Card>
        ) : null}
      </ScrollView>
    </View>
  );
}
