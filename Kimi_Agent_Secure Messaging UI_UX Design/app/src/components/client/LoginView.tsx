import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GlowButton } from "@/components/common/GlowButton";
import {
  ChevronDown,
  Shield,
  ArrowRight,
  Lock,
  UserPlus,
  MessageSquare,
  X,
  Phone,
} from "lucide-react";
import { countryCodes } from "@/data/mockData";

const OTP_SERVICE =
  import.meta.env.VITE_OTP_SERVICE_URL || "https://cr4j9v-5000.csb.app";

const phoneLengths: Record<string, number> = {
  "+1": 10,
  "+52": 10,
  "+54": 10,
  "+55": 11,
  "+57": 10,
  "+506": 8,
  "+56": 9,
  "+58": 10,
  "+51": 9,
  "+591": 8,
  "+593": 9,
  "+595": 9,
  "+598": 8,
  "+34": 9,
  "+44": 10,
  "+49": 10,
  "+33": 9,
  "+39": 10,
  "+81": 10,
  "+86": 11,
  "+91": 10,
};

const phonePlaceholders: Record<string, string> = {
  "+1": "555 123 4567",
  "+506": "8888 0000",
  "+52": "555 123 4567",
  "+34": "612 345 678",
  "+44": "7911 123456",
};

interface LoginViewProps {
  onLoginSuccess: () => void;
  onGoToRegister: () => void;
}

const SMSNotification: React.FC<{
  code: string;
  visible: boolean;
  onClose: () => void;
}> = ({ code, visible, onClose }) => {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onClose, 15000);
    return () => clearTimeout(t);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        width: "100%",
        maxWidth: 380,
        animation: "slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateX(-50%) translateY(-24px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes shrink { from { width: 100%; } to { width: 0%; } }
      `}</style>
      <div
        style={{
          margin: "0 16px",
          background: "rgba(18, 10, 35, 0.98)",
          border: "1px solid rgba(139, 92, 246, 0.4)",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow:
            "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px 10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(139,92,246,0.4)",
              }}
            >
              <MessageSquare size={16} color="white" />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "white",
                  lineHeight: 1.2,
                }}
              >
                NextTalk
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: "rgba(255,255,255,0.4)",
                  lineHeight: 1.2,
                }}
              >
                ahora mismo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "none",
              borderRadius: "50%",
              width: 28,
              height: 28,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={13} color="rgba(255,255,255,0.5)" />
          </button>
        </div>

        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.06)",
            margin: "0 16px",
          }}
        />

        {/* Body */}
        <div style={{ padding: "14px 16px 8px" }}>
          <p
            style={{
              margin: "0 0 4px",
              fontSize: 13,
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.5,
            }}
          >
            👋 ¡Hola! Tienes una notificación de{" "}
            <strong style={{ color: "white" }}>NextTalk</strong>.
          </p>
          <p
            style={{
              margin: "0 0 12px",
              fontSize: 13,
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.5,
            }}
          >
            Tu código de verificación es el siguiente:
          </p>
          <div
            style={{
              background: "rgba(139, 92, 246, 0.12)",
              border: "1px solid rgba(139, 92, 246, 0.35)",
              borderRadius: 14,
              padding: "14px 0",
              display: "flex",
              justifyContent: "center",
              gap: 10,
            }}
          >
            {code.split("").map((d, i) => (
              <span
                key={i}
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: "white",
                  fontFamily: "monospace",
                  letterSpacing: 2,
                  textShadow: "0 0 20px rgba(139,92,246,0.8)",
                }}
              >
                {d}
              </span>
            ))}
          </div>
          <p
            style={{
              margin: "8px 0 0",
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
              textAlign: "center",
            }}
          >
            Válido 10 min · No compartas este código
          </p>
        </div>

        {/* Progress bar */}
        <div
          style={{
            margin: "10px 16px 14px",
            height: 3,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 999,
              width: "100%",
              background: "linear-gradient(90deg, #8b5cf6, #a78bfa)",
              animation: "shrink 15s linear forwards",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onGoToRegister,
}) => {
  const { login } = useAuth();
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  const minLength = phoneLengths[selectedCountry.code] ?? 8;
  const placeholder = phonePlaceholders[selectedCountry.code] ?? "000 000 000";
  const fullPhone = `${selectedCountry.code}${phoneNumber}`;

  const handleSendCode = async () => {
    setError("");
    if (phoneNumber.length < minLength) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${OTP_SERVICE}/api/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.error || "No se pudo enviar el código.");
        return;
      }
      setGeneratedCode(data.code);
      setShowNotification(true);
      setStep("verify");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    const code = verificationCode.join("");
    if (code.length !== 6) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${OTP_SERVICE}/api/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Código incorrecto.");
        return;
      }
      await login(fullPhone, code);
      setShowNotification(false);
      onLoginSuccess();
    } catch {
      setError("Error al verificar. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);
      if (value && index < 5)
        document.getElementById(`lc-${index + 1}`)?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      e.preventDefault();
      setVerificationCode(pasted.split(""));
      document.getElementById("lc-5")?.focus();
    }
  };

  const handleCountryChange = (country: (typeof countryCodes)[0]) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
    setPhoneNumber("");
    setError("");
  };

  const handleBack = () => {
    setStep("phone");
    setVerificationCode(["", "", "", "", "", ""]);
    setError("");
    setShowNotification(false);
    setGeneratedCode("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background:
          "linear-gradient(135deg, #080610 0%, #0f0520 40%, #150830 60%, #080610 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Orbes decorativos de fondo */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "10%",
          width: 300,
          height: 300,
          background:
            "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "10%",
          width: 250,
          height: 250,
          background:
            "radial-gradient(circle, rgba(109,40,217,0.1) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <SMSNotification
        code={generatedCode}
        visible={showNotification}
        onClose={() => setShowNotification(false)}
      />

      {/* Card principal */}
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "rgba(15, 8, 30, 0.85)",
          border: "1px solid rgba(139, 92, 246, 0.25)",
          borderRadius: 28,
          padding: "48px 40px",
          backdropFilter: "blur(24px)",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.1)",
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          {/* Logo */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              margin: "0 auto 20px",
              background:
                "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(109,40,217,0.3))",
              border: "1.5px solid rgba(139,92,246,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 40px rgba(139,92,246,0.2)",
            }}
          >
            <Lock size={32} color="#a78bfa" />
          </div>
          <h1
            style={{
              margin: "0 0 8px",
              fontSize: 28,
              fontWeight: 700,
              color: "white",
              letterSpacing: -0.5,
            }}
          >
            NextTalk
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: "rgba(255,255,255,0.45)",
              letterSpacing: 0.2,
            }}
          >
            Mensajería cifrada de extremo a extremo
          </p>
        </div>

        {/* ── Paso 1: Teléfono ── */}
        {step === "phone" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ textAlign: "center", marginBottom: 4 }}>
              <h2
                style={{
                  margin: "0 0 6px",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "white",
                }}
              >
                Iniciar sesión
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                Ingresa tu número registrado para continuar
              </p>
            </div>

            {/* Selector de país */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 18px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(139,92,246,0.25)",
                  borderRadius: 14,
                  color: "white",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 24 }}>{selectedCountry.flag}</span>
                  <div style={{ textAlign: "left" }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 500,
                        color: "white",
                      }}
                    >
                      {selectedCountry.country}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      {selectedCountry.code}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={18}
                  color="rgba(255,255,255,0.4)"
                  style={{
                    transform: showCountryDropdown ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                />
              </button>

              {showCountryDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    background: "rgba(12, 6, 25, 0.98)",
                    border: "1px solid rgba(139,92,246,0.3)",
                    borderRadius: 14,
                    maxHeight: 220,
                    overflowY: "auto",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
                  }}
                >
                  {countryCodes.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => handleCountryChange(country)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "11px 16px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(139,92,246,0.1)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "none")
                      }
                    >
                      <span style={{ fontSize: 20 }}>{country.flag}</span>
                      <span
                        style={{
                          flex: 1,
                          textAlign: "left",
                          fontSize: 14,
                          color: "white",
                        }}
                      >
                        {country.country}
                      </span>
                      <span
                        style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}
                      >
                        {country.code}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input teléfono */}
            <div style={{ display: "flex", gap: 12 }}>
              <div
                style={{
                  flexShrink: 0,
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(139,92,246,0.25)",
                  borderRadius: 14,
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 15,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  minWidth: 72,
                }}
              >
                <Phone size={14} color="rgba(139,92,246,0.8)" />
                {selectedCountry.code}
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(e.target.value.replace(/\D/g, ""))
                }
                placeholder={placeholder}
                style={{
                  flex: 1,
                  padding: "14px 18px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(139,92,246,0.25)",
                  borderRadius: 14,
                  color: "white",
                  fontSize: 15,
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "rgba(139,92,246,0.6)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(139,92,246,0.25)")
                }
              />
            </div>

            {error && (
              <div
                style={{
                  padding: "10px 16px",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 10,
                  fontSize: 13,
                  color: "#f87171",
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            <GlowButton
              variant="primary"
              className="w-full"
              onClick={handleSendCode}
              loading={isLoading}
              disabled={phoneNumber.length < minLength}
            >
              Enviar código
              <ArrowRight size={18} />
            </GlowButton>

            <div style={{ textAlign: "center", paddingTop: 4 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                ¿No tienes cuenta?{" "}
                <button
                  onClick={onGoToRegister}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#a78bfa",
                    fontSize: 13,
                    fontWeight: 500,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <UserPlus size={14} />
                  Registrarse
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ── Paso 2: Verificar código ── */}
        {step === "verify" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  margin: "0 auto 16px",
                  background: "rgba(139,92,246,0.15)",
                  border: "1px solid rgba(139,92,246,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Shield size={28} color="#a78bfa" />
              </div>
              <h2
                style={{
                  margin: "0 0 8px",
                  fontSize: 20,
                  fontWeight: 600,
                  color: "white",
                }}
              >
                Verificar número
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.4)",
                  lineHeight: 1.6,
                }}
              >
                Revisa la notificación de NextTalk arriba
                <br />
                <span
                  style={{ color: "rgba(167,139,250,0.9)", fontWeight: 500 }}
                >
                  {fullPhone}
                </span>
              </p>
            </div>

            {generatedCode && !showNotification && (
              <button
                onClick={() => setShowNotification(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "12px 16px",
                  background: "rgba(139,92,246,0.1)",
                  border: "1px solid rgba(139,92,246,0.3)",
                  borderRadius: 12,
                  color: "#a78bfa",
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <MessageSquare size={15} />
                Ver notificación con mi código
              </button>
            )}

            {/* Inputs del código */}
            <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  id={`lc-${index}`}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onPaste={handleCodePaste}
                  maxLength={1}
                  style={{
                    width: 52,
                    height: 60,
                    textAlign: "center",
                    fontSize: 24,
                    fontWeight: 700,
                    color: "white",
                    background: "rgba(255,255,255,0.06)",
                    border: digit
                      ? "1.5px solid rgba(139,92,246,0.7)"
                      : "1px solid rgba(139,92,246,0.25)",
                    borderRadius: 14,
                    outline: "none",
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                    boxShadow: digit ? "0 0 16px rgba(139,92,246,0.2)" : "none",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "rgba(139,92,246,0.8)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = digit
                      ? "rgba(139,92,246,0.7)"
                      : "rgba(139,92,246,0.25)")
                  }
                />
              ))}
            </div>

            {error && (
              <div
                style={{
                  padding: "10px 16px",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 10,
                  fontSize: 13,
                  color: "#f87171",
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            <div style={{ textAlign: "center" }}>
              <button
                onClick={handleSendCode}
                disabled={isLoading}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  color: "#a78bfa",
                  fontFamily: "inherit",
                }}
              >
                ¿No ves el código? Reenviar
              </button>
            </div>

            <GlowButton
              variant="primary"
              className="w-full"
              onClick={handleVerify}
              loading={isLoading}
              disabled={verificationCode.join("").length !== 6}
            >
              Iniciar sesión
              <ArrowRight size={18} />
            </GlowButton>

            <div style={{ textAlign: "center" }}>
              <button
                onClick={handleBack}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.35)",
                  fontFamily: "inherit",
                }}
              >
                ← Cambiar número
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginView;
