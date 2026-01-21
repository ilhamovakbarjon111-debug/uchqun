import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import tokens from "../../styles/tokens";

export default function Pill({
  children,
  onPress,
  active = false,
  variant = "default",
  style
}) {
  // Check if children is a simple string - if so, wrap in Text
  // Otherwise, render children directly (they may contain Views/Icons)
  const isSimpleText = typeof children === 'string' || typeof children === 'number';

  const content = isSimpleText ? (
    <Text
      style={[
        styles.text,
        active && styles.textActive,
        variant === "outline" && styles.textOutline,
      ]}
      allowFontScaling={true}
    >
      {children}
    </Text>
  ) : (
    <View style={styles.contentRow}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.pill,
          active && styles.pillActive,
          variant === "outline" && styles.pillOutline,
          pressed && styles.pressed,
          style,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[
      styles.pill,
      active && styles.pillActive,
      variant === "outline" && styles.pillOutline,
      style,
    ]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: tokens.space.md,
    paddingVertical: tokens.space.sm,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.card.base,
    borderWidth: 1,
    borderColor: tokens.colors.card.border,
    minHeight: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  pillActive: {
    backgroundColor: tokens.colors.accent.blue,
    borderColor: tokens.colors.accent.blue,
  },
  pillOutline: {
    backgroundColor: "transparent",
    borderColor: tokens.colors.accent.blue,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.body.fontWeight,
    color: tokens.colors.text.secondary,
  },
  textActive: {
    color: tokens.colors.text.white,
  },
  textOutline: {
    color: tokens.colors.accent.blue,
  },
  pressed: {
    opacity: 0.7,
  },
});
