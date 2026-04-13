import { useState, useCallback } from 'react';
import type { User, Contact, Chat, Group, Message, Story } from '@/types';
import { mockUsers, mockContacts, mockChats, mockGroups, mockMessages, mockStories } from '@/data/mockData';

// Auth hook
export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(mockUsers[0]);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const login = useCallback((user: User, admin = false) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setIsAdmin(admin);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  }, []);

  return { currentUser, isAuthenticated, isAdmin, login, logout };
};

// Chats hook
export const useChats = () => {
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);

  const selectChat = useCallback((chat: Chat | null) => {
    setActiveChat(chat);
  }, []);

  const archiveChat = useCallback((chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, isArchived: !chat.isArchived } : chat
    ));
  }, []);

  const pinChat = useCallback((chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
    ));
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (activeChat?.id === chatId) {
      setActiveChat(null);
    }
  }, [activeChat]);

  return { chats, activeChat, selectChat, archiveChat, pinChat, deleteChat };
};

// Messages hook
export const useMessages = (chatId?: string) => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const sendMessage = useCallback((content: string, type: Message['type'] = 'text') => {
    const newMessage: Message = {
      id: `m${Date.now()}`,
      chatId: chatId || '',
      senderId: 'u1',
      content,
      type,
      timestamp: new Date(),
      status: 'sent',
      isEncrypted: true,
      isDeleted: false,
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, [chatId]);

  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isDeleted: true } : msg
    ));
  }, []);

  const getChatMessages = useCallback((chatId: string) => {
    return messages.filter(msg => msg.chatId === chatId && !msg.isDeleted);
  }, [messages]);

  return { messages, sendMessage, deleteMessage, getChatMessages };
};

// Contacts hook
export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);

  const blockContact = useCallback((contactId: string) => {
    setContacts(prev => prev.map(contact => 
      contact.id === contactId ? { ...contact, isBlocked: !contact.isBlocked } : contact
    ));
  }, []);

  const deleteContact = useCallback((contactId: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== contactId));
  }, []);

  const syncContacts = useCallback(() => {
    // Simulate sync
    console.log('Syncing contacts...');
  }, []);

  return { contacts, blockContact, deleteContact, syncContacts };
};

// Groups hook
export const useGroups = () => {
  const [groups, setGroups] = useState<Group[]>(mockGroups);

  const createGroup = useCallback((name: string, description: string, members: string[]) => {
    const newGroup: Group = {
      id: `g${Date.now()}`,
      name,
      description,
      members: members.map(userId => ({ userId, role: 'member', joinedAt: new Date() })),
      admins: ['u1'],
      createdBy: 'u1',
      createdAt: new Date(),
      isActive: true,
    };
    setGroups(prev => [...prev, newGroup]);
    return newGroup;
  }, []);

  const deleteGroup = useCallback((groupId: string) => {
    setGroups(prev => prev.filter(group => group.id !== groupId));
  }, []);

  const addMember = useCallback((groupId: string, userId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, members: [...group.members, { userId, role: 'member', joinedAt: new Date() }] }
        : group
    ));
  }, []);

  const removeMember = useCallback((groupId: string, userId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, members: group.members.filter(m => m.userId !== userId) }
        : group
    ));
  }, []);

  return { groups, createGroup, deleteGroup, addMember, removeMember };
};

// Stories hook
export const useStories = () => {
  const [stories, setStories] = useState<Story[]>(mockStories);

  const createStory = useCallback((mediaUrl: string, type: Story['type'], caption?: string) => {
    const newStory: Story = {
      id: `s${Date.now()}`,
      userId: 'u1',
      mediaUrl,
      type,
      caption,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      viewers: [],
      isMuted: false,
    };
    setStories(prev => [...prev, newStory]);
    return newStory;
  }, []);

  const deleteStory = useCallback((storyId: string) => {
    setStories(prev => prev.filter(story => story.id !== storyId));
  }, []);

  const muteStory = useCallback((storyId: string) => {
    setStories(prev => prev.map(story => 
      story.id === storyId ? { ...story, isMuted: !story.isMuted } : story
    ));
  }, []);

  const viewStory = useCallback((storyId: string, userId: string) => {
    setStories(prev => prev.map(story => 
      story.id === storyId && !story.viewers.includes(userId)
        ? { ...story, viewers: [...story.viewers, userId] }
        : story
    ));
  }, []);

  return { stories, createStory, deleteStory, muteStory, viewStory };
};

// UI State hook
export const useUIState = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<'chats' | 'contacts' | 'settings' | 'profile'>('chats');
  const [isMobile, setIsMobile] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  return { 
    sidebarOpen, 
    toggleSidebar, 
    activeView, 
    setActiveView,
    isMobile,
    setIsMobile
  };
};
