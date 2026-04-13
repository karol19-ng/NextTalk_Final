import React, { useState, useRef, useEffect } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { GlowButton } from '@/components/common/GlowButton';
import { 
  Sparkles, 
  Image, 
  Languages, 
  Edit3,
  Send,
  Bot,
  User,
  Copy,
  Check
} from 'lucide-react';

interface AIAssistantViewProps {
  isFloating?: boolean;
  onClose?: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image' | 'translation' | 'correction';
  timestamp: Date;
}

const quickActions = [
  { id: 'summarize', label: 'Resumir conversación', icon: Image },
  { id: 'translate', label: 'Traducir mensaje', icon: Languages },
  { id: 'correct', label: 'Corregir texto', icon: Edit3 },
  { id: 'generate', label: 'Generar imagen', icon: Image },
];

const suggestions = [
  'Resume mi última conversación',
  'Traduce "Hello, how are you?" al español',
  'Corrige: "Hola, como estas"',
  'Genera una imagen de un paisaje futurista',
];

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ 
  isFloating = false,
  onClose 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! Soy tu asistente de IA. Puedo ayudarte a resumir conversaciones, traducir mensajes, corregir texto y mucho más. ¿En qué puedo ayudarte hoy?',
      type: 'text',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        'resume': 'Resumen de tu última conversación:\n\n• Discutieron sobre la reunión del próximo martes\n• Acordaron encontrarse a las 8pm\n• Marcus compartió el documento del proyecto\n• Confirmaron el presupuesto estimado',
        'traduce': 'Traducción:\n\n"Hello, how are you?" → "Hola, ¿cómo estás?"',
        'corrige': 'Corrección:\n\n❌ "Hola, como estas"\n✅ "Hola, ¿cómo estás?"\n\nSe agregaron:\n• Acento en "cómo"\n• Signo de interrogación inicial (¿)',
        'genera': 'He generado una imagen de un paisaje futurista con neones púrpuras y arquitectura moderna.',
      };

      const lowerInput = inputValue.toLowerCase();
      let responseContent = 'Entiendo. ¿Hay algo más en lo que pueda ayudarte?';

      if (lowerInput.includes('resume') || lowerInput.includes('resumen')) {
        responseContent = responses['resume'];
      } else if (lowerInput.includes('traduce') || lowerInput.includes('traducir')) {
        responseContent = responses['traduce'];
      } else if (lowerInput.includes('corrige') || lowerInput.includes('corregir')) {
        responseContent = responses['corrige'];
      } else if (lowerInput.includes('genera') || lowerInput.includes('imagen')) {
        responseContent = responses['genera'];
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const content = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-secure-purple/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secure-lilac to-secure-lilac-dim flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-secure-black" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Asistente IA</h2>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-400">En línea</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isFloating && onClose && (
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <span className="text-gray-400 text-xl">×</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-custom">
        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => setInputValue(action.label)}
              className="flex items-center gap-2 p-3 bg-secure-lilac/10 border border-secure-lilac/20 rounded-xl hover:bg-secure-lilac/20 transition-colors"
            >
              <action.icon className="w-4 h-4 text-secure-lilac" />
              <span className="text-sm text-white">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Chat messages */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secure-lilac to-secure-lilac-dim flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-secure-black" />
              </div>
            )}
            
            <div className={`max-w-[80%] ${
              message.role === 'user' && 'items-end'
            }`}>
              <GlassCard
                variant={message.role === 'user' ? 'purple' : 'default'}
                className={`px-4 py-3 ${
                  message.role === 'user' ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm'
                }`}
              >
                <p className="text-sm text-white whitespace-pre-line">{message.content}</p>
                <div className="flex items-center justify-end gap-2 mt-2">
                  <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => copyMessage(message.id, message.content)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-gray-400" />
                      )}
                    </button>
                  )}
                </div>
              </GlassCard>
            </div>
            
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-secure-purple flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secure-lilac to-secure-lilac-dim flex items-center justify-center">
              <Bot className="w-4 h-4 text-secure-black" />
            </div>
            <GlassCard className="px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-secure-lilac rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-secure-lilac rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-secure-lilac rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </GlassCard>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length < 3 && (
        <div className="px-4 py-2 border-t border-secure-purple/10">
          <p className="text-xs text-gray-500 mb-2">Sugerencias:</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-custom pb-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInputValue(suggestion)}
                className="flex-shrink-0 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-secure-purple/20">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              className="w-full bg-secure-gray-medium border border-secure-purple/30 rounded-full px-4 py-3 pr-10 text-white placeholder:text-gray-500 focus:outline-none focus:border-secure-lilac/50 transition-all"
            />
          </div>
          <GlowButton
            variant="primary"
            size="sm"
            onClick={handleSend}
            className="!p-3 !rounded-full"
          >
            <Send className="w-5 h-5" />
          </GlowButton>
        </div>
      </div>
    </>
  );

  if (isFloating) {
    return (
      <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-secure-gray-dark/95 backdrop-blur-xl border border-secure-purple/30 rounded-2xl shadow-glow-lilac-lg flex flex-col z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {content}
    </div>
  );
};

export default AIAssistantView;
