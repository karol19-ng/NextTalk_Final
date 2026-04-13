import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/common/GlassCard';
import { Avatar } from '@/components/common/Avatar';
import { 
  Search, 
  Check,
  CheckCheck,
  Clock,
  AlertTriangle,
  Lock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { mockMessageLogs, mockUsers } from '@/data/mockData';

export const MessagesManagementView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'sent' | 'delivered' | 'read'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredMessages = mockMessageLogs.filter(msg => {
    const matchesSearch = msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         msg.senderId.includes(searchQuery) ||
                         msg.receiverId.includes(searchQuery);
    const matchesFilter = filterStatus === 'all' || msg.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const messagesPerPage = 10;
  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);
  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * messagesPerPage,
    currentPage * messagesPerPage
  );

  const getUserById = (userId: string) => mockUsers.find(u => u.id === userId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'read':
        return <CheckCheck className="w-4 h-4 text-secure-lilac" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-500" />;
      case 'sent':
        return <Check className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'read':
        return <span className="px-2 py-1 bg-secure-lilac/20 text-secure-lilac text-xs rounded-full">Leído</span>;
      case 'delivered':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">Entregado</span>;
      case 'sent':
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">Enviado</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">Pendiente</span>;
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Registro de Mensajes</h1>
          <p className="text-gray-400">Monitoreo de mensajes del sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400">Cifrado E2E activo</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar mensajes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secure-gray-medium border border-secure-purple/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-secure-lilac/50 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'sent', 'delivered', 'read'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm transition-all capitalize',
                filterStatus === status
                  ? 'bg-secure-lilac/20 text-secure-lilac border border-secure-lilac/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              )}
            >
              {status === 'all' ? 'Todos' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Messages table */}
      <GlassCard className="flex-1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-medium text-gray-400">ID</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Emisor</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Receptor</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Contenido</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Tipo</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Estado</th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMessages.map((message) => {
                const sender = getUserById(message.senderId);
                const receiver = getUserById(message.receiverId);
                
                return (
                  <tr 
                    key={message.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <code className="text-xs text-gray-500">{message.id}</code>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Avatar src={sender?.avatar} alt={sender?.name || ''} size="xs" />
                        <span className="text-sm text-white">{sender?.name || message.senderId}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Avatar src={receiver?.avatar} alt={receiver?.name || ''} size="xs" />
                        <span className="text-sm text-white">{receiver?.name || message.receiverId}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-300 truncate max-w-xs">
                        {message.content}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-white/5 text-gray-400 text-xs rounded-full capitalize">
                        {message.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(message.status)}
                        {getStatusBadge(message.status)}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {message.timestamp.toLocaleString('es-ES')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-white/10">
          <p className="text-sm text-gray-400">
            Mostrando {(currentPage - 1) * messagesPerPage + 1} - {Math.min(currentPage * messagesPerPage, filteredMessages.length)} de {filteredMessages.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            <span className="text-sm text-white">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Disclaimer */}
      <div className="mt-4 flex items-center gap-2 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
        <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
        <p className="text-sm text-yellow-400">
          Los mensajes mostrados son metadatos cifrados. El contenido real solo es accesible por los participantes de la conversación.
        </p>
      </div>
    </div>
  );
};

export default MessagesManagementView;
