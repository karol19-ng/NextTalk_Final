import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/common/Avatar';
import { GlassCard } from '@/components/common/GlassCard';
import { Search, Pin, Check, CheckCheck } from 'lucide-react';
import type { Chat, Contact } from '@/types';
import { mockContacts } from '@/data/mockData';

interface ChatListProps {
  chats: Chat[];
  activeChatId?: string;
  onSelectChat: (chat: Chat) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const getContactById = (userId: string): Contact | undefined => {
  return mockContacts.find(c => c.userId === userId);
};

const formatTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'Ayer';
  } else if (days < 7) {
    return date.toLocaleDateString('es-ES', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  }
};

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  searchQuery,
  onSearchChange,
}) => {
  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    const contact = chat.type === 'individual' 
      ? getContactById(chat.participants.find(p => p !== 'u1') || '')
      : null;
    const searchLower = searchQuery.toLowerCase();
    return contact?.name.toLowerCase().includes(searchLower) ||
           chat.name?.toLowerCase().includes(searchLower) ||
           chat.lastMessage?.content.toLowerCase().includes(searchLower);
  });

  const pinnedChats = filteredChats.filter(chat => chat.isPinned);
  const unpinnedChats = filteredChats.filter(chat => !chat.isPinned);

  const renderChatItem = (chat: Chat) => {
    const isActive = activeChatId === chat.id;
    const contact = chat.type === 'individual' 
      ? getContactById(chat.participants.find(p => p !== 'u1') || '')
      : null;
    
    const displayName = chat.name || contact?.name || 'Desconocido';
    const avatar = chat.avatar || contact?.avatar;
    const status = contact?.status;

    return (
      <GlassCard
        key={chat.id}
        variant={isActive ? 'purple' : 'default'}
        className={cn(
          'p-4 cursor-pointer transition-all duration-200',
          isActive && 'shadow-glow-lilac-sm'
        )}
        onClick={() => onSelectChat(chat)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar 
              src={avatar} 
              alt={displayName}
              size="md"
            />
            {status && chat.type === 'individual' && (
              <div className="absolute -bottom-0.5 -right-0.5">
                <span className={`w-3 h-3 rounded-full border-2 border-secure-black ${
                  status === 'online' ? 'bg-green-500' :
                  status === 'away' ? 'bg-yellow-500' :
                  status === 'busy' ? 'bg-red-500' : 'bg-gray-500'
                }`} />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className={cn(
                'font-medium truncate',
                isActive ? 'text-secure-lilac' : 'text-white'
              )}>
                {displayName}
              </h3>
              <div className="flex items-center gap-2">
                {chat.isPinned && (
                  <Pin className="w-3 h-3 text-secure-lilac" />
                )}
                {chat.lastMessage && (
                  <span className="text-xs text-gray-400">
                    {formatTime(chat.lastMessage.timestamp)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-gray-400 truncate flex-1">
                {chat.lastMessage ? (
                  <span className="flex items-center gap-1">
                    {chat.lastMessage.senderId === 'u1' && (
                      <>
                        {chat.lastMessage.status === 'read' ? (
                          <CheckCheck className="w-3 h-3 text-secure-lilac" />
                        ) : chat.lastMessage.status === 'delivered' ? (
                          <CheckCheck className="w-3 h-3 text-gray-500" />
                        ) : (
                          <Check className="w-3 h-3 text-gray-500" />
                        )}
                      </>
                    )}
                    {chat.lastMessage.content}
                  </span>
                ) : (
                  'Sin mensajes'
                )}
              </p>
              
              {chat.unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-secure-lilac text-secure-black text-xs font-bold rounded-full">
                  {chat.unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search header */}
      <div className="p-4 border-b border-secure-purple/20">
        <h2 className="text-xl font-bold text-white mb-4">Mensajes</h2>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar chats..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-secure-gray-medium border border-secure-purple/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-secure-lilac/50 transition-all"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-custom">
        {pinnedChats.length > 0 && (
          <>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <Pin className="w-3 h-3" />
              <span>Fijados</span>
            </div>
            <div className="space-y-2">
              {pinnedChats.map(renderChatItem)}
            </div>
          </>
        )}
        
        {unpinnedChats.length > 0 && (
          <>
            {pinnedChats.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-4 mb-2">
                <span>Todos los chats</span>
              </div>
            )}
            <div className="space-y-2">
              {unpinnedChats.map(renderChatItem)}
            </div>
          </>
        )}
        
        {filteredChats.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron chats</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
