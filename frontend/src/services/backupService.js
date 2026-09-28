import axiosInstance from "../api/axiosConfig";

export async function listarHistoricoBackup() {
  const { data } = await axiosInstance.get("/backup/historico");
  return data;
}

export async function buscarBackup(id) {
  const { data } = await axiosInstance.get(`/backup/${id}`);
  return data;
}

export async function buscarLogBackup(id) {
  const { data } = await axiosInstance.get(`/backup/${id}/log`);
  return data;
}

export async function testarConexao() {
  const { data } = await axiosInstance.get("/backup/testar-conexao");
  return data;
}

export async function iniciarBackup(parametros) {
  const { data } = await axiosInstance.post("/backup", parametros);
  return data;
}

export async function restaurarBackup(id, senha) {
  const { data } = await axiosInstance.post(`/backup/${id}/restaurar`, { senha });
  return data;
}
