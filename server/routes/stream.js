const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const mime = require('mime-types')

// GET /api/stream?path=...  - stream MKV file with range support
router.get('/', (req, res) => {
  const filePath = req.query.path

  if (!filePath) {
    return res.status(400).json({ error: 'No file path provided' })
  }

  // Security: ensure path is within MOVIES_DIR
  const moviesDir = path.resolve(process.env.MOVIES_DIR || 'D:/movies')
  const resolvedPath = path.resolve(filePath)

  if (!resolvedPath.startsWith(moviesDir)) {
    return res.status(403).json({ error: 'Access denied' })
  }

  if (!fs.existsSync(resolvedPath)) {
    return res.status(404).json({ error: 'File not found' })
  }

  const stat = fs.statSync(resolvedPath)
  const fileSize = stat.size
  const mimeType = mime.lookup(resolvedPath) || 'video/x-matroska'

  const range = req.headers.range

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-')
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
    const chunkSize = end - start + 1

    const file = fs.createReadStream(resolvedPath, { start, end })

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': mimeType,
    })

    file.pipe(res)
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': mimeType,
      'Accept-Ranges': 'bytes',
    })
    fs.createReadStream(resolvedPath).pipe(res)
  }
})

module.exports = router
