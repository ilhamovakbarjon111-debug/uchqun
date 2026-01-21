import React from "react";
import { StyleSheet, View } from "react-native";
import tokens from "../../styles/tokens";

export default function ProgressBar({ 
  value, 
  max = 100, 
  color = tokens.colors.accent.blue,
  height = 6,
  style 
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <View style={[styles.track, { height }, style]}>
      <View 
        style={[
          styles.fill, 
          { 
            width: `${percentage}%`,
            backgroundColor: color,
            height,
          }
        ]} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    backgroundColor: tokens.colors.card.border,
    borderRadius: tokens.radius.pill,
    overflow: "hidden",
  },
  fill: {
    borderRadius: tokens.radius.pill,
  },
});
