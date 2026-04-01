export default function Loading() {
  return (
    <div className="p-8 max-w-6xl mx-auto animate-pulse">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-8 w-56 bg-gray-200 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 h-32" />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex gap-4">
              <div className="w-4 flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-gray-200 mt-2" />
              </div>
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 h-16" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="bg-[#1C3B2E] rounded-2xl h-52 opacity-30" />
          <div className="bg-white rounded-2xl border border-gray-100 h-24" />
          <div className="bg-white rounded-2xl border border-gray-100 h-10" />
        </div>
      </div>
    </div>
  )
}
