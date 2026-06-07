import { FontAwesome5 } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
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

export function PageHeader({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.pageHeader}>
      <View style={styles.flex1}>
        <Text style={styles.pageTitle}>{title}</Text>
        <Text style={styles.pageSub}>{sub}</Text>
      </View>
      {children}
    </View>
  );
}

export function Card({
  title,
  sub,
  children,
}: {
  title?: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
      {sub ? <Text style={styles.cardSub}>{sub}</Text> : null}
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

export function OptionSelect({
  value,
  options,
  onChange,
  disabled,
}: {
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        const next = (index + 1) % options.length;
        onChange(options[next].value);
      }}
      style={[
        styles.selectButton,
        disabled ? styles.selectButtonDisabled : null,
      ]}
    >
      <Text
        style={[
          styles.selectButtonText,
          disabled ? styles.selectButtonTextDisabled : null,
        ]}
      >
        {options[index].label}
      </Text>
    </Pressable>
  );
}

export function StatusPill({ status }: { status: Request["status"] }) {
  return (
    <View
      style={[
        styles.statusPill,
        {
          backgroundColor: requestStatusStyle[status].bg,
          borderColor: requestStatusStyle[status].border,
        },
      ]}
    >
      <Text
        style={[styles.statusPillText, { color: requestStatusStyle[status].text }]}
      >
        {status}
      </Text>
    </View>
  );
}

export function CruiseTypeIcon({
  type,
  size = "compact",
}: {
  type: "day" | "overnight" | "night";
  size?: "compact" | "regular";
}) {
  const iconSize = size === "regular" ? 12 : 7;

  if (type === "day") {
    return <FontAwesome5 name="sun" size={iconSize} color={"#1a7f7f"} solid />;
  }
  if (type === "overnight") {
    return <FontAwesome5 name="bed" size={iconSize} color={"#1a7f7f"} solid />;
  }
  return <FontAwesome5 name="moon" size={iconSize} color={"#1a7f7f"} solid />;
}
