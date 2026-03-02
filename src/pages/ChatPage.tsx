"use client";

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { useConversations } from '../store/useConversations';
import { agents, DEFAULT_AGENT_ID } from '../lib/agents';

export const dynamic = 'force-dynamic';

function ChatContent() {
  const searchParams = useSearchParams();
  const paramAgent = searchParams?.get('agent');
  const paramQ = searchParams?.get('q');

  const [selectedAgentId, setSelectedAgentId] = useState<string>(
    paramAgent && agents.find(a => a.id === paramAgent) ? paramAgent : DEFAULT_AGENT_ID
  );

  const {
    conversations,
    activeId,
    activeConversation,
    setActiveId,
    createConversation,
    deleteConversation,
    addMessage,
    updateLastAssistantMessage,
  } = useConversations();

  const handleNew = () => createConversation(selectedAgentId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onNew={handleNew}
          onDelete={deleteConversation}
          agents={agents}
          selectedAgentId={selectedAgentId}
          onAgentChange={setSelectedAgentId}
        />
        <ChatWindow
          conversation={activeConversation}
          onAddMessage={addMessage}
          onUpdateLast={updateLastAssistantMessage}
          onNew={handleNew}
          initialQuery={paramQ ?? undefined}
        />
      </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}
