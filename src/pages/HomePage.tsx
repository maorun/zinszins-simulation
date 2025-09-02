import { useEffect, useMemo } from "react";
import { Button } from "rsuite";
import 'rsuite/dist/rsuite.min.css';
import { SimulationProvider } from '../contexts/SimulationContext';
import { useSimulation } from '../contexts/useSimulation';
import Header from '../components/Header';
import SimulationParameters from '../components/SimulationParameters';
import ConfigurationManagement from '../components/ConfigurationManagement';
import { convertSparplanToElements } from "../utils/sparplan-utils";
import SimulationModeSelector from "../components/SimulationModeSelector";

import { getEnhancedOverviewSummary } from "../utils/enhanced-summary";

function EnhancedOverview() {
    const { simulationData, startEnd, withdrawalResults, rendite, steuerlast, teilfreistellungsquote } = useSimulation();

    const enhancedSummary = useMemo(() => {
        return getEnhancedOverviewSummary(
            simulationData,
            startEnd,
            withdrawalResults,
            rendite,
            steuerlast,
            teilfreistellungsquote
        );
    }, [simulationData, startEnd, withdrawalResults, rendite, steuerlast, teilfreistellungsquote]);

    if (!enhancedSummary) return null;

    const savingsStartYear = Math.min(...simulationData.sparplanElements.map((el: any) => new Date(el.start).getFullYear()));
    const savingsEndYear = startEnd[0];

    return (
        <div className="overview-panel">
            <h3 className="overview-title">🎯 Finanzübersicht - Schnelle Eckpunkte</h3>
            <div className="overview-section">
                <h4 className="section-title">📈 Ansparphase ({savingsStartYear} - {savingsEndYear})</h4>
                <div className="metrics-grid">
                    <div className="metric-item highlight">
                        <span className="metric-label">💰 Gesamte Einzahlungen</span>
                        <span className="metric-value">
                            {enhancedSummary.startkapital.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                        </span>
                    </div>
                    <div className="metric-item highlight">
                        <span className="metric-label">🎯 Endkapital Ansparphase</span>
                        <span className="metric-value primary">
                            {enhancedSummary.endkapital.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                        </span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-label">📊 Gesamtzinsen Ansparphase</span>
                        <span className="metric-value">
                            {enhancedSummary.zinsen.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
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
                    <h4 className="section-title">💸 Entsparphase ({startEnd[0]} - {startEnd[1]})</h4>
                    <div className="metrics-grid">
                        <div className="metric-item">
                            <span className="metric-label">🏁 Endkapital Entsparphase</span>
                            <span className="metric-value">
                                {enhancedSummary.endkapitalEntspharphase.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                            </span>
                        </div>
                        <div className="metric-item highlight">
                            <span className="metric-label">💶 Monatliche Auszahlung</span>
                            <span className="metric-value secondary">
                                {(enhancedSummary.monatlicheAuszahlung || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                            </span>
                        </div>
                        {enhancedSummary.renditeEntspharphase !== undefined && (
                            <div className="metric-item">
                                <span className="metric-label">📉 Rendite Entsparphase</span>
                                <span className="metric-value">
                                    {enhancedSummary.renditeEntspharphase.toFixed(2)}% p.a.
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const HomePageContent = () => {
    const { sparplan, startEnd, simulationAnnual, setSparplanElemente, performSimulation, simulationData, isLoading } = useSimulation();

    useEffect(() => {
        performSimulation();
    }, [performSimulation]);

    return (
        <div className="app-container">
            <Header />

            <Button
                onClick={() => {
                    setSparplanElemente(convertSparplanToElements(sparplan, startEnd, simulationAnnual))
                    performSimulation()
                }}
                style={{ marginBottom: '1rem', width: '100%' }}
                appearance="primary"
            >
                🔄 Neu berechnen
            </Button>

            <SimulationParameters />

            <ConfigurationManagement />

            {simulationData && (
                <div className="enhanced-endkapital-overview" style={{ marginTop: '1rem' }}>
                    <EnhancedOverview />
                </div>
            )}

            <SimulationModeSelector />

            {isLoading && (
                <div className="loading-state">
                    ⏳ Berechnung läuft...
                </div>
            )}

            <footer>
                <div>💼 Zinseszins-Simulation</div>
                <div>📧 by Marco</div>
                <div>🚀 Erstellt mit React, TypeScript & RSuite</div>
            </footer>
        </div>
    );
}

export default function HomePage() {
    return (
        <SimulationProvider>
            <HomePageContent />
        </SimulationProvider>
    )
}