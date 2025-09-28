import React, { useState, useEffect, useMemo } from 'react'
import { useSimulation } from '../contexts/useSimulation'
import { getEnhancedOverviewSummary } from '../utils/enhanced-summary'

interface StickyBottomOverviewProps {
  overviewElementRef: React.RefObject<HTMLElement | null>
}

export function StickyBottomOverview({ overviewElementRef }: StickyBottomOverviewProps) {
  const [isSticky, setIsSticky] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const {
    simulationData,
    startEnd,
    withdrawalResults,
    rendite,
    steuerlast,
    teilfreistellungsquote,
    endOfLife,
  } = useSimulation()

  const enhancedSummary = useMemo(() => {
    return getEnhancedOverviewSummary(
      simulationData,
      startEnd,
      withdrawalResults,
      rendite,
      steuerlast,
      teilfreistellungsquote,
      undefined, // withdrawalConfig - not available in this component
      endOfLife,
    )
  }, [
    simulationData,
    startEnd,
    withdrawalResults,
    rendite,
    steuerlast,
    teilfreistellungsquote,
    endOfLife,
  ])

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Track scroll position to show/hide sticky bottom header
  useEffect(() => {
    const handleScroll = () => {
      if (!overviewElementRef.current) return

      const overviewRect = overviewElementRef.current.getBoundingClientRect()
      const shouldBeSticky = overviewRect.bottom < 0
      setIsSticky(shouldBeSticky)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial state

    return () => window.removeEventListener('scroll', handleScroll)
  }, [overviewElementRef])

  // Only show when main overview is not visible and we have withdrawal data
  if (!isSticky || !enhancedSummary || !simulationData || !enhancedSummary.endkapitalEntspharphase) {
    return null
  }

  // Calculate years range

  // Helper function to format currency in compact form for mobile
  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M €`
    }
    else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k €`
    }
    return amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
  }

  const renderEntnahmenContent = () => {
    if (!enhancedSummary.endkapitalEntspharphase) {
      return null
    }

    const withdrawalStartYear = startEnd[0] + 1

    // Calculate proper withdrawal end year
    let withdrawalEndYear = endOfLife || startEnd[1] // Use global end of life or fall back to startEnd[1]

    // If we have segmented withdrawal, use the actual end year from segments
    if (enhancedSummary.isSegmentedWithdrawal
      && enhancedSummary.withdrawalSegments
      && enhancedSummary.withdrawalSegments.length > 0) {
      // Find the latest end year from all segments
      const segmentEndYears = enhancedSummary.withdrawalSegments
        .map(segment => segment.endYear)
        .filter(year => typeof year === 'number' && !isNaN(year))

      if (segmentEndYears.length > 0) {
        withdrawalEndYear = Math.max(...segmentEndYears)
      }
    }

    const withdrawalYearsRange = `${withdrawalStartYear} - ${withdrawalEndYear}`

    // Check if we have segmented withdrawal
    const hasSegments = enhancedSummary.isSegmentedWithdrawal
      && enhancedSummary.withdrawalSegments
      && enhancedSummary.withdrawalSegments.length > 1

    if (isMobile) {
      // Mobile: Zeit / Startkapital / Endkapital (symbols and numbers only)
      return (
        <div className="flex justify-around items-center gap-4">
          <div className="flex flex-col items-center text-center">
            <span className="text-xl mb-1">⏱️</span>
            <span className="text-xs font-semibold text-slate-800">
              {withdrawalYearsRange}
              {hasSegments && ` (${enhancedSummary.withdrawalSegments!.length})`}
            </span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-xl mb-1">🏁</span>
            <span className="text-sm font-semibold text-slate-800">{formatCompactCurrency(enhancedSummary.endkapital)}</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-xl mb-1">💰</span>
            <span className="text-sm font-semibold text-green-600">{formatCompactCurrency(enhancedSummary.endkapitalEntspharphase)}</span>
          </div>
        </div>
      )
    }
    else {
      // Desktop: Zeit / Startkapital / Endkapital
      return (
        <div className="w-full">
          <div className="w-full">
            <h4 className="m-0 mb-3 text-slate-800 text-sm font-semibold">
              💸 Entsparphase (
              {withdrawalYearsRange}
              )
              {hasSegments && (
                <span className="text-sm text-teal-600 font-normal">
                  {' '}
                  -
                  {enhancedSummary.withdrawalSegments!.length}
                  {' '}
                  Phasen
                </span>
              )}
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col p-2 bg-gray-50 rounded-md border border-gray-200">
                <span className="text-xs text-gray-600 mb-1">🏁 Startkapital</span>
                <span className="font-semibold text-sm text-slate-800">
                  {enhancedSummary.endkapital.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
              <div className="flex flex-col p-2 bg-gradient-to-br from-green-50 to-green-100 rounded-md border border-green-300">
                <span className="text-xs text-gray-600 mb-1">💰 Endkapital</span>
                <span className="font-semibold text-sm text-green-600">
                  {enhancedSummary.endkapitalEntspharphase.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
              {enhancedSummary.monatlicheAuszahlung && (
                <div className="flex flex-col p-2 bg-gray-50 rounded-md border border-gray-200">
                  <span className="text-xs text-gray-600 mb-1">💶 Monatliche Auszahlung</span>
                  <span className="font-semibold text-sm text-slate-800">
                    {enhancedSummary.monatlicheAuszahlung.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }
  }

  const renderContent = () => {
    return renderEntnahmenContent()
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[999] bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg animate-slide-up">
      <div className="max-w-6xl mx-auto px-4 py-2 md:px-6">
        {renderContent()}
      </div>
    </div>
  )
}
