export interface Article {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  excerpt: string;
}

export interface Category {
  id: string;
  title: string;
  iconName: string; 
  description: string;
  imageUrl?: string;
}

export type MessageType = 'text' | 'image' | 'file';

export interface Message {
  id: string;
  sender: 'user' | 'admin';
  content: string; // Text content or Base64/URL for media
  type: MessageType;
  timestamp: number;
  read: boolean;
  fileName?: string;
}

export interface Ticket {
  ticketId: string;
  userEmail: string;
  messages: Message[];
  lastSeenUser: number;
  lastSeenAdmin: number;
  createdAt: number;
}

export interface UserSession {
  email: string;
  role: 'user' | 'admin';
  isAuthenticated: boolean;
}