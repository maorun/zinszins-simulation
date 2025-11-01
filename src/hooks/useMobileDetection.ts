import { useState, useEffect } from 'react'

/**
 * Hook to detect if the current viewport is mobile (width < 768px)
 * @returns boolean indicating if the viewport is mobile
 */
export function useMobileDetection(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}
