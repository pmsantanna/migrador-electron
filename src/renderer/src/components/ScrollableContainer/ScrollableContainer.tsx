import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface ScrollableContainerProps {
  children: React.ReactNode
  height: string
  className?: string
  showIndicator?: boolean
}

const ScrollableContainer: React.FC<ScrollableContainerProps> = ({
  children,
  height,
  className = '',
  showIndicator = true
}) => {
  const [scrollState, setScrollState] = useState({
    canScrollDown: false,
    canScrollUp: false,
    scrollPercentage: 0
  })

  const scrollRef = useRef<HTMLDivElement>(null)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      const canScrollDown = scrollTop + clientHeight < scrollHeight - 5
      const canScrollUp = scrollTop > 5
      const scrollPercentage =
        scrollHeight > clientHeight ? (scrollTop / (scrollHeight - clientHeight)) * 100 : 0

      setScrollState({
        canScrollDown,
        canScrollUp,
        scrollPercentage
      })
    }
  }

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (scrollElement) {
      checkScroll()
      scrollElement.addEventListener('scroll', checkScroll)
      return () => scrollElement.removeEventListener('scroll', checkScroll)
    }
  }, [children])

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {/* Gradient fade top */}
      {scrollState.canScrollUp && (
        <div
          className="absolute top-0 left-0 right-0 h-4 z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 1), transparent)'
          }}
        />
      )}

      {/* Scroll content */}
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto pr-2"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#3b82f6 rgba(0, 0, 0, 0.05)'
        }}
      >
        <style>{`
          div::-webkit-scrollbar {
            width: 8px;
          }

          div::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.05);
            border-radius: 10px;
          }

          div::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #3b82f6, #2563eb);
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          div::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #2563eb, #1d4ed8);
          }
        `}</style>
        {children}
      </div>

      {/* Gradient fade bottom */}
      {scrollState.canScrollDown && (
        <div
          className="absolute bottom-0 left-0 right-0 h-6 z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(255, 255, 255, 1), transparent)'
          }}
        />
      )}

      {/* Scroll indicator */}
      {showIndicator && scrollState.canScrollDown && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-col items-center animate-bounce">
            <div className="w-1 h-8 bg-gradient-to-b from-transparent to-blue-500 rounded-full mb-1" />
            <ChevronDown className="w-4 h-4 text-blue-500" />
          </div>
        </div>
      )}

      {/* Progress indicator */}
      {showIndicator && scrollState.scrollPercentage > 0 && (
        <div className="absolute right-1 top-4 bottom-4 w-1 bg-gray-200 rounded-full">
          <div
            className="w-full bg-gradient-to-b from-blue-400 to-blue-600 rounded-full transition-all duration-300"
            style={{ height: `${scrollState.scrollPercentage}%` }}
          />
        </div>
      )}
    </div>
  )
}

export default ScrollableContainer
