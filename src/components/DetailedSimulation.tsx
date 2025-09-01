import { Panel } from 'rsuite';
import { useSimulation } from '../contexts/useSimulation';
import { unique } from '../utils/array-utils';
import { useState } from 'react';
import VorabpauschaleExplanationModal from './VorabpauschaleExplanationModal';

// Info icon component for Vorabpauschale explanation
const InfoIcon = ({ onClick }: { onClick: () => void }) => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ 
            marginLeft: '0.5rem', 
            cursor: 'pointer', 
            color: '#1976d2',
            verticalAlign: 'middle'
        }}
        onClick={onClick}
    >
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9,9h0a3,3,0,0,1,6,0c0,2-3,3-3,3"></path>
        <path d="M12,17h.01"></path>
    </svg>
);

const DetailedSimulation = () => {
    const { simulationData } = useSimulation();
    const [showVorabpauschaleModal, setShowVorabpauschaleModal] = useState(false);
    const [selectedVorabDetails, setSelectedVorabDetails] = useState<any>(null);

    if (!simulationData) return null;

    const data = unique(simulationData ? (simulationData.sparplanElements.flatMap((v: any) => v.simulation ? Object.keys(v.simulation) : []).map(Number).filter((v: number) => !isNaN(v))) : []) as number[]

    const handleVorabpauschaleInfoClick = (details: any) => {
        setSelectedVorabDetails(details);
        setShowVorabpauschaleModal(true);
    };

    return (
        <Panel header="📋 Detaillierte Simulation" bordered collapsible defaultExpanded>
            {/* Mobile Optimized View */}
            <div className="mobile-only">
                <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
                    💡 Tipp: Tippen Sie auf ein Jahr für Details
                </div>
                {data
                    .sort((a: number, b: number) => b - a)
                    .map((year, yearIndex) => {
                        const yearData = simulationData?.sparplanElements
                            .map((value: any) => value.simulation?.[Number(year)])
                            .filter(Boolean)
                            .flat();

                        if (!yearData || yearData.length === 0) return null;

                        // Calculate year totals
                        const totalStartkapital = yearData.reduce((sum: number, item: any) => sum + Number(item?.startkapital || 0), 0);
                        const totalZinsen = yearData.reduce((sum: number, item: any) => sum + Number(item?.zinsen || 0), 0);
                        const totalEndkapital = yearData.reduce((sum: number, item: any) => sum + Number(item?.endkapital || 0), 0);
                        const totalSteuer = yearData.reduce((sum: number, item: any) => sum + Number(item?.bezahlteSteuer || 0), 0);

                        return (
                            <Panel
                                key={year + '' + yearIndex}
                                header={`📅 Jahr ${year} - ${totalEndkapital.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €`}
                                bordered
                                collapsible
                                defaultExpanded={false}
                                className="mobile-year-panel"
                            >
                                <div className="mobile-year-summary">
                                    <div className="year-summary-grid">
                                        <div className="year-summary-item">
                                            <span className="summary-label">💰 Startkapital</span>
                                            <span className="summary-value">{totalStartkapital.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                                        </div>
                                        <div className="year-summary-item">
                                            <span className="summary-label">📈 Zinsen</span>
                                            <span className="summary-value">{totalZinsen.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                                        </div>
                                        <div className="year-summary-item">
                                            <span className="summary-label">💸 Steuern</span>
                                            <span className="summary-value">{totalSteuer.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                                        </div>
                                        <div className="year-summary-item highlight">
                                            <span className="summary-label">🎯 Endkapital</span>
                                            <span className="summary-value">{totalEndkapital.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                                        </div>
                                    </div>

                                    {yearData.length > 1 && (
                                        <Panel header={`📊 Details (${yearData.length} Sparpläne)`} bordered collapsible defaultExpanded={false} className="sparplan-details-panel">
                                            {yearData.map((value: any, index: number) => {
                                                if (!value) return null;
                                                return (
                                                    <div key={index} className="mobile-sparplan-item">
                                                        <div className="sparplan-title">💰 Sparplan #{index + 1}</div>
                                                        <div className="sparplan-values">
                                                            <span>Start: {Number(value.startkapital).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                                                            <span>Zinsen: {Number(value.zinsen).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                                                            <span>Ende: {Number(value.endkapital).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                                                        </div>
                                                        {value.vorabpauschaleDetails && (
                                                            <div className="vorab-details" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                                                <span>Basiszins: {(value.vorabpauschaleDetails.basiszins * 100).toFixed(2)}%</span>
                                                                <span>Vorabpauschale: {Number(value.vorabpauschaleDetails.vorabpauschaleAmount).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                                                                <InfoIcon onClick={() => handleVorabpauschaleInfoClick(value.vorabpauschaleDetails)} />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </Panel>
                                    )}
                                </div>
                            </Panel>
                        );
                    })}
            </div>

            {/* Desktop View - Original */}
            <div className="desktop-only">
                {data
                    .sort((a: number, b: number) => b - a)
                    .map((year, index) => {
                        return (
                            <div key={year + '' + index} style={{ marginBottom: '20px' }}>
                                <h3 style={{
                                    color: '#1976d2',
                                    borderBottom: '2px solid #e3f2fd',
                                    paddingBottom: '8px',
                                    margin: '16px 0 12px 0'
                                }}>
                                    📅 Jahr {year}
                                </h3>
                                {simulationData?.sparplanElements
                                    .map((value: any) => value.simulation?.[Number(year)])
                                    .filter(Boolean)
                                    .flat()
                                    .map((value: any, index: number) => {
                                        if (!value) {
                                            return null;
                                        }
                                        return (
                                            <div key={index} style={{
                                                border: '1px solid #e6e6e6',
                                                padding: '12px',
                                                margin: '8px 0',
                                                borderRadius: '6px',
                                                backgroundColor: '#fafafa'
                                            }}>
                                                <div style={{
                                                    fontWeight: 600,
                                                    marginBottom: '8px',
                                                    color: '#333'
                                                }}>
                                                    💰 Sparplan #{index + 1}
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                                    <div>
                                                        <strong>Startkapital:</strong> {Number(value.startkapital).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                                                    </div>
                                                    <div>
                                                        <strong>Zinsen:</strong> {Number(value.zinsen).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                                                    </div>
                                                    <div>
                                                        <strong>Endkapital:</strong> {Number(value.endkapital).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                                                    </div>
                                                </div>

                                                {/* Vorabpauschale Details */}
                                                {value.vorabpauschaleDetails && (
                                                    <div style={{
                                                        marginTop: '12px',
                                                        padding: '8px',
                                                        backgroundColor: '#f0f8ff',
                                                        borderRadius: '4px',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        <div style={{ fontWeight: 600, color: '#1976d2', marginBottom: '6px', display: 'flex', alignItems: 'center' }}>
                                                            📊 Vorabpauschale-Berechnung
                                                            <InfoIcon onClick={() => handleVorabpauschaleInfoClick(value.vorabpauschaleDetails)} />
                                                        </div>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px' }}>
                                                            <div>
                                                                <span style={{ fontWeight: 500 }}>Basiszins:</span> {(value.vorabpauschaleDetails.basiszins * 100).toFixed(2)}%
                                                            </div>
                                                            <div>
                                                                <span style={{ fontWeight: 500 }}>Basisertrag:</span> {Number(value.vorabpauschaleDetails.basisertrag).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                                                            </div>
                                                            <div>
                                                                <span style={{ fontWeight: 500 }}>Vorabpauschale:</span> {Number(value.vorabpauschaleDetails.vorabpauschaleAmount).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                                                            </div>
                                                            <div>
                                                                <span style={{ fontWeight: 500 }}>Steuer vor Freibetrag:</span> {Number(value.vorabpauschaleDetails.steuerVorFreibetrag).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div style={{
                                                    marginTop: '8px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    <div style={{
                                                        color: value.bezahlteSteuer > 0 ? '#d32f2f' : '#388e3c',
                                                        fontWeight: 500
                                                    }}>
                                                        💸 Bezahlte Steuer: {Number(value.bezahlteSteuer).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                                                    </div>
                                                    <div style={{ color: '#666' }}>
                                                        🛡️ Genutzter Freibetrag: {Number(value.genutzterFreibetrag).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        );
                    })}
            </div>

            <VorabpauschaleExplanationModal
                open={showVorabpauschaleModal}
                onClose={() => setShowVorabpauschaleModal(false)}
                selectedVorabDetails={selectedVorabDetails}
            />
        </Panel>
    );
};

export default DetailedSimulation;
