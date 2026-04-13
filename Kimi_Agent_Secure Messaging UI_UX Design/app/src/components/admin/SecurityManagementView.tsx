import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/common/GlassCard';
import { Avatar } from '@/components/common/Avatar';
import { 
  Shield, 
  AlertTriangle,
  Key,
  Smartphone,
  Lock,
  CheckCircle,
  Eye,
  EyeOff,
  Ban
} from 'lucide-react';
import { mockDeviceKeys, mockUsers } from '@/data/mockData';

const securityAlerts = [
  {
    id: 1,
    type: 'unauthorized_access',
    severity: 'high',
    message: 'Intento de acceso no autorizado detectado',
    user: 'Usuario #4521',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    status: 'active',
  },
  {
    id: 2,
    type: 'key_mismatch',
    severity: 'medium',
    message: 'Posible cambio de clave de seguridad',
    user: 'Usuario #3892',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    status: 'resolved',
  },
  {
    id: 3,
    type: 'device_change',
    severity: 'low',
    message: 'Nuevo dispositivo vinculado',
    user: 'Usuario #1205',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: 'active',
  },
];

export const SecurityManagementView: React.FC = () => {
  const [showKeys, setShowKeys] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<typeof securityAlerts[0] | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-400 bg-red-500/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'low':
        return 'text-blue-400 bg-blue-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getUserById = (userId: string) => mockUsers.find(u => u.id === userId);

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto scrollbar-custom">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Seguridad</h1>
          <p className="text-gray-400">Monitoreo de seguridad y cifrado</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-400" />
          <span className="text-green-400">Sistema seguro</span>
        </div>
      </div>

      {/* Encryption status */}
      <GlassCard variant="purple" className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <Lock className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Cifrado de extremo a extremo</h3>
              <p className="text-gray-400">Todos los mensajes están protegidos</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-secure-lilac">100%</p>
            <p className="text-sm text-gray-400">Mensajes cifrados</p>
          </div>
        </div>
      </GlassCard>

      {/* Security alerts */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Alertas de seguridad</h3>
        <div className="space-y-3">
          {securityAlerts.map((alert) => (
            <GlassCard 
              key={alert.id}
              className={cn(
                'p-4 cursor-pointer transition-all',
                alert.status === 'active' && 'border-l-4 border-l-red-500'
              )}
              onClick={() => setSelectedAlert(alert)}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  getSeverityColor(alert.severity)
                )}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">{alert.message}</h4>
                    <span className={cn(
                      'px-2 py-1 text-xs rounded-full',
                      alert.status === 'active' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                    )}>
                      {alert.status === 'active' ? 'Activa' : 'Resuelta'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{alert.user}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {alert.timestamp.toLocaleString('es-ES')}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Device keys */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Claves de dispositivos</h3>
          <button
            onClick={() => setShowKeys(!showKeys)}
            className="flex items-center gap-2 text-sm text-secure-lilac hover:underline"
          >
            {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showKeys ? 'Ocultar claves' : 'Mostrar claves'}
          </button>
        </div>
        
        <div className="space-y-3">
          {mockDeviceKeys.map((key) => {
            const user = getUserById(key.userId);
            
            return (
              <GlassCard key={key.deviceId} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar src={user?.avatar} alt={user?.name || ''} size="sm" />
                    <div>
                      <p className="font-medium text-white">{user?.name}</p>
                      <p className="text-sm text-gray-500">Dispositivo: {key.deviceId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <code className="text-sm text-secure-lilac font-mono">
                      {showKeys ? key.fingerprint : '•••• •••• ••••'}
                    </code>
                    <p className="text-xs text-gray-500">
                      Último uso: {key.lastUsed.toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Security stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 text-center">
          <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">15,420</p>
          <p className="text-sm text-gray-400">Claves activas</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <Smartphone className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">18,234</p>
          <p className="text-sm text-gray-400">Dispositivos</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <Key className="w-8 h-8 text-secure-lilac mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">0</p>
          <p className="text-sm text-gray-400">Claves comprometidas</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">3</p>
          <p className="text-sm text-gray-400">Alertas activas</p>
        </GlassCard>
      </div>

      {/* Alert detail modal */}
      {selectedAlert && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAlert(null)}
        >
          <GlassCard 
            variant="purple"
            className="w-full max-w-md p-6"
            onClick={() => {}}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center',
                getSeverityColor(selectedAlert.severity)
              )}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedAlert.message}</h3>
                <p className="text-sm text-gray-400">{selectedAlert.user}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedAlert.timestamp.toLocaleString('es-ES')}
                </p>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-400 mb-2">Detalles del evento</p>
              <p className="text-white">
                Se detectó un evento de seguridad que requiere atención. 
                Tipo: {selectedAlert.type}. Severidad: {selectedAlert.severity}.
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedAlert(null)}
                className="flex-1 py-3 bg-white/5 rounded-xl text-white hover:bg-white/10 transition-colors"
              >
                Cerrar
              </button>
              {selectedAlert.status === 'active' ? (
                <button className="flex-1 py-3 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Marcar resuelta
                </button>
              ) : (
                <button className="flex-1 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2">
                  <Ban className="w-4 h-4" />
                  Reabrir
                </button>
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default SecurityManagementView;
