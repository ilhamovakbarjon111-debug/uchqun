import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, Text, Modal, TextInput, TouchableOpacity, Pressable, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { teacherService } from '../../services/teacherService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Card from '../../components/common/Card';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import TeacherBackground from '../../components/layout/TeacherBackground';
import theme from '../../styles/theme';

const EMOTIONAL_STATES = ['happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'tired', 'focused'];

export function EmotionalMonitoringScreen() {
  const route = useRoute();
  const { childId, childName } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedStates, setSelectedStates] = useState([]);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getEmotionalRecords(childId);
      setRecords(data);
    } catch (error) {
      console.error('Error loading emotional records:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleState = (state) => {
    setSelectedStates((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    );
  };

  const handleCreate = () => {
    setSelectedStates([]);
    setNotes('');
    setDate(new Date().toISOString().split('T')[0]);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (selectedStates.length === 0) {
      Alert.alert('Error', 'Please select at least one emotional state.');
      return;
    }
    setSaving(true);
    try {
      await teacherService.createEmotionalRecord(childId, {
        emotionalStates: selectedStates,
        notes,
        date,
      });
      setShowModal(false);
      loadRecords();
    } catch (error) {
      console.error('Error creating emotional record:', error);
      Alert.alert('Error', 'Failed to create record.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return d;
    }
  };

  const renderRecord = ({ item }) => {
    const states = item.emotionalStates || item.emotional_states || [];
    return (
      <Card>
        <Text style={styles.recordDate}>{formatDate(item.date || item.createdAt)}</Text>
        <View style={styles.statesRow}>
          {(Array.isArray(states) ? states : []).map((s) => (
            <View key={s} style={styles.stateBadge}>
              <Text style={styles.stateBadgeText}>{s}</Text>
            </View>
          ))}
        </View>
        {item.notes ? <Text style={styles.recordNotes}>{item.notes}</Text> : null}
      </Card>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <TeacherBackground />
      <ScreenHeader title={`Emotional Monitoring - ${childName || ''}`} />
      {records.length === 0 ? (
        <EmptyState icon="heart-outline" message="No emotional records found" />
      ) : (
        <FlatList
          data={records}
          renderItem={renderRecord}
          keyExtractor={(item) => (item.id || item._id || Math.random()).toString()}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadRecords}
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
              <Text style={styles.modalTitle}>New Record</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={theme.Colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.Colors.text.tertiary}
              />

              <Text style={styles.inputLabel}>Emotional States</Text>
              <View style={styles.checkboxGrid}>
                {EMOTIONAL_STATES.map((state) => (
                  <Pressable key={state} style={styles.checkboxRow} onPress={() => toggleState(state)}>
                    <Ionicons
                      name={selectedStates.includes(state) ? 'checkbox' : 'square-outline'}
                      size={22}
                      color={selectedStates.includes(state) ? theme.Colors.primary.blue : theme.Colors.text.tertiary}
                    />
                    <Text style={styles.checkboxLabel}>{state.charAt(0).toUpperCase() + state.slice(1)}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Optional notes..."
                placeholderTextColor={theme.Colors.text.tertiary}
                multiline
              />
            </ScrollView>

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
  recordDate: {
    fontSize: theme.Typography.sizes.sm, fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.text.secondary, marginBottom: theme.Spacing.xs,
  },
  statesRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.Spacing.xs },
  stateBadge: {
    backgroundColor: theme.Colors.primary.blueBg, borderRadius: theme.BorderRadius.sm,
    paddingHorizontal: theme.Spacing.sm, paddingVertical: 2, marginRight: 6, marginBottom: 4,
  },
  stateBadgeText: { fontSize: theme.Typography.sizes.xs, color: theme.Colors.primary.blue, fontWeight: theme.Typography.weights.medium },
  recordNotes: { fontSize: theme.Typography.sizes.sm, color: theme.Colors.text.secondary, marginTop: theme.Spacing.xs },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: {
    backgroundColor: theme.Colors.background.card, borderRadius: theme.BorderRadius.lg,
    padding: theme.Spacing.lg, width: '90%', maxHeight: '80%',
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
  checkboxGrid: { marginBottom: theme.Spacing.sm },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  checkboxLabel: { fontSize: theme.Typography.sizes.base, color: theme.Colors.text.primary, marginLeft: theme.Spacing.sm },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: theme.Spacing.md },
  cancelButton: { paddingHorizontal: theme.Spacing.lg, paddingVertical: theme.Spacing.sm, marginRight: theme.Spacing.md },
  cancelButtonText: { color: theme.Colors.text.secondary, fontSize: theme.Typography.sizes.base, fontWeight: theme.Typography.weights.medium },
  saveButton: {
    backgroundColor: theme.Colors.primary.blue, paddingHorizontal: theme.Spacing.lg,
    paddingVertical: theme.Spacing.sm, borderRadius: theme.BorderRadius.sm,
  },
  saveButtonText: { color: theme.Colors.text.inverse, fontSize: theme.Typography.sizes.base, fontWeight: theme.Typography.weights.semibold },
});
