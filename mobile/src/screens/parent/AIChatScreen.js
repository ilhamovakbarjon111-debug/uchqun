import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { parentService } from '../../services/parentService';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import theme from '../../styles/theme';

export function AIChatScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage = inputText.trim();
    setInputText('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await parentService.aiChat(userMessage);
      const assistantMessage = response?.advice || response?.message || response?.data?.advice || response?.data?.message || 'No response';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: assistantMessage },
      ]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = error?.response?.data?.error || 
                           error?.response?.data?.message || 
                           error?.message || 
                           'Sorry, I encountered an error. Please try again.';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${errorMessage}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="AI Assistant" />
      <ScrollView 
        style={styles.messagesContainer} 
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && (
          <View style={styles.welcomeContainer}>
            <Ionicons name="sparkles" size={48} color={theme.Colors.primary.blue} />
            <Text style={styles.welcomeText}>Ask me anything about your child's education!</Text>
          </View>
        )}
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              msg.role === 'user' ? styles.userMessage : styles.assistantMessage,
            ]}
          >
            {msg.role === 'assistant' && (
              <Ionicons name="sparkles" size={20} color={theme.Colors.primary.blue} style={styles.aiIcon} />
            )}
            <Text style={[styles.messageText, msg.role === 'user' && styles.userMessageText]}>
              {msg.content}
            </Text>
          </View>
        ))}
        {loading && (
          <View style={styles.loadingContainer}>
            <LoadingSpinner size="small" />
          </View>
        )}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask a question..."
          placeholderTextColor={theme.Colors.text.tertiary}
          multiline
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <Pressable 
          style={({ pressed }) => [
            styles.sendButton, 
            (!inputText.trim() || loading) && styles.sendButtonDisabled,
            pressed && !loading && inputText.trim() && styles.sendButtonPressed
          ]} 
          onPress={sendMessage} 
          disabled={!inputText.trim() || loading}
        >
          {loading ? (
            <LoadingSpinner size="small" color={theme.Colors.text.inverse} />
          ) : (
            <Ionicons name="send" size={20} color={theme.Colors.text.inverse} />
          )}
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
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: theme.Spacing.md,
  },
  welcomeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.Spacing['2xl'],
  },
  welcomeText: {
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.Spacing.md,
    paddingHorizontal: theme.Spacing.lg,
  },
  messageContainer: {
    flexDirection: 'row',
    maxWidth: '85%',
    padding: theme.Spacing.md,
    borderRadius: theme.BorderRadius.md,
    marginBottom: theme.Spacing.md,
    ...theme.Colors.shadow.sm,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.Colors.primary.blue,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.Colors.background.card,
  },
  aiIcon: {
    marginRight: theme.Spacing.sm,
  },
  messageText: {
    fontSize: theme.Typography.sizes.base,
    color: theme.Colors.text.primary,
    flex: 1,
    lineHeight: 20,
  },
  userMessageText: {
    color: theme.Colors.text.inverse,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: theme.Spacing.md,
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
  sendButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});
