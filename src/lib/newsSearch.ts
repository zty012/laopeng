import { searchQuery } from './searchFetch';

// Cache key includes today's date — stale keys are simply ignored and overwritten.
function todayKey(prefix: string) {
  const d = new Date();
  return `${prefix}_${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function readCache<T>(prefix: string): T | null {
  try {
    const raw = localStorage.getItem(todayKey(prefix));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeCache(prefix: string, data: unknown): void {
  try {
    // Prune any old keys for this prefix before writing.
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(prefix + '_') && key !== todayKey(prefix)) {
        localStorage.removeItem(key);
      }
    }
    localStorage.setItem(todayKey(prefix), JSON.stringify(data));
  } catch {
    // Quota errors — ignore silently.
  }
}

export interface NewsItem {
  id: number;
  category: string;
  title: string;
  summary: string;
  date: string;
  hot: boolean;
  agentQuery: string;
}

export interface HomeData {
  topic: { title: string; hint: string; tags: string[] };
  headline: { title: string; source: string; date: string };
}

function todayStr() {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** 首页数据：今日思辨话题 + 今日要闻 */
export async function fetchHomeData(): Promise<HomeData> {
  const cached = readCache<HomeData>('home_data');
  if (cached) return cached;

  const raw = await searchQuery(
    `今天是${todayStr()}。请返回一个合法JSON对象，不要有任何说明文字，只返回JSON：
{
  "topic": {
    "title": "一个基于近期热点、适合初中生讨论的思辨话题，20字以内",
    "hint": "提示从哪些角度思考，30字以内，以"提示："开头",
    "tags": ["标签1", "标签2", "标签3"]
  },
  "headline": {
    "title": "今天中国最重要的一条新闻标题，30字以内",
    "source": "媒体来源名称",
    "date": "发布日期，格式 YYYY-MM-DD"
  }
}`
  );

  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('fetchHomeData: no JSON found');
  const data = JSON.parse(match[0]) as HomeData;
  writeCache('home_data', data);
  return data;
}

/** 新闻专栏：6条近期新闻 */
export async function fetchNewsList(): Promise<NewsItem[]> {
  const cached = readCache<NewsItem[]>('news_list');
  if (cached) return cached;

  const raw = await searchQuery(
    `今天是${todayStr()}。请返回一个合法JSON数组，包含6条近期（最近两周内）重要新闻，适合初中生关注，覆盖教育、科技、社会、环境、文化、时政不同领域，每个领域各一条。只返回JSON数组，不要有任何说明文字：
[
  {
    "id": 1,
    "category": "教育",
    "title": "新闻标题，30字以内",
    "summary": "两句话摘要，60字以内",
    "date": "发布日期，格式 YYYY-MM-DD",
    "hot": true,
    "agentQuery": "一个适合请语文AI老师解读此新闻的问题，用于写作练习"
  }
]`
  );

  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('fetchNewsList: no JSON found');
  const items = (JSON.parse(match[0]) as NewsItem[]).map((item, i) => ({ ...item, id: item.id ?? i + 1 }));
  writeCache('news_list', items);
  return items;
}
