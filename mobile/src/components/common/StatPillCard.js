import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import tokens from "../../styles/tokens";
import IconBubble from "./IconBubble";

export default function StatPillCard({ 
  label, 
  value, 
  icon, 
  iconColor,
  onPress,
  style 
}) {
  const content = (
    <View style={[styles.card, style]}>
      <IconBubble 
        icon={icon} 
        color={iconColor || tokens.colors.accent.blue}
        size={24}
        style={styles.iconBubble}
      />
      <Text style={styles.value} allowFontScaling={true}>
        {value}
      </Text>
      <Text style={styles.label} allowFontScaling={true}>
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable 
        onPress={onPress}
        style={({ pressed }) => pressed && styles.pressed}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: tokens.colors.card.base,
    // Removed: borderColor, borderWidth - no borders per design requirements
    borderRadius: tokens.radius.xl,
    padding: tokens.space.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
    ...tokens.shadow.soft,
  },
  iconBubble: {
    marginBottom: tokens.space.sm,
  },
  value: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.xs,
  },
  label: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.type.sub.fontWeight,
    color: tokens.colors.text.secondary,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.7,
  },
});
