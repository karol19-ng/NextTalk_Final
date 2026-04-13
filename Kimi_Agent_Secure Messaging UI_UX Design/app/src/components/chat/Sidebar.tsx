import React, { useState } from "react";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/common/Avatar";
import { GlowButton } from "@/components/common/GlowButton";
import {
  Plus,
  Search,
  LogOut,
  UserPlus,
  ChevronRight,
  Settings,
  Eye,
  Users,
  MoreVertical,
  Ban,
  Flag,
  X,
  CheckCircle,
  UserCheck,
  Sparkles,
  UserMinus,
} from "lucide-react";
import { AddContactModal } from "./AddContactModal";
import { ProfileEdit } from "@/components/profile/ProfileEdit";
import { StatusView } from "@/components/status/StatusView";
import { SettingsView } from "@/components/client/SettingsView";
import { AIChatbotView } from "@/components/client/AIChatbotView";

interface SidebarProps {
  isMobile?: boolean;
  onSelectChat?: () => void;
}

// ── Modal Crear Grupo ──────────────────────────────────────────────────────────
const CreateGroupModal: React.FC<{
  chats: any[];
  user: any;
  onClose: () => void;
  onCreate: (group: any) => void;
}> = ({ chats, user, onClose, onCreate }) => {
  const [step, setStep] = useState<"info" | "members" | "success">("info");
  const [groupName, setGroupName] = useState("");
  const [selectedChats, setSelectedChats] = useState<string[]>([]);

  const individualChats = chats.filter((c) => !c.isGroup);

  const getOtherParticipant = (chat: any) =>
    chat.participants?.find((p: any) => p.phone !== user?.phone) ||
    chat.participants?.[0];

  const toggleMember = (chatId: string) => {
    setSelectedChats((prev) =>
      prev.includes(chatId)
        ? prev.filter((id) => id !== chatId)
        : [...prev, chatId]
    );
  };

  const handleCreate = () => {
    if (!groupName.trim() || selectedChats.length < 1) return;
    const members = selectedChats
      .map((cid) => {
        const chat = individualChats.find((c) => (c._id || c.id) === cid);
        return chat ? getOtherParticipant(chat) : null;
      })
      .filter(Boolean);

    const newGroup = {
      _id: `group-${Date.now()}`,
      id: `group-${Date.now()}`,
      isGroup: true,
      groupName: groupName.trim(),
      participants: [user, ...members],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessage: null,
      unreadCount: 0,
    };
    onCreate(newGroup);
    setStep("success");
    setTimeout(() => onClose(), 1800);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          background: "rgba(15, 8, 30, 0.97)",
          border: "1px solid rgba(139,92,246,0.3)",
          borderRadius: 20,
          padding: "28px",
          position: "relative",
          boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "rgba(255,255,255,0.08)",
            border: "none",
            borderRadius: "50%",
            width: 32,
            height: 32,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={16} color="rgba(255,255,255,0.5)" />
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "rgba(139,92,246,0.15)",
              border: "1px solid rgba(139,92,246,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Users size={20} color="#a78bfa" />
          </div>
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 600,
                color: "white",
              }}
            >
              Crear grupo
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "rgba(255,255,255,0.4)",
              }}
            >
              {step === "info"
                ? "Ponle nombre al grupo"
                : `${selectedChats.length} participante(s) seleccionado(s)`}
            </p>
          </div>
        </div>

        {step === "success" && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                margin: "0 auto 16px",
                background: "rgba(34,197,94,0.15)",
                border: "1px solid rgba(34,197,94,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle size={28} color="#4ade80" />
            </div>
            <h4
              style={{
                margin: "0 0 6px",
                fontSize: 17,
                fontWeight: 600,
                color: "white",
              }}
            >
              ¡Grupo creado!
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
              }}
            >
              "{groupName}" está listo
            </p>
          </div>
        )}

        {step === "info" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input
              autoFocus
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && groupName.trim() && setStep("members")
              }
              placeholder="Nombre del grupo..."
              maxLength={60}
              style={{
                padding: "13px 16px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(139,92,246,0.3)",
                borderRadius: 12,
                color: "white",
                fontSize: 15,
                outline: "none",
                fontFamily: "inherit",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(139,92,246,0.65)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(139,92,246,0.3)")
              }
            />
            <GlowButton
              variant="primary"
              className="w-full"
              onClick={() => setStep("members")}
              disabled={!groupName.trim()}
            >
              Siguiente
            </GlowButton>
          </div>
        )}

        {step === "members" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {individualChats.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 13,
                }}
              >
                No tienes contactos individuales aún
              </p>
            ) : (
              <div
                style={{
                  maxHeight: 280,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {individualChats.map((chat) => {
                  const other = getOtherParticipant(chat);
                  const name = other?.name || other?.phone || "Desconocido";
                  const chatId = chat._id || chat.id;
                  const selected = selectedChats.includes(chatId);
                  return (
                    <button
                      key={chatId}
                      onClick={() => toggleMember(chatId)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 12px",
                        borderRadius: 12,
                        cursor: "pointer",
                        background: selected
                          ? "rgba(139,92,246,0.15)"
                          : "rgba(255,255,255,0.03)",
                        border: selected
                          ? "1px solid rgba(139,92,246,0.4)"
                          : "1px solid transparent",
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: "50%",
                          background: "rgba(139,92,246,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        {other?.avatar ? (
                          <img
                            src={other.avatar}
                            alt={name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: 16 }}>👤</span>
                        )}
                      </div>
                      <span
                        style={{
                          flex: 1,
                          color: "white",
                          fontSize: 14,
                          fontWeight: 500,
                        }}
                      >
                        {name}
                      </span>
                      {selected && <CheckCircle size={18} color="#a78bfa" />}
                    </button>
                  );
                })}
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <GlowButton
                variant="secondary"
                className="flex-1"
                onClick={() => setStep("info")}
              >
                Atrás
              </GlowButton>
              <GlowButton
                variant="primary"
                className="flex-1"
                onClick={handleCreate}
                disabled={selectedChats.length < 1}
              >
                <Users size={15} />
                Crear grupo
              </GlowButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Modal Reportar ─────────────────────────────────────────────────────────────
const ReportModal: React.FC<{ chatName: string; onClose: () => void }> = ({
  chatName,
  onClose,
}) => {
  const reasons = [
    "Spam o publicidad no deseada",
    "Contenido inapropiado u ofensivo",
    "Acoso o amenazas",
    "Fraude o estafa",
    "Suplantación de identidad",
    "Otro motivo",
  ];
  const [selected, setSelected] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = () => {
    if (!selected) return;
    setDone(true);
    setTimeout(() => onClose(), 2000);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(15, 8, 30, 0.97)",
          border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: 20,
          padding: "28px",
          position: "relative",
          boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "rgba(255,255,255,0.08)",
            border: "none",
            borderRadius: "50%",
            width: 32,
            height: 32,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={16} color="rgba(255,255,255,0.5)" />
        </button>

        {done ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                margin: "0 auto 16px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle size={28} color="#f87171" />
            </div>
            <h4
              style={{
                margin: "0 0 6px",
                fontSize: 17,
                fontWeight: 600,
                color: "white",
              }}
            >
              Reporte enviado
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
              }}
            >
              Gracias. Revisaremos el caso.
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Flag size={20} color="#f87171" />
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 17,
                    fontWeight: 600,
                    color: "white",
                  }}
                >
                  Reportar
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  {chatName}
                </p>
              </div>
            </div>

            <p
              style={{
                margin: "0 0 14px",
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              ¿Cuál es el motivo del reporte?
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 20,
              }}
            >
              {reasons.map((r) => (
                <button
                  key={r}
                  onClick={() => setSelected(r)}
                  style={{
                    padding: "11px 14px",
                    borderRadius: 10,
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: 13,
                    fontFamily: "inherit",
                    background:
                      selected === r
                        ? "rgba(239,68,68,0.12)"
                        : "rgba(255,255,255,0.04)",
                    border:
                      selected === r
                        ? "1px solid rgba(239,68,68,0.4)"
                        : "1px solid rgba(255,255,255,0.07)",
                    color: selected === r ? "#fca5a5" : "rgba(255,255,255,0.7)",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <GlowButton
                variant="secondary"
                className="flex-1"
                onClick={onClose}
              >
                Cancelar
              </GlowButton>
              <button
                onClick={handleSubmit}
                disabled={!selected}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: 12,
                  cursor: selected ? "pointer" : "not-allowed",
                  background: selected
                    ? "rgba(239,68,68,0.8)"
                    : "rgba(239,68,68,0.2)",
                  border: "1px solid rgba(239,68,68,0.5)",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
              >
                Reportar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Sidebar Principal ──────────────────────────────────────────────────────────
export const Sidebar: React.FC<SidebarProps> = ({ isMobile, onSelectChat }) => {
  const { user, logout } = useAuth();
  const { chats, selectedChat, selectChat, createGroup, removeContact } = useChat();

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddContact, setShowAddContact] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showSettings, setShowSettings] = useState(false); // ← NUEVO
  const [showAIChat, setShowAIChat] = useState(false); // ← NUEVO
  const [localGroups, setLocalGroups] = useState<any[]>([]);
  const [menuChatId, setMenuChatId] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<Record<string, boolean>>({});
  const [reportChat, setReportChat] = useState<any | null>(null);
  const [confirmRemoveContact, setConfirmRemoveContact] = useState<{ name: string; contactId: string } | null>(null);

  const allChats = [...chats, ...localGroups];

  const getOtherParticipant = (chat: any) => {
    if (chat.isGroup) return null;
    return (
      chat.participants?.find((p: any) => p.phone !== user?.phone) ||
      chat.participants?.[0]
    );
  };

  const getChatName = (chat: any) => {
    if (chat.isGroup) return chat.groupName || "Grupo";
    const other = getOtherParticipant(chat);
    return other?.name || other?.phone || "Desconocido";
  };

  const getChatAvatar = (chat: any) => {
    if (chat.isGroup) return chat.groupAvatar;
    return getOtherParticipant(chat)?.avatar;
  };

  const isOnline = (chat: any) => {
    if (chat.isGroup) return false;
    return getOtherParticipant(chat)?.online || false;
  };

  const filteredChats = allChats.filter((chat) =>
    getChatName(chat).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectChat = (chat: any) => {
    selectChat(chat);
    if (isMobile && onSelectChat) onSelectChat();
    setMenuChatId(null);
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    const now = new Date();
    const d = new Date(dateStr);
    const isToday = now.toDateString() === d.toDateString();
    if (isToday)
      return d.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  const getLastMessageText = (chat: any) => {
    if (!chat.lastMessage)
      return chat.isGroup ? "Grupo creado" : "Sin mensajes aún";
    if (chat.lastMessage.deleted) return "Mensaje eliminado";
    if (chat.lastMessage.type === "image") return "📷 Imagen";
    if (chat.lastMessage.type === "video") return "🎥 Video";
    if (chat.lastMessage.type === "audio") return "🎤 Audio";
    if (chat.lastMessage.type === "file") return "📄 Archivo";
    return chat.lastMessage.content || "";
  };

  const handleToggleBlock = (chatId: string) => {
    setBlocked((prev) => ({ ...prev, [chatId]: !prev[chatId] }));
    setMenuChatId(null);
  };

  const handleReport = (chat: any) => {
    setReportChat(chat);
    setMenuChatId(null);
  };

  const handleCreateGroup = async (group: any) => {
    const phones = group.participants.map((p: any) => p.phone);
    await createGroup(group.groupName, phones);
  };

  const handleRemoveContact = (chat: any) => {
    const other = chat.participants?.find((p: any) => p.phone !== user?.phone) || chat.participants?.[0];
    const name = chat.isGroup ? (chat.groupName || "Grupo") : (other?.name || other?.phone || "Desconocido");
    if (other?._id) {
      setConfirmRemoveContact({ name, contactId: other._id });
    }
    setMenuChatId(null);
  };

  const doRemoveContact = async () => {
    if (!confirmRemoveContact) return;
    await removeContact(confirmRemoveContact.contactId);
    setConfirmRemoveContact(null);
  };

  return (
    <>
      <div className="w-full h-full flex flex-col bg-secure-gray-dark/50 border-r border-secure-purple/20">
        {/* Header */}
        <div className="p-4 border-b border-secure-purple/20">
          <div className="flex items-center justify-between mb-4">
            {/* Avatar + nombre → abre perfil */}
            <div
              className="flex items-center gap-3"
              style={{ cursor: "pointer" }}
              onClick={() => setShowProfile(true)}
            >
              <div style={{ position: "relative" }}>
                <Avatar src={user?.avatar} alt={user?.name || ""} size="md" />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#22c55e",
                    border: "2px solid #1a0a2e",
                  }}
                />
              </div>
              <div>
                <h3 className="font-semibold text-white">{user?.name}</h3>
                <p className="text-xs text-gray-400">{user?.phone}</p>
              </div>
            </div>

            {/* Botones de acción */}
            <div style={{ display: "flex", gap: 4 }}>
              {[
                {
                  icon: Eye,
                  action: () => setShowStatus(true),
                  title: "Estados",
                },
                {
                  icon: Sparkles, // ← Asistente IA
                  action: () => setShowAIChat(true),
                  title: "Asistente IA",
                },
                {
                  icon: Settings, // ← Ajustes
                  action: () => setShowSettings(true),
                  title: "Ajustes",
                },
                { icon: LogOut, action: logout, title: "Cerrar sesión" },
              ].map(({ icon: Icon, action, title }) => (
                <button
                  key={title}
                  onClick={action}
                  title={title}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 8,
                    borderRadius: 8,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.08)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "none")
                  }
                >
                  <Icon size={18} color="rgba(255,255,255,0.5)" />
                </button>
              ))}
            </div>
          </div>

          {/* Búsqueda + acciones */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar chats..."
                className="w-full bg-secure-gray-medium border border-secure-purple/30 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-secure-lilac/50"
              />
            </div>
            <GlowButton
              variant="secondary"
              size="sm"
              onClick={() => setShowAddContact(true)}
              className="!p-2.5"
              title="Agregar contacto"
            >
              <Plus className="w-5 h-5" />
            </GlowButton>
            <GlowButton
              variant="secondary"
              size="sm"
              onClick={() => setShowCreateGroup(true)}
              className="!p-2.5"
              title="Crear grupo"
            >
              <Users className="w-5 h-5" />
            </GlowButton>
          </div>
        </div>

        {/* Lista de chats */}
        <div
          className="flex-1 overflow-y-auto scrollbar-custom"
          onClick={() => menuChatId && setMenuChatId(null)}
        >
          {allChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="w-16 h-16 mb-4 rounded-full bg-secure-purple/20 flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-secure-lilac" />
              </div>
              <h4 className="text-white font-medium mb-2">
                No tienes contactos
              </h4>
              <p className="text-sm text-gray-400 mb-4">
                Agrega tu primer contacto para comenzar
              </p>
              <GlowButton
                variant="primary"
                size="sm"
                onClick={() => setShowAddContact(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Contacto
              </GlowButton>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <Search className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-gray-400">No se encontraron chats</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredChats.map((chat) => {
                const chatId = chat._id || chat.id;
                const isSelected =
                  (selectedChat as any)?._id === chatId ||
                  (selectedChat as any)?.id === chatId;
                const name = getChatName(chat);
                const avatar = getChatAvatar(chat);
                const lastMsgTime =
                  chat.lastMessage?.createdAt || chat.updatedAt;
                const isBlocked = blocked[chatId];
                const showMenu = menuChatId === chatId;

                return (
                  <div key={chatId} style={{ position: "relative" }}>
                    <button
                      onClick={() => handleSelectChat(chat)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                        isSelected
                          ? "bg-secure-lilac/20 border border-secure-lilac/30"
                          : "hover:bg-white/5 border border-transparent"
                      }`}
                      style={{ opacity: isBlocked ? 0.45 : 1 }}
                    >
                      <div className="relative flex-shrink-0">
                        <div style={{ position: "relative" }}>
                          <Avatar src={avatar} alt={name} size="md" />
                          {chat.isGroup && (
                            <div
                              style={{
                                position: "absolute",
                                bottom: -2,
                                right: -2,
                                background: "rgba(139,92,246,0.9)",
                                borderRadius: "50%",
                                width: 16,
                                height: 16,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "1.5px solid #0f081e",
                              }}
                            >
                              <Users size={9} color="white" />
                            </div>
                          )}
                        </div>
                        {isOnline(chat) && !chat.isGroup && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-secure-gray-dark" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4
                            className={`font-medium truncate ${
                              isSelected ? "text-white" : "text-gray-200"
                            }`}
                          >
                            {name}
                            {isBlocked && (
                              <span
                                style={{
                                  marginLeft: 6,
                                  fontSize: 10,
                                  color: "#f87171",
                                  fontWeight: 400,
                                }}
                              >
                                bloqueado
                              </span>
                            )}
                          </h4>
                          {lastMsgTime && (
                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                              {formatTime(lastMsgTime)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm truncate text-gray-500">
                          {getLastMessageText(chat)}
                        </p>
                      </div>

                      <ChevronRight
                        className={`w-4 h-4 flex-shrink-0 ${
                          isSelected ? "text-secure-lilac" : "text-gray-600"
                        }`}
                      />
                    </button>

                    {/* Botón "⋮" — solo chats individuales */}
                    {!chat.isGroup && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuChatId(showMenu ? null : chatId);
                        }}
                        title="Opciones"
                        style={{
                          position: "absolute",
                          right: 36,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 6,
                          borderRadius: 8,
                          color: "rgba(255,255,255,0.4)",
                          transition: "opacity 0.15s, background 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(255,255,255,0.08)";
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "none";
                          e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                        }}
                      >
                        <MoreVertical size={15} />
                      </button>
                    )}

                    {/* Menú contextual */}
                    {showMenu && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: "absolute",
                          right: 8,
                          top: "calc(100% - 4px)",
                          zIndex: 50,
                          background: "rgba(15,8,30,0.98)",
                          border: "1px solid rgba(139,92,246,0.25)",
                          borderRadius: 12,
                          overflow: "hidden",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                          minWidth: 190,
                        }}
                      >
                        <button
                          onClick={() => handleToggleBlock(chatId)}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: isBlocked ? "#4ade80" : "#fca5a5",
                            fontSize: 13,
                            fontFamily: "inherit",
                            textAlign: "left",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(255,255,255,0.06)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "none")
                          }
                        >
                          {isBlocked ? (
                            <>
                              <UserCheck size={15} /> Desbloquear
                            </>
                          ) : (
                            <>
                              <Ban size={15} /> Bloquear
                            </>
                          )}
                        </button>

                        <div
                          style={{
                            height: 1,
                            background: "rgba(255,255,255,0.06)",
                            margin: "0 10px",
                          }}
                        />

                        <button
                          onClick={() => handleReport(chat)}
                          style={{
                            width: "100%",
                            padding: "12px 16px",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#f87171",
                            fontSize: 13,
                            fontFamily: "inherit",
                            textAlign: "left",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(239,68,68,0.07)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "none")
                          }
                        >
                          <Flag size={15} />
                          Reportar
                        </button>

                        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 10px" }} />

                        <button
                          onClick={() => handleRemoveContact(chat)}
                          style={{ width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", color: "#f87171", fontSize: 13, fontFamily: "inherit", textAlign: "left" as const }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.07)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                        >
                          <UserMinus size={15} />
                          Eliminar contacto
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Modales ── */}
      {showAddContact && (
        <AddContactModal onClose={() => setShowAddContact(false)} />
      )}
      {showProfile && (
        <ProfileEdit
          onClose={() => {
            setShowProfile(false);
            window.location.reload();
          }}
        />
      )}
      {showStatus && <StatusView onClose={() => setShowStatus(false)} />}
      {showCreateGroup && (
        <CreateGroupModal
          chats={chats}
          user={user}
          onClose={() => setShowCreateGroup(false)}
          onCreate={handleCreateGroup}
        />
      )}
      {reportChat && (
        <ReportModal
          chatName={getChatName(reportChat)}
          onClose={() => setReportChat(null)}
        />
      )}

      {/* ── NUEVOS: Settings y Chatbot ── */}
      {showSettings && <SettingsView onClose={() => setShowSettings(false)} />}
      {showAIChat && <AIChatbotView onClose={() => setShowAIChat(false)} />}

      {/* ── Modal confirmar eliminar contacto ── */}
      {confirmRemoveContact && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "rgba(15,8,30,0.98)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 18, padding: 28, width: "100%", maxWidth: 320, textAlign: "center" as const, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <UserMinus size={24} color="#f87171" />
            </div>
            <h3 style={{ color: "#fff", fontSize: 17, fontWeight: 600, margin: "0 0 8px" }}>¿Eliminar contacto?</h3>
            <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 4px", lineHeight: 1.5 }}>
              Vas a eliminar a <strong style={{ color: "#fff" }}>{confirmRemoveContact.name}</strong> de tus contactos.
            </p>
            <p style={{ color: "#6b7280", fontSize: 12, margin: "0 0 24px" }}>El historial de mensajes no se borrará.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmRemoveContact(null)} style={{ flex: 1, padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", cursor: "pointer", fontSize: 14, fontFamily: "inherit", fontWeight: 500 }}>Cancelar</button>
              <button onClick={doRemoveContact} style={{ flex: 1, padding: "12px", borderRadius: 12, background: "rgba(239,68,68,0.75)", border: "none", color: "#fff", cursor: "pointer", fontSize: 14, fontFamily: "inherit", fontWeight: 600 }}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};