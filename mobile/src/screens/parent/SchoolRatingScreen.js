import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { parentService } from '../../services/parentService';
import tokens from '../../styles/tokens';
import Screen from '../../components/layout/Screen';
import Card from '../../components/common/Card';
import Skeleton from '../../components/common/Skeleton';

export function SchoolRatingScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
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
    } catch (error) {
      console.error('Error loading rating:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async () => {
    if (selectedRating === 0) return;
    
    try {
      setSubmitting(true);
      await parentService.rateSchool({ rating: selectedRating });
      await loadRating();
    } catch (error) {
      console.error('Error submitting rating:', error);
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
      <Text style={styles.topBarTitle} allowFontScaling={true}>Rate School</Text>
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
          <Card style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons name="school" size={48} color={tokens.colors.accent.blue} />
            </View>
            <Text style={styles.title} allowFontScaling={true}>Rate Your School</Text>
            <Text style={styles.description} allowFontScaling={true}>
              Please rate the school based on overall experience and services.
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
                    size={48}
                    color={star <= selectedRating ? tokens.colors.semantic.warning : tokens.colors.card.border}
                  />
                </Pressable>
              ))}
            </View>
            {selectedRating > 0 && (
              <Text style={styles.ratingText} allowFontScaling={true}>
                You selected {selectedRating} star{selectedRating > 1 ? 's' : ''}
              </Text>
            )}
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
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </Text>
            </Pressable>
          </Card>
        )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.space.xl,
    paddingTop: tokens.space.md,
    paddingBottom: tokens.space.md,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: tokens.space.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: tokens.colors.text.primary,
  },
  placeholder: {
    width: 44,
  },
  card: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: tokens.radius.pill,
    backgroundColor: `${tokens.colors.accent.blue}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: tokens.space.lg,
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
    gap: tokens.space.md,
    marginBottom: tokens.space.lg,
  },
  starButton: {
    padding: tokens.space.sm,
  },
  ratingText: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.body.fontWeight,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.space.xl,
  },
  submitButton: {
    width: '100%',
    paddingVertical: tokens.space.md,
    borderRadius: tokens.radius.xl,
    backgroundColor: tokens.colors.accent.blue,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.soft,
  },
  submitButtonDisabled: {
    backgroundColor: tokens.colors.card.border,
  },
  submitButtonText: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.white,
  },
  submitButtonTextDisabled: {
    color: tokens.colors.text.muted,
  },
});
