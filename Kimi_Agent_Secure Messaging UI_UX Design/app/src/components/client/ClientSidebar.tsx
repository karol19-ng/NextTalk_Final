import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/common/Avatar';
import { 
  MessageSquare, 
  Users, 
  Phone, 
  Settings, 
  User, 
  Shield, 
  LogOut,
  Sparkles
} from 'lucide-react';

interface ClientSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  currentUser: {
    name: string;
    avatar?: string;
    status: string;
  };
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { id: 'chats', label: 'Chats', icon: MessageSquare },
  { id: 'contacts', label: 'Contactos', icon: Users },
  { id: 'calls', label: 'Llamadas', icon: Phone },
  { id: 'ai-assistant', label: 'Asistente IA', icon: Sparkles },
  { id: 'security', label: 'Seguridad', icon: Shield },
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

export const ClientSidebar: React.FC<ClientSidebarProps> = ({
  activeView,
  onViewChange,
  currentUser,
  isOpen,
  onToggle,
}) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50',
          'w-72 bg-secure-gray-dark/95 backdrop-blur-xl',
          'border-r border-secure-purple/20',
          'flex flex-col',
          'transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20 xl:w-72'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-secure-purple/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secure-lilac to-secure-lilac-dim flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-secure-black" />
            </div>
            <span className={cn(
              'text-xl font-bold gradient-text transition-opacity',
              !isOpen && 'lg:opacity-0 xl:opacity-100'
            )}>
              SecureChat
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-custom">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
                  'transition-all duration-300',
                  isActive 
                    ? 'bg-secure-lilac/20 text-secure-lilac border border-secure-lilac/30'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white',
                  !isOpen && 'lg:justify-center xl:justify-start'
                )}
              >
                <Icon className={cn(
                  'w-5 h-5 flex-shrink-0',
                  isActive && 'animate-pulse'
                )} />
                <span className={cn(
                  'transition-opacity',
                  !isOpen && 'lg:hidden xl:block'
                )}>
                  {item.label}
                </span>
                {item.id === 'ai-assistant' && (
                  <Sparkles className={cn(
                    'w-4 h-4 text-secure-lilac ml-auto',
                    !isOpen && 'lg:hidden xl:block'
                  )} />
                )}
              </button>
            );
          })}
        </nav>

        {/* User profile */}
        <div className="p-4 border-t border-secure-purple/20">
          <div className={cn(
            'flex items-center gap-3 p-3 rounded-xl',
            'bg-white/5 hover:bg-white/10 transition-colors cursor-pointer'
          )}>
            <Avatar 
              src={currentUser.avatar} 
              alt={currentUser.name}
              size="sm"
              status="online"
              showStatus
            />
            <div className={cn(
              'flex-1 min-w-0 transition-opacity',
              !isOpen && 'lg:hidden xl:block'
            )}>
              <p className="text-sm font-medium text-white truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {currentUser.status}
              </p>
            </div>
            <LogOut className={cn(
              'w-5 h-5 text-gray-400 hover:text-red-400 transition-colors',
              !isOpen && 'lg:hidden xl:block'
            )} />
          </div>
        </div>
      </aside>
    </>
  );
};

export default ClientSidebar;
