'use client'

import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import Navbar from '@/components/Navbar'
import ProfileAvatar from '@/components/ProfileAvatar'
import { ChevronRightIcon } from 'lucide-react'

export default function AccountPage() {
  const router = useRouter()
  const { activeProfile, profiles, setLoggedIn, setActiveProfile } = useStore()

  const handleSignOut = () => {
    setLoggedIn(false)
    setActiveProfile(null as any)
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-28 pb-20">
        <h1 className="text-4xl font-medium text-white mb-8 border-b border-zinc-700 pb-4">Account</h1>

        {/* Membership section */}
        <section className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-gray-400 text-sm uppercase tracking-wider font-semibold">Membership & Billing</h2>
          </div>
          <div className="bg-zinc-900 rounded p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-medium">user@example.com</p>
                <p className="text-gray-400 text-sm">Password: ••••••••</p>
              </div>
              <div className="space-y-2 text-right">
                <button className="block text-blue-400 hover:underline text-sm">Change email</button>
                <button className="block text-blue-400 hover:underline text-sm">Change password</button>
              </div>
            </div>
            <div className="border-t border-zinc-700 pt-4 flex justify-between items-center">
              <div>
                <p className="text-white">Netflix Clone — Local</p>
                <p className="text-gray-400 text-sm">Your personal movie server</p>
              </div>
            </div>
          </div>
        </section>

        {/* Plan section */}
        <section className="mb-8">
          <h2 className="text-gray-400 text-sm uppercase tracking-wider font-semibold mb-4">Plan Details</h2>
          <div className="bg-zinc-900 rounded p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-medium">Ultra HD (4K)</p>
                <p className="text-gray-400 text-sm">4K + HDR · 4 screens · Downloads</p>
              </div>
              <button className="text-blue-400 hover:underline text-sm">Change plan</button>
            </div>
          </div>
        </section>

        {/* Profiles section */}
        <section className="mb-8">
          <h2 className="text-gray-400 text-sm uppercase tracking-wider font-semibold mb-4">Profile & Parental Controls</h2>
          <div className="bg-zinc-900 rounded divide-y divide-zinc-700">
            {profiles.map((profile) => (
              <div key={profile.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <ProfileAvatar avatar={profile.avatar} color={profile.color} size={40} className="rounded" />
                  <div>
                    <p className="text-white font-medium">{profile.name}</p>
                    <p className="text-gray-400 text-sm">{profile.isKids ? 'Kids' : 'All Maturity Ratings'}</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/profiles/manage/${profile.id}`)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Settings section */}
        <section className="mb-8">
          <h2 className="text-gray-400 text-sm uppercase tracking-wider font-semibold mb-4">Settings</h2>
          <div className="bg-zinc-900 rounded divide-y divide-zinc-700">
            {[
              { label: 'Playback settings', sub: 'Auto-play, data usage' },
              { label: 'Download settings', sub: 'Video quality, storage' },
              { label: 'Language', sub: 'English' },
              { label: 'Notifications', sub: 'Email, push notifications' },
            ].map((item) => (
              <button key={item.label} className="w-full p-4 flex items-center justify-between hover:bg-zinc-800 transition-colors text-left">
                <div>
                  <p className="text-white">{item.label}</p>
                  <p className="text-gray-400 text-sm">{item.sub}</p>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        </section>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full border border-zinc-600 text-white py-3 hover:bg-zinc-800 transition-colors rounded text-sm"
        >
          Sign out of all devices
        </button>
      </div>
    </div>
  )
}
