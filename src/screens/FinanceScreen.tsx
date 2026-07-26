import React, { useState } from "react";
import { Pressable, ScrollView, Text, View, Modal, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Sparkles, CheckCircle, ClipboardList, FileText, Shield, Settings, ChevronDown, ChevronUp, Pencil } from "lucide-react-native";
import { Card, PageHeader } from "../components";
import { useBoat } from "../context/BoatContext";
import { COLORS } from "../styles";

export default function FinanceScreen() {
  const navigation = useNavigation();
  const { selectedBoat, setSelectedBoat, boats } = useBoat();

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setSelectedBoat(0);
    });
    return unsubscribe;
  }, [navigation]);

  // Local tabs: earnings, payouts, transactions, invoices, tax, finsettings
  const [financeTab, setFinanceTab] = useState<string>("earnings");

  // Inline filter states
  const [financeEarningsBoat, setFinanceEarningsBoat] = useState<string>("All");
  const [financeEarningsBoatOpen, setFinanceEarningsBoatOpen] = useState(false);
  const [financeTransactionsBoat, setFinanceTransactionsBoat] = useState<string>("All");
  const [financeTransactionsBoatOpen, setFinanceTransactionsBoatOpen] = useState(false);
  const [financeInvoiceYear, setFinanceInvoiceYear] = useState<number>(2026);
  const [financeInvoiceYearOpen, setFinanceInvoiceYearOpen] = useState(false);

  // Settings section accordion
  const [financeSettingsSection, setFinanceSettingsSection] = useState<string | null>(null);

  // Resolve active boat name from context
  const contextBoatName = selectedBoat === 0 ? "All" : boats.find(b => b.id === selectedBoat)?.name || "All";

  // Shared boat list
  const operatorBoats = boats.map(b => b.name);

  // Inline boat selector renderer
  const renderInlineBoatFilter = (currentVal: string, setVal: (val: string) => void, isOpen: boolean, setIsOpen: (open: boolean) => void) => {
    return (
      <View style={{ position: "relative" }}>
        <Pressable
          onPress={() => setIsOpen(!isOpen)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            borderWidth: 1,
            borderColor: currentVal !== "All" ? COLORS.teal : COLORS.border,
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 4,
            backgroundColor: currentVal !== "All" ? COLORS.tealLight : COLORS.white,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "600", color: currentVal !== "All" ? COLORS.teal : COLORS.muted }}>
            {currentVal === "All" ? "All Boats" : currentVal}
          </Text>
          {isOpen ? <ChevronUp size={10} color={currentVal !== "All" ? COLORS.teal : COLORS.muted} /> : <ChevronDown size={10} color={currentVal !== "All" ? COLORS.teal : COLORS.muted} />}
        </Pressable>

        {isOpen && (
          <Modal transparent visible={isOpen} animationType="none" onRequestClose={() => setIsOpen(false)}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsOpen(false)} />
            <View
              style={{
                position: "absolute",
                top: 240, // rough positioning
                right: 18,
                backgroundColor: COLORS.white,
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 12,
                zIndex: 20,
                overflow: "hidden",
                minWidth: 150,
                shadowColor: COLORS.navy,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
                elevation: 5,
                paddingVertical: 4,
              }}
            >
              {["All", ...operatorBoats].map((b) => (
                <Pressable
                  key={b}
                  onPress={() => {
                    setVal(b);
                    setIsOpen(false);
                  }}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 9,
                    backgroundColor: b === currentVal ? COLORS.tealLight : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: b === currentVal ? "700" : "500",
                      color: b === currentVal ? COLORS.teal : COLORS.navy,
                      textAlign: "center",
                    }}
                  >
                    {b === "All" ? "All Boats" : b}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Modal>
        )}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 18, paddingBottom: 120 }}>
      {/* Title */}
      <View style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <Pressable onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <ArrowLeft size={20} color={COLORS.navy} />
          </Pressable>
          <Text style={{ fontSize: 22, fontWeight: "800", color: COLORS.navy }}>Finance</Text>
        </View>

        {/* Tab buttons */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {[
            { id: "earnings", label: "Earnings", icon: Sparkles },
            { id: "payouts", label: "Payouts", icon: CheckCircle },
            { id: "transactions", label: "Ledger", icon: ClipboardList },
            { id: "invoices", label: "Invoices", icon: FileText },
            { id: "tax", label: "Tax", icon: Shield },
            { id: "finsettings", label: "Settings", icon: Settings },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = financeTab === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => setFinanceTab(t.id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: isActive ? COLORS.teal : COLORS.border,
                  backgroundColor: isActive ? COLORS.tealLight : COLORS.white,
                  marginBottom: 4,
                }}
              >
                <Icon size={12} color={isActive ? COLORS.teal : COLORS.muted} />
                <Text style={{ fontSize: 11, fontWeight: "600", color: isActive ? COLORS.teal : COLORS.muted }}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ── EARNINGS TAB ── */}
      {financeTab === "earnings" && (() => {
        const earningsData: Record<string, any> = {
          "All": { month: "₹1,24,500", monthSub: "+8% vs last month", year: "₹8,72,000", yearSub: "Jan – Jun 2026", pending: "₹21,000", bookings: "134" },
          "Lake Ripples": { month: "₹12,000", monthSub: "+3% vs last month", year: "₹84,000", yearSub: "Jan – Jun 2026", pending: "₹0", bookings: "18" },
          "Lake Royale": { month: "₹26,000", monthSub: "+5% vs last month", year: "₹1,86,000", yearSub: "Jan – Jun 2026", pending: "₹7,800", bookings: "31" },
          "Lake Riviera": { month: "₹31,000", monthSub: "+10% vs last month", year: "₹2,21,000", yearSub: "Jan – Jun 2026", pending: "₹6,500", bookings: "28" },
          "Floating Dreams": { month: "₹39,500", monthSub: "+12% vs last month", year: "₹2,84,000", yearSub: "Jan – Jun 2026", pending: "₹6,700", bookings: "22" },
          "Whale Cruise": { month: "₹16,000", monthSub: "+4% vs last month", year: "₹97,000", yearSub: "Jan – Jun 2026", pending: "₹0", bookings: "35" }
        };
        const d = earningsData[financeEarningsBoat] || earningsData["All"];

        return (
          <View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <View>
                <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.navy }}>Earnings</Text>
                <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>Revenue overview</Text>
              </View>
              {renderInlineBoatFilter(financeEarningsBoat, setFinanceEarningsBoat, financeEarningsBoatOpen, setFinanceEarningsBoatOpen)}
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
              <Card title="This Month" sub={d.monthSub}>
                <Text style={{ fontSize: 24, fontWeight: "800", color: COLORS.teal, marginTop: 6 }}>{d.month}</Text>
              </Card>
              <Card title="This Year" sub={d.yearSub}>
                <Text style={{ fontSize: 24, fontWeight: "800", color: COLORS.teal, marginTop: 6 }}>{d.year}</Text>
              </Card>
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
              <Card title="Pending Earnings" sub="Awaiting confirmation">
                <Text style={{ fontSize: 24, fontWeight: "800", color: COLORS.amber, marginTop: 6 }}>{d.pending}</Text>
              </Card>
              <Card title="Total Bookings" sub="This year">
                <Text style={{ fontSize: 24, fontWeight: "800", color: COLORS.teal, marginTop: 6 }}>{d.bookings}</Text>
              </Card>
            </View>
          </View>
        );
      })()}

      {/* ── PAYOUTS TAB ── */}
      {financeTab === "payouts" && (
        <View>
          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.navy }}>Payouts</Text>
            <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>Money transferred to your bank account</Text>
          </View>

          <Card title="Upcoming Payout" sub="Scheduled for 25 Jun 2026">
            <Text style={{ fontSize: 26, fontWeight: "800", color: COLORS.teal, marginTop: 6 }}>₹1,850</Text>
            <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 6 }}>HDFC Bank ···· 4821</Text>
          </Card>

          <Card title="Completed Payouts">
            <View style={{ gap: 10, marginTop: 10 }}>
              {[
                { date: "15 Jun 2026", amount: "₹2,100", bank: "HDFC ···· 4821" },
                { date: "31 May 2026", amount: "₹1,750", bank: "HDFC ···· 4821" },
                { date: "15 May 2026", amount: "₹2,300", bank: "HDFC ···· 4821" },
                { date: "30 Apr 2026", amount: "₹1,980", bank: "HDFC ···· 4821" }
              ].map((p, idx, arr) => (
                <View
                  key={p.date}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: idx < arr.length - 1 ? 10 : 0,
                    borderBottomWidth: idx < arr.length - 1 ? 1 : 0,
                    borderBottomColor: COLORS.border,
                  }}
                >
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.navy }}>{p.date}</Text>
                    <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{p.bank}</Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.green }}>+{p.amount}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>
      )}

      {/* ── TRANSACTIONS TAB ── */}
      {financeTab === "transactions" && (
        <View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <View>
              <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.navy }}>Transactions</Text>
              <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>Ledger activity</Text>
            </View>
            {renderInlineBoatFilter(financeTransactionsBoat, setFinanceTransactionsBoat, financeTransactionsBoatOpen, setFinanceTransactionsBoatOpen)}
          </View>

          <Card title="June 2026">
            <View style={{ gap: 10, marginTop: 10 }}>
              {[
                { ref: "Booking ALP-22062026-0175", type: "Booking income", amount: "+₹650", color: COLORS.green, boat: "Lake Riviera" },
                { ref: "Booking ALP-30062026-0182", type: "Booking income", amount: "+₹450", color: COLORS.green, boat: "Lake Ripples" },
                { ref: "Platform fee #0175", type: "Platform fee", amount: "-₹65", color: COLORS.red, boat: "Lake Riviera" },
                { ref: "Booking AB-28062026-4471", type: "Added booking", amount: "+₹780", color: COLORS.green, boat: "Lake Royale" },
                { ref: "Refund #0149", type: "Refund issued", amount: "-₹120", color: COLORS.red, boat: "Lake Royale" },
                { ref: "Platform fee #4471", type: "Platform fee", amount: "-₹78", color: COLORS.red, boat: "Lake Royale" }
              ]
                .filter(t => financeTransactionsBoat === "All" || t.boat === financeTransactionsBoat)
                .map((t, idx, arr) => (
                  <View
                    key={t.ref}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      paddingBottom: idx < arr.length - 1 ? 10 : 0,
                      borderBottomWidth: idx < arr.length - 1 ? 1 : 0,
                      borderBottomColor: COLORS.border,
                    }}
                  >
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={{ fontSize: 12, fontWeight: "600", color: COLORS.navy }}>{t.ref}</Text>
                      <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>
                        {t.type}{financeTransactionsBoat === "All" ? ` · ${t.boat}` : ""}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: t.color }}>{t.amount}</Text>
                  </View>
                ))}
            </View>
          </Card>
        </View>
      )}

      {/* ── INVOICES TAB ── */}
      {financeTab === "invoices" && (() => {
        const allInvoices = [
          { number: "INV-2026-061", docName: "Commission invoice", date: "1 Jun 2026", period: "1 May – 31 May 2026", paymentDate: "12 Jun 2026", amount: "₹420", status: "Paid", boat: "Lake Riviera" },
          { number: "INV-2026-TAX-061", docName: "Tax payment overview", date: "4 Jun 2026", period: "1 May – 31 May 2026", paymentDate: "12 Jun 2026", amount: "₹52", status: "Paid", boat: "Lake Riviera" },
          { number: "INV-2026-051", docName: "Commission invoice", date: "1 May 2026", period: "1 Apr – 30 Apr 2026", paymentDate: "22 May 2026", amount: "₹385", status: "Paid", boat: "Lake Royale" },
          { number: "INV-2026-TAX-051", docName: "Tax payment overview", date: "4 May 2026", period: "1 Apr – 30 Apr 2026", paymentDate: "22 May 2026", amount: "₹48", status: "Paid", boat: "Lake Royale" },
          { number: "INV-2026-041", docName: "Commission invoice", date: "1 Apr 2026", period: "1 Mar – 31 Mar 2026", paymentDate: "12 Apr 2026", amount: "₹510", status: "Paid", boat: "Floating Dreams" },
          { number: "INV-2026-TAX-041", docName: "Tax payment overview", date: "4 Apr 2026", period: "1 Mar – 31 Mar 2026", paymentDate: "12 Apr 2026", amount: "₹64", status: "Paid", boat: "Floating Dreams" },
          { number: "INV-2025-121", docName: "Commission invoice", date: "1 Dec 2025", period: "1 Nov – 30 Nov 2025", paymentDate: "21 Dec 2025", amount: "₹290", status: "Paid", boat: "Lake Ripples" },
        ];
        const filtered = allInvoices.filter(inv => inv.date.includes(String(financeInvoiceYear)));

        return (
          <View>
            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.navy }}>Invoices</Text>
              <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>Commission and tax invoices from Sailcept</Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Text style={{ fontSize: 13, color: COLORS.muted }}>Year</Text>
                <Pressable
                  onPress={() => setFinanceInvoiceYearOpen(!financeInvoiceYearOpen)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    borderWidth: 1,
                    borderColor: COLORS.teal,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.teal }}>{financeInvoiceYear}</Text>
                  <ChevronDown size={12} color={COLORS.teal} />
                </Pressable>
              </View>
            </View>

            <Card title={`Invoices for ${financeInvoiceYear}`}>
              <View style={{ gap: 10, marginTop: 10 }}>
                {filtered.length === 0 ? (
                  <Text style={{ fontSize: 13, color: COLORS.muted, textAlign: "center", paddingVertical: 20 }}>
                    No invoices found for this year
                  </Text>
                ) : (
                  filtered.map((inv, idx, arr) => (
                    <View
                      key={inv.number}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingVertical: 8,
                        borderBottomWidth: idx < arr.length - 1 ? 1 : 0,
                        borderBottomColor: COLORS.border,
                      }}
                    >
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 12, fontWeight: "600", color: COLORS.navy }}>{inv.docName}</Text>
                        <Text style={{ fontSize: 10, color: COLORS.muted, marginTop: 2 }}>
                          {inv.number} · {inv.date}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.navy }}>{inv.amount}</Text>
                        <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: COLORS.tealLight, alignItems: "center", justifyContent: "center" }}>
                          <FileText size={13} color={COLORS.teal} />
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </Card>

            {financeInvoiceYearOpen && (
              <Modal transparent visible={financeInvoiceYearOpen} animationType="none" onRequestClose={() => setFinanceInvoiceYearOpen(false)}>
                <Pressable style={StyleSheet.absoluteFill} onPress={() => setFinanceInvoiceYearOpen(false)} />
                <View
                  style={{
                    position: "absolute",
                    top: 240,
                    left: 70,
                    backgroundColor: COLORS.white,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    borderRadius: 12,
                    zIndex: 20,
                    overflow: "hidden",
                    minWidth: 100,
                    shadowColor: COLORS.navy,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.12,
                    shadowRadius: 16,
                    elevation: 5,
                    paddingVertical: 4,
                  }}
                >
                  {[2026, 2025, 2024].map((y) => (
                    <Pressable
                      key={y}
                      onPress={() => {
                        setFinanceInvoiceYear(y);
                        setFinanceInvoiceYearOpen(false);
                      }}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        backgroundColor: financeInvoiceYear === y ? COLORS.tealLight : "transparent",
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.teal, textAlign: "center" }}>{y}</Text>
                    </Pressable>
                  ))}
                </View>
              </Modal>
            )}
          </View>
        );
      })()}

      {/* ── TAX TAB ── */}
      {financeTab === "tax" && (
        <View>
          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.navy }}>Tax Documents</Text>
            <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>VAT statements, summaries and year-end reports</Text>
          </View>

          <View style={{ gap: 10 }}>
            {[
              { title: "2025 Annual Earnings Summary", sub: "Full year · Jan – Dec 2025", tag: "Annual" },
              { title: "VAT Summary Q1 2026", sub: "Jan – Mar 2026", tag: "VAT" },
              { title: "VAT Summary Q4 2025", sub: "Oct – Dec 2025", tag: "VAT" },
              { title: "Tax Certificate 2025", sub: "Issued by Sailcept", tag: "Certificate" }
            ].map((doc) => (
              <View
                key={doc.title}
                style={{
                  backgroundColor: COLORS.white,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1, marginRight: 10 }}>
                  <View style={{ flexDirection: "row", marginBottom: 4 }}>
                    <View style={{ backgroundColor: COLORS.tealLight, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 9, fontWeight: "700", color: COLORS.teal }}>{doc.tag}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.navy }}>{doc.title}</Text>
                  <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{doc.sub}</Text>
                </View>
                <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: COLORS.tealLight, alignItems: "center", justifyContent: "center" }}>
                  <FileText size={13} color={COLORS.teal} />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── SETTINGS TAB ── */}
      {financeTab === "finsettings" && (() => {
        const sections = [
          { key: "bank", title: "Bank Details", subtitle: "Receiving payouts from Sailcept", description: "Sailcept will transfer your payouts to this bank account.", fields: [{ label: "Account Holder Name", value: "Rahul KT" }, { label: "Bank Name", value: "HDFC Bank" }, { label: "Account Number", value: "···· ···· 4821" }, { label: "IFSC Code", value: "HDFC0001234" }, { label: "Branch", value: "Alappuzha Main Branch" }] },
          { key: "invoice", title: "Invoice Details", subtitle: "Legal and billing information", description: "You'll receive your invoices by email.", fields: [{ label: "Legal Company Name", value: "Sailcept Voyage Private Limited" }, { label: "For the Attention of", value: "Rahul KT" }, { label: "Address", value: "Punnamada Road, Alappuzha" }, { label: "Postal Code", value: "688001" }, { label: "City", value: "Alappuzha" }, { label: "Country", value: "India" }] },
          { key: "gst", title: "Goods & Services Tax", subtitle: "GST and PAN registration", description: "Required for compliance purposes.", fields: [{ label: "Registered for GST?", value: "Yes" }, { label: "GSTIN", value: "32AABCS1234F1ZV" }, { label: "PAN", value: "AABCS1234F" }, { label: "TCS Rate", value: "0.1%" }] },
        ];

        return (
          <View>
            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.navy }}>Finance Settings</Text>
              <Text style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>Bank details, invoicing and tax registration</Text>
            </View>

            <View style={{ gap: 12 }}>
              {sections.map((sec) => {
                const isOpen = financeSettingsSection === sec.key;
                return (
                  <View key={sec.key} style={{ backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, overflow: "hidden" }}>
                    <Pressable
                      onPress={() => setFinanceSettingsSection(isOpen ? null : sec.key)}
                      style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", padding: 16 }}
                    >
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.navy }}>{sec.title}</Text>
                        <Text style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{sec.subtitle}</Text>
                      </View>
                      {isOpen ? <ChevronUp size={16} color={COLORS.muted} /> : <ChevronDown size={16} color={COLORS.muted} />}
                    </Pressable>

                    {isOpen && (
                      <View style={{ backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border }}>
                        <Text style={{ fontSize: 11, color: COLORS.muted, paddingHorizontal: 16, paddingVertical: 10 }}>{sec.description}</Text>
                        {sec.fields.map((f, idx, arr) => (
                          <View
                            key={f.label}
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                              paddingHorizontal: 16,
                              paddingVertical: 10,
                              borderTopWidth: 1,
                              borderTopColor: COLORS.border,
                            }}
                          >
                            <Text style={{ fontSize: 12, color: COLORS.muted }}>{f.label}</Text>
                            <Text style={{ fontSize: 12, fontWeight: "600", color: COLORS.navy, textAlign: "right", maxWidth: "60%" }}>{f.value}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        );
      })()}
    </ScrollView>
  );
}
