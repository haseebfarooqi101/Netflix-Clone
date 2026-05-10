'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useStore } from '@/lib/store'
import {
  fetchMovieDetails,
  fetchMovieVideos,
  fetchSimilarMovies,
  fetchMovieCredits,
  tmdbImage,
  formatRuntime,
  formatYear,
  getStreamUrl,
} from '@/lib/api'
import {
  PlayIcon,
  PlusIcon,
  CheckIcon,
  ThumbsUpIcon,
  XIcon,
  VolumeXIcon,
  Volume2Icon,
} from 'lucide-react'
import MovieCard from '@/components/MovieCard'

export default function MovieDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { movies, myList, toggleMyList, isMuted, setMuted } = useStore()
  const [details, setDetails] = useState<any>(null)
  const [trailerKey, setTrailerKey] = useState<string | null>(null)
  const [credits, setCredits] = useState<any>(null)
  const [similar, setSimilar] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showTrailer, setShowTrailer] = useState(false)

  const id = params.id as string

  // Find local movie
  const localMovie = movies.find(
    (m) => String(m.id) === id || String(m.metadata?.id) === id
  )

  useEffect(() => {
    const load = async () => {
      try {
        const [det, vids, cred, sim] = await Promise.all([
          fetchMovieDetails(id),
          fetchMovieVideos(id),
          fetchMovieCredits(id),
          fetchSimilarMovies(id),
        ])
        setDetails(det)
        setTrailerKey(vids.trailer?.key || null)
        setCredits(cred)
        setSimilar(sim.slice(0, 12))

        // Auto-show trailer after 1s
        if (vids.trailer?.key) {
          setTimeout(() => setShowTrailer(true), 1000)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handlePlay = () => {
    if (localMovie) {
      router.push(`/watch/${encodeURIComponent(localMovie.id)}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const movie = details || localMovie?.metadata
  if (!movie) return null

  const backdropUrl = tmdbImage(movie.backdrop_path, 'original')
  const posterUrl = tmdbImage(movie.poster_path, 'w500')
  const title = movie.title || movie.name || ''
  const year = formatYear(movie.release_date || '')
  const runtime = movie.runtime ? formatRuntime(movie.runtime) : ''
  const genres = movie.genres?.map((g: any) => g.name) || []
  const cast = credits?.cast?.slice(0, 6).map((c: any) => c.name).join(', ') || ''
  const directors = credits?.crew?.filter((c: any) => c.job === 'Director').map((c: any) => c.name).join(', ') || ''
  const inMyList = myList.includes(id) || (localMovie && myList.includes(localMovie.id))

  // Match similar to local movies
  const similarWithLocal = similar.map((s) => {
    const local = movies.find((m) => String(m.metadata?.id) === String(s.id))
    return local || {
      id: s.id,
      folderName: '',
      filePath: '',
      fileName: '',
      parsed: { title: s.title, year: formatYear(s.release_date) },
      metadata: s,
    }
  })

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Hero */}
      <div className="relative w-full aspect-video max-h-[70vh] overflow-hidden">
        {showTrailer && trailerKey ? (
          <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`}
            className="w-full h-full scale-[1.2]"
            allow="autoplay; encrypted-media"
            style={{ border: 'none', pointerEvents: 'none' }}
          />
        ) : (
          <Image
            src={backdropUrl}
            alt={title}
            fill
            className="object-cover object-top"
            unoptimized
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-black/30" />

        {/* Close button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 right-4 w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors z-10"
        >
          <XIcon className="w-5 h-5 text-white" />
        </button>

        {/* Mute */}
        {showTrailer && (
          <button
            onClick={() => setMuted(!isMuted)}
            className="absolute bottom-6 right-6 w-10 h-10 rounded-full border-2 border-white/60 flex items-center justify-center bg-black/40 hover:bg-black/70 transition-colors z-10"
          >
            {isMuted ? <VolumeXIcon className="w-5 h-5 text-white" /> : <Volume2Icon className="w-5 h-5 text-white" />}
          </button>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-8 left-8 z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-4">{title}</h1>
          <div className="flex items-center gap-3">
            {localMovie?.filePath && (
              <button onClick={handlePlay} className="btn-netflix-primary px-8 py-3 text-base">
                <PlayIcon className="w-5 h-5 fill-black" />
                Play
              </button>
            )}
            <button
              onClick={() => toggleMyList(localMovie?.id || id)}
              className="w-12 h-12 border-2 border-white/60 rounded-full flex items-center justify-center hover:border-white bg-black/40 transition-colors"
            >
              {inMyList ? <CheckIcon className="w-5 h-5 text-white" /> : <PlusIcon className="w-5 h-5 text-white" />}
            </button>
            <button className="w-12 h-12 border-2 border-white/60 rounded-full flex items-center justify-center hover:border-white bg-black/40 transition-colors">
              <ThumbsUpIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="px-6 md:px-12 py-8 grid md:grid-cols-3 gap-8">
        {/* Left col */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 text-sm mb-4 flex-wrap">
            {movie.vote_average > 0 && (
              <span className="text-green-400 font-semibold">
                {(movie.vote_average * 10).toFixed(0)}% Match
              </span>
            )}
            {year && <span className="text-gray-300">{year}</span>}
            {runtime && <span className="text-gray-300">{runtime}</span>}
            <span className="maturity-badge text-gray-300">HD</span>
            {movie.tagline && (
              <span className="text-gray-400 italic">"{movie.tagline}"</span>
            )}
          </div>
          <p className="text-gray-200 text-base leading-relaxed">{movie.overview}</p>
        </div>

        {/* Right col */}
        <div className="space-y-3 text-sm">
          {cast && (
            <p className="text-gray-400">
              <span className="text-gray-500">Cast: </span>
              <span className="text-gray-200">{cast}</span>
            </p>
          )}
          {directors && (
            <p className="text-gray-400">
              <span className="text-gray-500">Director: </span>
              <span className="text-gray-200">{directors}</span>
            </p>
          )}
          {genres.length > 0 && (
            <p className="text-gray-400">
              <span className="text-gray-500">Genres: </span>
              <span className="text-gray-200">{genres.join(', ')}</span>
            </p>
          )}
          {movie.status && (
            <p className="text-gray-400">
              <span className="text-gray-500">Status: </span>
              <span className="text-gray-200">{movie.status}</span>
            </p>
          )}
        </div>
      </div>

      {/* Similar titles */}
      {similarWithLocal.length > 0 && (
        <div className="px-6 md:px-12 pb-12">
          <h3 className="text-white text-xl font-semibold mb-4">More Like This</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {similarWithLocal.map((m: any) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
