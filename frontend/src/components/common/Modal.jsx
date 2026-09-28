export default function Modal({ titulo, icon: Icon, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-base-700 border border-purple-700/50 rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-purple-400" />}
          {titulo}
        </h3>
        {children}
      </div>
    </div>
  );
}
