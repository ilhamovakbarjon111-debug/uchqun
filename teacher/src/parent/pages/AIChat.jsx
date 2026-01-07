import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import api from '../services/api';
import Card from '../components/Card';
import { useToast } from '../context/ToastContext';

const AIChat = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: t('aiChat.welcomeMessage'),
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setLoading(true);

    try {
      const response = await api.post('/parent/ai/chat', {
        message: userMessage,
      });

      if (response.data.success) {
        const aiMessage = {
          role: 'assistant',
          content: response.data.data.response,
          timestamp: response.data.data.timestamp,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: t('aiChat.errorMessage'),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      showToast(t('aiChat.errorToast'), 'error');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-orange-500 rounded-2xl p-6 md:p-8 -mx-4 md:mx-0">
        <div className="flex items-center gap-3 mb-2">
          <Bot className="w-6 h-6 text-white" />
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {t('aiChat.title')}
          </h1>
        </div>
        <p className="text-white/90 text-sm md:text-base">
          {t('aiChat.subtitle')}
        </p>
      </div>

      {/* Chat Container */}
      <Card className="p-0 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}>
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-orange-600" />
                </div>
              )}
              <div
                className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-sm md:text-base whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                <p
                  className={`text-xs mt-2 ${
                    message.role === 'user'
                      ? 'text-orange-100'
                      : 'text-gray-500'
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Bot className="w-5 h-5 text-orange-600" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('aiChat.inputPlaceholder')}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span className="hidden md:inline">{t('aiChat.send')}</span>
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {t('aiChat.footer')}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AIChat;

