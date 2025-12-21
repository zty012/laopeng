import Markdown from "@/components/markdown";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AGENTS } from "@/lib/agents";
import { AITools } from "@/lib/aiTools";
import type { Attachment } from "@/lib/conversationContext";
import { useConversations } from "@/lib/conversationContext";
import { openai } from "@/lib/openai";
import {
  BrainCircuit,
  ChevronRight,
  Loader2,
  Paperclip,
  Send,
  Wrench,
} from "lucide-react";
import * as mammoth from "mammoth";
import { OpenAI } from "openai";
import { useRef, useState } from "react";
import { Fragment } from "react/jsx-runtime";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [enableDeepThinking, setEnableDeepThinking] = useState(false);
  const messagesElRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    currentMessages,
    updateCurrentConversation,
    conversations,
    currentConversationId,
  } = useConversations();

  const currentConversation = conversations.find(
    (c) => c.id === currentConversationId,
  );
  const currentAgent = currentConversation?.agentId
    ? AGENTS.find((g) => g.id === currentConversation.agentId)
    : null;

  function addMessage(
    message: OpenAI.ChatCompletionMessageParam & {
      tokens?: number;
      attachments?: Attachment[];
    },
  ) {
    updateCurrentConversation((prev) => [...prev, message]);
  }
  function setLastMessage(msg: OpenAI.ChatCompletionMessageParam) {
    updateCurrentConversation((prev) => {
      const newMessages = [...prev];
      newMessages[newMessages.length - 1] = msg;
      return newMessages;
    });
  }

  function scrollToBottom() {
    if (messagesElRef.current) {
      messagesElRef.current.scrollTo({
        top: messagesElRef.current.scrollHeight,
      });
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("File uploaded:", file.name, file.type);
    try {
      let content = "";
      const isDocx =
        file.name.toLowerCase().endsWith(".docx") ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      if (isDocx) {
        console.log("Detected docx, parsing...");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        content = result.value;
        console.log("Parsed content length:", content.length);
      } else if (file.name.toLowerCase().endsWith(".doc")) {
        throw new Error("不支持 .doc 格式，请转换为 .docx 后上传");
      } else {
        console.log("Reading as text...");
        content = await file.text();
      }

      const attachment: Attachment = {
        name: file.name,
        contentType: file.type,
        content: content,
      };
      const newMessage: OpenAI.ChatCompletionMessageParam & {
        attachments: Attachment[];
      } = {
        role: "user",
        content: "",
        attachments: [attachment],
      };
      addMessage(newMessage);
      run([...currentMessages, newMessage]);
    } catch (e) {
      console.error("File upload failed:", e);
      addMessage({
        role: "assistant",
        content: `文件上传失败: ${(e as Error).message || String(e)}`,
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  async function run(
    msgs: (OpenAI.ChatCompletionMessageParam & {
      attachments?: Attachment[];
    })[] = [...currentMessages, { role: "user", content: inputValue }],
  ) {
    scrollToBottom();
    setRequesting(true);
    try {
      const processedMsgs = msgs.map((msg) => {
        const newMsg = { ...msg };
        if (newMsg.attachments && newMsg.attachments.length > 0) {
          const attachmentContent = newMsg.attachments
            .map((a) => `\n\n[File: ${a.name}]\n${a.content}`)
            .join("\n");
          newMsg.content = (newMsg.content as string) + attachmentContent;
        }
        const { attachments: _attachments, ...rest } = newMsg as any;
        return rest as OpenAI.ChatCompletionMessageParam;
      });

      const stream = (await openai.chat.completions.create({
        model: "deepseek/deepseek-v3.2",
        messages: processedMsgs,
        stream: true,
        tools: AITools.tools,
        tool_choice: "auto",
        include_reasoning: enableDeepThinking,
      } as any)) as unknown as AsyncIterable<OpenAI.ChatCompletionChunk>;
      addMessage({
        role: "assistant",
        content: "Requesting...",
      });
      const streamingMsg: OpenAI.ChatCompletionAssistantMessageParam & {
        reasoning: string;
      } = {
        role: "assistant",
        content: "",
        reasoning: "",
        tool_calls: [],
      };
      let lastChunk: OpenAI.ChatCompletionChunk | null = null;
      for await (const chunk of stream) {
        const delta = chunk.choices[0].delta;
        streamingMsg.content! += delta.content ?? "";
        if ("reasoning" in delta) {
          streamingMsg.reasoning! += delta.reasoning ?? "";
        }
        const toolCalls = delta.tool_calls || [];

        for (const toolCall of toolCalls) {
          if (typeof streamingMsg.tool_calls !== "undefined") {
            const index =
              toolCall.index !== undefined
                ? toolCall.index
                : toolCall.type
                  ? streamingMsg.tool_calls.length
                  : streamingMsg.tool_calls.length - 1;

            // 确保索引有效
            if (index >= streamingMsg.tool_calls.length) {
              streamingMsg.tool_calls[index] = {
                id: toolCall.id || crypto.randomUUID(),
                type: "function",
                function: {
                  name: "",
                  arguments: "",
                },
              };
            }

            // 更新工具调用信息
            if (toolCall.id) streamingMsg.tool_calls[index].id = toolCall.id;
            if (streamingMsg.tool_calls[index].type !== "function") continue;
            if (toolCall.function?.name)
              streamingMsg.tool_calls[index].function.name +=
                toolCall.function.name;
            if (toolCall.function?.arguments)
              streamingMsg.tool_calls[index].function.arguments +=
                toolCall.function.arguments;
          }
        }

        setLastMessage(streamingMsg);
        scrollToBottom();
        lastChunk = chunk;
      }
      setRequesting(false);
      if (!lastChunk) return;
      scrollToBottom();
      // 如果有工具调用，执行工具调用
      console.log(streamingMsg.tool_calls);
      if (streamingMsg.tool_calls && streamingMsg.tool_calls.length > 0) {
        const toolMsgs: OpenAI.ChatCompletionToolMessageParam[] = [];
        for (const toolCall of streamingMsg.tool_calls) {
          if (toolCall.type !== "function") continue;
          const tool = AITools.handlers.get(toolCall.function.name);
          if (!tool) {
            return;
          }
          let observation = "";
          try {
            const result = await tool(JSON.parse(toolCall.function.arguments));
            if (typeof result === "string") {
              observation = result;
            } else if (typeof result === "object") {
              observation = JSON.stringify(result);
            } else {
              observation = String(result);
            }
          } catch (e) {
            observation = `工具调用失败：${(e as Error).message}`;
          }
          const msg = {
            role: "tool" as const,
            content: observation,
            tool_call_id: toolCall.id!,
          };
          addMessage(msg);
          toolMsgs.push(msg);
        }
        // 工具调用结束后，重新发送消息，让模型继续思考
        run([...msgs, streamingMsg, ...toolMsgs]);
      }
    } catch (e) {
      addMessage({
        role: "assistant",
        content: String(e),
      });
    }
  }

  return (
    <div className="mx-auto flex size-full flex-col p-8">
      <div
        className="flex flex-1 flex-col gap-2 overflow-y-auto"
        ref={messagesElRef}
      >
        {currentMessages.filter((m) => m.role !== "system").length === 0 && (
          <div className="text-muted-foreground flex h-full flex-col items-center justify-center">
            {currentAgent ? (
              <>
                <currentAgent.icon className="mb-4 h-12 w-12" />
                <h2 className="text-lg font-semibold">{currentAgent.title}</h2>
                <p className="text-sm">{currentAgent.description}</p>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold">真·老彭</h2>
                <p className="text-sm">有什么可以帮你的吗？</p>
              </>
            )}
          </div>
        )}
        {currentMessages.map((msg, i) =>
          msg.role === "user" ? (
            <div key={i} className="flex flex-col items-end gap-1">
              {msg.attachments?.map((attachment, index) => (
                <div
                  key={index}
                  className="bg-accent text-accent-foreground flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                >
                  <Paperclip className="h-4 w-4" />
                  <span>{attachment.name}</span>
                </div>
              ))}
              {msg.content && (
                <div className="bg-accent text-accent-foreground max-w-11/12 rounded-2xl rounded-br-none px-3 py-2">
                  {msg.content as string}
                </div>
              )}
            </div>
          ) : msg.role === "assistant" ? (
            <div key={i} className="flex flex-col gap-2">
              {msg.reasoning && (
                <Collapsible className="group/collapsible" defaultOpen>
                  <CollapsibleTrigger className="flex items-center gap-2">
                    <BrainCircuit />
                    <span>思考中</span>
                    <ChevronRight className="transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 animate-none! rounded-lg border px-3 py-2 opacity-50">
                    <span className="text-sm">
                      <Markdown source={msg.reasoning} />
                    </span>
                  </CollapsibleContent>
                </Collapsible>
              )}
              {msg.content && typeof msg.content === "string" && (
                <Markdown
                  source={
                    msg.content.includes("</think>")
                      ? msg.content.split("</think>")[1]
                      : msg.content
                  }
                />
              )}
              {msg.tool_calls &&
                msg.tool_calls
                  .filter((it) => it.type === "function")
                  .map((toolCall) => (
                    <Collapsible
                      className="group/collapsible"
                      key={toolCall.id}
                    >
                      <CollapsibleTrigger className="flex items-center gap-2">
                        <Wrench />
                        <span>{toolCall.function.name}</span>
                        <ChevronRight className="transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 animate-none! rounded-lg border px-3 py-2 opacity-50">
                        <span className="text-sm">
                          <Markdown
                            source={`\`\`\`json\n${toolCall.function.arguments}\n\`\`\``}
                          />
                        </span>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
            </div>
          ) : (
            <Fragment key={i} />
          ),
        )}
      </div>
      <Card className="flex flex-col gap-0 p-0">
        <Textarea
          placeholder="What can I say?"
          onChange={(e) => setInputValue(e.target.value)}
          value={inputValue}
          className="border-none bg-transparent! p-4"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!inputValue.trim()) return;
              addMessage({ role: "user", content: inputValue });
              setInputValue("");
              run();
            }
          }}
        />
        <div className="flex gap-2 p-2">
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Paperclip
            className="text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          />
          <div className="flex-1"></div>
          <div className="mr-4 flex items-center gap-2">
            <Switch
              id="deep-thinking"
              checked={enableDeepThinking}
              onCheckedChange={setEnableDeepThinking}
            />
            <Label
              htmlFor="deep-thinking"
              className="text-muted-foreground cursor-pointer text-xs"
            >
              深度思考
            </Label>
          </div>
          {requesting ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Send
              className="cursor-pointer"
              onClick={() => {
                if (!inputValue.trim()) return;
                addMessage({ role: "user", content: inputValue });
                setInputValue("");
                run();
              }}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
