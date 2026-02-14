export interface ChatMessage {
  id: string;
  senderType: string;
  content: string;
  sentAt: string;
}

export interface CreateConversationRequest {
  sessionId: string;
  initialMessage: string;
  visitorName?: string;
}

export interface SendMessageRequest {
  content: string;
}

export interface Conversation {
  id: string;
  visitorName: string | null;
  status: string;
  createdAt: string;
  lastMessageAt: string | null;
  messageCount: number;
  messages: ChatMessage[];
}

export interface ConversationSummary {
  id: string;
  visitorName: string | null;
  status: string;
  createdAt: string;
  lastMessageAt: string | null;
  messageCount: number;
}

export interface ChatStats {
  totalConversations: number;
  activeConversations: number;
  avgMessagesPerConversation: number;
  conversationsToday: number;
}
