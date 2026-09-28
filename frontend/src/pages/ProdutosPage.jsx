import { useEffect, useState } from "react";
import { Package, Plus } from "lucide-react";
import { listarProdutos, criarProduto } from "../services/produtoService";
import { listarCategorias } from "../services/categoriaService";
import Modal from "../components/common/Modal.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";

const PRODUTO_VAZIO = {
  nome: "",
  sku: "",
  categoriaId: "",
  quantidade: 0,
  precoCusto: 0,
  precoVenda: 0,
  estoqueMinimo: 0,
};

function formatBRL(valor) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [novoProduto, setNovoProduto] = useState(PRODUTO_VAZIO);

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      const [listaProdutos, listaCategorias] = await Promise.all([listarProdutos(), listarCategorias()]);
      setProdutos(listaProdutos);
      setCategorias(listaCategorias);
    } catch {
      setErro("Não foi possível carregar os produtos.");
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
      await criarProduto({
        ...novoProduto,
        categoriaId: Number(novoProduto.categoriaId),
        quantidade: Number(novoProduto.quantidade),
        precoCusto: Number(novoProduto.precoCusto),
        precoVenda: Number(novoProduto.precoVenda),
        estoqueMinimo: Number(novoProduto.estoqueMinimo),
      });
      setShowModal(false);
      setNovoProduto(PRODUTO_VAZIO);
      await carregar();
    } catch {
      setErro("Não foi possível salvar o produto. Verifique os campos e a categoria selecionada.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-purple-400" /> Produtos
        </h1>
        <button
          onClick={() => setShowModal(true)}
          disabled={categorias.length === 0}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-purple-900/40 transition"
          title={categorias.length === 0 ? "Cadastre uma categoria primeiro" : ""}
        >
          <Plus className="w-4 h-4" /> Novo Produto
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
                  <th className="px-4 py-3">SKU / Nome</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3 text-center">Qtd</th>
                  <th className="px-4 py-3">Preço Custo</th>
                  <th className="px-4 py-3">Preço Venda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-950/50">
                {produtos.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                      Nenhum produto cadastrado ainda.
                    </td>
                  </tr>
                )}
                {produtos.map((p) => {
                  const abaixoDoMinimo = p.quantidade <= p.estoqueMinimo;
                  return (
                    <tr key={p.id} className="hover:bg-purple-950/20 transition">
                      <td className="px-4 py-3 font-medium text-white">
                        <div>{p.nome}</div>
                        <span className="text-[10px] font-mono text-purple-400">{p.sku}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{p.categoriaNome}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            abaixoDoMinimo
                              ? "bg-amber-950 text-amber-300 border border-amber-700"
                              : "bg-purple-950 text-purple-200"
                          }`}
                        >
                          {p.quantidade} unid
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{formatBRL(p.precoCusto)}</td>
                      <td className="px-4 py-3 font-semibold text-purple-300">{formatBRL(p.precoVenda)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <Modal titulo="Cadastrar Produto" icon={Package} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-400 mb-1">Nome do Produto</label>
              <input
                required
                type="text"
                value={novoProduto.nome}
                onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
                className="w-full bg-base-600 border border-purple-900 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-400 mb-1">SKU</label>
                <input
                  required
                  type="text"
                  value={novoProduto.sku}
                  onChange={(e) => setNovoProduto({ ...novoProduto, sku: e.target.value })}
                  className="w-full bg-base-600 border border-purple-900 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Categoria</label>
                <select
                  required
                  value={novoProduto.categoriaId}
                  onChange={(e) => setNovoProduto({ ...novoProduto, categoriaId: e.target.value })}
                  className="w-full bg-base-600 border border-purple-900 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="" disabled>
                    Selecione
                  </option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-gray-400 mb-1">Qtd Inicial</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={novoProduto.quantidade}
                  onChange={(e) => setNovoProduto({ ...novoProduto, quantidade: e.target.value })}
                  className="w-full bg-base-600 border border-purple-900 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Preço Custo</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={novoProduto.precoCusto}
                  onChange={(e) => setNovoProduto({ ...novoProduto, precoCusto: e.target.value })}
                  className="w-full bg-base-600 border border-purple-900 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Preço Venda</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={novoProduto.precoVenda}
                  onChange={(e) => setNovoProduto({ ...novoProduto, precoVenda: e.target.value })}
                  className="w-full bg-base-600 border border-purple-900 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Estoque Mínimo</label>
              <input
                type="number"
                min="0"
                value={novoProduto.estoqueMinimo}
                onChange={(e) => setNovoProduto({ ...novoProduto, estoqueMinimo: e.target.value })}
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
                {salvando ? "Salvando..." : "Salvar Produto"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
