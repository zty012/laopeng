import { ChevronDown, Bot, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Agent } from '../types';

interface Props {
  agents: Agent[];
  selectedId: string;
  onSelect: (agentId: string) => void;
  /** 显示为紧凑的图标+名称模式（用于侧边栏）或完整卡片模式（用于聊天头部）*/
  variant?: 'sidebar' | 'header';
}

export default function AgentPicker({ agents, selectedId, onSelect, variant = 'header' }: Props) {
  const current = agents.find((a) => a.id === selectedId) ?? agents[0];
  if (!current) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'header' ? (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium"
          >
            <Bot className="size-3.5 text-primary" />
            <span>{current.name}</span>
            <ChevronDown className="size-3 text-muted-foreground" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Bot className="size-3.5 shrink-0 text-primary" />
            <span className="truncate">{current.name}</span>
            <ChevronDown className="size-3 ml-auto shrink-0" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={variant === 'header' ? 'start' : 'end'} className="w-56">
        {agents.map((agent) => (
          <DropdownMenuItem
            key={agent.id}
            onSelect={() => onSelect(agent.id)}
            className="flex flex-col items-start gap-0.5 py-2 cursor-pointer"
          >
            <div className="flex items-center gap-2 w-full">
              <span className="font-medium text-sm">{agent.name}</span>
              {agent.id === selectedId && <Check className="size-3.5 ml-auto text-primary" />}
            </div>
            {agent.description && (
              <span className="text-xs text-muted-foreground leading-tight pl-0">
                {agent.description}
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
