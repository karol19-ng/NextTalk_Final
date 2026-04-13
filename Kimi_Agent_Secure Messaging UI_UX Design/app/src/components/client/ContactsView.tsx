import React, { useState } from 'react';
import { Avatar } from '@/components/common/Avatar';
import { GlassCard } from '@/components/common/GlassCard';
import { GlowButton } from '@/components/common/GlowButton';
import { 
  Search, 
  Plus, 
  Phone,
  Video,
  MessageSquare,
  RefreshCw,
  Users,
  Ban
} from 'lucide-react';
import type { Contact } from '@/types';

interface ContactsViewProps {
  contacts: Contact[];
  onSync: () => void;
  onBlock: (contactId: string) => void;
  onDelete: (contactId: string) => void;
  onStartChat: (contactId: string) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  onSync,
  onBlock,
  onStartChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phoneNumber.includes(searchQuery)
  );

  const onlineContacts = filteredContacts.filter(c => c.status === 'online');
  const offlineContacts = filteredContacts.filter(c => c.status !== 'online');

  const renderContactCard = (contact: Contact) => (
    <GlassCard
      key={contact.id}
      variant="default"
      hover
      className="p-4"
      onClick={() => setSelectedContact(contact)}
    >
      <div className="flex items-center gap-4">
        <Avatar 
          src={contact.avatar}
          alt={contact.name}
          size="lg"
          status={contact.status}
          showStatus
        />
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{contact.name}</h3>
          <p className="text-sm text-gray-400">{contact.phoneNumber}</p>
          {contact.statusMessage && (
            <p className="text-xs text-gray-500 truncate">{contact.statusMessage}</p>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onStartChat(contact.id);
            }}
            className="p-2 hover:bg-secure-lilac/20 rounded-lg transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-secure-lilac" />
          </button>
          <button 
            onClick={(e) => e.stopPropagation()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Phone className="w-5 h-5 text-gray-400" />
          </button>
          <button 
            onClick={(e) => e.stopPropagation()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Video className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </GlassCard>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-secure-purple/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Contactos</h2>
          <div className="flex items-center gap-2">
            <GlowButton variant="secondary" size="sm" onClick={onSync}>
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Sincronizar</span>
            </GlowButton>
            <GlowButton variant="primary" size="sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Agregar</span>
            </GlowButton>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar contactos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secure-gray-medium border border-secure-purple/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-secure-lilac/50 transition-all"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 p-4">
        <GlassCard className="p-4 text-center">
          <Users className="w-6 h-6 text-secure-lilac mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{contacts.length}</p>
          <p className="text-xs text-gray-400">Total</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="w-6 h-6 rounded-full bg-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{onlineContacts.length}</p>
          <p className="text-xs text-gray-400">En línea</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <div className="w-6 h-6 rounded-full bg-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{contacts.filter(c => c.isBlocked).length}</p>
          <p className="text-xs text-gray-400">Bloqueados</p>
        </GlassCard>
      </div>

      {/* Contacts list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-custom">
        {onlineContacts.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-secure-lilac mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              En línea ({onlineContacts.length})
            </h3>
            <div className="space-y-2">
              {onlineContacts.map(renderContactCard)}
            </div>
          </div>
        )}
        
        {offlineContacts.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Todos los contactos ({offlineContacts.length})
            </h3>
            <div className="space-y-2">
              {offlineContacts.map(renderContactCard)}
            </div>
          </div>
        )}
        
        {filteredContacts.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron contactos</p>
          </div>
        )}
      </div>

      {/* Contact detail modal */}
      {selectedContact && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedContact(null)}
        >
          <GlassCard 
            variant="purple"
            className="w-full max-w-md p-6"
            onClick={() => {}}
          >
            <div className="text-center mb-6">
              <Avatar 
                src={selectedContact.avatar}
                alt={selectedContact.name}
                size="xl"
                status={selectedContact.status}
                showStatus
                className="mx-auto mb-4"
              />
              <h3 className="text-xl font-bold text-white">{selectedContact.name}</h3>
              <p className="text-gray-400">{selectedContact.phoneNumber}</p>
              {selectedContact.statusMessage && (
                <p className="text-sm text-secure-lilac mt-2">{selectedContact.statusMessage}</p>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button 
                onClick={() => {
                  onStartChat(selectedContact.id);
                  setSelectedContact(null);
                }}
                className="flex flex-col items-center gap-2 p-4 bg-secure-lilac/20 rounded-xl hover:bg-secure-lilac/30 transition-colors"
              >
                <MessageSquare className="w-6 h-6 text-secure-lilac" />
                <span className="text-sm text-white">Mensaje</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <Phone className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-white">Llamar</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <Video className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-white">Video</span>
              </button>
            </div>
            
            <div className="space-y-2">
              <button 
                onClick={() => {
                  onBlock(selectedContact.id);
                  setSelectedContact(null);
                }}
                className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
              >
                <Ban className="w-5 h-5" />
                <span>{selectedContact.isBlocked ? 'Desbloquear' : 'Bloquear'}</span>
              </button>
              <button 
                onClick={() => setSelectedContact(null)}
                className="w-full p-3 text-gray-400 hover:bg-white/5 rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default ContactsView;
