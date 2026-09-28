import axiosInstance from "../api/axiosConfig";

export async function listarPedidosVenda() {
  const { data } = await axiosInstance.get("/pedidos-venda");
  return data;
}

export async function criarPedidoVenda(pedido) {
  const { data } = await axiosInstance.post("/pedidos-venda", pedido);
  return data;
}

export async function confirmarPedidoVenda(id) {
  const { data } = await axiosInstance.post(`/pedidos-venda/${id}/confirmar`);
  return data;
}
