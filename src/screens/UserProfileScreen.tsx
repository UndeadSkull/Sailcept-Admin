import { ScrollView, Text, View } from "react-native";
import { Ship } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { Card, PageHeader } from "../components";
import styles from "../styles";

const USER = { name: "Ethan Walker", phone: "+1 415 555 0134", email: "ethan.walker@sailcept.com" };
const BOATS = ["Vembanad Crest", "Backwater Pearl", "Kerala Dream"];

export default function UserProfileScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.pageScrollContent}>
      <PageHeader
        title="Profile"
        sub="View user details and registered boat list."
        onBack={() => navigation.goBack()}
      />
      <Card title="User details">
        <View style={styles.verticalGap10}>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Name</Text>
            <Text style={styles.metaValue}>{USER.name}</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Phone number</Text>
            <Text style={styles.metaValue}>{USER.phone}</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Email</Text>
            <Text style={styles.metaValue}>{USER.email}</Text>
          </View>
        </View>
      </Card>
      <Card title="Boat list">
        <View style={styles.verticalGap8}>
          {BOATS.map((boat) => (
            <View key={boat} style={styles.profileBoatRow}>
              <Ship size={13} color="#0c5eac" strokeWidth={2.2} />
              <Text style={styles.profileBoatText}>{boat}</Text>
            </View>
          ))}
        </View>
      </Card>
    </ScrollView>
  );
}
