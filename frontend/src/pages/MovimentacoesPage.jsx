import { useEffect, useState } from "react";
import { ArrowLeftRight, Plus } from "lucide-react";
import { listarMovimentacoes, registrarMovimentacao } from "../services/movimentacaoService";
import { listarProdutos } from "../services/produtoService";
import Modal from "../components/common/Modal.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";

const VAZIO = { produtoId: "", tipo: "ENTRADA", quantidade: 1, motivo: "" };

export default function MovimentacoesPage() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [nova, setNova] = useState(VAZIO);

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      const [listaMov, listaProd] = await Promise.all([listarMovimentacoes(), listarProdutos()]);
      setMovimentacoes(listaMov);
      setProdutos(listaProd);
    } catch {
      setErro("Não foi possível carregar as movimentações.");
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
      await registrarMovimentacao({ ...nova, produtoId: Number(nova.produtoId), quantidade: Number(nova.quantidade) });
      setShowModal(false);
      setNova(VAZIO);
      await carregar();
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Não foi possível registrar a movimentação.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-purple-400" /> Movimentações
        </h1>
        <button
          onClick={() => setShowModal(true)}
          disabled={produtos.length === 0}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-purple-900/40 transition"
        >
          <Plus className="w-4 h-4" /> Lançar Movimentação
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
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3 text-center">Qtd</th>
                  <th className="px-4 py-3">Motivo</th>
                  <th className="px-4 py-3 text-right">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-950/50">
                {movimentacoes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                      Nenhuma movimentação registrada ainda.
                    </td>
                  </tr>
                )}
                {movimentacoes.map((m) => (
                  <tr key={m.id} className="hover:bg-purple-950/20 transition">
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.tipo === "ENTRADA"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : "bg-rose-950 text-rose-300 border border-rose-800"
                        }`}
                      >
                        {m.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{m.produtoNome}</td>
                    <td className="px-4 py-3 text-center font-bold text-gray-200">{m.quantidade}</td>
                    <td className="px-4 py-3 text-gray-400">{m.motivo}</td>
                    <td className="px-4 py-3 text-right text-gray-500 font-mono">
                      {new Date(m.data).toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <Modal titulo="Registrar Movimentação" icon={ArrowLeftRight} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-400 mb-1">Tipo</label>
              <select
                value={nova.tipo}
                onChange={(e) => setNova({ ...nova, tipo: e.target.value })}
                className="w-full bg-base-600 border border-purple-900 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="ENTRADA">Entrada</option>
                <option value="SAIDA">Saída</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Produto</label>
              <select
                required
                value={nova.produtoId}
                onChange={(e) => setNova({ ...nova, produtoId: e.target.value })}
                className="w-full bg-base-600 border border-purple-900 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="" disabled>
                  Selecione
                </option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} (atual: {p.quantidade})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Quantidade</label>
              <input
                required
                type="number"
                min="1"
                value={nova.quantidade}
                onChange={(e) => setNova({ ...nova, quantidade: e.target.value })}
                className="w-full bg-base-600 border border-purple-900 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Motivo</label>
              <input
                required
                type="text"
                placeholder="Ex: nota fiscal, ajuste de inventário..."
                value={nova.motivo}
                onChange={(e) => setNova({ ...nova, motivo: e.target.value })}
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
                {salvando ? "Salvando..." : "Lançar"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
