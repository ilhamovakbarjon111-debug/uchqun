import React, { useEffect, useRef } from "react";
import { StyleSheet, Animated, View } from "react-native";
import tokens from "../../styles/tokens";

export default function Skeleton({ 
  width = "100%", 
  height = 20, 
  variant = "rect",
  style 
}) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  const borderRadius = variant === "circle" 
    ? tokens.radius.pill 
    : variant === "text" 
    ? tokens.radius.md 
    : tokens.radius.lg;

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: tokens.colors.card.border,
  },
});
