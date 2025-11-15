import OpenAI from "openai";
import z from "zod/v4";
import { BookSearchService } from "./bookSearch";

class AITools_ {
  tools: OpenAI.ChatCompletionTool[] = [];
  handlers: Map<string, (data: any) => any> = new Map();

  addTool<A extends z.ZodObject>(
    name: string,
    description: string,
    parameters: A,
    fn: (data: z.infer<A>) => any,
  ) {
    this.tools.push({
      type: "function",
      function: {
        name,
        description,
        parameters: z.toJSONSchema(parameters),
        strict: true,
      },
    });
    this.handlers.set(name, fn);
  }

  constructor() {
    this.addTool(
      "get_current_time",
      "获取当前的日期和时间",
      z.object({}),
      () => {
        return new Date().toString();
      },
    );
    this.addTool(
      "search_book",
      "在课本中模糊搜索文本，返回页面索引",
      z.object({ query: z.string().describe("要搜索的文本") }),
      ({ query }) => {
        return BookSearchService.search(query).map((it) => it.item.page);
      },
    );
    this.addTool(
      "get_book_page",
      "获取课本中特定页面的内容",
      z.object({ page: z.number().describe("页面索引，从0开始") }),
      ({ page }) => {
        const pages = BookSearchService.getPages();
        if (page < 0 || page >= pages.length) {
          return `页面索引 ${page} 超出范围，有效范围是 0 到 ${pages.length - 1}`;
        }
        return pages[page].text;
      },
    );
    this.addTool(
      "calc",
      "计算数学表达式的值",
      z.object({
        expression: z.string().describe("数学表达式，例如 2 + 2 * (3 - 1)"),
      }),
      ({ expression }) => {
        try {
          // 使用 Function 构造函数来计算表达式
          // 注意：这种方法有安全风险，确保只在受信任的环境中使用
          // eslint-disable-next-line no-new-func
          const func = new Function(`return (${expression});`);
          const result = func();
          return result;
        } catch (error) {
          return `无法计算表达式 "${expression}"：${error instanceof Error ? error.message : String(error)}`;
        }
      },
    );
  }
}

export const AITools = new AITools_();
