'use client'

import { useMemo } from 'react'
import { useStore } from '@/lib/store'
import MovieRow from '@/components/MovieRow'

export default function LanguagesPage() {
  const { movies } = useStore()

  const byLanguage = useMemo(() => {
    const map: Record<string, typeof movies> = {}
    movies.forEach((m) => {
      const lang = (m.metadata as any)?.original_language || 'en'
      const label = LANG_MAP[lang] || lang.toUpperCase()
      if (!map[label]) map[label] = []
      map[label].push(m)
    })
    return Object.entries(map).filter(([, films]) => films.length > 0)
  }, [movies])

  return (
    <div className="pt-24 pb-20">
      <div className="px-4 md:px-14 mb-6">
        <h1 className="text-3xl font-bold text-white">Browse by Language</h1>
      </div>
      {byLanguage.map(([lang, films]) => (
        <MovieRow key={lang} title={lang} movies={films} />
      ))}
    </div>
  )
}

const LANG_MAP: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
  hi: 'Hindi',
  pt: 'Portuguese',
  ru: 'Russian',
  ar: 'Arabic',
}
