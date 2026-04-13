import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/common/Avatar';
import { GlassCard } from '@/components/common/GlassCard';
import { GlowButton } from '@/components/common/GlowButton';
import { 
  Phone, 
  Video, 
  MoreVertical, 
  Paperclip, 
  Mic, 
  Send,
  Smile,
  Check,
  CheckCheck,
  Lock,
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import type { Chat, Message } from '@/types';
import { mockContacts, mockUsers } from '@/data/mockData';

interface ChatWindowProps {
  chat: Chat | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onBack?: () => void;
  isMobile?: boolean;
}

const getContactById = (userId: string) => mockContacts.find(c => c.userId === userId);
const getUserById = (userId: string) => mockUsers.find(u => u.id === userId);

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Hoy';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Ayer';
  } else {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  }
};

// Group messages by date
const groupMessagesByDate = (messages: Message[]) => {
  const groups: { date: string; messages: Message[] }[] = [];
  
  messages.forEach(message => {
    const dateStr = formatDate(message.timestamp);
    const existingGroup = groups.find(g => g.date === dateStr);
    
    if (existingGroup) {
      existingGroup.messages.push(message);
    } else {
      groups.push({ date: dateStr, messages: [message] });
    }
  });
  
  return groups;
};

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  messages,
  onSendMessage,
  onBack,
  isMobile = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aiSuggestions = [
    '¡Perfecto! ¿A qué hora?',
    'Me parece bien 👍',
    'Déjame revisar y te aviso',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-secure-black/50">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-secure-lilac/20 to-secure-purple/30 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-secure-lilac" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Bienvenido a SecureChat
          </h3>
          <p className="text-gray-400 max-w-sm">
            Selecciona un chat para comenzar a comunicarte de forma segura con cifrado de extremo a extremo.
          </p>
        </div>
      </div>
    );
  }

  const contact = chat.type === 'individual' 
    ? getContactById(chat.participants.find(p => p !== 'u1') || '')
    : null;
  
  const displayName = chat.name || contact?.name || 'Desconocido';
  const avatar = chat.avatar || contact?.avatar;
  const status = contact?.status;
  const statusMessage = contact?.statusMessage;

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex-1 flex flex-col h-full bg-secure-black/30">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-secure-purple/20 bg-secure-gray-dark/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {isMobile && onBack && (
            <button 
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
          )}
          
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
          
          <div>
            <h3 className="font-semibold text-white">{displayName}</h3>
            <p className="text-xs text-gray-400">
              {chat.type === 'group' 
                ? `${chat.participants.length} participantes`
                : status === 'online' 
                  ? 'En línea'
                  : statusMessage || 'Desconectado'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 rounded-full">
            <Lock className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400">Cifrado</span>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Phone className="w-5 h-5 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Video className="w-5 h-5 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-custom">
        {groupedMessages.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-3">
            {/* Date separator */}
            <div className="flex justify-center">
              <span className="px-4 py-1 bg-secure-purple/30 rounded-full text-xs text-gray-400">
                {group.date}
              </span>
            </div>
            
            {group.messages.map((message, index) => {
              const isSent = message.senderId === 'u1';
              const sender = getUserById(message.senderId);
              const showAvatar = chat.type === 'group' && !isSent;
              const isFirstInGroup = index === 0 || group.messages[index - 1].senderId !== message.senderId;
              
              return (
                <div 
                  key={message.id}
                  className={cn(
                    'flex gap-2',
                    isSent ? 'justify-end' : 'justify-start'
                  )}
                >
                  {showAvatar && isFirstInGroup && (
                    <Avatar 
                      src={sender?.avatar}
                      alt={sender?.name || ''}
                      size="sm"
                    />
                  )}
                  {showAvatar && !isFirstInGroup && <div className="w-8" />}
                  
                  <div className={cn(
                    'max-w-[70%]',
                    isSent ? 'items-end' : 'items-start'
                  )}>
                    {showAvatar && isFirstInGroup && (
                      <span className="text-xs text-gray-500 ml-1 mb-1">
                        {sender?.name}
                      </span>
                    )}
                    
                    <GlassCard
                      variant={isSent ? 'purple' : 'default'}
                      className={cn(
                        'px-4 py-2.5',
                        isSent ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm'
                      )}
                    >
                      <p className="text-sm text-white">{message.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs text-gray-500">
                          {formatTime(message.timestamp)}
                        </span>
                        {isSent && (
                          <>
                            {message.status === 'read' ? (
                              <CheckCheck className="w-3 h-3 text-secure-lilac" />
                            ) : message.status === 'delivered' ? (
                              <CheckCheck className="w-3 h-3 text-gray-500" />
                            ) : (
                              <Check className="w-3 h-3 text-gray-500" />
                            )}
                          </>
                        )}
                      </div>
                    </GlassCard>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* AI Suggestions */}
      {messages.length > 0 && (
        <div className="px-4 py-2 border-t border-secure-purple/10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-secure-lilac" />
            <span className="text-xs text-secure-lilac">Sugerencias de IA</span>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-custom pb-2">
            {aiSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setInputValue(suggestion);
                  inputRef.current?.focus();
                }}
                className="flex-shrink-0 px-3 py-1.5 bg-secure-lilac/10 border border-secure-lilac/30 rounded-full text-sm text-secure-lilac hover:bg-secure-lilac/20 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t border-secure-purple/20 bg-secure-gray-dark/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Paperclip className="w-5 h-5 text-gray-400" />
          </button>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              className="w-full bg-secure-gray-medium border border-secure-purple/30 rounded-full px-4 py-3 pr-10 text-white placeholder:text-gray-500 focus:outline-none focus:border-secure-lilac/50 transition-all"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors">
              <Smile className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          {inputValue.trim() ? (
            <GlowButton
              variant="primary"
              size="sm"
              onClick={handleSend}
              className="!p-3 !rounded-full"
            >
              <Send className="w-5 h-5" />
            </GlowButton>
          ) : (
            <button className="p-3 bg-secure-lilac rounded-full hover:shadow-glow-lilac transition-all">
              <Mic className="w-5 h-5 text-secure-black" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
