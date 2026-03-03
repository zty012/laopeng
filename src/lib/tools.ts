import { tool } from '@langchain/core/tools';
import { z } from 'zod';

/**
 * 工具注册表
 * 要添加新工具，只需在此文件中 import 并加入 toolRegistry 数组即可。
 */

// ── 示例工具：计算器 ──────────────────────────────────────────────────────────
const calculatorTool = tool(
  async ({ expression }: { expression: string }) => {
    try {
      // 使用 Function 安全地求值简单数学表达式
      const result = Function(`"use strict"; return (${expression})`)();
      return String(result);
    } catch {
      return '表达式无效，无法计算。';
    }
  },
  {
    name: 'calculator',
    description: '计算数学表达式。输入一个合法的 JavaScript 数学表达式字符串，返回计算结果。',
    schema: z.object({
      expression: z.string().describe('要计算的数学表达式，例如 "2 + 3 * 4"'),
    }),
  }
);

// ── 示例工具：获取当前时间 ────────────────────────────────────────────────────
const getCurrentTimeTool = tool(
  async () => {
    return new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  },
  {
    name: 'get_current_time',
    description: '获取当前的北京时间（Asia/Shanghai 时区）。',
    schema: z.object({}),
  }
);

// ── 工具：显示 Mermaid 图表 ────────────────────────────────────────────────────
const setMermaidTool = tool(
  async ({ code }: { code: string }) => {
    // 这个工具会触发前端显示 Mermaid 面板
    // 实际渲染由前端处理
    return `Mermaid 图表已更新。代码长度：${code.length} 字符。`;
  },
  {
    name: 'set_mermaid',
    description: '在页面右侧显示一个 Mermaid 图表面板。传入 Mermaid 代码，面板会以动画形式展开显示图表。用户可以点击图表中的节点（0 个或多个）进行追问。',
    schema: z.object({
      code: z.string().describe('Mermaid 图表代码，支持 flowchart、sequenceDiagram、classDiagram 等语法'),
    }),
  }
);

// ── 工具注册表（在此添加新工具）──────────────────────────────────────────────
export const toolRegistry = [calculatorTool, getCurrentTimeTool, setMermaidTool];
