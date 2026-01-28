import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, Text, Modal, TextInput, TouchableOpacity, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { teacherService } from '../../services/teacherService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Card from '../../components/common/Card';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import TeacherBackground from '../../components/layout/TeacherBackground';
import theme from '../../styles/theme';

const THERAPY_TYPES = ['speech', 'occupational', 'physical', 'behavioral', 'other'];

export function TherapyScreen() {
  const route = useRoute();
  const { childId, childName } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ type: 'speech', date: '', duration: '', notes: '' });

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getTherapySessions(childId);
      setSessions(data);
    } catch (error) {
      console.error('Error loading therapy sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({ type: 'speech', date: new Date().toISOString().split('T')[0], duration: '', notes: '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.date || !formData.duration) {
      Alert.alert('Error', 'Date and duration are required.');
      return;
    }
    setSaving(true);
    try {
      await teacherService.createTherapySession(childId, {
        ...formData,
        duration: parseInt(formData.duration, 10),
      });
      setShowModal(false);
      loadSessions();
    } catch (error) {
      console.error('Error creating therapy session:', error);
      Alert.alert('Error', 'Failed to create session.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d) => {
    try { return new Date(d).toLocaleDateString(); } catch { return d; }
  };

  const renderSession = ({ item }) => (
    <Card>
      <View style={styles.sessionHeader}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{(item.type || '').charAt(0).toUpperCase() + (item.type || '').slice(1)}</Text>
        </View>
        <Text style={styles.sessionDate}>{formatDate(item.date || item.createdAt)}</Text>
      </View>
      {item.duration != null && (
        <Text style={styles.sessionDuration}>{item.duration} minutes</Text>
      )}
      {item.notes ? <Text style={styles.sessionNotes}>{item.notes}</Text> : null}
    </Card>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <TeacherBackground />
      <ScreenHeader title={`Therapy - ${childName || ''}`} />
      {sessions.length === 0 ? (
        <EmptyState icon="medkit-outline" message="No therapy sessions found" />
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderSession}
          keyExtractor={(item) => (item.id || item._id || Math.random()).toString()}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadSessions}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={handleCreate}>
        <Ionicons name="add" size={28} color={theme.Colors.text.inverse} />
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Session</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={theme.Colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Type</Text>
            <View style={styles.typeSelector}>
              {THERAPY_TYPES.map((t) => (
                <Pressable
                  key={t}
                  style={[styles.typeOption, formData.type === t && styles.typeOptionActive]}
                  onPress={() => setFormData({ ...formData, type: t })}
                >
                  <Text style={[styles.typeOptionText, formData.type === t && styles.typeOptionTextActive]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>Date</Text>
            <TextInput
              style={styles.input}
              value={formData.date}
              onChangeText={(v) => setFormData({ ...formData, date: v })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.Colors.text.tertiary}
            />

            <Text style={styles.inputLabel}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              value={formData.duration}
              onChangeText={(v) => setFormData({ ...formData, duration: v })}
              placeholder="e.g. 30"
              placeholderTextColor={theme.Colors.text.tertiary}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(v) => setFormData({ ...formData, notes: v })}
              placeholder="Optional notes..."
              placeholderTextColor={theme.Colors.text.tertiary}
              multiline
            />

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.saveButton, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
                <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.Colors.background.secondary },
  list: { padding: theme.Spacing.md, paddingBottom: 100 },
  fab: {
    position: 'absolute', bottom: 90, right: theme.Spacing.md,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: theme.Colors.primary.blue,
    alignItems: 'center', justifyContent: 'center',
    ...theme.Colors.shadow.lg,
  },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.Spacing.xs },
  typeBadge: {
    backgroundColor: theme.Colors.primary.blueBg, borderRadius: theme.BorderRadius.sm,
    paddingHorizontal: theme.Spacing.sm, paddingVertical: 2,
  },
  typeBadgeText: { fontSize: theme.Typography.sizes.xs, color: theme.Colors.primary.blue, fontWeight: theme.Typography.weights.semibold },
  sessionDate: { fontSize: theme.Typography.sizes.sm, color: theme.Colors.text.secondary },
  sessionDuration: { fontSize: theme.Typography.sizes.sm, color: theme.Colors.text.secondary, marginBottom: theme.Spacing.xs },
  sessionNotes: { fontSize: theme.Typography.sizes.sm, color: theme.Colors.text.secondary, marginTop: theme.Spacing.xs },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: {
    backgroundColor: theme.Colors.background.card, borderRadius: theme.BorderRadius.lg,
    padding: theme.Spacing.lg, width: '90%', maxHeight: '85%',
    ...theme.Colors.shadow.lg,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.Spacing.md },
  modalTitle: { fontSize: theme.Typography.sizes.xl, fontWeight: theme.Typography.weights.bold, color: theme.Colors.text.primary },
  inputLabel: { fontSize: theme.Typography.sizes.sm, fontWeight: theme.Typography.weights.medium, color: theme.Colors.text.secondary, marginBottom: theme.Spacing.xs, marginTop: theme.Spacing.sm },
  input: {
    borderWidth: 1, borderColor: theme.Colors.border.medium, borderRadius: theme.BorderRadius.sm,
    padding: theme.Spacing.md, fontSize: theme.Typography.sizes.base, color: theme.Colors.text.primary,
    backgroundColor: theme.Colors.background.card,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  typeSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  typeOption: {
    borderWidth: 1, borderColor: theme.Colors.border.medium, borderRadius: theme.BorderRadius.sm,
    paddingHorizontal: theme.Spacing.sm, paddingVertical: 6,
  },
  typeOptionActive: { backgroundColor: theme.Colors.primary.blue, borderColor: theme.Colors.primary.blue },
  typeOptionText: { fontSize: theme.Typography.sizes.sm, color: theme.Colors.text.secondary },
  typeOptionTextActive: { color: theme.Colors.text.inverse, fontWeight: theme.Typography.weights.semibold },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: theme.Spacing.md },
  cancelButton: { paddingHorizontal: theme.Spacing.lg, paddingVertical: theme.Spacing.sm, marginRight: theme.Spacing.md },
  cancelButtonText: { color: theme.Colors.text.secondary, fontSize: theme.Typography.sizes.base, fontWeight: theme.Typography.weights.medium },
  saveButton: {
    backgroundColor: theme.Colors.primary.blue, paddingHorizontal: theme.Spacing.lg,
    paddingVertical: theme.Spacing.sm, borderRadius: theme.BorderRadius.sm,
  },
  saveButtonText: { color: theme.Colors.text.inverse, fontSize: theme.Typography.sizes.base, fontWeight: theme.Typography.weights.semibold },
});
