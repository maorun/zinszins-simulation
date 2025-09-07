import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import ConfigurationManagement from "../components/ConfigurationManagement";
import Header from "../components/Header";
import SimulationModeSelector from "../components/SimulationModeSelector";
import SimulationParameters from "../components/SimulationParameters";
import { StickyOverview } from "../components/StickyOverview";
import { SimulationProvider } from "../contexts/SimulationContext";
import { useSimulation } from "../contexts/useSimulation";
import { getEnhancedOverviewSummary } from "../utils/enhanced-summary";
import { convertSparplanToElements } from "../utils/sparplan-utils";

function EnhancedOverview() {
  const {
    simulationData,
    startEnd,
    withdrawalResults,
    rendite,
    steuerlast,
    teilfreistellungsquote,
    withdrawalConfig,
  } = useSimulation();

  const enhancedSummary = useMemo(() => {
    return getEnhancedOverviewSummary(
      simulationData,
      startEnd,
      withdrawalResults,
      rendite,
      steuerlast,
      teilfreistellungsquote,
      withdrawalConfig,
    );
  }, [
    simulationData,
    startEnd,
    withdrawalResults,
    rendite,
    steuerlast,
    teilfreistellungsquote,
    withdrawalConfig,
  ]);

  if (!enhancedSummary) return null;

  const savingsStartYear = Math.min(
    ...simulationData.sparplanElements.map((el: any) =>
      new Date(el.start).getFullYear(),
    ),
  );
  const savingsEndYear = startEnd[0];

  return (
    <div className="overview-panel">
      <h3 className="overview-title">
        🎯 Finanzübersicht - Schnelle Eckpunkte
      </h3>
      <div className="overview-section">
        <h4 className="section-title">
          📈 Ansparphase ({savingsStartYear} - {savingsEndYear})
        </h4>
        <div className="metrics-grid">
          <div className="metric-item highlight">
            <span className="metric-label">💰 Gesamte Einzahlungen</span>
            <span className="metric-value">
              {enhancedSummary.startkapital.toLocaleString("de-DE", {
                style: "currency",
                currency: "EUR",
              })}
            </span>
          </div>
          <div className="metric-item highlight">
            <span className="metric-label">🎯 Endkapital Ansparphase</span>
            <span className="metric-value primary">
              {enhancedSummary.endkapital.toLocaleString("de-DE", {
                style: "currency",
                currency: "EUR",
              })}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">📊 Gesamtzinsen Ansparphase</span>
            <span className="metric-value">
              {enhancedSummary.zinsen.toLocaleString("de-DE", {
                style: "currency",
                currency: "EUR",
              })}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">📈 Rendite Ansparphase</span>
            <span className="metric-value">
              {enhancedSummary.renditeAnsparphase.toFixed(2)}% p.a.
            </span>
          </div>
        </div>
      </div>
      {enhancedSummary.endkapitalEntspharphase !== undefined && (
        <div className="overview-section">
          <h4 className="section-title">
            💸 Entsparphase ({startEnd[0] + 1} - {startEnd[1]})
            {enhancedSummary.isSegmentedWithdrawal && enhancedSummary.withdrawalSegments && enhancedSummary.withdrawalSegments.length > 1 && (
              <span className="segmented-indicator"> - {enhancedSummary.withdrawalSegments.length} Phasen</span>
            )}
          </h4>
          
          {enhancedSummary.isSegmentedWithdrawal && enhancedSummary.withdrawalSegments && enhancedSummary.withdrawalSegments.length > 1 ? (
            // Display segmented withdrawal phases
            <div className="segmented-withdrawal-overview">
              {enhancedSummary.withdrawalSegments.map((segment) => (
                <div key={segment.id} className="segment-summary">
                  <h5 className="segment-title">
                    {segment.name} ({segment.startYear} - {segment.endYear}) - {segment.strategy}
                  </h5>
                  <div className="metrics-grid">
                    <div className="metric-item">
                      <span className="metric-label">🏁 Startkapital</span>
                      <span className="metric-value">
                        {segment.startkapital.toLocaleString("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">💰 Endkapital</span>
                      <span className="metric-value">
                        {segment.endkapital.toLocaleString("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">💸 Entnahme gesamt</span>
                      <span className="metric-value">
                        {segment.totalWithdrawn.toLocaleString("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </span>
                    </div>
                    {segment.averageMonthlyWithdrawal > 0 && (
                      <div className="metric-item">
                        <span className="metric-label">💶 Monatlich Ø</span>
                        <span className="metric-value">
                          {segment.averageMonthlyWithdrawal.toLocaleString("de-DE", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Overall withdrawal summary */}
              <div className="segment-summary overall-summary">
                <h5 className="segment-title">📊 Gesamt-Übersicht</h5>
                <div className="metrics-grid">
                  <div className="metric-item highlight">
                    <span className="metric-label">🏁 Endkapital Gesamt</span>
                    <span className="metric-value">
                      {enhancedSummary.endkapitalEntspharphase.toLocaleString(
                        "de-DE",
                        { style: "currency", currency: "EUR" },
                      )}
                    </span>
                  </div>
                  {enhancedSummary.monatlicheAuszahlung && (
                    <div className="metric-item highlight">
                      <span className="metric-label">💶 Letzte Monatl. Auszahlung</span>
                      <span className="metric-value secondary">
                        {enhancedSummary.monatlicheAuszahlung.toLocaleString(
                          "de-DE",
                          { style: "currency", currency: "EUR" },
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Display single withdrawal phase (original format)
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">🏁 Endkapital Entsparphase</span>
                <span className="metric-value">
                  {enhancedSummary.endkapitalEntspharphase.toLocaleString(
                    "de-DE",
                    { style: "currency", currency: "EUR" },
                  )}
                </span>
              </div>
              <div className="metric-item highlight">
                <span className="metric-label">💶 Monatliche Auszahlung</span>
                <span className="metric-value secondary">
                  {(enhancedSummary.monatlicheAuszahlung || 0).toLocaleString(
                    "de-DE",
                    { style: "currency", currency: "EUR" },
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const HomePageContent = () => {
  const {
    sparplan,
    startEnd,
    simulationAnnual,
    setSparplanElemente,
    performSimulation,
    simulationData,
    isLoading,
  } = useSimulation();

  const [activeTab, setActiveTab] = useState<'ansparen' | 'entnehmen'>('ansparen');
  const overviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    performSimulation();
  }, [performSimulation]);

  return (
    <div className="app-container">
      <Header />

      <Button
        onClick={() => {
          setSparplanElemente(
            convertSparplanToElements(sparplan, startEnd, simulationAnnual),
          );
          performSimulation();
        }}
        className="mb-4 w-full"
        variant="default"
      >
        🔄 Neu berechnen
      </Button>

      {simulationData && (
        <div
          ref={overviewRef}
          className="enhanced-endkapital-overview"
          style={{ marginTop: "1rem" }}
        >
          <EnhancedOverview />
        </div>
      )}

      <SimulationParameters />

      <ConfigurationManagement />

      <SimulationModeSelector onTabChange={setActiveTab} />

      {/* Sticky Overview */}
      <StickyOverview 
        activeTab={activeTab} 
        overviewElementRef={overviewRef}
      />

      {isLoading && <div className="loading-state">⏳ Berechnung läuft...</div>}

      <footer>
        <div>💼 Zinseszins-Simulation</div>
        <div>📧 by Marco</div>
        <div>🚀 Erstellt mit React, TypeScript & RSuite</div>
      </footer>
    </div>
  );
};

export default function HomePage() {
  return (
    <SimulationProvider>
      <HomePageContent />
    </SimulationProvider>
  );
}

