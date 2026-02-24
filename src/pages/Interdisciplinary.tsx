import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search, FileText, BarChart2, Target, MessageCircle } from 'lucide-react';
import { useState, useRef } from 'react';
import PortalLayout from '../components/PortalLayout';

const STEPS = [
  {
    id: 'topic',
    label: '明确选题',
    icon: <Target className="size-5" />,
    color: 'text-violet-400',
    ring: 'ring-violet-500/40',
    bg: 'bg-violet-500/10',
    to: '/interdisciplinary/topic',
    desc: '确定研究方向与问题',
  },
  {
    id: 'search',
    label: '检索资料',
    icon: <Search className="size-5" />,
    color: 'text-sky-400',
    ring: 'ring-sky-500/40',
    bg: 'bg-sky-500/10',
    to: '/interdisciplinary/search',
    desc: '查找一手 / 二手资料',
  },
  {
    id: 'text',
    label: '制作文本性成果',
    icon: <FileText className="size-5" />,
    color: 'text-amber-400',
    ring: 'ring-amber-500/40',
    bg: 'bg-amber-500/10',
    to: '/interdisciplinary/text',
    desc: '研究报告 / 论文 / 综述',
  },
  {
    id: 'info',
    label: '制作信息类成果',
    icon: <BarChart2 className="size-5" />,
    color: 'text-emerald-400',
    ring: 'ring-emerald-500/40',
    bg: 'bg-emerald-500/10',
    to: '/interdisciplinary/info',
    desc: '图表 / 海报 / 演示文稿',
  },
];

export default function Interdisciplinary() {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleAsk = () => {
    if (!query.trim()) return;
    navigate(`/chat?q=${encodeURIComponent(query)}`);
  };

  return (
    <PortalLayout>
      <div className="h-full px-10 py-8 overflow-auto flex flex-col gap-10">
        <div>
          <h1 className="text-2xl font-bold">跨学科专栏</h1>
          <p className="text-sm text-muted-foreground mt-1">按以下四步完成跨学科项目式学习</p>
        </div>

        {/* 4-step horizontal flow */}
        <div className="grid grid-cols-4 gap-4">
          {STEPS.map((step, i) => {
            const content = (
              <Card className={`${step.bg} ${step.ring} ring-1 hover:ring-2 transition-all h-full ${
                step.to ? 'cursor-pointer group' : 'opacity-50 cursor-not-allowed'
              }`}>
                <CardContent className="p-6 flex flex-col gap-4 min-h-48">
                  <div className="flex items-center justify-between">
                    <div className={`size-10 rounded-xl bg-background/40 flex items-center justify-center ${step.color}`}>
                      {step.icon}
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">0{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-base mb-1">{step.label}</p>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                  {step.to && (
                    <div className={`flex items-center gap-1 text-sm ${step.color} group-hover:translate-x-0.5 transition-transform`}>
                      点此开始 <ArrowRight className="size-4" />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
            return step.to ? (
              <Link to={step.to} key={step.id}>{content}</Link>
            ) : (
              <div key={step.id}>{content}</div>
            );
          })}
        </div>

        {/* Direct ask */}
        <div className="max-w-2xl">
          <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <MessageCircle className="size-4" />
            不知道从哪里开始？直接问老彭
          </p>
          <div className="flex gap-3">
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAsk()}
              placeholder="例如：我想研究人工智能对就业的影响，从哪里入手？"
              className="flex-1 bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary transition-all"
            />
            <Button onClick={handleAsk}>
              直接问 <ArrowRight className="size-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
