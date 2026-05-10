const express = require('express')
const router = express.Router()
const { searchMovie, getMovieMetadata, getMovieVideos, getSimilarMovies, getMovieCredits } = require('../utils/tmdb')
const NodeCache = require('node-cache')

const cache = new NodeCache({ stdTTL: 86400 }) // 24h cache

// GET /api/metadata/search?title=...&year=...
router.get('/search', async (req, res) => {
  try {
    const { title, year } = req.query
    if (!title) return res.status(400).json({ error: 'title is required' })

    const cacheKey = `search_${title}_${year}`
    const cached = cache.get(cacheKey)
    if (cached) return res.json(cached)

    const result = await searchMovie(title, year)
    cache.set(cacheKey, result)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/metadata/:tmdbId - full details
router.get('/:tmdbId', async (req, res) => {
  try {
    const { tmdbId } = req.params
    const cacheKey = `meta_${tmdbId}`
    const cached = cache.get(cacheKey)
    if (cached) return res.json(cached)

    const result = await getMovieMetadata(tmdbId)
    cache.set(cacheKey, result)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/metadata/:tmdbId/videos - trailers
router.get('/:tmdbId/videos', async (req, res) => {
  try {
    const { tmdbId } = req.params
    const cacheKey = `videos_${tmdbId}`
    const cached = cache.get(cacheKey)
    if (cached) return res.json(cached)

    const result = await getMovieVideos(tmdbId)
    cache.set(cacheKey, result)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/metadata/:tmdbId/similar
router.get('/:tmdbId/similar', async (req, res) => {
  try {
    const { tmdbId } = req.params
    const cacheKey = `similar_${tmdbId}`
    const cached = cache.get(cacheKey)
    if (cached) return res.json(cached)

    const result = await getSimilarMovies(tmdbId)
    cache.set(cacheKey, result)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/metadata/:tmdbId/credits
router.get('/:tmdbId/credits', async (req, res) => {
  try {
    const { tmdbId } = req.params
    const cacheKey = `credits_${tmdbId}`
    const cached = cache.get(cacheKey)
    if (cached) return res.json(cached)

    const result = await getMovieCredits(tmdbId)
    cache.set(cacheKey, result)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
