import { useEffect, useState } from "react";
import { Users, Plus } from "lucide-react";
import { listarClientes, criarCliente } from "../services/clienteService";
import Modal from "../components/common/Modal.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";

const VAZIO = { nome: "", documento: "", email: "", telefone: "" };

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [novo, setNovo] = useState(VAZIO);

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      setClientes(await listarClientes());
    } catch {
      setErro("Não foi possível carregar os clientes.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSalvando(true);
    try {
      await criarCliente(novo);
      setShowModal(false);
      setNovo(VAZIO);
      await carregar();
    } catch {
      setErro("Não foi possível salvar o cliente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" /> Clientes
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-purple-900/40 transition"
        >
          <Plus className="w-4 h-4" /> Novo Cliente
        </button>
      </div>

      {erro && (
        <div className="text-xs text-rose-300 bg-rose-950/60 border border-rose-800/50 rounded-lg px-3 py-2">
          {erro}
        </div>
      )}

      {carregando ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-base-700 border border-purple-900/40 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-base-600 text-purple-300 font-semibold border-b border-purple-900/40 uppercase">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Documento</th>
                  <th className="px-4 py-3">E-mail</th>
                  <th className="px-4 py-3">Telefone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-950/50">
                {clientes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                      Nenhum cliente cadastrado ainda.
                    </td>
                  </tr>
                )}
                {clientes.map((c) => (
                  <tr key={c.id} className="hover:bg-purple-950/20 transition">
                    <td className="px-4 py-3 font-medium text-white">{c.nome}</td>
                    <td className="px-4 py-3 font-mono text-purple-300">{c.documento}</td>
                    <td className="px-4 py-3 text-gray-400">{c.email}</td>
                    <td className="px-4 py-3 text-gray-400">{c.telefone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <Modal titulo="Novo Cliente" icon={Users} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-400 mb-1">Nome</label>
              <input
                required
                type="text"
                value={novo.nome}
                onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
                className="w-full bg-base-600 border border-purple-900 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">CPF / CNPJ</label>
              <input
                required
                type="text"
                value={novo.documento}
                onChange={(e) => setNovo({ ...novo, documento: e.target.value })}
                className="w-full bg-base-600 border border-purple-900 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">E-mail</label>
              <input
                type="email"
                value={novo.email}
                onChange={(e) => setNovo({ ...novo, email: e.target.value })}
                className="w-full bg-base-600 border border-purple-900 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Telefone</label>
              <input
                type="text"
                value={novo.telefone}
                onChange={(e) => setNovo({ ...novo, telefone: e.target.value })}
                className="w-full bg-base-600 border border-purple-900 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white rounded font-semibold shadow-lg shadow-purple-900/50"
              >
                {salvando ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
