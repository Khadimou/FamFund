export default function Loading() {
  return (
    <div className="p-8 max-w-6xl mx-auto animate-pulse">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="h-8 w-64 bg-gray-200 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 h-16" />
          <div className="bg-white rounded-2xl border border-gray-100 h-[600px]" />
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 h-48" />
          <div className="bg-white rounded-2xl border border-gray-100 h-40" />
          <div className="bg-[#1C3B2E] rounded-2xl h-44" />
        </div>
      </div>
    </div>
  )
}
