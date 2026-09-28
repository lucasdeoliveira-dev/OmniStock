import axiosInstance from "../api/axiosConfig";

export async function login(email, senha) {
  const { data } = await axiosInstance.post("/auth/login", { email, senha });
  return data;
}
