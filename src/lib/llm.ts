import { ChatOpenAI } from "@langchain/openai";

/**
 * 创建 OpenRouter LLM 实例
 * 需要在 .env 文件中设置 OPENROUTER_API_KEY
 * 可选设置 OPENROUTER_MODEL（默认 deepseek/deepseek-chat-v3-0324:free）
 */
export function createLLM() {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY as string;
  const model =
    (process.env.NEXT_PUBLIC_OPENROUTER_MODEL as string) ||
    "deepseek/deepseek-chat-v3-0324:free";

  if (!apiKey) {
    throw new Error("请在 .env 文件中设置 OPENROUTER_API_KEY");
  }

  return new ChatOpenAI({
    model,
    apiKey,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": window.location.origin,
        "X-Title": "Laopeng Chat",
      },
    },
    streaming: true,
  });
}
