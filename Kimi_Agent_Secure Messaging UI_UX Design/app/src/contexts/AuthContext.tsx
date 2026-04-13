import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  status: "online" | "offline" | "away";
  publicKey: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (phone: string, code: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

interface RegisterData {
  phone: string;
  name: string;
  avatar?: string;
  deviceCode?: string;
  publicKey?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const OTP_SERVICE =
  import.meta.env.VITE_OTP_SERVICE_URL || "https://cr4j9v-5000.csb.app";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("nexttalk_token")
  );
  const [loading, setLoading] = useState(true);

  // Al montar, restaurar usuario desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem("nexttalk_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("nexttalk_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (phone: string, _code: string) => {
    // El OTP ya fue verificado antes de llegar aquí
    // Solo guardamos la sesión del usuario
    const newUser: User = {
      id: phone,
      name: localStorage.getItem(`nexttalk_name_${phone}`) || phone,
      phone,
      status: "online",
      publicKey: `key-${phone}`,
    };

    const newToken = `token-${phone}-${Date.now()}`;
    localStorage.setItem("nexttalk_token", newToken);
    localStorage.setItem("nexttalk_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const register = async (userData: RegisterData) => {
    // Registrar número en el OTP service
    await fetch(`${OTP_SERVICE}/api/otp/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: userData.phone, name: userData.name }),
    });

    const newUser: User = {
      id: userData.phone,
      name: userData.name,
      phone: userData.phone,
      avatar: userData.avatar,
      status: "online",
      publicKey: userData.publicKey || `key-${userData.phone}`,
    };

    const newToken = `token-${userData.phone}-${Date.now()}`;
    localStorage.setItem("nexttalk_token", newToken);
    localStorage.setItem("nexttalk_user", JSON.stringify(newUser));
    localStorage.setItem(`nexttalk_name_${userData.phone}`, userData.name);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("nexttalk_token");
    localStorage.removeItem("nexttalk_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
