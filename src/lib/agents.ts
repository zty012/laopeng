import kuaSystemPrompt from "@/prompts/kua.md?raw";
import newsSystemPrompt from "@/prompts/news-columnist.md?raw";
import { Newspaper } from "lucide-react";
import type { ElementType } from "react";

export interface Agent {
  id: string;
  title: string;
  description: string;
  icon: ElementType;
  systemPrompt: string;
}

export const AGENTS: Agent[] = [
  {
    id: "news-columnist",
    title: "新闻专栏",
    description: "专业的初中生新闻撰稿人，擅长写各类新闻稿件。",
    icon: Newspaper,
    systemPrompt: newsSystemPrompt,
  },
  {
    id: "kua",
    title: "跨学科专栏",
    description: "跨学科知识整合专家，擅长将不同学科的知识融合在一起。",
    icon: Newspaper,
    systemPrompt: kuaSystemPrompt,
  },
];
