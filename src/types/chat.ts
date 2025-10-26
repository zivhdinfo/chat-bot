export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  attachments?: { type: 'image'; data: string; name: string }[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface Reminder {
  id: string;
  subject: string;
  time: number;
  notified: boolean;
}

export interface ParsedReminder {
  subject: string;
  scheduledFor: Date;
}
