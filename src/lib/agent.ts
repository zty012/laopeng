import { HumanMessage, AIMessage, AIMessageChunk, BaseMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import { createLLM } from './llm';
import { toolRegistry } from './tools';
import type { Message } from '../types';

/**
 * 将应用内的 Message[] 转换为 LangChain BaseMessage[]
 */
function toLC(messages: Message[]): BaseMessage[] {
  return messages.map((m) =>
    m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content)
  );
}

/**
 * 流式发送消息，支持工具调用。
 *
 * @param messages   当前对话的历史消息（含本次用户消息）
 * @param onToken    每收到一个 token 时的回调
 * @returns 完整的助手回复文本
 */
export async function sendMessage(
  messages: Message[],
  systemPrompt: string,
  onToken: (token: string) => void,
): Promise<string> {
  const llm = createLLM();
  const llmWithTools = toolRegistry.length > 0 ? llm.bindTools(toolRegistry) : llm;

  const history = toLC(messages);
  let fullResponse = '';

  // 系统提示词 + 对话历史
  const currentMessages: BaseMessage[] = [
    new SystemMessage(systemPrompt),
    ...history,
  ];

  // 循环处理工具调用（agentic loop）

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const stream = await llmWithTools.stream(currentMessages);
    let merged: AIMessageChunk | undefined;

    for await (const chunk of stream) {
      merged = merged ? (merged.concat(chunk) as AIMessageChunk) : chunk;
      if (typeof chunk.content === 'string' && chunk.content) {
        onToken(chunk.content);
        fullResponse += chunk.content;
      } else if (Array.isArray(chunk.content)) {
        for (const part of chunk.content) {
          if (typeof part === 'object' && 'type' in part && part.type === 'text') {
            const text = (part as { type: 'text'; text: string }).text;
            if (text) {
              onToken(text);
              fullResponse += text;
            }
          }
        }
      }
    }

    if (!merged) break;
    currentMessages.push(merged);

    // 检查是否有工具调用
    const toolCalls = merged.tool_calls ?? [];
    if (toolCalls.length === 0) break;

    // 执行所有工具调用
    for (const tc of toolCalls) {
      const foundTool = toolRegistry.find((t) => t.name === tc.name);
      let result = '工具未找到';
      if (foundTool) {
        try {
          const invokable = foundTool as { invoke: (args: unknown) => Promise<unknown> };
          result = String(await invokable.invoke(tc.args));
        } catch (e) {
          result = `工具执行错误: ${e}`;
        }
      }
      const toolCallId = tc.id ?? tc.name;
      currentMessages.push(new ToolMessage({ content: result, tool_call_id: toolCallId }));
    }
    // 重置 fullResponse，继续循环获取最终回复
    fullResponse = '';
  }

  return fullResponse;
}
