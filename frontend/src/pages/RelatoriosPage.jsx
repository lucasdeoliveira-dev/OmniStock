import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, DollarSign } from "lucide-react";
import { buscarRelatorioLucro, buscarProdutosMaisVendidos } from "../services/relatorioService";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";

function formatBRL(valor) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor ?? 0);
}

export default function RelatoriosPage() {
  const [lucro, setLucro] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      setErro("");
      try {
        const [lucroData, rankingData] = await Promise.all([buscarRelatorioLucro(), buscarProdutosMaisVendidos()]);
        setLucro(lucroData);
        setRanking(rankingData);
      } catch {
        setErro("Não foi possível carregar os relatórios.");
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-purple-400" /> Relatórios
      </h1>

      {erro && (
        <div className="text-xs text-rose-300 bg-rose-950/60 border border-rose-800/50 rounded-lg px-3 py-2">
          {erro}
        </div>
      )}

      {carregando ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-base-700 border border-purple-900/40 p-4 rounded-xl shadow-lg">
              <p className="text-xs text-purple-300 uppercase font-semibold flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> Total Vendido
              </p>
              <h3 className="text-2xl font-bold text-white mt-1">{formatBRL(lucro?.totalVendas)}</h3>
            </div>
            <div className="bg-base-700 border border-purple-900/40 p-4 rounded-xl shadow-lg">
              <p className="text-xs text-gray-400 uppercase font-semibold">Custo Vendido</p>
              <h3 className="text-2xl font-bold text-white mt-1">{formatBRL(lucro?.totalCustoVendido)}</h3>
            </div>
            <div className="bg-base-700 border border-purple-900/40 p-4 rounded-xl shadow-lg">
              <p className="text-xs text-emerald-300 uppercase font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Lucro
              </p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">{formatBRL(lucro?.lucro)}</h3>
              <p className="text-[11px] text-gray-400 mt-1">{lucro?.totalPedidosVenda ?? 0} pedidos confirmados</p>
            </div>
          </div>

          <div className="bg-base-700 border border-purple-900/40 rounded-xl overflow-hidden shadow-lg">
            <div className="px-4 py-3 border-b border-purple-900/40">
              <h3 className="text-sm font-semibold text-white">Produtos Mais Vendidos</h3>
            </div>
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-base-600 text-purple-300 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-2.5">Produto</th>
                  <th className="px-4 py-2.5 text-right">Quantidade Vendida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-950/50">
                {ranking.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-4 py-6 text-center text-gray-500">
                      Nenhuma venda confirmada ainda.
                    </td>
                  </tr>
                )}
                {ranking.map((r) => (
                  <tr key={r.produtoId} className="hover:bg-purple-950/20 transition">
                    <td className="px-4 py-3 font-medium text-white">{r.produtoNome}</td>
                    <td className="px-4 py-3 text-right font-bold text-purple-300">{r.quantidadeVendida}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
