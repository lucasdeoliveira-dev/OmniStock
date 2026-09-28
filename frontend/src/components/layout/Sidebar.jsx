import { NavLink } from "react-router-dom";
import {
  TrendingUp,
  Package,
  FolderTree,
  Truck,
  Users,
  ArrowLeftRight,
  ShoppingBag,
  DollarSign,
  BarChart3,
  HardDriveDownload,
} from "lucide-react";

const ITENS = [
  { to: "/", label: "Dashboard", icon: TrendingUp },
  { to: "/produtos", label: "Produtos", icon: Package },
  { to: "/categorias", label: "Categorias", icon: FolderTree },
  { to: "/fornecedores", label: "Fornecedores", icon: Truck },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/movimentacoes", label: "Movimentações", icon: ArrowLeftRight },
  { to: "/pedidos-compra", label: "Pedidos de Compra", icon: ShoppingBag },
  { to: "/pedidos-venda", label: "Pedidos de Venda", icon: DollarSign },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/backup", label: "Backup", icon: HardDriveDownload },
];

export default function Sidebar({ open, onNavigate }) {
  return (
    <aside
      className={`fixed md:static top-0 left-0 bottom-0 z-50 w-64 bg-base-800 border-r border-purple-900/40
        flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 min-h-screen
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
    >
      <div>
        <div className="p-5 border-b border-purple-900/30 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-600/40 border border-purple-400/30">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-purple-200 to-indigo-300">
              OmniStock
            </span>
            <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-500/30 inline-block mt-1">
              v0.1
            </span>
          </div>
        </div>

        <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-160px)] no-scrollbar">
          {ITENS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/50 border border-purple-400/30 font-semibold"
                      : "text-gray-400 hover:text-purple-200 hover:bg-purple-950/40"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
