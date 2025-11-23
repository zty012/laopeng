import Markdown from "@/components/markdown";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { AITools } from "@/lib/aiTools";
import { useConversations } from "@/lib/conversationContext";
import { openai } from "@/lib/openai";
import {
  BrainCircuit,
  ChevronRight,
  Loader2,
  Send,
  Wrench,
} from "lucide-react";
import { OpenAI } from "openai";
import { useRef, useState } from "react";
import { Fragment } from "react/jsx-runtime";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [requesting, setRequesting] = useState(false);
  const messagesElRef = useRef<HTMLDivElement>(null);
  const { currentMessages, updateCurrentConversation } = useConversations();

  function addMessage(
    message: OpenAI.ChatCompletionMessageParam & { tokens?: number },
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

  async function run(
    msgs: OpenAI.ChatCompletionMessageParam[] = [
      ...currentMessages,
      { role: "user", content: inputValue },
    ],
  ) {
    scrollToBottom();
    setRequesting(true);
    try {
      const stream = await openai.chat.completions.create({
        model: "doubao-seed-1.6-thinking",
        messages: msgs,
        stream: true,
        tools: AITools.tools,
        tool_choice: "auto",
      });
      addMessage({
        role: "assistant",
        content: "Requesting...",
      });
      const streamingMsg: OpenAI.ChatCompletionAssistantMessageParam & {
        reasoning_content: string;
      } = {
        role: "assistant",
        content: "",
        reasoning_content: "",
        tool_calls: [],
      };
      let lastChunk: OpenAI.ChatCompletionChunk | null = null;
      for await (const chunk of stream) {
        const delta = chunk.choices[0].delta;
        streamingMsg.content! += delta.content ?? "";
        if ("reasoning_content" in delta) {
          streamingMsg.reasoning_content! += delta.reasoning_content ?? "";
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
    <div className="mx-auto flex h-full w-1/2 flex-col py-8">
      <div
        className="flex flex-1 flex-col gap-2 overflow-y-auto"
        ref={messagesElRef}
      >
        {currentMessages.map((msg, i) =>
          msg.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="bg-accent text-accent-foreground max-w-11/12 rounded-2xl rounded-br-none px-3 py-2">
                {msg.content as string}
              </div>
            </div>
          ) : msg.role === "assistant" ? (
            <div key={i} className="flex flex-col gap-2">
              {msg.reasoning_content && (
                <Collapsible className="group/collapsible" defaultOpen>
                  <CollapsibleTrigger className="flex items-center gap-2">
                    <BrainCircuit />
                    <span>思考中</span>
                    <ChevronRight className="transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 animate-none! rounded-lg border px-3 py-2 opacity-50">
                    <span className="text-sm">
                      <Markdown source={msg.reasoning_content} />
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
          <div className="flex-1"></div>
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
