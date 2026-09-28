import axiosInstance from "../api/axiosConfig";

export async function listarHistoricoManutencao() {
  const { data } = await axiosInstance.get("/manutencao/historico");
  return data;
}
