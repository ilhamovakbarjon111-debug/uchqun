import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import theme from '../../styles/theme';

export function ChatScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    loadMessages();
    // Poll for new messages every 5 seconds
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
        recipientId: 'parent', // This should be determined based on context
        message: inputText,
      });
      setInputText('');
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderMessage = ({ item }) => {
    const isOwn = item.senderId === user?.id;
    return (
      <View
        style={[
          styles.messageContainer,
          isOwn ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        <Text style={[styles.messageText, isOwn && styles.ownMessageText]}>
          {item.message}
        </Text>
        {item.createdAt && (
          <Text style={[styles.messageTime, isOwn && styles.ownMessageTime]}>
            {new Date(item.createdAt).toLocaleTimeString()}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Chat" />
      {messages.length === 0 ? (
        <EmptyState icon="chatbubbles-outline" message="No messages yet" description="Start a conversation" />
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.messagesList}
          inverted
          showsVerticalScrollIndicator={false}
        />
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={theme.Colors.text.tertiary}
          multiline
        />
        <Pressable 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={20} color={theme.Colors.text.inverse} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.Colors.background.secondary,
  },
  messagesList: {
    padding: theme.Spacing.md,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: theme.Spacing.md,
    borderRadius: theme.BorderRadius.md,
    marginBottom: theme.Spacing.sm,
    ...theme.Colors.shadow.sm,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.Colors.primary.blue,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.Colors.background.card,
  },
  messageText: {
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.primary,
    lineHeight: 20,
  },
  ownMessageText: {
    color: theme.Colors.text.inverse,
  },
  messageTime: {
    fontSize: theme.Typography.sizes.xs,
    color: theme.Colors.text.secondary,
    marginTop: theme.Spacing.xs,
  },
  ownMessageTime: {
    color: theme.Colors.text.inverse,
    opacity: 0.8,
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
    borderRadius: 20,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.Colors.shadow.sm,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
