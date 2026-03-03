import {
  HumanMessage,
  AIMessage,
  AIMessageChunk,
  BaseMessage,
  SystemMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { createLLM } from "./llm";
import { toolRegistry } from "./tools";
import type { Message } from "../types";

/**
 * Mermaid 工具调用回调类型
 */
export type MermaidCallback = (code: string) => void;

/**
 * 全局 Mermaid 回调
 */
let onMermaidUpdate: MermaidCallback | null = null;

/**
 * 设置 Mermaid 回调
 */
export function setMermaidCallback(callback: MermaidCallback | null) {
  onMermaidUpdate = callback;
}

/**
 * 将应用内的 Message[] 转换为 LangChain BaseMessage[]
 */
function toLC(messages: Message[]): BaseMessage[] {
  return messages.map((m) => {
    if (m.attachments && m.attachments.length > 0 && m.role === "user") {
      // 构建包含文本和图片的内容数组
      const content: Array<{
        type: "text" | "image_url";
        text?: string;
        image_url?: { url: string };
      }> = [];

      if (m.content.trim()) {
        content.push({ type: "text", text: m.content });
      }

      for (const att of m.attachments) {
        if (att.type === "image") {
          content.push({
            type: "image_url",
            image_url: { url: att.url },
          });
        }
      }

      return new HumanMessage({ content });
    }

    return m.role === "user"
      ? new HumanMessage(m.content)
      : new AIMessage(m.content);
  });
}

/**
 * 流式发送消息，支持工具调用。
 *
 * @param messages   当前对话的历史消息（含本次用户消息）
 * @param systemPrompt 系统提示词
 * @param onToken    每收到一个 token 时的回调
 * @param onReasoning 推理过程更新时的回调
 * @returns 完整的助手回复文本和推理过程
 */
export async function sendMessage(
  messages: Message[],
  systemPrompt: string,
  onToken: (token: string) => void,
  onReasoning?: (reasoning: string) => void,
): Promise<{ content: string; reasoning?: string }> {
  const llm = createLLM();
  const llmWithTools =
    toolRegistry.length > 0 ? llm.bindTools(toolRegistry) : llm;

  const history = toLC(messages);
  let fullResponse = "";
  let reasoningContent = "";

  // 系统提示词 + 对话历史
  const currentMessages: BaseMessage[] = [
    new SystemMessage(systemPrompt),
    ...history,
  ];

  // 循环处理工具调用（agentic loop）
  let toolCallCount = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const stream = await llmWithTools.stream(currentMessages);
    let merged: AIMessageChunk | undefined;

    for await (const chunk of stream) {
      merged = merged ? (merged.concat(chunk) as AIMessageChunk) : chunk;
      if (typeof chunk.content === "string" && chunk.content) {
        onToken(chunk.content);
        fullResponse += chunk.content;
      } else if (Array.isArray(chunk.content)) {
        for (const part of chunk.content) {
          if (
            typeof part === "object" &&
            "type" in part &&
            part.type === "text"
          ) {
            const text = (part as { type: "text"; text: string }).text;
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

    // 记录推理过程
    for (const tc of toolCalls) {
      toolCallCount++;
      const reasoningStep =
        `\n\n**思考步骤 ${toolCallCount}**: 调用工具 \`${tc.name}\`\n` +
        `参数：\`\`\`json\n${JSON.stringify(tc.args, null, 2)}\n\`\`\``;
      reasoningContent += reasoningStep;
      onReasoning?.(reasoningContent);
    }

    // 执行所有工具调用
    for (const tc of toolCalls) {
      const foundTool = toolRegistry.find((t) => t.name === tc.name);
      let result = "工具未找到";
      if (foundTool) {
        try {
          const invokable = foundTool as {
            invoke: (args: unknown) => Promise<unknown>;
          };
          const toolArgs = tc.args as Record<string, unknown>;
          
          // 特殊处理 set_mermaid 工具
          if (tc.name === 'set_mermaid' && onMermaidUpdate) {
            const code = toolArgs.code as string;
            if (code) {
              onMermaidUpdate(code);
            }
          }
          
          result = String(await invokable.invoke(tc.args));
        } catch (e) {
          result = `工具执行错误：${e}`;
        }
      }
      const toolCallId = tc.id ?? tc.name;
      currentMessages.push(
        new ToolMessage({ content: result, tool_call_id: toolCallId }),
      );

      // 添加工具执行结果到推理过程
      reasoningContent += `\n\n**工具返回**: \`\`\`\n${result}\n\`\`\``;
      onReasoning?.(reasoningContent);
    }
    // 重置 fullResponse，继续循环获取最终回复
    fullResponse = "";
  }

  return { content: fullResponse, reasoning: reasoningContent || undefined };
}
