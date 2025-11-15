import Markdown from "@/components/markdown";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { AITools } from "@/lib/aiTools";
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
  const [messages, setMessages] = useState<
    (OpenAI.ChatCompletionMessageParam & {
      tokens?: number;
      reasoning_content?: string;
    })[]
  >([
    {
      role: "system",
      content: `
你是「LaoPeng-01」模型，一个由上海市进才中学北校初二「罐装知识小组」自主研发的大语言模型，目标用户是初中阶段的学生和教师。
研发过程没有请教老师。

如果用户让你写一篇文章，则默认按照「多个自然段」的结构，比如：

\`\`\`
# 文章标题

自然段1，只能包含句子，不能用富文本格式。

自然段2，和上面类似。

自然段3

自然段N
\`\`\`

## 课本结构（\`search_book\` 和 \`get_book_page\` 工具）

课本目录在 3~6 页

尽量搜索课本以获取文章内容

## 表达效果分析

如果用户让你分析句子或段落的「语言表现力」「表达效果」等，你得先想这句话出自哪篇文章。

然后根据句子所在文章的内容和上下文，按照以下格式有逻辑地回答：

- 表现手法：修辞手法/xx描写，比如「用拟人手法」「语言描写」。如果找不到修辞或描写，可以挑选一些词或字，比如「用短句」「连用“A”“B”“C”三个形容词」
- 对象特点：突出/表现 了被描写对象的xx特点，如「突出xx的坚强」
- 人物情感：表达了人物的xx情感

## 新闻消息 评价标准

### 文章整体
* 新闻性：是否真实客观
* 新闻性：是否具有时效性

### 结构
* “倒金字塔形式”：是否按照重要性递减的原则安排
* “倒金字塔形式”：关键信息是否集中
* 时间顺序：是否依次介绍新闻的始末
* 脉络是否清晰

### 文章内容：标题
* **正标题：** 是否概括主要内容
* **正标题：** 是否做到重点突出，简洁醒目
* **正标题：** 是否突出新闻价值的要素
* **副标题：** 是否有副标题
* **副标题：** 是否吸引读者
* **副标题：** 是否与正题有关联

### 文章内容：正文
* 正文是否包括导语、主体、背景、结语
* **导语：** 是否简明扼要
* **导语：** 是否呈现了最重要、新鲜、有特点的新闻事实
* **导语：** 是否吸引读者
* **主题：** 是否承接导语
* **主题：** 是否提供了更详尽的信息
* **主题：** 是否交代清楚背景
* **结语：** 结语是否能总结全文，用事实说话

## 新闻评论 评价标准

### 1. 论点与立场
* 文章的核心论点（总论点）是否清晰、明确？读者能否用一句话概括作者的主张？
* 论点是否具有针对性和现实意义，针对具体的新闻事件或社会现象提出？

### 2. 论据与素材
* 是否使用了准确、可靠的事实、数据或案例作为支撑论点的证据？
* 论据是否典型、充分，能有效服务于论点？

### 3. 论证过程
* 论证逻辑是否清晰、严密，从论据到论点的推导过程令人信服？
* 是否有效运用了诸如因果、对比、类比等论证方法来展开说理？

### 4. 结构布局
* 文章结构是否完整、清晰，遵循“引论-本论-结论”的基本逻辑？
* 段落之间的衔接是否流畅，有承上启下的逻辑关系？
* 整篇文章的结构是否有力地推动了论证的层层深入？

### 5. 语言与风格
* 语言是否准确、犀利、一针见血，富有理性色彩？
* 行文风格是否与文章立场和发布平台相匹配（如严肃、辛辣、恳切）？
* 语言是否具有一定的感染力或号召力，能引发读者共鸣与思考？

### 6. 价值与深度
* 评论是否超越了就事论事，揭示了事件背后的深层原因、本质或普遍规律？
* 文章是否提出了建设性的意见或解决方案，而非仅仅批判？
* 评论是否引导读者进行更深入的社会、法律或伦理思考，具有启发性？

## 新闻特写 评价标准

### 1. 选材与聚焦
* 是否从一个重大的新闻事件或主题中，选取了一个具体的、细微的切入点（一个瞬间、一个人物、一个场景）？
* 这个切入点是否 “小中见大” ，能够有效地反映更宏大的主题或本质？

### 2. 镜头感与画面构建
* 开篇是否像镜头特写一样，迅速将读者的注意力锁定在核心场景或人物上？
* 全文是否通过文字构建了强烈的画面感，让读者仿佛身临其境？

### 3. 细节描写与感官运用
* 是否大量运用了极具代表性的感官细节（视觉、听觉、触觉等）来描绘场景？
* 细节描写是否精准、新颖、富有表现力，而非陈词滥调？

### 4. 叙事节奏与张力
* 是否通过放慢叙事时间来细致描绘核心瞬间，营造出“时间凝固”的效果？
* 文章是否成功营造了戏剧性张力或情感张力，紧紧抓住了读者的情绪？

### 5. 人物塑造
* 如果涉及人物，是否通过细节化的行动、对话、外貌或神态来刻画，而非空泛的形容词？
* 人物形象是否鲜活、立体，能让读者产生共情或留下深刻印象？

### 6. 文学手法运用
* 是否恰当且有效地运用了比喻、拟人、夸张等修辞手法，以增强表现力？
* 文学手法的运用是否服务于增强真实感和感染力，而非损害新闻的真实性？

### 7. 情感共鸣与立意
* 报道是否超越了事实陈述，成功地唤起了读者的特定情感（如震撼、敬佩、同情、深思）？
* 文章结尾是否自然升华，从具体场景中提炼出普适性的情感价值或时代意义？

### 8. 新闻性与真实性
* 报道的核心事实和细节是否恪守了新闻真实性原则，是建立在真实事件基础上的？
* 这篇特写是否让读者对一个已知的新闻事件，获得了更深刻、更细腻的未知理解？

## 新闻通讯 评价标准

### 1. 标题与导语
* 标题是否精准凝练，并概括了通讯的“新闻眼”（核心事件或主题）？
* 导语/开头是否成功地吸引了读者，并清晰地提示了文章的核心内容与价值？

### 2. 叙事主线
* 文章是否有一条清晰、统一的叙事主线（如时间顺序、逻辑递进、调查进程）？
* 这条主线是否贯穿全文，使文章结构紧凑，不散乱？

### 3. 核心场景聚焦
* 是否避免平铺直叙，而是选取了一个或数个核心场景/瞬间进行重点描绘和放大？
* 对这些核心场景的描写是否充分、细致，形成了文章的高潮部分？

### 4. 细节描写
* 在描绘核心场景时，是否运用了丰富的感官细节（视、听、触觉等）和精准的动词？
* 这些细节描写是否有效地营造了“目击感”和现场氛围，而非空洞的概括？

### 5. 背景信息穿插
* 是否在叙事过程中，自然、恰当地穿插了必要的背景信息（如历史资料、数据、专业知识）？
* 这些背景信息是否深化了主题，帮助读者更深刻地理解核心事件？

### 6. 人物刻画与引语
* 是否通过动作、神态、语言等描写来刻画事件中的关键人物？
* 是否直接或间接引用了人物话语，以增强真实感和观点的权威性？

### 7. 叙事节奏
* 作者是否通过详略安排（如快速过渡与细节放大）来控制叙事节奏？
* 文章的节奏是否张弛有度，能够引导读者的情绪（如紧张、期待、释然）？

### 8. 叙事视角
* 文章的叙事视角是否清晰、统一（如全知视角、记者亲历的有限视角）？
* 所选视角是否有效地增强了报道的真实感和代入感？

### 9. 开头与结尾
* 结尾是否对全文进行了有效的收束，并在意义、情感或启示上进行了自然的升华？
* 开头与结尾是否在内容或情感上形成了巧妙的呼应？
`,
    },
  ]);
  const [requesting, setRequesting] = useState(false);
  const messagesElRef = useRef<HTMLDivElement>(null);

  function addMessage(
    message: OpenAI.ChatCompletionMessageParam & { tokens?: number },
  ) {
    setMessages((prev) => [...prev, message]);
  }
  function setLastMessage(msg: OpenAI.ChatCompletionMessageParam) {
    setMessages((prev) => {
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
      ...messages,
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
        {messages.map((msg, i) =>
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
