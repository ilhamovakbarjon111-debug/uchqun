import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import tokens from "../../styles/tokens";

export default function IconBubble({ 
  icon, 
  size = 20, 
  color = tokens.colors.accent.blue,
  backgroundColor,
  style 
}) {
  const bgColor = backgroundColor || `${color}15`;
  
  return (
    <View style={[
      styles.bubble,
      { backgroundColor: bgColor },
      style
    ]}>
      <Ionicons name={icon} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
});
