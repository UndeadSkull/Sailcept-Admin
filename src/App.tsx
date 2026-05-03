import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

type TabKey = 'dashboard' | 'boat' | 'calendar' | 'enquiries' | 'bookings';

type EnquiryStatus = 'Date locked' | 'Confirmed' | 'Pending';

type Enquiry = {
  id: string;
  name: string;
  dateLine: string;
  status: EnquiryStatus;
  config: string;
};

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'dashboard', label: 'Overview' },
  { key: 'boat', label: 'Boat' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'enquiries', label: 'Enquiries' },
  { key: 'bookings', label: 'Bookings' },
];

const enquiriesSeed: Enquiry[] = [
  {
    id: 'enq-1',
    name: 'Arjun Menon',
    dateLine: 'Day cruise · 15 Jan 2025',
    status: 'Date locked',
    config: 'Premium · Private · 2 adults · 1 room · Full upper deck · INR 12,500',
  },
  {
    id: 'enq-2',
    name: 'Priya Sharma',
    dateLine: 'Overnight stay · 18 Jan 2025',
    status: 'Confirmed',
    config: 'Luxury · Private · 4 adults · 2 rooms · INR 28,000',
  },
  {
    id: 'enq-3',
    name: 'Noah Thomas',
    dateLine: 'Day cruise · 20 Jan 2025',
    status: 'Pending',
    config: 'Premium · Shared · 2 adults · Upper deck · INR 8,400',
  },
];

function pageHeader(title: string, subtitle: string) {
  return (
    <View style={styles.headerWrap}>
      <Text style={styles.headerTitle}>{title}</Text>
      <Text style={styles.headerSub}>{subtitle}</Text>
    </View>
  );
}

function card(title: string, children: React.ReactNode) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

function DashboardScreen({ enquiries }: { enquiries: Enquiry[] }) {
  const quickStats = [
    { label: 'Open dates this month', value: '18', hint: 'of 31 days' },
    { label: 'Pending enquiries', value: '3', hint: 'Awaiting response' },
    { label: 'Confirmed bookings', value: '11', hint: 'This month' },
    { label: 'Revenue (month)', value: 'INR 1.4L', hint: 'Normal + peak' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.pageContent}>
      {pageHeader('Overview', 'Your houseboat performance at a glance')}
      <View style={styles.statsGrid}>
        {quickStats.map((stat) => (
          <View key={stat.label} style={styles.statTile}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statHint}>{stat.hint}</Text>
          </View>
        ))}
      </View>
      {card(
        'Recent enquiries',
        <View style={styles.listGap}>
          {enquiries.slice(0, 2).map((enquiry) => (
            <View key={enquiry.id} style={styles.listCard}>
              <View style={styles.rowSpace}>
                <View style={styles.flex1}>
                  <Text style={styles.itemTitle}>{enquiry.name}</Text>
                  <Text style={styles.itemSub}>{enquiry.dateLine}</Text>
                </View>
                <Text style={[styles.statusBadge, statusStyle(enquiry.status)]}>{enquiry.status}</Text>
              </View>
              <Text style={styles.itemMeta}>{enquiry.config}</Text>
            </View>
          ))}
        </View>,
      )}
    </ScrollView>
  );
}

function BoatScreen() {
  const [boatName, setBoatName] = useState('Vembanad Crest');
  const [experienceTier, setExperienceTier] = useState('Premium');
  const [privateOnly, setPrivateOnly] = useState(true);
  const [maxGuests, setMaxGuests] = useState('6');
  const [bedrooms, setBedrooms] = useState('2');
  const [fullUpperDeck, setFullUpperDeck] = useState(true);
  const [sundeck, setSundeck] = useState(true);

  return (
    <ScrollView contentContainerStyle={styles.pageContent}>
      {pageHeader('Boat asset', 'Permanent truths about your boat for matching and pricing')}
      {card(
        'Identity',
        <View style={styles.formGap}>
          <Field label="Boat name" value={boatName} onChangeText={setBoatName} />
          <Field label="Experience tier" value={experienceTier} onChangeText={setExperienceTier} />
          <View style={styles.rowSpace}>
            <Text style={styles.switchLabel}>Private only bookings</Text>
            <Switch value={privateOnly} onValueChange={setPrivateOnly} />
          </View>
          <Field label="Max guests" value={maxGuests} onChangeText={setMaxGuests} keyboardType="numeric" />
          <Field label="Bedrooms" value={bedrooms} onChangeText={setBedrooms} keyboardType="numeric" />
        </View>,
      )}
      {card(
        'Structure and deck features',
        <View style={styles.formGap}>
          <View style={styles.rowSpace}>
            <Text style={styles.switchLabel}>Full upper deck</Text>
            <Switch value={fullUpperDeck} onValueChange={setFullUpperDeck} />
          </View>
          <View style={styles.rowSpace}>
            <Text style={styles.switchLabel}>Sundeck</Text>
            <Switch value={sundeck} onValueChange={setSundeck} />
          </View>
        </View>,
      )}
    </ScrollView>
  );
}

function CalendarScreen() {
  const [month] = useState('January 2025');
  const [openDays] = useState(['3', '5', '7', '12', '13', '21', '27']);

  return (
    <ScrollView contentContainerStyle={styles.pageContent}>
      {pageHeader('Calendar', 'Control inventory and operating days')}
      {card(
        month,
        <View style={styles.formGap}>
          <Text style={styles.itemSub}>Open dates</Text>
          <View style={styles.chipWrap}>
            {openDays.map((day) => (
              <View key={day} style={styles.dateChip}>
                <Text style={styles.dateChipText}>{day}</Text>
              </View>
            ))}
          </View>
        </View>,
      )}
    </ScrollView>
  );
}

function EnquiriesScreen({ enquiries }: { enquiries: Enquiry[] }) {
  const grouped = useMemo(() => {
    return {
      pending: enquiries.filter((entry) => entry.status === 'Pending'),
      locked: enquiries.filter((entry) => entry.status === 'Date locked'),
      confirmed: enquiries.filter((entry) => entry.status === 'Confirmed'),
    };
  }, [enquiries]);

  return (
    <ScrollView contentContainerStyle={styles.pageContent}>
      {pageHeader('Enquiries', 'Track active demand and move requests to bookings')}
      {card(
        'Pipeline',
        <View style={styles.formGap}>
          <Text style={styles.itemSub}>Pending: {grouped.pending.length}</Text>
          <Text style={styles.itemSub}>Date locked: {grouped.locked.length}</Text>
          <Text style={styles.itemSub}>Confirmed: {grouped.confirmed.length}</Text>
        </View>,
      )}
      {card(
        'All enquiries',
        <View style={styles.listGap}>
          {enquiries.map((enquiry) => (
            <View key={enquiry.id} style={styles.listCard}>
              <View style={styles.rowSpace}>
                <Text style={styles.itemTitle}>{enquiry.name}</Text>
                <Text style={[styles.statusBadge, statusStyle(enquiry.status)]}>{enquiry.status}</Text>
              </View>
              <Text style={styles.itemSub}>{enquiry.dateLine}</Text>
              <Text style={styles.itemMeta}>{enquiry.config}</Text>
            </View>
          ))}
        </View>,
      )}
    </ScrollView>
  );
}

function BookingsScreen() {
  const bookings = [
    { id: 'book-1', guest: 'Priya Sharma', when: '18 Jan 2025', package: 'Overnight luxury' },
    { id: 'book-2', guest: 'Abel George', when: '22 Jan 2025', package: 'Day cruise premium' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.pageContent}>
      {pageHeader('Bookings', 'Confirmed trips and readiness checklist')}
      {card(
        'Upcoming',
        <View style={styles.listGap}>
          {bookings.map((booking) => (
            <View key={booking.id} style={styles.listCard}>
              <Text style={styles.itemTitle}>{booking.guest}</Text>
              <Text style={styles.itemSub}>{booking.when}</Text>
              <Text style={styles.itemMeta}>{booking.package}</Text>
            </View>
          ))}
        </View>,
      )}
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'numeric';
}) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? 'default'}
        style={styles.input}
      />
    </View>
  );
}

function statusStyle(status: EnquiryStatus) {
  if (status === 'Confirmed') {
    return styles.statusConfirmed;
  }
  if (status === 'Date locked') {
    return styles.statusLocked;
  }
  return styles.statusPending;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [enquiries] = useState(enquiriesSeed);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.appShell}>
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const active = tab.key === activeTab;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tabButton, active ? styles.tabButtonActive : null]}
              >
                <Text style={[styles.tabLabel, active ? styles.tabLabelActive : null]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.screenWrap}>
          {activeTab === 'dashboard' ? <DashboardScreen enquiries={enquiries} /> : null}
          {activeTab === 'boat' ? <BoatScreen /> : null}
          {activeTab === 'calendar' ? <CalendarScreen /> : null}
          {activeTab === 'enquiries' ? <EnquiriesScreen enquiries={enquiries} /> : null}
          {activeTab === 'bookings' ? <BookingsScreen /> : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#edf4ff',
  },
  appShell: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d8e6ff',
    backgroundColor: '#f5f9ff',
  },
  tabButton: {
    borderRadius: 999,
    backgroundColor: '#e6efff',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tabButtonActive: {
    backgroundColor: '#1f4da8',
  },
  tabLabel: {
    fontSize: 13,
    color: '#31538f',
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#ffffff',
  },
  screenWrap: {
    flex: 1,
  },
  pageContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 28,
  },
  headerWrap: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#123166',
  },
  headerSub: {
    fontSize: 14,
    color: '#4c5f87',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d8e6ff',
    backgroundColor: '#ffffff',
    padding: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#123166',
  },
  cardBody: {
    marginTop: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statTile: {
    width: '48%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d8e6ff',
    backgroundColor: '#ffffff',
    padding: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#4c5f87',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#123166',
    marginTop: 8,
  },
  statHint: {
    fontSize: 12,
    color: '#6e83ad',
  },
  listGap: {
    gap: 10,
  },
  listCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0ebff',
    padding: 12,
    gap: 6,
  },
  rowSpace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  flex1: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#15376d',
  },
  itemSub: {
    fontSize: 13,
    color: '#4c5f87',
  },
  itemMeta: {
    fontSize: 13,
    color: '#2f456f',
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '700',
  },
  statusConfirmed: {
    backgroundColor: '#dbf8ea',
    color: '#0d7a4d',
  },
  statusLocked: {
    backgroundColor: '#fff1d6',
    color: '#8f6300',
  },
  statusPending: {
    backgroundColor: '#dff1ff',
    color: '#1d6094',
  },
  formGap: {
    gap: 12,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#5a6f99',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d8e6ff',
    borderRadius: 10,
    backgroundColor: '#f8fbff',
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1e3c72',
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#23457d',
    flex: 1,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateChip: {
    borderRadius: 8,
    backgroundColor: '#e6efff',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dateChipText: {
    color: '#21407a',
    fontWeight: '700',
  },
});
