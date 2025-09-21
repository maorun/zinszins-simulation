import { useEffect, useState } from 'react'

/**
 * Hook to detect mobile device and provide mobile-optimized interaction states
 */
export function useMobileInteraction() {
  const [isMobile, setIsMobile] = useState(false)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
    }

    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }

    checkMobile()
    checkTouch()

    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  const getMobileInteractionClasses = (baseClasses = '') => {
    const mobileClasses = isMobile ? 'mobile-interactive' : ''
    return `${baseClasses} ${mobileClasses}`.trim()
  }

  const getTouchTargetClasses = (baseClasses = '') => {
    const touchClasses = isMobile ? 'mobile-tap-target' : ''
    return `${baseClasses} ${touchClasses}`.trim()
  }

  return {
    isMobile,
    isTouch,
    getMobileInteractionClasses,
    getTouchTargetClasses,
  }
}
