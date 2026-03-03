"use client";

import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Bot } from 'lucide-react';
import { sendMessage, setMermaidCallback } from '../lib/agent';
import { getAgent } from '../lib/agents';
import type { Conversation, Message, MessageAttachment, MermaidState } from '../types';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import MermaidPanel from './MermaidPanel';

interface Props {
  conversation: Conversation | null;
  onAddMessage: (convId: string, message: Message) => void;
  onUpdateLast: (convId: string, content: string, reasoning?: string) => void;
  onNew: () => Conversation;
  initialQuery?: string;
}

export default function ChatWindow({ conversation, onAddMessage, onUpdateLast, onNew, initialQuery }: Props) {
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingReasoning, setStreamingReasoning] = useState('');
  const [mermaidState, setMermaidState] = useState<MermaidState>({
    isOpen: false,
    code: '',
    selectedNodes: [],
  });
  const endRef = useRef<HTMLDivElement>(null);

  // 设置 Mermaid 回调
  useEffect(() => {
    setMermaidCallback((code: string) => {
      setMermaidState(prev => ({
        ...prev,
        isOpen: true,
        code: code,
        selectedNodes: [],
      }));
    });

    // 清理回调
    return () => {
      setMermaidCallback(null);
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages.length, streamingContent]);

  // 处理 Mermaid 节点选择
  const handleNodeSelect = (nodeIds: string[]) => {
    setMermaidState(prev => ({
      ...prev,
      selectedNodes: nodeIds,
    }));
  };

  // 清空节点选择
  const handleClearNodeSelection = () => {
    setMermaidState(prev => ({
      ...prev,
      selectedNodes: [],
    }));
  };

  // 关闭 Mermaid 面板
  const handleCloseMermaid = () => {
    setMermaidState(prev => ({
      ...prev,
      isOpen: false,
      selectedNodes: [],
    }));
  };

  const handleSend = async (text: string, attachments?: MessageAttachment[], selectedNodes?: string[]) => {
    let conv = conversation;
    if (!conv) {
      conv = onNew();
    }

    // 如果有选中的节点，添加到消息内容中
    let content = text;
    if (selectedNodes && selectedNodes.length > 0) {
      const nodesInfo = mermaidState.selectedNodes.map(nodeId => {
        // 尝试从已知的节点中获取标签
        return `- 节点：${nodeId}`;
      }).join('\n');
      
      content = `${text}\n\n[选中的节点]\n${nodesInfo}`;
      
      // 发送后清空选择
      handleClearNodeSelection();
    }

    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      content: content,
      timestamp: Date.now(),
      attachments,
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
    setStreamingReasoning('');

    const allMessages = [...(conv.messages ?? []), userMsg];
    const systemPrompt = getAgent(conv.agentId).systemPrompt;
    let accumulated = '';
    let reasoningAccumulated = '';

    try {
      const result = await sendMessage(
        allMessages,
        systemPrompt,
        (token) => {
          accumulated += token;
          setStreamingContent(accumulated);
          onUpdateLast(conv!.id, accumulated);
        },
        (reasoning) => {
          reasoningAccumulated = reasoning;
          setStreamingReasoning(reasoning);
        }
      );
      
      // 更新最终消息，包含推理过程
      const finalContent = result.content || accumulated;
      const finalReasoning = result.reasoning || reasoningAccumulated;
      
      // 更新最后一条助手消息，包含内容和推理过程
      onUpdateLast(conv.id, finalContent, finalReasoning || undefined);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      onUpdateLast(conv.id, `❌ 请求失败：${msg}`);
    } finally {
      setLoading(false);
      setStreamingContent('');
      setStreamingReasoning('');
    }
  };

  const messages = conversation?.messages ?? [];
  const isStreaming = loading && messages.length > 0 && messages[messages.length - 1].role === 'assistant';

  return (
    <div className="flex flex-row flex-1 h-full overflow-hidden">
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto px-4">
          <div className="py-6 flex flex-col">
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
                <Bot className="size-14 opacity-40" />
                <h2 className="text-lg font-semibold text-foreground">你好，我是老彭</h2>
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
        </div>
        <ChatInput 
          key={conversation?.id ?? 'new'} 
          onSend={handleSend} 
          disabled={loading} 
          initialValue={initialQuery}
          selectedNodeCount={mermaidState.selectedNodes.length}
          onClearNodeSelection={handleClearNodeSelection}
        />
      </div>
      
      {/* Mermaid 面板 */}
      <MermaidPanel
        mermaidCode={mermaidState.code}
        isOpen={mermaidState.isOpen}
        onClose={handleCloseMermaid}
        onNodeSelect={handleNodeSelect}
      />
    </div>
  );
}
