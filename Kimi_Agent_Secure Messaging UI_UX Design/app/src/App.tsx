import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu, Sparkles, X, Plus } from "lucide-react";

// Contexts
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ChatProvider, useChat } from "@/contexts/ChatContext";

// Components
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { LoginView } from "@/components/client/LoginView";
import { RegistrationView } from "@/components/client/RegistrationView";

// Admin components (mantener si existen)
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { DashboardView } from "@/components/admin/DashboardView";
import { UsersManagementView } from "@/components/admin/UsersManagementView";
import { MessagesManagementView } from "@/components/admin/MessagesManagementView";
import { SecurityManagementView } from "@/components/admin/SecurityManagementView";
import { AdminSettingsView } from "@/components/admin/AdminSettingsView";

// Client components adicionales (mantener si existen)
import { ClientSidebar } from "@/components/client/ClientSidebar";
import { ChatList } from "@/components/client/ChatList";
import { ContactsView } from "@/components/client/ContactsView";
import { SettingsView } from "@/components/client/SettingsView";
import { SecurityView } from "@/components/client/SecurityView";
import { ProfileView } from "@/components/client/ProfileView";
import { AIAssistantView } from "@/components/client/AIAssistantView";

// View types
type ViewMode = "client" | "admin" | "register";
type ClientView =
  | "chats"
  | "contacts"
  | "calls"
  | "ai-assistant"
  | "security"
  | "profile"
  | "settings";
type AdminView =
  | "dashboard"
  | "users"
  | "groups"
  | "messages"
  | "security"
  | "settings";

// Componente principal de chat (post-login)
const ChatApp: React.FC = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const { logout } = useAuth();
  const { chats, selectedChat, selectChat } = useChat();

  return (
    <div className="h-screen w-full flex bg-secure-black overflow-hidden">
      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 w-80 transform transition-transform duration-300 ease-in-out
          md:relative md:transform-none
          ${
            showMobileSidebar
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        <Sidebar
          isMobile={true}
          onSelectChat={() => setShowMobileSidebar(false)}
        />
      </div>

      {/* Overlay móvil */}
      {showMobileSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Chat Window */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-secure-purple/20 bg-secure-gray-dark/50">
          <div className="flex items-center">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="p-2 hover:bg-white/10 rounded-lg mr-3"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
            <span className="font-semibold text-white">NextTalk</span>
          </div>
          {chats.length === 0 && (
            <span className="text-xs text-gray-400">Sin contactos</span>
          )}
        </div>

        <ChatWindow isMobile={true} onBack={() => setShowMobileSidebar(true)} />
      </div>
    </div>
  );
};

// Router de autenticación
const AppContent: React.FC = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const [view, setView] = useState<"login" | "register">("login");

  // Vista de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secure-black">
        <div className="w-8 h-8 border-2 border-secure-lilac border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // No autenticado: mostrar login o registro
  if (!isAuthenticated) {
    return view === "login" ? (
      <LoginView
        onLoginSuccess={() => {}}
        onGoToRegister={() => setView("register")}
      />
    ) : (
      <RegistrationView onComplete={() => setView("login")} />
    );
  }

  // Autenticado: mostrar app de chat
  return <ChatApp />;
};

// App principal con providers
const App: React.FC = () => (
  <AuthProvider>
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  </AuthProvider>
);

export default App;
