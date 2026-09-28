import { Construction } from "lucide-react";

export default function PaginaEmConstrucao({ titulo }) {
  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-4">{titulo}</h1>
      <div className="bg-base-700 border border-purple-900/40 rounded-xl p-10 flex flex-col items-center text-center gap-3 shadow-lg">
        <Construction className="w-10 h-10 text-purple-400" />
        <p className="text-sm text-gray-400">Módulo em construção.</p>
      </div>
    </div>
  );
}
