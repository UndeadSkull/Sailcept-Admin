import { ScrollView, Text } from "react-native";
import { Card, PageHeader } from "../components";
import styles from "../styles";

export default function ReviewsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.pageScrollContent}>
      <PageHeader title="Reviews" sub="Guest reviews and ratings for your boats." />
      <Card title="Coming soon">
        <Text style={styles.detailMuted}>Guest reviews will appear here once available.</Text>
      </Card>
    </ScrollView>
  );
}
