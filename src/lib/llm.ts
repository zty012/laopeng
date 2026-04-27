import { ChatDeepSeek } from "@langchain/deepseek";

/**
 * 创建 DeepSeek LLM 实例
 * 需要在环境变量中设置 DEEPSEEK_API_KEY
 */
export function createLLM() {
  const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY as string;
  const model =
    (process.env.NEXT_PUBLIC_DEEPSEEK_MODEL as string) || "deepseek-chat";

  if (!apiKey) {
    throw new Error("请在环境变量中设置 DEEPSEEK_API_KEY");
  }

  return new ChatDeepSeek({
    model,
    apiKey,
    streaming: true,
    reasoning: {
      effort: "high",
    },
  });
}
