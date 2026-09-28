import axiosInstance from "../api/axiosConfig";

export async function listarMovimentacoes() {
  const { data } = await axiosInstance.get("/movimentacoes");
  return data;
}

export async function registrarMovimentacao(movimentacao) {
  const { data } = await axiosInstance.post("/movimentacoes", movimentacao);
  return data;
}
