import { useEffect, useState } from "react";
import { ShoppingBag, Plus, Trash2, Check } from "lucide-react";
import { listarPedidosCompra, criarPedidoCompra, receberPedidoCompra } from "../services/pedidoCompraService";
import { listarFornecedores } from "../services/fornecedorService";
import { listarProdutos } from "../services/produtoService";
import Modal from "../components/common/Modal.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";

function formatBRL(valor) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

const ITEM_VAZIO = { produtoId: "", quantidade: 1, precoCusto: 0 };

export default function PedidosCompraPage() {
  const [pedidos, setPedidos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [processandoId, setProcessandoId] = useState(null);
  const [fornecedorId, setFornecedorId] = useState("");
  const [itens, setItens] = useState([ITEM_VAZIO]);

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      const [p, f, prod] = await Promise.all([listarPedidosCompra(), listarFornecedores(), listarProdutos()]);
      setPedidos(p);
      setFornecedores(f);
      setProdutos(prod);
    } catch {
      setErro("Não foi possível carregar os pedidos de compra.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function resetForm() {
    setFornecedorId("");
    setItens([ITEM_VAZIO]);
  }

  function atualizarItem(index, campo, valor) {
    setItens(itens.map((item, i) => (i === index ? { ...item, [campo]: valor } : item)));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSalvando(true);
    try {
      await criarPedidoCompra({
        fornecedorId: Number(fornecedorId),
        itens: itens.map((i) => ({
          produtoId: Number(i.produtoId),
          quantidade: Number(i.quantidade),
          precoCusto: Number(i.precoCusto),
        })),
      });
      setShowModal(false);
      resetForm();
      await carregar();
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Não foi possível salvar o pedido de compra.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleReceber(id) {
    setProcessandoId(id);
    try {
      await receberPedidoCompra(id);
      await carregar();
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Não foi possível receber o pedido.");
    } finally {
      setProcessandoId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-purple-400" /> Pedidos de Compra
        </h1>
        <button
          onClick={() => setShowModal(true)}
          disabled={fornecedores.length === 0 || produtos.length === 0}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-purple-900/40 transition"
        >
          <Plus className="w-4 h-4" /> Novo Pedido
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
        <div className="space-y-3">
          {pedidos.length === 0 && <p className="text-sm text-gray-400">Nenhum pedido de compra ainda.</p>}
          {pedidos.map((p) => (
            <div key={p.id} className="bg-base-700 border border-purple-900/40 p-4 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-purple-400 font-semibold">
                  #{p.id} - {p.fornecedorNome}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      p.status === "RECEBIDO"
                        ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                        : "bg-amber-950 text-amber-300 border-amber-800"
                    }`}
                  >
                    {p.status}
                  </span>
                  {p.status === "PENDENTE" && (
                    <button
                      onClick={() => handleReceber(p.id)}
                      disabled={processandoId === p.id}
                      className="text-[10px] bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white px-2 py-1 rounded flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Receber
                    </button>
                  )}
                </div>
              </div>
              <ul className="text-xs text-gray-400 mt-2 space-y-0.5">
                {p.itens.map((i, idx) => (
                  <li key={idx}>
                    {i.quantidade}x {i.produtoNome} — {formatBRL(i.precoCusto)}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-purple-300 font-bold mt-2">Total: {formatBRL(p.total)}</p>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal titulo="Novo Pedido de Compra" icon={ShoppingBag} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-400 mb-1">Fornecedor</label>
              <select
                required
                value={fornecedorId}
                onChange={(e) => setFornecedorId(e.target.value)}
                className="w-full bg-base-600 border border-purple-900 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="" disabled>
                  Selecione
                </option>
                {fornecedores.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-gray-400">Itens</label>
              {itens.map((item, index) => (
                <div key={index} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 items-end">
                  <select
                    required
                    value={item.produtoId}
                    onChange={(e) => atualizarItem(index, "produtoId", e.target.value)}
                    className="bg-base-600 border border-purple-900 rounded px-2 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="" disabled>
                      Produto
                    </option>
                    {produtos.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="Qtd"
                    value={item.quantidade}
                    onChange={(e) => atualizarItem(index, "quantidade", e.target.value)}
                    className="bg-base-600 border border-purple-900 rounded px-2 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Preço"
                    value={item.precoCusto}
                    onChange={(e) => atualizarItem(index, "precoCusto", e.target.value)}
                    className="bg-base-600 border border-purple-900 rounded px-2 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setItens(itens.filter((_, i) => i !== index))}
                    disabled={itens.length === 1}
                    className="text-gray-500 hover:text-rose-400 disabled:opacity-30 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setItens([...itens, ITEM_VAZIO])}
                className="text-purple-300 hover:text-purple-200 text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar item
              </button>
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
                {salvando ? "Salvando..." : "Salvar Pedido"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
