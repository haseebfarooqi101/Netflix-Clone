'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Movie, useStore } from '@/lib/store'
import { tmdbImage, fetchMovieVideos, fetchMovieDetails, formatYear, formatRuntime } from '@/lib/api'
import {
  PlayIcon, PlusIcon, CheckIcon, ThumbsUpIcon,
  VolumeXIcon, Volume2Icon, XIcon, ChevronDownIcon,
} from 'lucide-react'

interface MovieCardProps {
  movie: Movie
}

export default function MovieCard({ movie }: MovieCardProps) {
  const router = useRouter()
  const { movies: allMovies, myList, toggleMyList, isMuted, setMuted } = useStore()

  const [hovered, setHovered] = useState(false)
  const [trailerKey, setTrailerKey] = useState<string | null>(null)
  const [showVideo, setShowVideo] = useState(false)
  const [showMoreInfo, setShowMoreInfo] = useState(false)
  const [moreInfoData, setMoreInfoData] = useState<any>(null)
  const [portalPos, setPortalPos] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)

  const hoverTimer = useRef<NodeJS.Timeout>()
  const videoTimer = useRef<NodeJS.Timeout>()
  const cardRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  const inMyList = myList.includes(movie.id)
  const title = movie.metadata?.title || movie.parsed?.title || 'Unknown'
  const backdropUrl = tmdbImage(movie.metadata?.backdrop_path, 'w780')
  const posterUrl = tmdbImage(movie.metadata?.poster_path, 'w342')
  const year = formatYear(movie.metadata?.release_date || '')
  const runtime = movie.metadata?.runtime ? formatRuntime(movie.metadata.runtime) : ''
  const match = movie.metadata?.vote_average
    ? `${(movie.metadata.vote_average * 10).toFixed(0)}% Match`
    : ''
  const genres = movie.metadata?.genres?.slice(0, 3).map((g) => g.name) || []
  const description = movie.metadata?.overview || ''
  const imgSrc = backdropUrl !== '/placeholder.svg' ? backdropUrl : posterUrl

  const localMovie = allMovies.find(
    (m) =>
      m.filePath &&
      (String(m.id) === String(movie.id) ||
        String(m.metadata?.id) === String(movie.metadata?.id) ||
        String(m.metadata?.id) === String(movie.id))
  )
  const hasLocalFile = !!(localMovie?.filePath || movie.filePath)

  const updatePortalPos = () => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const isMobile = window.innerWidth < 640
    const panelW = isMobile ? Math.min(window.innerWidth - 24, 320) : 320
    const scrollY = window.scrollY

    let left = rect.left + rect.width / 2 - panelW / 2
    if (left < 12) left = 12
    if (left + panelW > window.innerWidth - 12) left = window.innerWidth - panelW - 12

    const cardCenterY = rect.top + rect.height / 2 + scrollY
    const panelH = isMobile ? 300 : 380
    let top = cardCenterY - panelH / 2
    if (top - scrollY < 70) top = scrollY + 70

    setPortalPos({ top, left })
  }

  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(async () => {
      updatePortalPos()
      setHovered(true)
      const tmdbId = movie.metadata?.id
      if (tmdbId && !trailerKey) {
        try {
          const data = await fetchMovieVideos(tmdbId)
          if (data.trailer?.key) {
            setTrailerKey(data.trailer.key)
            videoTimer.current = setTimeout(() => setShowVideo(true), 600)
          }
        } catch {}
      } else if (trailerKey) {
        videoTimer.current = setTimeout(() => setShowVideo(true), 600)
      }
    }, 500)
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    // Don't close if mouse moves into the portal panel
    const related = e.relatedTarget as Node | null
    if (panelRef.current && related && panelRef.current.contains(related)) return
    clearTimeout(hoverTimer.current)
    clearTimeout(videoTimer.current)
    setHovered(false)
    setShowVideo(false)
  }

  const handlePanelMouseLeave = () => {
    clearTimeout(hoverTimer.current)
    clearTimeout(videoTimer.current)
    setHovered(false)
    setShowVideo(false)
  }

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    const playId = localMovie?.id ?? movie.id
    router.push(`/watch/${encodeURIComponent(String(playId))}`)
  }

  const handleMoreInfo = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMoreInfo(true)
    setHovered(false)
    clearTimeout(hoverTimer.current)
    clearTimeout(videoTimer.current)
    if (!moreInfoData && movie.metadata?.id) {
      try {
        const details = await fetchMovieDetails(movie.metadata.id)
        setMoreInfoData(details)
      } catch {
        setMoreInfoData(movie.metadata)
      }
    } else if (!moreInfoData) {
      setMoreInfoData(movie.metadata)
    }
  }

  const detail = moreInfoData || movie.metadata
  const detailGenres = detail?.genres?.map((g: any) => g.name) || genres
  const detailRuntime = detail?.runtime ? formatRuntime(detail.runtime) : runtime
  const detailYear = formatYear(detail?.release_date || '')
  const detailOverview = detail?.overview || description
  const detailCast = detail?.credits?.cast?.slice(0, 5).map((c: any) => c.name).join(', ') || ''
  const detailDirector = detail?.credits?.crew?.find((c: any) => c.job === 'Director')?.name || ''

  // Portal hover panel — rendered into document.body so it NEVER affects layout
  const hoverPanel = hovered && mounted ? createPortal(
    <div
      ref={panelRef}
      onMouseLeave={handlePanelMouseLeave}
      style={{
        position: 'absolute',
        top: portalPos.top,
        left: portalPos.left,
        width: 320,
        zIndex: 9999,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#181818',
        boxShadow: '0 20px 40px rgba(0,0,0,0.85)',
        animation: 'hoverCardIn 0.2s cubic-bezier(0.4,0,0.2,1) forwards',
        pointerEvents: 'auto',
      }}
    >
      {/* Preview */}
      <div style={{ position: 'relative', height: 180, overflow: 'hidden', backgroundColor: '#232323' }}>
        {showVideo && trailerKey ? (
          <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`}
            style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none', transform: 'scale(1.2)' }}
            allow="autoplay; encrypted-media"
          />
        ) : (
          <Image src={imgSrc} alt={title} fill className="object-cover" unoptimized />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }} />

        {showVideo && (
          <button
            onClick={(e) => { e.stopPropagation(); setMuted(!isMuted) }}
            style={{
              position: 'absolute', bottom: 8, right: 8,
              width: 28, height: 28, borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 10,
            }}
          >
            {isMuted
              ? <VolumeXIcon style={{ width: 14, height: 14, color: 'white' }} />
              : <Volume2Icon style={{ width: 14, height: 14, color: 'white' }} />
            }
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Action buttons row — play, add, thumbsup | chevron-down */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Play */}
            {hasLocalFile ? (
              <button
                onClick={handlePlay}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  backgroundColor: '#fff', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title="Play"
              >
                <PlayIcon style={{ width: 18, height: 18, fill: '#000', color: '#000', marginLeft: 2 }} />
              </button>
            ) : (
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                backgroundColor: '#333',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'not-allowed',
              }}>
                <PlayIcon style={{ width: 18, height: 18, fill: '#666', color: '#666', marginLeft: 2 }} />
              </div>
            )}

            {/* Add to My List */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleMyList(movie.id) }}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                backgroundColor: 'transparent',
                border: '2px solid rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff',
              }}
              title={inMyList ? 'Remove from My List' : 'Add to My List'}
            >
              {inMyList
                ? <CheckIcon style={{ width: 16, height: 16 }} />
                : <PlusIcon style={{ width: 16, height: 16 }} />
              }
            </button>

            {/* Thumbs up */}
            <button
              style={{
                width: 36, height: 36, borderRadius: '50%',
                backgroundColor: 'transparent',
                border: '2px solid rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff',
              }}
              title="Rate"
            >
              <ThumbsUpIcon style={{ width: 16, height: 16 }} />
            </button>
          </div>

          {/* Chevron-down = More Info (opens modal, no page navigation) */}
          <button
            onClick={handleMoreInfo}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              backgroundColor: 'transparent',
              border: '2px solid rgba(255,255,255,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff',
            }}
            title="More Info"
          >
            <ChevronDownIcon style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Metadata row: maturity + runtime + HD */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {match && <span style={{ color: '#46d369', fontSize: 12, fontWeight: 600 }}>{match}</span>}
          <span style={{
            border: '1px solid rgba(255,255,255,0.5)',
            color: 'rgba(255,255,255,0.8)',
            fontSize: 11, padding: '1px 5px', borderRadius: 3,
          }}>18+</span>
          {detailRuntime && <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{detailRuntime}</span>}
          <span style={{
            border: '1px solid rgba(255,255,255,0.35)',
            color: 'rgba(255,255,255,0.6)',
            fontSize: 10, padding: '0 4px', borderRadius: 2,
          }}>HD</span>
        </div>

        {/* Genre tags with dots */}
        {genres.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
            {genres.map((g, i) => (
              <span key={g} style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
                {g}
                {i < genres.length - 1 && (
                  <span style={{ color: 'rgba(255,255,255,0.3)', margin: '0 4px' }}>•</span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  ) : null

  return (
    <>
      {/* ── Base card — responsive size ── */}
      <div
        ref={cardRef}
        style={{
          width: 'clamp(140px, 15vw, 220px)',
          height: 'clamp(79px, 8.4vw, 124px)',
          flexShrink: 0,
          position: 'relative',
          cursor: 'pointer',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          style={{
            width: '100%', height: '100%',
            borderRadius: 6,
            overflow: 'hidden',
            backgroundColor: '#181818',
            boxShadow: hovered ? '0 20px 40px rgba(0,0,0,0.85)' : '0 8px 24px rgba(0,0,0,0.55)',
            transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s ease',
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
            position: 'relative',
            zIndex: hovered ? 10 : 1,
          }}
        >
          <Image
            src={imgSrc}
            alt={title}
            fill
            className="object-cover"
            style={{
              transition: 'filter 0.3s ease',
              filter: hovered ? 'brightness(1.1)' : 'brightness(1)',
            }}
            unoptimized
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)' }} />
          {!movie.metadata?.backdrop_path && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8 }}>
              <p style={{ color: '#fff', fontSize: 12, fontWeight: 600, margin: 0,
                overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {title}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Portal panel — lives in document.body, zero layout impact */}
      {hoverPanel}

      {/* ── More Info Modal ── */}
      {showMoreInfo && mounted && createPortal(
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setShowMoreInfo(false)}
        >
          <div
            style={{
              position: 'relative', width: '100%', maxWidth: 680,
              borderRadius: 12, overflow: 'hidden',
              backgroundColor: '#181818',
              boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hero */}
            <div style={{ position: 'relative', height: 300, overflow: 'hidden' }}>
              {trailerKey ? (
                <iframe
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0`}
                  style={{ width: '100%', height: '100%', border: 'none', transform: 'scale(1.15)' }}
                  allow="autoplay; encrypted-media"
                />
              ) : (
                <Image
                  src={tmdbImage(detail?.backdrop_path, 'original') !== '/placeholder.svg'
                    ? tmdbImage(detail?.backdrop_path, 'original') : imgSrc}
                  alt={title} fill className="object-cover" unoptimized
                />
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #181818 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }} />

              <button
                onClick={() => setShowMoreInfo(false)}
                style={{
                  position: 'absolute', top: 12, right: 12,
                  width: 36, height: 36, borderRadius: '50%',
                  backgroundColor: '#181818', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', zIndex: 10,
                }}
              >
                <XIcon style={{ width: 20, height: 20, color: '#fff' }} />
              </button>

              <div style={{ position: 'absolute', bottom: 20, left: 24 }}>
                <h2 style={{ color: '#fff', fontSize: 28, fontWeight: 700, margin: 0 }}>{title}</h2>
              </div>
            </div>

            {/* Detail body */}
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {match && <span style={{ color: '#46d369', fontWeight: 600, fontSize: 14 }}>{match}</span>}
                {detailYear && <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{detailYear}</span>}
                {detailRuntime && <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{detailRuntime}</span>}
                <span style={{ border: '1px solid rgba(255,255,255,0.35)', color: 'rgba(255,255,255,0.6)', fontSize: 11, padding: '1px 6px', borderRadius: 3 }}>HD</span>
              </div>

            {/* Two-column on desktop, single on mobile */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'var(--modal-cols, 2fr 1fr)',
                gap: 24,
              }}
                className="modal-grid"
              >
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{detailOverview}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                  {detailCast && <p style={{ margin: 0 }}><span style={{ color: 'rgba(255,255,255,0.4)' }}>Cast: </span><span style={{ color: 'rgba(255,255,255,0.8)' }}>{detailCast}</span></p>}
                  {detailDirector && <p style={{ margin: 0 }}><span style={{ color: 'rgba(255,255,255,0.4)' }}>Director: </span><span style={{ color: 'rgba(255,255,255,0.8)' }}>{detailDirector}</span></p>}
                  {detailGenres.length > 0 && <p style={{ margin: 0 }}><span style={{ color: 'rgba(255,255,255,0.4)' }}>Genres: </span><span style={{ color: 'rgba(255,255,255,0.8)' }}>{detailGenres.join(', ')}</span></p>}
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {detailGenres.map((g: string) => (
                  <span key={g} style={{ borderRadius: 999, border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px 12px', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{g}</span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
                {hasLocalFile ? (
                  <button onClick={handlePlay} style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: 6, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                    <PlayIcon style={{ width: 18, height: 18, fill: '#000' }} /> Play
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: '#333', color: '#666', borderRadius: 6, padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'not-allowed' }}>
                    <PlayIcon style={{ width: 18, height: 18, fill: '#666' }} /> Not in Library
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleMyList(movie.id) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 6, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  {inMyList ? <CheckIcon style={{ width: 16, height: 16 }} /> : <PlusIcon style={{ width: 16, height: 16 }} />}
                  {inMyList ? 'In My List' : 'My List'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
