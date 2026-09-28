import axiosInstance from "../api/axiosConfig";

export async function listarCategorias() {
  const { data } = await axiosInstance.get("/categorias");
  return data;
}

export async function criarCategoria(categoria) {
  const { data } = await axiosInstance.post("/categorias", categoria);
  return data;
}
