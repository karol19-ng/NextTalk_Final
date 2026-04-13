import React, { useState } from "react";
import { useChat } from "@/contexts/ChatContext";
import { GlassCard } from "@/components/common/GlassCard";
import { GlowButton } from "@/components/common/GlowButton";
import { X, Search, UserCheck, AlertCircle } from "lucide-react";

const OTP_SERVICE =
  import.meta.env.VITE_OTP_SERVICE_URL || "https://cr4j9v-5000.csb.app";

const countryCodes = [
  { code: "+506", country: "Costa Rica", flag: "🇨🇷" },
  { code: "+1",   country: "Estados Unidos", flag: "🇺🇸" },
  { code: "+52",  country: "México", flag: "🇲🇽" },
  { code: "+54",  country: "Argentina", flag: "🇦🇷" },
  { code: "+57",  country: "Colombia", flag: "🇨🇴" },
  { code: "+34",  country: "España", flag: "🇪🇸" },
  { code: "+44",  country: "Reino Unido", flag: "🇬🇧" },
];

interface AddContactModalProps {
  onClose: () => void;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({ onClose }) => {
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"input" | "confirm" | "success">("input");
  const [foundUser, setFoundUser] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { addContact, startChatWithContact } = useChat();

  const fullPhone = `${selectedCountry.code}${phone}`;

  const handleSearch = async () => {
    if (phone.length < 7) return;
    setLoading(true);
    setError("");
    try {
      // Buscar si el número está registrado en NextTalk
      const res = await fetch(
        `${OTP_SERVICE}/api/otp/check/${encodeURIComponent(fullPhone)}`
      );
      const data = await res.json();

      if (!data.registered) {
        setError("Ese número no está registrado en NextTalk");
        return;
      }

      // Obtener datos del usuario
      const userRes = await fetch(
        `${OTP_SERVICE}/api/users/${encodeURIComponent(fullPhone)}`
      );

      if (userRes.ok) {
        const userData = await userRes.json();
        setFoundUser(userData.user);
      } else {
        // Si no tiene perfil aún, mostrar con datos básicos
        setFoundUser({ phone: fullPhone, name: data.name || fullPhone });
      }

      setStep("confirm");
    } catch {
      setError("Error buscando usuario. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!foundUser) return;
    setLoading(true);
    try {
      await addContact(fullPhone);
      setStep("success");
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      setError(err.message || "Error agregando contacto");
      setStep("input");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          width: "100%", maxWidth: 440,
          background: "rgba(15, 8, 30, 0.95)",
          border: "1px solid rgba(139,92,246,0.3)",
          borderRadius: 20, padding: "28px 28px",
          position: "relative",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Cerrar */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "rgba(255,255,255,0.08)", border: "none",
            borderRadius: "50%", width: 32, height: 32,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <X size={16} color="rgba(255,255,255,0.5)" />
        </button>

        <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 600, color: "white" }}>
          Agregar contacto
        </h3>

        {/* ── Paso 1: Buscar ── */}
        {step === "input" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
              Ingresa el número de la persona que quieres agregar
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <select
                value={selectedCountry.code}
                onChange={(e) => {
                  const c = countryCodes.find(x => x.code === e.target.value);
                  if (c) setSelectedCountry(c);
                }}
                style={{
                  padding: "12px 10px", background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(139,92,246,0.25)", borderRadius: 12,
                  color: "white", fontSize: 14, outline: "none", cursor: "pointer",
                }}
              >
                {countryCodes.map((c) => (
                  <option key={c.code} value={c.code} style={{ background: "#1a0a2e" }}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>

              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Número de teléfono"
                style={{
                  flex: 1, padding: "12px 16px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(139,92,246,0.25)", borderRadius: 12,
                  color: "white", fontSize: 14, outline: "none", fontFamily: "inherit",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(139,92,246,0.6)"}
                onBlur={e => e.target.style.borderColor = "rgba(139,92,246,0.25)"}
              />
            </div>

            {error && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 14px", background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10,
              }}>
                <AlertCircle size={15} color="#f87171" />
                <span style={{ fontSize: 13, color: "#f87171" }}>{error}</span>
              </div>
            )}

            <GlowButton
              variant="primary" className="w-full"
              onClick={handleSearch} loading={loading}
              disabled={phone.length < 7}
            >
              <Search size={16} />
              Buscar en NextTalk
            </GlowButton>
          </div>
        )}

        {/* ── Paso 2: Confirmar ── */}
        {step === "confirm" && foundUser && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%", margin: "0 auto 16px",
                background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
              }}>
                {foundUser.avatar
                  ? <img src={foundUser.avatar} alt={foundUser.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: 32 }}>👤</span>
                }
              </div>
              <h4 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 600, color: "white" }}>
                {foundUser.name || foundUser.phone}
              </h4>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                {foundUser.phone}
              </p>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                marginTop: 8, padding: "4px 12px",
                background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
                borderRadius: 20,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
                <span style={{ fontSize: 12, color: "#4ade80" }}>Registrado en NextTalk</span>
              </div>
            </div>

            {error && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 14px", background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10,
              }}>
                <AlertCircle size={15} color="#f87171" />
                <span style={{ fontSize: 13, color: "#f87171" }}>{error}</span>
              </div>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <GlowButton variant="secondary" className="flex-1" onClick={() => setStep("input")}>
                Cancelar
              </GlowButton>
              <GlowButton variant="primary" className="flex-1" onClick={handleAdd} loading={loading}>
                <UserCheck size={16} />
                Agregar
              </GlowButton>
            </div>
          </div>
        )}

        {/* ── Paso 3: Éxito ── */}
        {step === "success" && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%", margin: "0 auto 16px",
              background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <UserCheck size={28} color="#4ade80" />
            </div>
            <h4 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 600, color: "white" }}>
              ¡Contacto agregado!
            </h4>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              El chat ha sido creado
            </p>
          </div>
        )}
      </div>
    </div>
  );
};