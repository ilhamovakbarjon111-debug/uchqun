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
import { activityService } from '../../services/activityService';
import { teacherService } from '../../services/teacherService';
import Card from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import theme from '../../styles/theme';

// Services list (same as web)
const SERVICES_LIST = [
  'Logoped',
  'Defektolog',
  'SurdoPedagok',
  'AbA teropiya',
  'Ergoteropiya',
  'Izo',
  'SBO',
  'Musiqa',
  'Ipoteropiya',
  'Umumiy Massaj',
  'GidroVanna',
  'LogoMassaj',
  'CME',
  'Issiq ovqat',
  'Transport xizmati',
];

const getDefaultEndDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 3);
  return date;
};

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

export function ActivitiesScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);

  // Form state
  const [parents, setParents] = useState([]);
  const [children, setChildren] = useState([]);
  const [formData, setFormData] = useState({
    parentId: '',
    childId: '',
    skill: '',
    goal: '',
    startDate: new Date(),
    endDate: getDefaultEndDate(),
    tasks: [''],
    methods: '',
    progress: '',
    observation: '',
    services: [],
  });

  // Date picker state
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    loadActivities();
    loadParents();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await activityService.getActivities();
      setActivities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const loadParents = async () => {
    try {
      const data = await teacherService.getParents();
      setParents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading parents:', error);
      setParents([]);
    }
  };

  const loadChildrenForParent = useCallback((parentId) => {
    const parent = parents.find((p) => p.id === parentId);
    if (parent && parent.children && Array.isArray(parent.children)) {
      setChildren(parent.children);
      if (parent.children.length > 0 && !formData.childId) {
        setFormData((prev) => ({ ...prev, childId: parent.children[0].id }));
      }
    } else {
      setChildren([]);
    }
  }, [parents, formData.childId]);

  const handleCreate = () => {
    setEditingActivity(null);
    const firstParent = parents.length > 0 ? parents[0] : null;
    const firstChild =
      firstParent?.children?.length > 0 ? firstParent.children[0].id : '';

    setFormData({
      parentId: firstParent?.id || '',
      childId: firstChild,
      skill: '',
      goal: '',
      startDate: new Date(),
      endDate: getDefaultEndDate(),
      tasks: [''],
      methods: '',
      progress: '',
      observation: '',
      services: [],
    });

    if (firstParent) {
      loadChildrenForParent(firstParent.id);
    }

    setShowModal(true);
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);

    // Find parent for this child
    let parentId = '';
    if (activity.child?.id || activity.childId) {
      const childId = activity.child?.id || activity.childId;
      const parent = parents.find(
        (p) => p.children && p.children.some((c) => c.id === childId)
      );
      if (parent) {
        parentId = parent.id;
        loadChildrenForParent(parent.id);
      }
    }

    setFormData({
      parentId,
      childId: activity.childId || '',
      skill: activity.skill || '',
      goal: activity.goal || '',
      startDate: activity.startDate ? new Date(activity.startDate) : new Date(),
      endDate: activity.endDate ? new Date(activity.endDate) : getDefaultEndDate(),
      tasks:
        Array.isArray(activity.tasks) && activity.tasks.length > 0
          ? activity.tasks
          : [''],
      methods: activity.methods || '',
      progress: activity.progress || '',
      observation: activity.observation || '',
      services: Array.isArray(activity.services) ? activity.services : [],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.childId) {
        Alert.alert(t('common.error'), t('activitiesPage.selectChildError') || 'Bolani tanlang');
        return;
      }
      if (!formData.skill || !formData.goal) {
        Alert.alert(
          t('common.error'),
          t('activitiesPage.requiredFieldsError') || "Ko'nikma va maqsad to'ldirilishi shart"
        );
        return;
      }

      const payload = {
        ...formData,
        startDate: formatDate(formData.startDate),
        endDate: formatDate(formData.endDate),
        tasks: formData.tasks.filter((t) => t.trim() !== ''),
      };

      if (editingActivity) {
        await activityService.updateActivity(editingActivity.id, payload);
      } else {
        await activityService.createActivity(payload);
      }
      setShowModal(false);
      loadActivities();
    } catch (error) {
      console.error('Error saving activity:', error);
      Alert.alert(t('common.error'), error.message || 'Failed to save activity');
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      t('common.confirm'),
      t('activitiesPage.confirmDelete') || "O'chirmoqchimisiz?",
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await activityService.deleteActivity(id);
              loadActivities();
            } catch (error) {
              console.error('Error deleting activity:', error);
            }
          },
        },
      ]
    );
  };

  const openDetailsModal = (activity) => {
    setSelectedActivity(activity);
    setShowDetailsModal(true);
  };

  const toggleService = (service) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const addTask = () => {
    setFormData((prev) => ({ ...prev, tasks: [...prev.tasks, ''] }));
  };

  const removeTask = (index) => {
    if (formData.tasks.length > 1) {
      setFormData((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((_, i) => i !== index),
      }));
    }
  };

  const updateTask = (index, value) => {
    const newTasks = [...formData.tasks];
    newTasks[index] = value;
    setFormData((prev) => ({ ...prev, tasks: newTasks }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderActivity = ({ item }) => (
    <Card>
      <Pressable onPress={() => openDetailsModal(item)}>
        <View style={styles.activityHeader}>
          <View style={styles.activityIconContainer}>
            <Ionicons name="clipboard" size={24} color={theme.Colors.cards.activities} />
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.title}>{item.skill || item.title || 'Activity'}</Text>
            {item.startDate && (
              <View style={styles.dateContainer}>
                <Ionicons name="calendar-outline" size={14} color={theme.Colors.text.secondary} />
                <Text style={styles.date}>
                  {new Date(item.startDate).toLocaleDateString()}
                  {item.endDate && ` - ${new Date(item.endDate).toLocaleDateString()}`}
                </Text>
              </View>
            )}
          </View>
        </View>
        {item.goal && (
          <Text style={styles.description} numberOfLines={2}>
            {item.goal}
          </Text>
        )}
        {item.services && item.services.length > 0 && (
          <View style={styles.servicesContainer}>
            {item.services.slice(0, 3).map((service, idx) => (
              <View key={idx} style={styles.serviceChip}>
                <Text style={styles.serviceChipText}>{service}</Text>
              </View>
            ))}
            {item.services.length > 3 && (
              <View style={styles.moreChip}>
                <Text style={styles.moreChipText}>+{item.services.length - 3}</Text>
              </View>
            )}
          </View>
        )}
      </Pressable>
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.Colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('tabs.activities')}</Text>
        <TouchableOpacity onPress={handleCreate} style={styles.headerAction}>
          <Ionicons name="add" size={24} color={theme.Colors.text.inverse} />
        </TouchableOpacity>
      </View>

      {activities.length === 0 ? (
        <EmptyState icon="clipboard-outline" message={t('activitiesPage.empty') || 'No activities found'} />
      ) : (
        <FlatList
          data={activities}
          renderItem={renderActivity}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadActivities}
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
                {editingActivity
                  ? t('activitiesPage.editTitle') || 'Edit Activity'
                  : t('activitiesPage.createTitle') || 'Create Activity'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={theme.Colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formScrollView} showsVerticalScrollIndicator={false}>
              {/* Parent Picker */}
              <Text style={styles.label}>{t('activitiesPage.parent') || 'Ota-ona'}</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.parentId}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, parentId: value, childId: '' }));
                    loadChildrenForParent(value);
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label={t('activitiesPage.selectParent') || 'Ota-onani tanlang'} value="" />
                  {parents.map((parent) => (
                    <Picker.Item
                      key={parent.id}
                      label={`${parent.firstName} ${parent.lastName}`}
                      value={parent.id}
                    />
                  ))}
                </Picker>
              </View>

              {/* Child Picker */}
              <Text style={styles.label}>{t('activitiesPage.child') || 'Bola'}</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.childId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, childId: value }))}
                  style={styles.picker}
                  enabled={children.length > 0}
                >
                  <Picker.Item label={t('activitiesPage.selectChild') || 'Bolani tanlang'} value="" />
                  {children.map((child) => (
                    <Picker.Item
                      key={child.id}
                      label={`${child.firstName} ${child.lastName}`}
                      value={child.id}
                    />
                  ))}
                </Picker>
              </View>

              {/* Skill */}
              <Text style={styles.label}>{t('activitiesPage.formSkill') || "Ko'nikma"}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('activitiesPage.formSkillPlaceholder') || "Masalan: O'z-o'ziga xizmat ko'rsatish"}
                placeholderTextColor={theme.Colors.text.tertiary}
                value={formData.skill}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, skill: text }))}
              />

              {/* Goal */}
              <Text style={styles.label}>{t('activitiesPage.formGoal') || 'Maqsad'}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t('activitiesPage.formGoalPlaceholder') || 'Maqsadni batafsil yozing'}
                placeholderTextColor={theme.Colors.text.tertiary}
                value={formData.goal}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, goal: text }))}
                multiline
              />

              {/* Dates */}
              <View style={styles.dateRow}>
                <View style={styles.dateField}>
                  <Text style={styles.label}>{t('activitiesPage.formStartDate') || 'Boshlanish'}</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowStartPicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={18} color={theme.Colors.primary.blue} />
                    <Text style={styles.dateButtonText}>
                      {formData.startDate.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.dateField}>
                  <Text style={styles.label}>{t('activitiesPage.formEndDate') || 'Tugash'}</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowEndPicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={18} color={theme.Colors.primary.blue} />
                    <Text style={styles.dateButtonText}>
                      {formData.endDate.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {showStartPicker && (
                <DateTimePicker
                  value={formData.startDate}
                  mode="date"
                  onChange={(event, date) => {
                    setShowStartPicker(false);
                    if (date) setFormData((prev) => ({ ...prev, startDate: date }));
                  }}
                />
              )}

              {showEndPicker && (
                <DateTimePicker
                  value={formData.endDate}
                  mode="date"
                  onChange={(event, date) => {
                    setShowEndPicker(false);
                    if (date) setFormData((prev) => ({ ...prev, endDate: date }));
                  }}
                />
              )}

              {/* Tasks */}
              <Text style={styles.label}>{t('activitiesPage.formTasks') || 'Vazifalar'}</Text>
              {formData.tasks.map((task, index) => (
                <View key={index} style={styles.taskRow}>
                  <TextInput
                    style={[styles.input, styles.taskInput]}
                    placeholder={`${t('activitiesPage.formTask') || 'Vazifa'} ${index + 1}`}
                    placeholderTextColor={theme.Colors.text.tertiary}
                    value={task}
                    onChangeText={(text) => updateTask(index, text)}
                  />
                  {formData.tasks.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeTaskButton}
                      onPress={() => removeTask(index)}
                    >
                      <Ionicons name="close-circle" size={24} color={theme.Colors.status.error} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity style={styles.addTaskButton} onPress={addTask}>
                <Ionicons name="add-circle-outline" size={20} color={theme.Colors.primary.blue} />
                <Text style={styles.addTaskText}>
                  {t('activitiesPage.addTask') || "Vazifa qo'shish"}
                </Text>
              </TouchableOpacity>

              {/* Methods */}
              <Text style={styles.label}>{t('activitiesPage.formMethods') || 'Usullar'}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t('activitiesPage.formMethodsPlaceholder') || "Qo'llaniladigan usullarni yozing"}
                placeholderTextColor={theme.Colors.text.tertiary}
                value={formData.methods}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, methods: text }))}
                multiline
              />

              {/* Progress */}
              <Text style={styles.label}>{t('activitiesPage.formProgress') || 'Jarayon/Taraqqiyot'}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t('activitiesPage.formProgressPlaceholder') || 'Jarayon va taraqqiyotni yozing'}
                placeholderTextColor={theme.Colors.text.tertiary}
                value={formData.progress}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, progress: text }))}
                multiline
              />

              {/* Observation */}
              <Text style={styles.label}>{t('activitiesPage.formObservation') || 'Kuzatish'}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t('activitiesPage.formObservationPlaceholder') || 'Kuzatuvlarni yozing'}
                placeholderTextColor={theme.Colors.text.tertiary}
                value={formData.observation}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, observation: text }))}
                multiline
              />

              {/* Services */}
              <Text style={styles.label}>{t('activitiesPage.formServices') || 'Xizmatlar'}</Text>
              <View style={styles.servicesGrid}>
                {SERVICES_LIST.map((service) => (
                  <TouchableOpacity
                    key={service}
                    style={[
                      styles.serviceOption,
                      formData.services.includes(service) && styles.serviceOptionSelected,
                    ]}
                    onPress={() => toggleService(service)}
                  >
                    <Ionicons
                      name={formData.services.includes(service) ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={
                        formData.services.includes(service)
                          ? theme.Colors.primary.blue
                          : theme.Colors.text.secondary
                      }
                    />
                    <Text
                      style={[
                        styles.serviceOptionText,
                        formData.services.includes(service) && styles.serviceOptionTextSelected,
                      ]}
                    >
                      {service}
                    </Text>
                  </TouchableOpacity>
                ))}
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

      {/* Details Modal */}
      <Modal visible={showDetailsModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={[styles.modalHeader, styles.detailsHeader]}>
              <Text style={styles.modalTitle}>
                {selectedActivity?.skill || t('activitiesPage.formSkill') || "Ko'nikma"}
              </Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Ionicons name="close" size={24} color={theme.Colors.text.inverse} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailsScrollView} showsVerticalScrollIndicator={false}>
              {selectedActivity?.goal && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>{t('activitiesPage.formGoal') || 'Maqsad'}</Text>
                  <Text style={styles.detailText}>{selectedActivity.goal}</Text>
                </View>
              )}

              <View style={styles.datesSection}>
                {selectedActivity?.startDate && (
                  <View style={styles.dateDetail}>
                    <Ionicons name="calendar" size={16} color={theme.Colors.primary.blue} />
                    <View>
                      <Text style={styles.dateDetailLabel}>
                        {t('activitiesPage.formStartDate') || 'Boshlanish'}
                      </Text>
                      <Text style={styles.dateDetailValue}>
                        {new Date(selectedActivity.startDate).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                )}
                {selectedActivity?.endDate && (
                  <View style={styles.dateDetail}>
                    <Ionicons name="calendar" size={16} color={theme.Colors.primary.blue} />
                    <View>
                      <Text style={styles.dateDetailLabel}>
                        {t('activitiesPage.formEndDate') || 'Tugash'}
                      </Text>
                      <Text style={styles.dateDetailValue}>
                        {new Date(selectedActivity.endDate).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {selectedActivity?.tasks && selectedActivity.tasks.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>{t('activitiesPage.formTasks') || 'Vazifalar'}</Text>
                  {selectedActivity.tasks.map(
                    (task, idx) =>
                      task && (
                        <View key={idx} style={styles.taskItem}>
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={theme.Colors.status.success}
                          />
                          <Text style={styles.taskItemText}>{task}</Text>
                        </View>
                      )
                  )}
                </View>
              )}

              {selectedActivity?.methods && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>{t('activitiesPage.formMethods') || 'Usullar'}</Text>
                  <Text style={styles.detailText}>{selectedActivity.methods}</Text>
                </View>
              )}

              {selectedActivity?.progress && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>
                    {t('activitiesPage.formProgress') || 'Jarayon/Taraqqiyot'}
                  </Text>
                  <Text style={styles.detailText}>{selectedActivity.progress}</Text>
                </View>
              )}

              {selectedActivity?.observation && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>{t('activitiesPage.formObservation') || 'Kuzatish'}</Text>
                  <Text style={styles.detailText}>{selectedActivity.observation}</Text>
                </View>
              )}

              {selectedActivity?.services && selectedActivity.services.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>{t('activitiesPage.formServices') || 'Xizmatlar'}</Text>
                  <View style={styles.servicesDetailGrid}>
                    {selectedActivity.services.map((service, idx) => (
                      <View key={idx} style={styles.serviceDetailChip}>
                        <Text style={styles.serviceDetailChipText}>{service}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.formSpacer} />
            </ScrollView>

            <TouchableOpacity
              style={styles.closeDetailsButton}
              onPress={() => setShowDetailsModal(false)}
            >
              <Text style={styles.closeDetailsButtonText}>{t('common.close') || 'Yopish'}</Text>
            </TouchableOpacity>
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
  // Header
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
  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 90,
    right: theme.Spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.Colors.cards.activities,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.Colors.shadow.lg,
  },
  // List
  list: {
    padding: theme.Spacing.md,
    paddingBottom: 100,
  },
  // Activity Card
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.Spacing.sm,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.Colors.cards.activities + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.Spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  title: {
    fontSize: theme.Typography.sizes.lg,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.text.primary,
    marginBottom: theme.Spacing.xs,
  },
  description: {
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.secondary,
    marginTop: theme.Spacing.sm,
    lineHeight: 20,
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
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.Spacing.sm,
    gap: theme.Spacing.xs,
  },
  serviceChip: {
    backgroundColor: theme.Colors.primary.blue + '15',
    paddingHorizontal: theme.Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  serviceChipText: {
    fontSize: theme.Typography.sizes.xs,
    color: theme.Colors.primary.blue,
    fontWeight: theme.Typography.weights.medium,
  },
  moreChip: {
    backgroundColor: theme.Colors.background.secondary,
    paddingHorizontal: theme.Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moreChipText: {
    fontSize: theme.Typography.sizes.xs,
    color: theme.Colors.text.secondary,
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
  // Modal
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
  detailsHeader: {
    backgroundColor: theme.Colors.primary.blue,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomWidth: 0,
  },
  modalTitle: {
    fontSize: theme.Typography.sizes.xl,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.text.primary,
    flex: 1,
  },
  formScrollView: {
    paddingHorizontal: theme.Spacing.lg,
    maxHeight: '70%',
  },
  detailsScrollView: {
    paddingHorizontal: theme.Spacing.lg,
    paddingTop: theme.Spacing.md,
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
  dateRow: {
    flexDirection: 'row',
    gap: theme.Spacing.md,
  },
  dateField: {
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
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.Spacing.xs,
  },
  taskInput: {
    flex: 1,
    marginBottom: 0,
  },
  removeTaskButton: {
    marginLeft: theme.Spacing.sm,
    padding: theme.Spacing.xs,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.Spacing.sm,
    gap: theme.Spacing.xs,
  },
  addTaskText: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.primary.blue,
    fontWeight: theme.Typography.weights.medium,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.Spacing.xs,
  },
  serviceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    paddingVertical: theme.Spacing.sm,
    gap: theme.Spacing.xs,
  },
  serviceOptionSelected: {
    // Selected state
  },
  serviceOptionText: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
    flex: 1,
  },
  serviceOptionTextSelected: {
    color: theme.Colors.primary.blue,
    fontWeight: theme.Typography.weights.medium,
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
    backgroundColor: theme.Colors.cards.activities,
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
  // Details Modal
  detailSection: {
    marginBottom: theme.Spacing.lg,
    backgroundColor: theme.Colors.background.secondary,
    padding: theme.Spacing.md,
    borderRadius: theme.BorderRadius.md,
  },
  detailLabel: {
    fontSize: theme.Typography.sizes.sm,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.primary.blue,
    marginBottom: theme.Spacing.sm,
  },
  detailText: {
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.primary,
    lineHeight: 22,
  },
  datesSection: {
    flexDirection: 'row',
    gap: theme.Spacing.md,
    marginBottom: theme.Spacing.lg,
  },
  dateDetail: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.Colors.primary.blue + '10',
    padding: theme.Spacing.md,
    borderRadius: theme.BorderRadius.md,
    gap: theme.Spacing.sm,
  },
  dateDetailLabel: {
    fontSize: theme.Typography.sizes.xs,
    color: theme.Colors.primary.blue,
    fontWeight: theme.Typography.weights.semibold,
  },
  dateDetailValue: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.primary,
    fontWeight: theme.Typography.weights.bold,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.Spacing.xs,
    gap: theme.Spacing.sm,
  },
  taskItemText: {
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.primary,
    flex: 1,
  },
  servicesDetailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.Spacing.xs,
  },
  serviceDetailChip: {
    backgroundColor: theme.Colors.primary.blue + '15',
    paddingHorizontal: theme.Spacing.sm,
    paddingVertical: 6,
    borderRadius: 16,
  },
  serviceDetailChipText: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.primary.blue,
    fontWeight: theme.Typography.weights.medium,
  },
  closeDetailsButton: {
    backgroundColor: theme.Colors.primary.blue,
    margin: theme.Spacing.lg,
    padding: theme.Spacing.md,
    borderRadius: theme.BorderRadius.md,
    alignItems: 'center',
  },
  closeDetailsButtonText: {
    color: theme.Colors.text.inverse,
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.semibold,
  },
});
