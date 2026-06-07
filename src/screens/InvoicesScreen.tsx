import { ScrollView, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Card, PageHeader } from "../components";
import styles from "../styles";

export default function InvoicesScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.pageScrollContent}>
      <PageHeader
        title="Invoices"
        sub="Billing and payment history."
        onBack={() => navigation.goBack()}
      />
      <Card title="Coming soon">
        <Text style={styles.detailMuted}>Invoices and payment history will appear here.</Text>
      </Card>
    </ScrollView>
  );
}
