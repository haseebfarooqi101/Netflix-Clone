const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const { parseMovieName } = require('../utils/parser')
const { getMovieMetadata, searchMovie } = require('../utils/tmdb')
const NodeCache = require('node-cache')

const cache = new NodeCache({ stdTTL: 3600 })

const MOVIES_DIR = process.env.MOVIES_DIR || 'D:/movies'

// GET /api/movies - list all movies with metadata
router.get('/', async (req, res) => {
  try {
    const cached = cache.get('all_movies')
    if (cached) return res.json(cached)

    if (!fs.existsSync(MOVIES_DIR)) {
      return res.status(404).json({ error: `Movies directory not found: ${MOVIES_DIR}` })
    }

    const entries = fs.readdirSync(MOVIES_DIR, { withFileTypes: true })
    const folders = entries.filter(e => e.isDirectory())

    const movies = []

    for (const folder of folders) {
      const folderPath = path.join(MOVIES_DIR, folder.name)
      const parsed = parseMovieName(folder.name)

      // Find MKV file inside folder
      let mkvFile = null
      try {
        const files = fs.readdirSync(folderPath)
        mkvFile = files.find(f => f.endsWith('.mkv') || f.endsWith('.mp4') || f.endsWith('.avi'))
      } catch (e) {}

      if (!mkvFile && !parsed.title) continue

      // Fetch TMDB metadata
      let metadata = null
      try {
        metadata = await searchMovie(parsed.title, parsed.year)
      } catch (e) {
        console.error(`Failed to fetch metadata for ${parsed.title}:`, e.message)
      }

      movies.push({
        id: metadata?.id || folder.name,
        folderName: folder.name,
        filePath: mkvFile ? path.join(folderPath, mkvFile) : null,
        fileName: mkvFile,
        parsed,
        metadata: metadata || {
          title: parsed.title,
          year: parsed.year,
          poster_path: null,
          backdrop_path: null,
          overview: '',
          vote_average: 0,
          genres: [],
        },
      })
    }

    // Also check for loose MKV files in root
    const rootFiles = fs.readdirSync(MOVIES_DIR, { withFileTypes: true })
    for (const file of rootFiles) {
      if (file.isFile() && (file.name.endsWith('.mkv') || file.name.endsWith('.mp4'))) {
        const parsed = parseMovieName(file.name.replace(/\.(mkv|mp4|avi)$/, ''))
        let metadata = null
        try {
          metadata = await searchMovie(parsed.title, parsed.year)
        } catch (e) {}

        movies.push({
          id: metadata?.id || file.name,
          folderName: file.name,
          filePath: path.join(MOVIES_DIR, file.name),
          fileName: file.name,
          parsed,
          metadata: metadata || {
            title: parsed.title,
            year: parsed.year,
            poster_path: null,
            backdrop_path: null,
            overview: '',
            vote_average: 0,
            genres: [],
          },
        })
      }
    }

    cache.set('all_movies', movies)
    res.json(movies)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/movies/:id - single movie details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const cacheKey = `movie_${id}`
    const cached = cache.get(cacheKey)
    if (cached) return res.json(cached)

    const details = await getMovieMetadata(id)
    cache.set(cacheKey, details)
    res.json(details)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE cache
router.delete('/cache', (req, res) => {
  cache.flushAll()
  res.json({ message: 'Cache cleared' })
})

module.exports = router
