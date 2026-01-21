import React from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, Platform } from 'react-native';
import BackgroundScene from './BackgroundScene';
import FloatingAI from '../common/FloatingAI';
import tokens from '../../styles/tokens';

/**
 * Screen - Base layout component for all screens
 * Includes beautiful background, optional header, and floating AI assistant
 */
export default function Screen({
  children,
  scroll = true,
  padded = true,
  header = null,
  contentStyle,
  showAI = true, // Show floating AI assistant by default
  aiContextHint = '', // Optional context hint for AI
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <BackgroundScene />
        {/* Subtle readability veil */}
        <View pointerEvents="none" style={styles.veil} />

        {header}

        {scroll ? (
          <ScrollView
            style={styles.container}
            contentContainerStyle={[
              padded && styles.padded,
              header && styles.withHeader,
              contentStyle,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[
            styles.container,
            padded && styles.padded,
            header && styles.withHeader,
            contentStyle,
          ]}>
            {children}
          </View>
        )}

        {/* Floating AI Assistant */}
        {showAI && <FloatingAI contextHint={aiContextHint} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  root: {
    flex: 1,
  },
  veil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)',
  },
  container: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: tokens.space.xl,
    paddingBottom: tokens.space['3xl'],
  },
  withHeader: {
    paddingTop: tokens.space.sm,
  },
});
