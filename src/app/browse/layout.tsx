'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { getAuthCookie } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import TudumSplash from '@/components/TudumSplash'

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isLoggedIn, setLoggedIn, activeProfile, setShowTudum } = useStore()
  const hasShownTudum = useRef(false)

  useEffect(() => {
    const hasCookie = getAuthCookie()
    if (hasCookie && !isLoggedIn) setLoggedIn(true)
    if (!hasCookie && !isLoggedIn) router.replace('/login')
    else if (!activeProfile) router.replace('/profiles')
  }, [isLoggedIn, activeProfile, router, setLoggedIn])

  useEffect(() => {
    if (activeProfile && !hasShownTudum.current) {
      hasShownTudum.current = true
      setShowTudum(true)
    }
  }, [activeProfile, setShowTudum])

  if (!getAuthCookie() && !isLoggedIn) return null
  if (!activeProfile) return null

  return (
    <div className="min-h-screen bg-[#141414]">
      <TudumSplash />
      <Navbar />
      <main>{children}</main>
    </div>
  )
}
