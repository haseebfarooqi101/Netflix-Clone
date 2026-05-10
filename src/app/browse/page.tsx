'use client'

import { useEffect, useState, useMemo } from 'react'
import { useStore, Movie } from '@/lib/store'
import { fetchMovies } from '@/lib/api'
import HeroBanner from '@/components/HeroBanner'
import MovieRow from '@/components/MovieRow'
import LoadingSkeleton from '@/components/LoadingSkeleton'

export default function BrowsePage() {
  const { movies, setMovies, myList } = useStore()
  const [loading, setLoading] = useState(movies.length === 0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (movies.length > 0) return
    const load = async () => {
      try {
        const data = await fetchMovies()
        setMovies(data)
      } catch (e: any) {
        setError('Could not connect to server. Make sure the backend is running on port 3001.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [movies.length, setMovies])

  // Pick a random hero movie (prefer ones with backdrop)
  const heroMovie = useMemo(() => {
    const withBackdrop = movies.filter((m) => m.metadata?.backdrop_path)
    if (withBackdrop.length === 0) return movies[0]
    return withBackdrop[Math.floor(Math.random() * withBackdrop.length)]
  }, [movies])

  // Categorize movies into rows
  const rows = useMemo(() => {
    if (movies.length === 0) return []

    const myListMovies = movies.filter((m) => myList.includes(m.id))

    const byGenre: Record<string, Movie[]> = {}
    movies.forEach((m) => {
      m.metadata?.genres?.forEach((g) => {
        if (!byGenre[g.name]) byGenre[g.name] = []
        byGenre[g.name].push(m)
      })
    })

    const rows = [
      { title: 'Continue Watching', movies: movies.slice(0, 8) },
      { title: 'Popular on Netflix', movies: [...movies].sort((a, b) => (b.metadata?.vote_average || 0) - (a.metadata?.vote_average || 0)).slice(0, 15) },
      { title: 'New Releases', movies: [...movies].sort((a, b) => (b.metadata?.release_date || '').localeCompare(a.metadata?.release_date || '')).slice(0, 15) },
    ]

    if (myListMovies.length > 0) {
      rows.splice(1, 0, { title: 'My List', movies: myListMovies })
    }

    // Add genre rows
    Object.entries(byGenre)
      .filter(([, films]) => films.length >= 2)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 6)
      .forEach(([genre, films]) => {
        rows.push({ title: genre, movies: films })
      })

    return rows
  }, [movies, myList])

  if (loading) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-netflix-red text-6xl mb-4">⚠</div>
          <h2 className="text-white text-2xl font-semibold mb-3">Server Not Running</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <code className="bg-zinc-800 text-green-400 px-4 py-2 rounded text-sm block">
            npm run dev:server
          </code>
        </div>
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-2xl font-semibold mb-3">No Movies Found</h2>
          <p className="text-gray-400">Make sure your movies are in <code className="text-green-400">D:/movies</code></p>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-20">
      {heroMovie && <HeroBanner movie={heroMovie} />}
      <div className="-mt-16 relative z-10">
        {rows.map((row) => (
          <MovieRow key={row.title} title={row.title} movies={row.movies} />
        ))}
      </div>
    </div>
  )
}
