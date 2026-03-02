"use client";

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import PortalLayout from '../components/PortalLayout';

const POETRY_AGENTS = [
  {
    id: 'word-explainer',
    icon: '🔤',
    title: '疑难字词讲解',
    desc: '自动提取并解析文言难字，音义用法一网打尽',
    color: 'from-rose-500/15 to-rose-600/5 border-rose-500/20 hover:border-rose-500/50',
  },
  {
    id: 'allusion-tracer',
    icon: '📖',
    title: '典故溯源',
    desc: '追溯典故出处、本义与历代演变',
    color: 'from-amber-500/15 to-amber-600/5 border-amber-500/20 hover:border-amber-500/50',
  },
  {
    id: 'translator',
    icon: '🔄',
    title: '古今对译窗',
    desc: '直译 + 意译双栏对比，字字落实',
    color: 'from-sky-500/15 to-sky-600/5 border-sky-500/20 hover:border-sky-500/50',
  },
  {
    id: 'imagery-library',
    icon: '🌸',
    title: '意象赏析库',
    desc: '梳理意象典型用法与情感内涵',
    color: 'from-pink-500/15 to-pink-600/5 border-pink-500/20 hover:border-pink-500/50',
  },
  {
    id: 'rhetoric-coach',
    icon: '✍️',
    title: '手法精讲',
    desc: '修辞手法详解 + 即时仿写练习',
    color: 'from-violet-500/15 to-violet-600/5 border-violet-500/20 hover:border-violet-500/50',
  },
  {
    id: 'famous-lines',
    icon: '⭐',
    title: '名句深度游',
    desc: '多维解读名句，串联上下文与后世影响',
    color: 'from-emerald-500/15 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-500/50',
  },
];

export default function Poetry() {
  return (
    <PortalLayout>
      <div className="h-full px-10 py-8 overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">古诗文专栏</h1>
          <p className="text-sm text-muted-foreground mt-1">选择一个学习助手开始对话</p>
        </div>
        <div className="grid grid-cols-3 gap-5">
          {POETRY_AGENTS.map((agent) => (
            <Link key={agent.id} href={`/chat?agent=${agent.id}`}>
              <Card className={`bg-linear-to-br ${agent.color} cursor-pointer transition-all hover:scale-[1.02] group h-full`}>
                <CardContent className="p-6 flex flex-col gap-4 h-full min-h-44">
                  <span className="text-3xl">{agent.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-base mb-1.5">{agent.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{agent.desc}</p>
                  </div>
                  <div className="flex items-center justify-end text-sm text-muted-foreground group-hover:text-foreground transition-colors gap-1.5">
                    开始对话 <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
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
