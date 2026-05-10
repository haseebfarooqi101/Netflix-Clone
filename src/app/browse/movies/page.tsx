'use client'

import { useEffect, useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { fetchMovies } from '@/lib/api'
import MovieRow from '@/components/MovieRow'
import LoadingSkeleton from '@/components/LoadingSkeleton'

const GENRES = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War']

export default function MoviesPage() {
  const { movies, setMovies } = useStore()
  const [loading, setLoading] = useState(movies.length === 0)
  const [selectedGenre, setSelectedGenre] = useState('All')

  useEffect(() => {
    if (movies.length > 0) { setLoading(false); return }
    fetchMovies().then(setMovies).finally(() => setLoading(false))
  }, [movies.length, setMovies])

  const filtered = useMemo(() => {
    if (selectedGenre === 'All') return movies
    return movies.filter((m) =>
      m.metadata?.genres?.some((g) => g.name === selectedGenre)
    )
  }, [movies, selectedGenre])

  const rows = useMemo(() => {
    const byGenre: Record<string, typeof movies> = {}
    filtered.forEach((m) => {
      m.metadata?.genres?.forEach((g) => {
        if (!byGenre[g.name]) byGenre[g.name] = []
        byGenre[g.name].push(m)
      })
    })
    if (selectedGenre !== 'All') {
      return [{ title: selectedGenre, movies: filtered }]
    }
    return [
      { title: 'All Movies', movies: filtered },
      ...Object.entries(byGenre)
        .filter(([, films]) => films.length >= 2)
        .map(([genre, films]) => ({ title: genre, movies: films })),
    ]
  }, [filtered, selectedGenre])

  if (loading) return <LoadingSkeleton />

  return (
    <div className="pt-24 pb-20">
      <div className="px-4 md:px-14 mb-8">
        <h1 className="text-3xl font-bold text-white mb-6">Movies</h1>
        {/* Genre filter */}
        <div className="flex flex-wrap gap-2">
          {['All', ...GENRES].map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                selectedGenre === genre
                  ? 'bg-white text-black border-white'
                  : 'border-zinc-600 text-gray-300 hover:border-white hover:text-white'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
      {rows.map((row) => (
        <MovieRow key={row.title} title={row.title} movies={row.movies} />
      ))}
    </div>
  )
}
