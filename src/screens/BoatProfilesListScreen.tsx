import React from "react";
import { Pressable, ScrollView, Text, View, ActivityIndicator } from "react-native";
import { Ship } from "lucide-react-native";
import { Card, PageHeader } from "../components";
import { useBoat } from "../context/BoatContext";
import type { MoreStackScreenProps } from "../navigation/types";
import styles from "../styles";

type Props = MoreStackScreenProps<"BoatProfilesList">;

export default function BoatProfilesListScreen({ navigation }: Props) {
  const { boats, isLoading } = useBoat();

  return (
    <ScrollView contentContainerStyle={styles.pageScrollContent}>
      <PageHeader
        title="Boat profiles"
        sub="Select a boat to view and edit its asset details."
        onBack={() => navigation.goBack()}
      />
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", minHeight: 200 }}>
          <ActivityIndicator size="large" color="#0c5eac" />
        </View>
      ) : (
        <Card title="Your boats">
          <View style={styles.verticalGap8}>
            {boats.map((boat) => (
              <Pressable
                key={boat}
                onPress={() => navigation.navigate("BoatProfileDetail", { boatName: boat })}
                style={({ pressed }) => [styles.profileBoatRow, pressed ? { opacity: 0.75 } : null]}
              >
                <Ship size={13} color="#0c5eac" strokeWidth={2.2} />
                <Text style={[styles.profileBoatText, styles.flex1]}>{boat}</Text>
                <Text style={{ color: "#9aafbf", fontSize: 14 }}>›</Text>
              </Pressable>
            ))}
          </View>
        </Card>
      )}
    </ScrollView>
  );
}
