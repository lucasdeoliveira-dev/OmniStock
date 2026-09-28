import axiosInstance from "../api/axiosConfig";

export async function listarProdutos() {
  const { data } = await axiosInstance.get("/produtos");
  return data;
}

export async function criarProduto(produto) {
  const { data } = await axiosInstance.post("/produtos", produto);
  return data;
}
