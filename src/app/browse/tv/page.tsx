'use client'

import { useMemo } from 'react'
import { useStore } from '@/lib/store'
import MovieRow from '@/components/MovieRow'

export default function TVShowsPage() {
  const { movies } = useStore()

  // Filter movies that are likely TV/series based on genres
  const tvGenres = ['Animation', 'Documentary']
  const tvMovies = useMemo(() =>
    movies.filter((m) =>
      m.metadata?.genres?.some((g) => tvGenres.includes(g.name))
    ), [movies])

  const allMovies = useMemo(() => movies, [movies])

  return (
    <div className="pt-24 pb-20">
      <div className="px-4 md:px-14 mb-6">
        <h1 className="text-3xl font-bold text-white">TV Shows</h1>
        <p className="text-gray-400 mt-2 text-sm">
          This library is movie-based. TV show support coming soon.
        </p>
      </div>
      <MovieRow title="Animated & Documentary" movies={tvMovies.length > 0 ? tvMovies : allMovies.slice(0, 10)} />
    </div>
  )
}
