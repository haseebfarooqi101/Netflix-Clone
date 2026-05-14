require('dotenv').config({ path: '.env.local' })
const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

const moviesRouter = require('./routes/movies')
const streamRouter = require('./routes/stream')
const metadataRouter = require('./routes/metadata')

const app = express()
const PORT = process.env.SERVER_PORT || 3001

app.use(cors({ origin: [process.env.VERCEL_FRONTEND_URL, 'http://localhost:3000'] }));
app.use(express.json())

app.use('/api/movies', moviesRouter)
app.use('/api/stream', streamRouter)
app.use('/api/metadata', metadataRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', moviesDir: process.env.MOVIES_DIR })
})

app.listen(PORT, () => {
  console.log(`🎬 Netflix Clone Server running on http://localhost:${PORT}`)
  console.log(`📁 Movies directory: ${process.env.MOVIES_DIR}`)
})
