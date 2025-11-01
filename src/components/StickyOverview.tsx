import React, { useMemo } from 'react'
import { useSimulation } from '../contexts/useSimulation'
import { getEnhancedOverviewSummary } from '../utils/enhanced-summary'
import { formatCompactCurrency } from '../utils/currency'
import { getYearsRange } from '../utils/years-range'
import { useMobileDetection } from '../hooks/useMobileDetection'
import { useStickyBehavior } from '../hooks/useStickyBehavior'
import { BurgerNavigation } from './BurgerNavigation'

interface StickyOverviewProps {
  overviewElementRef: React.RefObject<HTMLElement | null>
}

/**
 * Mobile view for Ansparphase
 */
function MobileAnsparenView({
  yearsRange,
  enhancedSummary,
  formatCompactCurrency,
}: {
  yearsRange: string
  enhancedSummary: ReturnType<typeof getEnhancedOverviewSummary> | null
  formatCompactCurrency: (amount: number) => string
}) {
  if (!enhancedSummary) return null

  return (
    <div className="flex justify-around items-center gap-4">
      <div className="flex flex-col items-center text-center">
        <span className="text-xl mb-1">⏱️</span>
        <span className="text-sm font-semibold text-slate-800">{yearsRange}</span>
      </div>
      <div className="flex flex-col items-center text-center">
        <span className="text-xl mb-1">🎯</span>
        <span className="text-sm font-semibold text-slate-800">
          {formatCompactCurrency(enhancedSummary.endkapital)}
        </span>
      </div>
      <div className="flex flex-col items-center text-center">
        <span className="text-xl mb-1">📈</span>
        <span className="text-sm font-semibold text-slate-800">
          {enhancedSummary.renditeAnsparphase.toFixed(1)}
          %
        </span>
      </div>
    </div>
  )
}

/**
 * Desktop view for Ansparphase
 */
function DesktopAnsparenView({
  yearsRange,
  enhancedSummary,
}: {
  yearsRange: string
  enhancedSummary: ReturnType<typeof getEnhancedOverviewSummary> | null
}) {
  if (!enhancedSummary) return null

  return (
    <div className="w-full">
      <div className="w-full">
        <h4 className="m-0 mb-3 text-slate-800 text-base font-semibold">
          📈 Ansparphase (
          {yearsRange}
          )
        </h4>
        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col p-2 bg-gray-50 rounded-md border border-gray-200">
            <span className="text-xs text-gray-600 mb-1">💰 Einzahlungen</span>
            <span className="font-semibold text-sm text-slate-800">
              {enhancedSummary.startkapital.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </span>
          </div>
          <div className="flex flex-col p-2 bg-gradient-to-br from-green-50 to-green-100 rounded-md border border-green-300">
            <span className="text-xs text-gray-600 mb-1">🎯 Endkapital</span>
            <span className="font-semibold text-sm text-slate-800">
              {enhancedSummary.endkapital.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </span>
          </div>
          <div className="flex flex-col p-2 bg-gray-50 rounded-md border border-gray-200">
            <span className="text-xs text-gray-600 mb-1">📊 Zinsen</span>
            <span className="font-semibold text-sm text-slate-800">
              {enhancedSummary.zinsen.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </span>
          </div>
          <div className="flex flex-col p-2 bg-gray-50 rounded-md border border-gray-200">
            <span className="text-xs text-gray-600 mb-1">📈 Rendite</span>
            <span className="font-semibold text-sm text-slate-800">
              {enhancedSummary.renditeAnsparphase.toFixed(2)}
              % p.a.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Content display component that handles mobile vs desktop rendering
 */
function AnsparenContent({
  isMobile,
  yearsRange,
  enhancedSummary,
}: {
  isMobile: boolean
  yearsRange: string
  enhancedSummary: ReturnType<typeof getEnhancedOverviewSummary> | null
}) {
  return isMobile
    ? (
        <MobileAnsparenView
          yearsRange={yearsRange}
          enhancedSummary={enhancedSummary}
          formatCompactCurrency={formatCompactCurrency}
        />
      )
    : <DesktopAnsparenView yearsRange={yearsRange} enhancedSummary={enhancedSummary} />
}

export function StickyOverview({ overviewElementRef }: StickyOverviewProps) {
  const isMobile = useMobileDetection()
  const isSticky = useStickyBehavior(overviewElementRef)
  const {
    simulationData,
    startEnd,
    withdrawalResults,
    rendite,
    steuerlast,
    teilfreistellungsquote,
    endOfLife,
  } = useSimulation()

  const enhancedSummary = useMemo(() => getEnhancedOverviewSummary(
    simulationData,
    startEnd,
    withdrawalResults,
    rendite,
    steuerlast,
    teilfreistellungsquote,
    undefined,
    endOfLife,
  ), [simulationData, startEnd, withdrawalResults, rendite, steuerlast, teilfreistellungsquote, endOfLife])

  if (!isSticky || !enhancedSummary || !simulationData) return null

  const yearsRange = getYearsRange(simulationData, startEnd[0])

  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg animate-slide-down">
      <div className="max-w-6xl mx-auto px-4 py-3 md:px-6 relative">
        <div className="absolute top-3 right-4 md:right-6">
          <BurgerNavigation />
        </div>
        <AnsparenContent
          isMobile={isMobile}
          yearsRange={yearsRange}
          enhancedSummary={enhancedSummary}
        />
      </div>
    </div>
  )
}
