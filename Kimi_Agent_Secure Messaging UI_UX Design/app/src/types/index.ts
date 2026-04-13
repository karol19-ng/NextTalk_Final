// User types
export interface User {
  id: string;
  phoneNumber: string;
  countryCode: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  statusMessage?: string;
  isVerified: boolean;
  isDeviceLinked: boolean;
  publicKeyFingerprint?: string;
  lastSeen: Date;
  createdAt: Date;
  isActive: boolean;
}

export interface Contact {
  id: string;
  userId: string;
  name: string;
  phoneNumber: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  statusMessage?: string;
  isBlocked: boolean;
  isArchived: boolean;
  isPinned: boolean;
  lastMessage?: Message;
  unreadCount: number;
}

// Message types
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file';
  mediaUrl?: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  isEncrypted: boolean;
  replyTo?: string;
  isDeleted: boolean;
}

// Chat types
export interface Chat {
  id: string;
  type: 'individual' | 'group';
  participants: string[];
  name?: string;
  avatar?: string;
  lastMessage?: Message;
  unreadCount: number;
  isArchived: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  members: GroupMember[];
  admins: string[];
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
}

export interface GroupMember {
  userId: string;
  role: 'admin' | 'member';
  joinedAt: Date;
}

// Story/Status types
export interface Story {
  id: string;
  userId: string;
  mediaUrl: string;
  type: 'image' | 'video';
  caption?: string;
  createdAt: Date;
  expiresAt: Date;
  viewers: string[];
  isMuted: boolean;
}

// Encryption types
export interface DeviceKey {
  deviceId: string;
  userId: string;
  publicKey: string;
  fingerprint: string;
  createdAt: Date;
  lastUsed: Date;
}

export interface SecurityVerification {
  userId: string;
  contactId: string;
  verificationCode: string;
  isVerified: boolean;
  verifiedAt?: Date;
}

// AI types
export interface AIAssistant {
  isActive: boolean;
  suggestedResponses: string[];
  conversationSummary?: string;
  isTranslationEnabled: boolean;
  isCorrectionEnabled: boolean;
  isImageGenerationEnabled: boolean;
}

export interface AIInteraction {
  id: string;
  userId: string;
  type: 'suggestion' | 'translation' | 'correction' | 'image' | 'summary';
  input: string;
  output: string;
  timestamp: Date;
}

// Admin types
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'superadmin' | 'admin' | 'moderator';
  permissions: string[];
  lastLogin: Date;
  isActive: boolean;
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalMessages: number;
  totalGroups: number;
  storageUsed: number;
  aiInteractions: number;
}

export interface MessageLog {
  id: string;
  messageId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: string;
  status: string;
  timestamp: Date;
}

// Settings types
export interface UserSettings {
  userId: string;
  notifications: {
    messages: boolean;
    calls: boolean;
    groups: boolean;
    status: boolean;
  };
  privacy: {
    lastSeen: 'everyone' | 'contacts' | 'nobody';
    profilePhoto: 'everyone' | 'contacts' | 'nobody';
    status: 'everyone' | 'contacts' | 'nobody';
    readReceipts: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    screenLock: boolean;
  };
  theme: 'dark' | 'light' | 'system';
  language: string;
}

// UI types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface ModalState {
  isOpen: boolean;
  type?: string;
  data?: any;
}
