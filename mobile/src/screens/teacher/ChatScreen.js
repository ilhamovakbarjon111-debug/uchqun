import React, { useEffect, useState, useRef, useMemo } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { teacherService } from '../../services/teacherService';
import { loadMessages, addMessage, markRead, updateMessage, deleteMessage } from '../../services/chatStore';
import { api } from '../../services/api';
import theme from '../../styles/theme';
import Card from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import TeacherBackground from '../../components/layout/TeacherBackground';

export function ChatScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [parents, setParents] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesWrapRef = useRef(null);
  const justSentRef = useRef(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    const fetchParents = async () => {
      try {
        const parentsData = await teacherService.getParents();
        const list = Array.isArray(parentsData) ? parentsData.filter(
          (p) => !user?.id || p.teacherId === user.id
        ) : [];
        setParents(list);
        if (list.length > 0 && !selectedParent) {
          setSelectedParent(list[0]);
        }
      } catch (err) {
        console.error('Failed to load parents for chat', err);
      }
    };
    fetchParents();
  }, [user?.id]);

  useEffect(() => {
    let alive = true;
    let intervalId;

    const load = async () => {
      if (!selectedParent) return;
      const convoId = `parent:${selectedParent.id}`;
      const msgs = await loadMessages(convoId);
      if (!alive) return;
      setMessages(Array.isArray(msgs) ? msgs : []);
      await markRead(convoId);
      if (loading) setLoading(false);
    };

    load();
    intervalId = setInterval(load, 5000);

    return () => {
      alive = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedParent]);

  const sorted = useMemo(
    () =>
      [...messages].sort(
        (a, b) => new Date(a.createdAt || a.time) - new Date(b.createdAt || b.time)
      ),
    [messages]
  );

  useEffect(() => {
    if (isAtBottom || justSentRef.current) {
      messagesWrapRef.current?.scrollToEnd({ animated: true });
      justSentRef.current = false;
    }
  }, [sorted.length, isAtBottom]);

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    if (!selectedParent) {
      Alert.alert(t('common.error'), t('chat.selectParent') || 'Please select a parent');
      return;
    }
    const convoId = `parent:${selectedParent.id}`;
    await addMessage('teacher', trimmed, convoId);
    justSentRef.current = true;
    const msgs = await loadMessages(convoId);
    setMessages(Array.isArray(msgs) ? msgs : []);
    setInputText('');
  };

  const handleSaveEdit = async (msgId) => {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    setBusyId(msgId);
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, content: trimmed } : m))
    );
    const updated = await updateMessage(msgId, trimmed);
    if (!updated) {
      Alert.alert(t('common.error'), t('chat.errorUpdate') || 'Failed to update message');
    }
    if (selectedParent) {
      const convoId = `parent:${selectedParent.id}`;
      const msgs = await loadMessages(convoId);
      setMessages(Array.isArray(msgs) ? msgs : []);
    }
    setEditingId(null);
    setEditValue('');
    setBusyId(null);
  };

  const handleDelete = async (msgId) => {
    setBusyId(msgId);
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    const res = await deleteMessage(msgId);
    if (!res?.success) {
      Alert.alert(t('common.error'), t('chat.errorDelete') || 'Failed to delete message');
    }
    if (selectedParent) {
      const convoId = `parent:${selectedParent.id}`;
      const msgs = await loadMessages(convoId);
      setMessages(Array.isArray(msgs) ? msgs : []);
    }
    setBusyId(null);
    setConfirmDeleteId(null);
  };

  if (loading && parents.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <TeacherBackground />
      <ScreenHeader title={t('chat.title') || 'Chat'} />
      
      {/* Parent selector - Like website */}
      {parents.length > 0 && (
        <View style={styles.parentSelector}>
          <Text style={styles.parentLabel}>{t('chat.parent') || 'Parent'}:</Text>
          <View style={styles.parentSelectContainer}>
            {parents.map((p) => (
              <Pressable
                key={p.id}
                style={[
                  styles.parentOption,
                  selectedParent?.id === p.id && styles.parentOptionActive,
                ]}
                onPress={() => setSelectedParent(p)}
              >
                <Text
                  style={[
                    styles.parentOptionText,
                    selectedParent?.id === p.id && styles.parentOptionTextActive,
                  ]}
                >
                  {p.firstName} {p.lastName}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {!selectedParent ? (
        <EmptyState 
          icon="people-outline" 
          message={t('chat.selectParent') || 'Please select a parent to start chatting'} 
        />
      ) : (
        <>
          <ScrollView
            ref={messagesWrapRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            onScroll={(e) => {
              const el = e.nativeEvent;
              const distance = el.contentSize.height - el.contentOffset.y - el.layoutMeasurement.height;
              setIsAtBottom(distance < 80);
            }}
            scrollEventThrottle={16}
          >
            {sorted.length === 0 ? (
              <EmptyState 
                icon="chatbubbles-outline" 
                message={t('chat.empty') || 'No messages yet'} 
                description={t('chat.subtitle') || 'Start a conversation'}
              />
            ) : (
              sorted.map((msg) => {
                const isYou = msg.senderRole === 'teacher';
                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageRow,
                      isYou && styles.ownMessageRow,
                    ]}
                  >
                    <View
                      style={[
                        styles.messageBubble,
                        isYou ? styles.ownMessageBubble : styles.otherMessageBubble,
                      ]}
                    >
                      <View style={styles.messageHeader}>
                        <Text style={styles.messageSender}>
                          {isYou ? t('chat.you') : t('chat.parent')}
                        </Text>
                        {(isYou || user?.role === 'teacher' || user?.role === 'admin') && (
                          <View style={styles.messageActions}>
                            {isYou && (
                              <Pressable
                                onPress={() => {
                                  setEditingId(msg.id);
                                  setEditValue((msg.content || msg.text || '').toString());
                                }}
                                disabled={busyId === msg.id}
                              >
                                <Ionicons name="pencil" size={16} color={isYou ? '#fff' : theme.Colors.text.secondary} />
                              </Pressable>
                            )}
                            <Pressable
                              onPress={() => setConfirmDeleteId(msg.id)}
                              disabled={busyId === msg.id}
                            >
                              <Ionicons name="trash-outline" size={16} color={isYou ? '#fff' : theme.Colors.status.error} />
                            </Pressable>
                          </View>
                        )}
                      </View>

                      {editingId === msg.id ? (
                        <View style={styles.editContainer}>
                          <TextInput
                            style={styles.editInput}
                            value={editValue}
                            onChangeText={setEditValue}
                            multiline
                          />
                          <View style={styles.editActions}>
                            <Pressable
                              style={styles.editCancel}
                              onPress={() => {
                                setEditingId(null);
                                setEditValue('');
                              }}
                            >
                              <Text style={styles.editCancelText}>{t('common.cancel') || 'Cancel'}</Text>
                            </Pressable>
                            <Pressable
                              style={styles.editSave}
                              onPress={() => handleSaveEdit(msg.id)}
                              disabled={!editValue.trim() || busyId === msg.id}
                            >
                              <Text style={styles.editSaveText}>{t('common.save') || 'Save'}</Text>
                            </Pressable>
                          </View>
                        </View>
                      ) : (
                        <Text style={[styles.messageText, isYou && styles.ownMessageText]}>
                          {msg.content || msg.text}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })
            )}
            <View ref={messagesEndRef} />
          </ScrollView>

          {!isAtBottom && sorted.length > 0 && (
            <Pressable
              style={styles.scrollToBottom}
              onPress={() => messagesWrapRef.current?.scrollToEnd({ animated: true })}
            >
              <Ionicons name="arrow-down" size={20} color={theme.Colors.text.primary} />
            </Pressable>
          )}

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder={t('chat.placeholder') || 'Write a message...'}
                placeholderTextColor={theme.Colors.text.tertiary}
                multiline
                maxLength={500}
              />
              <Pressable
                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                onPress={handleSend}
                disabled={!inputText.trim()}
              >
                <Ionicons name="send" size={20} color={theme.Colors.text.inverse} />
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </>
      )}

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('chat.delete') || 'Delete'}</Text>
            <Text style={styles.modalText}>{t('chat.confirmDelete') || 'Delete this message?'}</Text>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancel}
                onPress={() => setConfirmDeleteId(null)}
              >
                <Text style={styles.modalCancelText}>{t('common.cancel') || 'Cancel'}</Text>
              </Pressable>
              <Pressable
                style={styles.modalDelete}
                onPress={() => handleDelete(confirmDeleteId)}
                disabled={busyId === confirmDeleteId}
              >
                <Text style={styles.modalDeleteText}>{t('chat.delete') || 'Delete'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.Colors.background.secondary,
  },
  parentSelector: {
    backgroundColor: theme.Colors.background.card,
    padding: theme.Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.Colors.border.light,
  },
  parentLabel: {
    fontSize: theme.Typography.sizes.sm,
    fontWeight: theme.Typography.weights.medium,
    color: theme.Colors.text.secondary,
    marginBottom: theme.Spacing.sm,
  },
  parentSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.Spacing.sm,
  },
  parentOption: {
    paddingHorizontal: theme.Spacing.md,
    paddingVertical: theme.Spacing.sm,
    borderRadius: theme.BorderRadius.md,
    borderWidth: 1,
    borderColor: theme.Colors.border.medium,
    backgroundColor: theme.Colors.background.secondary,
  },
  parentOptionActive: {
    backgroundColor: theme.Colors.primary.blue,
    borderColor: theme.Colors.primary.blue,
  },
  parentOptionText: {
    fontSize: theme.Typography.sizes.sm,
    color: theme.Colors.text.primary,
  },
  parentOptionTextActive: {
    color: theme.Colors.text.inverse,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: theme.Spacing.md,
    paddingBottom: theme.Spacing.md,
  },
  messageRow: {
    alignItems: 'flex-start',
    marginBottom: theme.Spacing.md,
  },
  ownMessageRow: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: theme.Spacing.md,
    borderRadius: theme.BorderRadius.lg,
    ...theme.Colors.shadow.sm,
  },
  ownMessageBubble: {
    backgroundColor: theme.Colors.primary.blue,
    borderBottomRightRadius: theme.BorderRadius.xs,
  },
  otherMessageBubble: {
    backgroundColor: theme.Colors.background.card,
    borderBottomLeftRadius: theme.BorderRadius.xs,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.Spacing.xs,
  },
  messageSender: {
    fontSize: theme.Typography.sizes.xs,
    fontWeight: theme.Typography.weights.semibold,
    color: theme.Colors.text.secondary,
  },
  messageActions: {
    flexDirection: 'row',
    gap: theme.Spacing.sm,
  },
  messageText: {
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.primary,
    lineHeight: 20,
  },
  ownMessageText: {
    color: theme.Colors.text.inverse,
  },
  editContainer: {
    marginTop: theme.Spacing.sm,
  },
  editInput: {
    backgroundColor: theme.Colors.background.secondary,
    borderRadius: theme.BorderRadius.md,
    padding: theme.Spacing.sm,
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.primary,
    borderWidth: 1,
    borderColor: theme.Colors.border.medium,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.Spacing.sm,
    marginTop: theme.Spacing.sm,
  },
  editCancel: {
    paddingHorizontal: theme.Spacing.md,
    paddingVertical: theme.Spacing.sm,
  },
  editCancelText: {
    color: theme.Colors.text.secondary,
    fontSize: theme.Typography.sizes.sm,
  },
  editSave: {
    backgroundColor: theme.Colors.primary.blue,
    paddingHorizontal: theme.Spacing.md,
    paddingVertical: theme.Spacing.sm,
    borderRadius: theme.BorderRadius.sm,
  },
  editSaveText: {
    color: theme.Colors.text.inverse,
    fontSize: theme.Typography.sizes.sm,
    fontWeight: theme.Typography.weights.semibold,
  },
  scrollToBottom: {
    position: 'absolute',
    bottom: 80,
    right: theme.Spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.Colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.Colors.shadow.md,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: theme.Spacing.md,
    backgroundColor: theme.Colors.background.card,
    borderTopWidth: 1,
    borderTopColor: theme.Colors.border.light,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.Colors.border.medium,
    borderRadius: theme.BorderRadius.xl,
    paddingHorizontal: theme.Spacing.md,
    paddingVertical: theme.Spacing.sm,
    marginRight: theme.Spacing.sm,
    maxHeight: 100,
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.primary,
    backgroundColor: theme.Colors.background.secondary,
  },
  sendButton: {
    backgroundColor: theme.Colors.primary.blue,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.Colors.shadow.sm,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: theme.Colors.background.card,
    borderRadius: theme.BorderRadius.lg,
    padding: theme.Spacing.lg,
    width: '80%',
    maxWidth: 400,
    ...theme.Colors.shadow.lg,
  },
  modalTitle: {
    fontSize: theme.Typography.sizes.lg,
    fontWeight: theme.Typography.weights.bold,
    color: theme.Colors.text.primary,
    marginBottom: theme.Spacing.sm,
  },
  modalText: {
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.secondary,
    marginBottom: theme.Spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.Spacing.md,
  },
  modalCancel: {
    paddingHorizontal: theme.Spacing.lg,
    paddingVertical: theme.Spacing.sm,
  },
  modalCancelText: {
    color: theme.Colors.text.secondary,
    fontSize: theme.Typography.sizes.base,
  },
  modalDelete: {
    backgroundColor: theme.Colors.status.error,
    paddingHorizontal: theme.Spacing.lg,
    paddingVertical: theme.Spacing.sm,
    borderRadius: theme.BorderRadius.sm,
  },
  modalDeleteText: {
    color: theme.Colors.text.inverse,
    fontSize: theme.Typography.sizes.base,
    fontWeight: theme.Typography.weights.semibold,
  },
});
