import axiosInstance from "../api/axiosConfig";

export async function listarClientes() {
  const { data } = await axiosInstance.get("/clientes");
  return data;
}

export async function criarCliente(cliente) {
  const { data } = await axiosInstance.post("/clientes", cliente);
  return data;
}
