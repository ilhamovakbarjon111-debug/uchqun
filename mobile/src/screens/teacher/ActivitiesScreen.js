import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, Pressable, Modal, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { activityService } from '../../services/activityService';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import theme from '../../styles/theme';

export function ActivitiesScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    childId: '',
  });

  useEffect(() => {
    loadActivities();
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

  const handleCreate = () => {
    setEditingActivity(null);
    setFormData({ title: '', description: '', childId: '' });
    setShowModal(true);
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setFormData({
      title: activity.title || '',
      description: activity.description || '',
      childId: activity.childId || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingActivity) {
        await activityService.updateActivity(editingActivity.id, formData);
      } else {
        await activityService.createActivity(formData);
      }
      setShowModal(false);
      loadActivities();
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await activityService.deleteActivity(id);
      loadActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderActivity = ({ item }) => (
    <Card>
      <View style={styles.activityHeader}>
        <View style={styles.activityIconContainer}>
          <Ionicons name="clipboard" size={24} color={theme.Colors.cards.activities} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.title}>{item.title || item.skill || 'Activity'}</Text>
          {item.date && (
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={14} color={theme.Colors.text.secondary} />
              <Text style={styles.date}>{item.date}</Text>
            </View>
          )}
        </View>
      </View>
      {item.description && <Text style={styles.description}>{item.description}</Text>}
      {item.goal && <Text style={styles.goal}>Goal: {item.goal}</Text>}
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.Colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activities</Text>
        <TouchableOpacity onPress={handleCreate} style={styles.headerAction}>
          <Ionicons name="add" size={24} color={theme.Colors.text.inverse} />
        </TouchableOpacity>
      </View>

      {activities.length === 0 ? (
        <EmptyState icon="clipboard-outline" message="No activities found" />
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

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingActivity ? 'Edit Activity' : 'Create Activity'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={theme.Colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Title"
              placeholderTextColor={theme.Colors.text.tertiary}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              placeholderTextColor={theme.Colors.text.tertiary}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
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
  goal: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.secondary,
    fontStyle: 'italic',
    marginTop: theme.Spacing.xs,
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
    backgroundColor: theme.Colors.cards.activities,
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
