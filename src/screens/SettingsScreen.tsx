import { ScrollView, Text } from "react-native";
import { Card, PageHeader } from "../components";
import styles from "../styles";

export default function SettingsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.pageScrollContent}>
      <PageHeader title="Settings" sub="App preferences and notifications." />
      <Card title="Coming soon">
        <Text style={styles.detailMuted}>Settings and preferences will appear here.</Text>
      </Card>
    </ScrollView>
  );
}
