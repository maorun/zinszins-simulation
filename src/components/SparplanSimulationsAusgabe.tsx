import { Table } from "rsuite";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { useState } from 'react';
import type { SparplanElement } from "../utils/sparplan-utils";
import type { Summary } from "../utils/summary-utils";
import { fullSummary, getSparplanSummary } from "../utils/summary-utils";
import VorabpauschaleExplanationModal from './VorabpauschaleExplanationModal';

const { Column, HeaderCell, Cell } = Table;

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



export function SparplanEnd({
    elemente,
}: {
    elemente?: SparplanElement[]
}) {
    const summary: Summary = fullSummary(elemente)
    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle>🎯 Endkapital</CardTitle>
            </CardHeader>
            <CardContent>
                <div style={{
                    textAlign: 'center',
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, #28a745, #20c997)',
                    color: 'white',
                    borderRadius: '12px',
                    margin: '1rem 0',
                    boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
                }}>
                    <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem', opacity: 0.9 }}>
                        Ihr Gesamtkapital
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-1px' }}>
                        {thousands(summary.endkapital.toFixed(2))} €
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function SparplanSimulationsAusgabe({
    elemente,
}: {
    elemente?: SparplanElement[]
}) {
    const [showVorabpauschaleModal, setShowVorabpauschaleModal] = useState(false);
    const [selectedVorabDetails, setSelectedVorabDetails] = useState<any>(null);

    const summary: Summary = fullSummary(elemente)
    const tableData = elemente?.sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()
    ).map((el) => ({
        ...el,
        zeitpunkt: new Date(el.start).toLocaleDateString('de-DE'),
        zinsen: getSparplanSummary(el.simulation).zinsen.toFixed(2),
        bezahlteSteuer: getSparplanSummary(
            el.simulation
        ).bezahlteSteuer.toFixed(2),
        endkapital: getSparplanSummary(el.simulation).endkapital?.toFixed(2),
    }));

    const handleVorabpauschaleInfoClick = (details: any) => {
        setSelectedVorabDetails(details);
        setShowVorabpauschaleModal(true);
    };

    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle>📈 Sparplan-Verlauf</CardTitle>
            </CardHeader>
            <CardContent>
                <div style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
                    Detaillierte Aufschlüsselung Ihrer Sparpläne nach Jahren
                </div>
            
            {/* Card Layout for All Devices */}
            <div className="sparplan-cards">
                {tableData?.map((el, index) => (
                    <div key={index} className="sparplan-card">
                        <div className="sparplan-card-header">
                            <span className="sparplan-year">📅 {el.zeitpunkt}</span>
                            <span className="sparplan-endkapital">
                                🎯 {thousands(el.endkapital)} €
                            </span>
                        </div>
                        <div className="sparplan-card-details">
                            <div className="sparplan-detail">
                                <span className="detail-label">💰 Einzahlung:</span>
                                <span className="detail-value" style={{ color: '#28a745' }}>
                                    {thousands(el.einzahlung.toString())} €
                                </span>
                            </div>
                            <div className="sparplan-detail">
                                <span className="detail-label">📈 Zinsen:</span>
                                <span className="detail-value" style={{ color: '#17a2b8' }}>
                                    {thousands(el.zinsen)} €
                                </span>
                            </div>
                            <div className="sparplan-detail">
                                <span className="detail-label">💸 Bezahlte Steuer:</span>
                                <span className="detail-value" style={{ color: '#dc3545' }}>
                                    {thousands(el.bezahlteSteuer)} €
                                </span>
                            </div>
                            
                            {/* Vorabpauschale Information */}
                            {el.simulation && (() => {
                                // Get the latest year with vorabpauschale details for this sparplan
                                const years = Object.keys(el.simulation).map(Number).sort((a, b) => b - a);
                                const latestYearWithVorab = years.find(year => 
                                    el.simulation[year]?.vorabpauschaleDetails
                                );
                                
                                if (latestYearWithVorab && el.simulation[latestYearWithVorab]?.vorabpauschaleDetails) {
                                    const vorabDetails = el.simulation[latestYearWithVorab].vorabpauschaleDetails;
                                    return (
                                        <div className="sparplan-detail">
                                            <span className="detail-label">📊 Vorabpauschale (aktuelles Jahr):</span>
                                            <span className="detail-value" style={{ color: '#1976d2', display: 'flex', alignItems: 'center' }}>
                                                {thousands(vorabDetails.vorabpauschaleAmount.toString())} €
                                                <InfoIcon onClick={() => handleVorabpauschaleInfoClick(vorabDetails)} />
                                            </span>
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                    </div>
                ))}
                
                {/* Summary Card */}
                <div className="sparplan-summary-card">
                    <div className="summary-title">📊 Gesamtübersicht</div>
                    <div className="summary-grid">
                        <div className="summary-item">
                            <span className="summary-label">💰 Einzahlungen</span>
                            <span className="summary-value">
                                {thousands(summary.startkapital?.toFixed(2) || "0")} €
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">📈 Zinsen</span>
                            <span className="summary-value">
                                {thousands(summary.zinsen?.toFixed(2) || "0")} €
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">💸 Steuern</span>
                            <span className="summary-value">
                                {thousands(summary.bezahlteSteuer?.toFixed(2) || "0")} €
                            </span>
                        </div>
                        <div className="summary-item highlight">
                            <span className="summary-label">🎯 Endkapital</span>
                            <span className="summary-value">
                                {thousands(summary.endkapital?.toFixed(2) || "0")} €
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Desktop Table Layout */}
            <div style={{ display: 'none' }}>
                <Table
                    data={tableData}
                    bordered
                    headerHeight={70}
                    style={{ fontSize: '0.9rem' }}
                >
                    <Column width={120}>
                        <HeaderCell style={{ fontWeight: 600, backgroundColor: '#f8f9fa', textAlign: 'center' }}>
                            📅 Jahr
                        </HeaderCell>
                        <Cell dataKey="zeitpunkt" style={{ textAlign: 'center', fontWeight: 500 }} />
                    </Column>

                    <Column flexGrow={1}>
                        <HeaderCell style={{ fontWeight: 600, backgroundColor: '#f8f9fa' }}>
                            <HeaderSummary
                                title="💰 Einzahlung"
                                summary={summary.startkapital?.toFixed(2).toString() || ""}
                            />
                        </HeaderCell>
                        <EnhancedNumberCell dataKey="einzahlung" color="#28a745" />
                    </Column>

                    <Column flexGrow={1}>
                        <HeaderCell style={{ fontWeight: 600, backgroundColor: '#f8f9fa' }}>
                            <HeaderSummary
                                title="💸 Bezahlte Steuer"
                                summary={summary.bezahlteSteuer?.toFixed(2).toString() || ""}
                            />
                        </HeaderCell>
                        <EnhancedNumberCell dataKey="bezahlteSteuer" color="#dc3545" />
                    </Column>
                    
                    <Column flexGrow={1}>
                        <HeaderCell style={{ fontWeight: 600, backgroundColor: '#f8f9fa' }}>
                            <HeaderSummary
                                title="📈 Zinsen"
                                summary={summary.zinsen?.toFixed(2).toString() || ""}
                            />
                        </HeaderCell>
                        <EnhancedNumberCell dataKey="zinsen" color="#17a2b8" />
                    </Column>
                    
                    <Column flexGrow={1}>
                        <HeaderCell style={{ fontWeight: 600, backgroundColor: '#f8f9fa' }}>
                            <HeaderSummary
                                title="🎯 Endkapital"
                                summary={summary.endkapital?.toFixed(2).toString() || ""}
                            />
                        </HeaderCell>
                        <EnhancedNumberCell dataKey="endkapital" color="#2eabdf" bold />
                    </Column>
                </Table>
            </div>
            
            <VorabpauschaleExplanationModal
                open={showVorabpauschaleModal}
                onClose={() => setShowVorabpauschaleModal(false)}
                selectedVorabDetails={selectedVorabDetails}
            />
            </CardContent>
        </Card>
    );
}

const thousands = (value: string) =>
    Number(`${value}`).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const HeaderSummary = ({
    title,
    summary,
}: {
    title: string;
    summary: string;
}) => (
    <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.25rem' }}>
            {title}
        </div>
        <div style={{
            fontSize: '1.1rem',
            color: "#2eabdf",
            fontWeight: 700,
            background: 'linear-gradient(135deg, #2eabdf, #17a2b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
        }}>
            {thousands(summary)} €
        </div>
    </div>
);

const EnhancedNumberCell = ({
    rowData,
    dataKey,
    color = "#333",
    bold = false,
    ...props
}: {
    rowData?: any;
    dataKey: string;
    color?: string;
    bold?: boolean;
}) => (
    <Cell {...props} style={{ textAlign: 'right', paddingRight: '1rem' }}>
        <span style={{ 
            color, 
            fontWeight: bold ? 600 : 500,
            fontSize: bold ? '1rem' : '0.9rem'
        }}>
            {thousands(rowData[dataKey])} €
        </span>
    </Cell>
);

