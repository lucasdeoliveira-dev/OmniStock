import axiosInstance from "../api/axiosConfig";

export async function listarPedidosCompra() {
  const { data } = await axiosInstance.get("/pedidos-compra");
  return data;
}

export async function criarPedidoCompra(pedido) {
  const { data } = await axiosInstance.post("/pedidos-compra", pedido);
  return data;
}

export async function receberPedidoCompra(id) {
  const { data } = await axiosInstance.post(`/pedidos-compra/${id}/receber`);
  return data;
}
