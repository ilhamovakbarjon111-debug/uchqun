import React, { useEffect, useState, useMemo, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, Alert, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import tokens from '../../styles/tokens';

// Animated Star Component
function AnimatedStar({ value, currentRating, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isActive = currentRating >= value;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.3,
        useNativeDriver: true,
        tension: 100,
        friction: 3,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 5,
      }),
    ]).start();
    onPress(value);
  };

  return (
    <Pressable onPress={handlePress} hitSlop={8}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons
          name={isActive ? "star" : "star-outline"}
          size={36}
          color={isActive ? "#FBBF24" : "rgba(148, 163, 184, 0.4)"}
        />
      </Animated.View>
    </Pressable>
  );
}

export function TeacherRatingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t, i18n } = useTranslation();
  const { childId = null } = route?.params || {};

  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState(null);
  const [rating, setRating] = useState(null);
  const [summary, setSummary] = useState({ average: 0, count: 0 });
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [childId]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [profileRes, ratingRes] = await Promise.all([
        api.get('/parent/profile').catch(() => ({ data: { data: { user: { assignedTeacher: null } } } })),
        api.get('/parent/ratings').catch((err) => {
          if (err.response?.status === 400 || err.response?.status === 404) {
            return { data: { data: { rating: null, summary: { average: 0, count: 0 } } } };
          }
          throw err;
        }),
      ]);

      const teacherData = profileRes.data?.data?.user?.assignedTeacher || null;
      setTeacher(teacherData);

      const ratingData = ratingRes?.data?.data || { rating: null, summary: { average: 0, count: 0 } };
      setRating(ratingData.rating);
      setStars(ratingData.rating?.stars || 0);
      setComment(ratingData.rating?.comment || '');
      setSummary(ratingData.summary || { average: 0, count: 0 });
    } catch (err) {
      console.error('Error loading rating data:', err);
      setError(t('ratingPage.errorLoad', { defaultValue: 'Failed to load data' }));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setShowSuccess(false);

    if (!teacher) {
      setError(t('ratingPage.noTeacher', { defaultValue: 'No teacher assigned' }));
      return;
    }

    if (!stars) {
      setError(t('ratingPage.errorRequired', { defaultValue: 'Please select a rating' }));
      return;
    }

    setSaving(true);
    try {
      await api.post('/parent/ratings', { stars, comment });
      setRating({
        stars,
        comment,
        updatedAt: new Date().toISOString(),
      });

      // Show success animation
      setShowSuccess(true);
      Animated.sequence([
        Animated.spring(successAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 60,
          friction: 7,
        }),
        Animated.delay(2000),
        Animated.timing(successAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setShowSuccess(false));

      // Refresh summary
      const refreshRes = await api.get('/parent/ratings').catch(() => ({ data: { data: { summary: { average: 0, count: 0 } } } }));
      const ratingData = refreshRes?.data?.data || {};
      setSummary(ratingData.summary || { average: 0, count: 0 });
    } catch (err) {
      console.error('Error saving rating:', err);
      setError(err.response?.data?.error || t('ratingPage.errorSave', { defaultValue: 'Failed to save rating' }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0F172A', '#1E293B', '#334155']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <Ionicons name="star" size={48} color="#FBBF24" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!teacher) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0F172A', '#1E293B', '#334155']}
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient
          colors={['#F59E0B', '#F97316']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={10}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>{t('ratingPage.title', { defaultValue: 'Rate Teacher' })}</Text>
          <View style={styles.backButton} />
        </LinearGradient>
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={64} color="rgba(148, 163, 184, 0.5)" />
          <Text style={styles.emptyTitle}>{t('ratingPage.noTeacher', { defaultValue: 'No Teacher Assigned' })}</Text>
          <Text style={styles.emptyText}>{t('ratingPage.noTeacherDesc', { defaultValue: 'You will be able to rate your teacher once assigned' })}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#334155']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <LinearGradient
        colors={['#F59E0B', '#F97316']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>{t('ratingPage.title', { defaultValue: 'Rate Teacher' })}</Text>
        <View style={styles.backButton} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Teacher Card */}
          <View style={styles.teacherCard}>
            <LinearGradient
              colors={['rgba(51, 65, 85, 0.8)', 'rgba(30, 41, 59, 0.7)']}
              style={styles.teacherCardGradient}
            >
              <View style={styles.teacherInfo}>
                <LinearGradient
                  colors={['#F59E0B', '#F97316']}
                  style={styles.teacherAvatar}
                >
                  <Text style={styles.teacherAvatarText}>
                    {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                  </Text>
                </LinearGradient>
                <View style={styles.teacherDetails}>
                  <Text style={styles.teacherLabel}>{t('ratingPage.yourTeacher', { defaultValue: 'Your Teacher' })}</Text>
                  <Text style={styles.teacherName}>{teacher.firstName} {teacher.lastName}</Text>
                  <View style={styles.teacherMeta}>
                    <Ionicons name="mail-outline" size={12} color={tokens.colors.text.muted} />
                    <Text style={styles.teacherEmail}>{teacher.email}</Text>
                  </View>
                </View>
              </View>

              {/* Average Rating Badge */}
              <View style={styles.averageBadge}>
                <LinearGradient
                  colors={['rgba(251, 191, 36, 0.15)', 'rgba(251, 191, 36, 0.05)']}
                  style={styles.averageBadgeGradient}
                >
                  <Ionicons name="star" size={18} color="#FBBF24" />
                  <Text style={styles.averageValue}>{summary.average?.toFixed(1) || '0.0'}</Text>
                  <Text style={styles.averageCount}>({summary.count || 0})</Text>
                </LinearGradient>
              </View>
            </LinearGradient>
          </View>

          {/* Rating Section */}
          <View style={styles.ratingCard}>
            <LinearGradient
              colors={['rgba(51, 65, 85, 0.6)', 'rgba(30, 41, 59, 0.5)']}
              style={styles.ratingCardGradient}
            >
              <View style={styles.ratingHeader}>
                <Ionicons name="star-outline" size={22} color="#FBBF24" />
                <Text style={styles.ratingTitle}>{t('ratingPage.starsLabel', { defaultValue: 'Rate Your Teacher' })}</Text>
              </View>

              {/* Star Rating */}
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <AnimatedStar
                    key={value}
                    value={value}
                    currentRating={stars}
                    onPress={setStars}
                  />
                ))}
              </View>

              {/* Rating Description */}
              <View style={styles.ratingDescription}>
                <Text style={styles.ratingDescText}>
                  {stars === 0 && t('ratingPage.tapStars', { defaultValue: 'Tap stars to rate' })}
                  {stars === 1 && t('ratingPage.poor', { defaultValue: 'Poor' })}
                  {stars === 2 && t('ratingPage.fair', { defaultValue: 'Fair' })}
                  {stars === 3 && t('ratingPage.good', { defaultValue: 'Good' })}
                  {stars === 4 && t('ratingPage.veryGood', { defaultValue: 'Very Good' })}
                  {stars === 5 && t('ratingPage.excellent', { defaultValue: 'Excellent!' })}
                </Text>
              </View>

              {/* Comment Input */}
              <View style={styles.commentSection}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentLabel}>{t('ratingPage.commentLabel', { defaultValue: 'Comments' })}</Text>
                  <Text style={styles.optionalLabel}>{t('ratingPage.optional', { defaultValue: 'Optional' })}</Text>
                </View>
                <View style={styles.commentInputContainer}>
                  <LinearGradient
                    colors={['rgba(148, 163, 184, 0.08)', 'rgba(100, 116, 139, 0.04)']}
                    style={styles.commentInputGradient}
                  >
                    <TextInput
                      style={styles.commentInput}
                      value={comment}
                      onChangeText={setComment}
                      placeholder={t('ratingPage.commentPlaceholder', { defaultValue: 'Share your thoughts...' })}
                      placeholderTextColor={tokens.colors.text.muted}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </LinearGradient>
                </View>
              </View>

              {/* Error Message */}
              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#FCA5A5" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Submit Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                  saving && { opacity: 0.7 },
                ]}
                onPress={handleSubmit}
                disabled={saving}
              >
                <LinearGradient
                  colors={saving ? ['#64748B', '#475569'] : ['#F59E0B', '#F97316']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitButtonGradient}
                >
                  {saving ? (
                    <>
                      <Ionicons name="hourglass-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>{t('ratingPage.saving', { defaultValue: 'Saving...' })}</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>
                        {rating ? t('ratingPage.update', { defaultValue: 'Update Rating' }) : t('ratingPage.submit', { defaultValue: 'Submit Rating' })}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>

              {/* Last Updated */}
              {rating?.updatedAt && (
                <Text style={styles.lastUpdated}>
                  {t('ratingPage.lastUpdated', {
                    date: new Date(rating.updatedAt).toLocaleDateString(),
                    defaultValue: `Last updated: ${new Date(rating.updatedAt).toLocaleDateString()}`
                  })}
                </Text>
              )}
            </LinearGradient>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Success Animation Overlay */}
      {showSuccess && (
        <Animated.View
          style={[
            styles.successOverlay,
            {
              opacity: successAnim,
              transform: [{
                scale: successAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.95)', 'rgba(5, 150, 105, 0.95)']}
            style={styles.successContent}
          >
            <Ionicons name="checkmark-circle" size={64} color="#FFFFFF" />
            <Text style={styles.successTitle}>{t('ratingPage.success', { defaultValue: 'Rating Submitted!' })}</Text>
            <Text style={styles.successMessage}>{t('ratingPage.successDesc', { defaultValue: 'Thank you for your feedback' })}</Text>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: tokens.space.lg,
    paddingHorizontal: tokens.space.xl,
    ...tokens.shadow.soft,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: tokens.colors.text.white,
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: tokens.space.lg,
    paddingBottom: tokens.space['3xl'],
  },
  teacherCard: {
    borderRadius: tokens.radius.xl,
    marginBottom: tokens.space.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
    ...tokens.shadow.soft,
  },
  teacherCardGradient: {
    padding: tokens.space.xl,
  },
  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.space.lg,
  },
  teacherAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.space.md,
    ...tokens.shadow.sm,
  },
  teacherAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: tokens.colors.text.white,
  },
  teacherDetails: {
    flex: 1,
  },
  teacherLabel: {
    fontSize: tokens.type.caption.fontSize,
    fontWeight: '600',
    color: '#FBBF24',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  teacherName: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.white,
    marginBottom: 4,
  },
  teacherMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.xs,
  },
  teacherEmail: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.muted,
  },
  averageBadge: {
    borderRadius: tokens.radius.pill,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  averageBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.space.md,
    paddingVertical: tokens.space.sm,
    gap: tokens.space.xs,
  },
  averageValue: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: '700',
    color: '#FBBF24',
  },
  averageCount: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.muted,
  },
  ratingCard: {
    borderRadius: tokens.radius.xl,
    marginBottom: tokens.space.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  ratingCardGradient: {
    padding: tokens.space.xl,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.sm,
    marginBottom: tokens.space.xl,
  },
  ratingTitle: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.white,
    letterSpacing: -0.1,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: tokens.space.md,
    marginBottom: tokens.space.lg,
  },
  ratingDescription: {
    alignItems: 'center',
    marginBottom: tokens.space.xl,
  },
  ratingDescText: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: '600',
    color: '#FBBF24',
    letterSpacing: 0.3,
  },
  commentSection: {
    marginBottom: tokens.space.xl,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.space.sm,
  },
  commentLabel: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: '600',
    color: tokens.colors.text.white,
    letterSpacing: 0.2,
  },
  optionalLabel: {
    fontSize: tokens.type.caption.fontSize,
    color: tokens.colors.text.muted,
  },
  commentInputContainer: {
    borderRadius: tokens.radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  commentInputGradient: {
    padding: tokens.space.md,
  },
  commentInput: {
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.white,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(252, 165, 165, 0.3)',
    padding: tokens.space.md,
    borderRadius: tokens.radius.md,
    marginBottom: tokens.space.xl,
  },
  errorText: {
    flex: 1,
    fontSize: tokens.type.sub.fontSize,
    color: '#FCA5A5',
  },
  submitButton: {
    borderRadius: tokens.radius.md,
    overflow: 'hidden',
    ...tokens.shadow.glow,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.space.lg,
    gap: tokens.space.sm,
  },
  submitButtonText: {
    fontSize: tokens.type.button.fontSize,
    fontWeight: tokens.type.button.fontWeight,
    color: tokens.colors.text.white,
    letterSpacing: tokens.type.button.letterSpacing,
  },
  lastUpdated: {
    fontSize: tokens.type.caption.fontSize,
    color: tokens.colors.text.muted,
    textAlign: 'center',
    marginTop: tokens.space.md,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  successContent: {
    borderRadius: tokens.radius['2xl'],
    padding: tokens.space['3xl'],
    alignItems: 'center',
    ...tokens.shadow.elevated,
    minWidth: '80%',
  },
  successTitle: {
    fontSize: tokens.type.h1.fontSize,
    fontWeight: tokens.type.h1.fontWeight,
    color: tokens.colors.text.white,
    marginTop: tokens.space.lg,
    marginBottom: tokens.space.sm,
  },
  successMessage: {
    fontSize: tokens.type.body.fontSize,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.space.md,
  },
  loadingText: {
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.white,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.space['3xl'],
  },
  emptyTitle: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: tokens.colors.text.white,
    marginTop: tokens.space.xl,
    marginBottom: tokens.space.sm,
  },
  emptyText: {
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.muted,
    textAlign: 'center',
  },
});
