"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, ArrowRight, CheckCircle, MessageCircle,
  BarChart2, Palette, MonitorPlay, Layout,
} from 'lucide-react';
import { useState, Suspense } from 'react';
import PortalLayout from '../components/PortalLayout';

/* ----------------------------------------
   Data
------------------------------------------*/

const INFO_TYPES = [
  {
    id: 'chart',
    icon: '📊',
    label: '数据图表',
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    desc: '将研究数据可视化，让结论一目了然',
    tools: [
      { name: 'Excel / WPS', tip: '柱状图、折线图、饼图，最通用的选择' },
      { name: 'Python matplotlib', tip: '适合数据量大或需要定制样式的场景' },
      { name: '图表秀 / ECharts', tip: '在线生成，效果漂亮，适合报告插图' },
    ],
    tips: ['横轴纵轴必须有单位和标注', '颜色不要超过 5 种，否则视觉混乱', '图表下方写上数据来源'],
  },
  {
    id: 'poster',
    icon: '🎨',
    label: '信息海报',
    badge: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
    desc: '把研究结论浓缩成一张视觉清晰的图文海报',
    tools: [
      { name: 'Canva', tip: '模板丰富，拖拽操作，适合零基础' },
      { name: '稿定设计', tip: '国内版 Canva，中文排版更友好' },
      { name: 'Adobe Express', tip: '效果更精细，适合有一定审美基础的同学' },
    ],
    tips: ['一张海报只传达一个核心信息', '文字不要超过全图 30%，以图为主', '留白是设计，不是没内容'],
  },
  {
    id: 'slides',
    icon: '🖥️',
    label: '演示文稿',
    badge: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    desc: '在答辩或展示时使用，辅助口头表达',
    tools: [
      { name: 'PowerPoint / WPS 演示', tip: '最通用，兼容性最好' },
      { name: 'Canva Presentation', tip: '模板好看，在线协作，导出为 PDF' },
      { name: 'Gamma', tip: 'AI 辅助生成 PPT 框架，再手动调整内容' },
    ],
    tips: ['每页不超过 5 行文字，字号不低于 20px', '演讲稿写在备注里，页面上只放关键词', '最后一页放参考文献，不要省略'],
  },
];

const DESIGN_PRINCIPLES = [
  {
    icon: <Layout className="size-4" />,
    label: '对齐',
    desc: '所有元素靠格线对齐，不要随意摆放，视觉上整齐才显得专业。',
  },
  {
    icon: <Palette className="size-4" />,
    label: '配色',
    desc: '主色一个，辅色一个，强调色一个，三色以内。可以直接从 Canva 的配色方案里选。',
  },
  {
    icon: <BarChart2 className="size-4" />,
    label: '数据优先',
    desc: '信息类成果的核心是数据，装饰服务于数据，不要让花哨的背景盖过核心内容。',
  },
  {
    icon: <MonitorPlay className="size-4" />,
    label: '演示节奏',
    desc: '答辩时每张 PPT 控制在 1—2 分钟，提前计时排练，不要临场超时。',
  },
];

const PROMPT_SUGGESTIONS = [
  '帮我设计一张关于……的海报文案',
  '我有这些数据，适合用哪种图表展示',
  '帮我写 PPT 每一页的标题和要点',
  '这张图表该如何解读，写一段说明文字',
];

const CATEGORY_LABELS: Record<string, string> = {
  humanities: '人文时政',
  science: '自然科学',
  arts: '艺术信息',
  stem: '文理融合',
};

/* ----------------------------------------
   Component
------------------------------------------*/

function InfoOutputContent() {
  const searchParams = useSearchParams();
  const category = searchParams?.get('category') ?? '';
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const handleAsk = (q?: string) => {
    const text = q ?? query;
    if (text.trim()) router.push(`/chat?q=${encodeURIComponent(text)}`);
  };

  const selectedInfo = INFO_TYPES.find(t => t.id === selected);

  return (
    <PortalLayout>
      <div className="h-full px-10 py-8 overflow-auto flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/interdisciplinary/text${category ? `?category=${category}` : ''}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Step 4 / 4</p>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                制作信息类成果
                {category && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    {CATEGORY_LABELS[category]}
                  </Badge>
                )}
              </h1>
            </div>
          </div>
          <Button
            size="lg"
            className="gap-2"
            onClick={() => router.push('/interdisciplinary')}
          >
            <CheckCircle className="size-4" />
            全部完成，返回总览
            <ArrowRight className="size-4" />
          </Button>
        </div>

        {/* Type selection */}
        <div>
          <p className="text-sm text-muted-foreground mb-3">选择你要制作的信息类成果形式：</p>
          <div className="grid grid-cols-3 gap-4">
            {INFO_TYPES.map(type => (
              <Card
                key={type.id}
                onClick={() => setSelected(type.id === selected ? null : type.id)}
                className={`cursor-pointer transition-all hover:scale-[1.01] select-none ${
                  selected === type.id
                    ? 'ring-2 ring-primary shadow-lg scale-[1.02]'
                    : 'bg-muted/30 border-border'
                }`}
              >
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{type.icon}</span>
                    {selected === type.id && <CheckCircle className="size-4 text-primary" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="font-bold text-sm">{type.label}</p>
                      <Badge className={`${type.badge} border text-xs`}>{type.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{type.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Selected type detail — tools + tips */}
        {selectedInfo && (
          <div className="grid grid-cols-2 gap-5">
            <Card className="bg-muted/30 border-border">
              <CardContent className="p-5 flex flex-col gap-3">
                <p className="text-sm font-bold">推荐工具</p>
                <div className="flex flex-col gap-2">
                  {selectedInfo.tools.map(tool => (
                    <div key={tool.name} className="flex items-start gap-3 rounded-lg p-3 bg-background/50">
                      <span className="text-xs font-semibold bg-primary/10 text-primary rounded px-1.5 py-0.5 shrink-0">{tool.name}</span>
                      <span className="text-xs text-muted-foreground">{tool.tip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 border-border">
              <CardContent className="p-5 flex flex-col gap-3">
                <p className="text-sm font-bold">注意事项</p>
                <div className="flex flex-col gap-2">
                  {selectedInfo.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                      <span className="text-xs font-bold text-primary shrink-0">0{i + 1}</span>
                      <span className="text-xs text-muted-foreground">{tip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Design principles */}
        <div>
          <h2 className="text-base font-bold mb-3">通用设计原则</h2>
          <div className="grid grid-cols-4 gap-3">
            {DESIGN_PRINCIPLES.map(p => (
              <div
                key={p.label}
                className="flex flex-col gap-3 rounded-xl bg-muted/40 border border-border p-4"
              >
                <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                  {p.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold mb-0.5">{p.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick prompts */}
        <div>
          <h2 className="text-base font-bold mb-3">让老彭帮你做</h2>
          <div className="flex flex-wrap gap-2">
            {PROMPT_SUGGESTIONS.map(p => (
              <button
                key={p}
                onClick={() => handleAsk(p)}
                className="text-sm bg-muted/50 hover:bg-muted border border-border rounded-full px-4 py-1.5 transition-colors cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom chat input */}
        <div className="mt-auto pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <MessageCircle className="size-4" />
            需要帮忙？让老彭帮你出创意或写文案
          </p>
          <div className="flex gap-3 max-w-2xl">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAsk()}
              placeholder="例如：我的研究主题是垃圾分类，帮我设计一张海报的文案和布局"
              className="flex-1 bg-muted/50 border border-border rounded-lg px-4 py-2.5 text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary transition-all"
            />
            <Button onClick={() => handleAsk()}>
              问老彭 <ArrowRight className="size-4 ml-1" />
            </Button>
          </div>
        </div>

      </div>
    </PortalLayout>
  );
}

export default function InfoOutput() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InfoOutputContent />
    </Suspense>
  );
}
