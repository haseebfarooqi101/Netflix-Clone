import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
})

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export const tmdbImage = (path: string | null, size = 'w500') => {
  if (!path) return '/placeholder.svg'
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

export const getStreamUrl = (filePath: string) => {
  return `${API_URL}/api/stream?path=${encodeURIComponent(filePath)}`
}

export async function fetchMovies() {
  const res = await api.get('/api/movies')
  return res.data
}

export async function fetchMovieDetails(tmdbId: string | number) {
  const res = await api.get(`/api/metadata/${tmdbId}`)
  return res.data
}

export async function fetchMovieVideos(tmdbId: string | number) {
  const res = await api.get(`/api/metadata/${tmdbId}/videos`)
  return res.data
}

export async function fetchSimilarMovies(tmdbId: string | number) {
  const res = await api.get(`/api/metadata/${tmdbId}/similar`)
  return res.data
}

export async function fetchMovieCredits(tmdbId: string | number) {
  const res = await api.get(`/api/metadata/${tmdbId}/credits`)
  return res.data
}

export function getYouTubeEmbedUrl(key: string, muted = true) {
  return `https://www.youtube.com/embed/${key}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&enablejsapi=1`
}

export function getYouTubeTrailerUrl(key: string) {
  return `https://www.youtube.com/embed/${key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${key}&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&enablejsapi=1`
}

export function formatRuntime(minutes: number) {
  if (!minutes) return ''
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function formatYear(dateStr: string) {
  if (!dateStr) return ''
  return dateStr.substring(0, 4)
}

export function getMaturityRating(voteAverage: number) {
  if (voteAverage >= 8) return 'TV-MA'
  if (voteAverage >= 6) return 'TV-14'
  return 'PG-13'
}
