import { Timestamp } from 'firebase/firestore';

// Firestore data models for chat system
export interface Conversation {
  id: string;
  participants: string[]; // exactly 2 userIds for DM
  lastMessage: string;
  lastMessageAt: Timestamp;
  createdAt: Timestamp;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
  readBy: string[];
}

// UI display models
export interface ConversationDisplay {
  id: string;
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

export interface MessageDisplay {
  id: string;
  senderId: string;
  text: string;
  createdAt: Date;
  isOwn: boolean;
  isRead: boolean;
}