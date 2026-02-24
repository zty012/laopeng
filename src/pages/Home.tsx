import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BookOpen, Microscope, MessageCircle, Lightbulb, Newspaper } from 'lucide-react';
import PortalLayout from '../components/PortalLayout';

const DAILY_TOPIC = {
  title: '在信息爆炸的时代，"慢阅读"还有价值吗？',
  tags: ['思辨', '语文', '时政'],
  hint: '提示：可以从"深度 vs 碎片"、"专注力"等角度切入',
};

const DAILY_NEWS = {
  title: '教育部发布新课标：跨学科主题学习将占课时10%以上',
  source: '人民教育',
  date: '今日',
};

const COLUMNS = [
  {
    to: '/news',
    icon: <Newspaper className="size-6" />,
    title: '新闻专栏',
    desc: '时事热点、新闻评论与素材积累，训练时评写作思维。',
    color: 'from-blue-500/20 to-blue-600/10 border-blue-500/20 hover:border-blue-500/50',
    badge: '热门',
  },
  {
    to: '/interdisciplinary',
    icon: <Microscope className="size-6" />,
    title: '跨学科专栏',
    desc: '从选题到成果，手把手完成跨学科项目式学习。',
    color: 'from-violet-500/20 to-violet-600/10 border-violet-500/20 hover:border-violet-500/50',
    badge: '新',
  },
  {
    to: '/poetry',
    icon: <BookOpen className="size-6" />,
    title: '古诗文专栏',
    desc: '字词注解、典故溯源、意象赏析、手法精讲一站式搞定。',
    color: 'from-amber-500/20 to-amber-600/10 border-amber-500/20 hover:border-amber-500/50',
    badge: null,
  },
  {
    to: '/chat',
    icon: <MessageCircle className="size-6" />,
    title: '来聊聊天吧',
    desc: '直接和老彭对话，随时提问、讨论或头脑风暴。',
    color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 hover:border-emerald-500/50',
    badge: null,
  },
];

export default function Home() {
  return (
    <PortalLayout>
      <div className="h-full flex flex-col px-10 py-8 gap-8 overflow-auto">
        <div>
          <h1 className="text-2xl font-bold">今日概览</h1>
          <p className="text-sm text-muted-foreground mt-1">2026年2月22日 · 星期日</p>
        </div>

        {/* Top row: 今日思辨主题 + 今日新闻 */}
        <div className="grid grid-cols-3 gap-6">
          <Link to={`/chat?q=${encodeURIComponent(`今日思辨主题：${DAILY_TOPIC.title}\n\n${DAILY_TOPIC.hint}\n\n请帮我从多个角度分析这个话题，给出思辨写作的思路和论点。`)}`} className="col-span-2">
            <Card className="bg-linear-to-br from-primary/10 to-primary/5 border-primary/20 hover:border-primary/50 transition-all cursor-pointer group h-full">
              <CardContent className="p-8 flex flex-col gap-4 h-full min-h-52">
                <div className="flex items-center gap-2 text-primary">
                  <Lightbulb className="size-5" />
                  <span className="text-xs font-semibold uppercase tracking-widest">今日思辨主题</span>
                </div>
                <h2 className="text-2xl font-bold leading-snug text-foreground flex-1">
                  {DAILY_TOPIC.title}
                </h2>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {DAILY_TOPIC.tags.map(t => (
                      <Badge key={t} variant="secondary">{t}</Badge>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1.5">
                    开始思辨 <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
                <p className="text-sm text-muted-foreground border-t border-border pt-3">{DAILY_TOPIC.hint}</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/news">
            <Card className="bg-linear-to-br from-sky-500/10 to-sky-600/5 border-sky-500/20 hover:border-sky-500/50 transition-all cursor-pointer group h-full">
              <CardContent className="p-8 flex flex-col gap-4 h-full min-h-52">
                <div className="flex items-center gap-2 text-sky-400">
                  <Newspaper className="size-5" />
                  <span className="text-xs font-semibold uppercase tracking-widest">今日新闻</span>
                </div>
                <h2 className="text-lg font-bold leading-snug text-foreground flex-1">{DAILY_NEWS.title}</h2>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{DAILY_NEWS.source}</span>
                  <span className="group-hover:text-foreground transition-colors flex items-center gap-1.5">
                    {DAILY_NEWS.date} <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Bottom row: 4 columns */}
        <div className="grid grid-cols-4 gap-6">
          {COLUMNS.map((col) => (
            <Link to={col.to} key={col.to}>
              <Card className={`bg-linear-to-br ${col.color} cursor-pointer transition-all hover:scale-[1.02] group h-full`}>
                <CardContent className="p-6 flex flex-col gap-4 h-full min-h-44">
                  <div className="flex items-start justify-between">
                    <div className="size-11 rounded-xl bg-background/40 flex items-center justify-center text-foreground">
                      {col.icon}
                    </div>
                    {col.badge && <Badge className="text-xs">{col.badge}</Badge>}
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <h3 className="font-bold text-base">{col.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{col.desc}</p>
                  </div>
                  <div className="flex items-center justify-end text-sm text-muted-foreground group-hover:text-foreground transition-colors gap-1">
                    进入 <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
}
