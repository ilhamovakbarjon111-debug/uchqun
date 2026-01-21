import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { chatService } from '../../services/chatService';
import tokens from '../../styles/tokens';
import Screen from '../../components/layout/Screen';
import Card from '../../components/common/Card';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

export function ChatScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadMessages = async () => {
    try {
      const data = await chatService.getMessages();
      setMessages(Array.isArray(data) ? data : []);
      if (loading) setLoading(false);
    } catch (error) {
      console.error('Error loading messages:', error);
      if (loading) setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    try {
      await chatService.createMessage({
        recipientId: 'teacher',
        message: inputText,
      });
      setInputText('');
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const header = (
    <View style={styles.topBar}>
      <Pressable
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="arrow-back" size={24} color={tokens.colors.text.primary} />
      </Pressable>
      <Text style={styles.topBarTitle} allowFontScaling={true}>Chat</Text>
      <View style={styles.placeholder} />
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
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
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
          ) : messages.length === 0 ? (
            <Card style={styles.emptyCard}>
              <EmptyState
                icon="chatbubbles-outline"
                title="No messages yet"
                description="Start a conversation with your child's teacher"
              />
            </Card>
          ) : (
            messages.map((item, index) => {
              const isOwn = item.senderId === user?.id;
              return (
                <View
                  key={item.id?.toString() || index}
                  style={[
                    styles.messageWrapper,
                    isOwn && styles.ownMessageWrapper,
                  ]}
                >
                  <Card 
                    style={[
                      styles.messageBubble,
                      isOwn && styles.ownMessageBubble,
                    ]}
                    padding="md"
                  >
                    <Text 
                      style={[
                        styles.messageText,
                        isOwn && styles.ownMessageText,
                      ]}
                      allowFontScaling={true}
                    >
                      {item.message}
                    </Text>
                    {item.createdAt && (
                      <Text 
                        style={[
                          styles.messageTime,
                          isOwn && styles.ownMessageTime,
                        ]}
                        allowFontScaling={true}
                      >
                        {new Date(item.createdAt).toLocaleTimeString('en-US', { 
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
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={tokens.colors.text.muted}
            multiline
            allowFontScaling={true}
          />
          <Pressable
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={inputText.trim() ? tokens.colors.text.white : tokens.colors.text.muted} 
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.space.xl,
    paddingTop: tokens.space.md,
    paddingBottom: tokens.space.md,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: tokens.space.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: tokens.type.h2.fontSize,
    fontWeight: tokens.type.h2.fontWeight,
    color: tokens.colors.text.primary,
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
    backgroundColor: tokens.colors.card.base,
  },
  ownMessageBubble: {
    backgroundColor: tokens.colors.accent.blue,
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
    paddingBottom: tokens.space.lg,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: tokens.colors.card.border,
  },
  input: {
    flex: 1,
    backgroundColor: tokens.colors.card.base,
    borderRadius: tokens.radius.xl,
    paddingHorizontal: tokens.space.md,
    paddingVertical: tokens.space.sm,
    fontSize: tokens.type.body.fontSize,
    color: tokens.colors.text.primary,
    maxHeight: 100,
    marginRight: tokens.space.sm,
    borderWidth: 1,
    borderColor: tokens.colors.card.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.accent.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: tokens.colors.card.border,
  },
});
