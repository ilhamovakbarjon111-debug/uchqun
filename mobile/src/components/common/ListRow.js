import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import tokens from "../../styles/tokens";
import IconBubble from "./IconBubble";

export default function ListRow({ 
  icon,
  iconColor,
  title, 
  subtitle,
  time,
  onPress,
  chevron = true,
  rightContent,
  style
}) {
  const content = (
    <View style={[styles.row, style]}>
      {icon && (
        <IconBubble 
          icon={icon} 
          color={iconColor || tokens.colors.accent.blue}
          style={styles.icon}
        />
      )}
      <View style={styles.content}>
        <Text 
          style={styles.title} 
          allowFontScaling={true}
          numberOfLines={1}
        >
          {title || ''}
        </Text>
        {subtitle && (
          <Text 
            style={styles.subtitle} 
            allowFontScaling={true}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {time && (
        <Text style={styles.time} allowFontScaling={true}>
          {time}
        </Text>
      )}
      {rightContent}
      {chevron && (
        <Ionicons 
          name="chevron-forward" 
          size={18} 
          color={tokens.colors.text.muted} 
          style={styles.chevron}
        />
      )}
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: tokens.space.md,
    minHeight: 56,
  },
  icon: {
    marginRight: tokens.space.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.body.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.xs / 2,
  },
  subtitle: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.type.sub.fontWeight,
    color: tokens.colors.text.secondary,
  },
  time: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.type.sub.fontWeight,
    color: tokens.colors.text.muted,
    marginRight: tokens.space.sm,
  },
  chevron: {
    marginLeft: tokens.space.xs,
  },
  pressed: {
    opacity: 0.7,
  },
});
