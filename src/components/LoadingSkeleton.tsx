'use client'

export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="w-full h-[56vw] min-h-[400px] max-h-[800px] shimmer" />

      {/* Rows skeleton */}
      <div className="-mt-16 relative z-10 space-y-8 px-4 md:px-14 pt-4">
        {[1, 2, 3].map((row) => (
          <div key={row}>
            <div className="h-5 w-40 shimmer rounded mb-3" />
            <div className="flex gap-2 overflow-hidden">
              {[1, 2, 3, 4, 5, 6, 7].map((card) => (
                <div
                  key={card}
                  className="flex-shrink-0 shimmer rounded"
                  style={{ width: 'clamp(140px, 15vw, 220px)', aspectRatio: '16/9' }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
