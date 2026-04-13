import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  ChevronLeft,
  Sparkles,
  Copy,
  Check,
  Trash2,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isError?: boolean;
}

interface AIChatbotViewProps {
  onClose: () => void;
}

const SUGGESTED_PROMPTS = [
  "¿Cómo funciona el cifrado extremo a extremo?",
  "Explícame qué es la verificación en dos pasos",
  "¿Cómo puedo proteger mi privacidad en mensajería?",
  "¿Qué datos guarda SecureChat de mí?",
];

// ── Base de conocimiento local ─────────────────────────────────────────────────
const KNOWLEDGE_BASE: { keywords: string[]; response: string }[] = [
  {
    keywords: ["cifrado", "extremo a extremo", "e2e", "encriptación", "encriptado", "encrypt"],
    response:
      "🔒 **Cifrado extremo a extremo (E2E)**\n\nEl cifrado E2E garantiza que tus mensajes solo puedan leerlos tú y la persona con quien chateas. Funciona así:\n\n1. Tu dispositivo genera un par de claves: una **pública** (se comparte) y una **privada** (nunca sale de tu dispositivo).\n2. Cuando mandas un mensaje, se cifra con la clave pública del destinatario.\n3. Solo la clave privada de esa persona puede descifrarlo.\n\nNi siquiera SecureChat puede leer tus mensajes. 🛡️",
  },
  {
    keywords: ["dos pasos", "2fa", "doble factor", "verificación", "autenticación", "otp", "código"],
    response:
      "🔐 **Verificación en dos pasos (2FA)**\n\nEs una capa extra de seguridad que protege tu cuenta aunque alguien robe tu contraseña.\n\nCómo funciona:\n1. Ingresas tu número o usuario normalmente.\n2. Se envía un **código de un solo uso (OTP)** a tu teléfono.\n3. Solo con ese código puedes entrar.\n\n✅ **Consejo:** Nunca compartas tu código OTP con nadie, ni aunque digan ser del soporte técnico.",
  },
  {
    keywords: ["privacidad", "privado", "proteger", "datos personales", "información personal"],
    response:
      "🛡️ **Cómo proteger tu privacidad en mensajería**\n\n• Usa siempre apps con cifrado E2E como SecureChat.\n• No compartas tu número con desconocidos.\n• Revisa los permisos que le das a la app (cámara, micrófono, ubicación).\n• Activa la verificación en dos pasos.\n• Configura mensajes que se autodestruyan para conversaciones sensibles.\n• Usa una foto de perfil que no revele información personal.",
  },
  {
    keywords: ["datos", "guarda", "almacena", "recopila", "securechat", "nexttalk"],
    response:
      "📋 **¿Qué datos guarda SecureChat?**\n\nSecureChat está diseñado con privacidad desde el núcleo:\n\n✅ **Lo que SÍ guardamos:**\n• Tu número de teléfono (para identificarte)\n• Tu nombre y foto de perfil (opcionales)\n• Metadatos mínimos para el funcionamiento (hora de conexión)\n\n❌ **Lo que NO guardamos:**\n• El contenido de tus mensajes (están cifrados E2E)\n• Tu ubicación\n• Tus contactos sin tu permiso",
  },
  {
    keywords: ["contraseña", "password", "segura", "clave", "pin"],
    response:
      "🔑 **Contraseñas seguras**\n\nConsejos para crear contraseñas fuertes:\n\n• Usa al menos **12 caracteres**.\n• Combina letras, números y símbolos (!@#$).\n• No uses fechas de cumpleaños ni nombres.\n• Usa una contraseña **diferente** para cada servicio.\n• Considera un gestor de contraseñas como Bitwarden o 1Password.\n\n⚠️ Nunca compartas tu contraseña por mensajes, ni con soporte técnico.",
  },
  {
    keywords: ["spam", "estafa", "phishing", "fraude", "engaño", "scam", "robar"],
    response:
      "⚠️ **Cómo evitar estafas y phishing**\n\nSeñales de alerta:\n• Te piden dinero urgente o datos bancarios.\n• Recibes enlaces sospechosos de desconocidos.\n• Alguien dice ser de soporte y te pide tu código OTP.\n• Ofertas demasiado buenas para ser verdad.\n\n✅ **Qué hacer:**\n• Nunca hagas clic en enlaces de extraños.\n• Bloquea y reporta al contacto desde el menú ⋮.\n• SecureChat nunca te pedirá tu contraseña por chat.",
  },
  {
    keywords: ["bloquear", "bloqueo", "reportar", "reporte", "denunciar"],
    response:
      "🚫 **Bloquear y reportar contactos**\n\nSi alguien te molesta o actúa de forma sospechosa:\n\n1. Abre el chat con esa persona.\n2. Toca el ícono **⋮** (tres puntos) junto al chat.\n3. Selecciona **Bloquear** para que no puedan contactarte.\n4. O selecciona **Reportar** si hay comportamiento abusivo.\n\nLos reportes son anónimos y ayudan a mantener la comunidad segura. 🛡️",
  },
  {
    keywords: ["grupo", "grupos", "crear grupo", "participantes", "miembros"],
    response:
      "👥 **Grupos en SecureChat**\n\nPuedes crear grupos para chatear con varias personas a la vez:\n\n1. En la barra lateral, toca el ícono de **grupo** (personas).\n2. Pon nombre al grupo.\n3. Selecciona los contactos que quieres agregar.\n4. ¡Listo! El grupo aparece en tu lista de chats.\n\n🔒 Los mensajes grupales también están cifrados. Solo los participantes pueden leerlos.",
  },
  {
    keywords: ["archivar", "fijar", "pin", "organizar", "ordenar", "chats"],
    response:
      "📌 **Organizar tus chats**\n\n**Fijar un chat:** Toca ⋮ junto al chat → *Fijar chat*. Los chats fijados aparecen siempre primero con un 📌.\n\n**Archivar un chat:** Toca ⋮ → *Archivar*. El chat se mueve a la pestaña \"Archivados\" para mantener tu lista limpia.\n\n**Ordenamiento automático:** Los chats se ordenan por el mensaje más reciente. Al llegar un mensaje nuevo, ese chat sube automáticamente al top.",
  },
  {
    keywords: ["perfil", "foto", "avatar", "nombre", "actualizar", "editar", "cambiar"],
    response:
      "👤 **Editar tu perfil**\n\nPuedes actualizar tu información fácilmente:\n\n1. Toca tu **foto de perfil** en la parte superior de la barra lateral.\n2. Cambia tu nombre, foto o estado.\n3. Guarda los cambios.\n\n💡 **Consejo de privacidad:** Usa un apodo o nombre parcial en lugar de tu nombre completo para mayor privacidad.",
  },
  {
    keywords: ["estado", "story", "historia", "stories", "ver estado"],
    response:
      "👁️ **Estados (Stories)**\n\nLos estados son publicaciones temporales visibles para tus contactos:\n\n• Toca el ícono de **ojo** en la barra lateral para ver estados.\n• Puedes publicar texto, imágenes o videos.\n• Los estados duran **24 horas** y luego desaparecen automáticamente.\n\n🔒 Solo tus contactos pueden ver tus estados.",
  },
  {
    keywords: ["mensaje", "eliminar", "borrar", "editar", "modificar"],
    response:
      "✏️ **Gestionar tus mensajes**\n\n**Eliminar un mensaje:** Mantén presionado el mensaje → *Eliminar*. Se reemplaza por \"Mensaje eliminado\" para todos.\n\n**Editar un mensaje:** Mantén presionado → *Editar*. Los demás verán que el mensaje fue editado.\n\n⚠️ Los mensajes eliminados o editados quedan registrados como tal — no desaparecen completamente del historial.",
  },
  {
    keywords: ["hola", "hi", "hello", "buenos", "buenas", "saludos", "hey"],
    response:
      "👋 ¡Hola! Soy el asistente de privacidad y seguridad de SecureChat.\n\nPuedo ayudarte con:\n• 🔒 Preguntas sobre cifrado y seguridad\n• 🛡️ Consejos de privacidad\n• ⚙️ Cómo usar funciones de la app\n• ⚠️ Cómo protegerte de estafas\n\n¿En qué te puedo ayudar hoy?",
  },
  {
    keywords: ["gracias", "thank", "perfecto", "genial", "excelente", "bien", "ok"],
    response:
      "😊 ¡De nada! Si tienes más dudas sobre privacidad o seguridad, aquí estaré. ¡Que tus chats siempre estén seguros! 🔒",
  },
  {
    keywords: ["wifi", "red", "publica", "conexión", "internet", "vpn"],
    response:
      "📡 **Seguridad en redes WiFi públicas**\n\n⚠️ **Riesgos:** Alguien en la misma red puede interceptar tu tráfico.\n\n✅ **Cómo protegerte:**\n• Usa una **VPN** (ProtonVPN o Mullvad son buenas opciones).\n• Asegúrate de que los sitios usen **HTTPS**.\n• Evita hacer transacciones bancarias en WiFi públicas.\n• SecureChat cifra tus mensajes aunque estés en WiFi pública. 🛡️",
  },
  {
    keywords: ["backup", "respaldo", "copia", "recuperar", "restaurar"],
    response:
      "💾 **Respaldos y recuperación**\n\nSecureChat prioriza la privacidad sobre la comodidad de los backups:\n\n• Los mensajes **no se respaldan en la nube** por defecto (así nadie puede acceder a ellos).\n• Si cambias de dispositivo, los mensajes anteriores no se transfieren.\n• Tu cuenta se recupera verificando tu número de teléfono con un nuevo OTP.\n\n✅ Esto es intencional: sin backup en la nube = sin riesgo de fuga de datos.",
  },
];

const DEFAULT_RESPONSES = [
  "🤔 No tengo información específica sobre eso, pero puedo ayudarte con temas de **seguridad, privacidad, cifrado** o cómo usar las funciones de SecureChat. ¿Tienes alguna duda sobre esos temas?",
  "💭 Esa pregunta está un poco fuera de mi especialidad. Soy experto en privacidad digital y seguridad en mensajería. ¿Te puedo ayudar con algo relacionado?",
  "🛡️ Mi área es la seguridad y privacidad. Si tienes dudas sobre cifrado, contraseñas, estafas o funciones de la app, ¡con gusto te ayudo!",
];

const simulateTypingDelay = (text: string): Promise<void> => {
  const ms = Math.min(500 + text.length * 7, 2000);
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const getLocalResponse = (input: string): string => {
  const n = normalize(input);
  const scores = KNOWLEDGE_BASE.map((entry) => ({
    response: entry.response,
    hits: entry.keywords.filter((kw) => n.includes(normalize(kw))).length,
  }));
  const best = scores.reduce((a, b) => (b.hits > a.hits ? b : a));
  if (best.hits > 0) return best.response;
  return DEFAULT_RESPONSES[Math.floor(Math.random() * DEFAULT_RESPONSES.length)];
};

// Renderiza **negrita** y saltos de línea
const RichText: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <React.Fragment key={i}>
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
            )}
            {i < lines.length - 1 && <br />}
          </React.Fragment>
        );
      })}
    </>
  );
};

// ── Componente principal ───────────────────────────────────────────────────────
export const AIChatbotView: React.FC<AIChatbotViewProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);

    const responseText = getLocalResponse(content);
    await simulateTypingDelay(responseText);

    setMessages((p) => [
      ...p,
      {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      },
    ]);
    setLoading(false);
    inputRef.current?.focus();
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex" }}>
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      />
      <div
        style={{
          position: "relative", zIndex: 1, width: 380, maxWidth: "100vw",
          height: "100%", background: "rgba(10, 5, 20, 0.98)",
          borderRight: "1px solid rgba(139,92,246,0.2)", display: "flex",
          flexDirection: "column", boxShadow: "4px 0 40px rgba(0,0,0,0.6)",
          animation: "slideIn 0.25s ease-out",
        }}
      >
        <style>{`
          @keyframes slideIn { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes pulse { 0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }
          .ai-msg { animation: fadeUp 0.2s ease-out; }
          .dot-typing span { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #a78bfa; margin: 0 2px; animation: pulse 1.4s infinite; }
          .dot-typing span:nth-child(2) { animation-delay: 0.2s; }
          .dot-typing span:nth-child(3) { animation-delay: 0.4s; }
          .chatbot-input:focus { outline: none; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 4px; }
        `}</style>

        {/* Header */}
        <div style={{ padding: "16px", borderBottom: "1px solid rgba(139,92,246,0.15)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ChevronLeft size={18} color="#9ca3af" />
          </button>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, rgba(139,92,246,0.4), rgba(124,58,237,0.3))", border: "1px solid rgba(139,92,246,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={18} color="#a78bfa" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: "#fff", fontWeight: 600, fontSize: 15, margin: 0 }}>Asistente IA</p>
            <p style={{ color: loading ? "#a78bfa" : "#6b7280", fontSize: 12, margin: "2px 0 0" }}>
              {loading ? "Escribiendo..." : "Privacidad y seguridad"}
            </p>
          </div>
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} title="Limpiar chat" style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Trash2 size={15} color="#6b7280" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
          {messages.length === 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, paddingBottom: 40 }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot size={32} color="#a78bfa" />
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ color: "#fff", fontWeight: 600, fontSize: 16, margin: 0 }}>Asistente de Privacidad</p>
                <p style={{ color: "#6b7280", fontSize: 13, marginTop: 6, maxWidth: 260, lineHeight: 1.5 }}>
                  Pregúntame sobre seguridad, privacidad o cómo proteger tus datos
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 300 }}>
                {SUGGESTED_PROMPTS.map((p) => (
                  <button key={p} onClick={() => sendMessage(p)}
                    style={{ padding: "10px 14px", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.18)", borderRadius: 12, color: "#c4b5fd", fontSize: 13, cursor: "pointer", textAlign: "left", lineHeight: 1.4, transition: "all 0.15s", fontFamily: "inherit" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.15)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.35)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.08)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.18)"; }}
                  >{p}</button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="ai-msg"
                style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}
              >
                {msg.role === "assistant" && (
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: 2 }}>
                    <Sparkles size={13} color="#a78bfa" />
                  </div>
                )}
                <div style={{ maxWidth: "78%", position: "relative" }}>
                  <div style={{
                    padding: "10px 13px",
                    borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: msg.role === "user" ? "linear-gradient(135deg, rgba(139,92,246,0.35), rgba(109,40,217,0.25))" : "rgba(255,255,255,0.06)",
                    border: msg.role === "user" ? "1px solid rgba(139,92,246,0.3)" : "1px solid rgba(255,255,255,0.08)",
                  }}>
                    <p style={{ color: "#f3f4f6", fontSize: 14, margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      <RichText text={msg.content} />
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                    <span style={{ color: "#4b5563", fontSize: 11 }}>{formatTime(msg.timestamp)}</span>
                    {msg.role === "assistant" && (
                      <button onClick={() => copyMessage(msg.id, msg.content)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", alignItems: "center" }} title="Copiar">
                        {copiedId === msg.id ? <Check size={11} color="#a78bfa" /> : <Copy size={11} color="#4b5563" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="ai-msg" style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Sparkles size={13} color="#a78bfa" />
              </div>
              <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px 16px 16px 4px" }}>
                <div className="dot-typing"><span /><span /><span /></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "12px", borderTop: "1px solid rgba(139,92,246,0.12)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 16, padding: "8px 8px 8px 14px" }}>
            <textarea ref={inputRef} className="chatbot-input" value={input}
              onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta..." rows={1} disabled={loading}
              style={{ flex: 1, background: "transparent", border: "none", color: "#f3f4f6", fontSize: 14, lineHeight: 1.5, resize: "none", maxHeight: 120, overflow: "auto", fontFamily: "inherit" }}
              onInput={(e) => { const t = e.currentTarget; t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 120) + "px"; }}
            />
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
              style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: input.trim() && !loading ? "linear-gradient(135deg, #a78bfa, #7c3aed)" : "rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() && !loading ? "pointer" : "not-allowed", transition: "all 0.2s", flexShrink: 0 }}>
              <Send size={16} color={input.trim() && !loading ? "#fff" : "#6b7280"} />
            </button>
          </div>
          <p style={{ color: "#374151", fontSize: 11, textAlign: "center", marginTop: 6 }}>
            Asistente local · Sin conexión a internet requerida
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIChatbotView;