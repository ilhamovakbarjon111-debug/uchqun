import React, { useEffect, useState, useCallback } from 'react';
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
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { mealService } from '../../services/mealService';
import { teacherService } from '../../services/teacherService';
import Card from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import theme from '../../styles/theme';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
const QUANTITIES = ['Full portion', 'Half portion', 'Small portion'];

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toTimeString().slice(0, 5);
};

export function MealsScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);

  // Parents and children state
  const [parents, setParents] = useState([]);
  const [children, setChildren] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    childId: '',
    mealName: '',
    description: '',
    mealType: 'Breakfast',
    quantity: 'Full portion',
    specialNotes: '',
    time: new Date(),
    eaten: true,
    date: new Date(),
  });

  // Date/Time picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Date filter
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showFilterDatePicker, setShowFilterDatePicker] = useState(false);

  useEffect(() => {
    loadMeals();
    loadParents();
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

  const loadParents = async () => {
    try {
      const data = await teacherService.getParents();
      setParents(Array.isArray(data) ? data : []);

      // Extract all children from parents
      const allChildren = [];
      (Array.isArray(data) ? data : []).forEach((parent) => {
        if (parent.children && Array.isArray(parent.children)) {
          allChildren.push(...parent.children);
        }
      });
      setChildren(allChildren);
    } catch (error) {
      console.error('Error loading parents:', error);
      setParents([]);
      setChildren([]);
    }
  };

  const handleCreate = () => {
    setEditingMeal(null);
    const now = new Date();
    setFormData({
      childId: children.length > 0 ? children[0].id : '',
      mealName: '',
      description: '',
      mealType: 'Breakfast',
      quantity: 'Full portion',
      specialNotes: '',
      time: now,
      eaten: true,
      date: selectedDate,
    });
    setShowModal(true);
  };

  const handleEdit = (meal) => {
    setEditingMeal(meal);

    // Parse time string to Date
    let timeDate = new Date();
    if (meal.time) {
      const [hours, minutes] = meal.time.split(':');
      timeDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    }

    setFormData({
      childId: meal.childId || '',
      mealName: meal.mealName || '',
      description: meal.description || '',
      mealType: meal.mealType || 'Breakfast',
      quantity: meal.quantity || 'Full portion',
      specialNotes: meal.specialNotes || '',
      time: timeDate,
      eaten: meal.eaten !== undefined ? meal.eaten : true,
      date: meal.date ? new Date(meal.date) : new Date(),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.childId) {
        Alert.alert(t('common.error'), t('mealsPage.form.selectChild') || 'Bolani tanlang');
        return;
      }
      if (!formData.mealName) {
        Alert.alert(t('common.error'), t('mealsPage.form.mealNameRequired') || 'Ovqat nomini kiriting');
        return;
      }

      const payload = {
        ...formData,
        date: formatDate(formData.date),
        time: formatTime(formData.time),
      };

      if (editingMeal) {
        await mealService.updateMeal(editingMeal.id, payload);
      } else {
        await mealService.createMeal(payload);
      }
      setShowModal(false);
      loadMeals();
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert(t('common.error'), error.message || 'Failed to save meal');
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      t('common.confirm'),
      t('mealsPage.form.confirmDelete') || "O'chirmoqchimisiz?",
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await mealService.deleteMeal(id);
              loadMeals();
            } catch (error) {
              console.error('Error deleting meal:', error);
            }
          },
        },
      ]
    );
  };

  const getMealTypeIcon = (mealType) => {
    switch (mealType) {
      case 'Breakfast':
        return 'cafe-outline';
      case 'Lunch':
        return 'sunny-outline';
      case 'Snack':
        return 'nutrition-outline';
      case 'Dinner':
        return 'moon-outline';
      default:
        return 'restaurant-outline';
    }
  };

  const getMealTypeLabel = (mealType) => {
    return t(`mealsPage.types.${mealType}`) || mealType;
  };

  // Filter meals by selected date
  const filteredMeals = meals.filter((meal) => meal.date === formatDate(selectedDate));

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderMeal = ({ item }) => (
    <Card>
      <View style={styles.mealHeader}>
        <View style={[styles.mealIconContainer, !item.eaten && styles.mealNotEaten]}>
          <Ionicons
            name={getMealTypeIcon(item.mealType)}
            size={24}
            color={item.eaten ? theme.Colors.cards.meals : theme.Colors.text.secondary}
          />
        </View>
        <View style={styles.mealContent}>
          <View style={styles.mealTitleRow}>
            <Text style={styles.mealName}>{item.mealName}</Text>
            <View style={styles.mealTypeChip}>
              <Text style={styles.mealTypeText}>{getMealTypeLabel(item.mealType)}</Text>
            </View>
          </View>
          <View style={styles.mealMeta}>
            {item.time && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={theme.Colors.text.secondary} />
                <Text style={styles.metaText}>{item.time}</Text>
              </View>
            )}
            {item.quantity && (
              <View style={styles.metaItem}>
                <Ionicons name="resize-outline" size={14} color={theme.Colors.text.secondary} />
                <Text style={styles.metaText}>{item.quantity}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {item.description && <Text style={styles.description}>{item.description}</Text>}

      <View style={styles.eatenStatus}>
        <Ionicons
          name={item.eaten ? 'checkmark-circle' : 'close-circle'}
          size={18}
          color={item.eaten ? theme.Colors.status.success : theme.Colors.status.error}
        />
        <Text
          style={[styles.eatenText, { color: item.eaten ? theme.Colors.status.success : theme.Colors.status.error }]}
        >
          {item.eaten ? t('mealsPage.eaten') || 'Yedi' : t('mealsPage.notEaten') || 'Yemadi'}
        </Text>
      </View>

      {item.specialNotes && (
        <View style={styles.notesContainer}>
          <Ionicons name="information-circle-outline" size={16} color={theme.Colors.primary.blue} />
          <Text style={styles.notesText}>{item.specialNotes}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <Pressable style={styles.editButton} onPress={() => handleEdit(item)}>
          <Ionicons name="pencil" size={18} color={theme.Colors.primary.blue} />
          <Text style={styles.editButtonText}>{t('common.edit')}</Text>
        </Pressable>
        <Pressable style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={18} color={theme.Colors.status.error} />
          <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
        </Pressable>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('tabs.meals') || 'Meals'} rightAction={handleCreate} rightIcon="add" />

      {/* Date Filter */}
      <View style={styles.dateFilterContainer}>
        <TouchableOpacity style={styles.dateFilterButton} onPress={() => setShowFilterDatePicker(true)}>
          <Ionicons name="calendar" size={20} color={theme.Colors.primary.blue} />
          <Text style={styles.dateFilterText}>{selectedDate.toLocaleDateString()}</Text>
          <Ionicons name="chevron-down" size={16} color={theme.Colors.text.secondary} />
        </TouchableOpacity>
        <Text style={styles.mealsCount}>
          {filteredMeals.length} {t('mealsPage.totalMeals') || 'ovqat'}
        </Text>
      </View>

      {showFilterDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          onChange={(event, date) => {
            setShowFilterDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      {filteredMeals.length === 0 ? (
        <EmptyState icon="restaurant-outline" message={t('mealsPage.empty') || 'No meals found'} />
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
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingMeal
                  ? t('mealsPage.form.editTitle') || 'Edit Meal'
                  : t('mealsPage.form.addTitle') || 'Add Meal'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={theme.Colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formScrollView} showsVerticalScrollIndicator={false}>
              {/* Child Picker */}
              <Text style={styles.label}>{t('mealsPage.form.child') || 'Bola'}</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.childId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, childId: value }))}
                  style={styles.picker}
                >
                  <Picker.Item label={t('mealsPage.form.selectChild') || 'Bolani tanlang'} value="" />
                  {children.map((child) => (
                    <Picker.Item
                      key={child.id}
                      label={`${child.firstName} ${child.lastName}`}
                      value={child.id}
                    />
                  ))}
                </Picker>
              </View>

              {/* Meal Type and Date Row */}
              <View style={styles.rowFields}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>{t('mealsPage.form.mealType') || 'Ovqat turi'}</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.mealType}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, mealType: value }))}
                      style={styles.picker}
                    >
                      {MEAL_TYPES.map((type) => (
                        <Picker.Item key={type} label={getMealTypeLabel(type)} value={type} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={styles.halfField}>
                  <Text style={styles.label}>{t('mealsPage.form.date') || 'Sana'}</Text>
                  <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                    <Ionicons name="calendar-outline" size={18} color={theme.Colors.primary.blue} />
                    <Text style={styles.dateButtonText}>{formData.date.toLocaleDateString()}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={formData.date}
                  mode="date"
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) setFormData((prev) => ({ ...prev, date }));
                  }}
                />
              )}

              {/* Meal Name */}
              <Text style={styles.label}>{t('mealsPage.form.mealName') || 'Ovqat nomi'}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('mealsPage.form.mealNamePlaceholder') || 'Masalan: Osh, Sho\'rva'}
                placeholderTextColor={theme.Colors.text.tertiary}
                value={formData.mealName}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, mealName: text }))}
              />

              {/* Description */}
              <Text style={styles.label}>{t('mealsPage.form.description') || 'Tavsif'}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t('mealsPage.form.descriptionPlaceholder') || 'Ovqat haqida qo\'shimcha ma\'lumot'}
                placeholderTextColor={theme.Colors.text.tertiary}
                value={formData.description}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
                multiline
              />

              {/* Time and Quantity Row */}
              <View style={styles.rowFields}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>{t('mealsPage.form.time') || 'Vaqt'}</Text>
                  <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
                    <Ionicons name="time-outline" size={18} color={theme.Colors.primary.blue} />
                    <Text style={styles.dateButtonText}>{formatTime(formData.time)}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.halfField}>
                  <Text style={styles.label}>{t('mealsPage.form.quantity') || 'Miqdor'}</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.quantity}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, quantity: value }))}
                      style={styles.picker}
                    >
                      {QUANTITIES.map((q) => (
                        <Picker.Item key={q} label={q} value={q} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>

              {showTimePicker && (
                <DateTimePicker
                  value={formData.time}
                  mode="time"
                  onChange={(event, date) => {
                    setShowTimePicker(false);
                    if (date) setFormData((prev) => ({ ...prev, time: date }));
                  }}
                />
              )}

              {/* Special Notes */}
              <Text style={styles.label}>{t('mealsPage.form.specialNotes') || 'Eslatma'}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t('mealsPage.form.specialNotesPlaceholder') || 'Allergiya, dietaga oid eslatmalar'}
                placeholderTextColor={theme.Colors.text.tertiary}
                value={formData.specialNotes}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, specialNotes: text }))}
                multiline
              />

              {/* Eaten Toggle */}
              <View style={styles.eatenToggle}>
                <Text style={styles.eatenLabel}>{t('mealsPage.form.eatenLabel') || 'Ovqatni yedi'}</Text>
                <Switch
                  value={formData.eaten}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, eaten: value }))}
                  trackColor={{ false: theme.Colors.border.medium, true: theme.Colors.status.success + '80' }}
                  thumbColor={formData.eaten ? theme.Colors.status.success : theme.Colors.text.tertiary}
                />
              </View>

              <View style={styles.formSpacer} />
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleSave}>
                <Ionicons name="save-outline" size={18} color={theme.Colors.text.inverse} />
                <Text style={styles.saveButtonText}>{t('common.save')}</Text>
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
  dateFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.Spacing.md,
    paddingVertical: theme.Spacing.sm,
    backgroundColor: theme.Colors.background.card,
    marginHorizontal: theme.Spacing.md,
    marginTop: theme.Spacing.sm,
    borderRadius: theme.BorderRadius.md,
  },
  dateFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.Spacing.xs,
  },
  dateFilterText: {
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.text.primary,
  },
  mealsCount: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.Colors.cards.meals + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.Spacing.md,
  },
  mealNotEaten: {
    backgroundColor: theme.Colors.background.secondary,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.Colors.border.medium,
  },
  mealContent: {
    flex: 1,
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.Spacing.sm,
  },
  mealName: {
    fontSize: theme.Typography.sizes.lg,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.text.primary,
  },
  mealTypeChip: {
    backgroundColor: theme.Colors.cards.meals + '15',
    paddingHorizontal: theme.Spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  mealTypeText: {
    fontSize: theme.Typography.sizes.xs,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.cards.meals,
    textTransform: 'uppercase',
  },
  mealMeta: {
    flexDirection: 'row',
    marginTop: theme.Spacing.xs,
    gap: theme.Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
  },
  description: {
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.secondary,
    marginTop: theme.Spacing.sm,
    lineHeight: 20,
  },
  eatenStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.Spacing.sm,
    gap: theme.Spacing.xs,
  },
  eatenText: {
    fontSize: theme.Typography.sizes.sm,
    fontWeight: theme.Typography.weights.semibold,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: theme.Spacing.sm,
    padding: theme.Spacing.sm,
    backgroundColor: theme.Colors.background.secondary,
    borderRadius: theme.BorderRadius.sm,
    gap: theme.Spacing.sm,
  },
  notesText: {
    flex: 1,
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
    lineHeight: 18,
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
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.Colors.background.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    ...theme.Colors.shadow.lg,
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
  formScrollView: {
    paddingHorizontal: theme.Spacing.lg,
    maxHeight: '70%',
  },
  label: {
    fontSize: theme.Typography.sizes.sm,
    fontWeight: theme.Typography.weights.medium,
    color: theme.Colors.text.secondary,
    marginTop: theme.Spacing.md,
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.Colors.border.medium,
    borderRadius: theme.BorderRadius.sm,
    backgroundColor: theme.Colors.background.card,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: theme.Colors.text.primary,
  },
  rowFields: {
    flexDirection: 'row',
    gap: theme.Spacing.md,
  },
  halfField: {
    flex: 1,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.Colors.border.medium,
    borderRadius: theme.BorderRadius.sm,
    padding: theme.Spacing.md,
    backgroundColor: theme.Colors.background.card,
    gap: theme.Spacing.sm,
  },
  dateButtonText: {
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.primary,
  },
  eatenToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.Spacing.lg,
    padding: theme.Spacing.md,
    backgroundColor: theme.Colors.background.secondary,
    borderRadius: theme.BorderRadius.md,
  },
  eatenLabel: {
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.medium,
    color: theme.Colors.text.primary,
  },
  formSpacer: {
    height: 100,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: theme.Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.Colors.border.light,
    gap: theme.Spacing.md,
  },
  cancelButton: {
    paddingHorizontal: theme.Spacing.lg,
    paddingVertical: theme.Spacing.sm,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.Spacing.xs,
  },
  saveButtonText: {
    color: theme.Colors.text.inverse,
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.semibold,
  },
});
