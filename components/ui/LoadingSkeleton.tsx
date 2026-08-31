export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs animate-pulse">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="h-5 w-1/3 bg-slate-200 rounded"></div>
        <div className="h-4 w-12 bg-slate-200 rounded"></div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full bg-slate-100 rounded"></div>
        <div className="h-3 w-4/5 bg-slate-100 rounded"></div>
      </div>
      <div className="mt-6 flex gap-4 pt-4 border-t border-slate-100">
        <div className="h-8 w-20 bg-slate-200 rounded-lg"></div>
        <div className="h-8 w-20 bg-slate-200 rounded-lg"></div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs animate-pulse space-y-3">
      <div className="h-10 bg-slate-100 rounded-xl"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-slate-50 rounded-lg flex items-center px-4 gap-4">
          <div className="h-4 w-1/4 bg-slate-200 rounded"></div>
          <div className="h-4 w-1/3 bg-slate-100 rounded"></div>
          <div className="h-4 w-1/6 bg-slate-200 rounded ml-auto"></div>
        </div>
      ))}
    </div>
  );
}
