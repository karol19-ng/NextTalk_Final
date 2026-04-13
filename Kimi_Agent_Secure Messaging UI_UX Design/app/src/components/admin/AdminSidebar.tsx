import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/common/Avatar';
import { GlassCard } from '@/components/common/GlassCard';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Shield, 
  Settings,
  BarChart3,
  LogOut,
  AlertTriangle
} from 'lucide-react';

interface AdminSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'groups', label: 'Grupos', icon: MessageSquare },
  { id: 'messages', label: 'Mensajes', icon: BarChart3 },
  { id: 'security', label: 'Seguridad', icon: Shield },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeView,
  onViewChange,
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
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-secure-purple/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">Admin</span>
              <span className="text-xs text-red-400 block">Panel de Control</span>
            </div>
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
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
                {item.id === 'security' && (
                  <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    3
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Alerts */}
        <div className="px-4 pb-4">
          <GlassCard variant="purple" className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">Alertas del sistema</p>
                <p className="text-xs text-gray-400 mt-1">2 intentos de acceso no autorizado detectados</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Admin profile */}
        <div className="p-4 border-t border-secure-purple/20">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
            <Avatar 
              src="" 
              alt="Admin"
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                Super Admin
              </p>
              <p className="text-xs text-red-400 truncate">
                Administrador
              </p>
            </div>
            <LogOut className="w-5 h-5 text-gray-400 hover:text-red-400 transition-colors" />
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
