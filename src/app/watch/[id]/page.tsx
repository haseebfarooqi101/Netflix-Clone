'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { getStreamUrl, tmdbImage, formatRuntime } from '@/lib/api'
import {
  PlayIcon, PauseIcon, Volume2Icon, VolumeXIcon, Volume1Icon,
  MaximizeIcon, MinimizeIcon, SkipForwardIcon, SkipBackIcon,
  ArrowLeftIcon, SettingsIcon, SubtitlesIcon, ChevronRightIcon,
  RotateCcwIcon, FastForwardIcon,
} from 'lucide-react'

// Player state machine per architecture doc
type PlayerState = 'idle' | 'playing' | 'paused' | 'buffering' | 'ended' | 'error'

export default function WatchPage() {
  const params = useParams()
  const router = useRouter()
  const { movies } = useStore()
  const id = decodeURIComponent(params.id as string)

  const movie = movies.find(
    (m) => String(m.id) === id || String(m.metadata?.id) === id
  )

  // ── Refs ──────────────────────────────────────────────────────────
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const controlsTimerRef = useRef<NodeJS.Timeout>()
  const hoverTimerRef = useRef<NodeJS.Timeout>()

  // ── State ─────────────────────────────────────────────────────────
  const [playerState, setPlayerState] = useState<PlayerState>('idle')
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSkipFeedback, setShowSkipFeedback] = useState<'forward' | 'back' | null>(null)
  const [subtitlesOn, setSubtitlesOn] = useState(false)
  const [hoverProgress, setHoverProgress] = useState<number | null>(null)
  const [hoverTime, setHoverTime] = useState('')
  const [showEndCard, setShowEndCard] = useState(false)

  const isPlaying = playerState === 'playing'
  const isBuffering = playerState === 'buffering'
  const streamUrl = movie?.filePath ? getStreamUrl(movie.filePath) : ''
  const title = movie?.metadata?.title || movie?.parsed?.title || 'Unknown'

  // ── Controls auto-hide (3s inactivity per spec) ───────────────────
  const resetControlsTimer = useCallback(() => {
    setShowControls(true)
    clearTimeout(controlsTimerRef.current)
    if (playerState === 'playing') {
      controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000)
    }
  }, [playerState])

  useEffect(() => {
    resetControlsTimer()
    return () => clearTimeout(controlsTimerRef.current)
  }, [playerState, resetControlsTimer])

  // ── Keyboard shortcuts ────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const video = videoRef.current
      if (!video) return
      switch (e.key) {
        case ' ': case 'k': e.preventDefault(); togglePlay(); break
        case 'ArrowRight': case 'l': e.preventDefault(); skip(10); break
        case 'ArrowLeft': case 'j': e.preventDefault(); skip(-10); break
        case 'ArrowUp': e.preventDefault(); setVolume(v => Math.min(1, v + 0.1)); break
        case 'ArrowDown': e.preventDefault(); setVolume(v => Math.max(0, v - 0.1)); break
        case 'm': e.preventDefault(); setMuted(m => !m); break
        case 'f': e.preventDefault(); toggleFullscreen(); break
        case 'Escape': if (!fullscreen) router.back(); break
      }
      resetControlsTimer()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [fullscreen, resetControlsTimer])

  // ── Fullscreen listener ───────────────────────────────────────────
  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  // ── Sync volume/mute to video ─────────────────────────────────────
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume
      videoRef.current.muted = muted
    }
  }, [volume, muted])

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = playbackRate
  }, [playbackRate])

  // ── Playback controls ─────────────────────────────────────────────
  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setPlayerState('playing') }
    else { v.pause(); setPlayerState('paused') }
  }

  const skip = (secs: number) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Math.max(0, Math.min(duration, v.currentTime + secs))
    setShowSkipFeedback(secs > 0 ? 'forward' : 'back')
    setTimeout(() => setShowSkipFeedback(null), 700)
    resetControlsTimer()
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen()
    else document.exitFullscreen()
  }

  const handleTimeUpdate = () => {
    const v = videoRef.current
    if (!v) return
    setCurrentTime(v.currentTime)
    if (v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1))
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isBuffering) return // disable scrubbing while buffering per spec
    const rect = progressRef.current?.getBoundingClientRect()
    if (!rect || !videoRef.current) return
    const ratio = (e.clientX - rect.left) / rect.width
    videoRef.current.currentTime = ratio * duration
  }

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = progressRef.current?.getBoundingClientRect()
    if (!rect) return
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setHoverProgress(ratio * 100)
    setHoverTime(formatTime(ratio * duration))
  }

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00'
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = Math.floor(secs % 60)
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0
  const VolumeIcon = muted || volume === 0 ? VolumeXIcon : volume < 0.5 ? Volume1Icon : Volume2Icon

  // ── Movie not found ───────────────────────────────────────────────
  if (!movie) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-2">Movie not found in your library</p>
          <p className="text-zinc-500 text-sm mb-6">ID: {id}</p>
          <button
            onClick={() => router.back()}
            className="bg-white text-black px-6 py-2 rounded font-semibold hover:bg-gray-200 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    // PlayerShell — overall viewport per architecture doc
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden select-none"
      style={{ cursor: showControls ? 'default' : 'none' }}
      onMouseMove={resetControlsTimer}
      onClick={togglePlay}
    >
      {/* ── VideoSurface ─────────────────────────────────────────── */}
      <video
        ref={videoRef}
        src={streamUrl}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => {
          setDuration((e.target as HTMLVideoElement).duration)
          setPlayerState('paused')
        }}
        onPlay={() => setPlayerState('playing')}
        onPause={() => { if (playerState !== 'ended') setPlayerState('paused') }}
        onWaiting={() => setPlayerState('buffering')}
        onCanPlay={() => { if (playerState === 'buffering') setPlayerState('playing') }}
        onEnded={() => { setPlayerState('ended'); setShowEndCard(true); setShowControls(true) }}
        onError={() => setPlayerState('error')}
        autoPlay
        playsInline
      />

      {/* ── Buffering spinner (state: buffering) ─────────────────── */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-14 h-14 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* ── Paused center icon (state: paused) ───────────────────── */}
      {playerState === 'paused' && !showEndCard && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <PlayIcon className="w-10 h-10 fill-white text-white ml-1" />
          </div>
        </div>
      )}

      {/* ── Skip feedback ────────────────────────────────────────── */}
      {showSkipFeedback && (
        <div
          className={`absolute top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2 text-white text-lg font-semibold z-30 ${
            showSkipFeedback === 'forward' ? 'right-1/4' : 'left-1/4'
          }`}
        >
          {showSkipFeedback === 'forward'
            ? <><FastForwardIcon className="w-7 h-7" /> +10s</>
            : <><RotateCcwIcon className="w-7 h-7" /> -10s</>
          }
        </div>
      )}

      {/* ── End card (state: ended) ───────────────────────────────── */}
      {showEndCard && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/70">
          <div className="text-center">
            <p className="text-white text-2xl font-bold mb-6">{title}</p>
            <div className="flex items-center gap-4 justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0
                    videoRef.current.play()
                    setShowEndCard(false)
                    setPlayerState('playing')
                  }
                }}
                className="flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded hover:bg-gray-200 transition-colors"
              >
                <RotateCcwIcon className="w-5 h-5" /> Replay
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); router.back() }}
                className="flex items-center gap-2 bg-zinc-700 text-white font-bold px-6 py-3 rounded hover:bg-zinc-600 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" /> Back to Browse
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Error state ───────────────────────────────────────────── */}
      {playerState === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/80">
          <div className="text-center max-w-sm">
            <p className="text-white text-xl font-semibold mb-2">Playback Error</p>
            <p className="text-zinc-400 text-sm mb-6">
              Could not stream this file. Make sure the backend server is running.
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); router.back() }}
              className="bg-netflix-red text-white px-6 py-2 rounded font-semibold hover:bg-red-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      )}

      {/* ── Controls overlay ─────────────────────────────────────── */}
      <div
        className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 pointer-events-none ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ zIndex: 40 }}
      >
        {/* ── Top zone: back + title ──────────────────────────────── */}
        <div
          className="flex items-center gap-4 px-8 pt-6 pb-16 pointer-events-auto"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => router.back()}
            className="text-white hover:text-gray-300 transition-colors p-1"
            aria-label="Back"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <div>
            <p className="text-white font-semibold text-lg leading-tight">{title}</p>
            {movie.metadata?.release_date && (
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {movie.metadata.release_date.substring(0, 4)}
                {movie.metadata.runtime ? ` · ${formatRuntime(movie.metadata.runtime)}` : ''}
              </p>
            )}
          </div>
        </div>

        {/* ── Spacer ─────────────────────────────────────────────── */}
        <div className="flex-1" />

        {/* ── SubtitleLayer — safe zone above controls ────────────── */}
        {subtitlesOn && (
          <div
            className="text-center pointer-events-none mb-20 px-8"
            style={{
              textShadow: '0 2px 8px rgba(0,0,0,0.9)',
              maxWidth: '70vw',
              margin: '0 auto 80px',
              lineHeight: 1.35,
            }}
          >
            <span
              className="text-white font-semibold"
              style={{ fontSize: 20 }}
            >
              {/* Subtitle text would render here from a subtitle track */}
            </span>
          </div>
        )}

        {/* ── ControlBar — bottom zone ────────────────────────────── */}
        <div
          className="px-8 pb-6 pt-16 pointer-events-auto"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress / scrubber */}
          <div
            ref={progressRef}
            className="relative mb-3 cursor-pointer group/scrub"
            style={{ height: 4 }}
            onClick={handleProgressClick}
            onMouseMove={handleProgressHover}
            onMouseLeave={() => { setHoverProgress(null); setHoverTime('') }}
          >
            {/* Track */}
            <div className="absolute inset-0 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
            {/* Buffered */}
            <div
              className="absolute top-0 left-0 h-full rounded-full"
              style={{ width: `${bufferedPercent}%`, backgroundColor: 'rgba(255,255,255,0.4)' }}
            />
            {/* Progress — accent red per spec */}
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all"
              style={{ width: `${progressPercent}%`, backgroundColor: '#E50914' }}
            />
            {/* Hover preview line */}
            {hoverProgress !== null && (
              <div
                className="absolute top-0 h-full w-0.5 bg-white/60"
                style={{ left: `${hoverProgress}%` }}
              />
            )}
            {/* Scrubber thumb — appears on hover */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white opacity-0 group-hover/scrub:opacity-100 transition-opacity shadow-lg"
              style={{ left: `${progressPercent}%` }}
            />
            {/* Time tooltip */}
            {hoverProgress !== null && hoverTime && (
              <div
                className="absolute -top-8 -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded pointer-events-none"
                style={{ left: `${hoverProgress}%` }}
              >
                {hoverTime}
              </div>
            )}
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            {/* Left: play/pause, skip back, skip forward, volume, time */}
            <div className="flex items-center gap-3 sm:gap-5">
              <button onClick={togglePlay} className="text-white hover:text-gray-300 transition-colors" aria-label="Play/Pause">
                {isPlaying
                  ? <PauseIcon className="w-7 h-7 fill-white" />
                  : <PlayIcon className="w-7 h-7 fill-white" />
                }
              </button>

              <button onClick={() => skip(-10)} className="text-white hover:text-gray-300 transition-colors" aria-label="Rewind 10s">
                <SkipBackIcon className="w-6 h-6" />
              </button>

              <button onClick={() => skip(10)} className="text-white hover:text-gray-300 transition-colors" aria-label="Forward 10s">
                <SkipForwardIcon className="w-6 h-6" />
              </button>

              {/* Volume with expanding slider */}
              <div
                className="flex items-center gap-2"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <button
                  onClick={() => setMuted(!muted)}
                  className="text-white hover:text-gray-300 transition-colors"
                  aria-label="Mute"
                >
                  <VolumeIcon className="w-6 h-6" />
                </button>
                <div
                  className="overflow-hidden transition-all duration-200"
                  style={{ width: showVolumeSlider ? 96 : 0 }}
                >
                  <input
                    type="range"
                    min={0} max={1} step={0.05}
                    value={muted ? 0 : volume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value)
                      setVolume(v)
                      if (v > 0) setMuted(false)
                    }}
                    className="w-24 accent-white cursor-pointer"
                  />
                </div>
              </div>

              {/* Time — hide on very small screens */}
              <span className="hidden sm:inline text-white text-sm font-medium tabular-nums" style={{ color: 'rgba(255,255,255,0.9)' }}>
                {formatTime(currentTime)}
                <span style={{ color: 'rgba(255,255,255,0.4)' }}> / {formatTime(duration)}</span>
              </span>
            </div>

            {/* Right: subtitles, settings, fullscreen */}
            <div className="flex items-center gap-4">
              {/* Subtitles toggle */}
              <button
                onClick={() => setSubtitlesOn(!subtitlesOn)}
                className="transition-colors"
                style={{ color: subtitlesOn ? '#E50914' : 'rgba(255,255,255,0.8)' }}
                aria-label="Subtitles"
                title="Subtitles"
              >
                <SubtitlesIcon className="w-6 h-6" />
              </button>

              {/* Settings panel */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="Settings"
                >
                  <SettingsIcon className={`w-6 h-6 transition-transform duration-300 ${showSettings ? 'rotate-45' : ''}`} />
                </button>

                {/* SettingsPanel per architecture doc */}
                {showSettings && (
                  <div
                    className="absolute bottom-10 right-0 rounded-md py-2 min-w-[200px] z-50"
                    style={{ backgroundColor: 'rgba(0,0,0,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    {/* Playback speed */}
                    <p className="px-4 py-2 text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Playback Speed
                    </p>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => { setPlaybackRate(rate); setShowSettings(false) }}
                        className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-white/10 transition-colors"
                        style={{ color: playbackRate === rate ? '#FFFFFF' : 'rgba(255,255,255,0.7)' }}
                      >
                        <span>{rate === 1 ? 'Normal' : `${rate}x`}</span>
                        {playbackRate === rate && (
                          <div className="w-2 h-2 rounded-full bg-[#E50914]" />
                        )}
                      </button>
                    ))}

                    <div className="my-1" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} />

                    {/* Quality */}
                    <p className="px-4 py-2 text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Quality
                    </p>
                    {['Auto', '4K', '1080p', '720p', '480p'].map((q) => (
                      <button
                        key={q}
                        onClick={() => setShowSettings(false)}
                        className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-white/10 transition-colors"
                        style={{ color: q === 'Auto' ? '#FFFFFF' : 'rgba(255,255,255,0.7)' }}
                      >
                        <span>{q}</span>
                        {q === 'Auto' && <div className="w-2 h-2 rounded-full bg-[#E50914]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Fullscreen"
              >
                {fullscreen
                  ? <MinimizeIcon className="w-6 h-6" />
                  : <MaximizeIcon className="w-6 h-6" />
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
