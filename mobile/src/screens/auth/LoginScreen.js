import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { clearAuth } from '../../storage/authStorage';
import { API_URL } from '../../config';
import theme from '../../styles/theme';

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Clear any stale auth data when LoginScreen mounts
  useEffect(() => {
    clearAuth().catch(() => {});
    if (__DEV__) {
      console.log('[LoginScreen] API URL:', API_URL);
    }
  }, []);

  const onSubmit = async () => {
    if (submitting) return;
    if (!email.trim() || !password) {
      setError('Email va parolni kiriting');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      // Clear any old tokens before fresh login
      await clearAuth();
      await login(email.trim().toLowerCase(), password);
      // Navigation will happen via useEffect when isAuthenticated changes
    } catch (e) {
      // Extract error message from response or error object
      let msg = 'Login failed. Email/parolni tekshirib qayta urinib ko\'ring.';
      
      if (e?.response?.data?.error) {
        msg = e.response.data.error;
      } else if (e?.response?.data?.message) {
        msg = e.response.data.message;
      } else if (e?.message && !e.message.includes('Network')) {
        msg = e.message;
      } else if (e?.message?.includes('Network')) {
        msg = 'Server bilan bog\'lanib bo\'lmadi. Internet aloqangizni tekshiring.';
      }
      
      setError(msg);
      if (__DEV__) {
        console.error('[LoginScreen] Login error:', e?.response?.data || e?.message || e);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconEmoji}>🎓</Text>
          </View>
          <Text style={styles.title}>Uchqun Platform</Text>
          <Text style={styles.subtitle}>Special Education School Management</Text>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="username"
            placeholder="Enter your email"
            placeholderTextColor="#9ca3af"
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordWrap}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              textContentType="password"
              placeholder="Enter your password"
              placeholderTextColor="#9ca3af"
              style={[styles.input, styles.inputWithRightIcon]}
            />
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              hitSlop={10}
              style={({ pressed }) => [styles.eyeButton, pressed && styles.eyeButtonPressed]}
            >
              <Ionicons
                name={showPassword ? 'eye' : 'eye-off'}
                size={20}
                color="#6b7280"
              />
            </Pressable>
          </View>

          <Pressable
            onPress={onSubmit}
            disabled={submitting}
            style={({ pressed }) => [
              styles.button,
              submitting && styles.buttonDisabled,
              pressed && !submitting && styles.buttonPressed,
            ]}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.Colors.primary.blueBg,
    padding: theme.Spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: theme.Colors.background.card,
    borderRadius: theme.BorderRadius.lg,
    ...theme.Colors.shadow.lg,
    padding: theme.Spacing['2xl'],
    marginVertical: theme.Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.Spacing['2xl'],
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.Colors.primary.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.Spacing.md,
  },
  iconEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: theme.Typography.sizes['2xl'],
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.text.primary,
    marginBottom: theme.Spacing.sm,
  },
  subtitle: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
  },
  form: {
    gap: theme.Spacing.lg,
  },
  label: {
    fontSize: theme.Typography.sizes.sm,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.Colors.border.medium,
    borderRadius: theme.BorderRadius.sm,
    paddingHorizontal: theme.Spacing.md,
    paddingVertical: 12,
    backgroundColor: theme.Colors.background.card,
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.primary,
  },
  passwordWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputWithRightIcon: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  eyeButtonPressed: {
    opacity: 0.7,
  },
  button: {
    marginTop: theme.Spacing.sm,
    backgroundColor: theme.Colors.primary.blue,
    paddingVertical: 12,
    borderRadius: theme.BorderRadius.sm,
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: theme.Colors.primary.blueDark,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: theme.Colors.text.inverse,
    fontWeight: theme.Typography.weights.semibold,
    fontSize: theme.Typography.sizes.base,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: theme.Spacing.md,
    borderRadius: theme.BorderRadius.sm,
    marginBottom: theme.Spacing.md,
  },
  error: {
    color: theme.Colors.status.error,
    fontSize: theme.Typography.sizes.sm,
    textAlign: 'center',
  },
});
