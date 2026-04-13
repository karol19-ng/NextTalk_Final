import React, { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/common/Avatar";
import { GlowButton } from "@/components/common/GlowButton";
import { X, Camera, Check, User, Phone, MessageSquare } from "lucide-react";
 
const OTP_SERVICE = import.meta.env.VITE_OTP_SERVICE_URL || "https://cr4j9v-5000.csb.app";
 
interface ProfileEditProps {
  onClose: () => void;
}
 
export const ProfileEdit: React.FC<ProfileEditProps> = ({ onClose }) => {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [status, setStatus] = useState("Hola, uso NextTalk");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
 
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch(
        `${OTP_SERVICE}/api/users/${encodeURIComponent(user!.phone)}/avatar`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (res.ok) setAvatarUrl(data.url);
    } catch { alert("Error al subir imagen"); }
    finally { setUploading(false); }
  };
 
  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${OTP_SERVICE}/api/users/${encodeURIComponent(user!.phone)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, status }),
      });
      // Actualizar nombre local
      localStorage.setItem(`nexttalk_name_${user!.phone}`, name);
      const stored = localStorage.getItem("nexttalk_user");
      if (stored) {
        const u = JSON.parse(stored);
        u.name = name;
        if (avatarUrl) u.avatar = avatarUrl;
        localStorage.setItem("nexttalk_user", JSON.stringify(u));
      }
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 1200);
    } catch { alert("Error al guardar perfil"); }
    finally { setSaving(false); }
  };
 
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
    }}>
      <div style={{
        width: "100%", maxWidth: 420,
        background: "rgba(15,8,30,0.97)",
        border: "1px solid rgba(139,92,246,0.3)",
        borderRadius: 24, padding: "32px 28px",
        position: "relative",
        boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16,
          background: "rgba(255,255,255,0.08)", border: "none",
          borderRadius: "50%", width: 32, height: 32,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <X size={16} color="rgba(255,255,255,0.5)" />
        </button>
 
        <h3 style={{ margin: "0 0 24px", fontSize: 18, fontWeight: 600, color: "white" }}>
          Editar perfil
        </h3>
 
        {/* Avatar */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <div style={{
              width: 90, height: 90, borderRadius: "50%",
              background: "rgba(139,92,246,0.15)",
              border: "2px solid rgba(139,92,246,0.3)",
              overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <User size={36} color="#a78bfa" />
              }
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                position: "absolute", bottom: 0, right: 0,
                width: 30, height: 30, borderRadius: "50%",
                background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                border: "2px solid #0a0a0f", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {uploading
                ? <div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid white", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                : <Camera size={14} color="white" />
              }
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: "none" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
          {uploading && <p style={{ margin: "8px 0 0", fontSize: 12, color: "#a78bfa" }}>Subiendo foto...</p>}
        </div>
 
        {/* Campos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6, fontWeight: 500 }}>
              Nombre
            </label>
            <div style={{ position: "relative" }}>
              <User size={15} color="rgba(139,92,246,0.7)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text" value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Tu nombre"
                style={{
                  width: "100%", padding: "12px 14px 12px 36px", boxSizing: "border-box",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(139,92,246,0.25)",
                  borderRadius: 12, color: "white", fontSize: 14, outline: "none", fontFamily: "inherit",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(139,92,246,0.6)"}
                onBlur={e => e.target.style.borderColor = "rgba(139,92,246,0.25)"}
              />
            </div>
          </div>
 
          <div>
            <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6, fontWeight: 500 }}>
              Estado
            </label>
            <div style={{ position: "relative" }}>
              <MessageSquare size={15} color="rgba(139,92,246,0.7)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text" value={status}
                onChange={e => setStatus(e.target.value)}
                placeholder="Hola, uso NextTalk"
                maxLength={80}
                style={{
                  width: "100%", padding: "12px 14px 12px 36px", boxSizing: "border-box",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(139,92,246,0.25)",
                  borderRadius: 12, color: "white", fontSize: 14, outline: "none", fontFamily: "inherit",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(139,92,246,0.6)"}
                onBlur={e => e.target.style.borderColor = "rgba(139,92,246,0.25)"}
              />
            </div>
          </div>
 
          <div>
            <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6, fontWeight: 500 }}>
              Teléfono
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
              <Phone size={15} color="rgba(255,255,255,0.3)" />
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>{user?.phone}</span>
            </div>
          </div>
        </div>
 
        <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
          <GlowButton variant="secondary" className="flex-1" onClick={onClose}>
            Cancelar
          </GlowButton>
          <GlowButton variant="primary" className="flex-1" onClick={handleSave} loading={saving} disabled={!name.trim()}>
            {saved ? <><Check size={16} /> Guardado</> : "Guardar cambios"}
          </GlowButton>
        </div>
      </div>
    </div>
  );
};