export default function Loading() {
  return (
    <div className="p-8 max-w-6xl mx-auto animate-pulse">
      <div className="flex items-start justify-between mb-8">
        <div className="space-y-2">
          <div className="h-8 w-72 bg-gray-200 rounded-lg" />
          <div className="h-4 w-48 bg-gray-100 rounded" />
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 h-64" />
          <div className="bg-white rounded-2xl border border-gray-100 h-56" />
          <div className="bg-white rounded-2xl border border-gray-100 h-32" />
        </div>
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 h-64" />
          <div className="bg-white rounded-2xl border border-gray-100 h-44" />
        </div>
      </div>
    </div>
  )
}
