export interface MessageAttachment {
  type: "image";
  url: string; // 可以是 base64 或 URL
  mimeType?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  attachments?: MessageAttachment[];
  reasoning?: string; // 模型推理过程
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  agentId: string;
  createdAt: number;
  updatedAt: number;
}

export interface MermaidState {
  isOpen: boolean;
  code: string;
  selectedNodes: string[];
}
