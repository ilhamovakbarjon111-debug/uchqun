import React from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import BackgroundScene from './BackgroundScene';
import TeacherBackground from './TeacherBackground';
import FloatingAI from '../common/FloatingAI';
import tokens from '../../styles/tokens';

/**
 * Screen - Base layout component for all screens
 * Includes beautiful background, optional header, and floating AI assistant
 * @param {string} background - 'parent' (default) or 'teacher' to choose background style
 */
export default function Screen({
  children,
  scroll = true,
  padded = true,
  header = null,
  contentStyle,
  showAI = true, // Show floating AI assistant by default
  aiContextHint = '', // Optional context hint for AI
  background = 'parent', // 'parent' or 'teacher'
}) {
  const BackgroundComponent = background === 'teacher' ? TeacherBackground : BackgroundScene;
  
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <BackgroundComponent />
        {/* Subtle readability veil */}
        <View pointerEvents="none" style={styles.veil} />

        {header}

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
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
        </KeyboardAvoidingView>

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
