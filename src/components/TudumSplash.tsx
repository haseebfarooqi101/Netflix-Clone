'use client'

import { useEffect, useRef, useState } from 'react'
import { useStore } from '@/lib/store'

export default function TudumSplash() {
  const { showTudum, setShowTudum } = useStore()
  const [visible, setVisible] = useState(true)
  const [animating, setAnimating] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!showTudum) {
      setVisible(false)
      return
    }

    // Play tudum sound
    try {
      audioRef.current = new Audio('/sounds/tudum.mp3')
      audioRef.current.volume = 0.8
      audioRef.current.play().catch(() => {})
    } catch {}

    // Start animation
    setAnimating(true)

    // Hide after 3.5s
    const timer = setTimeout(() => {
      setVisible(false)
      setShowTudum(false)
    }, 3500)

    return () => {
      clearTimeout(timer)
      audioRef.current?.pause()
    }
  }, [showTudum, setShowTudum])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center tudum-overlay">
      <div className={`transition-all duration-500 ${animating ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
        {/* Netflix N logo with tudum animation */}
        <div className="relative flex items-center justify-center">
          {/* Netflix wordmark */}
          <span
            className="font-black text-netflix-red select-none drop-shadow-[0_0_40px_rgba(229,9,20,0.8)]"
            style={{
              fontSize: 96,
              fontFamily: "'Arial Black', 'Arial Bold', sans-serif",
              letterSpacing: '-0.02em',
              lineHeight: 1,
              animation: animating ? 'tudumPulse 0.6s ease-out 0.3s both' : 'none',
            }}
          >
            NETFLIX
          </span>

          {/* Ripple effect */}
          {animating && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-netflix-red/40 animate-ping" style={{ animationDuration: '1s', animationDelay: '0.3s' }} />
              <div className="absolute inset-0 rounded-full border border-netflix-red/20 animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.5s' }} />
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes tudumPulse {
          0% { transform: scale(0.8); filter: drop-shadow(0 0 10px rgba(229,9,20,0.4)); }
          50% { transform: scale(1.1); filter: drop-shadow(0 0 60px rgba(229,9,20,1)); }
          100% { transform: scale(1); filter: drop-shadow(0 0 40px rgba(229,9,20,0.8)); }
        }
      `}</style>
    </div>
  )
}
