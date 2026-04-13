import React from 'react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/common/GlassCard';
import { 
  Users, 
  MessageSquare, 
  Shield, 
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  Server,
  Database,
  Cpu
} from 'lucide-react';
import { mockSystemStats } from '@/data/mockData';

const statsCards = [
  { 
    id: 'users', 
    label: 'Usuarios totales', 
    value: mockSystemStats.totalUsers.toLocaleString(),
    change: '+12.5%',
    trend: 'up',
    icon: Users,
    color: 'from-blue-500 to-blue-600'
  },
  { 
    id: 'active', 
    label: 'Usuarios activos', 
    value: mockSystemStats.activeUsers.toLocaleString(),
    change: '+8.2%',
    trend: 'up',
    icon: Activity,
    color: 'from-green-500 to-green-600'
  },
  { 
    id: 'messages', 
    label: 'Mensajes enviados', 
    value: mockSystemStats.totalMessages.toLocaleString(),
    change: '+23.1%',
    trend: 'up',
    icon: MessageSquare,
    color: 'from-secure-lilac to-secure-lilac-dim'
  },
  { 
    id: 'groups', 
    label: 'Grupos activos', 
    value: mockSystemStats.totalGroups.toLocaleString(),
    change: '+5.7%',
    trend: 'up',
    icon: Users,
    color: 'from-orange-500 to-orange-600'
  },
];

const systemMetrics = [
  { label: 'CPU', value: 42, icon: Cpu, color: 'bg-blue-500' },
  { label: 'Memoria', value: 68, icon: Database, color: 'bg-green-500' },
  { label: 'Almacenamiento', value: 45, icon: Server, color: 'bg-secure-lilac' },
  { label: 'Red', value: 23, icon: Zap, color: 'bg-yellow-500' },
];

const recentActivity = [
  { id: 1, action: 'Nuevo usuario registrado', user: 'john.doe@email.com', time: '2 min ago', type: 'user' },
  { id: 2, action: 'Grupo creado', user: 'Equipo Marketing', time: '5 min ago', type: 'group' },
  { id: 3, action: 'Alerta de seguridad', user: 'Sistema', time: '12 min ago', type: 'alert' },
  { id: 4, action: 'Mensaje reportado', user: 'Usuario #4521', time: '18 min ago', type: 'report' },
  { id: 5, action: 'Backup completado', user: 'Sistema', time: '1 hora ago', type: 'system' },
];

export const DashboardView: React.FC = () => {
  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto scrollbar-custom">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Resumen del sistema en tiempo real</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-green-400">Sistema operativo</span>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <GlassCard key={card.id} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-400">{card.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {card.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className={cn(
                    'text-sm',
                    card.trend === 'up' ? 'text-green-400' : 'text-red-400'
                  )}>
                    {card.change}
                  </span>
                  <span className="text-sm text-gray-500">vs mes anterior</span>
                </div>
              </div>
              <div className={cn(
                'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center',
                card.color
              )}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* System metrics & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System metrics */}
        <GlassCard className="p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Métricas del sistema</h3>
          <div className="space-y-4">
            {systemMetrics.map((metric) => (
              <div key={metric.label}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <metric.icon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{metric.label}</span>
                  </div>
                  <span className="text-sm text-white">{metric.value}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={cn('h-full rounded-full transition-all duration-500', metric.color)}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Recent activity */}
        <GlassCard className="p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Actividad reciente</h3>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                  activity.type === 'user' && 'bg-blue-500/20',
                  activity.type === 'group' && 'bg-green-500/20',
                  activity.type === 'alert' && 'bg-red-500/20',
                  activity.type === 'report' && 'bg-yellow-500/20',
                  activity.type === 'system' && 'bg-gray-500/20',
                )}>
                  {activity.type === 'user' && <Users className="w-4 h-4 text-blue-400" />}
                  {activity.type === 'group' && <MessageSquare className="w-4 h-4 text-green-400" />}
                  {activity.type === 'alert' && <Shield className="w-4 h-4 text-red-400" />}
                  {activity.type === 'report' && <Activity className="w-4 h-4 text-yellow-400" />}
                  {activity.type === 'system' && <Server className="w-4 h-4 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.user}</p>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* AI Usage Stats */}
      <GlassCard variant="purple" className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secure-lilac/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-secure-lilac" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Uso de IA</h3>
              <p className="text-sm text-gray-400">Estadísticas de interacciones con el asistente</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-secure-lilac">
              {mockSystemStats.aiInteractions.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400">interacciones totales</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Sugerencias', value: '45,230', percent: 29 },
            { label: 'Traducciones', value: '31,450', percent: 20 },
            { label: 'Correcciones', value: '28,920', percent: 18 },
            { label: 'Imágenes', value: '51,189', percent: 33 },
          ].map((item) => (
            <div key={item.label} className="bg-white/5 rounded-xl p-3">
              <p className="text-sm text-gray-400">{item.label}</p>
              <p className="text-lg font-semibold text-white">{item.value}</p>
              <div className="h-1 bg-white/10 rounded-full mt-2">
                <div 
                  className="h-full bg-secure-lilac rounded-full"
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default DashboardView;
