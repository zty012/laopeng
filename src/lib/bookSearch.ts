import Fuse, { type FuseResultMatch } from "fuse.js";

export type PageItem = {
  page: number; // 0-based
  text: string;
};

export type FuseResult = {
  item: PageItem;
  score?: number;
  matches?: readonly FuseResultMatch[];
};

export interface BookSearchOptions {
  /** 书籍 JSON 文件的路径，默认为 "/book-8a.json" */
  bookPath?: string;
  /** Fuse.js 的搜索阈值，默认为 0.4 (0-1，越小越严格) */
  threshold?: number;
  /** 返回结果的最大数量，默认为 10 */
  maxResults?: number;
}

/**
 * 书籍搜索服务类
 *
 * 功能：
 * - 异步加载书籍 JSON 数据
 * - 使用 Fuse.js 进行模糊搜索
 * - 返回搜索结果和高亮功能
 * - 支持自定义配置（阈值、最大结果数、书籍路径）
 *
 * @example
 * ```tsx
 * const service = new BookSearchService();
 * const pages = await service.loadPages();
 *
 * const results = service.search("搜索词");
 * results.forEach(result => {
 *   console.log(`第 ${result.item.page} 页, 匹配度 ${result.score}%`);
 *   const highlighted = service.highlight(pages[result.item.page - 1].text, result.matches);
 *   console.log(highlighted);
 * });
 * ```
 *
 * @example
 * ```tsx
 * // 自定义配置
 * const service = new BookSearchService({
 *   bookPath: "/custom-book.json",
 *   threshold: 0.3,
 *   maxResults: 20,
 * });
 * ```
 */
export class BookSearchService_ {
  private pages: PageItem[] = [];
  private fuse: Fuse<PageItem> | null = null;
  private readonly options: Required<BookSearchOptions>;

  constructor(options: BookSearchOptions = {}) {
    this.options = {
      bookPath: options.bookPath ?? "/book-8a.json",
      threshold: options.threshold ?? 0.4,
      maxResults: options.maxResults ?? 10,
    };
  }

  /**
   * 异步加载书籍页面数据
   * @throws {Error} 当加载失败时
   */
  async loadPages(): Promise<PageItem[]> {
    if (this.pages.length > 0) {
      return this.pages;
    }
    try {
      const response = await fetch(this.options.bookPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${this.options.bookPath}`);
      }
      const data = (await response.json()) as string[];
      this.pages = data.map((text, idx) => ({ page: idx, text }));
      this._buildIndex();
      return this.pages;
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * 获取所有页面数据
   */
  getPages(): PageItem[] {
    return this.pages;
  }

  /**
   * 搜索
   * @param query - 搜索查询
   * @returns 搜索结果数组
   */
  search(query: string): FuseResult[] {
    if (!this.fuse) {
      throw new Error("Pages not loaded. Call loadPages() first.");
    }
    if (!query.trim()) return [];
    return this.fuse.search(query).slice(0, this.options.maxResults);
  }

  /**
   * 高亮匹配的文本片段
   * @param text - 原始文本
   * @param matches - Fuse.js 返回的匹配信息
   * @returns 包含 <mark> 标签的 HTML 字符串
   */
  highlight(text: string, matches: readonly FuseResultMatch[] = []): string {
    const m = matches.find((v) => v.key === "text");
    if (!m?.value) return text.slice(0, 90) + "…";
    let res = "";
    const { value, indices } = m;
    let pairIdx = 0;
    for (let i = 0; i < value.length; i++) {
      const [s, e] = indices[pairIdx] || [0, 0];
      if (i === s) res += "<mark>";
      res += value[i];
      if (i === e) {
        res += "</mark>";
        pairIdx++;
      }
    }
    return res;
  }

  /**
   * 构建 Fuse 索引（私有方法）
   */
  private _buildIndex(): void {
    this.fuse = new Fuse(this.pages, {
      keys: ["text"],
      includeScore: true,
      includeMatches: true,
      threshold: this.options.threshold,
      ignoreLocation: true,
    });
  }
}

/**
 * 创建全局的书籍搜索服务实例
 */
export const BookSearchService = new BookSearchService_();
