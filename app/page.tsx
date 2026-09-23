export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200 w-full">
        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold mb-4">
          Foundation & Memory Setup Complete
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Investment Simulator
        </h1>
        <p className="text-slate-600 mb-6">
          Educational classroom simulator powered by virtual money and real mutual fund data.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left border-t border-slate-100 pt-6">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h3 className="font-semibold text-slate-800 text-sm mb-1">Architecture</h3>
            <p className="text-xs text-slate-500">
              Next.js App Router, TypeScript, Prisma, PostgreSQL, Zod & Vitest foundation established.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h3 className="font-semibold text-slate-800 text-sm mb-1">Financial Integrity</h3>
            <p className="text-xs text-slate-500">
              Strict rules: Server-side calculations, Decimal precision, atomic DB transactions.
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h3 className="font-semibold text-slate-800 text-sm mb-1">Status</h3>
            <p className="text-xs text-slate-500">
              Phase 0 complete. Ready for Phase 1 Authentication & User Role Implementation.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
