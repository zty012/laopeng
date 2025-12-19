import defaultSystemPrompt from "@/prompts/default.md?raw";
import { OpenAI } from "openai";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

export interface Attachment {
  name: string;
  contentType: string;
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  agentId?: string;
  messages: (OpenAI.ChatCompletionMessageParam & {
    tokens?: number;
    reasoning_content?: string;
    attachments?: Attachment[];
  })[];
  createdAt: Date;
}

interface ConversationContextType {
  conversations: Conversation[];
  currentConversationId: string | null;
  currentMessages: (OpenAI.ChatCompletionMessageParam & {
    tokens?: number;
    reasoning_content?: string;
    attachments?: Attachment[];
  })[];
  createNewConversation: (
    systemPrompt?: string,
    title?: string,
    agentId?: string,
  ) => void;
  selectConversation: (id: string) => void;
  updateCurrentConversation: (
    updater: (prev: Conversation["messages"]) => Conversation["messages"],
  ) => void;
  deleteConversation: (id: string) => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "chatConversations";

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Convert createdAt back to Date
      const convs = parsed.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
      }));
      setConversations(convs);
      if (convs.length > 0) {
        setCurrentConversationId(convs[0].id);
      }
    } else {
      // Create initial conversation
      createNewConversation();
    }
  }, []);

  // Save to localStorage whenever conversations change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  const createNewConversation = (
    systemPrompt?: string,
    title?: string,
    agentId?: string,
  ) => {
    const id = crypto.randomUUID();

    const newConv: Conversation = {
      id,
      title: title || "新对话",
      agentId,
      messages: [
        {
          role: "system",
          content: systemPrompt || defaultSystemPrompt,
        },
      ],
      createdAt: new Date(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConversationId(id);
  };

  const selectConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const updateCurrentConversation = (
    updater: (prev: Conversation["messages"]) => Conversation["messages"],
  ) => {
    if (!currentConversationId) return;
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConversationId
          ? {
              ...conv,
              messages: updater(conv.messages),
              title:
                updater(conv.messages)
                  .find((m) => m.role === "user")
                  ?.content?.toString()
                  .slice(0, 20) || "新对话",
            }
          : conv,
      ),
    );
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== id));
    if (currentConversationId === id) {
      const remaining = conversations.filter((conv) => conv.id !== id);
      setCurrentConversationId(remaining.length > 0 ? remaining[0].id : null);
      if (remaining.length === 0) {
        createNewConversation();
      }
    }
  };

  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId,
  );
  const currentMessages = currentConversation?.messages || [];

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        currentConversationId,
        currentMessages,
        createNewConversation,
        selectConversation,
        updateCurrentConversation,
        deleteConversation,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversations() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error(
      "useConversations must be used within ConversationProvider",
    );
  }
  return context;
}
