import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot } from 'lucide-react';
import { sendMessage } from '../lib/agent';
import { getAgent } from '../lib/agents';
import type { Conversation, Message } from '../types';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

interface Props {
  conversation: Conversation | null;
  onAddMessage: (convId: string, message: Message) => void;
  onUpdateLast: (convId: string, content: string) => void;
  onNew: () => Conversation;
  initialQuery?: string;
}

export default function ChatWindow({ conversation, onAddMessage, onUpdateLast, onNew, initialQuery }: Props) {
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages.length, streamingContent]);

  const handleSend = async (text: string) => {
    let conv = conversation;
    if (!conv) {
      conv = onNew();
    }

    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    onAddMessage(conv.id, userMsg);

    // 占位助手消息
    const assistantMsg: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    onAddMessage(conv.id, assistantMsg);

    setLoading(true);
    setStreamingContent('');

    const allMessages = [...(conv.messages ?? []), userMsg];
    const systemPrompt = getAgent(conv.agentId).systemPrompt;
    let accumulated = '';

    try {
      const final = await sendMessage(allMessages, systemPrompt, (token) => {
        accumulated += token;
        setStreamingContent(accumulated);
        onUpdateLast(conv!.id, accumulated);
      });
      onUpdateLast(conv.id, final || accumulated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      onUpdateLast(conv.id, `❌ 请求失败：${msg}`);
    } finally {
      setLoading(false);
      setStreamingContent('');
    }
  };

  const messages = conversation?.messages ?? [];
  const isStreaming = loading && messages.length > 0 && messages[messages.length - 1].role === 'assistant';

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <ScrollArea className="flex-1 px-4">
        <div className="py-6 flex flex-col">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
              <Bot className="size-14 opacity-40" />
              <h2 className="text-lg font-semibold text-foreground">你好，我是 AI 助手</h2>
              <p className="text-sm">有什么可以帮你的？</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isStreaming={isStreaming && i === messages.length - 1}
            />
          ))}
          <div ref={endRef} />
        </div>
      </ScrollArea>
      <ChatInput key={conversation?.id ?? 'new'} onSend={handleSend} disabled={loading} initialValue={initialQuery} />
    </div>
  );
}
