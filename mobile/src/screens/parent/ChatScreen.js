import React, { useEffect, useState, useRef, useMemo } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { loadMessages, addMessage, markRead, updateMessage, deleteMessage } from '../../services/chatStore';
import tokens from '../../styles/tokens';
import Screen from '../../components/layout/Screen';
import Card from '../../components/common/Card';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

export function ChatScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const conversationId = user?.id ? `parent:${user.id}` : null;
  const [loading, setLoading] = useState(true);
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
    let alive = true;
    let intervalId;

    const load = async () => {
      if (!conversationId) return;
      const msgs = await loadMessages(conversationId);
      if (!alive) return;
      setMessages(Array.isArray(msgs) ? msgs : []);
      await markRead(conversationId);
      if (loading) setLoading(false);
    };

    load();
    intervalId = setInterval(load, 5000);

    return () => {
      alive = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [conversationId]);

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
    if (!conversationId) return;
    await addMessage('parent', trimmed, conversationId);
    justSentRef.current = true;
    const msgs = await loadMessages(conversationId);
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
    if (conversationId) {
      const msgs = await loadMessages(conversationId);
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
    if (conversationId) {
      const msgs = await loadMessages(conversationId);
      setMessages(Array.isArray(msgs) ? msgs : []);
    }
    setBusyId(null);
    setConfirmDeleteId(null);
  };

  const header = (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={[tokens.colors.accent.blue, tokens.colors.accent.blueVibrant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="chatbubbles" size={24} color="#fff" />
          </View>
          <Text style={styles.topBarTitle} allowFontScaling={true}>{t('chat.title') || 'Chat'}</Text>
        </View>
        <View style={styles.placeholder} />
      </LinearGradient>
    </View>
  );

  return (
    <Screen scroll={false} padded={false} header={header}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          ref={messagesWrapRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onScroll={(e) => {
            const el = e.nativeEvent;
            const distance = el.contentSize.height - el.contentOffset.y - el.layoutMeasurement.height;
            setIsAtBottom(distance < 80);
          }}
          scrollEventThrottle={16}
        >
          {loading ? (
            <>
              <Card style={styles.messageCard}>
                <Skeleton width="70%" height={60} />
              </Card>
              <Card style={[styles.messageCard, styles.ownMessageCard]}>
                <Skeleton width="70%" height={60} />
              </Card>
            </>
          ) : sorted.length === 0 ? (
            <Card style={styles.emptyCard}>
              <EmptyState
                icon="chatbubbles-outline"
                title={t('chat.empty') || 'No messages yet'}
                description={t('chat.subtitle') || 'Start a conversation with your child\'s teacher'}
              />
            </Card>
          ) : (
            sorted.map((msg) => {
              const isYou = msg.senderRole === 'parent';
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.messageWrapper,
                    isYou && styles.ownMessageWrapper,
                  ]}
                >
                  <Card 
                    style={[
                      styles.messageBubble,
                      isYou && styles.ownMessageBubble,
                    ]}
                    padding="md"
                    variant={isYou ? "gradient" : "elevated"}
                    gradientColors={isYou ? [tokens.colors.accent.blue, tokens.colors.accent.blueVibrant] : undefined}
                    shadow="soft"
                  >
                    <View style={styles.messageHeader}>
                      <Text style={[styles.messageSender, isYou && styles.ownMessageSender]}>
                        {isYou ? t('chat.you') : t('chat.teacher')}
                      </Text>
                      {isYou && (
                        <View style={styles.messageActions}>
                          <Pressable
                            onPress={() => {
                              setEditingId(msg.id);
                              setEditValue((msg.content || msg.text || '').toString());
                            }}
                            disabled={busyId === msg.id}
                          >
                            <Ionicons name="pencil" size={16} color={isYou ? tokens.colors.text.white : tokens.colors.text.secondary} />
                          </Pressable>
                          <Pressable
                            onPress={() => setConfirmDeleteId(msg.id)}
                            disabled={busyId === msg.id}
                          >
                            <Ionicons name="trash-outline" size={16} color={tokens.colors.text.white} />
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
                      <Text 
                        style={[
                          styles.messageText,
                          isYou && styles.ownMessageText,
                        ]}
                        allowFontScaling={true}
                      >
                        {msg.content || msg.text}
                      </Text>
                    )}
                    {msg.createdAt && (
                      <Text 
                        style={[
                          styles.messageTime,
                          isYou && styles.ownMessageTime,
                        ]}
                        allowFontScaling={true}
                      >
                        {new Date(msg.createdAt || msg.time).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                      </Text>
                    )}
                  </Card>
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

        {/* Input Bar - Enhanced Design */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder={t('chat.placeholder') || 'Type a message...'}
              placeholderTextColor={tokens.colors.text.muted}
              multiline
              maxLength={500}
              allowFontScaling={true}
            />
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
              pressed && styles.sendButtonPressed,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <LinearGradient
              colors={inputText.trim() ? [tokens.colors.accent.blue, tokens.colors.accent.blueVibrant] : [tokens.colors.border.medium, tokens.colors.border.medium]}
              style={styles.sendButtonGradient}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={tokens.colors.text.white}
              />
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

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
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    overflow: 'hidden',
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.space.lg,
    paddingVertical: tokens.space.md,
    paddingTop: tokens.space.xl,
    paddingBottom: tokens.space.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.sm,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: tokens.space.md,
    gap: tokens.space.md,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: '#fff',
  },
  placeholder: {
    width: 44,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: tokens.space.xl,
    paddingBottom: tokens.space.md,
  },
  messageWrapper: {
    alignItems: 'flex-start',
    marginBottom: tokens.space.sm,
  },
  ownMessageWrapper: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
  },
  ownMessageBubble: {
    // Gradient handled by variant prop
  },
  messageCard: {
    marginBottom: tokens.space.sm,
  },
  ownMessageCard: {
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.body.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.xs,
  },
  ownMessageText: {
    color: tokens.colors.text.white,
  },
  messageTime: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.type.sub.fontWeight,
    color: tokens.colors.text.muted,
    alignSelf: 'flex-end',
  },
  ownMessageTime: {
    color: tokens.colors.text.white,
    opacity: 0.8,
  },
  emptyCard: {
    marginTop: tokens.space.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: tokens.space.md,
    paddingBottom: tokens.space.xl,
    backgroundColor: tokens.colors.surface.secondary,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border.light,
    gap: tokens.space.sm,
  },
  inputWrapper: {
    flex: 1,
    ...tokens.shadow.sm,
  },
  input: {
    backgroundColor: tokens.colors.card.base,
    borderRadius: tokens.radius.xl,
    paddingHorizontal: tokens.space.lg,
    paddingVertical: tokens.space.md,
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.primary,
    maxHeight: 100,
    borderWidth: 2,
    borderColor: tokens.colors.border.light,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    ...tokens.shadow.soft,
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.space.xs,
  },
  messageSender: {
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.secondary,
  },
  ownMessageSender: {
    color: tokens.colors.text.white,
    opacity: 0.9,
  },
  messageActions: {
    flexDirection: 'row',
    gap: tokens.space.sm,
  },
  editContainer: {
    marginTop: tokens.space.sm,
  },
  editInput: {
    backgroundColor: tokens.colors.surface.secondary,
    borderRadius: tokens.radius.md,
    padding: tokens.space.sm,
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.primary,
    borderWidth: 1,
    borderColor: tokens.colors.border.light,
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
    fontSize: tokens.type.sub.fontSize,
  },
  editSave: {
    backgroundColor: tokens.colors.accent.blue,
    paddingHorizontal: tokens.space.md,
    paddingVertical: tokens.space.sm,
    borderRadius: tokens.radius.sm,
  },
  editSaveText: {
    color: tokens.colors.text.white,
    fontSize: tokens.type.sub.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
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
    ...tokens.shadow.card,
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
    borderRadius: tokens.radius.xl,
    padding: tokens.space.xl,
    width: '80%',
    maxWidth: 400,
    ...tokens.shadow.lg,
  },
  modalTitle: {
    fontSize: tokens.type.h3.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
    color: tokens.colors.text.primary,
    marginBottom: tokens.space.sm,
  },
  modalText: {
    fontSize: tokens.type.body.fontSize,
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
    fontSize: tokens.type.body.fontSize,
  },
  modalDelete: {
    backgroundColor: tokens.colors.semantic.error,
    paddingHorizontal: tokens.space.lg,
    paddingVertical: tokens.space.sm,
    borderRadius: tokens.radius.sm,
  },
  modalDeleteText: {
    color: tokens.colors.text.white,
    fontSize: tokens.type.body.fontSize,
    fontWeight: tokens.type.h3.fontWeight,
  },
});
