import { useEffect, useRef, useState } from "react";
import {
  HardDriveDownload,
  Play,
  RefreshCw,
  CheckCircle2,
  XCircle,
  PlugZap,
  FileText,
  History,
  RotateCcw,
  X,
  ShieldAlert,
} from "lucide-react";
import {
  listarHistoricoBackup,
  buscarBackup,
  buscarLogBackup,
  testarConexao,
  listarBancosDisponiveis,
  iniciarBackup,
  restaurarBackup,
} from "../services/backupService";
import { listarHistoricoManutencao } from "../services/manutencaoService";
import { useAuth } from "../context/AuthContext.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import Modal from "../components/common/Modal.jsx";

const SENHA_PADRAO_BACKUP = "matehusmelhorprofessor";

const PARAMETROS_VAZIOS = {
  nomeBanco: "",
  caminhoDestino: "",
  criptografar: true,
  compactar: true,
  senha: SENHA_PADRAO_BACKUP,
  quantidadeAManter: 5,
  caminhoCopiaAdicional: "",
  executarManutencao: false,
  manutencaoCompleta: false,
};

function formatBytes(bytes) {
  if (!bytes) return "-";
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function BackupPage() {
  const { usuario } = useAuth();
  const podeSolicitarBackup = usuario?.role === "ADMIN" || usuario?.role === "GERENTE";
  const [historico, setHistorico] = useState([]);
  const [bancosDisponiveis, setBancosDisponiveis] = useState([]);
  const [manutencoes, setManutencoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [executando, setExecutando] = useState(false);
  const [acompanhando, setAcompanhando] = useState(null);
  const [testandoConexao, setTestandoConexao] = useState(false);
  const [parametros, setParametros] = useState(PARAMETROS_VAZIOS);
  const [logVisivel, setLogVisivel] = useState(null);
  const [restaurando, setRestaurando] = useState(null);
  const [senhaRestaurar, setSenhaRestaurar] = useState("");
  const [resultadoRestore, setResultadoRestore] = useState(null);
  const pollingRef = useRef(null);

  async function carregar() {
    setCarregando(true);
    setErro("");
    try {
      const [backups, manut] = await Promise.all([listarHistoricoBackup(), listarHistoricoManutencao()]);
      setHistorico(backups);
      setManutencoes(manut);
    } catch {
      setErro("Não foi possível carregar o histórico.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    listarBancosDisponiveis()
      .then(setBancosDisponiveis)
      .catch(() => setErro("Não foi possível listar os bancos disponíveis para backup."));
    return () => clearInterval(pollingRef.current);
  }, []);

  async function handleTestarConexao() {
    setTestandoConexao(true);
    setAviso("");
    setErro("");
    try {
      const resultado = await testarConexao();
      setAviso(resultado.mensagem);
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Falha ao testar conexão.");
    } finally {
      setTestandoConexao(false);
    }
  }

  async function handleExecutar(event) {
    event.preventDefault();
    if (!window.confirm("Confirma o início do processo de backup? Essa operação acessa o banco de produção.")) {
      return;
    }

    setExecutando(true);
    setErro("");
    setAviso("");
    try {
      const iniciado = await iniciarBackup({
        ...parametros,
        quantidadeAManter: parametros.quantidadeAManter ? Number(parametros.quantidadeAManter) : null,
      });
      setAcompanhando(iniciado);
      iniciarPolling(iniciado.id);
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Falha ao iniciar o backup.");
      setExecutando(false);
    }
  }

  function iniciarPolling(id) {
    clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const atual = await buscarBackup(id);
        setAcompanhando(atual);
        if (atual.status === "SUCESSO" || atual.status === "FALHA") {
          clearInterval(pollingRef.current);
          setExecutando(false);
          await carregar();
        }
      } catch {
        clearInterval(pollingRef.current);
        setExecutando(false);
      }
    }, 1200);
  }

  async function handleVerLog(id) {
    try {
      const log = await buscarLogBackup(id);
      setLogVisivel({ id, log });
    } catch {
      setErro("Não foi possível carregar o log deste backup.");
    }
  }

  async function handleRestaurar(event) {
    event.preventDefault();
    setResultadoRestore(null);
    try {
      const resultado = await restaurarBackup(restaurando.id, senhaRestaurar);
      setResultadoRestore(resultado);
    } catch (err) {
      setResultadoRestore({
        sucesso: false,
        mensagem: err.response?.data?.mensagem || "Falha ao restaurar o backup.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <HardDriveDownload className="w-5 h-5 text-purple-400" /> Backup do Banco de Dados
        </h1>
        <button
          onClick={handleTestarConexao}
          disabled={testandoConexao}
          className="text-xs bg-base-600 hover:bg-base-700 disabled:opacity-60 text-purple-200 border border-purple-800/50 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
        >
          <PlugZap className="w-3.5 h-3.5" /> {testandoConexao ? "Testando..." : "Testar Conexão"}
        </button>
      </div>

      {erro && (
        <div className="text-xs text-rose-300 bg-rose-950/60 border border-rose-800/50 rounded-lg px-3 py-2">{erro}</div>
      )}
      {aviso && (
        <div className="text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-800/50 rounded-lg px-3 py-2">
          {aviso}
        </div>
      )}

      {!podeSolicitarBackup && (
        <div className="bg-base-700 border border-amber-800/40 p-5 rounded-xl shadow-lg flex items-center gap-3 text-xs text-amber-300">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          Somente usuários com perfil Administrador ou Gerente podem solicitar um backup ou restauração. Você pode
          consultar o histórico abaixo normalmente.
        </div>
      )}

      <form
        onSubmit={handleExecutar}
        className={`bg-base-700 border border-purple-900/40 p-5 rounded-xl shadow-lg space-y-4 text-xs ${
          !podeSolicitarBackup ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <h3 className="text-sm font-semibold text-white">Parâmetros do Backup</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 mb-1">Banco de dados</label>
            <select
              required
              value={parametros.nomeBanco}
              onChange={(e) => setParametros({ ...parametros, nomeBanco: e.target.value })}
              className="w-full bg-base-600 border border-purple-900 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="" disabled>
                {bancosDisponiveis.length ? "Selecione um banco" : "Nenhum banco disponível"}
              </option>
              {bancosDisponiveis.map((banco) => (
                <option key={banco} value={banco}>{banco}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Pasta de destino</label>
            <input
              type="text"
              value="C:\\Backup"
              readOnly
              className="w-full bg-base-600/60 border border-purple-900 rounded px-3 py-2 text-white cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-2 text-gray-300">
            <input
              type="checkbox"
              checked={parametros.criptografar}
              onChange={(e) => setParametros({ ...parametros, criptografar: e.target.checked })}
              className="accent-purple-600"
            />
            Criptografar (AES-256)
          </label>
          <label className="flex items-center gap-2 text-gray-300">
            <input
              type="checkbox"
              checked={parametros.compactar}
              onChange={(e) => setParametros({ ...parametros, compactar: e.target.checked })}
              className="accent-purple-600"
            />
            Compactar (ZIP)
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-purple-900/30 pt-3">
          <label className="flex items-center gap-2 text-gray-300">
            <input
              type="checkbox"
              checked={parametros.executarManutencao}
              onChange={(e) => setParametros({ ...parametros, executarManutencao: e.target.checked })}
              className="accent-purple-600"
            />
            Forçar execução de manutenção
          </label>
          <label className={`flex items-center gap-2 ${parametros.executarManutencao ? "text-gray-300" : "text-gray-600"}`}>
            <input
              type="checkbox"
              disabled={!parametros.executarManutencao}
              checked={parametros.manutencaoCompleta}
              onChange={(e) => setParametros({ ...parametros, manutencaoCompleta: e.target.checked })}
              className="accent-purple-600"
            />
            Manutenção completa (VACUUM FULL ANALYZE)
          </label>
        </div>
        <p className="text-[11px] text-gray-500">
          Se não marcar "forçar execução de manutenção", a decisão é automática com base na data da última manutenção
          registrada (menos de 30 dias: nenhuma; 30-60 dias: VACUUM; mais de 60 dias ou sem histórico: VACUUM FULL ANALYZE).
        </p>

        <div>
          <label className="block text-gray-400 mb-1">Senha do arquivo protegido (padrão da empresa, fixa)</label>
          <input
            required
            readOnly
            type="password"
            value={parametros.senha}
            className="w-full bg-base-600/60 border border-purple-900 rounded px-3 py-2 text-white cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 mb-1">Quantidade de backups a manter</label>
            <input
              type="number"
              min="1"
              value={parametros.quantidadeAManter}
              onChange={(e) => setParametros({ ...parametros, quantidadeAManter: e.target.value })}
              className="w-full bg-base-600 border border-purple-900 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Cópia adicional (caminho opcional)</label>
            <input
              type="text"
              value={parametros.caminhoCopiaAdicional}
              onChange={(e) => setParametros({ ...parametros, caminhoCopiaAdicional: e.target.value })}
              className="w-full bg-base-600 border border-purple-900 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              placeholder="/app/backups-extra"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={executando || !podeSolicitarBackup}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg shadow-lg shadow-purple-900/50 flex items-center gap-2"
        >
          {executando ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {executando ? "Processando..." : "Gerar Backup Agora"}
        </button>

        {acompanhando && (
          <div className="bg-base-600 border border-purple-800/40 rounded-lg p-3 mt-2">
            <p className="text-purple-300 font-semibold">Backup #{acompanhando.id}</p>
            <p className="text-gray-300 mt-1">
              Status: <span className="font-semibold">{acompanhando.status}</span> — Etapa atual:{" "}
              <span className="text-purple-300">{acompanhando.etapaAtual}</span>
            </p>
            {acompanhando.status === "FALHA" && (
              <p className="text-rose-400 mt-1">{acompanhando.mensagem}</p>
            )}
          </div>
        )}
      </form>

      {carregando ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="bg-base-700 border border-purple-900/40 rounded-xl overflow-hidden shadow-lg">
            <div className="px-4 py-3 border-b border-purple-900/40">
              <h3 className="text-sm font-semibold text-white">Histórico de Execuções de Backup</h3>
            </div>
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-base-600 text-purple-300 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-2.5">Arquivo</th>
                  <th className="px-4 py-2.5">Tamanho</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Duração</th>
                  <th className="px-4 py-2.5">Manutenção</th>
                  <th className="px-4 py-2.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-950/50">
                {historico.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                      Nenhum backup executado ainda.
                    </td>
                  </tr>
                )}
                {historico.map((b) => {
                  const duracaoMs = b.finalizadoEm ? new Date(b.finalizadoEm) - new Date(b.iniciadoEm) : null;
                  return (
                    <tr key={b.id} className="hover:bg-purple-950/20 transition">
                      <td className="px-4 py-3 font-mono text-purple-300 flex items-center gap-2">
                        {b.status === "SUCESSO" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : b.status === "FALHA" ? (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : (
                          <RefreshCw className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
                        )}
                        {b.arquivo || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-400">{formatBytes(b.tamanhoBytes)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                            b.status === "SUCESSO"
                              ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                              : b.status === "FALHA"
                              ? "bg-rose-950 text-rose-300 border-rose-800"
                              : "bg-amber-950 text-amber-300 border-amber-800"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{duracaoMs != null ? `${(duracaoMs / 1000).toFixed(1)}s` : "-"}</td>
                      <td className="px-4 py-3 text-gray-400">{b.manutencaoId ? `#${b.manutencaoId}` : "-"}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => handleVerLog(b.id)}
                          className="text-purple-400 hover:text-purple-200 transition bg-purple-950 px-2 py-1 rounded border border-purple-800/50 inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" /> Log
                        </button>
                        {b.status === "SUCESSO" && podeSolicitarBackup && (
                          <button
                            onClick={() => {
                              setRestaurando(b);
                              setSenhaRestaurar(SENHA_PADRAO_BACKUP);
                              setResultadoRestore(null);
                            }}
                            className="text-emerald-400 hover:text-emerald-200 transition bg-emerald-950 px-2 py-1 rounded border border-emerald-800/50 inline-flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Restaurar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-base-700 border border-purple-900/40 rounded-xl overflow-hidden shadow-lg">
            <div className="px-4 py-3 border-b border-purple-900/40">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-purple-400" /> Histórico de Manutenção
              </h3>
            </div>
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-base-600 text-purple-300 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-2.5">Tipo</th>
                  <th className="px-4 py-2.5">Origem</th>
                  <th className="px-4 py-2.5">Regra Aplicada</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-950/50">
                {manutencoes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                      Nenhuma manutenção executada ainda.
                    </td>
                  </tr>
                )}
                {manutencoes.map((m) => (
                  <tr key={m.id} className="hover:bg-purple-950/20 transition">
                    <td className="px-4 py-3 font-medium text-white">{m.tipo}</td>
                    <td className="px-4 py-3 text-gray-400">{m.origem}</td>
                    <td className="px-4 py-3 text-gray-400">{m.regraAplicada}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          m.status === "SUCESSO"
                            ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                            : "bg-rose-950 text-rose-300 border-rose-800"
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{new Date(m.iniciadoEm).toLocaleString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {logVisivel && (
        <Modal titulo={`Log do Backup #${logVisivel.id}`} icon={FileText} onClose={() => setLogVisivel(null)}>
          <pre className="bg-base-950 text-emerald-300 text-[11px] p-3 rounded-lg max-h-80 overflow-y-auto whitespace-pre-wrap">
            {logVisivel.log || "Log vazio."}
          </pre>
          <button
            onClick={() => setLogVisivel(null)}
            className="mt-3 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded font-semibold text-xs flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" /> Fechar
          </button>
        </Modal>
      )}

      {restaurando && (
        <Modal titulo={`Restaurar Backup #${restaurando.id}`} icon={RotateCcw} onClose={() => setRestaurando(null)}>
          {!resultadoRestore ? (
            <form onSubmit={handleRestaurar} className="space-y-3 text-xs">
              <p className="text-gray-400">
                A restauração é feita em um banco de verificação isolado (não afeta os dados em uso) e compara a
                contagem de produtos para comprovar a integridade.
              </p>
              <div>
                <label className="block text-gray-400 mb-1">Senha usada na criptografia deste backup (padrão da empresa, fixa)</label>
                <input
                  required
                  readOnly
                  type="password"
                  value={senhaRestaurar}
                  className="w-full bg-base-600/60 border border-purple-900 rounded px-3 py-2 text-white cursor-not-allowed"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestaurando(null)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold shadow-lg"
                >
                  Restaurar e Verificar
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 text-xs">
              <div
                className={`rounded-lg px-3 py-2 border ${
                  resultadoRestore.sucesso && resultadoRestore.integro
                    ? "bg-emerald-950/60 border-emerald-800/50 text-emerald-300"
                    : "bg-rose-950/60 border-rose-800/50 text-rose-300"
                }`}
              >
                {resultadoRestore.mensagem}
              </div>
              {resultadoRestore.sucesso && (
                <p className="text-gray-400">
                  Produtos no banco original: <strong className="text-white">{resultadoRestore.contagemOriginal}</strong> —
                  Produtos restaurados: <strong className="text-white">{resultadoRestore.contagemRestaurada}</strong>
                </p>
              )}
              <button
                onClick={() => setRestaurando(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded font-semibold"
              >
                Fechar
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
