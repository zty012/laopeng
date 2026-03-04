"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useConversations } from '../store/useConversations';
import { useRouter } from 'next/navigation';
import { notes } from '@/lib/notes';

interface Props {
  title: string;
}

export default function NoteContent({ title }: Props) {
  const { createConversation } = useConversations();
  const router = useRouter();

  const note = notes.find(n => n.title === title);

  const handleCreateMindmap = () => {
    if (!note) return;
    const conversation = createConversation('default');
    const prompt = `请根据以下内容生成一个mermaid格式的思维导图（graph LR）：\n\n# ${note.title}\n${note.content}`;
    
    // Redirect to chat with the prompt
    router.push(`/chat?id=${conversation.id}&q=${encodeURIComponent(prompt)}`);
  };

  if (!note) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        未找到笔记内容
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 pb-20">
      <div className="flex items-center justify-between mb-8 pb-4 border-b">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={handleCreateMindmap}
        >
          <Share2 className="size-4" />
          生成思维导图
        </Button>
      </div>

      <Card className="p-8 shadow-sm">
        <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:border-b prose-h2:pb-2 prose-h2:mt-12 prose-a:text-primary">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {note.content}
          </ReactMarkdown>
        </article>
      </Card>
    </div>
  );
}
