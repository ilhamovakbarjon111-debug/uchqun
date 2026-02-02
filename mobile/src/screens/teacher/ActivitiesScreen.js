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
import tokens from '../../styles/tokens';

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
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
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
          <Ionicons name="clipboard" size={24} color={tokens.colors.semantic.success} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.title}>{item.skill || item.title || 'Activity'}</Text>
          {item.startDate && (
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={14} color={tokens.colors.text.secondary} />
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
        <Pressable style={styles.detailButton} onPress={() => { setSelectedActivity(item); setShowDetailsModal(true); }}>
          <Ionicons name="eye-outline" size={18} color={tokens.colors.semantic.success} />
          <Text style={styles.detailButtonText}>Batafsil</Text>
        </Pressable>
        <Pressable style={styles.editButton} onPress={() => handleEdit(item)}>
          <Ionicons name="pencil" size={18} color={tokens.colors.accent.blue} />
          <Text style={styles.editButtonText}>{t('common.edit', { defaultValue: 'Edit' })}</Text>
        </Pressable>
        <Pressable style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={18} color={tokens.colors.semantic.error} />
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
          <Ionicons name="arrow-back" size={24} color={tokens.colors.text.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t('activitiesPage.title') || t('activities.title') || 'Individual reja'}
        </Text>
        <TouchableOpacity onPress={handleCreate} style={styles.headerAction}>
          <Ionicons name="add" size={24} color={tokens.colors.text.white} />
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
        <Ionicons name="add" size={28} color={tokens.colors.text.white} />
      </TouchableOpacity>

      {/* Details Modal */}
      <Modal visible={showDetailsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={2}>
                {selectedActivity?.skill || selectedActivity?.title || 'Faoliyat'}
              </Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Ionicons name="close" size={24} color={tokens.colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailsScrollView} showsVerticalScrollIndicator={true}>
              {/* Goal */}
              {selectedActivity?.goal ? (
                <View style={styles.detailSection}>
                  <View style={styles.detailGoalCard}>
                    <View style={styles.detailSectionHeader}>
                      <Ionicons name="flag" size={18} color={tokens.colors.accent.blue} />
                      <Text style={styles.detailSectionTitle}>Maqsad</Text>
                    </View>
                    <Text style={styles.detailGoalText}>{selectedActivity.goal}</Text>
                  </View>
                </View>
              ) : null}

              {/* Dates */}
              {(selectedActivity?.startDate || selectedActivity?.endDate) ? (
                <View style={styles.detailSection}>
                  <View style={styles.detailSectionHeader}>
                    <Ionicons name="calendar" size={18} color={tokens.colors.semantic.success} />
                    <Text style={styles.detailSectionTitle}>Sanalar</Text>
                  </View>
                  <View style={styles.detailDatesRow}>
                    {selectedActivity?.startDate ? (
                      <View style={styles.detailDateCard}>
                        <Ionicons name="calendar-outline" size={16} color={tokens.colors.accent.blue} />
                        <View>
                          <Text style={styles.detailDateLabel}>Boshlanish</Text>
                          <Text style={styles.detailDateValue}>{new Date(selectedActivity.startDate).toLocaleDateString()}</Text>
                        </View>
                      </View>
                    ) : null}
                    {selectedActivity?.endDate ? (
                      <View style={styles.detailDateCard}>
                        <Ionicons name="calendar-outline" size={16} color={tokens.colors.semantic.error} />
                        <View>
                          <Text style={styles.detailDateLabel}>Tugash</Text>
                          <Text style={styles.detailDateValue}>{new Date(selectedActivity.endDate).toLocaleDateString()}</Text>
                        </View>
                      </View>
                    ) : null}
                  </View>
                </View>
              ) : null}

              {/* Teacher */}
              {selectedActivity?.teacher ? (
                <View style={styles.detailSection}>
                  <View style={styles.detailSectionHeader}>
                    <Ionicons name="person" size={18} color={tokens.colors.semantic.success} />
                    <Text style={styles.detailSectionTitle}>O'qituvchi</Text>
                  </View>
                  <Text style={styles.detailText}>{selectedActivity.teacher}</Text>
                </View>
              ) : null}

              {/* Tasks */}
              {selectedActivity?.tasks && Array.isArray(selectedActivity.tasks) && selectedActivity.tasks.filter(t => t).length > 0 ? (
                <View style={styles.detailSection}>
                  <View style={styles.detailSectionHeader}>
                    <Ionicons name="checkmark-circle" size={18} color={tokens.colors.semantic.success} />
                    <Text style={styles.detailSectionTitle}>Vazifalar</Text>
                  </View>
                  {selectedActivity.tasks.filter(t => t).map((task, idx) => (
                    <View key={idx} style={styles.detailTaskItem}>
                      <View style={styles.detailTaskBullet} />
                      <Text style={styles.detailText}>{task}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {/* Methods */}
              {selectedActivity?.methods ? (
                <View style={styles.detailSection}>
                  <View style={styles.detailSectionHeader}>
                    <Ionicons name="bulb" size={18} color={tokens.colors.semantic.success} />
                    <Text style={styles.detailSectionTitle}>Usullar</Text>
                  </View>
                  <Text style={styles.detailText}>{selectedActivity.methods}</Text>
                </View>
              ) : null}

              {/* Progress */}
              {selectedActivity?.progress ? (
                <View style={styles.detailSection}>
                  <View style={styles.detailSectionHeader}>
                    <Ionicons name="trending-up" size={18} color={tokens.colors.semantic.success} />
                    <Text style={styles.detailSectionTitle}>Jarayon/Taraqqiyot</Text>
                  </View>
                  <Text style={styles.detailText}>{selectedActivity.progress}</Text>
                </View>
              ) : null}

              {/* Observation */}
              {selectedActivity?.observation ? (
                <View style={styles.detailSection}>
                  <View style={styles.detailSectionHeader}>
                    <Ionicons name="eye" size={18} color={tokens.colors.semantic.success} />
                    <Text style={styles.detailSectionTitle}>Kuzatish</Text>
                  </View>
                  <Text style={styles.detailText}>{selectedActivity.observation}</Text>
                </View>
              ) : null}

              {/* Services */}
              {selectedActivity?.services && Array.isArray(selectedActivity.services) && selectedActivity.services.length > 0 ? (
                <View style={styles.detailSection}>
                  <View style={styles.detailSectionHeader}>
                    <Ionicons name="medkit" size={18} color={tokens.colors.semantic.success} />
                    <Text style={styles.detailSectionTitle}>Xizmatlar</Text>
                  </View>
                  <View style={styles.detailServicesWrap}>
                    {selectedActivity.services.map((service, idx) => (
                      <View key={idx} style={styles.detailServiceBadge}>
                        <Text style={styles.detailServiceText}>{service}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </ScrollView>

            <View style={styles.detailsFooter}>
              <Pressable style={styles.detailsCloseButton} onPress={() => setShowDetailsModal(false)}>
                <Text style={styles.detailsCloseButtonText}>Yopish</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
                  <Ionicons name="close" size={24} color={tokens.colors.text.secondary} />
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
                            <Ionicons name="checkmark" size={20} color={tokens.colors.accent.blue} />
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
                              <Ionicons name="checkmark" size={20} color={tokens.colors.accent.blue} />
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
                    placeholderTextColor={tokens.colors.text.tertiary}
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
                    placeholderTextColor={tokens.colors.text.tertiary}
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
                      placeholderTextColor={tokens.colors.text.tertiary}
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
                      placeholderTextColor={tokens.colors.text.tertiary}
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
                        placeholderTextColor={tokens.colors.text.tertiary}
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
                          <Ionicons name="close-circle" size={24} color={tokens.colors.semantic.error} />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                  <TouchableOpacity
                    onPress={() => setFormData({ ...formData, tasks: [...formData.tasks, ''] })}
                    style={styles.addTaskButton}
                  >
                    <Ionicons name="add-circle-outline" size={20} color={tokens.colors.accent.blue} />
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
                    placeholderTextColor={tokens.colors.text.tertiary}
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
                    placeholderTextColor={tokens.colors.text.tertiary}
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
                    placeholderTextColor={tokens.colors.text.tertiary}
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
                          color={formData.services.includes(service) ? tokens.colors.accent.blue : tokens.colors.text.secondary}
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
    backgroundColor: tokens.colors.surface.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: tokens.colors.accent.blue,
    paddingTop: 50,
    paddingBottom: tokens.space.md,
    paddingHorizontal: tokens.space.md,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    padding: tokens.space.xs,
  },
  headerTitle: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.white,
  },
  headerAction: {
    padding: tokens.space.xs,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: tokens.space.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: tokens.colors.semantic.success,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.elevated,
  },
  list: {
    padding: tokens.space.md,
    paddingBottom: 100,
  },
  card: {
    marginBottom: tokens.space.md,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: tokens.space.sm,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.semantic.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: tokens.space.md,
  },
  activityContent: {
    flex: 1,
  },
  title: {
    fontSize: tokens.type.bodyLarge.fontSize,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.xs,
  },
  goal: {
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.secondary,
    marginTop: tokens.space.sm,
    lineHeight: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: tokens.space.xs / 2,
  },
  date: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
    marginLeft: tokens.space.xs / 2,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: tokens.space.sm,
    gap: tokens.space.xs,
  },
  serviceTag: {
    backgroundColor: tokens.colors.accent[50],
    paddingHorizontal: tokens.space.sm,
    paddingVertical: tokens.space.xs / 2,
    borderRadius: tokens.radius.sm,
  },
  serviceText: {
    fontSize: tokens.type.caption.fontSize,
    color: tokens.colors.accent.blue,
    fontWeight: tokens.typography.fontWeight.medium,
  },
  actions: {
    flexDirection: 'row',
    marginTop: tokens.space.md,
    paddingTop: tokens.space.md,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.light,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: tokens.space.md,
    paddingVertical: tokens.space.xs,
    paddingHorizontal: tokens.space.sm,
  },
  editButtonText: {
    color: tokens.colors.accent.blue,
    marginLeft: tokens.space.xs,
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.typography.fontWeight.medium,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: tokens.space.md,
    paddingVertical: tokens.space.xs,
    paddingHorizontal: tokens.space.sm,
  },
  detailButtonText: {
    color: tokens.colors.semantic.success,
    marginLeft: tokens.space.xs,
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.typography.fontWeight.medium,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.space.xs,
    paddingHorizontal: tokens.space.sm,
  },
  deleteButtonText: {
    color: tokens.colors.semantic.error,
    marginLeft: tokens.space.xs,
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.typography.fontWeight.medium,
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
    backgroundColor: tokens.colors.card.base,
    borderTopLeftRadius: tokens.radius.xl,
    borderTopRightRadius: tokens.radius.xl,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 40 : tokens.space.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: tokens.space.lg,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
  },
  modalTitle: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
  },
  modalScrollView: {
    maxHeight: 500,
    paddingHorizontal: tokens.space.lg,
  },
  inputGroup: {
    marginBottom: tokens.space.md,
  },
  label: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: tokens.colors.border.medium,
    borderRadius: tokens.radius.sm,
    padding: tokens.space.md,
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.primary,
    backgroundColor: tokens.colors.card.base,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: tokens.space.md,
  },
  halfWidth: {
    flex: 1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: tokens.colors.border.medium,
    borderRadius: tokens.radius.sm,
    maxHeight: 150,
    backgroundColor: tokens.colors.card.base,
  },
  pickerScrollView: {
    maxHeight: 150,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.space.md,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border.light,
  },
  pickerOptionSelected: {
    backgroundColor: tokens.colors.accent[50],
  },
  pickerOptionText: {
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.primary,
  },
  pickerOptionTextSelected: {
    color: tokens.colors.accent.blue,
    fontWeight: tokens.typography.fontWeight.semibold,
  },
  helperText: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.secondary,
    fontStyle: 'italic',
    padding: tokens.space.sm,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.space.xs,
    gap: tokens.space.xs,
  },
  taskInput: {
    flex: 1,
  },
  removeTaskButton: {
    padding: tokens.space.xs,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: tokens.space.xs,
    padding: tokens.space.sm,
  },
  addTaskText: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.accent.blue,
    marginLeft: tokens.space.xs,
    fontWeight: tokens.typography.fontWeight.medium,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.space.sm,
  },
  serviceCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.space.sm,
    borderWidth: 1,
    borderColor: tokens.colors.border.medium,
    borderRadius: tokens.radius.sm,
    minWidth: '45%',
  },
  serviceCheckboxSelected: {
    backgroundColor: tokens.colors.accent[50],
    borderColor: tokens.colors.accent.blue,
  },
  serviceCheckboxText: {
    fontSize: tokens.type.sub.fontSize,
    color: tokens.colors.text.primary,
    marginLeft: tokens.space.xs,
  },
  serviceCheckboxTextSelected: {
    color: tokens.colors.accent.blue,
    fontWeight: tokens.typography.fontWeight.medium,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: tokens.space.lg,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.light,
    gap: tokens.space.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: tokens.space.md,
    alignItems: 'center',
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.colors.surface.secondary,
  },
  cancelButtonText: {
    color: tokens.colors.text.secondary,
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.typography.fontWeight.medium,
  },
  saveButton: {
    flex: 1,
    paddingVertical: tokens.space.md,
    alignItems: 'center',
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.colors.semantic.success,
  },
  saveButtonText: {
    color: tokens.colors.text.white,
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.typography.fontWeight.semibold,
  },
  detailsScrollView: {
    maxHeight: 500,
    paddingHorizontal: tokens.space.lg,
  },
  detailSection: {
    marginBottom: tokens.space.lg,
  },
  detailSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.space.sm,
    gap: tokens.space.xs,
  },
  detailSectionTitle: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailGoalCard: {
    backgroundColor: tokens.colors.accent[50],
    borderRadius: tokens.radius.sm,
    padding: tokens.space.md,
    borderLeftWidth: 3,
    borderLeftColor: tokens.colors.accent.blue,
  },
  detailGoalText: {
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.primary,
    lineHeight: 22,
  },
  detailDatesRow: {
    flexDirection: 'row',
    gap: tokens.space.md,
  },
  detailDateCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.surface.secondary,
    borderRadius: tokens.radius.sm,
    padding: tokens.space.md,
    gap: tokens.space.sm,
  },
  detailDateLabel: {
    fontSize: tokens.type.caption.fontSize,
    color: tokens.colors.text.secondary,
  },
  detailDateValue: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
  },
  detailText: {
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.secondary,
    lineHeight: 22,
  },
  detailTaskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: tokens.space.xs,
    gap: tokens.space.sm,
  },
  detailTaskBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.colors.semantic.success,
    marginTop: 8,
  },
  detailServicesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.space.xs,
  },
  detailServiceBadge: {
    backgroundColor: tokens.colors.accent[50],
    paddingHorizontal: tokens.space.sm,
    paddingVertical: tokens.space.xs / 2,
    borderRadius: tokens.radius.sm,
  },
  detailServiceText: {
    fontSize: tokens.type.caption.fontSize,
    color: tokens.colors.accent.blue,
    fontWeight: tokens.typography.fontWeight.medium,
  },
  detailsFooter: {
    padding: tokens.space.lg,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.light,
  },
  detailsCloseButton: {
    paddingVertical: tokens.space.md,
    alignItems: 'center',
    borderRadius: tokens.radius.sm,
    backgroundColor: tokens.colors.semantic.success,
  },
  detailsCloseButtonText: {
    color: tokens.colors.text.white,
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.typography.fontWeight.semibold,
  },
});
