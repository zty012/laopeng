import { Link } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Trash2, MessageSquare, Home } from 'lucide-react';
import type { Agent, Conversation } from '../types';
import AgentPicker from './AgentPicker';

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  agents: Agent[];
  selectedAgentId: string;
  onAgentChange: (agentId: string) => void;
}

export default function Sidebar({
  conversations, activeId, onSelect, onNew, onDelete,
  agents, selectedAgentId, onAgentChange,
}: Props) {
  return (
    <aside className="flex flex-col w-60 shrink-0 border-r border-border bg-card h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                <Home className="size-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">返回首页</TooltipContent>
          </Tooltip>
          <MessageSquare className="size-4 text-primary" />
          <span className="font-semibold text-sm">老彭 AI</span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" onClick={onNew}>
              <Plus className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">新建对话</TooltipContent>
        </Tooltip>
      </div>

      {/* Agent picker for new conversations */}
      <div className="px-2 pb-2">
        <AgentPicker
          agents={agents}
          selectedId={selectedAgentId}
          onSelect={onAgentChange}
          variant="sidebar"
        />
      </div>

      <Separator />

      <ScrollArea className="flex-1 px-2 py-2">
        {conversations.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center mt-6 px-2">
            暂无对话，点击 + 开始
          </p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center gap-1 rounded-md px-2 py-1.5 cursor-pointer transition-colors hover:bg-accent ${
                  conv.id === activeId
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                }`}
                onClick={() => onSelect(conv.id)}
              >
                <span className="flex-1 text-sm truncate">{conv.title}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('确认删除此对话？')) onDelete(conv.id);
                      }}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">删除</TooltipContent>
                </Tooltip>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
