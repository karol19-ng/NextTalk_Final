import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/common/Avatar";
import {
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Mic,
  Send,
  Check,
  CheckCheck,
  Lock,
  ChevronLeft,
  UserPlus,
  MessageSquare,
  StopCircle,
  Trash2,
  FileText,
  Download,
  Play,
  Image,
  X,
  Users,
} from "lucide-react";

const OTP_SERVICE =
  import.meta.env.VITE_OTP_SERVICE_URL || "https://cr4j9v-5000.csb.app";

interface ChatWindowProps {
  isMobile?: boolean;
  onBack?: () => void;
}

const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Hoy";
  if (date.toDateString() === yesterday.toDateString()) return "Ayer";
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

const formatFileSize = (bytes: number) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const ChatWindow: React.FC<ChatWindowProps> = ({ isMobile, onBack }) => {
  const { user } = useAuth();
  const { selectedChat, messages, sendMessage, deleteMessage, chats } =
    useChat();

  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [selectedMsg, setSelectedMsg] = useState<string | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [confirmDeleteMsgId, setConfirmDeleteMsgId] = useState<string | null>(null);

  // Mensajes locales para grupos creados localmente
  const [localGroupMessages, setLocalGroupMessages] = useState<
    Record<string, any[]>
  >({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedChat, localGroupMessages]);

  // Sin chats Y sin chat seleccionado → pantalla de bienvenida
  if (chats.length === 0 && !selectedChat) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(139,92,246,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <UserPlus size={36} color="#a78bfa" />
        </div>
        <h3
          style={{
            margin: "0 0 10px",
            fontSize: 22,
            fontWeight: 600,
            color: "white",
            textAlign: "center",
          }}
        >
          Bienvenido a NextTalk
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: "rgba(255,255,255,0.4)",
            textAlign: "center",
            maxWidth: 340,
          }}
        >
          Agrega tu primer contacto usando el botón + en la barra lateral
        </p>
      </div>
    );
  }

  if (!selectedChat) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background:
              "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(109,40,217,0.3))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <MessageSquare size={32} color="#a78bfa" />
        </div>
        <h3
          style={{
            margin: "0 0 8px",
            fontSize: 20,
            fontWeight: 600,
            color: "white",
          }}
        >
          Selecciona un chat
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: "rgba(255,255,255,0.4)",
            textAlign: "center",
          }}
        >
          Elige un contacto para comenzar a chatear
        </p>
      </div>
    );
  }

  const chatId = (selectedChat as any)._id || (selectedChat as any).id;
  const isLocalGroup =
    (selectedChat as any).isGroup && String(chatId).startsWith("group-");

  // Para grupos locales usamos localGroupMessages; para el resto el contexto
  const chatMessages = isLocalGroup
    ? localGroupMessages[chatId] || []
    : messages[chatId] || messages[(selectedChat as any)._id] || [];

  const other = (selectedChat as any).isGroup
    ? null
    : (selectedChat as any).participants?.find(
        (p: any) => p.phone !== user?.phone
      ) || (selectedChat as any).participants?.[0];

  const chatName = (selectedChat as any).isGroup
    ? (selectedChat as any).groupName || "Grupo"
    : other?.name || other?.phone || "Chat";

  const chatAvatar = (selectedChat as any).isGroup
    ? (selectedChat as any).groupAvatar
    : other?.avatar;

  const isOnline = !(selectedChat as any).isGroup && other?.online;

  const memberCount = (selectedChat as any).isGroup
    ? (selectedChat as any).participants?.length || 0
    : 0;

  const groupedMessages: { date: string; msgs: any[] }[] = [];
  chatMessages.forEach((msg: any) => {
    const d = formatDate(msg.createdAt);
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === d) last.msgs.push(msg);
    else groupedMessages.push({ date: d, msgs: [msg] });
  });

  // Enviar mensaje — grupos locales usan estado local
  const handleSend = async () => {
    if (!inputValue.trim()) return;
    if (isLocalGroup) {
      const newMsg = {
        _id: `lmsg-${Date.now()}`,
        content: inputValue.trim(),
        type: "text",
        createdAt: new Date().toISOString(),
        sender: user,
        status: "sent",
      };
      setLocalGroupMessages((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), newMsg],
      }));
      setInputValue("");
      return;
    }
    await sendMessage(inputValue.trim(), "text");
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadProgress(`Subiendo ${file.name}...`);
    setShowAttachMenu(false);

    if (isLocalGroup) {
      // Para grupos locales mostramos el archivo con URL objeto local
      const localUrl = URL.createObjectURL(file);
      const mimeType = file.type;
      let msgType = "file";
      if (mimeType.startsWith("image/")) msgType = "image";
      else if (mimeType.startsWith("video/")) msgType = "video";
      else if (mimeType.startsWith("audio/")) msgType = "audio";

      const newMsg = {
        _id: `lmsg-${Date.now()}`,
        content: file.name,
        type: msgType,
        mediaUrl: localUrl,
        fileName: file.name,
        fileSize: file.size,
        createdAt: new Date().toISOString(),
        sender: user,
        status: "sent",
      };
      setLocalGroupMessages((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), newMsg],
      }));
      setUploading(false);
      setUploadProgress("");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${OTP_SERVICE}/api/media/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al subir");
      }
      const data = await res.json();
      await sendMessage(
        data.type === "file" ? file.name : data.type,
        data.type,
        data.url,
        { fileName: file.name, fileSize: file.size, duration: data.duration }
      );
    } catch (err: any) {
      alert(err.message || "Error al subir archivo");
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    e.target.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `audio-${Date.now()}.webm`, {
          type: "audio/webm",
        });
        await uploadFile(file);
      };
      mr.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(
        () => setRecordingTime((t) => t + 1),
        1000
      );
    } catch {
      alert("No se pudo acceder al micrófono. Verifica los permisos.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    clearInterval(recordingIntervalRef.current);
    setIsRecording(false);
    setRecordingTime(0);
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      (mediaRecorderRef.current as any).stream
        ?.getTracks()
        .forEach((t: any) => t.stop());
    }
    clearInterval(recordingIntervalRef.current);
    setIsRecording(false);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  const handleDeleteMessage = (msgId: string) => {
    setConfirmDeleteMsgId(msgId);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteMsgId) return;
    if (isLocalGroup) {
      setLocalGroupMessages((prev) => ({
        ...prev,
        [chatId]: (prev[chatId] || []).map((m) =>
          m._id === confirmDeleteMsgId ? { ...m, deleted: true } : m
        ),
      }));
    } else {
      await deleteMessage(confirmDeleteMsgId, chatId);
    }
    setSelectedMsg(null);
    setConfirmDeleteMsgId(null);
  };

  const renderMessageContent = (msg: any) => {
    if (msg.deleted)
      return (
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.3)",
            fontStyle: "italic",
            margin: 0,
          }}
        >
          Mensaje eliminado
        </p>
      );

    switch (msg.type) {
      case "image":
        return (
          <div
            style={{
              borderRadius: 10,
              overflow: "hidden",
              maxWidth: 260,
              cursor: "pointer",
            }}
            onClick={() => window.open(msg.mediaUrl, "_blank")}
          >
            <img
              src={msg.mediaUrl}
              alt="imagen"
              style={{
                width: "100%",
                display: "block",
                maxHeight: 300,
                objectFit: "cover",
              }}
            />
          </div>
        );
      case "video":
        return (
          <div style={{ borderRadius: 10, overflow: "hidden", maxWidth: 280 }}>
            <video
              src={msg.mediaUrl}
              controls
              style={{ width: "100%", display: "block", maxHeight: 300 }}
            />
          </div>
        );
      case "audio":
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "4px 0",
              minWidth: 200,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(139,92,246,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Mic size={16} color="#a78bfa" />
            </div>
            <audio
              src={msg.mediaUrl}
              controls
              style={{ flex: 1, height: 32 }}
            />
            {msg.duration && (
              <span
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.4)",
                  flexShrink: 0,
                }}
              >
                {msg.duration}s
              </span>
            )}
          </div>
        );
      case "file":
        return (
          <a
            href={msg.mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              padding: "4px 0",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "rgba(139,92,246,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FileText size={18} color="#a78bfa" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "white",
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {msg.fileName || "Archivo"}
              </p>
              {msg.fileSize && (
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  {formatFileSize(msg.fileSize)}
                </p>
              )}
            </div>
            <Download size={16} color="rgba(255,255,255,0.4)" />
          </a>
        );
      default:
        return (
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: "white",
              lineHeight: 1.5,
              wordBreak: "break-word",
            }}
          >
            {msg.content}
          </p>
        );
    }
  };

  const btnStyle = {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 8,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "rgba(0,0,0,0.15)",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid rgba(139,92,246,0.2)",
          background: "rgba(15,8,30,0.7)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isMobile && onBack && (
            <button style={btnStyle} onClick={onBack}>
              <ChevronLeft size={22} color="rgba(255,255,255,0.7)" />
            </button>
          )}
          <div style={{ position: "relative" }}>
            {/* Avatar del grupo con badge de grupo */}
            {(selectedChat as any).isGroup ? (
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, rgba(139,92,246,0.4), rgba(109,40,217,0.5))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(139,92,246,0.4)",
                }}
              >
                <Users size={18} color="#a78bfa" />
              </div>
            ) : (
              <>
                <Avatar src={chatAvatar} alt={chatName} size="md" />
                {isOnline && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 11,
                      height: 11,
                      borderRadius: "50%",
                      background: "#22c55e",
                      border: "2px solid #0a0a0f",
                    }}
                  />
                )}
              </>
            )}
          </div>
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 600,
                color: "white",
              }}
            >
              {chatName}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "rgba(255,255,255,0.4)",
              }}
            >
              {(selectedChat as any).isGroup
                ? `${memberCount} participante${memberCount !== 1 ? "s" : ""}`
                : isOnline
                ? "En línea"
                : "Desconectado"}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 10px",
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: 20,
              marginRight: 8,
            }}
          >
            <Lock size={11} color="#4ade80" />
            <span style={{ fontSize: 11, color: "#4ade80" }}>Cifrado</span>
          </div>
          {[Phone, Video, MoreVertical].map((Icon, i) => (
            <button
              key={i}
              style={btnStyle}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <Icon size={20} color="rgba(255,255,255,0.5)" />
            </button>
          ))}
        </div>
      </div>

      {/* Mensajes */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
        className="scrollbar-custom"
        onClick={() => setSelectedMsg(null)}
      >
        {chatMessages.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              minHeight: 200,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "rgba(139,92,246,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
              }}
            >
              {(selectedChat as any).isGroup ? (
                <Users size={26} color="#a78bfa" />
              ) : (
                <MessageSquare size={26} color="#a78bfa" />
              )}
            </div>
            <p
              style={{
                margin: "0 0 6px",
                fontSize: 14,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {(selectedChat as any).isGroup
                ? `¡El grupo "${chatName}" está listo!`
                : `Inicia la conversación con ${chatName}`}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "rgba(255,255,255,0.25)",
              }}
            >
              Mensajes cifrados de extremo a extremo
            </p>
          </div>
        ) : (
          groupedMessages.map((group, gi) => (
            <div key={gi}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: "12px 0",
                }}
              >
                <span
                  style={{
                    padding: "3px 12px",
                    background: "rgba(139,92,246,0.2)",
                    borderRadius: 20,
                    fontSize: 11,
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {group.date}
                </span>
              </div>
              {group.msgs.map((msg: any) => {
                const isMine = msg.sender?.phone === user?.phone;
                const isSelected = selectedMsg === msg._id;
                const hasMedia = msg.type !== "text";

                return (
                  <div
                    key={msg._id}
                    style={{
                      display: "flex",
                      justifyContent: isMine ? "flex-end" : "flex-start",
                      marginBottom: 6,
                      position: "relative",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMsg(isSelected ? null : msg._id);
                    }}
                  >
                    {/* Avatar del remitente en grupos */}
                    {(selectedChat as any).isGroup && !isMine && (
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: "rgba(139,92,246,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          alignSelf: "flex-end",
                          marginRight: 6,
                          overflow: "hidden",
                        }}
                      >
                        {msg.sender?.avatar ? (
                          <img
                            src={msg.sender.avatar}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: 12 }}>👤</span>
                        )}
                      </div>
                    )}

                    {isSelected && isMine && !msg.deleted && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMessage(msg._id);
                        }}
                        title="Eliminar mensaje"
                        style={{
                          position: "absolute",
                          top: -10,
                          right: 4,
                          background: "rgba(239,68,68,0.85)",
                          border: "none",
                          borderRadius: "50%",
                          width: 26,
                          height: 26,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 20,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                        }}
                      >
                        <Trash2 size={13} color="#fff" />
                      </button>
                    )}

                    <div
                      style={{
                        maxWidth: "70%",
                        background: isMine
                          ? "rgba(139,92,246,0.25)"
                          : "rgba(255,255,255,0.07)",
                        border: `1px solid ${
                          isMine
                            ? "rgba(139,92,246,0.3)"
                            : "rgba(255,255,255,0.08)"
                        }`,
                        borderRadius: isMine
                          ? "18px 18px 4px 18px"
                          : "18px 18px 18px 4px",
                        padding:
                          hasMedia && !msg.deleted
                            ? msg.type === "image" || msg.type === "video"
                              ? 4
                              : "10px 14px"
                            : "10px 14px",
                        cursor: "pointer",
                        opacity: msg.deleted ? 0.5 : 1,
                        outline: isSelected
                          ? "2px solid rgba(139,92,246,0.5)"
                          : "none",
                      }}
                    >
                      {/* Nombre del remitente en grupos */}
                      {(selectedChat as any).isGroup &&
                        !isMine &&
                        !msg.deleted && (
                          <p
                            style={{
                              margin: "0 0 4px",
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#a78bfa",
                            }}
                          >
                            {msg.sender?.name ||
                              msg.sender?.phone ||
                              "Participante"}
                          </p>
                        )}

                      {renderMessageContent(msg)}

                      {!msg.deleted && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: 4,
                            marginTop: 4,
                            paddingRight: hasMedia ? 8 : 0,
                            paddingBottom: hasMedia ? 4 : 0,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 10,
                              color: "rgba(255,255,255,0.3)",
                            }}
                          >
                            {formatTime(msg.createdAt)}
                          </span>
                          {msg.edited && (
                            <span
                              style={{
                                fontSize: 10,
                                color: "rgba(255,255,255,0.25)",
                              }}
                            >
                              editado
                            </span>
                          )}
                          {isMine &&
                            (msg.status === "read" ? (
                              <CheckCheck size={13} color="#a78bfa" />
                            ) : msg.status === "delivered" ? (
                              <CheckCheck
                                size={13}
                                color="rgba(255,255,255,0.3)"
                              />
                            ) : (
                              <Check size={13} color="rgba(255,255,255,0.3)" />
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(139,92,246,0.2)",
          background: "rgba(15,8,30,0.7)",
          backdropFilter: "blur(12px)",
        }}
      >
        {uploading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
              padding: "8px 12px",
              background: "rgba(139,92,246,0.1)",
              borderRadius: 10,
              border: "1px solid rgba(139,92,246,0.2)",
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: "2px solid #a78bfa",
                borderTopColor: "transparent",
                animation: "spin 0.8s linear infinite",
                flexShrink: 0,
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } } @keyframes pulse2 { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
            <span style={{ fontSize: 12, color: "#a78bfa" }}>
              {uploadProgress || "Subiendo..."}
            </span>
          </div>
        )}

        {isRecording ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#ef4444",
                animation: "pulse2 1s ease-in-out infinite",
                flexShrink: 0,
              }}
            />
            <span style={{ flex: 1, color: "white", fontSize: 14 }}>
              Grabando...{" "}
              {Math.floor(recordingTime / 60)
                .toString()
                .padStart(2, "0")}
              :{(recordingTime % 60).toString().padStart(2, "0")}
            </span>
            <button
              onClick={cancelRecording}
              style={{ ...btnStyle, background: "rgba(239,68,68,0.1)" }}
            >
              <X size={18} color="#f87171" />
            </button>
            <button
              onClick={stopRecording}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <StopCircle size={20} color="white" />
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              position: "relative",
            }}
          >
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xlsx,.zip,.rar,.txt"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                style={{
                  ...btnStyle,
                  background: showAttachMenu
                    ? "rgba(255,255,255,0.08)"
                    : "none",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = showAttachMenu
                    ? "rgba(255,255,255,0.08)"
                    : "none")
                }
              >
                <Paperclip size={20} color="rgba(255,255,255,0.5)" />
              </button>

              {showAttachMenu && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "100%",
                    left: 0,
                    marginBottom: 8,
                    background: "rgba(15,8,30,0.98)",
                    border: "1px solid rgba(139,92,246,0.3)",
                    borderRadius: 14,
                    overflow: "hidden",
                    minWidth: 160,
                    boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
                  }}
                >
                  {[
                    {
                      icon: Image,
                      label: "Imagen",
                      action: () => imageInputRef.current?.click(),
                      color: "#a78bfa",
                    },
                    {
                      icon: Play,
                      label: "Video",
                      action: () => videoInputRef.current?.click(),
                      color: "#60a5fa",
                    },
                    {
                      icon: FileText,
                      label: "Documento",
                      action: () => fileInputRef.current?.click(),
                      color: "#34d399",
                    },
                  ].map(({ icon: Icon, label, action, color }) => (
                    <button
                      key={label}
                      onClick={() => {
                        action();
                        setShowAttachMenu(false);
                      }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 16px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,255,255,0.06)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "none")
                      }
                    >
                      <Icon size={18} color={color} />
                      <span style={{ fontSize: 14, color: "white" }}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                (selectedChat as any).isGroup
                  ? `Mensaje a ${chatName}...`
                  : "Escribe un mensaje..."
              }
              style={{
                flex: 1,
                padding: "12px 18px",
                boxSizing: "border-box",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(139,92,246,0.25)",
                borderRadius: 24,
                color: "white",
                fontSize: 14,
                outline: "none",
                fontFamily: "inherit",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(139,92,246,0.6)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(139,92,246,0.25)")
              }
            />

            {inputValue.trim() ? (
              <button
                onClick={handleSend}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 14px rgba(139,92,246,0.4)",
                }}
              >
                <Send size={18} color="white" />
              </button>
            ) : (
              <button
                onClick={startRecording}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 14px rgba(139,92,246,0.4)",
                }}
              >
                <Mic size={18} color="white" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Modal confirmación borrar mensaje ── */}
      {confirmDeleteMsgId && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "rgba(15,8,30,0.98)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 18, padding: 28, width: "100%", maxWidth: 320, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={24} color="#f87171" />
            </div>
            <h3 style={{ color: "#fff", fontSize: 17, fontWeight: 600, margin: "0 0 8px" }}>¿Eliminar mensaje?</h3>
            <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 24px", lineHeight: 1.5 }}>Esta acción no se puede deshacer. El mensaje será eliminado para todos.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmDeleteMsgId(null)} style={{ flex: 1, padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", cursor: "pointer", fontSize: 14, fontFamily: "inherit", fontWeight: 500 }}>Cancelar</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: "12px", borderRadius: 12, background: "rgba(239,68,68,0.75)", border: "none", color: "#fff", cursor: "pointer", fontSize: 14, fontFamily: "inherit", fontWeight: 600 }}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;