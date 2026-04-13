import React, { useState } from 'react';
import { Avatar } from '@/components/common/Avatar';
import { GlassCard } from '@/components/common/GlassCard';
import { 
  Camera, 
  Edit2, 
  Check,
  X,
  Smile,
  Briefcase,
  Heart,
  Music,
  Gamepad2,
  Book,
  Plane
} from 'lucide-react';

interface ProfileViewProps {
  user?: {
    name: string;
    phoneNumber: string;
    avatar?: string;
    status: string;
    statusMessage: string;
    description?: string;
  };
}

const statusOptions = [
  { value: 'online', label: 'En línea', color: 'bg-green-500' },
  { value: 'away', label: 'Ausente', color: 'bg-yellow-500' },
  { value: 'busy', label: 'Ocupado', color: 'bg-red-500' },
  { value: 'offline', label: 'Desconectado', color: 'bg-gray-500' },
];

const emojiStatuses = [
  { emoji: '💼', label: 'Trabajando', icon: Briefcase },
  { emoji: '❤️', label: 'Enamorado', icon: Heart },
  { emoji: '🎵', label: 'Escuchando música', icon: Music },
  { emoji: '🎮', label: 'Jugando', icon: Gamepad2 },
  { emoji: '📚', label: 'Estudiando', icon: Book },
  { emoji: '✈️', label: 'Viajando', icon: Plane },
];

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  user = {
    name: 'Alexandra Chen',
    phoneNumber: '+1 555 123 4567',
    status: 'online',
    statusMessage: 'Disponible para chat',
    description: 'Desarrolladora de software | Amante de la tecnología y la seguridad digital',
  }
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [editedDescription, setEditedDescription] = useState(user.description || '');
  const [selectedStatus, setSelectedStatus] = useState(user.status);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  const handleSave = () => {
    setIsEditing(false);
    // Save logic here
  };

  const handleCancel = () => {
    setEditedName(user.name);
    setEditedDescription(user.description || '');
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-secure-purple/20">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Perfil</h2>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Edit2 className="w-5 h-5 text-secure-lilac" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleCancel}
                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-red-400" />
              </button>
              <button 
                onClick={handleSave}
                className="p-2 hover:bg-green-500/10 rounded-lg transition-colors"
              >
                <Check className="w-5 h-5 text-green-400" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-custom">
        {/* Avatar section */}
        <div className="text-center">
          <div className="relative inline-block">
            <Avatar 
              src={user.avatar}
              alt={user.name}
              size="xl"
              className="w-28 h-28"
            />
            <button className="absolute bottom-0 right-0 w-10 h-10 bg-secure-lilac rounded-full flex items-center justify-center hover:shadow-glow-lilac transition-all">
              <Camera className="w-5 h-5 text-secure-black" />
            </button>
          </div>
        </div>

        {/* Name */}
        <GlassCard className="p-4">
          <p className="text-sm text-gray-500 mb-2">Nombre</p>
          {isEditing ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full bg-secure-black/50 border border-secure-purple/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-secure-lilac/50"
            />
          ) : (
            <p className="text-lg font-semibold text-white">{user.name}</p>
          )}
        </GlassCard>

        {/* Phone */}
        <GlassCard className="p-4">
          <p className="text-sm text-gray-500 mb-2">Teléfono</p>
          <p className="text-white">{user.phoneNumber}</p>
        </GlassCard>

        {/* Status */}
        <GlassCard className="p-4">
          <p className="text-sm text-gray-500 mb-3">Estado</p>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setSelectedStatus(status.value)}
                  className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                    selectedStatus === status.value
                      ? 'bg-secure-lilac/20 border border-secure-lilac/50'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${status.color}`} />
                  <span className="text-sm text-white">{status.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                statusOptions.find(s => s.value === selectedStatus)?.color
              }`} />
              <span className="text-white">
                {statusOptions.find(s => s.value === selectedStatus)?.label}
              </span>
            </div>
          )}
        </GlassCard>

        {/* Status message */}
        <GlassCard className="p-4">
          <p className="text-sm text-gray-500 mb-3">Estado personalizado</p>
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="¿Qué estás haciendo?"
                className="w-full bg-secure-black/50 border border-secure-purple/30 rounded-lg px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-secure-lilac/50"
              />
              <div className="flex flex-wrap gap-2">
                {emojiStatuses.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setSelectedEmoji(item.emoji)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all ${
                      selectedEmoji === item.emoji
                        ? 'bg-secure-lilac/30 border border-secure-lilac/50'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span>{item.emoji}</span>
                    <span className="text-gray-300">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <Smile className="w-5 h-5 text-secure-lilac mt-0.5" />
              <p className="text-white">{user.statusMessage}</p>
            </div>
          )}
        </GlassCard>

        {/* Description */}
        <GlassCard className="p-4">
          <p className="text-sm text-gray-500 mb-2">Descripción</p>
          {isEditing ? (
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              rows={3}
              className="w-full bg-secure-black/50 border border-secure-purple/30 rounded-lg px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-secure-lilac/50 resize-none"
            />
          ) : (
            <p className="text-gray-300">{user.description}</p>
          )}
        </GlassCard>

        {/* Public preview */}
        <GlassCard variant="purple" className="p-4">
          <p className="text-sm text-secure-lilac mb-3">Vista previa pública</p>
          <div className="flex items-center gap-3">
            <Avatar 
              src={user.avatar}
              alt={editedName}
              size="md"
            />
            <div>
              <p className="font-medium text-white">{editedName}</p>
              <p className="text-sm text-gray-400">
                {selectedEmoji} {editedDescription.slice(0, 50)}...
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default ProfileView;
