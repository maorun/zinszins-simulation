// RSuite Table import temporarily removed
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { SparplanElement } from "../utils/sparplan-utils";
import type { Summary } from "../utils/summary-utils";
import { fullSummary, getYearlyPortfolioProgression } from "../utils/summary-utils";
import VorabpauschaleExplanationModal from './VorabpauschaleExplanationModal';
import CalculationExplanationModal from './CalculationExplanationModal';
import { createInterestExplanation, createTaxExplanation } from './calculationHelpers';

// Info icon component for calculation explanations
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

// Removed RSuite Table destructuring



export function SparplanEnd({
    elemente,
}: {
    elemente?: SparplanElement[]
}) {
    const [isOpen, setIsOpen] = useState(false); // Default to closed
    const summary: Summary = fullSummary(elemente)
    return (
        <Card className="mb-4">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CardHeader>
                    <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
                            <CardTitle className="text-left">🎯 Endkapital</CardTitle>
                            {isOpen ? (
                                <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                        </div>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
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
                </CollapsibleContent>
            </Collapsible>
        </Card>
    )
}

export function SparplanSimulationsAusgabe({
    elemente,
}: {
    elemente?: SparplanElement[]
}) {
    const [isVerlaufOpen, setIsVerlaufOpen] = useState(false); // Default to closed
    const [showVorabpauschaleModal, setShowVorabpauschaleModal] = useState(false);
    const [selectedVorabDetails, setSelectedVorabDetails] = useState<any>(null);
    const [showCalculationModal, setShowCalculationModal] = useState(false);
    const [calculationDetails, setCalculationDetails] = useState<any>(null);

    const summary: Summary = fullSummary(elemente)
    
    // Get year-by-year portfolio progression
    const yearlyProgression = getYearlyPortfolioProgression(elemente);
    
    // Convert progression to table data format (reverse order to show newest first)
    const tableData = yearlyProgression
        .sort((a, b) => b.year - a.year)
        .map((progression) => ({
            zeitpunkt: `1.1.${progression.year}`,
            jahr: progression.year,
            einzahlung: progression.yearlyContribution,
            zinsen: progression.yearlyInterest.toFixed(2),
            bezahlteSteuer: progression.yearlyTax.toFixed(2),
            endkapital: progression.totalCapital.toFixed(2),
            cumulativeContributions: progression.cumulativeContributions,
            cumulativeInterest: progression.cumulativeInterest,
            cumulativeTax: progression.cumulativeTax
        }));

    const handleVorabpauschaleInfoClick = (details: any) => {
        setSelectedVorabDetails(details);
        setShowVorabpauschaleModal(true);
    };

    const handleCalculationInfoClick = (explanationType: string, rowData: any) => {
        // Find simulation data for this year to get detailed information
        const yearSimData = elemente?.find(el => el.simulation[rowData.jahr]);
        const simData = yearSimData?.simulation[rowData.jahr];
        
        if (explanationType === 'interest' && simData) {
            const explanation = createInterestExplanation(
                simData.startkapital,
                simData.zinsen,
                5, // Default rendite - would need to get from actual config
                rowData.jahr
            );
            setCalculationDetails(explanation);
            setShowCalculationModal(true);
        } else if (explanationType === 'tax' && simData?.vorabpauschaleDetails) {
            const explanation = createTaxExplanation(
                simData.bezahlteSteuer,
                simData.vorabpauschaleDetails.vorabpauschaleAmount,
                0.26375, // Default tax rate - would need to get from actual config
                0.3, // Default Teilfreistellungsquote - would need to get from actual config
                simData.genutzterFreibetrag || 2000, // Default freibetrag
                rowData.jahr
            );
            setCalculationDetails(explanation);
            setShowCalculationModal(true);
        }
    };

    return (
        <Card className="mb-4">
            <Collapsible open={isVerlaufOpen} onOpenChange={setIsVerlaufOpen}>
                <CardHeader>
                    <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
                            <CardTitle className="text-left">📈 Sparplan-Verlauf</CardTitle>
                            {isVerlaufOpen ? (
                                <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                        </div>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent>
                <div style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
                    Jahr-für-Jahr Progression Ihres Portfolios - zeigt die kumulierte Kapitalentwicklung über die Zeit
                </div>
            
            {/* Card Layout for All Devices */}
            <div className="flex flex-col gap-4">
                {tableData?.map((row, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                            <span className="font-semibold text-gray-800 text-base">📅 {row.zeitpunkt}</span>
                            <span className="font-bold text-blue-600 text-lg">
                                🎯 {thousands(row.endkapital)} €
                            </span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-600 font-medium">💰 Neue Einzahlung:</span>
                                <span className="font-semibold text-green-600 text-sm">
                                    {thousands(row.einzahlung.toString())} €
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-600 font-medium">📈 Zinsen (Jahr):</span>
                                <span className="font-semibold text-cyan-600 text-sm flex items-center">
                                    {thousands(row.zinsen)} €
                                    <InfoIcon onClick={() => handleCalculationInfoClick('interest', row)} />
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-600 font-medium">💸 Bezahlte Steuer (Jahr):</span>
                                <span className="font-semibold text-red-600 text-sm flex items-center">
                                    {thousands(row.bezahlteSteuer)} €
                                    <InfoIcon onClick={() => handleCalculationInfoClick('tax', row)} />
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-600 font-medium">💼 Kumulierte Einzahlungen:</span>
                                <span className="font-semibold text-gray-600 text-sm">
                                    {thousands(row.cumulativeContributions.toFixed(2))} €
                                </span>
                            </div>
                            
                            {/* Find Vorabpauschale details for this year */}
                            {(() => {
                                // Find any element that has vorabpauschale details for this year
                                const elementWithVorab = elemente?.find(el => 
                                    el.simulation[row.jahr]?.vorabpauschaleDetails
                                );
                                
                                if (elementWithVorab?.simulation[row.jahr]?.vorabpauschaleDetails) {
                                    const vorabDetails = elementWithVorab.simulation[row.jahr].vorabpauschaleDetails;
                                    return (
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-sm text-gray-600 font-medium">📊 Vorabpauschale (Beispiel):</span>
                                            <span className="font-semibold text-blue-700 text-sm flex items-center">
                                                {thousands(vorabDetails?.vorabpauschaleAmount?.toString() || "0")} €
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
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-blue-500 rounded-xl p-5 mt-2">
                    <div className="text-lg font-bold text-blue-500 text-center mb-4">📊 Gesamtübersicht</div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col text-center p-2 bg-white rounded border border-gray-300">
                            <span className="text-xs mb-1 opacity-80">💰 Einzahlungen</span>
                            <span className="font-bold text-sm">
                                {thousands(summary.startkapital?.toFixed(2) || "0")} €
                            </span>
                        </div>
                        <div className="flex flex-col text-center p-2 bg-white rounded border border-gray-300">
                            <span className="text-xs mb-1 opacity-80">📈 Zinsen</span>
                            <span className="font-bold text-sm">
                                {thousands(summary.zinsen?.toFixed(2) || "0")} €
                            </span>
                        </div>
                        <div className="flex flex-col text-center p-2 bg-white rounded border border-gray-300">
                            <span className="text-xs mb-1 opacity-80">💸 Steuern</span>
                            <span className="font-bold text-sm">
                                {thousands(summary.bezahlteSteuer?.toFixed(2) || "0")} €
                            </span>
                        </div>
                        <div className="flex flex-col text-center p-2 bg-gradient-to-br from-green-500 to-teal-500 text-white rounded border border-green-500">
                            <span className="text-xs mb-1 opacity-90">🎯 Endkapital</span>
                            <span className="font-bold text-sm">
                                {thousands(summary.endkapital?.toFixed(2) || "0")} €
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            
            <VorabpauschaleExplanationModal
                open={showVorabpauschaleModal}
                onClose={() => setShowVorabpauschaleModal(false)}
                selectedVorabDetails={selectedVorabDetails}
            />
            
            {calculationDetails && (
                <CalculationExplanationModal
                    open={showCalculationModal}
                    onClose={() => setShowCalculationModal(false)}
                    title={calculationDetails.title}
                    introduction={calculationDetails.introduction}
                    steps={calculationDetails.steps}
                    finalResult={calculationDetails.finalResult}
                />
            )}
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}

const thousands = (value: string) =>
    Number(`${value}`).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

