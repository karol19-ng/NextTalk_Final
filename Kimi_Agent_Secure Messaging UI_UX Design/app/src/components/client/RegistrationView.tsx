import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GlassCard } from "@/components/common/GlassCard";
import { GlowButton } from "@/components/common/GlowButton";
import {
  Smartphone,
  ChevronDown,
  Check,
  Shield,
  Lock,
  Key,
  User,
  Camera,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  MessageSquare,
  X,
  Phone,
} from "lucide-react";
import { countryCodes } from "@/data/mockData";

// URL del backend OTP
const OTP_SERVICE = "https://cr4j9v-5000.csb.app";

// Longitudes de teléfono por país
const phoneLengths: Record<string, number> = {
  "+1": 10,
  "+52": 10,
  "+54": 10,
  "+55": 11,
  "+57": 10,
  "+506": 8, // Costa Rica: 8 dígitos
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

// Placeholders por país
const phonePlaceholders: Record<string, string> = {
  "+1": "555 123 4567",
  "+506": "8888 0000", // Costa Rica
  "+52": "555 123 4567",
  "+54": "911 2345 6789",
  "+57": "312 345 6789",
  "+34": "612 345 678",
  "+44": "7911 123456",
};

interface RegistrationViewProps {
  onComplete?: () => void;
}

type Step = "phone" | "verify" | "profile" | "complete";

// Notificación de SMS (igual que en Login)
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
                }}
              >
                NextTalk
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: "rgba(255,255,255,0.4)",
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

        <div style={{ padding: "14px 16px 8px" }}>
          <p
            style={{
              margin: "0 0 4px",
              fontSize: 13,
              color: "rgba(255,255,255,0.75)",
            }}
          >
            👋 ¡Hola! Tu código de verificación es:
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

export const RegistrationView: React.FC<RegistrationViewProps> = ({
  onComplete,
}) => {
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>("phone");

  // Costa Rica por defecto (como en Login)
  const [selectedCountry, setSelectedCountry] = useState(
    countryCodes.find((c) => c.code === "+506") || countryCodes[0]
  );

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
  const [generatedCode, setGeneratedCode] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [deviceCode, setDeviceCode] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileStatus, setProfileStatus] = useState("disponible");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Calcular valores derivados
  const minLength = phoneLengths[selectedCountry.code] ?? 8;
  const placeholder = phonePlaceholders[selectedCountry.code] ?? "000 000 000";
  const fullPhone = `${selectedCountry.code}${phoneNumber}`;

  const steps = [
    { id: "phone", label: "Teléfono", icon: Smartphone },
    { id: "verify", label: "Verificación", icon: Shield },
    { id: "device", label: "Dispositivo", icon: Lock },
    { id: "profile", label: "Perfil", icon: User },
  ];

  // Enviar código OTP al backend
  const handlePhoneSubmit = async () => {
    setError("");

    if (phoneNumber.length < minLength) {
      setError(`El número debe tener ${minLength} dígitos`);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${OTP_SERVICE}/api/otp/send-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || "No se pudo enviar el código");
        return;
      }

      // Mostrar código en notificación
      setGeneratedCode(data.code);
      setShowNotification(true);
      setCurrentStep("verify");
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar código
  const handleVerifySubmit = async () => {
    setError("");
    const code = verificationCode.join("");

    if (code.length !== 6) {
      setError("Ingresa el código completo");
      return;
    }

    setIsLoading(true);

    try {
      // Después
      const res = await fetch(`${OTP_SERVICE}/api/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Código incorrecto");
        return;
      }

      setShowNotification(false);
      setCurrentStep("profile");
    } catch (err) {
      setError("Error al verificar el código");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeviceSubmit = () => {
    if (deviceCode.length >= 6) {
      setCurrentStep("profile");
    }
  };

  const handleProfileSubmit = async () => {
    if (!profileName.trim()) return;

    setIsLoading(true);

    try {
      // Generar clave pública mock (en producción sería real)
      const publicKey = `key-${Date.now()}`;

      await register({
        phone: fullPhone,
        name: profileName,
        deviceCode: deviceCode || "DEV-MODE",
        publicKey,
      });

      setCurrentStep("complete");
    } catch (err) {
      setError("Error al completar el registro");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      if (value && index < 5) {
        document.getElementById(`reg-code-${index + 1}`)?.focus();
      }
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
      document.getElementById("reg-code-5")?.focus();
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => {
        const isActive = steps.findIndex((s) => s.id === currentStep) >= index;
        const isCurrent = step.id === currentStep;

        return (
          <React.Fragment key={step.id}>
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                isCurrent
                  ? "bg-secure-lilac text-secure-black"
                  : isActive
                  ? "bg-secure-lilac/30 text-secure-lilac"
                  : "bg-white/5 text-gray-500"
              }`}
            >
              <step.icon className="w-5 h-5" />
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 ${
                  isActive ? "bg-secure-lilac/50" : "bg-white/10"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderPhoneStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secure-lilac/20 flex items-center justify-center">
          <Smartphone className="w-8 h-8 text-secure-lilac" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Ingresa tu número de teléfono
        </h3>
        <p className="text-sm text-gray-400">
          Te enviaremos un código de verificación por SMS
        </p>
      </div>

      <div className="space-y-4">
        {/* Country selector */}
        <div className="relative">
          <button
            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
            className="w-full flex items-center justify-between p-4 bg-secure-gray-medium border border-secure-purple/30 rounded-xl text-white hover:border-secure-lilac/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedCountry.flag}</span>
              <div className="text-left">
                <p className="font-medium">{selectedCountry.country}</p>
                <p className="text-sm text-gray-400">{selectedCountry.code}</p>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${
                showCountryDropdown && "rotate-180"
              }`}
            />
          </button>

          {showCountryDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-secure-gray-dark border border-secure-purple/30 rounded-xl z-10 scrollbar-custom">
              {countryCodes.map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    setSelectedCountry(country);
                    setShowCountryDropdown(false);
                    setPhoneNumber(""); // Limpiar al cambiar país
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                >
                  <span className="text-xl">{country.flag}</span>
                  <span className="text-white">{country.country}</span>
                  <span className="text-gray-400 ml-auto">{country.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Phone input - CORREGIDO */}
        <div className="flex gap-3">
          <div className="flex-shrink-0 px-4 py-4 bg-secure-gray-medium border border-secure-purple/30 rounded-xl text-white flex items-center gap-2">
            <Phone className="w-4 h-4 text-secure-lilac" />
            <span>{selectedCountry.code}</span>
          </div>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
            placeholder={placeholder}
            maxLength={minLength}
            className="flex-1 p-4 bg-secure-gray-medium border border-secure-purple/30 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-secure-lilac/50 transition-all"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 text-center">
            {error}
          </div>
        )}
      </div>

      <GlowButton
        variant="primary"
        className="w-full"
        onClick={handlePhoneSubmit}
        loading={isLoading}
        disabled={phoneNumber.length < minLength}
      >
        Enviar código
        <ArrowRight className="w-5 h-5" />
      </GlowButton>
    </div>
  );

  const renderVerifyStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secure-lilac/20 flex items-center justify-center">
          <Shield className="w-8 h-8 text-secure-lilac" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Verifica tu número
        </h3>
        <p className="text-sm text-gray-400">
          Ingresa el código de 6 dígitos enviado a<br />
          <span className="text-secure-lilac font-medium">{fullPhone}</span>
        </p>
      </div>

      {!showNotification && generatedCode && (
        <button
          onClick={() => setShowNotification(true)}
          className="w-full flex items-center justify-center gap-2 p-3 bg-secure-lilac/10 border border-secure-lilac/30 rounded-lg text-secure-lilac text-sm"
        >
          <MessageSquare className="w-4 h-4" />
          Ver notificación con mi código
        </button>
      )}

      <div className="flex justify-center gap-2">
        {verificationCode.map((digit, index) => (
          <input
            key={index}
            id={`reg-code-${index}`}
            type="text"
            inputMode="numeric"
            value={digit}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            onPaste={handleCodePaste}
            maxLength={1}
            className="w-12 h-14 text-center text-2xl font-bold bg-secure-gray-medium border border-secure-purple/30 rounded-xl text-white focus:outline-none focus:border-secure-lilac focus:ring-2 focus:ring-secure-lilac/30 transition-all"
          />
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 text-center">
          {error}
        </div>
      )}

      <div className="text-center">
        <button
          onClick={handlePhoneSubmit}
          disabled={isLoading}
          className="text-sm text-secure-lilac hover:underline"
        >
          ¿No recibiste el código? Reenviar
        </button>
      </div>

      <GlowButton
        variant="primary"
        className="w-full"
        onClick={handleVerifySubmit}
        loading={isLoading}
        disabled={verificationCode.join("").length !== 6}
      >
        Verificar
        <Check className="w-5 h-5" />
      </GlowButton>

      <div className="text-center">
        <button
          onClick={() => {
            setCurrentStep("phone");
            setVerificationCode(["", "", "", "", "", ""]);
            setError("");
            setShowNotification(false);
          }}
          className="text-sm text-gray-400 hover:text-white"
        >
          ← Cambiar número
        </button>
      </div>
    </div>
  );

  const renderProfileStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secure-lilac/20 flex items-center justify-center">
          <User className="w-8 h-8 text-secure-lilac" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Configura tu perfil
        </h3>
        <p className="text-sm text-gray-400">
          Personaliza tu información visible para otros usuarios
        </p>
      </div>

      {/* Avatar upload */}
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secure-lilac/30 to-secure-purple/50 flex items-center justify-center border-2 border-secure-lilac/30">
            <Camera className="w-8 h-8 text-secure-lilac" />
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-secure-lilac rounded-full flex items-center justify-center">
            <Camera className="w-4 h-4 text-secure-black" />
          </button>
        </div>
      </div>

      {/* Name input */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Nombre</label>
        <input
          type="text"
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
          placeholder="Tu nombre"
          className="w-full p-4 bg-secure-gray-medium border border-secure-purple/30 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-secure-lilac/50 transition-all"
        />
      </div>

      {/* Status selector */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Estado</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "disponible", label: "Disponible", color: "bg-green-500" },
            { value: "ocupado", label: "Ocupado", color: "bg-red-500" },
            { value: "ausente", label: "Ausente", color: "bg-yellow-500" },
          ].map((status) => (
            <button
              key={status.value}
              onClick={() => setProfileStatus(status.value)}
              className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                profileStatus === status.value
                  ? "bg-secure-lilac/20 border border-secure-lilac/50"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <span className={`w-3 h-3 rounded-full ${status.color}`} />
              <span className="text-sm text-white">{status.label}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 text-center">
          {error}
        </div>
      )}

      <GlowButton
        variant="primary"
        className="w-full"
        onClick={handleProfileSubmit}
        loading={isLoading}
        disabled={!profileName.trim()}
      >
        Completar registro
        <Check className="w-5 h-5" />
      </GlowButton>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
        <CheckCircle className="w-10 h-10 text-green-400" />
      </div>

      <div>
        <h3 className="text-2xl font-semibold text-white mb-2">
          ¡Registro completado!
        </h3>
        <p className="text-gray-400">
          Tu cuenta ha sido verificada exitosamente
        </p>
      </div>

      <GlassCard variant="purple" className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-secure-lilac/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-secure-lilac" />
          </div>
          <div className="text-left">
            <p className="font-medium text-white">Cifrado activado</p>
            <p className="text-sm text-gray-400">
              Tus mensajes están protegidos
            </p>
          </div>
        </div>
      </GlassCard>

      <GlowButton variant="primary" className="w-full" onClick={onComplete}>
        Comenzar a chatear
        <ArrowRight className="w-5 h-5" />
      </GlowButton>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-secure-black via-secure-purple/20 to-secure-black">
      <SMSNotification
        code={generatedCode}
        visible={showNotification}
        onClose={() => setShowNotification(false)}
      />

      <GlassCard className="w-full max-w-md p-8">
        {currentStep !== "complete" && renderStepIndicator()}

        {currentStep === "phone" && renderPhoneStep()}
        {currentStep === "verify" && renderVerifyStep()}
        {currentStep === "profile" && renderProfileStep()}
        {currentStep === "complete" && renderCompleteStep()}
      </GlassCard>
    </div>
  );
};

export default RegistrationView;
