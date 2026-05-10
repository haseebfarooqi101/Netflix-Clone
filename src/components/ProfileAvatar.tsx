'use client'

interface ProfileAvatarProps {
  avatar: string
  color: string
  size?: number
  className?: string
}

// Netflix-style avatar icons using SVG shapes
const AVATAR_ICONS: Record<string, React.ReactNode> = {
  '1': (
    <svg viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="38" r="20" fill="rgba(255,255,255,0.9)" />
      <ellipse cx="50" cy="85" rx="32" ry="22" fill="rgba(255,255,255,0.9)" />
    </svg>
  ),
  '2': (
    <svg viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="38" r="20" fill="rgba(255,255,255,0.9)" />
      <ellipse cx="50" cy="85" rx="32" ry="22" fill="rgba(255,255,255,0.9)" />
      <rect x="30" y="20" width="40" height="8" rx="4" fill="rgba(0,0,0,0.3)" />
    </svg>
  ),
  '3': (
    <svg viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="38" r="20" fill="rgba(255,255,255,0.9)" />
      <ellipse cx="50" cy="85" rx="32" ry="22" fill="rgba(255,255,255,0.9)" />
      <path d="M30 30 Q50 15 70 30" stroke="rgba(0,0,0,0.3)" strokeWidth="4" fill="none" />
    </svg>
  ),
  '4': (
    <svg viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="38" r="20" fill="rgba(255,255,255,0.9)" />
      <ellipse cx="50" cy="85" rx="32" ry="22" fill="rgba(255,255,255,0.9)" />
      <circle cx="50" cy="38" r="10" fill="rgba(0,0,0,0.15)" />
    </svg>
  ),
  '5': (
    <svg viewBox="0 0 100 100" fill="none">
      <rect x="20" y="20" width="60" height="60" rx="8" fill="rgba(255,255,255,0.15)" />
      <circle cx="50" cy="40" r="16" fill="rgba(255,255,255,0.9)" />
      <ellipse cx="50" cy="78" rx="26" ry="16" fill="rgba(255,255,255,0.9)" />
    </svg>
  ),
  '6': (
    <svg viewBox="0 0 100 100" fill="none">
      <polygon points="50,15 85,80 15,80" fill="rgba(255,255,255,0.2)" />
      <circle cx="50" cy="40" r="16" fill="rgba(255,255,255,0.9)" />
      <ellipse cx="50" cy="78" rx="26" ry="16" fill="rgba(255,255,255,0.9)" />
    </svg>
  ),
  '7': (
    <svg viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="35" fill="rgba(255,255,255,0.1)" />
      <circle cx="50" cy="38" r="18" fill="rgba(255,255,255,0.9)" />
      <ellipse cx="50" cy="82" rx="28" ry="18" fill="rgba(255,255,255,0.9)" />
    </svg>
  ),
  '8': (
    <svg viewBox="0 0 100 100" fill="none">
      <rect x="15" y="15" width="70" height="70" rx="35" fill="rgba(255,255,255,0.1)" />
      <circle cx="50" cy="38" r="18" fill="rgba(255,255,255,0.9)" />
      <ellipse cx="50" cy="82" rx="28" ry="18" fill="rgba(255,255,255,0.9)" />
    </svg>
  ),
}

export default function ProfileAvatar({ avatar, color, size = 80, className = '' }: ProfileAvatarProps) {
  return (
    <div
      className={`flex items-center justify-center overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: 4,
      }}
    >
      <div style={{ width: size * 0.85, height: size * 0.85 }}>
        {AVATAR_ICONS[avatar] || AVATAR_ICONS['1']}
      </div>
    </div>
  )
}
