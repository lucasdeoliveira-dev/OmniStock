import { useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Navbar({ mobileOpen, onToggleMobile }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const iniciais = usuario?.nome
    ? usuario.nome
        .split(" ")
        .slice(0, 2)
        .map((parte) => parte[0])
        .join("")
        .toUpperCase()
    : "";

  return (
    <header className="h-16 bg-base-800/80 backdrop-blur border-b border-purple-900/40 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <button
        onClick={onToggleMobile}
        className="md:hidden p-2 text-purple-300 bg-purple-950/60 rounded-lg border border-purple-800/40"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <div className="hidden md:block" />

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-purple-200 leading-tight">{usuario?.nome}</p>
          <p className="text-[10px] text-purple-400 leading-tight">{usuario?.role}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow">
          {iniciais}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-rose-400 transition"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
