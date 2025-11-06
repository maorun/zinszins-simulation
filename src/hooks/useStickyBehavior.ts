import React, { useState, useEffect } from 'react'

/**
 * Hook to track whether an element should display as sticky based on scroll position
 * @param elementRef - Reference to the element to track
 * @returns boolean indicating if the sticky header should be shown
 */
export function useStickyBehavior(elementRef: React.RefObject<HTMLElement | null>): boolean {
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current) return

      const elementRect = elementRef.current.getBoundingClientRect()
      const shouldBeSticky = elementRect.bottom < 0
      setIsSticky(shouldBeSticky)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial state

    return () => window.removeEventListener('scroll', handleScroll)
  }, [elementRef])

  return isSticky
}
