import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Design System Colors
const COLORS = {
  softNavy: '#2E3A59',
  powderBlue: '#BFD7EA',
  warmSand: '#F4EDE2',
  blushPeach: '#FADADD',
  mintMist: '#E8F8F5',
  honeyGold: '#F4D03F',
};

/**
 * BlobBackground - Floating blob-based background with glassmorphism
 *
 * Features:
 * - 7 animated floating blobs with smooth continuous motion
 * - Soft gradient base layer
 * - Glassmorphism-ready overlay system
 * - Performance optimized with native driver
 *
 * Usage:
 * <BlobBackground>
 *   <YourContent />
 * </BlobBackground>
 */
export function BlobBackground({ children }) {
  // Create 7 animated values for blob positions
  const blob1 = useRef(new Animated.Value(0)).current;
  const blob2 = useRef(new Animated.Value(0)).current;
  const blob3 = useRef(new Animated.Value(0)).current;
  const blob4 = useRef(new Animated.Value(0)).current;
  const blob5 = useRef(new Animated.Value(0)).current;
  const blob6 = useRef(new Animated.Value(0)).current;
  const blob7 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create looping animations for each blob with different durations
    const createBlobAnimation = (animatedValue, duration) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Start all animations with different durations for organic motion
    const animations = [
      createBlobAnimation(blob1, 15000),
      createBlobAnimation(blob2, 20000),
      createBlobAnimation(blob3, 18000),
      createBlobAnimation(blob4, 22000),
      createBlobAnimation(blob5, 17000),
      createBlobAnimation(blob6, 19000),
      createBlobAnimation(blob7, 21000),
    ];

    animations.forEach(anim => anim.start());

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, [blob1, blob2, blob3, blob4, blob5, blob6, blob7]);

  // Interpolate blob positions for smooth floating motion
  const blob1X = blob1.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 30],
  });
  const blob1Y = blob1.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 20],
  });

  const blob2X = blob2.interpolate({
    inputRange: [0, 1],
    outputRange: [20, -20],
  });
  const blob2Y = blob2.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 30],
  });

  const blob3X = blob3.interpolate({
    inputRange: [0, 1],
    outputRange: [-25, 25],
  });
  const blob3Y = blob3.interpolate({
    inputRange: [0, 1],
    outputRange: [25, -25],
  });

  const blob4X = blob4.interpolate({
    inputRange: [0, 1],
    outputRange: [30, -30],
  });
  const blob4Y = blob4.interpolate({
    inputRange: [0, 1],
    outputRange: [-15, 15],
  });

  const blob5X = blob5.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 20],
  });
  const blob5Y = blob5.interpolate({
    inputRange: [0, 1],
    outputRange: [20, -20],
  });

  const blob6X = blob6.interpolate({
    inputRange: [0, 1],
    outputRange: [25, -25],
  });
  const blob6Y = blob6.interpolate({
    inputRange: [0, 1],
    outputRange: [-25, 25],
  });

  const blob7X = blob7.interpolate({
    inputRange: [0, 1],
    outputRange: [-35, 35],
  });
  const blob7Y = blob7.interpolate({
    inputRange: [0, 1],
    outputRange: [30, -30],
  });

  return (
    <View style={styles.container}>
      {/* Base Gradient Background */}
      <LinearGradient
        colors={[COLORS.warmSand, COLORS.mintMist, COLORS.powderBlue]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Floating Blobs Layer */}
      <View style={StyleSheet.absoluteFillObject}>
        {/* Blob 1 - Top Left - Soft Navy */}
        <Animated.View
          style={[
            styles.blob,
            {
              width: 280,
              height: 280,
              top: SCREEN_HEIGHT * 0.05,
              left: -80,
              backgroundColor: COLORS.softNavy,
              opacity: 0.08,
              transform: [{ translateX: blob1X }, { translateY: blob1Y }],
            },
          ]}
        />

        {/* Blob 2 - Top Right - Powder Blue */}
        <Animated.View
          style={[
            styles.blob,
            {
              width: 240,
              height: 240,
              top: SCREEN_HEIGHT * 0.08,
              right: -60,
              backgroundColor: COLORS.powderBlue,
              opacity: 0.12,
              transform: [{ translateX: blob2X }, { translateY: blob2Y }],
            },
          ]}
        />

        {/* Blob 3 - Middle Left - Blush Peach */}
        <Animated.View
          style={[
            styles.blob,
            {
              width: 200,
              height: 200,
              top: SCREEN_HEIGHT * 0.3,
              left: -50,
              backgroundColor: COLORS.blushPeach,
              opacity: 0.15,
              transform: [{ translateX: blob3X }, { translateY: blob3Y }],
            },
          ]}
        />

        {/* Blob 4 - Center - Mint Mist */}
        <Animated.View
          style={[
            styles.blob,
            {
              width: 320,
              height: 320,
              top: SCREEN_HEIGHT * 0.35,
              left: SCREEN_WIDTH * 0.3,
              backgroundColor: COLORS.mintMist,
              opacity: 0.1,
              transform: [{ translateX: blob4X }, { translateY: blob4Y }],
            },
          ]}
        />

        {/* Blob 5 - Middle Right - Honey Gold */}
        <Animated.View
          style={[
            styles.blob,
            {
              width: 220,
              height: 220,
              top: SCREEN_HEIGHT * 0.5,
              right: -70,
              backgroundColor: COLORS.honeyGold,
              opacity: 0.09,
              transform: [{ translateX: blob5X }, { translateY: blob5Y }],
            },
          ]}
        />

        {/* Blob 6 - Bottom Left - Powder Blue */}
        <Animated.View
          style={[
            styles.blob,
            {
              width: 260,
              height: 260,
              bottom: SCREEN_HEIGHT * 0.15,
              left: -90,
              backgroundColor: COLORS.powderBlue,
              opacity: 0.11,
              transform: [{ translateX: blob6X }, { translateY: blob6Y }],
            },
          ]}
        />

        {/* Blob 7 - Bottom Right - Soft Navy */}
        <Animated.View
          style={[
            styles.blob,
            {
              width: 300,
              height: 300,
              bottom: -100,
              right: -80,
              backgroundColor: COLORS.softNavy,
              opacity: 0.07,
              transform: [{ translateX: blob7X }, { translateY: blob7Y }],
            },
          ]}
        />
      </View>

      {/* Content Layer */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmSand,
  },
  blob: {
    position: 'absolute',
    borderRadius: 9999, // Perfect circle
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
});
