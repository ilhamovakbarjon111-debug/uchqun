import React from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import BackgroundScene from './BackgroundScene';
import TeacherBackground from './TeacherBackground';
import FloatingAI from '../common/FloatingAI';
import { useThemeTokens } from '../../hooks/useThemeTokens';
import { useTheme } from '../../context/ThemeContext';

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
  const tokens = useThemeTokens();
  const { isDark } = useTheme();
  const BackgroundComponent = background === 'teacher' ? TeacherBackground : BackgroundScene;

  const dynamicStyles = {
    safe: {
      flex: 1,
      backgroundColor: tokens.colors.background.primary,
    },
    veil: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.02)' : 'rgba(248, 250, 252, 0.03)',
    },
  };

  return (
    <SafeAreaView style={dynamicStyles.safe}>
      <View style={styles.root}>
        <BackgroundComponent />
        {/* Subtle readability veil */}
        <View pointerEvents="none" style={dynamicStyles.veil} />

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
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: 18, // tokens.space.xl
    paddingBottom: 36, // tokens.space['3xl']
  },
  withHeader: {
    paddingTop: 6, // tokens.space.sm
  },
});
