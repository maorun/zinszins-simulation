import React, { useState, useEffect, useMemo } from 'react';
import { useSimulation } from '../contexts/useSimulation';
import { getEnhancedOverviewSummary } from '../utils/enhanced-summary';

interface StickyBottomOverviewProps {
  activeTab: 'ansparen' | 'entnehmen';
  overviewElementRef: React.RefObject<HTMLElement | null>;
}

export function StickyBottomOverview({ activeTab, overviewElementRef }: StickyBottomOverviewProps) {
  const [isSticky, setIsSticky] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const {
    simulationData,
    startEnd,
    withdrawalResults,
    rendite,
    steuerlast,
    teilfreistellungsquote,
  } = useSimulation();

  const enhancedSummary = useMemo(() => {
    return getEnhancedOverviewSummary(
      simulationData,
      startEnd,
      withdrawalResults,
      rendite,
      steuerlast,
      teilfreistellungsquote,
    );
  }, [
    simulationData,
    startEnd,
    withdrawalResults,
    rendite,
    steuerlast,
    teilfreistellungsquote,
  ]);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track scroll position to show/hide sticky bottom header
  useEffect(() => {
    const handleScroll = () => {
      if (!overviewElementRef.current) return;
      
      const overviewRect = overviewElementRef.current.getBoundingClientRect();
      const shouldBeSticky = overviewRect.bottom < 0;
      setIsSticky(shouldBeSticky);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [overviewElementRef]);

  // Only show when main overview is not visible and we have data
  if (!isSticky || !enhancedSummary || !simulationData) {
    return null;
  }

  // Calculate years range
  const startDates = simulationData.sparplanElements.map((el: any) => new Date(el.start).getFullYear());
  const savingsStartYear = Math.min(...startDates);
  const savingsEndYear = startEnd[0];
  const yearsRange = `${savingsStartYear} - ${savingsEndYear}`;

  // Helper function to format currency in compact form for mobile
  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M €`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k €`;
    }
    return amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  };

  const renderAnsparenContent = () => {
    if (isMobile) {
      // Mobile: Compact view with icons and key metrics
      return (
        <div className="flex justify-around items-center gap-4">
          <div className="flex flex-col items-center text-center">
            <span className="text-xl mb-1">⏱️</span>
            <span className="text-xs font-semibold text-slate-800">{yearsRange}</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-xl mb-1">🎯</span>
            <span className="text-sm font-semibold text-green-600">{formatCompactCurrency(enhancedSummary.endkapital)}</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-xl mb-1">📈</span>
            <span className="text-xs font-semibold text-slate-800">{enhancedSummary.renditeAnsparphase.toFixed(1)}%</span>
          </div>
        </div>
      );
    } else {
      // Desktop: More detailed view
      return (
        <div className="w-full">
          <div className="w-full">
            <h4 className="m-0 mb-3 text-slate-800 text-sm font-semibold">🎯 Endsparphase ({yearsRange})</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col p-2 bg-gradient-to-br from-green-50 to-green-100 rounded-md border border-green-300">
                <span className="text-xs text-gray-600 mb-1">🎯 Endkapital</span>
                <span className="font-semibold text-sm text-green-600">
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
                  {enhancedSummary.renditeAnsparphase.toFixed(2)}% p.a.
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  const renderEntnahmenContent = () => {
    if (!enhancedSummary.endkapitalEntspharphase) {
      return null;
    }

    const withdrawalStartYear = startEnd[0] + 1;
    const withdrawalEndYear = startEnd[1];
    const withdrawalYearsRange = `${withdrawalStartYear} - ${withdrawalEndYear}`;
    
    // Check if we have segmented withdrawal
    const hasSegments = enhancedSummary.isSegmentedWithdrawal && 
                       enhancedSummary.withdrawalSegments && 
                       enhancedSummary.withdrawalSegments.length > 1;

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
      );
    } else {
      // Desktop: Zeit / Startkapital / Endkapital
      return (
        <div className="w-full">
          <div className="w-full">
            <h4 className="m-0 mb-3 text-slate-800 text-sm font-semibold">
              💸 Entsparphase ({withdrawalYearsRange})
              {hasSegments && (
                <span className="text-sm text-teal-600 font-normal"> - {enhancedSummary.withdrawalSegments!.length} Phasen</span>
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
      );
    }
  };

  const renderContent = () => {
    return activeTab === 'ansparen' ? renderAnsparenContent() : renderEntnahmenContent();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[999] bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg animate-slide-up">
      <div className="max-w-6xl mx-auto px-4 py-2 md:px-6">
        {renderContent()}
      </div>
    </div>
  );
}