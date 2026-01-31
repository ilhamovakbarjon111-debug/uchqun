import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import tokens from '../../styles/tokens';
import { parentService } from '../../services/parentService';

const QUICK_PROMPTS = [
  { emoji: '📊', text: "How is my child doing today?" },
  { emoji: '🍎', text: "What did my child eat?" },
  { emoji: '🎨', text: "What activities were done?" },
  { emoji: '💡', text: "Any tips for me?" },
];

export default function FloatingAI({ contextHint = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Uchi, your AI helper! 🌟 Ask me anything about your child's day!",
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  // Elegant pulse and glow animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Open/close animation
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isOpen ? 1 : 0,
        useNativeDriver: true,
        damping: 15,
        stiffness: 150,
      }),
      Animated.timing(rotateAnim, {
        toValue: isOpen ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOpen]);

  const handleSend = async (text = inputText) => {
    const messageToSend = text.trim();
    if (!messageToSend || loading) return;

    setInputText('');
    setMessages(prev => [...prev, { role: 'user', content: messageToSend }]);
    setLoading(true);

    try {
      const fullMessage = contextHint
        ? `Context: ${contextHint}\n\nQuestion: ${messageToSend}`
        : messageToSend;

      const response = await parentService.aiChat(fullMessage);
      const aiMessage = response?.advice || response?.message || response?.data?.advice || "I'm thinking... 🤔";

      setMessages(prev => [...prev, { role: 'assistant', content: aiMessage }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Oops! Something went wrong. Try again? 🔄"
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <>
      {/* Floating Button - Elegant Orb Design */}
      <Animated.View style={[styles.fabContainer, { transform: [{ scale: pulseAnim }] }]}>
        <Pressable
          onPress={() => setIsOpen(true)}
          style={({ pressed }) => [
            styles.fabPressable,
            pressed && { transform: [{ scale: 0.95 }] }
          ]}
        >
          {/* Outer glow ring */}
          <View style={styles.glowRing}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.3)', 'rgba(99, 102, 241, 0.2)', 'rgba(59, 130, 246, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.glowGradient}
            />
          </View>
          {/* Main orb */}
          <LinearGradient
            colors={['#A78BFA', '#8B5CF6', '#6366F1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <Ionicons name="sparkles" size={22} color="#FFFFFF" />
          </LinearGradient>
        </Pressable>
      </Animated.View>

      {/* Chat Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)} />

          <Animated.View
            style={[
              styles.chatContainer,
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            {/* Header */}
            <LinearGradient
              colors={['#8B5CF6', '#6366F1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.header}
            >
              <View style={styles.headerContent}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarEmoji}>🤖</Text>
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.headerTitle}>Uchi AI Assistant</Text>
                  <Text style={styles.headerSubtitle}>Always here to help! ✨</Text>
                </View>
              </View>
              <Pressable onPress={() => setIsOpen(false)} style={styles.closeButton}>
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <Ionicons name="close" size={24} color="#fff" />
                </Animated.View>
              </Pressable>
            </LinearGradient>

            {/* Quick Prompts */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.promptsScroll}
              contentContainerStyle={styles.promptsContainer}
            >
              {QUICK_PROMPTS.map((prompt, index) => (
                <Pressable
                  key={index}
                  style={styles.promptChip}
                  onPress={() => handleSend(prompt.text)}
                >
                  <Text style={styles.promptEmoji}>{prompt.emoji}</Text>
                  <Text style={styles.promptText} numberOfLines={1}>{prompt.text}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Messages */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((msg, index) => (
                <View
                  key={index}
                  style={[
                    styles.messageBubble,
                    msg.role === 'user' ? styles.userBubble : styles.aiBubble,
                  ]}
                >
                  {msg.role === 'assistant' && (
                    <Text style={styles.messageAvatar}>🤖</Text>
                  )}
                  <View style={[
                    styles.messageContent,
                    msg.role === 'user' ? styles.userContent : styles.aiContent,
                  ]}>
                    <Text style={[
                      styles.messageText,
                      msg.role === 'user' && styles.userText,
                    ]}>
                      {msg.content}
                    </Text>
                  </View>
                </View>
              ))}
              {loading && (
                <View style={[styles.messageBubble, styles.aiBubble]}>
                  <Text style={styles.messageAvatar}>🤖</Text>
                  <View style={[styles.messageContent, styles.aiContent, styles.typingIndicator]}>
                    <ActivityIndicator size="small" color={tokens.colors.accent.blue} />
                    <Text style={styles.typingText}>Thinking...</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask me anything... 💭"
                placeholderTextColor={tokens.colors.text.muted}
                multiline
                maxLength={500}
              />
              <Pressable
                style={[
                  styles.sendButton,
                  (!inputText.trim() || loading) && styles.sendButtonDisabled,
                ]}
                onPress={() => handleSend()}
                disabled={!inputText.trim() || loading}
              >
                <LinearGradient
                  colors={inputText.trim() && !loading
                    ? ['#8B5CF6', '#6366F1']
                    : ['#E2E8F0', '#CBD5E1']}
                  style={styles.sendButtonGradient}
                >
                  <Ionicons
                    name="paper-plane"
                    size={20}
                    color={inputText.trim() && !loading ? '#fff' : '#94A3B8'}
                  />
                </LinearGradient>
              </Pressable>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 90,
    right: 18,
    zIndex: 1000,
  },
  fabPressable: {
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    top: -8,
    left: -8,
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.glow,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  chatContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '75%',
    overflow: 'hidden',
    ...tokens.shadow.elevated,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptsScroll: {
    maxHeight: 50,
    backgroundColor: '#F8FAFC',
  },
  promptsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: tokens.colors.accent[100],
    marginRight: 8,
    ...tokens.shadow.xs,
  },
  promptEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  promptText: {
    fontSize: 13,
    color: tokens.colors.text.secondary,
    fontWeight: '500',
    maxWidth: 140,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  aiBubble: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    fontSize: 24,
    marginRight: 8,
    marginBottom: 4,
  },
  messageContent: {
    maxWidth: '75%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userContent: {
    backgroundColor: tokens.colors.accent.blue,
    borderBottomRightRadius: 6,
    marginLeft: 'auto',
  },
  aiContent: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 6,
    ...tokens.shadow.sm,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: tokens.colors.text.primary,
  },
  userText: {
    color: '#fff',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  typingText: {
    fontSize: 14,
    color: tokens.colors.text.muted,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: tokens.colors.text.primary,
  },
  sendButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
});
