import React, { useState } from "react";
import { GlassCard } from "@/components/common/GlassCard";
import { Avatar } from "@/components/common/Avatar";
import {
  Search,
  CheckCircle,
  XCircle,
  Smartphone,
  Ban,
  UserCheck,
  Download,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { mockUsers } from "@/data/mockData";
import type { User } from "@/types";

export const UsersManagementView: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "verified" | "unverified" | "blocked"
  >("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState<{
    user: User;
    action: "block" | "unblock";
  } | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleBlock = (user: User) => {
    setConfirmAction({ user, action: user.isActive ? "block" : "unblock" });
  };

  const confirmToggleBlock = () => {
    if (!confirmAction) return;
    const { user, action } = confirmAction;
    const newIsActive = action === "unblock";

    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, isActive: newIsActive } : u))
    );
    setSelectedUser((prev) =>
      prev?.id === user.id ? { ...prev, isActive: newIsActive } : prev
    );
    showToast(
      action === "block"
        ? `${user.name} ha sido bloqueado correctamente`
        : `${user.name} ha sido desbloqueado correctamente`
    );
    setConfirmAction(null);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phoneNumber.includes(searchQuery);
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "verified" && user.isVerified) ||
      (filterStatus === "unverified" && !user.isVerified) ||
      (filterStatus === "blocked" && !user.isActive);
    return matchesSearch && matchesFilter;
  });

  const usersPerPage = 5;
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const getStatusBadge = (user: User) => {
    if (!user.isActive) {
      return (
        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
          Bloqueado
        </span>
      );
    }
    if (user.isVerified && user.isDeviceLinked) {
      return (
        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
          Verificado
        </span>
      );
    }
    if (user.isVerified && !user.isDeviceLinked) {
      return (
        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
          Pendiente
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">
        No verificado
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full p-6 relative">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4">
          <GlassCard variant="purple" className="w-full max-w-sm p-6">
            <div className="flex flex-col items-center text-center gap-4">
              {confirmAction.action === "block" ? (
                <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
                  <ShieldAlert className="w-7 h-7 text-red-400" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-green-400" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {confirmAction.action === "block"
                    ? "¿Bloquear usuario?"
                    : "¿Desbloquear usuario?"}
                </h3>
                <p className="text-gray-400 text-sm">
                  {confirmAction.action === "block"
                    ? `${confirmAction.user.name} no podrá acceder a la aplicación.`
                    : `${confirmAction.user.name} recuperará el acceso a la aplicación.`}
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 py-2.5 bg-white/5 rounded-xl text-white hover:bg-white/10 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmToggleBlock}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    confirmAction.action === "block"
                      ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                  }`}
                >
                  {confirmAction.action === "block" ? (
                    <>
                      <Ban className="w-4 h-4" /> Bloquear
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" /> Desbloquear
                    </>
                  )}
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
          <p className="text-gray-400">Administrar usuarios y verificaciones</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-gray-400 hover:bg-white/10 transition-colors">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Exportar</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-secure-gray-medium border border-secure-purple/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-secure-lilac/50 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "verified", "unverified", "blocked"] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => {
                  setFilterStatus(status);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${
                  filterStatus === status
                    ? "bg-secure-lilac/20 text-secure-lilac border border-secure-lilac/30"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {status === "all" && "Todos"}
                {status === "verified" && "Verificados"}
                {status === "unverified" && "Pendientes"}
                {status === "blocked" && "Bloqueados"}
              </button>
            )
          )}
        </div>
      </div>

      {/* Users table */}
      <GlassCard className="flex-1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-medium text-gray-400">
                  Usuario
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">
                  Teléfono
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">
                  Estado
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">
                  Verificación
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">
                  Dispositivo
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">
                  Registro
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-400">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td
                    className="p-4 cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar src={user.avatar} alt={user.name} size="sm" />
                      <span
                        className={
                          !user.isActive ? "text-gray-500" : "text-white"
                        }
                      >
                        {user.name}
                      </span>
                    </div>
                   </td>
                  <td
                    className="p-4 text-gray-300 cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    {user.countryCode} {user.phoneNumber}
                   </td>
                  <td
                    className="p-4 cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    {getStatusBadge(user)}
                   </td>
                  <td
                    className="p-4 cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    {user.isVerified ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Sí</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-500">
                        <XCircle className="w-4 h-4" />
                        <span className="text-sm">No</span>
                      </div>
                    )}
                   </td>
                  <td
                    className="p-4 cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    {user.isDeviceLinked ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <Smartphone className="w-4 h-4" />
                        <span className="text-sm">Vinculado</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-500">
                        <Smartphone className="w-4 h-4" />
                        <span className="text-sm">No vinculado</span>
                      </div>
                    )}
                   </td>
                  <td
                    className="p-4 text-gray-400 text-sm cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    {user.createdAt.toLocaleDateString("es-ES")}
                   </td>
                  <td className="p-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleBlock(user);
                      }}
                      title={
                        user.isActive
                          ? "Bloquear usuario"
                          : "Desbloquear usuario"
                      }
                      className={`p-2 rounded-lg transition-colors ${
                        user.isActive
                          ? "hover:bg-red-500/10 text-red-400"
                          : "hover:bg-green-500/10 text-green-400"
                      }`}
                    >
                      {user.isActive ? (
                        <Ban className="w-4 h-4" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
                    </button>
                   </td>
                 </tr>
              ))}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No se encontraron usuarios
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-white/10">
          <p className="text-sm text-gray-400">
            {filteredUsers.length > 0
              ? `Mostrando ${(currentPage - 1) * usersPerPage + 1} - ${Math.min(
                  currentPage * usersPerPage,
                  filteredUsers.length
                )} de ${filteredUsers.length}`
              : "0 usuarios"}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
            <span className="text-sm text-white">
              {currentPage} / {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* User detail modal - FIXED */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedUser(null)}
        >
          {/* Wrap GlassCard in a div to handle stopPropagation */}
          <div onClick={(e) => e.stopPropagation()}>
            <GlassCard variant="purple" className="w-full max-w-lg p-6">
              <div className="flex items-start gap-4 mb-6">
                <Avatar
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  size="lg"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white">
                    {selectedUser.name}
                  </h3>
                  <p className="text-gray-400">
                    {selectedUser.countryCode} {selectedUser.phoneNumber}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(selectedUser)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400">Registro</p>
                  <p className="text-white">
                    {selectedUser.createdAt.toLocaleDateString("es-ES")}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400">Última vez</p>
                  <p className="text-white">
                    {selectedUser.lastSeen.toLocaleDateString("es-ES")}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400">Huella de clave</p>
                  <p className="text-secure-lilac font-mono text-sm">
                    {selectedUser.publicKeyFingerprint || "—"}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400">Estado</p>
                  <p className="text-white capitalize">{selectedUser.status}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 py-3 bg-white/5 rounded-xl text-white hover:bg-white/10 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    handleToggleBlock(selectedUser);
                  }}
                  className={`flex-1 py-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                    selectedUser.isActive
                      ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                  }`}
                >
                  {selectedUser.isActive ? (
                    <>
                      <Ban className="w-4 h-4" /> Bloquear
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" /> Desbloquear
                    </>
                  )}
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagementView;