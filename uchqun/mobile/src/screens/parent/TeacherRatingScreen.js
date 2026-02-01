import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { parentService } from '../../services/parentService';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function TeacherRatingScreen() {
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);

  useEffect(() => {
    loadRating();
  }, []);

  const loadRating = async () => {
    try {
      setLoading(true);
      const data = await parentService.getRating();
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
      await parentService.rateTeacher({ rating: selectedRating });
      loadRating();
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.title}>Rate Your Teacher</Text>
        <Text style={styles.description}>
          Please rate your child's teacher based on their performance and communication.
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
                color={star <= selectedRating ? '#fbbf24' : '#d1d5db'}
              />
            </Pressable>
          ))}
        </View>
        <Pressable style={styles.submitButton} onPress={submitRating}>
          <Text style={styles.submitButtonText}>Submit Rating</Text>
        </Pressable>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  starButton: {
    marginHorizontal: 4,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
