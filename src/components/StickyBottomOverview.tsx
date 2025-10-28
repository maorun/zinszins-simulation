import React, { useState, useEffect, useMemo } from 'react'
import { useSimulation } from '../contexts/useSimulation'
import { getEnhancedOverviewSummary } from '../utils/enhanced-summary'
import type { EnhancedSummary } from '../utils/summary-utils'

const formatCompactCurrency = (amount: number) => {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M €`
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}k €`
  return amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
}

interface WithdrawalViewProps {
  withdrawalYearsRange: string
  hasSegments: boolean
  summary: EnhancedSummary
}

const MobileWithdrawalView = ({ withdrawalYearsRange, hasSegments, summary }: WithdrawalViewProps) => {
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

const DesktopWithdrawalView = ({ withdrawalYearsRange, hasSegments, summary }: WithdrawalViewProps) => {
  const segmentCount = hasSegments && summary.withdrawalSegments ? summary.withdrawalSegments.length : 0
  return (
    <div className="w-full">
      <h4 className="m-0 mb-3 text-slate-800 text-sm font-semibold">
        💸 Entsparphase (
        {withdrawalYearsRange}
        )
        {hasSegments && (
          <span className="text-sm text-teal-600 font-normal">
            {' '}
            -
            {' '}
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
            {(summary.endkapitalEntspharphase ?? 0).toLocaleString('de-DE', {
              style: 'currency',
              currency: 'EUR',
            })}
          </span>
        </div>
        {summary.monatlicheAuszahlung && (
          <div className="flex flex-col p-2 bg-gray-50 rounded-md border border-gray-200">
            <span className="text-xs text-gray-600 mb-1">💶 Monatliche Auszahlung</span>
            <span className="font-semibold text-sm text-slate-800">
              {summary.monatlicheAuszahlung.toLocaleString('de-DE', {
                style: 'currency',
                currency: 'EUR',
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

const useStickyState = (overviewElementRef: React.RefObject<HTMLElement | null>) => {
  const [isSticky, setIsSticky] = useState(false)
  useEffect(() => {
    const handleScroll = () => {
      if (overviewElementRef.current) {
        setIsSticky(overviewElementRef.current.getBoundingClientRect().bottom < 0)
      }
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [overviewElementRef])
  return isSticky
}

const useMobileView = () => {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  return isMobile
}

const useEnhancedSummary = () => {
  const {
    simulationData,
    startEnd,
    withdrawalResults,
    rendite,
    steuerlast,
    teilfreistellungsquote,
    endOfLife,
  } = useSimulation()
  return useMemo(
    () =>
      getEnhancedOverviewSummary(
        simulationData,
        startEnd,
        withdrawalResults,
        rendite,
        steuerlast,
        teilfreistellungsquote,
        undefined,
        endOfLife,
      ),
    [
      simulationData,
      startEnd,
      withdrawalResults,
      rendite,
      steuerlast,
      teilfreistellungsquote,
      endOfLife,
    ],
  )
}

interface WithdrawalOverviewContentProps {
  enhancedSummary: EnhancedSummary
  startEnd: [number, number]
  endOfLife: number | undefined
  isMobile: boolean
}

const WithdrawalOverviewContent = ({
  enhancedSummary,
  startEnd,
  endOfLife,
  isMobile,
}: WithdrawalOverviewContentProps) => {
  const withdrawalStartYear = startEnd[0] + 1
  const withdrawalEndYear = endOfLife || startEnd[1]
  const withdrawalYearsRange = `${withdrawalStartYear} - ${withdrawalEndYear}`
  const hasSegments
    = !!(
      enhancedSummary.isSegmentedWithdrawal
      && enhancedSummary.withdrawalSegments
      && enhancedSummary.withdrawalSegments.length > 1
    )

  return (
    <div className="max-w-6xl mx-auto px-4 py-2 md:px-6">
      {isMobile ? (
        <MobileWithdrawalView
          withdrawalYearsRange={withdrawalYearsRange}
          hasSegments={hasSegments}
          summary={enhancedSummary}
        />
      ) : (
        <DesktopWithdrawalView
          withdrawalYearsRange={withdrawalYearsRange}
          hasSegments={hasSegments}
          summary={enhancedSummary}
        />
      )}
    </div>
  )
}

export function StickyBottomOverview({
  overviewElementRef,
}: {
  overviewElementRef: React.RefObject<HTMLElement | null>
}) {
  const isSticky = useStickyState(overviewElementRef)
  const isMobile = useMobileView()
  const enhancedSummary = useEnhancedSummary()
  const { simulationData, startEnd, endOfLife } = useSimulation()

  const shouldRender = isSticky && enhancedSummary && simulationData && enhancedSummary.endkapitalEntspharphase

  if (!shouldRender) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[999] bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg animate-slide-up">
      <WithdrawalOverviewContent
        enhancedSummary={enhancedSummary}
        startEnd={startEnd}
        endOfLife={endOfLife}
        isMobile={isMobile}
      />
    </div>
  )
}
