import React, { useEffect, useState } from 'react';
import { 
  FlatList, 
  StyleSheet, 
  Text, 
  View, 
  Pressable, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { mealService } from '../../services/mealService';
import { teacherService } from '../../services/teacherService';
import Card from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import TeacherBackground from '../../components/layout/TeacherBackground';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import theme from '../../styles/theme';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
const QUANTITY_OPTIONS = ['Full portion', 'Half portion', 'Small portion'];

export function MealsScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [children, setChildren] = useState([]);
  const [formData, setFormData] = useState({
    childId: '',
    mealName: '',
    description: '',
    mealType: 'Breakfast',
    quantity: 'Full portion',
    specialNotes: '',
    time: '08:30',
    eaten: true,
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadMeals();
    loadChildren();
  }, []);

  useEffect(() => {
    loadMeals();
  }, [selectedDate]);

  const loadChildren = async () => {
    try {
      const parentsList = await teacherService.getParents();
      const allChildren = [];
      parentsList.forEach(parent => {
        if (parent.children && Array.isArray(parent.children)) {
          allChildren.push(...parent.children);
        }
      });
      setChildren(allChildren);
      if (allChildren.length > 0 && !formData.childId) {
        setFormData(prev => ({ ...prev, childId: allChildren[0].id }));
      }
    } catch (error) {
      console.error('Error loading children:', error);
      setChildren([]);
    }
  };

  const loadMeals = async () => {
    try {
      setLoading(true);
      const data = await mealService.getMeals({ date: selectedDate });
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
    setFormData({
      childId: children.length > 0 ? children[0].id : '',
      mealName: '',
      description: '',
      mealType: 'Breakfast',
      quantity: 'Full portion',
      specialNotes: '',
      time: '08:30',
      eaten: true,
      date: selectedDate,
    });
    setShowModal(true);
  };

  const handleEdit = (meal) => {
    setEditingMeal(meal);
    setFormData({
      childId: meal.childId || '',
      mealName: meal.mealName || '',
      description: meal.description || '',
      mealType: meal.mealType || 'Breakfast',
      quantity: meal.quantity || 'Full portion',
      specialNotes: meal.specialNotes || '',
      time: meal.time || '08:30',
      eaten: meal.eaten !== undefined ? meal.eaten : true,
      date: meal.date ? meal.date.split('T')[0] : selectedDate,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!formData.childId) {
        Alert.alert(t('common.error', { defaultValue: 'Error' }), t('mealsPage.form.selectChild', { defaultValue: 'Bolani tanlang' }));
        return;
      }
      if (!formData.mealName || !formData.description || !formData.date) {
        Alert.alert(
          t('common.error', { defaultValue: 'Error' }), 
          t('mealsPage.form.requiredFields', { defaultValue: 'Barcha majburiy maydonlarni to\'ldiring' })
        );
        return;
      }

      if (editingMeal) {
        await mealService.updateMeal(editingMeal.id, formData);
        Alert.alert(t('common.success', { defaultValue: 'Success' }), t('mealsPage.form.toastUpdate', { defaultValue: 'Taom yangilandi' }));
      } else {
        await mealService.createMeal(formData);
        Alert.alert(t('common.success', { defaultValue: 'Success' }), t('mealsPage.form.toastCreate', { defaultValue: 'Taom yaratildi' }));
      }
      setShowModal(false);
      loadMeals();
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }), 
        error.response?.data?.error || t('mealsPage.form.toastError', { defaultValue: 'Xatolik yuz berdi' })
      );
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      t('mealsPage.form.confirmDelete', { defaultValue: 'O\'chirishni tasdiqlash' }),
      t('mealsPage.form.confirmDeleteMessage', { defaultValue: 'Bu taomni o\'chirishni xohlaysizmi?' }),
      [
        { text: t('common.cancel', { defaultValue: 'Bekor qilish' }), style: 'cancel' },
        {
          text: t('common.delete', { defaultValue: 'O\'chirish' }),
          style: 'destructive',
          onPress: async () => {
            try {
              await mealService.deleteMeal(id);
              Alert.alert(t('common.success', { defaultValue: 'Success' }), t('mealsPage.form.toastDelete', { defaultValue: 'Taom o\'chirildi' }));
              loadMeals();
            } catch (error) {
              console.error('Error deleting meal:', error);
              Alert.alert(t('common.error', { defaultValue: 'Error' }), t('mealsPage.form.toastError', { defaultValue: 'Xatolik yuz berdi' }));
            }
          },
        },
      ]
    );
  };

  // Get unique dates from meals
  const dates = [...new Set(meals.map((meal) => meal.date))].sort().reverse();
  const filteredMeals = meals.filter((meal) => meal.date === selectedDate);

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderMeal = ({ item }) => {
    const mealTypeIcons = {
      Breakfast: 'cafe',
      Lunch: 'sunny',
      Snack: 'nutrition',
      Dinner: 'moon',
    };
    const mealTypeColors = {
      Breakfast: '#f59e0b',
      Lunch: '#3b82f6',
      Snack: '#10b981',
      Dinner: '#6366f1',
    };

    return (
      <Card style={styles.card}>
        <View style={styles.mealHeader}>
          <View style={[styles.mealIconContainer, { backgroundColor: mealTypeColors[item.mealType] + '20' }]}>
            <Ionicons name={mealTypeIcons[item.mealType] || 'restaurant'} size={24} color={mealTypeColors[item.mealType]} />
          </View>
          <View style={styles.mealContent}>
            <View style={styles.mealTitleRow}>
              <Text style={styles.mealName}>{item.mealName}</Text>
              <View style={[styles.mealTypeBadge, { backgroundColor: mealTypeColors[item.mealType] + '20' }]}>
                <Text style={[styles.mealTypeText, { color: mealTypeColors[item.mealType] }]}>
                  {item.mealType}
                </Text>
              </View>
            </View>
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={14} color={theme.Colors.text.secondary} />
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.description}>{item.description}</Text>

        <View style={styles.mealDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              {t('mealsPage.quantity', { defaultValue: 'Miqdori' })}:
            </Text>
            <Text style={styles.detailValue}>{item.quantity}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons 
              name={item.eaten ? 'checkmark-circle' : 'close-circle'} 
              size={18} 
              color={item.eaten ? theme.Colors.status.success : theme.Colors.status.error} 
            />
            <Text style={[styles.eatenStatus, { color: item.eaten ? theme.Colors.status.success : theme.Colors.status.error }]}>
              {item.eaten 
                ? t('mealsPage.eaten', { defaultValue: 'Yeyilgan' })
                : t('mealsPage.notEaten', { defaultValue: 'Yeyilmagan' })
              }
            </Text>
          </View>
        </View>

        {item.specialNotes && (
          <View style={styles.notesContainer}>
            <Ionicons name="information-circle-outline" size={16} color={theme.Colors.primary.blue} />
            <Text style={styles.notesText}>
              <Text style={styles.notesLabel}>
                {t('mealsPage.form.specialNotes', { defaultValue: 'Eslatma' })}: 
              </Text>
              {' '}{item.specialNotes}
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <Pressable style={styles.editButton} onPress={() => handleEdit(item)}>
            <Ionicons name="pencil" size={18} color={theme.Colors.primary.blue} />
            <Text style={styles.editButtonText}>{t('common.edit', { defaultValue: 'Edit' })}</Text>
          </Pressable>
          <Pressable style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash-outline" size={18} color={theme.Colors.status.error} />
            <Text style={styles.deleteButtonText}>{t('common.delete', { defaultValue: 'Delete' })}</Text>
          </Pressable>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <TeacherBackground />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.Colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t('mealsPage.title', { defaultValue: 'Taomlar' })}
        </Text>
        <TouchableOpacity onPress={handleCreate} style={styles.headerAction}>
          <Ionicons name="add" size={24} color={theme.Colors.text.inverse} />
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      <View style={styles.datePickerContainer}>
        <Text style={styles.datePickerLabel}>
          {t('mealsPage.selectDay', { defaultValue: 'Kunni tanlang' })}
        </Text>
        <View style={styles.datePickerRow}>
          <Ionicons name="calendar-outline" size={20} color={theme.Colors.primary.blue} />
          <TextInput
            style={styles.dateInput}
            value={selectedDate}
            onChangeText={(text) => setSelectedDate(text)}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.Colors.text.tertiary}
          />
        </View>
      </View>

      {filteredMeals.length === 0 ? (
        <EmptyState icon="restaurant-outline" message={t('mealsPage.empty', { defaultValue: 'No meals found' })} />
      ) : (
        <FlatList
          data={filteredMeals}
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

      {/* Create/Edit Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingMeal 
                    ? t('mealsPage.form.editTitle', { defaultValue: 'Edit Meal' })
                    : t('mealsPage.form.addTitle', { defaultValue: 'Create Meal' })
                  }
                </Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Ionicons name="close" size={24} color={theme.Colors.text.secondary} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.modalScrollView}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
              >
                {/* Child Selection */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t('mealsPage.form.child', { defaultValue: 'Bola' })}
                  </Text>
                  <View style={styles.pickerContainer}>
                    <ScrollView style={styles.pickerScrollView} nestedScrollEnabled>
                      {children.map((child) => (
                        <Pressable
                          key={child.id}
                          style={[
                            styles.pickerOption,
                            formData.childId === child.id && styles.pickerOptionSelected
                          ]}
                          onPress={() => setFormData(prev => ({ ...prev, childId: child.id }))}
                        >
                          <Text style={[
                            styles.pickerOptionText,
                            formData.childId === child.id && styles.pickerOptionTextSelected
                          ]}>
                            {child.firstName} {child.lastName}
                          </Text>
                          {formData.childId === child.id && (
                            <Ionicons name="checkmark" size={20} color={theme.Colors.primary.blue} />
                          )}
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                {/* Meal Type and Date */}
                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.label}>
                      {t('mealsPage.form.mealType', { defaultValue: 'Taom turi' })}
                    </Text>
                    <View style={styles.pickerContainer}>
                      <ScrollView style={styles.pickerScrollView} nestedScrollEnabled>
                        {MEAL_TYPES.map((type) => (
                          <Pressable
                            key={type}
                            style={[
                              styles.pickerOption,
                              formData.mealType === type && styles.pickerOptionSelected
                            ]}
                            onPress={() => setFormData(prev => ({ ...prev, mealType: type }))}
                          >
                            <Text style={[
                              styles.pickerOptionText,
                              formData.mealType === type && styles.pickerOptionTextSelected
                            ]}>
                              {type}
                            </Text>
                            {formData.mealType === type && (
                              <Ionicons name="checkmark" size={20} color={theme.Colors.primary.blue} />
                            )}
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.label}>
                      {t('mealsPage.form.date', { defaultValue: 'Sana' })}
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={theme.Colors.text.tertiary}
                      value={formData.date}
                      onChangeText={(text) => setFormData({ ...formData, date: text })}
                    />
                  </View>
                </View>

                {/* Meal Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t('mealsPage.form.mealName', { defaultValue: 'Taom nomi' })}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t('mealsPage.form.mealNamePlaceholder', { defaultValue: 'Taom nomini kiriting' })}
                    placeholderTextColor={theme.Colors.text.tertiary}
                    value={formData.mealName}
                    onChangeText={(text) => setFormData({ ...formData, mealName: text })}
                  />
                </View>

                {/* Description */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t('mealsPage.form.description', { defaultValue: 'Tavsif' })}
                  </Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder={t('mealsPage.form.descriptionPlaceholder', { defaultValue: 'Taom tavsifini kiriting' })}
                    placeholderTextColor={theme.Colors.text.tertiary}
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Time and Quantity */}
                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.label}>
                      {t('mealsPage.form.time', { defaultValue: 'Vaqt' })}
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="HH:MM"
                      placeholderTextColor={theme.Colors.text.tertiary}
                      value={formData.time}
                      onChangeText={(text) => setFormData({ ...formData, time: text })}
                    />
                  </View>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.label}>
                      {t('mealsPage.form.quantity', { defaultValue: 'Miqdor' })}
                    </Text>
                    <View style={styles.pickerContainer}>
                      <ScrollView style={styles.pickerScrollView} nestedScrollEnabled>
                        {QUANTITY_OPTIONS.map((qty) => (
                          <Pressable
                            key={qty}
                            style={[
                              styles.pickerOption,
                              formData.quantity === qty && styles.pickerOptionSelected
                            ]}
                            onPress={() => setFormData(prev => ({ ...prev, quantity: qty }))}
                          >
                            <Text style={[
                              styles.pickerOptionText,
                              formData.quantity === qty && styles.pickerOptionTextSelected
                            ]}>
                              {qty}
                            </Text>
                            {formData.quantity === qty && (
                              <Ionicons name="checkmark" size={20} color={theme.Colors.primary.blue} />
                            )}
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                </View>

                {/* Special Notes */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t('mealsPage.form.specialNotes', { defaultValue: 'Maxsus eslatmalar' })}
                  </Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder={t('mealsPage.form.specialNotesPlaceholder', { defaultValue: 'Maxsus eslatmalarni kiriting' })}
                    placeholderTextColor={theme.Colors.text.tertiary}
                    value={formData.specialNotes}
                    onChangeText={(text) => setFormData({ ...formData, specialNotes: text })}
                    multiline
                    numberOfLines={2}
                  />
                </View>

                {/* Eaten Toggle */}
                <View style={styles.inputGroup}>
                  <View style={styles.switchRow}>
                    <Text style={styles.label}>
                      {t('mealsPage.form.eatenLabel', { defaultValue: 'Yeyilgan' })}
                    </Text>
                    <Switch
                      value={formData.eaten}
                      onValueChange={(value) => setFormData({ ...formData, eaten: value })}
                      trackColor={{ false: theme.Colors.border.medium, true: theme.Colors.primary.blue }}
                      thumbColor={formData.eaten ? '#fff' : '#f4f3f4'}
                    />
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <Pressable style={styles.cancelButton} onPress={() => setShowModal(false)}>
                  <Text style={styles.cancelButtonText}>
                    {t('mealsPage.form.cancel', { defaultValue: 'Bekor qilish' })}
                  </Text>
                </Pressable>
                <Pressable style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>
                    {editingMeal 
                      ? t('mealsPage.form.update', { defaultValue: 'Yangilash' })
                      : t('mealsPage.form.create', { defaultValue: 'Yaratish' })
                    }
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.Colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.Colors.primary.blue,
    paddingTop: 50,
    paddingBottom: theme.Spacing.md,
    paddingHorizontal: theme.Spacing.md,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    padding: theme.Spacing.xs,
  },
  headerTitle: {
    fontSize: theme.Typography.sizes.xl,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.text.inverse,
  },
  headerAction: {
    padding: theme.Spacing.xs,
  },
  datePickerContainer: {
    padding: theme.Spacing.md,
    backgroundColor: theme.Colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.Colors.border.light,
  },
  datePickerLabel: {
    fontSize: theme.Typography.sizes.xs,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.text.secondary,
    marginBottom: theme.Spacing.xs,
    textTransform: 'uppercase',
  },
  datePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.Spacing.sm,
    backgroundColor: theme.Colors.background.secondary,
    borderRadius: theme.BorderRadius.md,
    padding: theme.Spacing.md,
  },
  dateInput: {
    flex: 1,
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.primary,
    fontWeight: theme.Typography.weights.semibold,
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
  card: {
    marginBottom: theme.Spacing.md,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.Spacing.sm,
  },
  mealIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.Spacing.md,
  },
  mealContent: {
    flex: 1,
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.Spacing.xs,
    marginBottom: theme.Spacing.xs,
  },
  mealName: {
    fontSize: theme.Typography.sizes.lg,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.text.primary,
  },
  mealTypeBadge: {
    paddingHorizontal: theme.Spacing.sm,
    paddingVertical: theme.Spacing.xs / 2,
    borderRadius: theme.BorderRadius.sm,
  },
  mealTypeText: {
    fontSize: theme.Typography.sizes.xs,
    fontWeight: theme.Typography.weights.bold,
    textTransform: 'uppercase',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.Spacing.xs / 2,
    gap: theme.Spacing.xs / 2,
  },
  time: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
  },
  description: {
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.secondary,
    marginTop: theme.Spacing.sm,
    lineHeight: 20,
  },
  mealDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.Spacing.md,
    paddingTop: theme.Spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.Colors.border.light,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.Spacing.xs,
  },
  detailLabel: {
    fontSize: theme.Typography.sizes.xs,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.text.secondary,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: theme.Typography.sizes.sm,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.text.primary,
  },
  eatenStatus: {
    fontSize: theme.Typography.sizes.sm,
    fontWeight: theme.Typography.weights.semibold,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.Spacing.xs,
    marginTop: theme.Spacing.sm,
    padding: theme.Spacing.sm,
    backgroundColor: theme.Colors.background.secondary,
    borderRadius: theme.BorderRadius.md,
  },
  notesText: {
    flex: 1,
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
    lineHeight: 18,
  },
  notesLabel: {
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.text.primary,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.Colors.background.card,
    borderTopLeftRadius: theme.BorderRadius.xl,
    borderTopRightRadius: theme.BorderRadius.xl,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 40 : theme.Spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.Colors.border.light,
  },
  modalTitle: {
    fontSize: theme.Typography.sizes.xl,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.text.primary,
  },
  modalScrollView: {
    maxHeight: 500,
    paddingHorizontal: theme.Spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.Spacing.md,
  },
  label: {
    fontSize: theme.Typography.sizes.sm,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.text.primary,
    marginBottom: theme.Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.Colors.border.medium,
    borderRadius: theme.BorderRadius.sm,
    padding: theme.Spacing.md,
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.primary,
    backgroundColor: theme.Colors.background.card,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: theme.Spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.Colors.border.medium,
    borderRadius: theme.BorderRadius.sm,
    maxHeight: 150,
    backgroundColor: theme.Colors.background.card,
  },
  pickerScrollView: {
    maxHeight: 150,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.Colors.border.light,
  },
  pickerOptionSelected: {
    backgroundColor: theme.Colors.primary.blueBg,
  },
  pickerOptionText: {
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.primary,
  },
  pickerOptionTextSelected: {
    color: theme.Colors.primary.blue,
    fontWeight: theme.Typography.weights.semibold,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.Colors.border.light,
    gap: theme.Spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: theme.Spacing.md,
    alignItems: 'center',
    borderRadius: theme.BorderRadius.sm,
    backgroundColor: theme.Colors.background.secondary,
  },
  cancelButtonText: {
    color: theme.Colors.text.secondary,
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.medium,
  },
  saveButton: {
    flex: 1,
    paddingVertical: theme.Spacing.md,
    alignItems: 'center',
    borderRadius: theme.BorderRadius.sm,
    backgroundColor: theme.Colors.cards.meals,
  },
  saveButtonText: {
    color: theme.Colors.text.inverse,
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.semibold,
  },
});
