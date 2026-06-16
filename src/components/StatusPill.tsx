import React from "react";
import { Text, View } from "react-native";
import styles from "../styles";

type Request = {
  name: string;
  dateLine: string;
  status: "Date locked" | "Confirmed" | "Pending" | "Rejected";
  config: string;
};

export const requestStatusStyle: Record<
  Request["status"],
  { bg: string; text: string; border: string }
> = {
  "Date locked": { bg: "#fff1d6", text: "#8f6300", border: "#f5d392" },
  Confirmed: { bg: "#dcfce8", text: "#0f7a4f", border: "#9dd8bc" },
  Pending: { bg: "#e6f5f4", text: "#1a7f7f", border: "#9dd8bc" },
  Rejected: { bg: "#ffe5e8", text: "#9f1836", border: "#f3b2c0" },
};

export type { Request };

export default function StatusPill({ status }: { status: Request["status"] }) {
  return (
    <View
      style={[
        styles.statusPill,
        {
          backgroundColor: requestStatusStyle[status]?.bg || "#e6f5f4",
          borderColor: requestStatusStyle[status]?.border || "#9dd8bc",
        },
      ]}
    >
      <Text
        style={[
          styles.statusPillText,
          { color: requestStatusStyle[status]?.text || "#1a7f7f" },
        ]}
      >
        {status}
      </Text>
    </View>
  );
}
