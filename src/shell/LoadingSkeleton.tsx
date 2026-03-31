interface LoadingSkeletonProps {
  lines?: number
  className?: string
}

export function LoadingSkeleton({ lines = 3, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`} role="status" aria-label="Loading">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="h-4 bg-surface-bright rounded"
          style={{ width: `${80 - i * 15}%` }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  )
}
