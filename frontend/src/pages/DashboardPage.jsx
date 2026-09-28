import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign, TrendingUp, AlertTriangle, ShoppingBag, Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { listarProdutos } from "../services/produtoService";
import { buscarRelatorioLucro, buscarProdutosMaisVendidos } from "../services/relatorioService";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";

function formatBRL(valor) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor ?? 0);
}

function CardKpi({ titulo, valor, icon: Icon, corIcone, corTexto, nota }) {
  return (
    <div className="bg-base-700 border border-purple-900/40 p-4 rounded-xl shadow-lg relative overflow-hidden group hover:border-purple-600/50 transition">
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition">
        <Icon className={`w-16 h-16 ${corIcone}`} />
      </div>
      <p className="text-xs font-medium text-purple-300 uppercase tracking-wider">{titulo}</p>
      <h3 className={`text-2xl font-bold mt-1 ${corTexto || "text-white"}`}>{valor}</h3>
      {nota && <p className="text-[11px] text-gray-400 mt-2">{nota}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { usuario } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [lucro, setLucro] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      setErro("");
      try {
        const [listaProdutos, lucroData, rankingData] = await Promise.all([
          listarProdutos(),
          buscarRelatorioLucro(),
          buscarProdutosMaisVendidos(),
        ]);
        setProdutos(listaProdutos);
        setLucro(lucroData);
        setRanking(rankingData.slice(0, 5));
      } catch {
        setErro("Não foi possível carregar os indicadores do dashboard.");
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  const valorEstoque = produtos.reduce((total, p) => total + p.precoCusto * p.quantidade, 0);
  const alertasReposicao = produtos.filter((p) => p.quantidade <= p.estoqueMinimo).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Bem-vindo, {usuario?.nome}</h1>
        <p className="text-xs text-gray-400 mt-1">Indicadores calculados em tempo real a partir do banco de dados.</p>
      </div>

      {erro && (
        <div className="text-xs text-rose-300 bg-rose-950/60 border border-rose-800/50 rounded-lg px-3 py-2">
          {erro}
        </div>
      )}

      {carregando ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CardKpi
              titulo="Valor em Estoque (custo)"
              valor={formatBRL(valorEstoque)}
              icon={DollarSign}
              corIcone="text-purple-400"
              nota={`${produtos.length} produtos cadastrados`}
            />
            <CardKpi
              titulo="Lucro (vendas confirmadas)"
              valor={formatBRL(lucro?.lucro)}
              icon={TrendingUp}
              corIcone="text-emerald-400"
              corTexto="text-emerald-400"
            />
            <CardKpi
              titulo="Alertas de Reposição"
              valor={`${alertasReposicao} produtos`}
              icon={AlertTriangle}
              corIcone="text-amber-400"
              corTexto={alertasReposicao > 0 ? "text-amber-400" : "text-white"}
              nota="Estoque abaixo do mínimo cadastrado"
            />
            <CardKpi
              titulo="Pedidos de Venda Confirmados"
              valor={lucro?.totalPedidosVenda ?? 0}
              icon={ShoppingBag}
              corIcone="text-indigo-400"
            />
          </div>

          <div className="bg-base-700 border border-purple-900/40 p-5 rounded-xl shadow-lg">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-purple-400" /> Produtos Mais Vendidos
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ranking}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262335" />
                  <XAxis dataKey="produtoNome" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#1C182B", borderColor: "#6D28D9", color: "#fff", borderRadius: "8px" }} />
                  <Bar dataKey="quantidadeVendida" name="Quantidade Vendida" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              {ranking.length === 0 && (
                <p className="text-xs text-gray-500 text-center -mt-40">Nenhuma venda confirmada ainda.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
