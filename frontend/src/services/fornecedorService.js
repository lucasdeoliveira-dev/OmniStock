import axiosInstance from "../api/axiosConfig";

export async function listarFornecedores() {
  const { data } = await axiosInstance.get("/fornecedores");
  return data;
}

export async function criarFornecedor(fornecedor) {
  const { data } = await axiosInstance.post("/fornecedores", fornecedor);
  return data;
}
