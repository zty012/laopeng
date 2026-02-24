import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import PortalLayout from '../components/PortalLayout';
import { fetchNewsList, type NewsItem } from '../lib/newsSearch';

const FALLBACK_ITEMS: NewsItem[] = [
  { id: 1, category: '教育', title: '教育部：2025年起高中跨学科主题学习课时不低于10%', summary: '新课标要求各学科设置跨学科主题学习活动，强化知识整合与实践能力培养。', date: '2024-12-18', hot: true, agentQuery: '请帮我分析跨学科学习对高中生的影响，以及如何在学习中落实？' },
  { id: 2, category: '科技', title: 'DeepSeek R1 开源发布，国产大模型首次登顶全球排行', summary: '深度求索发布R1推理模型，性能比肩GPT-4o，完全开源免费可商用，引发全球关注。', date: '2025-01-20', hot: true, agentQuery: '请从语文写作角度帮我分析DeepSeek事件的评论要点' },
  { id: 3, category: '社会', title: '2025年春节假期延长至8天，"世界非遗"春节申遗成功', summary: '联合国教科文组织正式将"春节——中国人庆祝传统新年的社会实践"列入非遗名录。', date: '2024-12-05', hot: false, agentQuery: '以"春节申遗成功"为话题，帮我构思一篇时评的论点和论据' },
  { id: 4, category: '环境', title: '全球气温连续12个月突破1.5°C气候警戒线', summary: '欧洲气候变化服务机构确认，2024年成为有记录以来最热年份，全年平均气温超历史记录。', date: '2025-01-10', hot: false, agentQuery: '气候变化话题的思辨写作如何立意？帮我列举几个有深度的论点' },
  { id: 5, category: '文化', title: '北京故宫《千里江山图》特展观众突破50万人次', summary: '故宫博物院数字化与实体展览并行，引发年轻群体对传统文化的广泛讨论。', date: '2024-11-28', hot: false, agentQuery: '《千里江山图》的艺术价值和文化意义是什么？帮我分析一下' },
  { id: 6, category: '时政', title: '中国城镇化率突破67%，乡村振兴进入攻坚阶段', summary: '国家统计局数据显示，城乡居民收入差距继续缩小，农村基础设施建设投入创历史新高。', date: '2025-01-17', hot: false, agentQuery: '城镇化与乡村振兴的辩证关系是什么？帮我梳理论点用于写作' },
];

const CATEGORY_COLORS: Record<string, string> = {
  教育: 'bg-sky-500/20 text-sky-400',
  科技: 'bg-violet-500/20 text-violet-400',
  社会: 'bg-emerald-500/20 text-emerald-400',
  环境: 'bg-green-500/20 text-green-400',
  文化: 'bg-amber-500/20 text-amber-400',
  时政: 'bg-rose-500/20 text-rose-400',
};

export default function News() {
  const [items, setItems] = useState<NewsItem[]>(FALLBACK_ITEMS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNewsList()
      .then(setItems)
      .catch(() => setItems(FALLBACK_ITEMS))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalLayout>
      <div className="h-full px-10 py-8 overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">新闻专栏</h1>
          <p className="text-sm text-muted-foreground mt-1">时事热点 · 素材积累 · 评论写作</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-border">
                  <CardContent className="p-6 flex flex-col gap-3">
                    <div className="flex gap-2">
                      <div className="h-4 w-12 rounded bg-muted/60 animate-pulse" />
                      <div className="h-4 w-20 rounded bg-muted/40 animate-pulse ml-auto" />
                    </div>
                    <div className="h-5 w-full rounded bg-muted/60 animate-pulse" />
                    <div className="h-4 w-4/5 rounded bg-muted/40 animate-pulse" />
                    <div className="h-4 w-3/5 rounded bg-muted/40 animate-pulse" />
                  </CardContent>
                </Card>
              ))
            : items.map((item) => (
                <Card
                  key={item.id}
                  className="hover:border-foreground/20 transition-all group"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${CATEGORY_COLORS[item.category] ?? 'bg-muted text-muted-foreground'}`}>
                        {item.category}
                      </span>
                      {item.hot && <Badge variant="destructive" className="text-xs">热</Badge>}
                      <span className="text-xs text-muted-foreground ml-auto">{item.date}</span>
                    </div>
                    <h3 className="font-semibold text-base leading-snug mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{item.summary}</p>
                    <div className="flex items-center gap-4 pt-3 border-t border-border/50">
                      <Link
                        to={`/chat?q=${encodeURIComponent(item.agentQuery)}`}
                        className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        请老彭解读 <ArrowRight className="size-3.5" />
                      </Link>
                      <span className="text-border">·</span>
                      <Link
                        to="/interdisciplinary/topic"
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        以此选题 <ExternalLink className="size-3.5" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>
      </div>
    </PortalLayout>
  );
}

