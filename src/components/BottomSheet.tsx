import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Modal, StyleSheet, View, Pressable, ScrollView } from "react-native";

export interface BottomSheetRef {
  snapToIndex: (index: number) => void;
  close: () => void;
}

interface BottomSheetProps {
  index?: number;
  snapPoints?: (string | number)[];
  enablePanDownToClose?: boolean;
  onChange?: (index: number) => void;
  backgroundStyle?: any;
  handleIndicatorStyle?: any;
  children?: React.ReactNode;
}

const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  (
    {
      onChange,
      backgroundStyle,
      handleIndicatorStyle,
      children,
    },
    ref
  ) => {
    const [visible, setVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      snapToIndex: (index: number) => {
        if (index >= 0) {
          setVisible(true);
          onChange?.(0);
        } else {
          setVisible(false);
          onChange?.(-1);
        }
      },
      close: () => {
        setVisible(false);
        onChange?.(-1);
      },
    }));

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="none"
        onRequestClose={() => {
          setVisible(false);
          onChange?.(-1);
        }}
      >
        <View style={styles.backdrop}>
          <Pressable style={styles.overlayPressable} onPress={() => {
            setVisible(false);
            onChange?.(-1);
          }} />
          <View style={[styles.sheetContainer, backgroundStyle]}>
            <View style={styles.handleBar}>
              <View style={[styles.handleIndicator, handleIndicatorStyle]} />
            </View>
            {children}
          </View>
        </View>
      </Modal>
    );
  }
);

export const BottomSheetScrollView = ({ children, contentContainerStyle }: any) => {
  return (
    <ScrollView contentContainerStyle={contentContainerStyle} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  overlayPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "85%",
    minHeight: "40%",
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  handleBar: {
    alignItems: "center",
    paddingVertical: 10,
    width: "100%",
  },
  handleIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e2e8f0",
  },
});

export default BottomSheet;
export type { BottomSheet as BottomSheetType };
