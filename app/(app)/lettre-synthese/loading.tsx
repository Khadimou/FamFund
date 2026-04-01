export default function Loading() {
  return (
    <div className="p-8 max-w-7xl mx-auto animate-pulse">
      <div className="flex items-start justify-between mb-8">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-gray-200 rounded-lg" />
          <div className="h-4 w-80 bg-gray-100 rounded" />
        </div>
        <div className="h-10 w-44 bg-gray-200 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 h-64" />
          <div className="bg-white rounded-2xl border border-gray-100 h-80" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 h-[600px]" />
      </div>
    </div>
  )
}
