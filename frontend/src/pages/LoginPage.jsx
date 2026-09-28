import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

function mensagemDeErro(err) {
  if (!err.response) {
    return "Não foi possível conectar à API. Verifique se o backend está rodando.";
  }
  if (err.response.status === 401) {
    return "E-mail ou senha inválidos.";
  }
  return err.response.data?.mensagem || "Erro inesperado ao tentar entrar.";
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      await login(email, senha);
      navigate("/");
    } catch (err) {
      console.error("Falha no login:", err);
      setErro(mensagemDeErro(err));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-950 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-base-700 border border-purple-900/40 shadow-2xl shadow-purple-950/40 rounded-2xl p-8 w-full max-w-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-600/40 border border-purple-400/30">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-purple-200 to-indigo-300">
              OmniStock
            </h1>
            <p className="text-xs text-gray-400">Entre com suas credenciais</p>
          </div>
        </div>

        {erro && (
          <div className="mb-4 text-xs text-rose-300 bg-rose-950/60 border border-rose-800/50 rounded-lg px-3 py-2">
            {erro}
          </div>
        )}

        <label className="block text-xs font-medium text-gray-400 mb-1">E-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 bg-base-600 border border-purple-900/50 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500"
          placeholder="voce@omnistock.com"
        />

        <label className="block text-xs font-medium text-gray-400 mb-1">Senha</label>
        <input
          type="password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full mb-6 bg-base-600 border border-purple-900/50 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500"
          placeholder="••••••••"
        />

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg shadow-lg shadow-purple-900/50 flex items-center justify-center gap-2 transition"
        >
          <Lock className="w-4 h-4" />
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
