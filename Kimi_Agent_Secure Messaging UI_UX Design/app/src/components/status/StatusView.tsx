import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GlowButton } from "@/components/common/GlowButton";
import { Avatar } from "@/components/common/Avatar";
import {
  X,
  Plus,
  Image,
  Type,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const OTP_SERVICE =
  import.meta.env.VITE_OTP_SERVICE_URL || "https://cr4j9v-5000.csb.app";

interface StatusViewProps {
  onClose: () => void;
}

const BG_COLORS = [
  "#6d28d9",
  "#1d4ed8",
  "#065f46",
  "#92400e",
  "#9f1239",
  "#164e63",
  "#1e1b4b",
  "#2d1b69",
];

export const StatusView: React.FC<StatusViewProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [statuses, setStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createType, setCreateType] = useState<"text" | "image">("text");
  const [textContent, setTextContent] = useState("");
  const [bgColor, setBgColor] = useState(BG_COLORS[0]);
  const [uploading, setUploading] = useState(false);
  const [viewingStatus, setViewingStatus] = useState<any>(null);
  const [viewIndex, setViewIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadStatuses();
  }, []);

  const loadStatuses = async () => {
    if (!user?.phone) return;
    try {
      const res = await fetch(
        `${OTP_SERVICE}/api/status/${encodeURIComponent(user.phone)}`
      );
      if (res.ok) {
        const data = await res.json();
        setStatuses(data.statuses || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handlePostText = async () => {
    if (!textContent.trim()) return;
    setUploading(true);
    try {
      await fetch(`${OTP_SERVICE}/api/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: user!.phone,
          type: "text",
          content: textContent,
          bgColor,
        }),
      });
      setTextContent("");
      setShowCreate(false);
      await loadStatuses();
    } catch {
      alert("Error al publicar estado");
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch(`${OTP_SERVICE}/api/media/upload`, {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();

      await fetch(`${OTP_SERVICE}/api/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: user!.phone,
          type: "image",
          content: uploadData.url,
        }),
      });
      setShowCreate(false);
      await loadStatuses();
    } catch {
      alert("Error al subir imagen");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteStatus = async (statusId: string) => {
    await fetch(`${OTP_SERVICE}/api/status/${statusId}`, { method: "DELETE" });
    await loadStatuses();
  };

  const handleViewStatus = async (group: any) => {
    setViewingStatus(group);
    setViewIndex(0);
    // Marcar como visto
    if (group.statuses?.[0]) {
      await fetch(`${OTP_SERVICE}/api/status/${group.statuses[0]._id}/view`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: user!.phone }),
      });
    }
  };

  const isMyStatus = (group: any) => group.user?.phone === user?.phone;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Visor de estado */}
      {viewingStatus && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "#000",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Barra de progreso */}
          <div style={{ display: "flex", gap: 4, padding: "12px 16px 0" }}>
            {viewingStatus.statuses.map((_: any, i: number) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  background:
                    i <= viewIndex ? "white" : "rgba(255,255,255,0.3)",
                }}
              />
            ))}
          </div>

          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
            }}
          >
            <Avatar
              src={viewingStatus.user?.avatar}
              alt={viewingStatus.user?.name}
              size="sm"
            />
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "white",
                }}
              >
                {viewingStatus.user?.name}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {new Date(
                  viewingStatus.statuses[viewIndex]?.createdAt
                ).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              {isMyStatus(viewingStatus) && (
                <button
                  onClick={() => {
                    handleDeleteStatus(viewingStatus.statuses[viewIndex]._id);
                    setViewingStatus(null);
                  }}
                  style={{
                    background: "rgba(239,68,68,0.2)",
                    border: "none",
                    borderRadius: 8,
                    padding: "6px 10px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Trash2 size={14} color="#f87171" />
                </button>
              )}
              <button
                onClick={() => setViewingStatus(null)}
                style={{
                  background: "rgba(255,255,255,0.1)",
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
                <X size={16} color="white" />
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {viewingStatus.statuses[viewIndex]?.type === "image" ? (
              <img
                src={viewingStatus.statuses[viewIndex].content}
                alt="estado"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <div
                style={{
                  padding: 32,
                  borderRadius: 20,
                  maxWidth: 320,
                  textAlign: "center",
                  background:
                    viewingStatus.statuses[viewIndex]?.bgColor || "#6d28d9",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 600,
                    color: "white",
                    lineHeight: 1.4,
                  }}
                >
                  {viewingStatus.statuses[viewIndex]?.content}
                </p>
              </div>
            )}

            {/* Navegación */}
            {viewIndex > 0 && (
              <button
                onClick={() => setViewIndex((i) => i - 1)}
                style={{
                  position: "absolute",
                  left: 16,
                  background: "rgba(0,0,0,0.4)",
                  border: "none",
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ChevronLeft size={20} color="white" />
              </button>
            )}
            {viewIndex < viewingStatus.statuses.length - 1 && (
              <button
                onClick={() => setViewIndex((i) => i + 1)}
                style={{
                  position: "absolute",
                  right: 16,
                  background: "rgba(0,0,0,0.4)",
                  border: "none",
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ChevronRight size={20} color="white" />
              </button>
            )}
          </div>

          {/* Vistas */}
          {isMyStatus(viewingStatus) && (
            <div
              style={{
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Eye size={14} color="rgba(255,255,255,0.5)" />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                {viewingStatus.statuses[viewIndex]?.viewedBy?.length || 0}{" "}
                vistas
              </span>
            </div>
          )}
        </div>
      )}

      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "rgba(15,8,30,0.97)",
          border: "1px solid rgba(139,92,246,0.3)",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid rgba(139,92,246,0.2)",
          }}
        >
          <h3
            style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "white" }}
          >
            Estados
          </h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setShowCreate(!showCreate)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                background: "rgba(139,92,246,0.2)",
                border: "1px solid rgba(139,92,246,0.3)",
                borderRadius: 10,
                cursor: "pointer",
                color: "#a78bfa",
                fontSize: 13,
              }}
            >
              <Plus size={15} /> Nuevo
            </button>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "none",
                borderRadius: "50%",
                width: 34,
                height: 34,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={16} color="rgba(255,255,255,0.5)" />
            </button>
          </div>
        </div>

        {/* Crear estado */}
        {showCreate && (
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid rgba(139,92,246,0.15)",
              background: "rgba(139,92,246,0.05)",
            }}
          >
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {[
                { type: "text" as const, icon: Type, label: "Texto" },
                { type: "image" as const, icon: Image, label: "Imagen" },
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => setCreateType(type)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    background:
                      createType === type
                        ? "rgba(139,92,246,0.3)"
                        : "rgba(255,255,255,0.05)",
                    border: `1px solid ${
                      createType === type
                        ? "rgba(139,92,246,0.5)"
                        : "rgba(255,255,255,0.1)"
                    }`,
                    borderRadius: 8,
                    cursor: "pointer",
                    color:
                      createType === type ? "#a78bfa" : "rgba(255,255,255,0.5)",
                    fontSize: 13,
                  }}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            {createType === "text" ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="¿Qué está pasando?"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    boxSizing: "border-box",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(139,92,246,0.25)",
                    borderRadius: 12,
                    color: "white",
                    fontSize: 14,
                    outline: "none",
                    fontFamily: "inherit",
                    resize: "none",
                  }}
                />
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span
                    style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}
                  >
                    Color:
                  </span>
                  {BG_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setBgColor(c)}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: c,
                        border:
                          bgColor === c
                            ? "2px solid white"
                            : "2px solid transparent",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </div>
                <GlowButton
                  variant="primary"
                  className="w-full"
                  onClick={handlePostText}
                  loading={uploading}
                  disabled={!textContent.trim()}
                >
                  Publicar estado
                </GlowButton>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
                <GlowButton
                  variant="primary"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  loading={uploading}
                >
                  <Image size={16} /> Seleccionar imagen
                </GlowButton>
              </div>
            )}
          </div>
        )}

        {/* Lista de estados */}
        <div
          style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}
          className="scrollbar-custom"
        >
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: 32,
                color: "rgba(255,255,255,0.4)",
                fontSize: 14,
              }}
            >
              Cargando estados...
            </div>
          ) : statuses.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(139,92,246,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Eye size={24} color="#a78bfa" />
              </div>
              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: 15,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                No hay estados
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.3)",
                }}
              >
                Los estados de tus contactos aparecerán aquí
              </p>
            </div>
          ) : (
            statuses.map((group: any) => (
              <button
                key={group.user?._id}
                onClick={() => handleViewStatus(group)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 24px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.04)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "none")
                }
              >
                {/* Avatar con borde de estado */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    flexShrink: 0,
                    padding: 2,
                    background: isMyStatus(group)
                      ? "linear-gradient(135deg, #8b5cf6, #6d28d9)"
                      : "linear-gradient(135deg, #22c55e, #16a34a)",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      border: "2px solid #0a0a0f",
                      overflow: "hidden",
                      background: "rgba(139,92,246,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {group.user?.avatar ? (
                      <img
                        src={group.user.avatar}
                        alt={group.user.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 20 }}>👤</span>
                    )}
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: "0 0 2px",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "white",
                    }}
                  >
                    {isMyStatus(group) ? "Mi estado" : group.user?.name}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    {group.statuses?.length} estado
                    {group.statuses?.length !== 1 ? "s" : ""} ·{" "}
                    {new Date(
                      group.statuses?.[0]?.createdAt
                    ).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Preview */}
                {group.statuses?.[0]?.type === "image" && (
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 8,
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={group.statuses[0].content}
                      alt="preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}
                {group.statuses?.[0]?.type === "text" && (
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 8,
                      background: group.statuses[0].bgColor || "#6d28d9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Type size={18} color="white" />
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
