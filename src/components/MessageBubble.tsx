import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Message } from '../types';

interface Props {
  message: Message;
  isStreaming?: boolean;
}

export default function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 mb-5 ${
      isUser ? 'flex-row-reverse' : 'flex-row'
    }`}>
      <Avatar className="size-8 shrink-0">
        <AvatarFallback className={isUser
          ? 'bg-primary text-primary-foreground text-xs'
          : 'bg-muted text-muted-foreground text-xs'
        }>
          {isUser ? '你' : 'AI'}
        </AvatarFallback>
      </Avatar>

      <div className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
        isUser
          ? 'bg-primary text-primary-foreground rounded-tr-sm'
          : 'bg-muted text-foreground rounded-tl-sm'
      }`}>
        {isUser ? (
          <p className="m-0 whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content || (isStreaming ? '' : '')}
            </ReactMarkdown>
            {isStreaming && message.content === '' && (
              <span className="inline-block w-0.5 h-4 bg-current animate-pulse" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
