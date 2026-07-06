import React from "react";
import { Pressable, Text, View } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import styles from "../styles";

export { default as StatusPill } from "./StatusPill";
export { default as CruiseTypeIcon } from "./CruiseTypeIcon";
export { default as CruiseCard } from "./CruiseCard";
export type { Request } from "./StatusPill";
export { requestStatusStyle } from "./StatusPill";

export function PageHeader({
  title,
  sub,
  onBack,
  children,
}: {
  title: string;
  sub: string;
  onBack?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.pageHeader}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, flex: 1 }}>
        {onBack && (
          <Pressable
            onPress={onBack}
            style={{
              paddingRight: 4,
              paddingVertical: 2,
              marginTop: 2,
            }}
            testID="header-back-button"
          >
            <ChevronLeft size={26} color="#0f284e" strokeWidth={2.8} />
          </Pressable>
        )}
        <View style={styles.flex1}>
          <Text style={styles.pageTitle}>{title}</Text>
          <Text style={styles.pageSub}>{sub}</Text>
        </View>
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
