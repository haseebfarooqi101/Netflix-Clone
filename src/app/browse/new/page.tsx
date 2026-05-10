'use client'

import { useMemo } from 'react'
import { useStore } from '@/lib/store'
import MovieRow from '@/components/MovieRow'

export default function NewPopularPage() {
  const { movies } = useStore()

  const rows = useMemo(() => {
    const sorted = [...movies].sort((a, b) =>
      (b.metadata?.release_date || '').localeCompare(a.metadata?.release_date || '')
    )
    const topRated = [...movies].sort((a, b) =>
      (b.metadata?.vote_average || 0) - (a.metadata?.vote_average || 0)
    )
    return [
      { title: 'New Releases', movies: sorted.slice(0, 20) },
      { title: 'Top Rated', movies: topRated.slice(0, 20) },
    ]
  }, [movies])

  return (
    <div className="pt-24 pb-20">
      <div className="px-4 md:px-14 mb-6">
        <h1 className="text-3xl font-bold text-white">New & Popular</h1>
      </div>
      {rows.map((row) => (
        <MovieRow key={row.title} title={row.title} movies={row.movies} />
      ))}
    </div>
  )
}
