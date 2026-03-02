"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, ArrowRight, CheckCircle, MessageCircle,
  Globe, BookOpen, Database, Microscope, FileSearch,
  ExternalLink,
} from 'lucide-react';
import { useState, Suspense } from 'react';
import PortalLayout from '../components/PortalLayout';

/* ----------------------------------------
   Data
------------------------------------------*/

const SOURCE_TYPES = [
  {
    id: 'primary',
    label: '一手资料',
    badge: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    desc: '直接来源于研究对象的原始资料，可信度最高',
    items: [
      { icon: '🗣️', name: '访谈 / 问卷', tip: '自行设计问题，访问相关人士或同龄群体' },
      { icon: '🔬', name: '实验 / 观测', tip: '在实验室或现场直接获取数据' },
      { icon: '📰', name: '原始文献', tip: '官方公报、统计年鉴、政策原文、古籍原文' },
      { icon: '🎙️', name: '实地考察', tip: '博物馆、社区、工厂、自然保护区等' },
    ],
  },
  {
    id: 'secondary',
    label: '二手资料',
    badge: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    desc: '对一手资料进行整理、分析后的二次加工成果',
    items: [
      { icon: '📚', name: '学术论文', tip: '知网、万方、维普；CNKI 可用学校账户访问' },
      { icon: '📖', name: '专著 / 教材', tip: '图书馆馆藏或超星电子书；注意出版年份' },
      { icon: '🌐', name: '权威网站', tip: '政府官网、学术机构官网、WHO / 联合国等' },
      { icon: '🗞️', name: '新闻报道', tip: '人民日报、新华网、BBC 等，注意核实来源' },
    ],
  },
];

const DATABASES = [
  {
    name: '中国知网 CNKI',
    url: 'https://www.cnki.net',
    icon: <Database className="size-4" />,
    tags: ['论文', '期刊', '学位'],
    for: ['humanities', 'science', 'arts', 'stem'],
  },
  {
    name: '国家统计局',
    url: 'https://www.stats.gov.cn',
    icon: <Globe className="size-4" />,
    tags: ['数据', '统计年鉴'],
    for: ['humanities', 'stem'],
  },
  {
    name: '中国科技论文在线',
    url: 'http://www.paper.edu.cn',
    icon: <Microscope className="size-4" />,
    tags: ['理工', '预印本'],
    for: ['science', 'stem'],
  },
  {
    name: '故宫博物院数据库',
    url: 'https://www.dpm.org.cn',
    icon: <BookOpen className="size-4" />,
    tags: ['文物', '历史', '艺术'],
    for: ['humanities', 'arts'],
  },
  {
    name: '中国政府网',
    url: 'https://www.gov.cn',
    icon: <FileSearch className="size-4" />,
    tags: ['政策', '公告', '法规'],
    for: ['humanities', 'stem'],
  },
  {
    name: '超星图书馆',
    url: 'https://www.chaoxing.com',
    icon: <BookOpen className="size-4" />,
    tags: ['电子书', '期刊'],
    for: ['humanities', 'science', 'arts', 'stem'],
  },
  {
    name: '中国生物多样性信息',
    url: 'http://www.biodiversity.cn',
    icon: <Microscope className="size-4" />,
    tags: ['生物', '生态'],
    for: ['science'],
  },
  {
    name: '国家文物局数据库',
    url: 'https://www.ncha.gov.cn',
    icon: <BookOpen className="size-4" />,
    tags: ['文物', '历史', '地方'],
    for: ['humanities', 'arts'],
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  humanities: '人文时政',
  science: '自然科学',
  arts: '艺术信息',
  stem: '文理融合',
};

const TIPS = [
  { label: '关键词拆分', desc: '将研究问题拆成 2–3 个关键词，分别搜索再交叉比对' },
  { label: '时间限定', desc: '加上年份范围（如"2020–2025"），过滤过时信息' },
  { label: '来源核实', desc: '对同一结论，找至少 2 个不同来源相互印证' },
  { label: '引文追溯', desc: '在论文参考文献中顺藤摸瓜，找到更原始的一手资料' },
];

/* ----------------------------------------
   Component
------------------------------------------*/

function SearchResourcesContent() {
  const searchParams = useSearchParams();
  const category = searchParams?.get('category') ?? '';
  const router = useRouter();
  const [query, setQuery] = useState('');

  const filteredDBs = DATABASES.filter(
    db => !category || db.for.includes(category),
  );

  const handleAsk = () => {
    if (query.trim()) {
      router.push(`/chat?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <PortalLayout>
      <div className="h-full px-10 py-8 overflow-auto flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/interdisciplinary/topic${category ? `?preselect=${category}` : ''}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Step 2 / 4</p>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                检索资料
                {category && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    {CATEGORY_LABELS[category]}
                  </Badge>
                )}
              </h1>
            </div>
          </div>
          <Button size="lg" className="gap-2" onClick={() => router.push(`/interdisciplinary/text${category ? `?category=${category}` : ''}`)}>
            <CheckCircle className="size-4" />
            已完成，下一步
            <ArrowRight className="size-4" />
          </Button>
        </div>

        {/* 一手 / 二手资料 */}
        <div className="grid grid-cols-2 gap-5">
          {SOURCE_TYPES.map(type => (
            <Card key={type.id} className="bg-muted/30 border-border">
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Badge className={`${type.badge} border font-semibold`}>{type.label}</Badge>
                  <span className="text-xs text-muted-foreground">{type.desc}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {type.items.map(item => (
                    <div
                      key={item.name}
                      className="flex items-start gap-3 rounded-lg p-3 bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <span className="text-lg leading-none mt-0.5">{item.icon}</span>
                      <div>
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recommended databases */}
        <div>
          <h2 className="text-base font-bold mb-3">
            推荐资料库
            {category && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                — 为「{CATEGORY_LABELS[category]}」筛选
              </span>
            )}
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {filteredDBs.map(db => (
              <a
                key={db.name}
                href={db.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="bg-background/50 hover:bg-muted/50 border-border hover:border-primary/40 transition-all cursor-pointer">
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-muted-foreground group-hover:text-primary transition-colors">
                      {db.icon}
                      <ExternalLink className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm font-semibold">{db.name}</p>
                    <div className="flex flex-wrap gap-1">
                      {db.tags.map(t => (
                        <Badge key={t} variant="secondary" className="text-xs px-1.5 py-0">{t}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>

        {/* Search tips */}
        <div>
          <h2 className="text-base font-bold mb-3">检索技巧</h2>
          <div className="grid grid-cols-4 gap-3">
            {TIPS.map(tip => (
              <div
                key={tip.label}
                className="rounded-xl bg-muted/40 border border-border p-4 flex flex-col gap-1.5"
              >
                <p className="text-sm font-semibold text-foreground">{tip.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom chat input */}
        <div className="mt-auto pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <MessageCircle className="size-4" />
            找不到合适的资料？让老彭帮你指引
          </p>
          <div className="flex gap-3 max-w-2xl">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAsk()}
              placeholder="例如：我研究碳中和，有哪些可靠的中文数据来源？"
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

export default function SearchResources() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResourcesContent />
    </Suspense>
  );
}
