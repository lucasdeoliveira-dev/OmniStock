export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="h-8 w-8 border-4 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
    </div>
  );
}
