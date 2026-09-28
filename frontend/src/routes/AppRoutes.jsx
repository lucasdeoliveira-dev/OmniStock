import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import MainLayout from "../components/layout/MainLayout.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import ProdutosPage from "../pages/ProdutosPage.jsx";
import CategoriasPage from "../pages/CategoriasPage.jsx";
import FornecedoresPage from "../pages/FornecedoresPage.jsx";
import ClientesPage from "../pages/ClientesPage.jsx";
import MovimentacoesPage from "../pages/MovimentacoesPage.jsx";
import PedidosCompraPage from "../pages/PedidosCompraPage.jsx";
import PedidosVendaPage from "../pages/PedidosVendaPage.jsx";
import RelatoriosPage from "../pages/RelatoriosPage.jsx";
import BackupPage from "../pages/BackupPage.jsx";

function RotaPrivada({ children }) {
  const { autenticado } = useAuth();
  return autenticado ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <RotaPrivada>
            <MainLayout />
          </RotaPrivada>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="produtos" element={<ProdutosPage />} />
        <Route path="categorias" element={<CategoriasPage />} />
        <Route path="fornecedores" element={<FornecedoresPage />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="movimentacoes" element={<MovimentacoesPage />} />
        <Route path="pedidos-compra" element={<PedidosCompraPage />} />
        <Route path="pedidos-venda" element={<PedidosVendaPage />} />
        <Route path="relatorios" element={<RelatoriosPage />} />
        <Route path="backup" element={<BackupPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
