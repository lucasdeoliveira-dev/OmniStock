import { createContext, useContext, useState } from "react";
import { login as loginRequest } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const armazenado = localStorage.getItem("usuario");
    return armazenado ? JSON.parse(armazenado) : null;
  });

  async function login(email, senha) {
    const data = await loginRequest(email, senha);
    const usuarioLogado = { nome: data.nome, email: data.email, role: data.role };

    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(usuarioLogado));
    setUsuario(usuarioLogado);

    return usuarioLogado;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, autenticado: !!usuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
