import { useEffect, useState } from "react";
import { Truck, Plus } from "lucide-react";
import { listarFornecedores, criarFornecedor } from "../services/fornecedorService";
import Modal from "../components/common/Modal.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";

const VAZIO = { nome: "", cnpj: "", contato: "", email: "" };

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [novo, setNovo] = useState(VAZIO);

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      setFornecedores(await listarFornecedores());
    } catch {
      setErro("Não foi possível carregar os fornecedores.");
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
      await criarFornecedor(novo);
      setShowModal(false);
      setNovo(VAZIO);
      await carregar();
    } catch {
      setErro("Não foi possível salvar o fornecedor.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Truck className="w-5 h-5 text-purple-400" /> Fornecedores
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-purple-900/40 transition"
        >
          <Plus className="w-4 h-4" /> Novo Fornecedor
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fornecedores.length === 0 && (
            <p className="text-sm text-gray-400">Nenhum fornecedor cadastrado ainda.</p>
          )}
          {fornecedores.map((f) => (
            <div key={f.id} className="bg-base-700 border border-purple-900/40 p-5 rounded-xl shadow-lg">
              <span className="text-[11px] font-mono text-purple-300 bg-base-600 px-2 py-0.5 rounded border border-purple-800/40">
                {f.cnpj}
              </span>
              <h3 className="text-base font-bold text-white mt-2">{f.nome}</h3>
              <p className="text-xs text-gray-400 mt-1">{f.contato}</p>
              <p className="text-xs text-purple-300 mt-1">{f.email}</p>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal titulo="Novo Fornecedor" icon={Truck} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-400 mb-1">Razão Social / Nome</label>
              <input
                required
                type="text"
                value={novo.nome}
                onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
                className="w-full bg-base-600 border border-purple-900 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">CNPJ</label>
              <input
                required
                type="text"
                placeholder="00000000000000"
                value={novo.cnpj}
                onChange={(e) => setNovo({ ...novo, cnpj: e.target.value })}
                className="w-full bg-base-600 border border-purple-900 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Contato</label>
              <input
                type="text"
                value={novo.contato}
                onChange={(e) => setNovo({ ...novo, contato: e.target.value })}
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
