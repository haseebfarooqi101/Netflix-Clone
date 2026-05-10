// Run this once to generate a placeholder image
// node scripts/generate-placeholder.js
const fs = require('fs')
const path = require('path')

// Create a simple SVG placeholder
const svg = `<svg width="500" height="281" xmlns="http://www.w3.org/2000/svg">
  <rect width="500" height="281" fill="#1a1a1a"/>
  <text x="250" y="140" font-family="Arial" font-size="24" fill="#555" text-anchor="middle">No Image</text>
</svg>`

fs.writeFileSync(path.join(__dirname, '../public/placeholder.svg'), svg)
console.log('Placeholder created at public/placeholder.svg')
