import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Conversation, Message } from '../types';
import { DEFAULT_AGENT_ID } from '../lib/agents';

const STORAGE_KEY = 'laopeng_conversations';

function load(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Conversation[]) : [];
  } catch {
    return [];
  }
}

function save(convs: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>(load);
  const [activeId, setActiveId] = useState<string | null>(
    () => load()[0]?.id ?? null
  );

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  const createConversation = useCallback((agentId: string = DEFAULT_AGENT_ID) => {
    const conv: Conversation = {
      id: uuidv4(),
      title: '新对话',
      messages: [],
      agentId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations((prev) => {
      const next = [conv, ...prev];
      save(next);
      return next;
    });
    setActiveId(conv.id);
    return conv;
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        save(next);
        return next;
      });
      setActiveId((prev) => {
        if (prev !== id) return prev;
        const remaining = conversations.filter((c) => c.id !== id);
        return remaining[0]?.id ?? null;
      });
    },
    [conversations]
  );

  const addMessage = useCallback((convId: string, message: Message) => {
    setConversations((prev) => {
      const next = prev.map((c) => {
        if (c.id !== convId) return c;
        const messages = [...c.messages, message];
        // 用第一条用户消息作为标题（截取前 20 字）
        const title =
          c.messages.length === 0 && message.role === 'user'
            ? message.content.slice(0, 20) || '新对话'
            : c.title;
        return { ...c, messages, title, updatedAt: Date.now() };
      });
      save(next);
      return next;
    });
  }, []);

  const updateLastAssistantMessage = useCallback(
    (convId: string, content: string) => {
      setConversations((prev) => {
        const next = prev.map((c) => {
          if (c.id !== convId) return c;
          const messages = [...c.messages];
          const lastIdx = messages.length - 1;
          if (lastIdx >= 0 && messages[lastIdx].role === 'assistant') {
            messages[lastIdx] = { ...messages[lastIdx], content };
          }
          return { ...c, messages, updatedAt: Date.now() };
        });
        save(next);
        return next;
      });
    },
    []
  );

  const renameConversation = useCallback((id: string, title: string) => {
    setConversations((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, title } : c));
      save(next);
      return next;
    });
  }, []);

  const updateConversationAgent = useCallback((id: string, agentId: string) => {
    setConversations((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, agentId, updatedAt: Date.now() } : c));
      save(next);
      return next;
    });
  }, []);

  return {
    conversations,
    activeId,
    activeConversation,
    setActiveId,
    createConversation,
    deleteConversation,
    addMessage,
    updateLastAssistantMessage,
    renameConversation,
    updateConversationAgent,
  };
}
