import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, CheckCircle, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import PortalLayout from '../components/PortalLayout';

const CATEGORIES = [
  {
    id: 'humanities',
    title: '人文时政',
    icon: '📜',
    color: 'from-rose-500/20 to-rose-600/10 border-rose-500/20 hover:border-rose-500/40',
    subjects: ['语文', '政治', '历史', '地理'],
    examples: ['政策解读', '历史事件', '文化传承'],
  },
  {
    id: 'science',
    title: '自然科学',
    icon: '🔬',
    color: 'from-sky-500/20 to-sky-600/10 border-sky-500/20 hover:border-sky-500/40',
    subjects: ['语文', '生物', '物理', '化学', '地理'],
    examples: ['生态环境', '能源技术', '生命科学'],
  },
  {
    id: 'arts',
    title: '艺术信息',
    icon: '🎨',
    color: 'from-amber-500/20 to-amber-600/10 border-amber-500/20 hover:border-amber-500/40',
    subjects: ['语文', '美术', '音乐', '信息技术'],
    examples: ['数字艺术', '视觉传达', '音乐叙事'],
  },
  {
    id: 'stem',
    title: '文理融合',
    icon: '⚡',
    color: 'from-violet-500/20 to-violet-600/10 border-violet-500/20 hover:border-violet-500/40',
    subjects: ['语文', '数学', '物理', '化学'],
    examples: ['数据可视化', '科学写作', '逻辑建模'],
  },
];

export default function TopicSelection() {
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selected) {
      navigate(`/interdisciplinary/search?category=${selected}`);
    }
  };

  const handleAsk = () => {
    if (query.trim()) {
      navigate(`/chat?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <PortalLayout>
      <div className="h-full px-10 py-8 overflow-auto flex flex-col gap-8">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/interdisciplinary" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="size-5" />
            </Link>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Step 1 / 4</p>
              <h1 className="text-2xl font-bold">明确选题</h1>
            </div>
          </div>
          <Button
            onClick={handleContinue}
            disabled={!selected}
            size="lg"
            variant={selected ? 'default' : 'outline'}
            className="gap-2"
          >
            <CheckCircle className="size-4" />
            已完成，下一步
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">请选择你的研究方向所属类别：</p>

        {/* Category cards — 4 columns */}
        <div className="grid grid-cols-4 gap-5">
          {CATEGORIES.map(cat => (
            <Card
              key={cat.id}
              onClick={() => setSelected(cat.id === selected ? null : cat.id)}
              className={`bg-linear-to-br ${cat.color} cursor-pointer transition-all select-none ${
                selected === cat.id
                  ? 'ring-2 ring-primary shadow-lg scale-[1.02]'
                  : 'hover:scale-[1.01]'
              }`}
            >
              <CardContent className="p-6 flex flex-col gap-4 min-h-52">
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{cat.icon}</span>
                  {selected === cat.id && (
                    <CheckCircle className="size-5 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base mb-2">{cat.title}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.subjects.map(s => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground border-t border-border/50 pt-3">
                  {cat.examples.join(' · ')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom chat input */}
        <div className="mt-auto pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <MessageCircle className="size-4" />
            不确定选哪个方向？问问老彭
          </p>
          <div className="flex gap-3 max-w-2xl">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAsk()}
              placeholder="描述你感兴趣的主题，老彭帮你定方向…"
              className="flex-1 bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary transition-all"
            />
            <Button onClick={handleAsk}>
              问老彭 <ArrowRight className="size-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
