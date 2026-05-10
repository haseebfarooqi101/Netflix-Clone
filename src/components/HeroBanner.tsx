'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Movie, useStore } from '@/lib/store'
import { tmdbImage, fetchMovieVideos, fetchMovieDetails, fetchMovieCredits, formatRuntime, formatYear } from '@/lib/api'
import { PlayIcon, InfoIcon, VolumeXIcon, Volume2Icon, XIcon, PlusIcon, CheckIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface HeroBannerProps {
  movie: Movie
}

export default function HeroBanner({ movie }: HeroBannerProps) {
  const router = useRouter()
  const { isMuted, setMuted, myList, toggleMyList } = useStore()
  const [trailerKey, setTrailerKey] = useState<string | null>(null)
  const [showTrailer, setShowTrailer] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalData, setModalData] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const timerRef = useRef<NodeJS.Timeout>()

  const tmdbId = movie.metadata?.id
  const inMyList = myList.includes(movie.id)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    setShowTrailer(false)
    setTrailerKey(null)
    if (!tmdbId) return
    timerRef.current = setTimeout(async () => {
      try {
        const data = await fetchMovieVideos(tmdbId)
        if (data.trailer?.key) {
          setTrailerKey(data.trailer.key)
          setShowTrailer(true)
        }
      } catch {}
    }, 3000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [tmdbId])

  const handlePlay = () => {
    if (movie.filePath) router.push(`/watch/${encodeURIComponent(movie.id)}`)
  }

  const handleMoreInfo = async () => {
    setShowModal(true)
    if (!modalData && tmdbId) {
      try {
        const [details, credits] = await Promise.all([
          fetchMovieDetails(tmdbId),
          fetchMovieCredits(tmdbId),
        ])
        setModalData({ ...details, credits })
      } catch {
        setModalData(movie.metadata)
      }
    } else if (!modalData) {
      setModalData(movie.metadata)
    }
  }

  const backdropUrl = tmdbImage(movie.metadata?.backdrop_path, 'original')
  const title = movie.metadata?.title || movie.parsed?.title || 'Unknown'
  const overview = movie.metadata?.overview || ''
  const year = formatYear(movie.metadata?.release_date || '')
  const runtime = movie.metadata?.runtime ? formatRuntime(movie.metadata.runtime) : ''
  const rating = movie.metadata?.vote_average ? movie.metadata.vote_average.toFixed(1) : ''
  const match = movie.metadata?.vote_average
    ? `${(movie.metadata.vote_average * 10).toFixed(0)}% Match` : ''

  const detail = modalData || movie.metadata
  const detailGenres = detail?.genres?.map((g: any) => g.name) || []
  const detailRuntime = detail?.runtime ? formatRuntime(detail.runtime) : runtime
  const detailYear = formatYear(detail?.release_date || '')
  const detailOverview = detail?.overview || overview
  const detailCast = detail?.credits?.cast?.slice(0, 6).map((c: any) => c.name).join(', ') || ''
  const detailDirector = detail?.credits?.crew?.find((c: any) => c.job === 'Director')?.name || ''

  return (
    <>
      <div className="relative w-full h-[56vw] min-h-[400px] max-h-[800px] overflow-hidden">
        {/* Backdrop */}
        <div className="absolute inset-0">
          <Image
            src={backdropUrl}
            alt={title}
            fill
            className={`object-cover object-top transition-opacity duration-1000 ${showTrailer ? 'opacity-0' : 'opacity-100'}`}
            priority
            unoptimized
          />
        </div>

        {/* Trailer iframe — looping */}
        {trailerKey && (
          <div className={`absolute inset-0 transition-opacity duration-1000 ${showTrailer ? 'opacity-100' : 'opacity-0'}`}>
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${trailerKey}&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
              className="w-full h-full scale-[1.3]"
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={{ border: 'none', pointerEvents: 'none' }}
            />
          </div>
        )}

        {/* Gradients */}
        <div className="absolute inset-0 hero-vignette" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-netflix-black to-transparent" />

        {/* Content */}
        <div className="absolute bottom-[20%] left-4 md:left-14 max-w-lg z-10">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg leading-tight">
            {title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-gray-300 mb-4">
            {rating && <span className="text-green-400 font-semibold">{rating} ★</span>}
            {year && <span>{year}</span>}
            {runtime && <span>{runtime}</span>}
            <span className="maturity-badge">HD</span>
          </div>
          <p className="text-sm md:text-base text-gray-200 line-clamp-3 mb-6 drop-shadow">
            {overview}
          </p>
          <div className="flex items-center gap-3">
            <button onClick={handlePlay} className="btn-netflix-primary text-base px-8 py-3">
              <PlayIcon className="w-5 h-5 fill-black" />
              Play
            </button>
            {/* More Info — opens inline modal, keeps InfoIcon */}
            <button onClick={handleMoreInfo} className="btn-netflix-secondary text-base px-6 py-3">
              <InfoIcon className="w-5 h-5" />
              More Info
            </button>
          </div>
        </div>

        {/* Mute + maturity */}
        <div className="absolute bottom-[22%] right-4 md:right-14 flex items-center gap-4 z-10">
          {showTrailer && (
            <button
              onClick={() => setMuted(!isMuted)}
              className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              {isMuted
                ? <VolumeXIcon className="w-5 h-5 text-white" />
                : <Volume2Icon className="w-5 h-5 text-white" />
              }
            </button>
          )}
          <span className="maturity-badge text-gray-300">18+</span>
        </div>
      </div>

      {/* ── More Info Modal — portal into body ── */}
      {showModal && mounted && createPortal(
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              position: 'relative', width: '100%', maxWidth: 720,
              borderRadius: 12, overflow: 'hidden',
              backgroundColor: '#181818',
              boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hero image / trailer */}
            <div style={{ position: 'relative', height: 340, overflow: 'hidden', flexShrink: 0 }}>
              {trailerKey ? (
                <iframe
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0`}
                  style={{ width: '100%', height: '100%', border: 'none', transform: 'scale(1.15)' }}
                  allow="autoplay; encrypted-media"
                />
              ) : (
                <Image
                  src={backdropUrl}
                  alt={title} fill className="object-cover object-top" unoptimized
                />
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #181818 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />

              {/* Close */}
              <button
                onClick={() => setShowModal(false)}
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

              {/* Title over hero */}
              <div style={{ position: 'absolute', bottom: 24, left: 28 }}>
                <h2 style={{ color: '#fff', fontSize: 32, fontWeight: 700, margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                  {title}
                </h2>
              </div>
            </div>

            {/* Detail body */}
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Meta row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {match && <span style={{ color: '#46d369', fontWeight: 700, fontSize: 15 }}>{match}</span>}
                {detailYear && <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{detailYear}</span>}
                {detailRuntime && <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{detailRuntime}</span>}
                <span style={{ border: '1px solid rgba(255,255,255,0.4)', color: 'rgba(255,255,255,0.7)', fontSize: 11, padding: '2px 6px', borderRadius: 3 }}>HD</span>
                <span style={{ border: '1px solid rgba(255,255,255,0.4)', color: 'rgba(255,255,255,0.7)', fontSize: 11, padding: '2px 6px', borderRadius: 3 }}>18+</span>
              </div>

              {/* Two-column: overview + cast/director */}
              <div className="modal-grid" style={{ display: 'grid', gap: 28 }}>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 1.75, margin: 0 }}>
                  {detailOverview}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                  {detailCast && (
                    <p style={{ margin: 0 }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>Cast: </span>
                      <span style={{ color: 'rgba(255,255,255,0.85)' }}>{detailCast}</span>
                    </p>
                  )}
                  {detailDirector && (
                    <p style={{ margin: 0 }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>Director: </span>
                      <span style={{ color: 'rgba(255,255,255,0.85)' }}>{detailDirector}</span>
                    </p>
                  )}
                  {detailGenres.length > 0 && (
                    <p style={{ margin: 0 }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>Genres: </span>
                      <span style={{ color: 'rgba(255,255,255,0.85)' }}>{detailGenres.join(', ')}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Genre pills */}
              {detailGenres.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {detailGenres.map((g: string) => (
                    <span key={g} style={{
                      borderRadius: 999, border: '1px solid rgba(255,255,255,0.12)',
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      padding: '4px 14px', fontSize: 12, color: 'rgba(255,255,255,0.75)',
                    }}>{g}</span>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4 }}>
                <button
                  onClick={handlePlay}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    backgroundColor: '#fff', color: '#000',
                    border: 'none', borderRadius: 6,
                    padding: '11px 28px', fontSize: 15, fontWeight: 700,
                    cursor: movie.filePath ? 'pointer' : 'not-allowed',
                    opacity: movie.filePath ? 1 : 0.5,
                  }}
                >
                  <PlayIcon style={{ width: 18, height: 18, fill: '#000' }} />
                  Play
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); toggleMyList(movie.id) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    color: '#fff', borderRadius: 6,
                    padding: '11px 24px', fontSize: 15, fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {inMyList
                    ? <><CheckIcon style={{ width: 18, height: 18 }} /> In My List</>
                    : <><PlusIcon style={{ width: 18, height: 18 }} /> My List</>
                  }
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
