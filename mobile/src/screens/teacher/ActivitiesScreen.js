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
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { activityService } from '../../services/activityService';
import { teacherService } from '../../services/teacherService';
import Card from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import TeacherBackground from '../../components/layout/TeacherBackground';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import theme from '../../styles/theme';

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

export function ActivitiesScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [parents, setParents] = useState([]);
  const [children, setChildren] = useState([]);
  const [formData, setFormData] = useState({
    parentId: '',
    childId: '',
    teacher: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Teacher',
    skill: '',
    goal: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    tasks: [''],
    methods: '',
    progress: '',
    observation: '',
    services: [],
  });

  useEffect(() => {
    loadActivities();
    loadParents();
  }, []);

  const loadParents = async () => {
    try {
      const parentsList = await teacherService.getParents();
      setParents(Array.isArray(parentsList) ? parentsList : []);
      
      // If only one parent, auto-select them
      if (parentsList.length === 1 && !formData.parentId) {
        const parentId = parentsList[0].id;
        setFormData(prev => ({ ...prev, parentId }));
        await loadChildrenForParent(parentId);
      }
    } catch (error) {
      console.error('Error loading parents:', error);
      setParents([]);
    }
  };

  const loadChildrenForParent = async (parentId) => {
    try {
      const parentsList = await teacherService.getParents();
      const selectedParent = parentsList.find(p => p.id === parentId);
      if (selectedParent && selectedParent.children && Array.isArray(selectedParent.children)) {
        setChildren(selectedParent.children);
        if (selectedParent.children.length > 0 && !formData.childId) {
          setFormData(prev => ({ ...prev, childId: selectedParent.children[0].id }));
        } else {
          setFormData(prev => ({ ...prev, childId: '' }));
        }
      } else {
        setChildren([]);
        setFormData(prev => ({ ...prev, childId: '' }));
      }
    } catch (error) {
      console.error('Error loading children for parent:', error);
      setChildren([]);
      setFormData(prev => ({ ...prev, childId: '' }));
    }
  };

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

  const handleCreate = async () => {
    setEditingActivity(null);
    
    // Ensure parents are loaded
    if (parents.length === 0) {
      await loadParents();
    }
    
    const firstParent = parents.length > 0 ? parents[0] : null;
    const firstChild = firstParent && firstParent.children && firstParent.children.length > 0 
      ? firstParent.children[0].id : '';
    
    const today = new Date().toISOString().split('T')[0];
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
    const endDateDefault = threeMonthsLater.toISOString().split('T')[0];
    
    setFormData({
      parentId: firstParent ? firstParent.id : '',
      childId: firstChild,
      teacher: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Teacher',
      skill: '',
      goal: '',
      startDate: today,
      endDate: endDateDefault,
      tasks: [''],
      methods: '',
      progress: '',
      observation: '',
      services: [],
    });
    
    if (firstParent) {
      await loadChildrenForParent(firstParent.id);
    }
    
    setShowModal(true);
  };

  const handleEdit = async (activity) => {
    setEditingActivity(activity);
    
    // Find parent for this child
    let parentId = '';
    if (activity.child && activity.child.id) {
      const parent = parents.find(p => 
        p.children && p.children.some(c => c.id === activity.child.id)
      );
      if (parent) {
        parentId = parent.id;
        await loadChildrenForParent(parent.id);
      }
    }
    
    setFormData({
      parentId: parentId,
      childId: activity.childId || '',
      teacher: activity.teacher || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Teacher'),
      skill: activity.skill || '',
      goal: activity.goal || '',
      startDate: activity.startDate ? activity.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: activity.endDate ? activity.endDate.split('T')[0] : '',
      tasks: Array.isArray(activity.tasks) && activity.tasks.length > 0 ? activity.tasks : [''],
      methods: activity.methods || '',
      progress: activity.progress || '',
      observation: activity.observation || '',
      services: Array.isArray(activity.services) ? activity.services : [],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!formData.childId) {
        Alert.alert(t('common.error', { defaultValue: 'Error' }), t('activitiesPage.selectChildError', { defaultValue: 'Bolani tanlang' }));
        return;
      }
      if (!formData.skill || !formData.goal || !formData.startDate || !formData.endDate) {
        Alert.alert(
          t('common.error', { defaultValue: 'Error' }), 
          t('activitiesPage.requiredFieldsError', { defaultValue: 'Ko\'nikma, maqsad, boshlanish va tugash sanalari to\'ldirilishi shart' })
        );
        return;
      }

      if (editingActivity) {
        await activityService.updateActivity(editingActivity.id, formData);
        Alert.alert(t('common.success', { defaultValue: 'Success' }), t('activitiesPage.toastUpdate', { defaultValue: 'Individual reja yangilandi' }));
      } else {
        await activityService.createActivity(formData);
        Alert.alert(t('common.success', { defaultValue: 'Success' }), t('activitiesPage.toastCreate', { defaultValue: 'Individual reja yaratildi' }));
      }
      setShowModal(false);
      loadActivities();
    } catch (error) {
      console.error('Error saving activity:', error);
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }), 
        error.response?.data?.error || t('activitiesPage.toastError', { defaultValue: 'Xatolik yuz berdi' })
      );
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      t('activitiesPage.confirmDelete', { defaultValue: 'O\'chirishni tasdiqlash' }),
      t('activitiesPage.confirmDeleteMessage', { defaultValue: 'Bu individual rejani o\'chirishni xohlaysizmi?' }),
      [
        { text: t('common.cancel', { defaultValue: 'Bekor qilish' }), style: 'cancel' },
        {
          text: t('common.delete', { defaultValue: 'O\'chirish' }),
          style: 'destructive',
          onPress: async () => {
            try {
              await activityService.deleteActivity(id);
              Alert.alert(t('common.success', { defaultValue: 'Success' }), t('activitiesPage.toastDelete', { defaultValue: 'Individual reja o\'chirildi' }));
              loadActivities();
            } catch (error) {
              console.error('Error deleting activity:', error);
              Alert.alert(t('common.error', { defaultValue: 'Error' }), t('activitiesPage.toastError', { defaultValue: 'Xatolik yuz berdi' }));
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderActivity = ({ item }) => (
    <Card style={styles.card}>
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
              </Text>
            </View>
          )}
        </View>
      </View>
      {item.goal && <Text style={styles.goal} numberOfLines={2}>{item.goal}</Text>}
      {item.services && Array.isArray(item.services) && item.services.length > 0 && (
        <View style={styles.servicesContainer}>
          {item.services.slice(0, 3).map((service, idx) => (
            <View key={idx} style={styles.serviceTag}>
              <Text style={styles.serviceText}>{service}</Text>
            </View>
          ))}
          {item.services.length > 3 && (
            <View style={styles.serviceTag}>
              <Text style={styles.serviceText}>+{item.services.length - 3}</Text>
            </View>
          )}
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

  return (
    <View style={styles.container}>
      <TeacherBackground />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.Colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t('activitiesPage.title') || t('activities.title') || 'Individual reja'}
        </Text>
        <TouchableOpacity onPress={handleCreate} style={styles.headerAction}>
          <Ionicons name="add" size={24} color={theme.Colors.text.inverse} />
        </TouchableOpacity>
      </View>

      {activities.length === 0 ? (
        <EmptyState icon="clipboard-outline" message={t('activitiesPage.empty', { defaultValue: 'No activities found' })} />
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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingActivity 
                    ? t('activitiesPage.editTitle', { defaultValue: 'Edit Activity' })
                    : t('activitiesPage.createTitle', { defaultValue: 'Create Activity' })
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
                {/* Parent Selection */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t('activitiesPage.parent', { defaultValue: 'Ota-ona' })}
                  </Text>
                  <View style={styles.pickerContainer}>
                    <ScrollView style={styles.pickerScrollView} nestedScrollEnabled>
                      {parents.map((parent) => (
                        <Pressable
                          key={parent.id}
                          style={[
                            styles.pickerOption,
                            formData.parentId === parent.id && styles.pickerOptionSelected
                          ]}
                          onPress={() => {
                            setFormData(prev => ({ ...prev, parentId: parent.id, childId: '' }));
                            loadChildrenForParent(parent.id);
                          }}
                        >
                          <Text style={[
                            styles.pickerOptionText,
                            formData.parentId === parent.id && styles.pickerOptionTextSelected
                          ]}>
                            {parent.firstName} {parent.lastName}
                          </Text>
                          {formData.parentId === parent.id && (
                            <Ionicons name="checkmark" size={20} color={theme.Colors.primary.blue} />
                          )}
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                {/* Child Selection */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t('activitiesPage.child', { defaultValue: 'Bola' })}
                  </Text>
                  {formData.parentId && children.length > 0 ? (
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
                  ) : formData.parentId ? (
                    <Text style={styles.helperText}>
                      {t('activitiesPage.noChildren', { defaultValue: 'Bu ota-onada bolalar yo\'q' })}
                    </Text>
                  ) : (
                    <Text style={styles.helperText}>
                      {t('activitiesPage.selectParentFirst', { defaultValue: 'Avval ota-onani tanlang' })}
                    </Text>
                  )}
                </View>

                {/* Skill */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t('activitiesPage.formSkill', { defaultValue: 'Ko\'nikma' })}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={t('activitiesPage.formSkillPlaceholder', { defaultValue: 'Masalan: O\'z-o\'ziga xizmat ko\'rsatish ko\'nikmalari' })}
                    placeholderTextColor={theme.Colors.text.tertiary}
                    value={formData.skill}
                    onChangeText={(text) => setFormData({ ...formData, skill: text })}
                  />
                </View>

                {/* Goal */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t('activitiesPage.formGoal', { defaultValue: 'Maqsad' })}
                  </Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder={t('activitiesPage.formGoalPlaceholder', { defaultValue: 'Maqsadni batafsil yozing' })}
                    placeholderTextColor={theme.Colors.text.tertiary}
                    value={formData.goal}
                    onChangeText={(text) => setFormData({ ...formData, goal: text })}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Dates */}
                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.label}>
                      {t('activitiesPage.formStartDate', { defaultValue: 'Boshlanish' })}
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={theme.Colors.text.tertiary}
                      value={formData.startDate}
                      onChangeText={(text) => setFormData({ ...formData, startDate: text })}
                    />
                  </View>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.label}>
                      {t('activitiesPage.formEndDate', { defaultValue: 'Tugash' })}
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={theme.Colors.text.tertiary}
                      value={formData.endDate}
                      onChangeText={(text) => setFormData({ ...formData, endDate: text })}
                    />
                  </View>
                </View>

                {/* Tasks */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t('activitiesPage.formTasks', { defaultValue: 'Vazifalar' })}
                  </Text>
                  {formData.tasks.map((task, index) => (
                    <View key={index} style={styles.taskRow}>
                      <TextInput
                        style={[styles.input, styles.taskInput]}
                        placeholder={`${t('activitiesPage.formTask', { defaultValue: 'Vazifa' })} ${index + 1}`}
                        placeholderTextColor={theme.Colors.text.tertiary}
                        value={task}
                        onChangeText={(text) => {
                          const newTasks = [...formData.tasks];
                          newTasks[index] = text;
                          setFormData({ ...formData, tasks: newTasks });
                        }}
                      />
                      {formData.tasks.length > 1 && (
                        <TouchableOpacity
                          onPress={() => {
                            const newTasks = formData.tasks.filter((_, i) => i !== index);
                            setFormData({ ...formData, tasks: newTasks });
                          }}
                          style={styles.removeTaskButton}
                        >
                          <Ionicons name="close-circle" size={24} color={theme.Colors.status.error} />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                  <TouchableOpacity
                    onPress={() => setFormData({ ...formData, tasks: [...formData.tasks, ''] })}
                    style={styles.addTaskButton}
                  >
                    <Ionicons name="add-circle-outline" size={20} color={theme.Colors.primary.blue} />
                    <Text style={styles.addTaskText}>
                      {t('activitiesPage.addTask', { defaultValue: 'Vazifa qo\'shish' })}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Methods */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t('activitiesPage.formMethods', { defaultValue: 'Usullar' })}
                  </Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder={t('activitiesPage.formMethodsPlaceholder', { defaultValue: 'Qo\'llaniladigan usullarni yozing' })}
                    placeholderTextColor={theme.Colors.text.tertiary}
                    value={formData.methods}
                    onChangeText={(text) => setFormData({ ...formData, methods: text })}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Progress */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t('activitiesPage.formProgress', { defaultValue: 'Jarayon/Taraqqiyot' })}
                  </Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder={t('activitiesPage.formProgressPlaceholder', { defaultValue: 'Jarayon va taraqqiyotni yozing' })}
                    placeholderTextColor={theme.Colors.text.tertiary}
                    value={formData.progress}
                    onChangeText={(text) => setFormData({ ...formData, progress: text })}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Observation */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t('activitiesPage.formObservation', { defaultValue: 'Kuzatish' })}
                  </Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder={t('activitiesPage.formObservationPlaceholder', { defaultValue: 'Kuzatuvlarni yozing' })}
                    placeholderTextColor={theme.Colors.text.tertiary}
                    value={formData.observation}
                    onChangeText={(text) => setFormData({ ...formData, observation: text })}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Services */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {t('activitiesPage.formServices', { defaultValue: 'Xizmatlar' })}
                  </Text>
                  <View style={styles.servicesGrid}>
                    {SERVICES_LIST.map((service) => (
                      <Pressable
                        key={service}
                        style={[
                          styles.serviceCheckbox,
                          formData.services.includes(service) && styles.serviceCheckboxSelected
                        ]}
                        onPress={() => {
                          if (formData.services.includes(service)) {
                            setFormData({
                              ...formData,
                              services: formData.services.filter((s) => s !== service),
                            });
                          } else {
                            setFormData({
                              ...formData,
                              services: [...formData.services, service],
                            });
                          }
                        }}
                      >
                        <Ionicons
                          name={formData.services.includes(service) ? 'checkbox' : 'checkbox-outline'}
                          size={20}
                          color={formData.services.includes(service) ? theme.Colors.primary.blue : theme.Colors.text.secondary}
                        />
                        <Text style={[
                          styles.serviceCheckboxText,
                          formData.services.includes(service) && styles.serviceCheckboxTextSelected
                        ]}>
                          {service}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <Pressable style={styles.cancelButton} onPress={() => setShowModal(false)}>
                  <Text style={styles.cancelButtonText}>
                    {t('activitiesPage.cancel', { defaultValue: 'Bekor qilish' })}
                  </Text>
                </Pressable>
                <Pressable style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>
                    {editingActivity 
                      ? t('activitiesPage.update', { defaultValue: 'Yangilash' })
                      : t('activitiesPage.create', { defaultValue: 'Yaratish' })
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
  list: {
    padding: theme.Spacing.md,
    paddingBottom: 100,
  },
  card: {
    marginBottom: theme.Spacing.md,
  },
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
  goal: {
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
  serviceTag: {
    backgroundColor: theme.Colors.primary.blueBg,
    paddingHorizontal: theme.Spacing.sm,
    paddingVertical: theme.Spacing.xs / 2,
    borderRadius: theme.BorderRadius.sm,
  },
  serviceText: {
    fontSize: theme.Typography.sizes.xs,
    color: theme.Colors.primary.blue,
    fontWeight: theme.Typography.weights.medium,
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
  helperText: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
    fontStyle: 'italic',
    padding: theme.Spacing.sm,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.Spacing.xs,
    gap: theme.Spacing.xs,
  },
  taskInput: {
    flex: 1,
  },
  removeTaskButton: {
    padding: theme.Spacing.xs,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.Spacing.xs,
    padding: theme.Spacing.sm,
  },
  addTaskText: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.primary.blue,
    marginLeft: theme.Spacing.xs,
    fontWeight: theme.Typography.weights.medium,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.Spacing.sm,
  },
  serviceCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.Spacing.sm,
    borderWidth: 1,
    borderColor: theme.Colors.border.medium,
    borderRadius: theme.BorderRadius.sm,
    minWidth: '45%',
  },
  serviceCheckboxSelected: {
    backgroundColor: theme.Colors.primary.blueBg,
    borderColor: theme.Colors.primary.blue,
  },
  serviceCheckboxText: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.primary,
    marginLeft: theme.Spacing.xs,
  },
  serviceCheckboxTextSelected: {
    color: theme.Colors.primary.blue,
    fontWeight: theme.Typography.weights.medium,
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
    backgroundColor: theme.Colors.cards.activities,
  },
  saveButtonText: {
    color: theme.Colors.text.inverse,
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.semibold,
  },
});
