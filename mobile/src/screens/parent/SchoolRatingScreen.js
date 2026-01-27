import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { parentService } from '../../services/parentService';
import tokens from '../../styles/tokens';
import Screen from '../../components/layout/Screen';
import Card from '../../components/common/Card';
import Skeleton from '../../components/common/Skeleton';

export function SchoolRatingScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRating();
  }, []);

  const loadRating = async () => {
    try {
      setLoading(true);
      const data = await parentService.getSchoolRating();
      setRating(data);
      if (data?.rating) {
        setSelectedRating(data.rating);
      }
      if (data?.comment) {
        setComment(data.comment);
      }
    } catch (error) {
      console.error('Error loading rating:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async () => {
    if (selectedRating === 0) {
      Alert.alert(t('common.error'), t('schoolRatingPage.errorRequired'));
      return;
    }
    
    try {
      setSubmitting(true);
      await parentService.rateSchool({ rating: selectedRating, comment });
      Alert.alert(t('common.success'), t('schoolRatingPage.success'));
      await loadRating();
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert(t('common.error'), t('schoolRatingPage.errorSave'));
    } finally {
      setSubmitting(false);
    }
  };

  const header = (
    <View style={styles.topBar}>
      <Pressable
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="arrow-back" size={24} color={tokens.colors.text.primary} />
      </Pressable>
      <Text style={styles.topBarTitle} allowFontScaling={true}>{t('schoolRatingPage.title')}</Text>
      <View style={styles.placeholder} />
    </View>
  );

  return (
    <Screen scroll={true} padded={true} header={header}>
        {loading ? (
          <Card style={styles.card}>
            <Skeleton width={80} height={80} variant="circle" style={{ alignSelf: 'center', marginBottom: tokens.space.lg }} />
            <Skeleton width="60%" height={24} variant="text" style={{ alignSelf: 'center', marginBottom: tokens.space.md }} />
            <Skeleton width="80%" height={60} variant="text" style={{ alignSelf: 'center' }} />
          </Card>
        ) : (
          <>
            {/* School Info Card */}
            {rating?.school && (
              <Card style={styles.infoCard} variant="elevated" shadow="soft">
                <View style={styles.schoolInfo}>
                  <LinearGradient
                    colors={[tokens.colors.accent.blue + '30', tokens.colors.accent.blue + '15']}
                    style={styles.schoolIcon}
                  >
                    <Ionicons name="school" size={28} color={tokens.colors.accent.blue} />
                  </LinearGradient>
                  <View style={styles.schoolDetails}>
                    <Text style={styles.schoolName} allowFontScaling={true}>
                      {rating.school.name}
                    </Text>
                    <Text style={styles.schoolLabel} allowFontScaling={true}>
                      {t('schoolRatingPage.yourSchool')}
                    </Text>
                  </View>
                  {rating?.averageRating > 0 && (
                    <View style={styles.averageContainer}>
                      <View style={styles.averageBadge}>
                        <Ionicons name="star" size={16} color={tokens.colors.semantic.warning} />
                        <Text style={styles.averageText}>{rating.averageRating.toFixed(1)}</Text>
                      </View>
                      <Text style={styles.ratingsCount}>
                        {t('schoolRatingPage.ratingsCount', { count: rating.ratingsCount || 0 })}
                      </Text>
                    </View>
                  )}
                </View>
              </Card>
            )}

            {/* Rating Card */}
            <Card style={styles.card} variant="elevated" shadow="soft">
              <LinearGradient
                colors={[tokens.colors.accent.blue + '20', tokens.colors.accent.blue + '10']}
                style={styles.iconContainer}
              >
                <Ionicons name="school" size={48} color={tokens.colors.accent.blue} />
              </LinearGradient>
              <Text style={styles.title} allowFontScaling={true}>{t('schoolRatingPage.starsLabel')}</Text>
              <Text style={styles.description} allowFontScaling={true}>
                {t('schoolRatingPage.subtitle')}
              </Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable
                    key={star}
                    onPress={() => setSelectedRating(star)}
                    style={styles.starButton}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={star <= selectedRating ? 'star' : 'star-outline'}
                      size={44}
                      color={star <= selectedRating ? tokens.colors.semantic.warning : tokens.colors.border.medium}
                    />
                  </Pressable>
                ))}
              </View>

              {/* Comment Input */}
              <View style={styles.commentContainer}>
                <Text style={styles.commentLabel} allowFontScaling={true}>
                  {t('schoolRatingPage.commentLabel')}
                </Text>
                <TextInput
                  style={styles.commentInput}
                  value={comment}
                  onChangeText={setComment}
                  placeholder={t('schoolRatingPage.commentPlaceholder')}
                  placeholderTextColor={tokens.colors.text.muted}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <Pressable 
                style={[
                  styles.submitButton, 
                  selectedRating === 0 && styles.submitButtonDisabled,
                  submitting && styles.submitButtonDisabled,
                ]} 
                onPress={submitRating}
                disabled={selectedRating === 0 || submitting}
              >
                <Text 
                  style={[
                    styles.submitButtonText,
                    (selectedRating === 0 || submitting) && styles.submitButtonTextDisabled,
                  ]}
                  allowFontScaling={true}
                >
                  {submitting ? t('common.loading') : t('schoolRatingPage.submit')}
                </Text>
              </Pressable>
            </Card>

            {/* Previous Rating */}
            {rating?.yourRating && (
              <Card style={styles.previousCard} variant="elevated" shadow="soft">
                <Text style={styles.previousTitle} allowFontScaling={true}>
                  {t('schoolRatingPage.yourRating')}
                </Text>
                <View style={styles.previousRating}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= rating.yourRating ? 'star' : 'star-outline'}
                      size={20}
                      color={star <= rating.yourRating ? tokens.colors.semantic.warning : tokens.colors.border.medium}
                    />
                  ))}
                </View>
                {rating.yourComment && (
                  <Text style={styles.previousComment} allowFontScaling={true}>
                    "{rating.yourComment}"
                  </Text>
                )}
                {rating.lastUpdated && (
                  <Text style={styles.lastUpdated} allowFontScaling={true}>
                    {t('schoolRatingPage.lastUpdated', { date: new Date(rating.lastUpdated).toLocaleDateString() })}
                  </Text>
                )}
              </Card>
            )}
          </>
        )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    overflow: 'hidden',
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.space.lg,
    paddingVertical: tokens.space.md,
    paddingTop: tokens.space.xl,
    paddingBottom: tokens.space.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.sm,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: tokens.space.md,
    gap: tokens.space.md,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: '#fff',
  },
  placeholder: {
    width: 44,
  },
  // School Info Card
  infoCard: {
    marginBottom: tokens.space.lg,
  },
  schoolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  schoolIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.space.md,
    ...tokens.shadow.sm,
  },
  schoolDetails: {
    flex: 1,
  },
  schoolName: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: 2,
  },
  schoolLabel: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
  },
  averageContainer: {
    alignItems: 'flex-end',
  },
  averageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${tokens.colors.semantic.warning}15`,
    paddingHorizontal: tokens.space.sm,
    paddingVertical: 4,
    borderRadius: tokens.radius.md,
    gap: 4,
  },
  averageText: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.semantic.warning,
  },
  ratingsCount: {
    fontSize: tokens.type.caption.fontSize,
    color: tokens.colors.text.muted,
    marginTop: 4,
  },
  // Rating Card
  card: {
    alignItems: 'center',
    marginBottom: tokens.space.lg,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.space.lg,
    alignSelf: 'center',
    ...tokens.shadow.soft,
  },
  title: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.body.fontWeight,
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: tokens.space.xl,
    paddingHorizontal: tokens.space.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: tokens.space.sm,
    marginBottom: tokens.space.lg,
  },
  starButton: {
    padding: tokens.space.xs,
  },
  // Comment Input
  commentContainer: {
    width: '100%',
    marginBottom: tokens.space.lg,
  },
  commentLabel: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.space.sm,
  },
  commentInput: {
    width: '100%',
    minHeight: 100,
    backgroundColor: tokens.colors.surface.secondary,
    borderRadius: tokens.radius.md,
    padding: tokens.space.md,
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.primary,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
  },
  submitButton: {
    width: '100%',
    paddingVertical: tokens.space.lg,
    borderRadius: tokens.radius.xl,
    backgroundColor: tokens.colors.accent.blue,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.soft,
  },
  submitButtonDisabled: {
    backgroundColor: tokens.colors.border.medium,
  },
  submitButtonText: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.white,
  },
  submitButtonTextDisabled: {
    color: tokens.colors.text.muted,
  },
  // Previous Rating Card
  previousCard: {
    alignItems: 'center',
  },
  previousTitle: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.sm,
  },
  previousRating: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: tokens.space.sm,
  },
  previousComment: {
    fontSize: tokens.type.body.fontSize,
    fontStyle: 'italic',
    color: tokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: tokens.space.sm,
  },
  lastUpdated: {
    fontSize: tokens.type.caption.fontSize,
    color: tokens.colors.text.muted,
  },
});
