import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { parentService } from '../../services/parentService';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export function MealsScreen() {
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    try {
      setLoading(true);
      const data = await parentService.getMeals();
      setMeals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading meals:', error);
      setMeals([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (meals.length === 0) {
    return <EmptyState message="No meals found" />;
  }

  const renderMeal = ({ item }) => (
    <Card>
      <Text style={styles.mealType}>{item.mealType || 'Meal'}</Text>
      {item.date && <Text style={styles.date}>{item.date}</Text>}
      {item.time && <Text style={styles.time}>{item.time}</Text>}
      {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={meals}
        renderItem={renderMeal}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadMeals}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  list: {
    padding: 16,
  },
  mealType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  notes: {
    fontSize: 14,
    color: '#374151',
  },
});
