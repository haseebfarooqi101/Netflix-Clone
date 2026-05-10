'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { v4 as uuidv4 } from 'uuid'
import ProfileAvatar from '@/components/ProfileAvatar'

const AVATAR_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8']
const COLOR_OPTIONS = ['#E50914', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4', '#FF5722', '#607D8B']

export default function AddProfilePage() {
  const router = useRouter()
  const { addProfile } = useStore()
  const [name, setName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('1')
  const [selectedColor, setSelectedColor] = useState('#E50914')
  const [isKids, setIsKids] = useState(false)

  const handleSave = () => {
    if (!name.trim()) return
    addProfile({
      id: uuidv4(),
      name: name.trim(),
      avatar: selectedAvatar,
      color: selectedColor,
      isKids,
      maturityRating: isKids ? 'KIDS' : 'ALL',
      language: 'en',
      autoplayNextEpisode: true,
      autoplayPreviews: true,
    })
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
        <h1 className="text-4xl font-medium mb-8">Add Profile</h1>
        <p className="text-gray-400 mb-8">Add a profile for another person watching Netflix.</p>

        <div className="flex gap-6 mb-8">
          <ProfileAvatar avatar={selectedAvatar} color={selectedColor} size={100} className="rounded flex-shrink-0" />
          <div className="flex-1">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              maxLength={50}
              className="netflix-input mb-4"
            />

            {/* Kids toggle */}
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

        {/* Avatar selection */}
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-3">Choose an avatar:</p>
          <div className="flex flex-wrap gap-3">
            {AVATAR_OPTIONS.map((av) => (
              <button
                key={av}
                onClick={() => setSelectedAvatar(av)}
                className={`rounded overflow-hidden transition-all ${selectedAvatar === av ? 'outline outline-2 outline-white scale-110' : 'opacity-60 hover:opacity-100'}`}
              >
                <ProfileAvatar avatar={av} color={selectedColor} size={60} />
              </button>
            ))}
          </div>
        </div>

        {/* Color selection */}
        <div className="mb-8">
          <p className="text-sm text-gray-400 mb-3">Choose a color:</p>
          <div className="flex gap-3">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                style={{ backgroundColor: color }}
                className={`w-8 h-8 rounded-full transition-all ${selectedColor === color ? 'outline outline-2 outline-white scale-110' : 'opacity-60 hover:opacity-100'}`}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="bg-white text-black font-semibold px-8 py-3 hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
          </button>
          <button
            onClick={() => router.push('/profiles')}
            className="border border-gray-500 text-gray-400 hover:text-white hover:border-white px-8 py-3 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
