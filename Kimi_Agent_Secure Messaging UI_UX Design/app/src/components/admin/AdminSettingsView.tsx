import React, { useState } from 'react';
import { GlassCard } from '@/components/common/GlassCard';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Shield,
  Bell,
  Database,
  Zap,
  Save
} from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const [settings, setSettings] = useState({
    system: {
      maintenance: false,
      registration: true,
      groupCreation: true,
      fileSharing: true,
      voiceMessages: true,
    },
    security: {
      twoFactorRequired: true,
      deviceVerification: true,
      ipWhitelist: false,
      loginAlerts: true,
    },
    ai: {
      enabled: true,
      suggestions: true,
      translation: true,
      imageGeneration: true,
      moderation: true,
    },
    notifications: {
      emailAlerts: true,
      securityAlerts: true,
      dailyReports: false,
      weeklyReports: true,
    },
  });

  const handleToggle = (section: keyof typeof settings, key: string) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key as keyof typeof prev[typeof section]],
      },
    }));
  };

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto scrollbar-custom">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Configuración del Sistema</h1>
          <p className="text-gray-400">Administrar configuración global</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-secure-lilac text-secure-black rounded-xl font-medium hover:shadow-glow-lilac transition-all">
          <Save className="w-4 h-4" />
          Guardar cambios
        </button>
      </div>

      {/* System settings */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Configuración del sistema</h3>
            <p className="text-sm text-gray-400">Funcionalidades generales</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {[
            { id: 'maintenance', label: 'Modo mantenimiento', description: 'Desactivar acceso para usuarios' },
            { id: 'registration', label: 'Registro de usuarios', description: 'Permitir nuevos registros' },
            { id: 'groupCreation', label: 'Creación de grupos', description: 'Usuarios pueden crear grupos' },
            { id: 'fileSharing', label: 'Compartir archivos', description: 'Permitir envío de archivos' },
            { id: 'voiceMessages', label: 'Mensajes de voz', description: 'Permitir grabación de audio' },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div>
                <p className="text-white">{item.label}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <Switch 
                checked={settings.system[item.id as keyof typeof settings.system]}
                onCheckedChange={() => handleToggle('system', item.id)}
              />
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Security settings */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Seguridad</h3>
            <p className="text-sm text-gray-400">Configuración de seguridad</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {[
            { id: 'twoFactorRequired', label: '2FA obligatorio', description: 'Requerir verificación en dos pasos' },
            { id: 'deviceVerification', label: 'Verificación de dispositivos', description: 'Confirmar nuevos dispositivos' },
            { id: 'ipWhitelist', label: 'Lista blanca de IPs', description: 'Restringir acceso por IP' },
            { id: 'loginAlerts', label: 'Alertas de inicio de sesión', description: 'Notificar inicios de sesión' },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div>
                <p className="text-white">{item.label}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <Switch 
                checked={settings.security[item.id as keyof typeof settings.security]}
                onCheckedChange={() => handleToggle('security', item.id)}
              />
            </div>
          ))}
        </div>
      </GlassCard>

      {/* AI settings */}
      <GlassCard variant="purple" className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-secure-lilac/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-secure-lilac" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Inteligencia Artificial</h3>
            <p className="text-sm text-gray-400">Configuración del asistente IA</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {[
            { id: 'enabled', label: 'Asistente IA', description: 'Activar asistente de IA' },
            { id: 'suggestions', label: 'Sugerencias inteligentes', description: 'Mostrar respuestas sugeridas' },
            { id: 'translation', label: 'Traducción automática', description: 'Traducir mensajes automáticamente' },
            { id: 'imageGeneration', label: 'Generación de imágenes', description: 'Crear imágenes con IA' },
            { id: 'moderation', label: 'Moderación automática', description: 'Detectar contenido inapropiado' },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div>
                <p className="text-white">{item.label}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <Switch 
                checked={settings.ai[item.id as keyof typeof settings.ai]}
                onCheckedChange={() => handleToggle('ai', item.id)}
              />
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Notifications */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Notificaciones</h3>
            <p className="text-sm text-gray-400">Configuración de alertas</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {[
            { id: 'emailAlerts', label: 'Alertas por email', description: 'Recibir alertas importantes' },
            { id: 'securityAlerts', label: 'Alertas de seguridad', description: 'Notificar eventos de seguridad' },
            { id: 'dailyReports', label: 'Reportes diarios', description: 'Enviar resumen diario' },
            { id: 'weeklyReports', label: 'Reportes semanales', description: 'Enviar resumen semanal' },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div>
                <p className="text-white">{item.label}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <Switch 
                checked={settings.notifications[item.id as keyof typeof settings.notifications]}
                onCheckedChange={() => handleToggle('notifications', item.id)}
              />
            </div>
          ))}
        </div>
      </GlassCard>

      {/* System info */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
            <Database className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Información del sistema</h3>
            <p className="text-sm text-gray-400">Versión y estado</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-sm text-gray-400">Versión</p>
            <p className="text-white font-medium">2.0.1</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-sm text-gray-400">Último deploy</p>
            <p className="text-white font-medium">2024-02-19</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-sm text-gray-400">Uptime</p>
            <p className="text-white font-medium">99.9%</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-sm text-gray-400">Region</p>
            <p className="text-white font-medium">US-East</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default AdminSettingsView;
