'use client'

interface NetflixLogoProps {
  className?: string
  height?: number
}

export default function NetflixLogo({ className = '', height = 32 }: NetflixLogoProps) {
  return (
    <span
      className={`font-black tracking-tight text-netflix-red select-none ${className}`}
      style={{
        fontSize: height * 1.1,
        fontFamily: "'Arial Black', 'Arial Bold', Gadget, sans-serif",
        letterSpacing: '-0.02em',
        lineHeight: 1,
        display: 'inline-block',
      }}
    >
      NETFLIX
    </span>
  )
}
