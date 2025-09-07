import React, { useState, useEffect, useMemo } from 'react';
import { useSimulation } from '../contexts/useSimulation';
import { getEnhancedOverviewSummary } from '../utils/enhanced-summary';

interface StickyOverviewProps {
  activeTab: 'ansparen' | 'entnehmen';
  overviewElementRef: React.RefObject<HTMLElement | null>;
}

export function StickyOverview({ activeTab, overviewElementRef }: StickyOverviewProps) {
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

  // Track scroll position to show/hide sticky header
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
      // Mobile: Zeit / Endkapital Ansparphase / Rendite (symbols and numbers only)
      return (
        <div className="sticky-overview-mobile">
          <div className="sticky-metric">
            <span className="sticky-symbol">⏱️</span>
            <span className="sticky-value">{yearsRange}</span>
          </div>
          <div className="sticky-metric">
            <span className="sticky-symbol">🎯</span>
            <span className="sticky-value">{formatCompactCurrency(enhancedSummary.endkapital)}</span>
          </div>
          <div className="sticky-metric">
            <span className="sticky-symbol">📈</span>
            <span className="sticky-value">{enhancedSummary.renditeAnsparphase.toFixed(1)}%</span>
          </div>
        </div>
      );
    } else {
      // Desktop: Complete savings phase data
      return (
        <div className="sticky-overview-desktop">
          <div className="sticky-section">
            <h4 className="sticky-section-title">📈 Ansparphase ({yearsRange})</h4>
            <div className="sticky-metrics-grid">
              <div className="sticky-metric-item">
                <span className="sticky-metric-label">💰 Einzahlungen</span>
                <span className="sticky-metric-value">
                  {enhancedSummary.startkapital.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
              <div className="sticky-metric-item highlight">
                <span className="sticky-metric-label">🎯 Endkapital</span>
                <span className="sticky-metric-value">
                  {enhancedSummary.endkapital.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
              <div className="sticky-metric-item">
                <span className="sticky-metric-label">📊 Zinsen</span>
                <span className="sticky-metric-value">
                  {enhancedSummary.zinsen.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
              <div className="sticky-metric-item">
                <span className="sticky-metric-label">📈 Rendite</span>
                <span className="sticky-metric-value">
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
        <div className="sticky-overview-mobile">
          <div className="sticky-metric">
            <span className="sticky-symbol">⏱️</span>
            <span className="sticky-value">
              {withdrawalYearsRange}
              {hasSegments && ` (${enhancedSummary.withdrawalSegments!.length})`}
            </span>
          </div>
          <div className="sticky-metric">
            <span className="sticky-symbol">🏁</span>
            <span className="sticky-value">{formatCompactCurrency(enhancedSummary.endkapital)}</span>
          </div>
          <div className="sticky-metric">
            <span className="sticky-symbol">💰</span>
            <span className="sticky-value">{formatCompactCurrency(enhancedSummary.endkapitalEntspharphase)}</span>
          </div>
        </div>
      );
    } else {
      // Desktop: Zeit / Startkapital / Endkapital
      return (
        <div className="sticky-overview-desktop">
          <div className="sticky-section">
            <h4 className="sticky-section-title">
              💸 Entsparphase ({withdrawalYearsRange})
              {hasSegments && (
                <span className="sticky-segmented-indicator"> - {enhancedSummary.withdrawalSegments!.length} Phasen</span>
              )}
            </h4>
            <div className="sticky-metrics-grid">
              <div className="sticky-metric-item">
                <span className="sticky-metric-label">🏁 Startkapital</span>
                <span className="sticky-metric-value">
                  {enhancedSummary.endkapital.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
              <div className="sticky-metric-item highlight">
                <span className="sticky-metric-label">💰 Endkapital</span>
                <span className="sticky-metric-value">
                  {enhancedSummary.endkapitalEntspharphase.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
              {enhancedSummary.monatlicheAuszahlung && (
                <div className="sticky-metric-item">
                  <span className="sticky-metric-label">💶 Monatliche Auszahlung</span>
                  <span className="sticky-metric-value">
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

  return (
    <div className="sticky-overview">
      <div className="sticky-overview-content">
        {activeTab === 'ansparen' ? renderAnsparenContent() : renderEntnahmenContent()}
      </div>
    </div>
  );
}