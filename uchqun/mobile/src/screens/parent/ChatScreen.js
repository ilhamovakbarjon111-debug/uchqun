import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, TextInput, Pressable } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { chatService } from '../../services/chatService';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

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
        recipientId: 'teacher', // This should be determined based on context
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
        <Text style={styles.messageText}>{item.message}</Text>
        {item.createdAt && (
          <Text style={styles.messageTime}>
            {new Date(item.createdAt).toLocaleTimeString()}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.messagesList}
        inverted
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          multiline
        />
        <Pressable style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563eb',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  messageText: {
    fontSize: 14,
    color: '#111827',
  },
  messageTime: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
