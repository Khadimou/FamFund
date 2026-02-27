interface ProgressBarProps {
  value: number // 0–100
  className?: string
  showLabel?: boolean
}

export default function ProgressBar({ value, className = '', showLabel = false }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value))

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-muted">Progression</span>
          <span className="font-semibold text-primary">{pct}%</span>
        </div>
      )}
      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
