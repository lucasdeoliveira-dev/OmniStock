import axiosInstance from "../api/axiosConfig";

export async function buscarRelatorioLucro() {
  const { data } = await axiosInstance.get("/relatorios/lucro");
  return data;
}

export async function buscarProdutosMaisVendidos() {
  const { data } = await axiosInstance.get("/relatorios/mais-vendidos");
  return data;
}
