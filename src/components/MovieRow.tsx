'use client'

import { useRef, useState } from 'react'
import { Movie } from '@/lib/store'
import MovieCard from './MovieCard'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

interface MovieRowProps {
  title: string
  movies: Movie[]
}

export default function MovieRow({ title, movies }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  if (!movies || movies.length === 0) return null

  const scroll = (direction: 'left' | 'right') => {
    if (!rowRef.current) return
    const scrollAmount = rowRef.current.clientWidth * 0.85
    rowRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  const handleScroll = () => {
    if (!rowRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current
    setShowLeftArrow(scrollLeft > 0)
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10)
  }

  return (
    // overflow-visible so hover cards are not clipped
    <div className="mb-8 group/row" style={{ position: 'relative', zIndex: 1 }}>
      {/* Row title */}
      <h2 className="text-white text-lg md:text-xl font-semibold px-4 md:px-14 mb-2 hover:text-gray-300 cursor-pointer transition-colors">
        {title}
        <span className="text-netflix-red text-sm ml-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
          Explore All &rsaquo;
        </span>
      </h2>

      {/* Slider container — overflow-visible so hover cards show */}
      <div className="relative" style={{ overflow: 'visible' }}>
        {/* Left arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-20 w-12 bg-black/50 hover:bg-black/80 flex items-center justify-center transition-all opacity-0 group-hover/row:opacity-100"
            style={{ zIndex: 20 }}
          >
            <ChevronLeftIcon className="w-8 h-8 text-white" />
          </button>
        )}

        {/* Right arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-20 w-12 bg-black/50 hover:bg-black/80 flex items-center justify-center transition-all opacity-0 group-hover/row:opacity-100"
            style={{ zIndex: 20 }}
          >
            <ChevronRightIcon className="w-8 h-8 text-white" />
          </button>
        )}

        {/* Cards — overflow-x-auto for scrolling but overflow-y-visible for hover cards */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-2 hide-scrollbar px-4 md:px-14 pb-4"
          style={{
            overflowX: 'auto',
            overflowY: 'visible',
            scrollSnapType: 'x mandatory',
          }}
        >
          {movies.map((movie, index) => (
            <div
              key={`${movie.id}-${index}`}
              className="flex-shrink-0"
              style={{ scrollSnapAlign: 'start' }}
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
