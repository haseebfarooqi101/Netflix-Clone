'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import MovieCard from '@/components/MovieCard'
import { Suspense } from 'react'

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const { movies } = useStore()

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return movies.filter(
      (m) =>
        m.metadata?.title?.toLowerCase().includes(q) ||
        m.parsed?.title?.toLowerCase().includes(q) ||
        m.metadata?.overview?.toLowerCase().includes(q) ||
        m.metadata?.genres?.some((g) => g.name.toLowerCase().includes(q))
    )
  }, [movies, query])

  return (
    <div className="pt-24 pb-20 px-4 md:px-14">
      {query ? (
        <>
          <h2 className="text-gray-400 text-lg mb-6">
            {results.length > 0
              ? `Results for "${query}"`
              : `Your search for "${query}" did not have any matches.`}
          </h2>
          {results.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {results.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
          {results.length === 0 && (
            <div className="text-gray-400 mt-4">
              <p className="mb-2">Suggestions:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Try different keywords</li>
                <li>Looking for a movie or TV show?</li>
                <li>Try using a movie, TV show title, an actor or director</li>
                <li>Try a genre, like comedy, romance, sports, or drama</li>
              </ul>
            </div>
          )}
        </>
      ) : (
        <div>
          <h2 className="text-white text-xl font-semibold mb-6">Top Searches</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {movies.slice(0, 12).map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="pt-24 px-14 text-gray-400">Loading...</div>}>
      <SearchResults />
    </Suspense>
  )
}
