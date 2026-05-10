/**
 * Parses a movie folder/file name into title + year
 * Handles formats like:
 *   "Interstellar (2014) [2160p] [4K] [BluRay] [5.1] [YTS.MX]"
 *   "Spider-Man.Into.the.Spider-Verse.2018.2160p"
 *   "The.Dark.Knight.2008.BluRay"
 */
function parseMovieName(name) {
  // Remove file extension
  let cleaned = name.replace(/\.(mkv|mp4|avi|mov)$/i, '')

  // Try to extract year (4-digit number between 1900-2099)
  const yearMatch = cleaned.match(/\b(19\d{2}|20\d{2})\b/)
  const year = yearMatch ? yearMatch[1] : null

  // Remove everything from year onwards (quality tags, etc.)
  let title = cleaned
  if (year) {
    const idx = cleaned.indexOf(year)
    title = cleaned.substring(0, idx)
  }

  // Remove common quality/source tags
  title = title
    .replace(/\b(2160p|1080p|720p|480p|4K|UHD|BluRay|BDRip|WEBRip|WEB-DL|HDTV|DVDRip|PROPER|REPACK|EXTENDED|THEATRICAL|DIRECTORS\.CUT)\b/gi, '')
    .replace(/\b(x264|x265|HEVC|AVC|H\.264|H\.265|DTS|AAC|AC3|DDP5\.1|Atmos|TrueHD|HDR|SDR|10bit|8bit)\b/gi, '')
    .replace(/\[.*?\]/g, '')   // remove [anything]
    .replace(/\(.*?\)/g, '')   // remove (anything) except year already handled
    .replace(/\./g, ' ')       // dots to spaces
    .replace(/_/g, ' ')        // underscores to spaces
    .replace(/\s+/g, ' ')      // collapse spaces
    .trim()

  // Capitalize each word
  title = title
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')

  // Fix common articles/prepositions that should be lowercase (optional)
  title = title
    .replace(/\b(A|An|The|And|But|Or|For|Nor|On|At|To|By|In|Of|Up|As)\b/g, w => w.toLowerCase())
    .replace(/^./, c => c.toUpperCase()) // always capitalize first word

  return { title, year }
}

module.exports = { parseMovieName }
