import React, { useEffect, useState, useRef, useMemo } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useThemeTokens } from '../../hooks/useThemeTokens';
import { teacherService } from '../../services/teacherService';
import { loadMessages, addMessage, markRead, updateMessage, deleteMessage } from '../../services/chatStore';
import Card from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Screen from '../../components/layout/Screen';

export function ChatScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const tokens = useThemeTokens();
  const styles = getStyles(tokens);
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
      } finally {
        setLoading(false);
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
    // Poll for new messages every 15 seconds (reduced from 5s to prevent performance issues)
    intervalId = setInterval(load, 15000);

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

    // Clear input immediately for better UX
    setInputText('');

    // Optimistically add message to UI
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      content: trimmed,
      senderRole: 'teacher',
      conversationId: convoId,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    setMessages(prev => [...prev, optimisticMessage]);
    justSentRef.current = true;

    // Send to server
    const result = await addMessage('teacher', trimmed, convoId);

    // Replace optimistic message with real one
    if (result) {
      setMessages(prev => prev.map(m => m.id === tempId ? result : m));
    } else {
      // If failed, reload messages to get clean state
      const msgs = await loadMessages(convoId);
      setMessages(Array.isArray(msgs) ? msgs : []);
    }
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

  const header = (
    <View style={styles.header}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.98)', 'rgba(255, 255, 255, 0.95)']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={[styles.headerIconContainer, { backgroundColor: '#22D3EE' + '20' }]}>
            <Ionicons name="chatbubbles" size={20} color="#22D3EE" />
          </View>
          <Text style={[styles.headerTitle, { color: tokens.colors.text.primary }]}>
            {t('chat.title', { defaultValue: 'Chat' })}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F0F9FF', '#E0F2FE', '#BAE6FD']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <Screen scroll={false} padded={false} showAI={false} background="transparent" header={header}>
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
          title={t('chat.selectParent') || 'Please select a parent to start chatting'} 
        />
      ) : (
        <>
          <ScrollView
            ref={messagesWrapRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            onScroll={(e) => {
              const el = e?.nativeEvent;
              if (!el?.contentSize?.height) return;
              const distance = el.contentSize.height - el.contentOffset.y - (el.layoutMeasurement?.height ?? 0);
              setIsAtBottom(distance < 80);
            }}
            scrollEventThrottle={16}
          >
            {sorted.length === 0 ? (
              <EmptyState 
                icon="chatbubbles-outline" 
                title={t('chat.empty') || 'No messages yet'} 
                description={t('chat.subtitle') || 'Start a conversation'}
              />
            ) : (
              sorted.map((msg, index) => {
                const isYou = msg.senderRole === 'teacher';
                const msgKey = msg.id ?? msg._id ?? `msg-${index}`;
                return (
                  <View
                    key={msgKey}
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
                                <Ionicons name="pencil" size={16} color={isYou ? '#fff' : tokens.colors.text.secondary} />
                              </Pressable>
                            )}
                            <Pressable
                              onPress={() => setConfirmDeleteId(msg.id)}
                              disabled={busyId === msg.id}
                            >
                              <Ionicons name="trash-outline" size={16} color={isYou ? '#fff' : tokens.colors.semantic.error} />
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
              <Ionicons name="arrow-down" size={20} color={tokens.colors.text.primary} />
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
                placeholderTextColor={tokens.colors.text.tertiary}
                multiline
                maxLength={500}
              />
              <Pressable
                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                onPress={handleSend}
                disabled={!inputText.trim()}
              >
                <Ionicons name="send" size={20} color={tokens.colors.text.inverse} />
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
      </Screen>
    </View>
  );
}

function getStyles(tokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    backgroundGradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    header: {
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    headerGradient: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 16,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    parentSelector: {
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      padding: tokens.space.md,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(203, 213, 225, 0.3)',
    },
    parentLabel: {
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.medium,
      color: tokens.colors.text.secondary,
      marginBottom: tokens.space.sm,
    },
    parentSelectContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: tokens.space.sm,
    },
    parentOption: {
      paddingHorizontal: tokens.space.md,
      paddingVertical: tokens.space.sm,
      borderRadius: tokens.radius.md,
      borderWidth: 1,
      borderColor: 'rgba(203, 213, 225, 0.5)',
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
    },
    parentOptionActive: {
      backgroundColor: '#22D3EE',
      borderColor: '#22D3EE',
    },
    parentOptionText: {
      fontSize: tokens.typography.fontSize.sm,
      color: tokens.colors.text.primary,
    },
    parentOptionTextActive: {
      color: tokens.colors.text.inverse,
    },
    messagesContainer: {
      flex: 1,
    },
    messagesContent: {
      padding: tokens.space.md,
      paddingBottom: tokens.space.md,
    },
    messageRow: {
      alignItems: 'flex-start',
      marginBottom: tokens.space.md,
    },
    ownMessageRow: {
      alignItems: 'flex-end',
    },
    messageBubble: {
      maxWidth: '85%',
      padding: tokens.space.md,
      borderRadius: tokens.radius.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    ownMessageBubble: {
      backgroundColor: '#22D3EE',
      borderBottomRightRadius: tokens.radius.xs,
    },
    otherMessageBubble: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderBottomLeftRadius: tokens.radius.xs,
    },
    messageHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: tokens.space.xs,
    },
    messageSender: {
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.text.secondary,
    },
    messageActions: {
      flexDirection: 'row',
      gap: tokens.space.sm,
    },
    messageText: {
      fontSize: tokens.typography.fontSize.base,
      color: tokens.colors.text.primary,
      lineHeight: 20,
    },
    ownMessageText: {
      color: tokens.colors.text.inverse,
    },
    editContainer: {
      marginTop: tokens.space.sm,
    },
    editInput: {
      backgroundColor: tokens.colors.background.secondary,
      borderRadius: tokens.radius.md,
      padding: tokens.space.sm,
      fontSize: tokens.typography.fontSize.base,
      color: tokens.colors.text.primary,
      borderWidth: 1,
      borderColor: tokens.colors.border.medium,
      minHeight: 60,
      textAlignVertical: 'top',
    },
    editActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: tokens.space.sm,
      marginTop: tokens.space.sm,
    },
    editCancel: {
      paddingHorizontal: tokens.space.md,
      paddingVertical: tokens.space.sm,
    },
    editCancelText: {
      color: tokens.colors.text.secondary,
      fontSize: tokens.typography.fontSize.sm,
    },
    editSave: {
      backgroundColor: tokens.colors.accent.blue,
      paddingHorizontal: tokens.space.md,
      paddingVertical: tokens.space.sm,
      borderRadius: tokens.radius.sm,
    },
    editSaveText: {
      color: tokens.colors.text.inverse,
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.semibold,
    },
    scrollToBottom: {
      position: 'absolute',
      bottom: 80,
      right: tokens.space.md,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: tokens.colors.card.base,
      alignItems: 'center',
      justifyContent: 'center',
      ...tokens.shadow.soft,
    },
    inputContainer: {
      flexDirection: 'row',
      padding: tokens.space.md,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderTopWidth: 1,
      borderTopColor: 'rgba(203, 213, 225, 0.3)',
      alignItems: 'flex-end',
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: 'rgba(203, 213, 225, 0.5)',
      borderRadius: tokens.radius.xl,
      paddingHorizontal: tokens.space.md,
      paddingVertical: tokens.space.sm,
      marginRight: tokens.space.sm,
      maxHeight: 100,
      fontSize: tokens.typography.fontSize.base,
      color: tokens.colors.text.primary,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    sendButton: {
      backgroundColor: '#22D3EE',
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 3,
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
      backgroundColor: tokens.colors.card.base,
      borderRadius: tokens.radius.lg,
      padding: tokens.space.lg,
      width: '80%',
      maxWidth: 400,
      ...tokens.shadow.card,
    },
    modalTitle: {
      fontSize: tokens.typography.fontSize.lg,
      fontWeight: tokens.typography.fontWeight.bold,
      color: tokens.colors.text.primary,
      marginBottom: tokens.space.sm,
    },
    modalText: {
      fontSize: tokens.typography.fontSize.base,
      color: tokens.colors.text.secondary,
      marginBottom: tokens.space.lg,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: tokens.space.md,
    },
    modalCancel: {
      paddingHorizontal: tokens.space.lg,
      paddingVertical: tokens.space.sm,
    },
    modalCancelText: {
      color: tokens.colors.text.secondary,
      fontSize: tokens.typography.fontSize.base,
    },
    modalDelete: {
      backgroundColor: tokens.colors.semantic.error,
      paddingHorizontal: tokens.space.lg,
      paddingVertical: tokens.space.sm,
      borderRadius: tokens.radius.sm,
    },
    modalDeleteText: {
      color: tokens.colors.text.inverse,
      fontSize: tokens.typography.fontSize.base,
      fontWeight: tokens.typography.fontWeight.semibold,
    },
  });
}
