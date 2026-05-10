import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getAuthCookie, clearAuthCookie } from './auth'

export interface Profile {
  id: string
  name: string
  avatar: string
  color: string
  isKids: boolean
  maturityRating: string
  language: string
  autoplayNextEpisode: boolean
  autoplayPreviews: boolean
}

export interface Movie {
  id: string | number
  folderName: string
  filePath: string
  fileName: string
  parsed: { title: string; year: string | null }
  metadata: {
    id?: number
    title: string
    original_title?: string
    year?: string
    release_date?: string
    poster_path: string | null
    backdrop_path: string | null
    overview: string
    vote_average: number
    genres?: { id: number; name: string }[]
    runtime?: number
    tagline?: string
    status?: string
  }
}

interface NetflixStore {
  isLoggedIn: boolean
  setLoggedIn: (v: boolean) => void
  logout: () => void

  profiles: Profile[]
  activeProfile: Profile | null
  setActiveProfile: (p: Profile) => void
  addProfile: (p: Profile) => void
  updateProfile: (id: string, updates: Partial<Profile>) => void
  deleteProfile: (id: string) => void

  movies: Movie[]
  setMovies: (m: Movie[]) => void
  myList: (string | number)[]
  toggleMyList: (id: string | number) => void

  isMuted: boolean
  setMuted: (v: boolean) => void
  showTudum: boolean
  setShowTudum: (v: boolean) => void

  currentMovie: Movie | null
  setCurrentMovie: (m: Movie | null) => void
  isPlaying: boolean
  setIsPlaying: (v: boolean) => void
}

const defaultProfiles: Profile[] = [
  {
    id: '1',
    name: 'User 1',
    avatar: '1',
    color: '#E50914',
    isKids: false,
    maturityRating: 'ALL',
    language: 'en',
    autoplayNextEpisode: true,
    autoplayPreviews: true,
  },
]

export const useStore = create<NetflixStore>()(
  persist(
    (set) => ({
      // Check cookie on init — if cookie exists, stay logged in
      isLoggedIn: false,
      setLoggedIn: (v) => set({ isLoggedIn: v }),
      logout: () => {
        clearAuthCookie()
        set({ isLoggedIn: false, activeProfile: null })
      },

      profiles: defaultProfiles,
      activeProfile: null,
      setActiveProfile: (p) => set({ activeProfile: p }),
      addProfile: (p) => set((s) => ({ profiles: [...s.profiles, p] })),
      updateProfile: (id, updates) =>
        set((s) => ({
          profiles: s.profiles.map((p) => (p.id === id ? { ...p, ...updates } : p)),
          activeProfile:
            s.activeProfile?.id === id ? { ...s.activeProfile, ...updates } : s.activeProfile,
        })),
      deleteProfile: (id) =>
        set((s) => ({ profiles: s.profiles.filter((p) => p.id !== id) })),

      movies: [],
      setMovies: (m) => set({ movies: m }),
      myList: [],
      toggleMyList: (id) =>
        set((s) => ({
          myList: s.myList.includes(id)
            ? s.myList.filter((i) => i !== id)
            : [...s.myList, id],
        })),

      isMuted: true,
      setMuted: (v) => set({ isMuted: v }),
      showTudum: false,
      setShowTudum: (v) => set({ showTudum: v }),

      currentMovie: null,
      setCurrentMovie: (m) => set({ currentMovie: m }),
      isPlaying: false,
      setIsPlaying: (v) => set({ isPlaying: v }),
    }),
    {
      name: 'netflix-clone-store',
      partialize: (s) => ({
        // isLoggedIn intentionally NOT persisted here — cookies handle it
        profiles: s.profiles,
        activeProfile: s.activeProfile,
        myList: s.myList,
        isMuted: s.isMuted,
      }),
      // On rehydration, check cookie to restore login state
      onRehydrateStorage: () => (state) => {
        if (state && getAuthCookie()) {
          state.isLoggedIn = true
        }
      },
    }
  )
)
