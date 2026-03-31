export default function FamilleLoading() {
  return (
    <div className="p-8 max-w-6xl mx-auto animate-pulse">
      {/* En-tête */}
      <div className="flex items-start justify-between mb-8">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-gray-200 rounded-xl" />
          <div className="h-4 w-56 bg-gray-100 rounded-lg" />
        </div>
        <div className="h-10 w-40 bg-gray-200 rounded-xl" />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-24" />
        ))}
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-20 bg-gray-100 rounded-full" />
        ))}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0">
            <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-32 bg-gray-100 rounded" />
              <div className="h-3 w-20 bg-gray-50 rounded" />
            </div>
            <div className="h-5 w-16 bg-gray-100 rounded-full hidden sm:block" />
            <div className="h-5 w-20 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
