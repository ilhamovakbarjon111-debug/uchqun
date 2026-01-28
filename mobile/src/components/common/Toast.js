import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const VARIANTS = {
  success: { bg: '#E8F5E9', color: '#2E7D32', icon: 'checkmark-circle' },
  error: { bg: '#FFEBEE', color: '#C62828', icon: 'alert-circle' },
  info: { bg: '#E3F2FD', color: '#1565C0', icon: 'information-circle' },
  warning: { bg: '#FFF8E1', color: '#F57F17', icon: 'warning' },
};

export function Toast({ message, variant = 'info', visible, onDismiss }) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const insets = useSafeAreaInsets();
  const config = VARIANTS[variant] || VARIANTS.info;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
      const timer = setTimeout(() => onDismiss?.(), 3000);
      return () => clearTimeout(timer);
    } else {
      Animated.timing(translateY, { toValue: -100, duration: 200, useNativeDriver: true }).start();
    }
  }, [visible]);

  if (!visible && !message) return null;

  return (
    <Animated.View style={[styles.container, { top: insets.top + 10, transform: [{ translateY }] }]}>
      <Pressable onPress={onDismiss} style={[styles.toast, { backgroundColor: config.bg }]}>
        <Ionicons name={config.icon} size={22} color={config.color} />
        <Text style={[styles.message, { color: config.color }]} numberOfLines={2}>{message}</Text>
        <Ionicons name="close" size={18} color={config.color} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', left: 16, right: 16, zIndex: 9999 },
  toast: {
    flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12,
    gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 4,
  },
  message: { flex: 1, fontSize: 14, fontWeight: '500' },
});
