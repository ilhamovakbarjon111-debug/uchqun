import React, { useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { clearAuth } from '../../storage/authStorage';
import { API_URL } from '../../config';
import tokens from '../../styles/tokens';

const { width } = Dimensions.get('window');

export function LoginScreen() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;

  // Clear any stale auth data when LoginScreen mounts
  useEffect(() => {
    clearAuth().catch(() => {});
    if (__DEV__) {
      console.log('[LoginScreen] API URL:', API_URL);
    }

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating animations for decorative elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: -20,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim1, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, {
          toValue: -15,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim2, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const onSubmit = async () => {
    if (submitting) return;
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = typeof password === 'string' ? password.trim() : String(password || '').trim();
    if (!trimmedEmail || !trimmedPassword) {
      setError(t('login.fillAllFields', { defaultValue: 'Iltimos, email va parolni kiriting' }));
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await clearAuth();
      await login(trimmedEmail, trimmedPassword);
    } catch (e) {
      let msg = t('login.invalid', { defaultValue: 'Email yoki parol noto\'g\'ri' });

      if (e?.response?.data?.error) {
        msg = e.response.data.error;
      } else if (e?.response?.data?.message) {
        msg = e.response.data.message;
      } else if (e?.message && !e.message.includes('Network')) {
        msg = e.message;
      } else if (e?.message?.includes('Network')) {
        msg = t('login.networkError', { defaultValue: 'Serverga ulanib bo\'lmadi. Internet aloqasini tekshiring.' });
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
    <View style={styles.container}>
      {/* Animated gradient background */}
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155', '#1E293B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative floating orbs */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb1,
          { transform: [{ translateY: floatAnim1 }] }
        ]}
      >
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.2)', 'rgba(99, 102, 241, 0.1)']}
          style={styles.orbGradient}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.orb,
          styles.orb2,
          { transform: [{ translateY: floatAnim2 }] }
        ]}
      >
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.15)', 'rgba(14, 165, 233, 0.1)']}
          style={styles.orbGradient}
        />
      </Animated.View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Logo and header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#8B5CF6', '#6366F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconGradient}
              >
                <Image
                  source={require('../../../assets/icon.png')}
                  style={styles.appIcon}
                  resizeMode="contain"
                />
              </LinearGradient>
            </View>
            <Text style={styles.title}>{t('login.title', { defaultValue: 'Uchqun Portal' })}</Text>
            <Text style={styles.subtitle}>{t('login.subtitle', { defaultValue: 'Maxsus ta\'lim maktabi boshqaruvi' })}</Text>
          </View>

          {/* Glassmorphic card */}
          <View style={styles.card}>
            <LinearGradient
              colors={['rgba(51, 65, 85, 0.7)', 'rgba(30, 41, 59, 0.6)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.cardGradient}
            >
              {error ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={18} color="#FCA5A5" />
                  <Text style={styles.error}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.form}>
                {/* Email input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('login.email', { defaultValue: 'Email manzil' })}</Text>
                  <View style={styles.inputContainer}>
                    <LinearGradient
                      colors={['rgba(148, 163, 184, 0.1)', 'rgba(100, 116, 139, 0.05)']}
                      style={styles.inputGradient}
                    >
                      <View style={styles.inputIconContainer}>
                        <Ionicons name="mail-outline" size={18} color={tokens.colors.text.muted} />
                      </View>
                      <TextInput
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                        textContentType="username"
                        placeholder={t('login.emailPlaceholder', { defaultValue: 'sizning@email.com' })}
                        placeholderTextColor={tokens.colors.text.muted}
                        style={styles.input}
                      />
                    </LinearGradient>
                  </View>
                </View>

                {/* Password input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('login.password', { defaultValue: 'Parol' })}</Text>
                  <View style={styles.inputContainer}>
                    <LinearGradient
                      colors={['rgba(148, 163, 184, 0.1)', 'rgba(100, 116, 139, 0.05)']}
                      style={styles.inputGradient}
                    >
                      <View style={styles.inputIconContainer}>
                        <Ionicons name="lock-closed-outline" size={18} color={tokens.colors.text.muted} />
                      </View>
                      <TextInput
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        textContentType="password"
                        placeholder={t('login.passwordPlaceholder', { defaultValue: 'Parolni kiriting' })}
                        placeholderTextColor={tokens.colors.text.muted}
                        style={[styles.input, styles.inputWithIcon]}
                      />
                      <Pressable
                        onPress={() => setShowPassword((v) => !v)}
                        hitSlop={10}
                        style={({ pressed }) => [
                          styles.eyeButton,
                          pressed && { opacity: 0.7 }
                        ]}
                      >
                        <Ionicons
                          name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                          size={18}
                          color={tokens.colors.text.muted}
                        />
                      </Pressable>
                    </LinearGradient>
                  </View>
                </View>

                {/* Login button */}
                <Pressable
                  onPress={onSubmit}
                  disabled={submitting}
                  style={({ pressed }) => [
                    styles.buttonContainer,
                    pressed && !submitting && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <LinearGradient
                    colors={submitting ? ['#475569', '#334155'] : ['#8B5CF6', '#6366F1', '#3B82F6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.button}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Text style={styles.buttonText}>{t('login.submit', { defaultValue: 'Kirish' })}</Text>
                        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
              </View>
            </LinearGradient>
          </View>

          {/* Footer hint */}
          <Text style={styles.footerText}>
            <Ionicons name="shield-checkmark-outline" size={12} color={tokens.colors.text.muted} />
            {' '}{t('login.secureAuth', { defaultValue: 'JWT bilan xavfsiz autentifikatsiya' })}
          </Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: tokens.space['2xl'],
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  orb2: {
    width: 250,
    height: 250,
    bottom: -80,
    left: -80,
  },
  orbGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  header: {
    alignItems: 'center',
    marginBottom: tokens.space['3xl'],
  },
  iconContainer: {
    marginBottom: tokens.space.lg,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.glow,
  },
  appIcon: {
    width: 50,
    height: 50,
  },
  title: {
    fontSize: tokens.type.hero.fontSize,
    fontWeight: tokens.type.hero.fontWeight,
    color: tokens.colors.text.white,
    marginBottom: tokens.space.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.muted,
    letterSpacing: 0.3,
  },
  card: {
    borderRadius: tokens.radius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
    ...tokens.shadow.elevated,
  },
  cardGradient: {
    padding: tokens.space['2xl'],
  },
  form: {
    gap: tokens.space.xl,
  },
  inputGroup: {
    gap: tokens.space.sm,
  },
  label: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: '600',
    color: tokens.colors.text.white,
    letterSpacing: 0.3,
  },
  inputContainer: {
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  inputGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.space.md,
    paddingVertical: tokens.space.sm,
  },
  inputIconContainer: {
    marginRight: tokens.space.sm,
  },
  input: {
    flex: 1,
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.white,
    paddingVertical: tokens.space.sm,
  },
  inputWithIcon: {
    paddingRight: tokens.space['3xl'],
  },
  eyeButton: {
    position: 'absolute',
    right: tokens.space.md,
    padding: tokens.space.sm,
  },
  buttonContainer: {
    marginTop: tokens.space.lg,
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
    ...tokens.shadow.glow,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.space.lg,
    gap: tokens.space.sm,
  },
  buttonText: {
    fontSize: tokens.type.button.fontSize,
    fontWeight: tokens.type.button.fontWeight,
    color: tokens.colors.text.white,
    letterSpacing: tokens.type.button.letterSpacing,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(252, 165, 165, 0.3)',
    padding: tokens.space.md,
    borderRadius: tokens.radius.md,
    marginBottom: tokens.space.xl,
    gap: tokens.space.sm,
  },
  error: {
    flex: 1,
    color: '#FCA5A5',
    fontSize: tokens.type.sub.fontSize,
    lineHeight: 18,
  },
  footerText: {
    fontSize: tokens.type.caption.fontSize,
    color: tokens.colors.text.muted,
    textAlign: 'center',
    marginTop: tokens.space.xl,
    letterSpacing: 0.5,
  },
});
