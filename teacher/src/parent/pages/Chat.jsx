import { useState, useMemo, useEffect } from 'react';
import { MessageCircle, Send, Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { loadMessages, addMessage, updateMessage, deleteMessage } from '../../shared/services/chatStore';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const conversationId = user?.id ? `parent:${user.id}` : 'parent';
  const [messages, setMessages] = useState(() => loadMessages(conversationId));
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    setMessages(loadMessages(conversationId));
  }, [conversationId]);

  const sorted = useMemo(
    () => [...messages].sort((a, b) => new Date(a.time) - new Date(b.time)),
    [messages]
  );

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const updated = editingId
      ? updateMessage(editingId, trimmed, conversationId)
      : addMessage('parent', trimmed, conversationId);
    setMessages(updated);
    setInput('');
    setEditingId(null);
  };

  const handleEdit = (msg) => {
    setEditingId(msg.id);
    setInput(msg.text);
  };

  const handleDelete = (id) => {
    const updated = deleteMessage(id, conversationId);
    setMessages(updated);
    if (editingId === id) {
      setEditingId(null);
      setInput('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-orange-100 text-orange-600">
          <MessageCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('chat.title')}</h1>
          <p className="text-gray-500 text-sm">{t('chat.subtitle')}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-[60vh] flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sorted.length === 0 && (
            <div className="text-center text-gray-400 py-8 text-sm">
              {t('chat.empty')}
            </div>
          )}
          {sorted.map((msg) => {
            const isYou = msg.author === 'parent';
            return (
              <div
                key={msg.id}
                className={`flex ${isYou ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    isYou
                      ? 'bg-orange-50 text-orange-900 border border-orange-100'
                      : 'bg-gray-100 text-gray-900 border border-gray-200'
                  }`}
                >
                  <div className="text-xs font-semibold mb-1">
                    {msg.author === 'parent' ? t('chat.you') : t('chat.teacher')}
                  </div>
                  <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                  {isYou && (
                    <div className="flex justify-end gap-2 mt-2 text-xs text-gray-500">
                      <button
                        onClick={() => handleEdit(msg)}
                        className="flex items-center gap-1 hover:text-orange-600"
                        type="button"
                      >
                        <Edit2 className="w-3 h-3" /> {t('chat.edit') || 'Edit'}
                      </button>
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="flex items-center gap-1 hover:text-red-600"
                        type="button"
                      >
                        <Trash2 className="w-3 h-3" /> {t('chat.delete') || 'Delete'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-gray-100 p-3 bg-gray-50 rounded-b-2xl flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chat.placeholder')}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            className="px-4 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {t('chat.send')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;

