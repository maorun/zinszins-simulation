import React, { useState, useEffect, useMemo } from 'react'
import { useSimulation } from '../contexts/useSimulation'
import { getEnhancedOverviewSummary } from '../utils/enhanced-summary'
import type { EnhancedSummary } from '../utils/summary-utils'

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

  // Render mobile view of withdrawal summary
  const renderMobileWithdrawalView = (
    withdrawalYearsRange: string,
    hasSegments: boolean,
    summary: EnhancedSummary,
  ) => {
    const segmentCount = hasSegments && summary.withdrawalSegments ? summary.withdrawalSegments.length : 0
    return (
      <div className="flex justify-around items-center gap-4">
        <div className="flex flex-col items-center text-center">
          <span className="text-xl mb-1">⏱️</span>
          <span className="text-xs font-semibold text-slate-800">
            {withdrawalYearsRange}
            {hasSegments && ` (${segmentCount})`}
          </span>
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="text-xl mb-1">🏁</span>
          <span className="text-sm font-semibold text-slate-800">{formatCompactCurrency(summary.endkapital)}</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="text-xl mb-1">💰</span>
          <span className="text-sm font-semibold text-green-600">
            {formatCompactCurrency(summary.endkapitalEntspharphase ?? 0)}
          </span>
        </div>
      </div>
    )
  }

  // Render desktop view of withdrawal summary
  const renderDesktopWithdrawalView = (
    withdrawalYearsRange: string,
    hasSegments: boolean,
    summary: EnhancedSummary,
  ) => {
    const segmentCount = hasSegments && summary.withdrawalSegments ? summary.withdrawalSegments.length : 0
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
                {segmentCount}
                {' '}
                Phasen
              </span>
            )}
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col p-2 bg-gray-50 rounded-md border border-gray-200">
              <span className="text-xs text-gray-600 mb-1">🏁 Startkapital</span>
              <span className="font-semibold text-sm text-slate-800">
                {summary.endkapital.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>
            <div className="flex flex-col p-2 bg-gradient-to-br from-green-50 to-green-100 rounded-md border border-green-300">
              <span className="text-xs text-gray-600 mb-1">💰 Endkapital</span>
              <span className="font-semibold text-sm text-green-600">
                {(summary.endkapitalEntspharphase ?? 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>
            {summary.monatlicheAuszahlung && (
              <div className="flex flex-col p-2 bg-gray-50 rounded-md border border-gray-200">
                <span className="text-xs text-gray-600 mb-1">💶 Monatliche Auszahlung</span>
                <span className="font-semibold text-sm text-slate-800">
                  {summary.monatlicheAuszahlung.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Helper to calculate withdrawal end year
  const calculateWithdrawalEndYear = (
    summary: EnhancedSummary,
    endOfLife: number | undefined,
    fallbackEndYear: number,
  ): number => {
    let withdrawalEndYear = endOfLife || fallbackEndYear

    // If we have segmented withdrawal, use the actual end year from segments
    const hasSegments = summary.isSegmentedWithdrawal
      && summary.withdrawalSegments
      && summary.withdrawalSegments.length > 0

    if (hasSegments) {
      const segmentEndYears = summary.withdrawalSegments!
        .map((segment: { endYear: number | null }) => segment.endYear)
        .filter((year: number | null): year is number => typeof year === 'number' && !isNaN(year))

      if (segmentEndYears.length > 0) {
        withdrawalEndYear = Math.max(...segmentEndYears)
      }
    }

    return withdrawalEndYear
  }

  // Helper to check if we have multiple withdrawal segments
  const hasMultipleSegments = (summary: EnhancedSummary): boolean => {
    return summary.isSegmentedWithdrawal === true
      && summary.withdrawalSegments !== undefined
      && summary.withdrawalSegments.length > 1
  }

  const renderEntnahmenContent = () => {
    if (!enhancedSummary.endkapitalEntspharphase) {
      return null
    }

    const withdrawalStartYear = startEnd[0] + 1
    const withdrawalEndYear = calculateWithdrawalEndYear(enhancedSummary, endOfLife, startEnd[1])
    const withdrawalYearsRange = `${withdrawalStartYear} - ${withdrawalEndYear}`
    const hasSegments = hasMultipleSegments(enhancedSummary)

    return isMobile
      ? renderMobileWithdrawalView(withdrawalYearsRange, hasSegments, enhancedSummary)
      : renderDesktopWithdrawalView(withdrawalYearsRange, hasSegments, enhancedSummary)
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
