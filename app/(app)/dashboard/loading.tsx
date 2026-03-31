export default function DashboardLoading() {
  return (
    <div className="p-8 max-w-6xl mx-auto animate-pulse">
      {/* En-tête */}
      <div className="mb-8 space-y-2">
        <div className="h-8 w-56 bg-gray-200 rounded-xl" />
        <div className="h-4 w-40 bg-gray-100 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {[140, 220, 180, 100].map((h, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6" style={{ height: h }} />
          ))}
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 h-40" />
          <div className="bg-white rounded-2xl border border-gray-100 p-6 h-52" />
        </div>
      </div>
    </div>
  )
}
