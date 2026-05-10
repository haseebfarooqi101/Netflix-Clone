'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import ProfileAvatar from '@/components/ProfileAvatar'

const AVATAR_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8']
const COLOR_OPTIONS = ['#E50914', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4', '#FF5722', '#607D8B']

export default function ManageProfilePage() {
  const router = useRouter()
  const params = useParams()
  const { profiles, updateProfile, deleteProfile } = useStore()
  const profile = profiles.find((p) => p.id === params.id)

  const [name, setName] = useState(profile?.name || '')
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar || '1')
  const [selectedColor, setSelectedColor] = useState(profile?.color || '#E50914')
  const [isKids, setIsKids] = useState(profile?.isKids || false)
  const [autoplayNext, setAutoplayNext] = useState(profile?.autoplayNextEpisode ?? true)
  const [autoplayPreviews, setAutoplayPreviews] = useState(profile?.autoplayPreviews ?? true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (!profile) router.replace('/profiles')
  }, [profile, router])

  if (!profile) return null

  const handleSave = () => {
    updateProfile(profile.id, {
      name: name.trim(),
      avatar: selectedAvatar,
      color: selectedColor,
      isKids,
      autoplayNextEpisode: autoplayNext,
      autoplayPreviews,
    })
    router.push('/profiles')
  }

  const handleDelete = () => {
    deleteProfile(profile.id)
    router.push('/profiles')
  }

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      <div className="border-b border-zinc-700 px-10 py-6">
        <span
          className="font-black text-netflix-red select-none"
          style={{ fontSize: 36, fontFamily: "'Arial Black', 'Arial Bold', sans-serif", letterSpacing: '-0.02em', lineHeight: 1 }}
        >
          NETFLIX
        </span>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-medium mb-8">Edit Profile</h1>

        <div className="flex gap-6 mb-8">
          <ProfileAvatar avatar={selectedAvatar} color={selectedColor} size={100} className="rounded flex-shrink-0" />
          <div className="flex-1">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="netflix-input mb-4"
            />
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setIsKids(!isKids)}
                className={`w-12 h-6 rounded-full transition-colors relative ${isKids ? 'bg-netflix-red' : 'bg-zinc-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isKids ? 'translate-x-7' : 'translate-x-1'}`} />
              </div>
              <span className="text-sm">Kid?</span>
            </label>
          </div>
        </div>

        {/* Avatar */}
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-3">Avatar:</p>
          <div className="flex flex-wrap gap-3">
            {AVATAR_OPTIONS.map((av) => (
              <button key={av} onClick={() => setSelectedAvatar(av)}
                className={`rounded overflow-hidden transition-all ${selectedAvatar === av ? 'outline outline-2 outline-white scale-110' : 'opacity-60 hover:opacity-100'}`}>
                <ProfileAvatar avatar={av} color={selectedColor} size={60} />
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="mb-8">
          <p className="text-sm text-gray-400 mb-3">Color:</p>
          <div className="flex gap-3">
            {COLOR_OPTIONS.map((color) => (
              <button key={color} onClick={() => setSelectedColor(color)}
                style={{ backgroundColor: color }}
                className={`w-8 h-8 rounded-full transition-all ${selectedColor === color ? 'outline outline-2 outline-white scale-110' : 'opacity-60 hover:opacity-100'}`}
              />
            ))}
          </div>
        </div>

        {/* Playback settings */}
        <div className="border-t border-zinc-700 pt-6 mb-8 space-y-4">
          <h2 className="text-lg font-medium mb-4">Playback Settings</h2>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium">Autoplay next episode</p>
              <p className="text-sm text-gray-400">Automatically play the next episode</p>
            </div>
            <div onClick={() => setAutoplayNext(!autoplayNext)}
              className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${autoplayNext ? 'bg-netflix-red' : 'bg-zinc-600'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${autoplayNext ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium">Autoplay previews</p>
              <p className="text-sm text-gray-400">Automatically play previews while browsing</p>
            </div>
            <div onClick={() => setAutoplayPreviews(!autoplayPreviews)}
              className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${autoplayPreviews ? 'bg-netflix-red' : 'bg-zinc-600'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${autoplayPreviews ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
          </label>
        </div>

        <div className="flex flex-wrap gap-4">
          <button onClick={handleSave} disabled={!name.trim()}
            className="bg-white text-black font-semibold px-8 py-3 hover:bg-gray-200 transition-colors disabled:opacity-40">
            Save
          </button>
          <button onClick={() => router.push('/profiles')}
            className="border border-gray-500 text-gray-400 hover:text-white hover:border-white px-8 py-3 transition-colors">
            Cancel
          </button>
          {profiles.length > 1 && (
            <button onClick={() => setShowDeleteConfirm(true)}
              className="border border-gray-500 text-gray-400 hover:text-red-500 hover:border-red-500 px-8 py-3 transition-colors ml-auto">
              Delete Profile
            </button>
          )}
        </div>
      </div>

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded p-8 max-w-sm w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Delete Profile?</h3>
            <p className="text-gray-400 mb-6">
              This profile and all its settings will be permanently deleted. This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button onClick={handleDelete}
                className="bg-netflix-red text-white px-6 py-2 rounded hover:bg-red-700 transition-colors">
                Delete
              </button>
              <button onClick={() => setShowDeleteConfirm(false)}
                className="border border-gray-500 text-gray-400 px-6 py-2 rounded hover:border-white hover:text-white transition-colors">
                Keep Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
