import { ScrollView, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Card, PageHeader } from "../components";
import styles from "../styles";

export default function SettingsScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.pageScrollContent}>
      <PageHeader
        title="Settings"
        sub="App preferences and notifications."
        onBack={() => navigation.goBack()}
      />
      <Card title="Coming soon">
        <Text style={styles.detailMuted}>Settings and preferences will appear here.</Text>
      </Card>
    </ScrollView>
  );
}
