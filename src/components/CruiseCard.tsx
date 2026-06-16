import React from "react";
import { Pressable, Text, View } from "react-native";
import { Calendar, User, DollarSign, ArrowRight } from "lucide-react-native";
import StatusPill from "./StatusPill";
import CruiseTypeIcon from "./CruiseTypeIcon";
import styles from "../styles";

type CruiseCardProps = {
  title: string;
  subtitle: string;
  cruiseType?: "day" | "overnight" | "night" | null;
  status?: string;
  config?: string;
  priceLine?: string;
  onPress?: () => void;
  actions?: React.ReactNode;
};

export default function CruiseCard({
  title,
  subtitle,
  cruiseType,
  status,
  config,
  priceLine,
  onPress,
  actions,
}: CruiseCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.cruiseCardContainer,
        pressed && onPress ? styles.cruiseCardContainerPressed : null,
      ]}
    >
      <View style={styles.cruiseCardHeaderRow}>
        <View style={styles.flex1}>
          <Text style={styles.cruiseCardTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View style={styles.cruiseCardHeaderRight}>
          {cruiseType && (
            <View style={styles.cruiseCardTypeBadge}>
              <CruiseTypeIcon type={cruiseType} size="regular" />
            </View>
          )}
          {status && (
            <StatusPill status={status as "Date locked" | "Confirmed" | "Pending" | "Rejected"} />
          )}
        </View>
      </View>

      <View style={styles.cruiseCardDivider} />

      <View style={styles.cruiseCardBody}>
        <View style={styles.cruiseCardInfoRow}>
          <Calendar size={13} color="#6d8299" style={styles.cruiseCardIcon} />
          <Text style={styles.cruiseCardDateText}>{subtitle}</Text>
        </View>

        {config && (
          <View style={styles.cruiseCardInfoRow}>
            <User size={13} color="#6d8299" style={styles.cruiseCardIcon} />
            <Text style={styles.cruiseCardConfigText}>{config}</Text>
          </View>
        )}

        {priceLine && (
          <View style={styles.cruiseCardInfoRow}>
            <DollarSign size={13} color="#1a7f7f" style={styles.cruiseCardIcon} />
            <Text style={styles.cruiseCardPriceText}>{priceLine}</Text>
          </View>
        )}
      </View>

      {actions && (
        <View style={styles.cruiseCardActionsContainer}>
          {actions}
        </View>
      )}

      {onPress && !actions && (
        <View style={styles.cruiseCardChevronWrapper}>
          <ArrowRight size={14} color="#6d8299" />
        </View>
      )}
    </Pressable>
  );
}
