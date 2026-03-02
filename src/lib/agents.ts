import type { Agent } from '../types';

/** 简易 YAML frontmatter 解析 */
function parseFrontmatter(raw: string): { name: string; description: string; prompt: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { name: '未知智能体', description: '', prompt: raw.trim() };

  const meta: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }

  return {
    name: meta['name'] ?? '未知智能体',
    description: meta['description'] ?? '',
    prompt: match[2].trim(),
  };
}

/**
 * 手动加载所有智能体 prompt 文件
 * 每个文件即一个智能体，文件名（不含扩展名）为 id
 */
import allusionTracer from '../prompts/allusion-tracer';
import defaultPrompt from '../prompts/default';
import famousLines from '../prompts/famous-lines';
import imageryLibrary from '../prompts/imagery-library';
import rhetoricCoach from '../prompts/rhetoric-coach';
import translator from '../prompts/translator';
import wordExplainer from '../prompts/word-explainer';

const promptFiles: Record<string, string> = {
  'allusion-tracer': allusionTracer,
  'default': defaultPrompt,
  'famous-lines': famousLines,
  'imagery-library': imageryLibrary,
  'rhetoric-coach': rhetoricCoach,
  'translator': translator,
  'word-explainer': wordExplainer,
};

export const DEFAULT_AGENT_ID = 'default';

export const agents: Agent[] = Object.entries(promptFiles)
  .map(([id, raw]) => {
    const { name, description, prompt } = parseFrontmatter(raw);
    return { id, name, description, systemPrompt: prompt };
  })
  .sort((a, b) => (a.id === 'default' ? -1 : b.id === 'default' ? 1 : a.name.localeCompare(b.name)));

// 提取 default 智能体的提示词，作为所有智能体的公共前缀
const baseDefaultPrompt = agents.find((a) => a.id === DEFAULT_AGENT_ID)?.systemPrompt ?? '';

// 非 default 智能体在自身提示词前追加 default 提示词
for (const agent of agents) {
  if (agent.id !== DEFAULT_AGENT_ID && baseDefaultPrompt) {
    agent.systemPrompt = `${baseDefaultPrompt}\n\n---\n\n${agent.systemPrompt}`;
  }
}

export function getAgent(id: string): Agent {
  return (
    agents.find((a) => a.id === id) ??
    agents.find((a) => a.id === DEFAULT_AGENT_ID) ??
    agents[0]
  );
}
