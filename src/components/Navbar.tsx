'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import ProfileAvatar from './ProfileAvatar'
import NetflixLogo from './NetflixLogo'
import { BellIcon, SearchIcon, ChevronDownIcon } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Home', href: '/browse' },
  { label: 'TV Shows', href: '/browse/tv' },
  { label: 'Movies', href: '/browse/movies' },
  { label: 'New & Popular', href: '/browse/new' },
  { label: 'My List', href: '/browse/my-list' },
  { label: 'Browse by Languages', href: '/browse/languages' },
]

export default function Navbar() {
  const router = useRouter()
  const { activeProfile, profiles, setActiveProfile, logout } = useStore()
  const [scrolled, setScrolled] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus()
    }
  }, [showSearch])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/browse/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSignOut = () => {
    logout()
    router.push('/login')
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-netflix-black' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-4 md:px-14 py-4">
        {/* Left: Logo + Nav links */}
        <div className="flex items-center gap-8">
          {/* Netflix Logo */}
          <Link href="/browse" className="flex-shrink-0">
            <NetflixLogo height={28} />
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden md:flex items-center gap-4 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-gray-200 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile: Browse dropdown */}
          <button className="md:hidden flex items-center gap-1 text-sm text-white">
            Browse <ChevronDownIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Search, Notifications, Profile */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex items-center">
            {showSearch ? (
              <form onSubmit={handleSearch} className="flex items-center border border-white bg-black/80 px-3 py-1">
                <SearchIcon className="w-4 h-4 text-white mr-2 flex-shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Titles, people, genres"
                  className="bg-transparent text-white text-sm outline-none w-48 placeholder-gray-400"
                  onBlur={() => { if (!searchQuery) setShowSearch(false) }}
                />
              </form>
            ) : (
              <button onClick={() => setShowSearch(true)} className="text-white hover:text-gray-300 transition-colors">
                <SearchIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Notifications */}
          <button className="text-white hover:text-gray-300 transition-colors relative">
            <BellIcon className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-netflix-red rounded-full" />
          </button>

          {/* Profile menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 group"
            >
              {activeProfile && (
                <ProfileAvatar
                  avatar={activeProfile.avatar}
                  color={activeProfile.color}
                  size={32}
                  className="rounded"
                />
              )}
              <ChevronDownIcon
                className={`w-4 h-4 text-white transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-10 w-56 bg-black/95 border border-zinc-700 py-2 z-50">
                {/* Other profiles */}
                {profiles
                  .filter((p) => p.id !== activeProfile?.id)
                  .map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => {
                        setActiveProfile(profile)
                        setShowProfileMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-zinc-800 transition-colors"
                    >
                      <ProfileAvatar avatar={profile.avatar} color={profile.color} size={28} className="rounded" />
                      <span className="text-sm text-gray-200">{profile.name}</span>
                    </button>
                  ))}

                <div className="border-t border-zinc-700 my-2" />

                <Link href="/profiles" onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-800 transition-colors text-sm text-gray-200">
                  Manage Profiles
                </Link>
                <Link href="/account" onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-800 transition-colors text-sm text-gray-200">
                  Account
                </Link>
                <Link href="/help" onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-800 transition-colors text-sm text-gray-200">
                  Help Centre
                </Link>

                <div className="border-t border-zinc-700 my-2" />

                <button
                  onClick={handleSignOut}
                  className="w-full text-center px-4 py-2 hover:bg-zinc-800 transition-colors text-sm text-gray-200"
                >
                  Sign out of Netflix
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
