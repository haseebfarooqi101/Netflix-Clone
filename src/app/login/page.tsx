'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { setAuthCookie } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const { setLoggedIn } = useStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError('Please enter a valid email or phone number.'); return }
    if (!password || password.length < 4) { setError('Your password must contain between 4 and 60 characters.'); return }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))

    // Set cookie — 30 days if remember me, session if not
    setAuthCookie(rememberMe)
    setLoggedIn(true)
    setLoading(false)
    router.push('/profiles')
  }

  return (
    <div className="relative min-h-screen bg-black overflow-x-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-50"
        style={{ backgroundImage: "url('https://assets.nflxext.com/ffe/siteui/vlv3/9d3533b2-0e2b-40b2-95e0-ecd7979cc88b/a3873901-5b7c-46eb-b9fa-12fea5197bd3/IN-en-20240311-popsignuptwoweeks-perspective_alpha_website_large.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/60" />

      {/* Header */}
      <header className="relative z-10 px-6 sm:px-10 py-5">
        <span
          className="font-black text-netflix-red select-none"
          style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontFamily: "'Arial Black', sans-serif", letterSpacing: '-0.02em', lineHeight: 1 }}
        >
          NETFLIX
        </span>
      </header>

      {/* Form */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="bg-black/75 rounded-md px-6 sm:px-12 py-10 w-full max-w-md">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-7">Sign In</h1>

          {error && (
            <div className="bg-[#e87c03] text-white text-sm rounded px-4 py-3 mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email or phone number"
              autoComplete="email"
              className="w-full rounded px-4 py-4 text-white text-sm outline-none border border-zinc-600 focus:border-zinc-300 transition-colors placeholder-zinc-500"
              style={{ backgroundColor: '#333' }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              className="w-full rounded px-4 py-4 text-white text-sm outline-none border border-zinc-600 focus:border-zinc-300 transition-colors placeholder-zinc-500"
              style={{ backgroundColor: '#333' }}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-netflix-red hover:bg-[#f40612] text-white font-bold py-3.5 rounded text-sm transition-colors disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>

            <div className="flex items-center gap-3 py-0.5">
              <div className="flex-1 h-px bg-zinc-600" />
              <span className="text-zinc-400 text-xs">OR</span>
              <div className="flex-1 h-px bg-zinc-600" />
            </div>

            <button type="button" className="w-full text-white text-sm font-medium py-3 rounded transition-colors hover:bg-zinc-700" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              Use a Sign-In Code
            </button>

            <div className="text-center">
              <a href="#" className="text-zinc-400 hover:underline text-sm">Forgot Password?</a>
            </div>

            {/* Remember me — controls cookie duration */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 accent-zinc-400"
              />
              <span className="text-zinc-400 text-sm">
                Remember me
                <span className="text-zinc-600 text-xs ml-1">(stay signed in for 30 days)</span>
              </span>
            </label>
          </form>

          <div className="mt-8 text-zinc-500 text-sm">
            New to Netflix?{' '}
            <a href="#" className="text-white hover:underline font-medium">Sign up now</a>
          </div>
          <p className="mt-3 text-zinc-600 text-xs leading-relaxed">
            This page is protected by Google reCAPTCHA to ensure you&apos;re not a bot.{' '}
            <a href="#" className="text-blue-500 hover:underline">Learn more.</a>
          </p>
        </div>
      </main>
    </div>
  )
}
