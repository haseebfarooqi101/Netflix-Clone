'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { getAuthCookie } from '@/lib/auth'

export default function RootPage() {
  const router = useRouter()
  const { isLoggedIn, setLoggedIn, activeProfile } = useStore()

  useEffect(() => {
    // Check cookie on every load — restores session after refresh
    const hasCookie = getAuthCookie()
    if (hasCookie && !isLoggedIn) {
      setLoggedIn(true)
    }

    if (!hasCookie && !isLoggedIn) {
      router.replace('/login')
    } else if (hasCookie || isLoggedIn) {
      if (!activeProfile) router.replace('/profiles')
      else router.replace('/browse')
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
