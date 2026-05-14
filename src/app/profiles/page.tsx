'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore, Profile } from '@/lib/store'
import { getAuthCookie } from '@/lib/auth'
import { PencilIcon } from 'lucide-react'
import ProfileAvatar from '@/components/ProfileAvatar'

export default function ProfilesPage() {
  const router = useRouter()
  const { profiles, setActiveProfile, isLoggedIn, setLoggedIn } = useStore()
  const [isManaging, setIsManaging] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const hasCookie = getAuthCookie()
    
    if (hasCookie && !isLoggedIn) {
      setLoggedIn(true)
    }

    if (!hasCookie && !isLoggedIn) {
      router.replace('/login')
    } else {
      setIsChecking(false)
    }
  }, [isLoggedIn, router, setLoggedIn])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const handleSelectProfile = (profile: Profile) => {
    if (isManaging) {
      router.push(`/profiles/manage/${profile.id}`)
      return
    }
    setActiveProfile(profile)
    router.push('/browse')
  }

  return (
    <div className="min-h-screen bg-netflix-black flex flex-col items-center justify-center">
      {/* Netflix logo top left */}
      <div className="absolute top-6 left-10">
        <span
          className="font-black text-netflix-red select-none"
          style={{ fontSize: 36, fontFamily: "'Arial Black', 'Arial Bold', sans-serif", letterSpacing: '-0.02em', lineHeight: 1 }}
        >
          NETFLIX
        </span>
      </div>

      <h1 className="text-4xl md:text-5xl font-medium text-white mb-8">
        {isManaging ? 'Manage Profiles' : "Who's watching?"}
      </h1>

      <div className="flex flex-wrap justify-center gap-4 mb-10">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => handleSelectProfile(profile)}
            className="group flex flex-col items-center gap-3 cursor-pointer"
          >
            <div className="relative">
              <ProfileAvatar
                avatar={profile.avatar}
                color={profile.color}
                size={120}
                className="rounded group-hover:outline group-hover:outline-white group-hover:outline-2"
              />
              {isManaging && (
                <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center">
                  <PencilIcon className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            <span className="text-gray-400 group-hover:text-white text-sm font-medium transition-colors">
              {profile.name}
            </span>
          </button>
        ))}

        {/* Add profile button */}
        {profiles.length < 5 && !isManaging && (
          <button
            onClick={() => router.push('/profiles/add')}
            className="group flex flex-col items-center gap-3 cursor-pointer"
          >
            <div className="w-[120px] h-[120px] rounded bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center group-hover:border-white transition-colors">
              <span className="text-5xl text-zinc-500 group-hover:text-white transition-colors">+</span>
            </div>
            <span className="text-gray-400 group-hover:text-white text-sm font-medium transition-colors">
              Add Profile
            </span>
          </button>
        )}
      </div>

      <button
        onClick={() => setIsManaging(!isManaging)}
        className="border border-gray-400 text-gray-400 hover:border-white hover:text-white px-8 py-2 text-sm font-medium tracking-widest uppercase transition-colors"
      >
        {isManaging ? 'Done' : 'Manage Profiles'}
      </button>
    </div>
  )
}
