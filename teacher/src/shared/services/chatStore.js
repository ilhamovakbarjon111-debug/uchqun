const STORAGE_KEY = 'uchqun-chat-messages';

function key(conversationId) {
  return `${STORAGE_KEY}:${conversationId || 'default'}`;
}

export function loadMessages(conversationId = 'default') {
  try {
    const raw = localStorage.getItem(key(conversationId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function persist(conversationId, messages) {
  localStorage.setItem(key(conversationId), JSON.stringify(messages.slice(-200)));
}

export function addMessage(author, text, conversationId = 'default') {
  const msg = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    author,
    text,
    time: new Date().toISOString(),
    readByParent: author === 'parent',
    readByTeacher: author === 'teacher',
  };
  const current = loadMessages(conversationId);
  const updated = [...current, msg];
  persist(conversationId, updated);
  return updated;
}

export function updateMessage(id, text, conversationId = 'default') {
  const current = loadMessages(conversationId);
  const updated = current.map((m) => (m.id === id ? { ...m, text } : m));
  persist(conversationId, updated);
  return updated;
}

export function deleteMessage(id, conversationId = 'default') {
  const current = loadMessages(conversationId);
  const updated = current.filter((m) => m.id !== id);
  persist(conversationId, updated);
  return updated;
}

export function markRead(conversationId = 'default', role = 'parent') {
  const current = loadMessages(conversationId);
  const updated = current.map((m) => {
    if (role === 'parent') {
      return { ...m, readByParent: true };
    }
    return { ...m, readByTeacher: true };
  });
  persist(conversationId, updated);
  return updated;
}

export function getUnreadCount(conversationId = 'default', role = 'parent') {
  const current = loadMessages(conversationId);
  return current.filter((m) => {
    if (role === 'parent') {
      return m.author !== 'parent' && !m.readByParent;
    }
    return m.author !== 'teacher' && !m.readByTeacher;
  }).length;
}

export function getUnreadTotalForPrefix(prefix = 'parent:', role = 'teacher') {
  const allKeys = Object.keys(localStorage).filter((k) => k.startsWith(`${STORAGE_KEY}:${prefix}`));
  return allKeys.reduce((acc, k) => {
    const convoId = k.replace(`${STORAGE_KEY}:`, '');
    return acc + getUnreadCount(convoId, role);
  }, 0);
}

export function listConversations(prefix = '') {
  return Object.keys(localStorage)
    .filter((k) => k.startsWith(`${STORAGE_KEY}:${prefix}`))
    .map((k) => k.replace(`${STORAGE_KEY}:`, ''));
}

