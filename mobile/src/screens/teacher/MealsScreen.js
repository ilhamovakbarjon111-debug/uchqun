import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, Pressable, Modal, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { mealService } from '../../services/mealService';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import TeacherBackground from '../../components/layout/TeacherBackground';
import theme from '../../styles/theme';

export function MealsScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [formData, setFormData] = useState({
    mealType: '',
    notes: '',
    childId: '',
  });

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    try {
      setLoading(true);
      const data = await mealService.getMeals();
      setMeals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading meals:', error);
      setMeals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingMeal(null);
    setFormData({ mealType: '', notes: '', childId: '' });
    setShowModal(true);
  };

  const handleEdit = (meal) => {
    setEditingMeal(meal);
    setFormData({
      mealType: meal.mealType || '',
      notes: meal.notes || '',
      childId: meal.childId || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingMeal) {
        await mealService.updateMeal(editingMeal.id, formData);
      } else {
        await mealService.createMeal(formData);
      }
      setShowModal(false);
      loadMeals();
    } catch (error) {
      console.error('Error saving meal:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await mealService.deleteMeal(id);
      loadMeals();
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderMeal = ({ item }) => (
    <Card>
      <View style={styles.mealHeader}>
        <View style={styles.mealIconContainer}>
          <Ionicons name="restaurant" size={24} color={theme.Colors.cards.meals} />
        </View>
        <View style={styles.mealContent}>
          <Text style={styles.mealType}>{item.mealType || 'Meal'}</Text>
          {item.date && (
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={14} color={theme.Colors.text.secondary} />
              <Text style={styles.date}>{item.date}</Text>
            </View>
          )}
        </View>
      </View>
      {item.notes && <Text style={styles.notes}>{item.notes}</Text>}
      <View style={styles.actions}>
        <Pressable style={styles.editButton} onPress={() => handleEdit(item)}>
          <Ionicons name="pencil" size={18} color={theme.Colors.primary.blue} />
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>
        <Pressable style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={18} color={theme.Colors.status.error} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </Pressable>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <TeacherBackground />
      <ScreenHeader title="Meals" rightAction={handleCreate} rightIcon="add" />
      {meals.length === 0 ? (
        <EmptyState icon="restaurant-outline" message="No meals found" />
      ) : (
        <FlatList
          data={meals}
          renderItem={renderMeal}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadMeals}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleCreate}>
        <Ionicons name="add" size={28} color={theme.Colors.text.inverse} />
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingMeal ? 'Edit Meal' : 'Create Meal'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={theme.Colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Meal Type (breakfast, lunch, snack, dinner)"
              placeholderTextColor={theme.Colors.text.tertiary}
              value={formData.mealType}
              onChangeText={(text) => setFormData({ ...formData, mealType: text })}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notes"
              placeholderTextColor={theme.Colors.text.tertiary}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              multiline
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.Colors.background.secondary,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: theme.Spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.Colors.cards.meals,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.Colors.shadow.lg,
  },
  list: {
    padding: theme.Spacing.md,
    paddingBottom: 100,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.Spacing.sm,
  },
  mealIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.Colors.cards.meals + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.Spacing.md,
  },
  mealContent: {
    flex: 1,
  },
  mealType: {
    fontSize: theme.Typography.sizes.lg,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.text.primary,
    marginBottom: theme.Spacing.xs,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.Spacing.xs / 2,
  },
  date: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
    marginLeft: theme.Spacing.xs / 2,
  },
  notes: {
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.secondary,
    marginTop: theme.Spacing.sm,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    marginTop: theme.Spacing.md,
    paddingTop: theme.Spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.Colors.border.light,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.Spacing.md,
    paddingVertical: theme.Spacing.xs,
    paddingHorizontal: theme.Spacing.sm,
  },
  editButtonText: {
    color: theme.Colors.primary.blue,
    marginLeft: theme.Spacing.xs,
    fontSize: theme.Typography.sizes.sm,
    fontWeight: theme.Typography.weights.medium,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.Spacing.xs,
    paddingHorizontal: theme.Spacing.sm,
  },
  deleteButtonText: {
    color: theme.Colors.status.error,
    marginLeft: theme.Spacing.xs,
    fontSize: theme.Typography.sizes.sm,
    fontWeight: theme.Typography.weights.medium,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.Colors.background.card,
    borderRadius: theme.BorderRadius.lg,
    padding: theme.Spacing.lg,
    width: '90%',
    maxWidth: 400,
    ...theme.Colors.shadow.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.Spacing.md,
  },
  modalTitle: {
    fontSize: theme.Typography.sizes.xl,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.Colors.border.medium,
    borderRadius: theme.BorderRadius.sm,
    padding: theme.Spacing.md,
    marginBottom: theme.Spacing.md,
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.primary,
    backgroundColor: theme.Colors.background.card,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.Spacing.md,
  },
  cancelButton: {
    paddingHorizontal: theme.Spacing.lg,
    paddingVertical: theme.Spacing.sm,
    marginRight: theme.Spacing.md,
  },
  cancelButtonText: {
    color: theme.Colors.text.secondary,
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.medium,
  },
  saveButton: {
    backgroundColor: theme.Colors.cards.meals,
    paddingHorizontal: theme.Spacing.lg,
    paddingVertical: theme.Spacing.sm,
    borderRadius: theme.BorderRadius.sm,
  },
  saveButtonText: {
    color: theme.Colors.text.inverse,
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.semibold,
  },
});
