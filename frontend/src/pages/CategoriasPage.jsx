import { useEffect, useState } from "react";
import { FolderTree, Plus } from "lucide-react";
import { listarCategorias, criarCategoria } from "../services/categoriaService";
import Modal from "../components/common/Modal.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState({ nome: "", descricao: "" });

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      setCategorias(await listarCategorias());
    } catch {
      setErro("Não foi possível carregar as categorias.");
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
      await criarCategoria(novaCategoria);
      setShowModal(false);
      setNovaCategoria({ nome: "", descricao: "" });
      await carregar();
    } catch {
      setErro("Não foi possível salvar a categoria.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <FolderTree className="w-5 h-5 text-purple-400" /> Categorias
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-purple-900/40 transition"
        >
          <Plus className="w-4 h-4" /> Nova Categoria
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categorias.length === 0 && (
            <p className="text-sm text-gray-400">Nenhuma categoria cadastrada ainda.</p>
          )}
          {categorias.map((c) => (
            <div key={c.id} className="bg-base-700 border border-purple-900/40 p-5 rounded-xl shadow-lg">
              <h3 className="text-base font-bold text-white">{c.nome}</h3>
              <p className="text-xs text-gray-400 mt-1">{c.descricao || "Sem descrição"}</p>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal titulo="Nova Categoria" icon={FolderTree} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-400 mb-1">Nome</label>
              <input
                required
                type="text"
                value={novaCategoria.nome}
                onChange={(e) => setNovaCategoria({ ...novaCategoria, nome: e.target.value })}
                className="w-full bg-base-600 border border-purple-900 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Descrição</label>
              <textarea
                rows="2"
                value={novaCategoria.descricao}
                onChange={(e) => setNovaCategoria({ ...novaCategoria, descricao: e.target.value })}
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
