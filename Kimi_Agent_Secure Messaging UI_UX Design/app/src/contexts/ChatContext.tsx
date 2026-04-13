import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { io, Socket } from "socket.io-client";

const API =
  import.meta.env.VITE_OTP_SERVICE_URL || "https://cr4j9v-5000.csb.app";

export interface Contact {
  _id: string;
  phone: string;
  name: string;
  avatar?: string;
  online: boolean;
  lastSeen?: Date;
  status?: string;
}

export interface Message {
  _id: string;
  chat: string;
  sender: { _id: string; phone: string; name: string; avatar?: string };
  type: "text" | "image" | "video" | "audio" | "file";
  content: string;
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  status: "sent" | "delivered" | "read";
  deleted: boolean;
  edited: boolean;
  createdAt: string;
}

export interface Chat {
  _id: string;
  participants: Contact[];
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  lastMessage?: any;
  updatedAt: string;
}

interface ChatContextType {
  contacts: Contact[];
  chats: Chat[];
  messages: Record<string, Message[]>;
  selectedChat: Chat | null;
  loading: boolean;
  error: string | null;
  typingUsers: Record<string, string[]>;

  addContact: (phone: string) => Promise<void>;
  selectChat: (chat: Chat | null) => void;
  sendMessage: (
    content: string,
    type?: string,
    mediaUrl?: string,
    extra?: any
  ) => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  deleteMessage: (messageId: string, chatId: string) => Promise<void>;
  editMessage: (
    messageId: string,
    content: string,
    chatId: string
  ) => Promise<void>;
  refreshContacts: () => Promise<void>;
  refreshChats: () => Promise<void>;
  removeContact: (contactId: string) => Promise<void>;
  createGroup: (name: string, phones: string[]) => Promise<void>;
  startChatWithContact: (contact: Contact) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  const socketRef = useRef<Socket | null>(null);

  // ── Solicitar permiso de notificaciones al autenticarse ─────────────────────
  useEffect(() => {
    if (user?.phone && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [user?.phone]);

  // ── Disparar notificación push del navegador ─────────────────────────────
  const fireNotification = useCallback((message: Message) => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const senderName = message.sender?.name || message.sender?.phone || "Alguien";
    const body = message.deleted
      ? "Mensaje eliminado"
      : message.type === "image" ? "📷 Imagen"
      : message.type === "video" ? "🎥 Video"
      : message.type === "audio" ? "🎤 Nota de voz"
      : message.type === "file"  ? `📄 ${message.fileName || "Archivo"}`
      : message.content || "";

    const notifOptions: NotificationOptions & { renotify?: boolean } = {
      body,
      icon: message.sender?.avatar || "/icon-192.png",
      badge: "/icon-192.png",
      tag: `chat-${message.chat}`,
      renotify: true,
      silent: (() => {
        try { return !JSON.parse(localStorage.getItem("nexttalk_setting_notif_msgTone") ?? "true"); }
        catch { return false; }
      })(),
    };
    const n = new Notification(`Tienes un mensaje de ${senderName}`, notifOptions);

    n.onclick = () => { window.focus(); n.close(); };
    setTimeout(() => n.close(), 5000);
  }, []);

  // Cargar datos iniciales al autenticarse
  useEffect(() => {
    if (user?.phone) {
      refreshContacts();
      refreshChats();
    }
  }, [user?.phone]);

  // Conectar socket cuando el usuario se autentique
  useEffect(() => {
    if (!user?.phone) return;

    const socket = io(API, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      // Registrar usuario online y unirse a salas personales
      socket.emit("user_connected", user.phone);
    });

    // Nuevo mensaje en tiempo real
    socket.on("new_message", (message: Message) => {
      // ── Notificación push ──────────────────────────────────────────────────
      // Solo notificar si:
      //   1. El mensaje NO es nuestro
      //   2. El chat NO está abierto en este momento
      //   3. Las notificaciones están activadas en ajustes y el navegador las permite
      const notifEnabled = (() => {
        try { return JSON.parse(localStorage.getItem("nexttalk_setting_notif_messages") ?? "true"); }
        catch { return true; }
      })();

      const isOwnMessage = message.sender?.phone === user.phone;

      // Usamos una ref para leer selectedChat sin crear dependencia en el closure
      setSelectedChat((currentSelected) => {
        const isChatOpen = currentSelected?._id === message.chat;

        if (!isOwnMessage && !isChatOpen && notifEnabled) {
          fireNotification(message);
        }

        return currentSelected; // no cambiamos el estado, solo lo leemos
      });

      setMessages((prev) => {
        const existing = prev[message.chat] || [];
        // Evitar duplicados (el remitente ya lo agrega localmente)
        const alreadyExists = existing.some((m) => m._id === message._id);
        if (alreadyExists) return prev;
        return {
          ...prev,
          [message.chat]: [...existing, message],
        };
      });
      setChats((prev) =>
        prev
          .map((c) =>
            c._id === message.chat
              ? {
                  ...c,
                  lastMessage: message,
                  updatedAt: new Date().toISOString(),
                }
              : c
          )
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
      );
    });

    // Mensaje editado en tiempo real
    socket.on("message_edited", (message: Message) => {
      setMessages((prev) => ({
        ...prev,
        [message.chat]:
          prev[message.chat]?.map((m) =>
            m._id === message._id ? message : m
          ) || [],
      }));
    });

    // Mensaje eliminado en tiempo real
    socket.on(
      "message_deleted",
      ({ messageId, chatId }: { messageId: string; chatId: string }) => {
        setMessages((prev) => ({
          ...prev,
          [chatId]:
            prev[chatId]?.map((m) =>
              m._id === messageId
                ? { ...m, deleted: true, content: "Mensaje eliminado" }
                : m
            ) || [],
        }));
      }
    );

    // Grupo nuevo: recargar chats para que todos los participantes lo vean
    socket.on("new_group", () => {
      refreshChats();
    });

    // Indicador de escritura
    socket.on(
      "user_typing",
      ({ chatId, phone }: { chatId: string; phone: string }) => {
        setTypingUsers((prev) => ({
          ...prev,
          [chatId]: [...new Set([...(prev[chatId] || []), phone])],
        }));
      }
    );

    socket.on(
      "user_stop_typing",
      ({ chatId, phone }: { chatId: string; phone: string }) => {
        setTypingUsers((prev) => ({
          ...prev,
          [chatId]: (prev[chatId] || []).filter((p) => p !== phone),
        }));
      }
    );

    // Presencia
    socket.on("user_online", ({ phone }: { phone: string }) => {
      setContacts((prev) =>
        prev.map((c) => (c.phone === phone ? { ...c, online: true } : c))
      );
    });

    socket.on(
      "user_offline",
      ({ phone, lastSeen }: { phone: string; lastSeen: Date }) => {
        setContacts((prev) =>
          prev.map((c) =>
            c.phone === phone ? { ...c, online: false, lastSeen } : c
          )
        );
      }
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.phone]);

  // Unirse a las salas de los chats cuando se carguen
  useEffect(() => {
    if (socketRef.current?.connected && chats.length > 0) {
      chats.forEach((chat) =>
        socketRef.current?.emit("join_chat", chat._id)
      );
    }
  }, [chats]);

  const refreshContacts = async () => {
    if (!user?.phone) return;
    try {
      const res = await fetch(
        `${API}/api/contacts/${encodeURIComponent(user.phone)}`
      );
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
      }
    } catch {
      setError("Error cargando contactos");
    }
  };

  const refreshChats = async () => {
    if (!user?.phone) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/api/chats/${encodeURIComponent(user.phone)}`
      );
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats || []);
      }
    } catch {
      setError("Error cargando chats");
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (phone: string) => {
    if (!user?.phone) throw new Error("No autenticado");
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/api/contacts/${encodeURIComponent(user.phone)}/add`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contactPhone: phone }),
        }
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "No se pudo agregar el contacto");
      setContacts((prev) => [...prev, data.contact]);
      await startChatWithContact(data.contact);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const startChatWithContact = async (contact: Contact) => {
    if (!user?.phone) return;
    try {
      const res = await fetch(`${API}/api/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          myPhone: user.phone,
          participantPhone: contact.phone,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setChats((prev) => {
          const exists = prev.find((c) => c._id === data.chat._id);
          return exists ? prev : [data.chat, ...prev];
        });
        setSelectedChat(data.chat);
        socketRef.current?.emit("join_chat", data.chat._id);
        await loadMessages(data.chat._id);
      }
    } catch {
      setError("Error al abrir chat");
    }
  };

  const selectChat = async (chat: Chat | null) => {
    setSelectedChat(chat);
    if (chat) {
      // Unirse a la sala al seleccionar el chat
      socketRef.current?.emit("join_chat", chat._id);
      await loadMessages(chat._id);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const res = await fetch(`${API}/api/messages/${chatId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => ({ ...prev, [chatId]: data.messages || [] }));
      }
    } catch {
      console.error("Error cargando mensajes");
    }
  };

  const sendMessage = async (
    content: string,
    type = "text",
    mediaUrl?: string,
    extra?: any
  ) => {
    if (!user?.phone || !selectedChat) return;
    try {
      const res = await fetch(`${API}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: selectedChat._id,
          senderPhone: user.phone,
          content,
          type,
          mediaUrl,
          fileName: extra?.fileName,
          fileSize: extra?.fileSize,
          duration: extra?.duration,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        // NO agregar localmente: el socket "new_message" lo entrega
        // para TODOS los participantes (incluido el remitente),
        // la deduplicación por _id evita duplicados.
      }
    } catch {
      setError("Error al enviar mensaje");
    }
  };

  const deleteMessage = async (messageId: string, chatId: string) => {
    try {
      await fetch(`${API}/api/messages/${messageId}`, { method: "DELETE" });
      setMessages((prev) => ({
        ...prev,
        [chatId]:
          prev[chatId]?.map((m) =>
            m._id === messageId
              ? { ...m, deleted: true, content: "Mensaje eliminado" }
              : m
          ) || [],
      }));
    } catch {
      setError("Error al eliminar mensaje");
    }
  };

  const editMessage = async (
    messageId: string,
    content: string,
    chatId: string
  ) => {
    try {
      const res = await fetch(`${API}/api/messages/${messageId}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => ({
          ...prev,
          [chatId]:
            prev[chatId]?.map((m) =>
              m._id === messageId ? data.message : m
            ) || [],
        }));
      }
    } catch {
      setError("Error al editar mensaje");
    }
  };

  const removeContact = async (contactId: string) => {
    if (!user?.phone) return;
    try {
      const res = await fetch(
        `${API}/api/contacts/${encodeURIComponent(user.phone)}/remove/${contactId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        // Quitar de la lista de contactos
        setContacts((prev) => prev.filter((c) => c._id !== contactId));
        // Quitar el chat 1-a-1 con ese contacto de la lista de chats
        setChats((prev) =>
          prev.filter((chat) => {
            if (chat.isGroup) return true;
            return !chat.participants?.some((p: any) => p._id === contactId);
          })
        );
        // Si ese chat estaba seleccionado, deseleccionarlo
        setSelectedChat((current) => {
          if (!current || current.isGroup) return current;
          const hasContact = current.participants?.some((p: any) => p._id === contactId);
          return hasContact ? null : current;
        });
      }
    } catch {
      setError("Error al eliminar contacto");
    }
  };

  const createGroup = async (name: string, phones: string[]) => {
    if (!user?.phone) return;
    try {
      const res = await fetch(`${API}/api/chats/group`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          myPhone: user.phone,
          participantPhones: phones,
          groupName: name,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setChats((prev) => [data.chat, ...prev]);
        setSelectedChat(data.chat);
        socketRef.current?.emit("join_chat", data.chat._id);
      }
    } catch {
      setError("Error al crear grupo");
    }
  };

  return (
    <ChatContext.Provider
      value={{
        contacts,
        chats,
        messages,
        selectedChat,
        loading,
        error,
        typingUsers,
        addContact,
        selectChat,
        sendMessage,
        loadMessages,
        deleteMessage,
        editMessage,
        refreshContacts,
        refreshChats,
        removeContact,
        createGroup,
        startChatWithContact,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};