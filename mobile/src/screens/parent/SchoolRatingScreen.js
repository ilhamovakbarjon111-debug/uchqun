import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { parentService } from '../../services/parentService';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import theme from '../../styles/theme';

export function SchoolRatingScreen() {
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);

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
    try {
      await parentService.rateSchool({ rating: selectedRating });
      loadRating();
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Rate School" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card>
          <View style={styles.iconContainer}>
            <Ionicons name="school" size={48} color={theme.Colors.primary.blue} />
          </View>
          <Text style={styles.title}>Rate Your School</Text>
          <Text style={styles.description}>
            Please rate the school based on overall experience and services.
          </Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => setSelectedRating(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= selectedRating ? 'star' : 'star-outline'}
                  size={40}
                  color={star <= selectedRating ? theme.Colors.status.warning : theme.Colors.border.medium}
                />
              </Pressable>
            ))}
          </View>
          {selectedRating > 0 && (
            <Text style={styles.ratingText}>You selected {selectedRating} star{selectedRating > 1 ? 's' : ''}</Text>
          )}
          <Pressable 
            style={[styles.submitButton, selectedRating === 0 && styles.submitButtonDisabled]} 
            onPress={submitRating}
            disabled={selectedRating === 0}
          >
            <Text style={styles.submitButtonText}>Submit Rating</Text>
          </Pressable>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.Colors.background.secondary,
  },
  content: {
    padding: theme.Spacing.md,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: theme.Spacing.md,
  },
  title: {
    fontSize: theme.Typography.sizes.xl,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.Spacing.sm,
  },
  description: {
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.Spacing.xl,
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.Spacing.lg,
  },
  starButton: {
    marginHorizontal: theme.Spacing.xs,
  },
  ratingText: {
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.Spacing.lg,
    fontWeight: theme.Typography.weights.medium,
  },
  submitButton: {
    backgroundColor: theme.Colors.primary.blue,
    paddingVertical: theme.Spacing.md,
    borderRadius: theme.BorderRadius.sm,
    alignItems: 'center',
    ...theme.Colors.shadow.sm,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: theme.Colors.text.inverse,
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.semibold,
  },
});
