import React, { useState, useEffect, createContext, useContext } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import {
  Bell, Shield, Lock, Smartphone, Database, Palette,
  ChevronRight, ChevronLeft, LogOut, Trash2, Key, Eye,
  MessageSquare, UserX, Globe, Volume2, Wifi, HardDrive,
  RefreshCw, Info, Heart, ExternalLink, CheckCircle,
  AlertCircle, Download, Fingerprint, Check,
} from "lucide-react";

interface SettingsViewProps {
  onClose: () => void;
}

type Section =
  | null | "privacy" | "notifications" | "security"
  | "storage" | "appearance" | "help";

// ── Hook: leer/escribir configuración en localStorage ─────────────────────────
function useSetting<T>(key: string, defaultValue: T): [T, (v: T) => void] {
  const storageKey = `nexttalk_setting_${key}`;
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });
  const set = (v: T) => {
    setValue(v);
    localStorage.setItem(storageKey, JSON.stringify(v));
  };
  return [value, set];
}

// ── Componentes UI ─────────────────────────────────────────────────────────────
const GroupLabel = ({ label }: { label: string }) => (
  <p style={{ color: "#7c3aed", fontSize: 11, fontWeight: 600, letterSpacing: 1, padding: "14px 16px 4px", margin: 0 }}>
    {label}
  </p>
);

const SectionHeader = ({ title, icon: Icon, onBack }: { title: string; icon: React.ElementType; onBack: () => void }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", borderBottom: "1px solid rgba(139,92,246,0.15)", flexShrink: 0 }}>
    <button onClick={onBack} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
      <ChevronLeft size={18} color="#9ca3af" />
    </button>
    <Icon size={20} color="#a78bfa" />
    <h2 style={{ color: "#fff", fontWeight: 600, fontSize: 16, margin: 0 }}>{title}</h2>
  </div>
);

const NavRow = ({ icon: Icon, label, description, danger, onClick, badge }: {
  icon: React.ElementType; label: string; description?: string;
  danger?: boolean; onClick?: () => void; badge?: string;
}) => (
  <div onClick={onClick} style={{ display: "flex", alignItems: "center", padding: "13px 16px", borderBottom: "1px solid rgba(139,92,246,0.07)", gap: 12, cursor: onClick ? "pointer" : "default" }}
    onMouseEnter={(e) => onClick && (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
  >
    <div style={{ width: 36, height: 36, borderRadius: 10, background: danger ? "rgba(239,68,68,0.1)" : "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={18} color={danger ? "#f87171" : "#a78bfa"} />
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ color: danger ? "#f87171" : "#fff", fontWeight: 500, fontSize: 14, margin: 0 }}>{label}</p>
      {description && <p style={{ color: "#6b7280", fontSize: 12, margin: "2px 0 0" }}>{description}</p>}
    </div>
    {badge && <span style={{ background: "rgba(139,92,246,0.2)", color: "#a78bfa", fontSize: 11, padding: "2px 8px", borderRadius: 10 }}>{badge}</span>}
    <ChevronRight size={16} color={danger ? "#f87171" : "#4b5563"} />
  </div>
);

const ToggleRow = ({ icon: Icon, label, description, value, onToggle }: {
  icon: React.ElementType; label: string; description?: string; value: boolean; onToggle: () => void;
}) => (
  <div style={{ display: "flex", alignItems: "center", padding: "13px 16px", borderBottom: "1px solid rgba(139,92,246,0.07)", gap: 12 }}>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={18} color="#a78bfa" />
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ color: "#fff", fontWeight: 500, fontSize: 14, margin: 0 }}>{label}</p>
      {description && <p style={{ color: "#6b7280", fontSize: 12, margin: "2px 0 0" }}>{description}</p>}
    </div>
    <Switch checked={value} onCheckedChange={onToggle} />
  </div>
);

const Chips = ({ value, options, onChange }: {
  value: string; options: { value: string; label: string }[]; onChange: (v: string) => void;
}) => (
  <div style={{ display: "flex", gap: 7, padding: "6px 16px 14px", flexWrap: "wrap" }}>
    {options.map((opt) => (
      <button key={opt.value} onClick={() => onChange(opt.value)} style={{
        padding: "6px 14px", borderRadius: 20, border: "1px solid",
        borderColor: value === opt.value ? "#a78bfa" : "rgba(139,92,246,0.2)",
        background: value === opt.value ? "rgba(167,139,250,0.15)" : "transparent",
        color: value === opt.value ? "#a78bfa" : "#9ca3af",
        fontSize: 13, cursor: "pointer", fontFamily: "inherit",
        display: "flex", alignItems: "center", gap: 5,
      }}>
        {value === opt.value && <Check size={11} />}
        {opt.label}
      </button>
    ))}
  </div>
);

const Toast = ({ msg, onDone }: { msg: string; onDone: () => void }) => {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: "rgba(139,92,246,0.9)", color: "#fff", padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 500, boxShadow: "0 4px 20px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: 8 }}>
      <CheckCircle size={15} /> {msg}
    </div>
  );
};

// ── Sección Privacidad ─────────────────────────────────────────────────────────
const PrivacySection = ({ onBack }: { onBack: () => void }) => {
  const [lastSeen, setLastSeen] = useSetting("privacy_lastSeen", "contacts");
  const [photo, setPhoto] = useSetting("privacy_photo", "contacts");
  const [about, setAbout] = useSetting("privacy_about", "contacts");
  const [status, setStatus] = useSetting("privacy_status", "everyone");
  const [readReceipts, setReadReceipts] = useSetting("privacy_readReceipts", true);
  const [onlineStatus, setOnlineStatus] = useSetting("privacy_onlineStatus", true);
  const [groups, setGroups] = useSetting("privacy_groups", "everyone");
  const [calls, setCalls] = useSetting("privacy_calls", "everyone");
  const [toast, setToast] = useState("");

  const vis = [{ value: "everyone", label: "Todos" }, { value: "contacts", label: "Contactos" }, { value: "nobody", label: "Nadie" }];

  const save = (label: string) => setToast(`${label} guardado`);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <SectionHeader title="Privacidad" icon={Lock} onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <GroupLabel label="VISIBILIDAD" />
        {[
          { label: "Última vez", value: lastSeen, set: (v: string) => { setLastSeen(v); save("Última vez"); } },
          { label: "Foto de perfil", value: photo, set: (v: string) => { setPhoto(v); save("Foto de perfil"); } },
          { label: "Descripción", value: about, set: (v: string) => { setAbout(v); save("Descripción"); } },
          { label: "Estado", value: status, set: (v: string) => { setStatus(v); save("Estado"); } },
        ].map(({ label, value, set }) => (
          <div key={label}>
            <div style={{ padding: "10px 16px 2px" }}><p style={{ color: "#e5e7eb", fontSize: 13, margin: 0 }}>{label}</p></div>
            <Chips value={value} options={vis} onChange={set} />
          </div>
        ))}
        <GroupLabel label="MENSAJES" />
        <ToggleRow icon={CheckCircle} label="Confirmaciones de lectura" description="Si las desactivas, no verás las de otros" value={readReceipts} onToggle={() => { setReadReceipts(!readReceipts); save("Confirmaciones de lectura"); }} />
        <ToggleRow icon={Globe} label="Mostrar en línea" description="Permitir que otros vean cuando estás activo" value={onlineStatus} onToggle={() => { setOnlineStatus(!onlineStatus); save("Estado en línea"); }} />
        <GroupLabel label="GRUPOS Y LLAMADAS" />
        <div style={{ padding: "8px 16px 2px" }}><p style={{ color: "#e5e7eb", fontSize: 13, margin: 0 }}>Quién puede añadirme a grupos</p></div>
        <Chips value={groups} options={vis} onChange={(v) => { setGroups(v); save("Grupos"); }} />
        <div style={{ padding: "2px 16px" }}><p style={{ color: "#e5e7eb", fontSize: 13, margin: 0 }}>Llamadas</p></div>
        <Chips value={calls} options={[{ value: "everyone", label: "Todos" }, { value: "contacts", label: "Contactos" }]} onChange={(v) => { setCalls(v); save("Llamadas"); }} />
        <GroupLabel label="OTROS" />
        <NavRow icon={UserX} label="Contactos bloqueados" description="Ver y gestionar contactos bloqueados" onClick={() => setToast("No tienes contactos bloqueados")} />
      </div>
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}
    </div>
  );
};

// ── Sección Notificaciones ─────────────────────────────────────────────────────
const NotificationsSection = ({ onBack }: { onBack: () => void }) => {
  const [messages, setMessages] = useSetting("notif_messages", true);
  const [msgTone, setMsgTone] = useSetting("notif_msgTone", true);
  const [preview, setPreview] = useSetting("notif_preview", true);
  const [calls, setCalls] = useSetting("notif_calls", true);
  const [groups, setGroups] = useSetting("notif_groups", true);
  const [groupTone, setGroupTone] = useSetting("notif_groupTone", false);
  const [statuses, setStatuses] = useSetting("notif_statuses", false);
  const [vibrate, setVibrate] = useSetting("notif_vibrate", true);
  const [popup, setPopup] = useSetting("notif_popup", true);
  const [toast, setToast] = useState("");

  const toggle = (setter: (v: boolean) => void, val: boolean, label: string) => {
    setter(!val);
    setToast(`${label}: ${!val ? "activado" : "desactivado"}`);
    // Efecto real: pedir permiso de notificaciones si se activan
    if (!val && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <SectionHeader title="Notificaciones" icon={Bell} onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Banner de permiso */}
        {"Notification" in window && Notification.permission === "denied" && (
          <div style={{ margin: "12px 16px", padding: "12px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10 }}>
            <p style={{ color: "#fca5a5", fontSize: 13, margin: 0 }}>⚠️ Las notificaciones están bloqueadas en el navegador. Habilítalas en la configuración del sitio.</p>
          </div>
        )}
        <GroupLabel label="MENSAJES" />
        <ToggleRow icon={MessageSquare} label="Notificaciones de mensajes" value={messages} onToggle={() => toggle(setMessages, messages, "Mensajes")} />
        <ToggleRow icon={Volume2} label="Tono de notificación" description="Sonido predeterminado" value={msgTone} onToggle={() => toggle(setMsgTone, msgTone, "Tono de mensajes")} />
        <ToggleRow icon={Eye} label="Vista previa del mensaje" description="Mostrar texto en la notificación" value={preview} onToggle={() => toggle(setPreview, preview, "Vista previa")} />
        <GroupLabel label="LLAMADAS" />
        <ToggleRow icon={Bell} label="Notificaciones de llamadas" value={calls} onToggle={() => toggle(setCalls, calls, "Llamadas")} />
        <GroupLabel label="GRUPOS" />
        <ToggleRow icon={Bell} label="Notificaciones de grupos" value={groups} onToggle={() => toggle(setGroups, groups, "Grupos")} />
        <ToggleRow icon={Volume2} label="Tono de grupos" value={groupTone} onToggle={() => toggle(setGroupTone, groupTone, "Tono de grupos")} />
        <GroupLabel label="ESTADOS" />
        <ToggleRow icon={Bell} label="Notificaciones de estados" value={statuses} onToggle={() => toggle(setStatuses, statuses, "Estados")} />
        <GroupLabel label="GENERAL" />
        <ToggleRow icon={Smartphone} label="Vibración" value={vibrate} onToggle={() => toggle(setVibrate, vibrate, "Vibración")} />
        <ToggleRow icon={AlertCircle} label="Notificación emergente" description="Mostrar sobre otras apps" value={popup} onToggle={() => toggle(setPopup, popup, "Emergente")} />
      </div>
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}
    </div>
  );
};

// ── Sección Seguridad ──────────────────────────────────────────────────────────
const SecuritySection = ({ onBack }: { onBack: () => void }) => {
  const [twoFactor, setTwoFactor] = useSetting("sec_twoFactor", true);
  const [screenLock, setScreenLock] = useSetting("sec_screenLock", false);
  const [biometric, setBiometric] = useSetting("sec_biometric", false);
  const [encryptBackup, setEncryptBackup] = useSetting("sec_encryptBackup", true);
  const [alerts, setAlerts] = useSetting("sec_alerts", true);
  const [toast, setToast] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinError, setPinError] = useState("");

  const handleScreenLock = () => {
    if (!screenLock) {
      setShowPinModal(true);
    } else {
      setScreenLock(false);
      localStorage.removeItem("nexttalk_setting_screenLockPin");
      setToast("Bloqueo de pantalla desactivado");
    }
  };

  const savePin = () => {
    if (pin.length < 4) { setPinError("El PIN debe tener al menos 4 dígitos"); return; }
    if (pin !== pinConfirm) { setPinError("Los PINs no coinciden"); return; }
    localStorage.setItem("nexttalk_setting_screenLockPin", pin);
    setScreenLock(true);
    setShowPinModal(false);
    setPin(""); setPinConfirm(""); setPinError("");
    setToast("Bloqueo de pantalla activado");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <SectionHeader title="Seguridad" icon={Shield} onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <GroupLabel label="AUTENTICACIÓN" />
        <ToggleRow icon={Shield} label="Verificación en dos pasos" description="Solicitar código OTP al iniciar sesión" value={twoFactor} onToggle={() => { setTwoFactor(!twoFactor); setToast(`2FA ${!twoFactor ? "activada" : "desactivada"}`); }} />
        <ToggleRow icon={Lock} label="Bloqueo de pantalla" description={screenLock ? "PIN configurado ✓" : "Bloquear app al minimizar"} value={screenLock} onToggle={handleScreenLock} />
        <ToggleRow icon={Fingerprint} label="Huella / Face ID" description={biometric ? "Biometría activa ✓" : "Desbloquear con biometría"} value={biometric} onToggle={() => { setBiometric(!biometric); setToast(`Biometría ${!biometric ? "activada" : "desactivada"}`); }} />
        <GroupLabel label="CIFRADO" />
        <NavRow icon={Key} label="Claves de cifrado" description="Verificar cifrado extremo a extremo" onClick={() => setToast("Cifrado E2E activo y verificado ✓")} />
        <ToggleRow icon={Database} label="Cifrar respaldo" value={encryptBackup} onToggle={() => { setEncryptBackup(!encryptBackup); setToast(`Cifrado de respaldo ${!encryptBackup ? "activado" : "desactivado"}`); }} />
        <GroupLabel label="DISPOSITIVOS" />
        <NavRow icon={Smartphone} label="Dispositivos vinculados" description="Este es tu único dispositivo activo" onClick={() => setToast("Solo hay un dispositivo activo")} badge="1" />
        <NavRow icon={RefreshCw} label="Cambiar número" description="Mantener historial y grupos" onClick={() => setToast("Función disponible próximamente")} />
        <GroupLabel label="ALERTAS" />
        <ToggleRow icon={Bell} label="Alertas de seguridad" description="Notificar cambios de seguridad" value={alerts} onToggle={() => { setAlerts(!alerts); setToast(`Alertas de seguridad ${!alerts ? "activadas" : "desactivadas"}`); }} />
      </div>

      {/* Modal PIN */}
      {showPinModal && (
        <div style={{ position: "absolute", inset: 0, zIndex: 10, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "rgba(15,8,30,0.98)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 16, padding: 24, width: "100%", maxWidth: 300 }}>
            <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 600, margin: "0 0 16px" }}>Configurar PIN</h3>
            <input type="password" inputMode="numeric" maxLength={8} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="PIN (mínimo 4 dígitos)" style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 10, color: "#fff", fontSize: 15, outline: "none", marginBottom: 10, boxSizing: "border-box", fontFamily: "inherit" }} />
            <input type="password" inputMode="numeric" maxLength={8} value={pinConfirm} onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ""))}
              placeholder="Confirmar PIN" style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 10, color: "#fff", fontSize: 15, outline: "none", marginBottom: pinError ? 6 : 16, boxSizing: "border-box", fontFamily: "inherit" }} />
            {pinError && <p style={{ color: "#f87171", fontSize: 12, margin: "0 0 12px" }}>{pinError}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setShowPinModal(false); setPin(""); setPinConfirm(""); setPinError(""); }}
                style={{ flex: 1, padding: "10px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
              <button onClick={savePin}
                style={{ flex: 1, padding: "10px", borderRadius: 10, background: "rgba(139,92,246,0.7)", border: "none", color: "#fff", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Guardar PIN</button>
            </div>
          </div>
        </div>
      )}
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}
    </div>
  );
};

// ── Sección Almacenamiento ─────────────────────────────────────────────────────
const StorageSection = ({ onBack }: { onBack: () => void }) => {
  const [wifiAuto, setWifiAuto] = useSetting("storage_wifi", true);
  const [mobileAuto, setMobileAuto] = useSetting("storage_mobile", false);
  const [roaming, setRoaming] = useSetting("storage_roaming", false);
  const [toast, setToast] = useState("");
  const [cacheSize, setCacheSize] = useState("2.4 GB");
  const [clearing, setClearing] = useState(false);

  const clearCache = () => {
    setClearing(true);
    setTimeout(() => {
      // Limpiar solo las claves de caché de la app (no settings)
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith("nexttalk_msg_cache") || k.startsWith("nexttalk_cache"))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      setCacheSize("0 MB");
      setClearing(false);
      setToast("Caché limpiada correctamente");
    }, 1400);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <SectionHeader title="Almacenamiento y datos" icon={Database} onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <GroupLabel label="USO" />
        <div style={{ margin: "4px 16px 12px", padding: 14, background: "rgba(139,92,246,0.06)", borderRadius: 12, border: "1px solid rgba(139,92,246,0.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: "#9ca3af", fontSize: 13 }}>Caché de la app</span>
            <span style={{ color: "#a78bfa", fontWeight: 600, fontSize: 13 }}>{cacheSize}</span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: cacheSize === "0 MB" ? "0%" : "48%", background: "linear-gradient(90deg,#a78bfa,#7c3aed)", borderRadius: 3, transition: "width 0.5s" }} />
          </div>
        </div>
        <NavRow icon={HardDrive} label="Gestionar almacenamiento" description="Ver archivos por conversación" onClick={() => setToast("Función disponible próximamente")} />
        <NavRow icon={Trash2} label="Limpiar caché" description={clearing ? "Limpiando..." : "Liberar espacio temporal"} onClick={clearCache} />
        <GroupLabel label="DESCARGA AUTOMÁTICA" />
        <ToggleRow icon={Wifi} label="Con Wi-Fi" description="Fotos, audio y video" value={wifiAuto} onToggle={() => { setWifiAuto(!wifiAuto); setToast(`Descarga con Wi-Fi ${!wifiAuto ? "activada" : "desactivada"}`); }} />
        <ToggleRow icon={Download} label="Con datos móviles" description="Solo fotos" value={mobileAuto} onToggle={() => { setMobileAuto(!mobileAuto); setToast(`Descarga móvil ${!mobileAuto ? "activada" : "desactivada"}`); }} />
        <ToggleRow icon={Globe} label="En itinerancia" value={roaming} onToggle={() => { setRoaming(!roaming); setToast(`Itinerancia ${!roaming ? "activada" : "desactivada"}`); }} />
      </div>
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}
    </div>
  );
};

// ── Sección Apariencia ─────────────────────────────────────────────────────────
const AppearanceSection = ({ onBack }: { onBack: () => void }) => {
  const [theme, setTheme] = useSetting("appearance_theme", "dark");
  const [lang, setLang] = useSetting("appearance_lang", "es");
  const [size, setSize] = useSetting("appearance_size", "medium");
  const [toast, setToast] = useState("");

  // Aplicar tamaño de fuente al documento
  useEffect(() => {
    const sizes: Record<string, string> = { small: "13px", medium: "15px", large: "17px" };
    document.documentElement.style.fontSize = sizes[size] || "15px";
  }, [size]);

  // Aplicar tema (la app ya es oscura; simulamos el claro con filtro)
  useEffect(() => {
    if (theme === "light") {
      document.documentElement.style.filter = "invert(1) hue-rotate(180deg)";
      document.documentElement.style.background = "#fff";
    } else if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.style.filter = prefersDark ? "" : "invert(1) hue-rotate(180deg)";
    } else {
      document.documentElement.style.filter = "";
    }
  }, [theme]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <SectionHeader title="Apariencia" icon={Palette} onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <GroupLabel label="TEMA" />
        <Chips value={theme} options={[{ value: "dark", label: "🌙 Oscuro" }, { value: "light", label: "☀️ Claro" }, { value: "system", label: "⚙️ Sistema" }]}
          onChange={(v) => { setTheme(v); setToast(`Tema: ${v === "dark" ? "Oscuro" : v === "light" ? "Claro" : "Sistema"}`); }} />
        <GroupLabel label="IDIOMA" />
        <Chips value={lang} options={[{ value: "es", label: "🇪🇸 Español" }, { value: "en", label: "🇺🇸 English" }, { value: "pt", label: "🇧🇷 Português" }]}
          onChange={(v) => { setLang(v); setToast("Idioma guardado (se aplicará al recargar)"); }} />
        <GroupLabel label="TAMAÑO DE TEXTO" />
        <Chips value={size} options={[{ value: "small", label: "Pequeño" }, { value: "medium", label: "Mediano" }, { value: "large", label: "Grande" }]}
          onChange={(v) => { setSize(v); setToast(`Texto ${v === "small" ? "pequeño" : v === "large" ? "grande" : "mediano"} aplicado`); }} />
        <div style={{ margin: "8px 16px 16px", padding: 14, background: "rgba(139,92,246,0.05)", borderRadius: 10, border: "1px solid rgba(139,92,246,0.1)" }}>
          <p style={{ color: "#9ca3af", fontSize: 12, margin: 0, lineHeight: 1.5 }}>
            Los cambios de tema y tamaño se aplican inmediatamente. El idioma se aplica al recargar la página.
          </p>
        </div>
      </div>
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}
    </div>
  );
};

// ── Sección Ayuda ──────────────────────────────────────────────────────────────
const HelpSection = ({ onBack }: { onBack: () => void }) => {
  const [toast, setToast] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  const sendFeedback = () => {
    if (!feedback.trim()) return;
    // Guardar feedback localmente
    const prev = JSON.parse(localStorage.getItem("nexttalk_feedback") || "[]");
    prev.push({ text: feedback, date: new Date().toISOString() });
    localStorage.setItem("nexttalk_feedback", JSON.stringify(prev));
    setFeedbackSent(true);
    setTimeout(() => { setShowFeedback(false); setFeedbackSent(false); setFeedback(""); }, 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <SectionHeader title="Ayuda" icon={Info} onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <GroupLabel label="SOPORTE" />
        <NavRow icon={MessageSquare} label="Contactar soporte" description="Enviar mensaje al equipo" onClick={() => setToast("Soporte disponible en soporte@securechat.app")} />
        <NavRow icon={ExternalLink} label="Centro de ayuda" description="Artículos y tutoriales" onClick={() => window.open("https://support.anthropic.com", "_blank")} />
        <NavRow icon={Heart} label="Enviar comentarios" description="Ayúdanos a mejorar" onClick={() => setShowFeedback(true)} />
        <GroupLabel label="ACERCA DE" />
        <div style={{ padding: "20px 16px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
            <Shield size={24} color="#a78bfa" />
          </div>
          <p style={{ color: "#fff", fontWeight: 600, fontSize: 15, margin: 0 }}>SecureChat</p>
          <p style={{ color: "#6b7280", fontSize: 12, marginTop: 4 }}>Versión 2.0.1 · Cifrado E2E</p>
          <p style={{ color: "#374151", fontSize: 11, marginTop: 8 }}>© 2025 SecureChat Inc.</p>
        </div>
      </div>

      {/* Modal feedback */}
      {showFeedback && (
        <div style={{ position: "absolute", inset: 0, zIndex: 10, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "rgba(15,8,30,0.98)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 16, padding: 24, width: "100%", maxWidth: 320 }}>
            {feedbackSent ? (
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <CheckCircle size={40} color="#4ade80" style={{ margin: "0 auto 12px" }} />
                <p style={{ color: "#fff", fontWeight: 600, fontSize: 15, margin: 0 }}>¡Gracias por tu feedback!</p>
              </div>
            ) : (
              <>
                <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 600, margin: "0 0 12px" }}>Enviar comentarios</h3>
                <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="¿Qué podemos mejorar?" rows={4}
                  style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none", resize: "none", marginBottom: 14, boxSizing: "border-box", fontFamily: "inherit" }} />
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setShowFeedback(false)} style={{ flex: 1, padding: "10px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
                  <button onClick={sendFeedback} style={{ flex: 1, padding: "10px", borderRadius: 10, background: "rgba(139,92,246,0.7)", border: "none", color: "#fff", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Enviar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {toast && <Toast msg={toast} onDone={() => setToast("")} />}
    </div>
  );
};

// ── Componente principal ───────────────────────────────────────────────────────
export const SettingsView: React.FC<SettingsViewProps> = ({ onClose }) => {
  const { user, logout } = useAuth();
  const [section, setSection] = useState<Section>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const initials = user?.name
    ? user.name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const statusLabel = user?.status === "online" ? "En línea" : user?.status === "away" ? "Ausente" : "Desconectado";

  const sections: { id: Section; icon: React.ElementType; label: string; desc: string }[] = [
    { id: "privacy", icon: Lock, label: "Privacidad", desc: "Última vez, foto, estados" },
    { id: "notifications", icon: Bell, label: "Notificaciones", desc: "Mensajes, tonos, grupos" },
    { id: "security", icon: Shield, label: "Seguridad", desc: "2FA, bloqueo, dispositivos" },
    { id: "storage", icon: Database, label: "Almacenamiento y datos", desc: "Caché, descarga automática" },
    { id: "appearance", icon: Palette, label: "Apariencia", desc: "Tema, idioma, texto" },
    { id: "help", icon: Info, label: "Ayuda", desc: "Soporte, versión" },
  ];

  const renderSection = () => {
    const back = () => setSection(null);
    switch (section) {
      case "privacy": return <PrivacySection onBack={back} />;
      case "notifications": return <NotificationsSection onBack={back} />;
      case "security": return <SecuritySection onBack={back} />;
      case "storage": return <StorageSection onBack={back} />;
      case "appearance": return <AppearanceSection onBack={back} />;
      case "help": return <HelpSection onBack={back} />;
      default: return null;
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex" }}>
      <style>{`
        @keyframes slideIn { from { transform:translateX(-100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-thumb { background:rgba(139,92,246,0.25); border-radius:3px; }
      `}</style>

      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} />

      <div style={{ position: "relative", zIndex: 1, width: 360, maxWidth: "100vw", height: "100%", background: "rgba(10,5,20,0.98)", borderRight: "1px solid rgba(139,92,246,0.18)", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "4px 0 40px rgba(0,0,0,0.6)", animation: "slideIn 0.22s ease-out" }}>
        {section ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
            {renderSection()}
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: "16px", borderBottom: "1px solid rgba(139,92,246,0.15)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <ChevronLeft size={18} color="#9ca3af" />
              </button>
              <h1 style={{ color: "#fff", fontWeight: 700, fontSize: 18, margin: 0 }}>Configuración</h1>
            </div>

            {/* Perfil */}
            <div style={{ padding: "16px", borderBottom: "1px solid rgba(139,92,246,0.1)", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: user?.avatar ? "transparent" : "linear-gradient(135deg,#a78bfa,#7c3aed)", border: "2px solid rgba(139,92,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff", flexShrink: 0, overflow: "hidden" }}>
                {user?.avatar ? <img src={user.avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: "#fff", fontWeight: 600, fontSize: 15, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name ?? "—"}</p>
                <p style={{ color: "#9ca3af", fontSize: 13, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.phone ?? "—"}</p>
                <p style={{ color: "#a78bfa", fontSize: 12, margin: "2px 0 0" }}>{statusLabel}</p>
              </div>
              <ChevronRight size={16} color="#4b5563" />
            </div>

            {/* Secciones */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {sections.map((sec) => (
                <div key={sec.id} onClick={() => setSection(sec.id)} style={{ display: "flex", alignItems: "center", padding: "13px 16px", borderBottom: "1px solid rgba(139,92,246,0.07)", gap: 14, cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.14)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <sec.icon size={20} color="#a78bfa" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#fff", fontWeight: 500, fontSize: 14, margin: 0 }}>{sec.label}</p>
                    <p style={{ color: "#6b7280", fontSize: 12, margin: "2px 0 0" }}>{sec.desc}</p>
                  </div>
                  <ChevronRight size={16} color="#4b5563" />
                </div>
              ))}

              {/* Cerrar sesión */}
              <div onClick={() => setShowLogoutConfirm(true)} style={{ display: "flex", alignItems: "center", padding: "13px 16px", gap: 14, cursor: "pointer", marginTop: 8 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <LogOut size={20} color="#f87171" />
                </div>
                <p style={{ color: "#f87171", fontWeight: 500, fontSize: 14, margin: 0 }}>Cerrar sesión</p>
              </div>

              <p style={{ textAlign: "center", color: "#374151", fontSize: 11, padding: "16px 0 28px" }}>SecureChat v2.0.1</p>
            </div>
          </>
        )}
      </div>

      {/* Confirm logout */}
      {showLogoutConfirm && (
        <div style={{ position: "absolute", inset: 0, zIndex: 20, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "rgba(15,8,30,0.98)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 16, padding: 24, width: "100%", maxWidth: 300, textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <LogOut size={22} color="#f87171" />
            </div>
            <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 600, margin: "0 0 8px" }}>¿Cerrar sesión?</h3>
            <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 20px", lineHeight: 1.5 }}>Tu sesión se cerrará en este dispositivo.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowLogoutConfirm(false)} style={{ flex: 1, padding: "11px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
              <button onClick={logout} style={{ flex: 1, padding: "11px", borderRadius: 10, background: "rgba(239,68,68,0.7)", border: "none", color: "#fff", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cerrar sesión</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;