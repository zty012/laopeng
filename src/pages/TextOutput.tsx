import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, ArrowRight, CheckCircle, MessageCircle,
  FileText, AlignLeft, List, Quote, Lightbulb,
} from 'lucide-react';
import { useState } from 'react';
import PortalLayout from '../components/PortalLayout';

/* ----------------------------------------
   Data
------------------------------------------*/

const DOC_TYPES = [
  {
    id: 'report',
    icon: '📋',
    label: '研究报告',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    desc: '最常见的文本成果形式，展示研究过程与结论',
    sections: ['摘要', '研究背景', '研究方法', '数据分析', '结论与建议', '参考文献'],
  },
  {
    id: 'essay',
    icon: '✍️',
    label: '学术小论文',
    badge: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    desc: '围绕一个核心论点展开论证，有明确观点和依据',
    sections: ['引言', '文献综述', '论点一', '论点二', '论点三', '结论'],
  },
  {
    id: 'review',
    icon: '📑',
    label: '文献综述',
    badge: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    desc: '梳理该领域已有研究成果，找出研究空白',
    sections: ['研究背景', '国内研究现状', '国际研究现状', '研究空白与展望'],
  },
];

const STRUCTURE_TIPS = [
  {
    icon: <AlignLeft className="size-4" />,
    label: '论点要明确',
    desc: '每段只讲一件事，段首句直接亮出这段的核心观点，不要绕弯。',
  },
  {
    icon: <List className="size-4" />,
    label: '数据要有出处',
    desc: '引用数据必须标注来源，格式为"作者，年份，页码"，不能说"有数据显示"。',
  },
  {
    icon: <Quote className="size-4" />,
    label: '引用要区分直引和间引',
    desc: '直接引用用引号加脚注，间接引用（转述）则用括号内注。',
  },
  {
    icon: <Lightbulb className="size-4" />,
    label: '结论不能超出数据',
    desc: '你的结论只能由你收集到的数据支撑，不能凭感觉做超出范围的概括。',
  },
];

const WRITING_STEPS = [
  { step: '01', title: '提纲先行', desc: '动笔前列好大纲，确定每一级标题，明确各部分字数比例。' },
  { step: '02', title: '先写正文，最后写摘要', desc: '摘要是全文压缩，正文写完才能准确提炼，不要先写摘要。' },
  { step: '03', title: '初稿不求完美', desc: '第一遍先把内容填满，不要卡在某一句上。写完再统一修改。' },
  { step: '04', title: '至少修改三遍', desc: '第一遍查逻辑，第二遍查表达，第三遍查格式和引用。' },
];

const PROMPT_SUGGESTIONS = [
  '帮我把这段话改得更学术一点',
  '我的论点是……，帮我找三个支撑论据',
  '帮我写一段关于……的研究背景，约200字',
  '这段引用格式对吗，帮我检查一下',
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

export default function TextOutput() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') ?? '';
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const handleAsk = (q?: string) => {
    const text = q ?? query;
    if (text.trim()) navigate(`/chat?q=${encodeURIComponent(text)}`);
  };

  return (
    <PortalLayout>
      <div className="h-full px-10 py-8 overflow-auto flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to={`/interdisciplinary/search${category ? `?category=${category}` : ''}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-5" />
            </Link>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Step 3 / 4</p>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                制作文本性成果
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
            onClick={() => navigate(`/interdisciplinary/info${category ? `?category=${category}` : ''}`)}
          >
            <CheckCircle className="size-4" />
            已完成，下一步
            <ArrowRight className="size-4" />
          </Button>
        </div>

        {/* Choose doc type */}
        <div>
          <p className="text-sm text-muted-foreground mb-3">选择你要制作的文本成果类型：</p>
          <div className="grid grid-cols-3 gap-4">
            {DOC_TYPES.map(doc => (
              <Card
                key={doc.id}
                onClick={() => setSelectedDoc(doc.id === selectedDoc ? null : doc.id)}
                className={`cursor-pointer transition-all hover:scale-[1.01] select-none ${
                  selectedDoc === doc.id
                    ? 'ring-2 ring-primary shadow-lg scale-[1.02]'
                    : 'bg-muted/30 border-border'
                }`}
              >
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{doc.icon}</span>
                    {selectedDoc === doc.id && <CheckCircle className="size-4 text-primary" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="font-bold text-sm">{doc.label}</p>
                      <Badge className={`${doc.badge} border text-xs`}>{doc.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{doc.desc}</p>
                  </div>
                  {selectedDoc === doc.id && (
                    <div className="border-t border-border/50 pt-3">
                      <p className="text-xs text-muted-foreground mb-1.5">参考结构：</p>
                      <div className="flex flex-wrap gap-1">
                        {doc.sections.map((s, i) => (
                          <span key={s} className="text-xs bg-background/60 border border-border rounded px-1.5 py-0.5">
                            {i + 1}. {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Writing steps */}
        <div>
          <h2 className="text-base font-bold mb-3 flex items-center gap-2">
            <FileText className="size-4" />
            写作流程
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {WRITING_STEPS.map(s => (
              <div key={s.step} className="rounded-xl bg-muted/40 border border-border p-4 flex flex-col gap-2">
                <span className="text-xs font-bold text-primary">{s.step}</span>
                <p className="text-sm font-semibold">{s.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Structure tips */}
        <div>
          <h2 className="text-base font-bold mb-3">写作规范</h2>
          <div className="grid grid-cols-2 gap-3">
            {STRUCTURE_TIPS.map(tip => (
              <div
                key={tip.label}
                className="flex items-start gap-4 rounded-xl bg-background/50 border border-border p-4"
              >
                <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                  {tip.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold mb-0.5">{tip.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ask Laopeng quick prompts */}
        <div>
          <h2 className="text-base font-bold mb-3">让老彭帮你写</h2>
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
            卡住了？直接让老彭帮你写或改
          </p>
          <div className="flex gap-3 max-w-2xl">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAsk()}
              placeholder="例如：帮我写一段关于人工智能就业影响的研究背景，约300字"
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
