"use client";

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, BrainCircuit, Wrench } from 'lucide-react';
import type { Message } from '../types';

interface Props {
  message: Message;
  isStreaming?: boolean;
}

export default function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === 'user';
  const [showReasoning, setShowReasoning] = useState(false);
  const [showToolCalls, setShowToolCalls] = useState(false);
  const hasReasoning = message.reasoning && message.reasoning.length > 0;
  
  // 提取工具调用信息
  const toolCallMatches = message.reasoning?.match(/\*\*思考步骤 \d+\*\*: 调用工具 `([^`]+)`\n参数：```json\n([\s\S]*?)\n```/g) || [];
  const hasToolCalls = toolCallMatches.length > 0;

  return (
    <div className={`flex gap-3 mb-5 ${
      isUser ? 'flex-row-reverse' : 'flex-row'
    }`}>
      <Avatar className="size-8 shrink-0">
        {!isUser && (
          <AvatarImage 
            src="/laopeng.jpg" 
            alt="AI"
          />
        )}
        <AvatarFallback className={isUser
          ? 'bg-primary text-primary-foreground text-xs'
          : 'bg-muted text-muted-foreground text-xs'
        }>
          {isUser ? '你' : 'AI'}
        </AvatarFallback>
      </Avatar>

      <div className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
        isUser
          ? 'bg-primary text-primary-foreground rounded-tr-sm'
          : 'bg-muted text-foreground rounded-tl-sm'
      }`}>
        {isUser ? (
          <div className="flex flex-col gap-2">
            {/* 显示图片附件 */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {message.attachments.map((att, idx) => (
                  <img
                    key={idx}
                    src={att.url}
                    alt="上传的图片"
                    className="max-w-full h-auto max-h-64 rounded-lg object-contain bg-background/10"
                  />
                ))}
              </div>
            )}
            {/* 显示文本内容 */}
            {message.content && (
              <p className="m-0 whitespace-pre-wrap">{message.content}</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* 工具调用显示 */}
            {hasToolCalls && (
              <div className="mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowToolCalls(!showToolCalls)}
                  className="h-7 px-2 text-xs text-primary hover:text-primary"
                >
                  <Wrench className="size-3.5 mr-1.5" />
                  {showToolCalls ? '隐藏工具调用' : '查看工具调用'}
                  {showToolCalls ? <ChevronUp className="size-3 ml-1" /> : <ChevronDown className="size-3 ml-1" />}
                  <span className="ml-1 text-muted-foreground">({toolCallMatches.length})</span>
                </Button>
                {showToolCalls && (
                  <div className="mt-2 space-y-2">
                    {toolCallMatches.map((call, idx) => {
                      const nameMatch = call.match(/调用工具 `([^`]+)`/);
                      const argsMatch = call.match(/参数：```json\n([\s\S]*?)\n```/);
                      const toolName = nameMatch?.[1] || '未知工具';
                      const toolArgs = argsMatch?.[1] || '';
                      
                      return (
                        <div key={idx} className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-2 mb-2">
                            <Wrench className="size-3.5 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                              工具 {idx + 1}: {toolName}
                            </span>
                          </div>
                          <pre className="text-xs text-blue-700 dark:text-blue-400 overflow-x-auto bg-white/50 dark:bg-black/20 p-2 rounded">
                            {toolArgs}
                          </pre>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            
            {/* 推理过程折叠面板 */}
            {hasReasoning && (
              <div className="mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReasoning(!showReasoning)}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <BrainCircuit className="size-3.5 mr-1.5" />
                  {showReasoning ? '隐藏推理过程' : '查看推理过程'}
                  {showReasoning ? <ChevronUp className="size-3 ml-1" /> : <ChevronDown className="size-3 ml-1" />}
                </Button>
                {showReasoning && (
                  <div className="mt-2 p-3 bg-background/50 rounded-lg border text-xs">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.reasoning!}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            )}
            {/* 助手回复内容 */}
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content || (isStreaming ? '' : '')}
              </ReactMarkdown>
              {isStreaming && message.content === '' && (
                <span className="inline-block w-0.5 h-4 bg-current animate-pulse" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
