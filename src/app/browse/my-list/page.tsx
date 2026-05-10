'use client'

import { useMemo } from 'react'
import { useStore } from '@/lib/store'
import MovieRow from '@/components/MovieRow'

export default function MyListPage() {
  const { movies, myList } = useStore()

  const myMovies = useMemo(
    () => movies.filter((m) => myList.includes(m.id)),
    [movies, myList]
  )

  return (
    <div className="pt-24 pb-20">
      <div className="px-4 md:px-14 mb-8">
        <h1 className="text-3xl font-bold text-white">My List</h1>
      </div>
      {myMovies.length === 0 ? (
        <div className="px-4 md:px-14 text-gray-400">
          <p>Your list is empty. Add movies by clicking the + button on any title.</p>
        </div>
      ) : (
        <MovieRow title="" movies={myMovies} />
      )}
    </div>
  )
}
