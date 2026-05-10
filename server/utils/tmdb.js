const axios = require('axios')

const BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3'
const API_KEY = process.env.TMDB_API_KEY

const tmdb = axios.create({
  baseURL: BASE_URL,
  params: { api_key: API_KEY },
  timeout: 10000,
})

async function searchMovie(title, year) {
  const params = { query: title, language: 'en-US', page: 1 }
  if (year) params.year = year

  const res = await tmdb.get('/search/movie', { params })
  const results = res.data.results

  if (!results || results.length === 0) return null

  // Pick best match: prefer exact title + year match
  let best = results[0]
  if (year) {
    const exact = results.find(
      r => r.release_date?.startsWith(year) &&
        r.title?.toLowerCase() === title.toLowerCase()
    )
    if (exact) best = exact
  }

  return best
}

async function getMovieMetadata(tmdbId) {
  const res = await tmdb.get(`/movie/${tmdbId}`, {
    params: { language: 'en-US', append_to_response: 'videos,credits,similar,images' },
  })
  return res.data
}

async function getMovieVideos(tmdbId) {
  const res = await tmdb.get(`/movie/${tmdbId}/videos`, {
    params: { language: 'en-US' },
  })
  const results = res.data.results || []
  // Prefer official trailers
  const trailer =
    results.find(v => v.type === 'Trailer' && v.official && v.site === 'YouTube') ||
    results.find(v => v.type === 'Trailer' && v.site === 'YouTube') ||
    results.find(v => v.site === 'YouTube') ||
    null

  return { results, trailer }
}

async function getSimilarMovies(tmdbId) {
  const res = await tmdb.get(`/movie/${tmdbId}/similar`, {
    params: { language: 'en-US', page: 1 },
  })
  return res.data.results || []
}

async function getMovieCredits(tmdbId) {
  const res = await tmdb.get(`/movie/${tmdbId}/credits`, {
    params: { language: 'en-US' },
  })
  return res.data
}

async function getTrending() {
  const res = await tmdb.get('/trending/movie/week', {
    params: { language: 'en-US' },
  })
  return res.data.results || []
}

module.exports = {
  searchMovie,
  getMovieMetadata,
  getMovieVideos,
  getSimilarMovies,
  getMovieCredits,
  getTrending,
}
