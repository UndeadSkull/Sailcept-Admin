import React, { useState, useRef } from "react";
import { Pressable, Text, View, Modal, StyleSheet, useWindowDimensions, ScrollView } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBoat } from "../context/BoatContext";
import { COLORS } from "../styles";

export default function BoatSelector() {
  const { boats, selectedBoat, setSelectedBoat } = useBoat();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<View>(null);
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const selectedBoatName = selectedBoat === 0 ? "All Houseboats" : boats.find((b) => b.id === selectedBoat)?.name || "";

  const handlePress = () => {
    if (buttonRef.current) {
      buttonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setDropdownPosition({
          top: pageY + height - insets.top + 4,
          right: windowWidth - pageX - width,
        });
        setDropdownOpen(true);
      });
    } else {
      setDropdownOpen(true);
    }
  };

  return (
    <View ref={buttonRef} collapsable={false} style={styles.container}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.pill,
          {
            backgroundColor: selectedBoat === 0 ? COLORS.bg : COLORS.tealLight,
            borderColor: selectedBoat === 0 ? COLORS.border : COLORS.teal,
          },
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.pillText,
            {
              color: selectedBoat === 0 ? COLORS.muted : COLORS.teal,
            },
          ]}
        >
          {selectedBoat === 0 ? "All Houseboats" : selectedBoatName}
        </Text>
        {dropdownOpen ? (
          <ChevronUp size={11} color={selectedBoat === 0 ? COLORS.muted : COLORS.teal} strokeWidth={2.5} />
        ) : (
          <ChevronDown size={11} color={selectedBoat === 0 ? COLORS.muted : COLORS.teal} strokeWidth={2.5} />
        )}
      </Pressable>

      {dropdownOpen && (
        <Modal
          transparent
          visible={dropdownOpen}
          animationType="none"
          onRequestClose={() => setDropdownOpen(false)}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setDropdownOpen(false)} />
          <View
            style={[
              styles.dropdown,
              {
                top: dropdownPosition.top,
                right: dropdownPosition.right,
              },
            ]}
          >
            <ScrollView style={styles.scroll} bounces={false} keyboardShouldPersistTaps="handled">
              <Pressable
                onPress={() => {
                  setSelectedBoat(0);
                  setDropdownOpen(false);
                }}
                style={[
                  styles.dropdownItem,
                  selectedBoat === 0 && styles.dropdownItemActive,
                  { borderBottomWidth: 1 },
                ]}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedBoat === 0 && styles.dropdownItemTextActive,
                  ]}
                >
                  All Houseboats
                </Text>
              </Pressable>
              {boats.map((b, index) => (
                <Pressable
                  key={b.id}
                  onPress={() => {
                    setSelectedBoat(b.id);
                    setDropdownOpen(false);
                  }}
                  style={[
                    styles.dropdownItem,
                    selectedBoat === b.id && styles.dropdownItemActive,
                    index < boats.length - 1 && { borderBottomWidth: 1 },
                  ]}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedBoat === b.id && styles.dropdownItemTextActive,
                    ]}
                  >
                    {b.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    maxWidth: 140,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
    maxWidth: 100,
  },
  dropdown: {
    position: "absolute",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    minWidth: 170,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    overflow: "hidden",
  },
  scroll: {
    maxHeight: 250,
  },
  dropdownItem: {
    width: "100%",
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderBottomColor: COLORS.border,
    alignItems: "center",
  },
  dropdownItemActive: {
    backgroundColor: COLORS.tealLight,
  },
  dropdownItemText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.navy,
  },
  dropdownItemTextActive: {
    fontWeight: "700",
    color: COLORS.teal,
  },
});
