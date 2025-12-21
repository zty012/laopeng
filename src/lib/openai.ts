import { OpenAI } from "openai";

export const openai = new OpenAI({
  // baseURL: "https://api.qnaigc.com/v1",
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});
