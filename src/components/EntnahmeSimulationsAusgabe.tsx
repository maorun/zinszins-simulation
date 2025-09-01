import { useMemo, useEffect } from "react";
import {
    Form,
    InputNumber,
    Panel,
    Radio,
    RadioGroup,
    RadioTile,
    RadioTileGroup,
    Slider,
    Table,
    Toggle
} from "rsuite";
import 'rsuite/dist/rsuite.min.css';
import type { SparplanElement } from "../utils/sparplan-utils";
import { calculateWithdrawal, calculateSegmentedWithdrawal, getTotalCapitalAtYear, calculateWithdrawalDuration } from "../../helpers/withdrawal";
import type { WithdrawalStrategy, WithdrawalResult } from "../../helpers/withdrawal";
import type { ReturnConfiguration } from "../../helpers/random-returns";
import type { SegmentedWithdrawalConfig } from "../utils/segmented-withdrawal";
import { createDefaultWithdrawalSegment } from "../utils/segmented-withdrawal";
import { WithdrawalSegmentForm } from "./WithdrawalSegmentForm";
import { DynamicWithdrawalConfiguration } from "./DynamicWithdrawalConfiguration";
import { useSimulation } from "../contexts/useSimulation";
import type { WithdrawalReturnMode, WithdrawalFormValue, ComparisonStrategy } from "../utils/config-storage";

// Type for comparison results
type ComparisonResult = {
    strategy: ComparisonStrategy;
    finalCapital: number;
    totalWithdrawal: number;
    averageAnnualWithdrawal: number;
    duration: number | string;
};

const { Column, HeaderCell, Cell } = Table;

// Helper function for strategy display names
function getStrategyDisplayName(strategy: WithdrawalStrategy): string {
    switch (strategy) {
        case "4prozent": return "4% Regel";
        case "3prozent": return "3% Regel";
        case "variabel_prozent": return "Variable Prozent";
        case "monatlich_fest": return "Monatlich fest";
        case "dynamisch": return "Dynamische Strategie";
        default: return strategy;
    }
}


export function EntnahmeSimulationsAusgabe({
    startEnd,
    elemente,
    dispatchEnd,
    onWithdrawalResultsChange,
    steuerlast,
    teilfreistellungsquote,
}: {
        startEnd: [number, number];
        elemente: SparplanElement[];
        dispatchEnd: (val: [number, number]) => void;
        onWithdrawalResultsChange?: (results: WithdrawalResult | null) => void;
        steuerlast: number;
        teilfreistellungsquote: number;
    }) {
    const [startOfIndependence, endOfLife] = startEnd;
    const { withdrawalConfig, setWithdrawalConfig } = useSimulation();

    // Create default withdrawal configuration if none exists
    const defaultFormValue: WithdrawalFormValue = {
        endOfLife,
        strategie: "4prozent",
        rendite: 5,
        // General inflation settings (for all strategies)
        inflationAktiv: false,
        inflationsrate: 2,
        // Monthly strategy specific settings
        monatlicheBetrag: 2000,
        guardrailsAktiv: false,
        guardrailsSchwelle: 10,
        // Custom percentage strategy specific settings
        variabelProzent: 5, // Default to 5%
        // Dynamic strategy specific settings
        dynamischBasisrate: 4, // Base withdrawal rate 4%
        dynamischObereSchwell: 8, // Upper threshold return 8%
        dynamischObereAnpassung: 5, // Upper adjustment 5%
        dynamischUntereSchwell: 2, // Lower threshold return 2%
        dynamischUntereAnpassung: -5, // Lower adjustment -5%
        // Grundfreibetrag settings
        grundfreibetragAktiv: false,
        grundfreibetragBetrag: 10908, // Default German basic tax allowance for 2023
        einkommensteuersatz: 25, // Default income tax rate 25%
    };

    const defaultComparisonStrategies: ComparisonStrategy[] = [
        {
            id: 'strategy1',
            name: '3% Regel',
            strategie: '3prozent',
            rendite: 5,
        },
        {
            id: 'strategy2',
            name: 'Monatlich 1.500€',
            strategie: 'monatlich_fest',
            rendite: 5,
            monatlicheBetrag: 1500,
        }
    ];

    // Initialize withdrawal config if not exists or update current form values
    const currentConfig = withdrawalConfig || {
        formValue: defaultFormValue,
        withdrawalReturnMode: 'fixed' as WithdrawalReturnMode,
        withdrawalVariableReturns: {},
        withdrawalAverageReturn: 5,
        withdrawalStandardDeviation: 12,
        withdrawalRandomSeed: undefined,
        useSegmentedWithdrawal: false,
        withdrawalSegments: [
            createDefaultWithdrawalSegment(
                "main",
                "Hauptphase",
                startOfIndependence + 1,
                endOfLife
            )
        ],
        useComparisonMode: false,
        comparisonStrategies: defaultComparisonStrategies,
    };

    // Extract values from config for easier access
    const formValue = currentConfig.formValue;
    const withdrawalReturnMode = currentConfig.withdrawalReturnMode;
    const withdrawalVariableReturns = currentConfig.withdrawalVariableReturns;
    const withdrawalAverageReturn = currentConfig.withdrawalAverageReturn;
    const withdrawalStandardDeviation = currentConfig.withdrawalStandardDeviation;
    const withdrawalRandomSeed = currentConfig.withdrawalRandomSeed;
    const useSegmentedWithdrawal = currentConfig.useSegmentedWithdrawal;
    const withdrawalSegments = currentConfig.withdrawalSegments;
    const useComparisonMode = currentConfig.useComparisonMode;
    const comparisonStrategies = currentConfig.comparisonStrategies;

    // Helper function to update config
    const updateConfig = (updates: Partial<typeof currentConfig>) => {
        const newConfig = { ...currentConfig, ...updates };
        setWithdrawalConfig(newConfig);
    };

    // Helper function to update form value
    const updateFormValue = (updates: Partial<WithdrawalFormValue>) => {
        updateConfig({
            formValue: { ...formValue, ...updates }
        });
    };

    // Helper function to update a comparison strategy
    const updateComparisonStrategy = (strategyId: string, updates: Partial<ComparisonStrategy>) => {
        updateConfig({
            comparisonStrategies: comparisonStrategies.map((s: ComparisonStrategy) => 
                s.id === strategyId ? { ...s, ...updates } : s
            )
        });
    };

    // Calculate withdrawal projections
    const withdrawalData = useMemo(() => {
        if (!elemente || elemente.length === 0) {
            return null;
        }
        
        const startingCapital = getTotalCapitalAtYear(elemente, startOfIndependence);
        if (startingCapital <= 0) {
            return null;
        }

        let withdrawalResult;
        
        if (useSegmentedWithdrawal) {
            // Use segmented withdrawal calculation
            const segmentedConfig: SegmentedWithdrawalConfig = {
                segments: withdrawalSegments,
                taxRate: 0.26375,
                freibetragPerYear: undefined // Use default
            };
            
            withdrawalResult = calculateSegmentedWithdrawal(elemente, segmentedConfig);
        } else {
            // Use single-strategy withdrawal calculation (backward compatibility)
            // Build return configuration for withdrawal phase
            let withdrawalReturnConfig: ReturnConfiguration;
            
            if (withdrawalReturnMode === 'random') {
                withdrawalReturnConfig = {
                    mode: 'random',
                    randomConfig: {
                        averageReturn: withdrawalAverageReturn / 100, // Convert percentage to decimal
                        standardDeviation: withdrawalStandardDeviation / 100, // Convert percentage to decimal
                        seed: withdrawalRandomSeed
                    }
                };
            } else if (withdrawalReturnMode === 'variable') {
                withdrawalReturnConfig = {
                    mode: 'variable',
                    variableConfig: {
                        yearlyReturns: Object.fromEntries(
                            Object.entries(withdrawalVariableReturns).map(([year, rate]) => [parseInt(year), (rate as number) / 100])
                        )
                    }
                };
            } else {
                withdrawalReturnConfig = {
                    mode: 'fixed',
                    fixedRate: formValue.rendite / 100 // Convert percentage to decimal
                };
            }

            // Calculate withdrawal projections
            const withdrawalCalculation = calculateWithdrawal({
                elements: elemente,
                startYear: startOfIndependence + 1, // Start withdrawals the year after accumulation ends
                endYear: formValue.endOfLife,
                strategy: formValue.strategie,
                returnConfig: withdrawalReturnConfig,
                taxRate: steuerlast,
                teilfreistellungsquote: teilfreistellungsquote,
                freibetragPerYear: undefined, // freibetragPerYear
                monthlyConfig: formValue.strategie === "monatlich_fest" ? {
                    monthlyAmount: formValue.monatlicheBetrag,
                    enableGuardrails: formValue.guardrailsAktiv,
                    guardrailsThreshold: formValue.guardrailsSchwelle / 100
                } : undefined,
                customPercentage: formValue.strategie === "variabel_prozent" ? formValue.variabelProzent / 100 : undefined,
                dynamicConfig: formValue.strategie === "dynamisch" ? {
                    baseWithdrawalRate: formValue.dynamischBasisrate / 100,
                    upperThresholdReturn: formValue.dynamischObereSchwell / 100,
                    upperThresholdAdjustment: formValue.dynamischObereAnpassung / 100,
                    lowerThresholdReturn: formValue.dynamischUntereSchwell / 100,
                    lowerThresholdAdjustment: formValue.dynamischUntereAnpassung / 100,
                } : undefined,
                enableGrundfreibetrag: formValue.grundfreibetragAktiv,
                grundfreibetragPerYear: formValue.grundfreibetragAktiv ? (() => {
                    const grundfreibetragPerYear: {[year: number]: number} = {};
                    for (let year = startOfIndependence + 1; year <= formValue.endOfLife; year++) {
                        grundfreibetragPerYear[year] = formValue.grundfreibetragBetrag;
                    }
                    return grundfreibetragPerYear;
                })() : undefined,
                incomeTaxRate: formValue.grundfreibetragAktiv ? formValue.einkommensteuersatz / 100 : undefined,
                inflationConfig: formValue.inflationAktiv ? { inflationRate: formValue.inflationsrate / 100 } : undefined
            });
            withdrawalResult = withdrawalCalculation.result;
        }

        // Convert to array for table display, sorted by year descending
        const withdrawalArray = Object.entries(withdrawalResult)
            .map(([year, data]) => ({
                year: parseInt(year),
                ...data
            }))
            .sort((a, b) => b.year - a.year);

        // Calculate withdrawal duration
        const duration = calculateWithdrawalDuration(withdrawalResult, startOfIndependence + 1);

        return {
            startingCapital,
            withdrawalArray,
            withdrawalResult,
            duration
        };
    }, [elemente, startOfIndependence, formValue.endOfLife, formValue.strategie, formValue.rendite, formValue.inflationAktiv, formValue.inflationsrate, formValue.monatlicheBetrag, formValue.guardrailsAktiv, formValue.guardrailsSchwelle, formValue.variabelProzent, formValue.dynamischBasisrate, formValue.dynamischObereSchwell, formValue.dynamischObereAnpassung, formValue.dynamischUntereSchwell, formValue.dynamischUntereAnpassung, formValue.grundfreibetragAktiv, formValue.grundfreibetragBetrag, formValue.einkommensteuersatz, withdrawalReturnMode, withdrawalVariableReturns, withdrawalAverageReturn, withdrawalStandardDeviation, withdrawalRandomSeed, useSegmentedWithdrawal, withdrawalSegments, useComparisonMode, comparisonStrategies, steuerlast, teilfreistellungsquote]);

    // Calculate comparison results for each strategy
    const comparisonResults = useMemo(() => {
        if (!useComparisonMode || !withdrawalData) {
            return [];
        }

        const results = comparisonStrategies.map((strategy: ComparisonStrategy) => {
            // Build return configuration for this strategy
            const returnConfig: ReturnConfiguration = {
                mode: 'fixed',
                fixedRate: strategy.rendite / 100
            };

            try {
                // Calculate withdrawal for this comparison strategy
                const { result } = calculateWithdrawal({
                    elements: elemente,
                    startYear: startOfIndependence + 1,
                    endYear: formValue.endOfLife,
                    strategy: strategy.strategie,
                    returnConfig,
                    taxRate: steuerlast,
                    teilfreistellungsquote,
                    freibetragPerYear: (() => {
                        const freibetragPerYear: { [year: number]: number } = {};
                        for (let year = startOfIndependence + 1; year <= formValue.endOfLife; year++) {
                            freibetragPerYear[year] = 2000; // Default freibetrag
                        }
                        return freibetragPerYear;
                    })(),
                    monthlyConfig: strategy.strategie === "monatlich_fest" ? { 
                        monthlyAmount: strategy.monatlicheBetrag || 2000 
                    } : undefined,
                    customPercentage: strategy.strategie === "variabel_prozent" ? 
                        (strategy.variabelProzent || 5) / 100 : undefined,
                    dynamicConfig: strategy.strategie === "dynamisch" ? {
                        baseWithdrawalRate: (strategy.dynamischBasisrate || 4) / 100,
                        upperThresholdReturn: (strategy.dynamischObereSchwell || 8) / 100,
                        upperThresholdAdjustment: (strategy.dynamischObereAnpassung || 5) / 100,
                        lowerThresholdReturn: (strategy.dynamischUntereSchwell || 2) / 100,
                        lowerThresholdAdjustment: (strategy.dynamischUntereAnpassung || -5) / 100,
                    } : undefined
                });

                // Get final year capital and total withdrawal
                const finalYear = Math.max(...Object.keys(result).map(Number));
                const finalCapital = result[finalYear]?.endkapital || 0;
                
                // Calculate total withdrawal
                const totalWithdrawal = Object.values(result).reduce((sum, year) => sum + year.entnahme, 0);
                const totalYears = Object.keys(result).length;
                const averageAnnualWithdrawal = totalWithdrawal / totalYears;

                // Calculate withdrawal duration
                const duration = calculateWithdrawalDuration(result, startOfIndependence + 1);

                return {
                    strategy,
                    finalCapital,
                    totalWithdrawal,
                    averageAnnualWithdrawal,
                    duration: duration ? duration : "unbegrenzt"
                };
            } catch (error) {
                console.error(`Error calculating withdrawal for strategy ${strategy.name}:`, error);
                return {
                    strategy,
                    finalCapital: 0,
                    totalWithdrawal: 0,
                    averageAnnualWithdrawal: 0,
                    duration: "Fehler"
                };
            }
        });

        return results;
    }, [useComparisonMode, withdrawalData, comparisonStrategies, elemente, startOfIndependence, formValue.endOfLife, steuerlast, teilfreistellungsquote]);

    // Notify parent component when withdrawal results change
    useEffect(() => {
        if (onWithdrawalResultsChange && withdrawalData) {
            onWithdrawalResultsChange(withdrawalData.withdrawalResult);
        }
    }, [withdrawalData, onWithdrawalResultsChange]);

    // Format currency for display
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    return (
        <>
            <Panel header="Variablen" bordered>
                {/* Toggle between single, segmented, and comparison withdrawal */}
                <Form.Group controlId="withdrawalMode">
                    <Form.ControlLabel>Entnahme-Modus</Form.ControlLabel>
                    <RadioGroup
                        inline
                        value={useComparisonMode ? "comparison" : (useSegmentedWithdrawal ? "segmented" : "single")}
                        onChange={(value) => {
                            const useComparison = value === "comparison";
                            const useSegmented = value === "segmented";
                            
                            updateConfig({ 
                                useComparisonMode: useComparison,
                                useSegmentedWithdrawal: useSegmented
                            });
                            
                            // Initialize segments when switching to segmented mode
                            if (useSegmented && withdrawalSegments.length === 0) {
                                const defaultSegment = createDefaultWithdrawalSegment(
                                    "main",
                                    "Hauptphase",
                                    startOfIndependence + 1,
                                    formValue.endOfLife
                                );
                                updateConfig({ withdrawalSegments: [defaultSegment] });
                            }
                        }}
                    >
                        <Radio value="single">Einheitliche Strategie</Radio>
                        <Radio value="segmented">Geteilte Phasen</Radio>
                        <Radio value="comparison">Strategien-Vergleich</Radio>
                    </RadioGroup>
                    <Form.HelpText>
                        {useComparisonMode 
                            ? "Vergleiche verschiedene Entnahmestrategien miteinander."
                            : useSegmentedWithdrawal 
                            ? "Teile die Entnahme-Phase in verschiedene Zeiträume mit unterschiedlichen Strategien auf."
                            : "Verwende eine einheitliche Strategie für die gesamte Entnahme-Phase."
                        }
                    </Form.HelpText>
                </Form.Group>

                {useSegmentedWithdrawal ? (
                    /* Segmented withdrawal configuration */
                    <WithdrawalSegmentForm
                        segments={withdrawalSegments}
                        onSegmentsChange={(segments) => updateConfig({ withdrawalSegments: segments })}
                        withdrawalStartYear={startOfIndependence + 1}
                        withdrawalEndYear={formValue.endOfLife}
                    />
                ) : useComparisonMode ? (
                    /* Comparison mode configuration */
                    <div>
                        <h4>Basis-Strategie (mit vollständigen Details)</h4>
                        <Form fluid formValue={formValue}
                            onChange={changedFormValue => {
                                dispatchEnd([startOfIndependence, changedFormValue.endOfLife])
                                updateFormValue({
                                    endOfLife: changedFormValue.endOfLife,
                                    strategie: changedFormValue.strategie,
                                    rendite: changedFormValue.rendite,
                                    inflationAktiv: changedFormValue.inflationAktiv,
                                    inflationsrate: changedFormValue.inflationsrate,
                                    monatlicheBetrag: changedFormValue.monatlicheBetrag,
                                    guardrailsAktiv: changedFormValue.guardrailsAktiv,
                                    guardrailsSchwelle: changedFormValue.guardrailsSchwelle,
                                    variabelProzent: changedFormValue.variabelProzent,
                                    dynamischBasisrate: changedFormValue.dynamischBasisrate,
                                    dynamischObereSchwell: changedFormValue.dynamischObereSchwell,
                                    dynamischObereAnpassung: changedFormValue.dynamischObereAnpassung,
                                    dynamischUntereSchwell: changedFormValue.dynamischUntereSchwell,
                                    dynamischUntereAnpassung: changedFormValue.dynamischUntereAnpassung,
                                    grundfreibetragAktiv: changedFormValue.grundfreibetragAktiv,
                                    grundfreibetragBetrag: changedFormValue.grundfreibetragBetrag,
                                    einkommensteuersatz: changedFormValue.einkommensteuersatz,
                                })
                            }}
                        >
                        {/* End of Life - shared by base strategy */}
                        <Form.Group controlId="endOfLife">
                            <Form.ControlLabel>End of Life</Form.ControlLabel>
                            <Form.Control name="endOfLife" accepter={InputNumber} />
                        </Form.Group>

                        {/* Strategy selector - for base strategy only */}
                        <Form.Group controlId="strategie">
                            <Form.ControlLabel>Basis-Strategie</Form.ControlLabel>
                            <Form.Control name="strategie" accepter={RadioTileGroup}>
                                <RadioTile value="4prozent" label="4% Regel">
                                    4% Entnahme
                                </RadioTile>
                                <RadioTile value="3prozent" label="3% Regel">
                                    3% Entnahme
                                </RadioTile>
                                <RadioTile value="variabel_prozent" label="Variable Prozent">
                                    Anpassbare Entnahme
                                </RadioTile>
                                <RadioTile value="monatlich_fest" label="Monatlich fest">
                                    Fester monatlicher Betrag
                                </RadioTile>
                                <RadioTile value="dynamisch" label="Dynamische Strategie">
                                    Renditebasierte Anpassung
                                </RadioTile>
                            </Form.Control>
                        </Form.Group>

                        {/* Fixed return rate for base strategy */}
                        <Form.Group controlId="rendite">
                            <Form.ControlLabel>Rendite Basis-Strategie (%)</Form.ControlLabel>
                            <Form.Control name="rendite" accepter={Slider} 
                                min={0}
                                max={10}
                                step={0.5}
                                handleTitle={(<div style={{marginTop: '-17px'}}>{formValue.rendite}%</div>)}
                                progress
                                graduated
                            />
                        </Form.Group>

                        {/* Strategy-specific configuration for base strategy */}
                        {formValue.strategie === "variabel_prozent" && (
                            <Form.Group controlId="variabelProzent">
                                <Form.ControlLabel>Entnahme-Prozentsatz (%)</Form.ControlLabel>
                                <Form.Control name="variabelProzent" accepter={Slider} 
                                    min={1}
                                    max={10}
                                    step={0.5}
                                    handleTitle={(<div style={{marginTop: '-17px'}}>{formValue.variabelProzent}%</div>)}
                                    progress
                                    graduated
                                />
                            </Form.Group>
                        )}

                        {formValue.strategie === "monatlich_fest" && (
                            <Form.Group controlId="monatlicheBetrag">
                                <Form.ControlLabel>Monatlicher Betrag (€)</Form.ControlLabel>
                                <Form.Control name="monatlicheBetrag" accepter={InputNumber} />
                            </Form.Group>
                        )}

                        {formValue.strategie === "dynamisch" && (
                            <DynamicWithdrawalConfiguration formValue={formValue} />
                        )}
                        </Form>

                        {/* Comparison strategies configuration */}
                        <div style={{ marginTop: '30px' }}>
                            <h4>Vergleichs-Strategien</h4>
                            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                                Konfiguriere zusätzliche Strategien zum Vergleich. Diese zeigen nur die wichtigsten Parameter und Endergebnisse.
                            </p>
                            
                            {comparisonStrategies.map((strategy: ComparisonStrategy, index: number) => (
                                <div key={strategy.id} style={{ 
                                    border: '1px solid #e5e5ea', 
                                    borderRadius: '6px', 
                                    padding: '15px', 
                                    marginBottom: '15px',
                                    backgroundColor: '#f8f9fa'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <h5 style={{ margin: 0 }}>Strategie {index + 1}: {strategy.name}</h5>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                updateConfig({ 
                                                    comparisonStrategies: comparisonStrategies.filter((s: ComparisonStrategy) => s.id !== strategy.id)
                                                });
                                            }}
                                            style={{ 
                                                background: 'none', 
                                                border: 'none', 
                                                color: '#999', 
                                                cursor: 'pointer',
                                                fontSize: '18px'
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'end' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Strategie-Typ</label>
                                            <select 
                                                value={strategy.strategie}
                                                onChange={(e) => {
                                                    const newStrategie = e.target.value as WithdrawalStrategy;
                                                    updateComparisonStrategy(strategy.id, {
                                                        strategie: newStrategie,
                                                        name: getStrategyDisplayName(newStrategie)
                                                    });
                                                }}
                                                style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }}
                                            >
                                                <option value="4prozent">4% Regel</option>
                                                <option value="3prozent">3% Regel</option>
                                                <option value="variabel_prozent">Variable Prozent</option>
                                                <option value="monatlich_fest">Monatlich fest</option>
                                                <option value="dynamisch">Dynamische Strategie</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Rendite (%)</label>
                                            <input 
                                                type="number"
                                                min="0"
                                                max="10"
                                                step="0.5"
                                                value={strategy.rendite}
                                                onChange={(e) => {
                                                    updateComparisonStrategy(strategy.id, {
                                                        rendite: parseFloat(e.target.value) || 0
                                                    });
                                                }}
                                                style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }}
                                            />
                                        </div>

                                        {/* Strategy-specific parameters */}
                                        {strategy.strategie === "variabel_prozent" && (
                                            <div style={{ gridColumn: 'span 2' }}>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Entnahme-Prozentsatz (%)</label>
                                                <input 
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    step="0.5"
                                                    value={strategy.variabelProzent || 5}
                                                    onChange={(e) => {
                                                        updateComparisonStrategy(strategy.id, {
                                                            variabelProzent: parseFloat(e.target.value) || 5
                                                        });
                                                    }}
                                                    style={{ width: '50%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }}
                                                />
                                            </div>
                                        )}

                                        {strategy.strategie === "monatlich_fest" && (
                                            <div style={{ gridColumn: 'span 2' }}>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Monatlicher Betrag (€)</label>
                                                <input 
                                                    type="number"
                                                    min="0"
                                                    step="100"
                                                    value={strategy.monatlicheBetrag || 2000}
                                                    onChange={(e) => {
                                                        updateComparisonStrategy(strategy.id, {
                                                            monatlicheBetrag: parseFloat(e.target.value) || 2000
                                                        });
                                                    }}
                                                    style={{ width: '50%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }}
                                                />
                                            </div>
                                        )}

                                        {strategy.strategie === "dynamisch" && (
                                            <>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Basis-Rate (%)</label>
                                                    <input 
                                                        type="number"
                                                        min="1"
                                                        max="10"
                                                        step="0.5"
                                                        value={strategy.dynamischBasisrate || 4}
                                                        onChange={(e) => {
                                                            updateComparisonStrategy(strategy.id, {
                                                                dynamischBasisrate: parseFloat(e.target.value) || 4
                                                            });
                                                        }}
                                                        style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Obere Schwelle (%)</label>
                                                    <input 
                                                        type="number"
                                                        min="0"
                                                        max="20"
                                                        step="0.5"
                                                        value={strategy.dynamischObereSchwell || 8}
                                                        onChange={(e) => {
                                                            updateComparisonStrategy(strategy.id, {
                                                                dynamischObereSchwell: parseFloat(e.target.value) || 8
                                                            });
                                                        }}
                                                        style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                            
                            <button 
                                type="button"
                                onClick={() => {
                                    const newId = `strategy${Date.now()}`;
                                    const newStrategy: ComparisonStrategy = {
                                        id: newId,
                                        name: '3% Regel',
                                        strategie: '3prozent',
                                        rendite: 5,
                                    };
                                    updateConfig({
                                        comparisonStrategies: [...comparisonStrategies, newStrategy]
                                    });
                                }}
                                style={{ 
                                    padding: '8px 16px', 
                                    backgroundColor: '#1675e0', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer' 
                                }}
                            >
                                + Weitere Strategie hinzufügen
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Single strategy configuration (existing UI) */
                    <Form fluid formValue={formValue}
                        onChange={changedFormValue => {
                            dispatchEnd([startOfIndependence, changedFormValue.endOfLife])
                            updateFormValue({
                                endOfLife: changedFormValue.endOfLife,
                                strategie: changedFormValue.strategie,
                                rendite: changedFormValue.rendite,
                                inflationAktiv: changedFormValue.inflationAktiv,
                                inflationsrate: changedFormValue.inflationsrate,
                                monatlicheBetrag: changedFormValue.monatlicheBetrag,
                                guardrailsAktiv: changedFormValue.guardrailsAktiv,
                                guardrailsSchwelle: changedFormValue.guardrailsSchwelle,
                                variabelProzent: changedFormValue.variabelProzent,
                                dynamischBasisrate: changedFormValue.dynamischBasisrate,
                                dynamischObereSchwell: changedFormValue.dynamischObereSchwell,
                                dynamischObereAnpassung: changedFormValue.dynamischObereAnpassung,
                                dynamischUntereSchwell: changedFormValue.dynamischUntereSchwell,
                                dynamischUntereAnpassung: changedFormValue.dynamischUntereAnpassung,
                                grundfreibetragAktiv: changedFormValue.grundfreibetragAktiv,
                                grundfreibetragBetrag: changedFormValue.grundfreibetragBetrag,
                                einkommensteuersatz: changedFormValue.einkommensteuersatz,
                            })
                        }}
                    >
                    {/* Withdrawal Return Configuration */}
                    <Form.Group controlId="withdrawalReturnMode">
                        <Form.ControlLabel>Rendite-Konfiguration (Entnahme-Phase)</Form.ControlLabel>
                        <RadioGroup
                            inline
                            value={withdrawalReturnMode}
                            onChange={(value) => {
                                updateConfig({ withdrawalReturnMode: value as WithdrawalReturnMode });
                            }}
                        >
                            <Radio value="fixed">Feste Rendite</Radio>
                            <Radio value="random">Zufällige Rendite</Radio>
                            <Radio value="variable">Variable Rendite</Radio>
                        </RadioGroup>
                        <Form.HelpText>
                            Konfiguration der erwarteten Rendite während der Entnahme-Phase (unabhängig von der Sparphase-Rendite).
                        </Form.HelpText>
                    </Form.Group>

                    {withdrawalReturnMode === 'fixed' && (
                        <Form.Group controlId="rendite">
                            <Form.ControlLabel>Erwartete Rendite Entnahme-Phase (%)</Form.ControlLabel>
                            <Form.Control name="rendite" accepter={Slider} 
                                min={0}
                                max={10}
                                step={0.5}
                                handleTitle={(<div style={{marginTop: '-17px'}}>{formValue.rendite}%</div>)}
                                progress
                                graduated
                            />
                            <Form.HelpText>
                                Feste Rendite für die gesamte Entnahme-Phase (oft konservativer als die Sparphase-Rendite).
                            </Form.HelpText>
                        </Form.Group>
                    )}

                    {withdrawalReturnMode === 'random' && (
                        <>
                            <Form.Group controlId="withdrawalAverageReturn">
                                <Form.ControlLabel>Durchschnittliche Rendite (%)</Form.ControlLabel>
                                <Slider
                                    value={withdrawalAverageReturn}
                                    min={0}
                                    max={12}
                                    step={0.5}
                                    handleTitle={(<div style={{marginTop: '-17px'}}>{withdrawalAverageReturn}%</div>)}
                                    progress
                                    graduated
                                    onChange={(value) => updateConfig({ withdrawalAverageReturn: value })}
                                />
                                <Form.HelpText>
                                    Erwartete durchschnittliche Rendite für die Entnahme-Phase (meist konservativer als Ansparphase)
                                </Form.HelpText>
                            </Form.Group>
                            
                            <Form.Group controlId="withdrawalStandardDeviation">
                                <Form.ControlLabel>Standardabweichung (%)</Form.ControlLabel>
                                <Slider
                                    value={withdrawalStandardDeviation}
                                    min={5}
                                    max={25}
                                    step={1}
                                    handleTitle={(<div style={{marginTop: '-17px'}}>{withdrawalStandardDeviation}%</div>)}
                                    progress
                                    graduated
                                    onChange={(value) => updateConfig({ withdrawalStandardDeviation: value })}
                                />
                                <Form.HelpText>
                                    Volatilität der Renditen (meist niedriger als Ansparphase wegen konservativerer Allokation)
                                </Form.HelpText>
                            </Form.Group>
                            
                            <Form.Group controlId="withdrawalRandomSeed">
                                <Form.ControlLabel>Zufalls-Seed (optional)</Form.ControlLabel>
                                <InputNumber
                                    value={withdrawalRandomSeed}
                                    onChange={(value) => updateConfig({ withdrawalRandomSeed: typeof value === 'number' ? value : undefined })}
                                    placeholder="Für reproduzierbare Ergebnisse"
                                />
                                <Form.HelpText>
                                    Optionaler Seed für reproduzierbare Zufallsrenditen. Leer lassen für echte Zufälligkeit.
                                </Form.HelpText>
                            </Form.Group>
                        </>
                    )}

                    {withdrawalReturnMode === 'variable' && (
                        <Form.Group controlId="withdrawalVariableReturns">
                            <Form.ControlLabel>Variable Renditen pro Jahr (Entnahme-Phase)</Form.ControlLabel>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e5e5ea', borderRadius: '6px', padding: '10px' }}>
                                {Array.from({ length: formValue.endOfLife - startOfIndependence }, (_, i) => {
                                    const year = startOfIndependence + 1 + i;
                                    return (
                                        <div key={year} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', gap: '10px' }}>
                                            <div style={{ minWidth: '60px', fontWeight: 'bold' }}>{year}:</div>
                                            <div style={{ flex: 1 }}>
                                                <Slider
                                                    value={withdrawalVariableReturns[year] || 5}
                                                    min={-10}
                                                    max={15}
                                                    step={0.5}
                                                    onChange={(value) => {
                                                        const newReturns = { ...withdrawalVariableReturns, [year]: value };
                                                        updateConfig({ withdrawalVariableReturns: newReturns });
                                                    }}
                                                />
                                            </div>
                                            <div style={{ minWidth: '50px', textAlign: 'right' }}>
                                                {(withdrawalVariableReturns[year] || 5).toFixed(1)}%
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                                Tipp: Verwende niedrigere Werte für konservative Portfolio-Allokation in der Rente und negative Werte für Krisen-Jahre.
                            </div>
                        </Form.Group>
                    )}
                    <Form.Group controlId="endOfLife">
                        <Form.ControlLabel>End of Life</Form.ControlLabel>
                        <Form.Control name="endOfLife" accepter={InputNumber} 
                        />
                    </Form.Group>
                    <Form.Group controlId="strategie">
                        <Form.ControlLabel>Strategie</Form.ControlLabel>
                        <Form.Control name="strategie" accepter={RadioTileGroup}>
                            <RadioTile value="4prozent" label="4% Regel">
                                4% Entnahme
                            </RadioTile>
                            <RadioTile value="3prozent" label="3% Regel">
                                3% Entnahme
                            </RadioTile>
                            <RadioTile value="variabel_prozent" label="Variable Prozent">
                                Anpassbare Entnahme
                            </RadioTile>
                            <RadioTile value="monatlich_fest" label="Monatlich fest">
                                Fester monatlicher Betrag
                            </RadioTile>
                            <RadioTile value="dynamisch" label="Dynamische Strategie">
                                Renditebasierte Anpassung
                            </RadioTile>
                        </Form.Control>
                    </Form.Group>
                    
                    {/* Grundfreibetrag settings */}
                    <Form.Group controlId="grundfreibetragAktiv">
                        <Form.ControlLabel>Grundfreibetrag berücksichtigen</Form.ControlLabel>
                        <Form.Control name="grundfreibetragAktiv" accepter={Toggle} />
                        <Form.HelpText>
                            Berücksichtigt den Grundfreibetrag für die Einkommensteuer bei Entnahmen (relevant für Rentner ohne weiteres Einkommen)
                        </Form.HelpText>
                    </Form.Group>

                    {/* General inflation controls for all strategies */}
                    <Form.Group controlId="inflationAktiv">
                        <Form.ControlLabel>Inflation berücksichtigen</Form.ControlLabel>
                        <Form.Control name="inflationAktiv" accepter={Toggle} />
                        <Form.HelpText>
                            Passt die Entnahmebeträge jährlich an die Inflation an (für alle Entnahme-Strategien)
                        </Form.HelpText>
                    </Form.Group>
                    
                    {formValue.inflationAktiv && (
                        <Form.Group controlId="inflationsrate">
                            <Form.ControlLabel>Inflationsrate (%)</Form.ControlLabel>
                            <Form.Control name="inflationsrate" accepter={Slider} 
                                min={0}
                                max={5}
                                step={0.1}
                                handleTitle={(<div style={{marginTop: '-17px'}}>{formValue.inflationsrate}%</div>)}
                                progress
                                graduated
                            />
                            <Form.HelpText>
                                Jährliche Inflationsrate zur Anpassung der Entnahmebeträge
                            </Form.HelpText>
                        </Form.Group>
                    )}
                    
                    {formValue.grundfreibetragAktiv && (
                        <>
                            <Form.Group controlId="grundfreibetragBetrag">
                                <Form.ControlLabel>Grundfreibetrag pro Jahr (€)</Form.ControlLabel>
                                <Form.Control name="grundfreibetragBetrag" accepter={InputNumber} 
                                    min={0}
                                    max={30000}
                                    step={100}
                                />
                                <Form.HelpText>
                                    Grundfreibetrag für die Einkommensteuer (2023: 10.908 €)
                                </Form.HelpText>
                            </Form.Group>
                            <Form.Group controlId="einkommensteuersatz">
                                <Form.ControlLabel>Einkommensteuersatz (%)</Form.ControlLabel>
                                <Form.Control name="einkommensteuersatz" accepter={Slider} 
                                    min={14}
                                    max={42}
                                    step={1}
                                    handleTitle={(<div style={{marginTop: '-17px'}}>{formValue.einkommensteuersatz}%</div>)}
                                    progress
                                    graduated
                                />
                                <Form.HelpText>
                                    Vereinfachter Einkommensteuersatz (normalerweise zwischen 14% und 42%)
                                </Form.HelpText>
                            </Form.Group>
                        </>
                    )}
                    
                    {/* Variable percentage strategy specific controls */}
                    {formValue.strategie === "variabel_prozent" && (
                        <Form.Group controlId="variabelProzent">
                            <Form.ControlLabel>Entnahme-Prozentsatz (%)</Form.ControlLabel>
                            <Form.Control name="variabelProzent" accepter={Slider} 
                                min={2}
                                max={7}
                                step={0.5}
                                handleTitle={(<div style={{marginTop: '-17px'}}>{formValue.variabelProzent}%</div>)}
                                progress
                                graduated
                            />
                            <Form.HelpText>
                                Wählen Sie einen Entnahme-Prozentsatz zwischen 2% und 7% in 0,5%-Schritten
                            </Form.HelpText>
                        </Form.Group>
                    )}
                    
                    {/* Monthly strategy specific controls */}
                    {formValue.strategie === "monatlich_fest" && (
                        <>
                            <Form.Group controlId="monatlicheBetrag">
                                <Form.ControlLabel>Monatlicher Betrag (€)</Form.ControlLabel>
                                <Form.Control name="monatlicheBetrag" accepter={InputNumber} 
                                    min={100}
                                    max={50000}
                                    step={100}
                                />
                            </Form.Group>
                            <Form.Group controlId="guardrailsAktiv">
                                <Form.ControlLabel>Dynamische Anpassung (Guardrails)</Form.ControlLabel>
                                <Form.Control name="guardrailsAktiv" accepter={Toggle} />
                                <Form.HelpText>
                                    Passt die Entnahme basierend auf der Portfolio-Performance an
                                </Form.HelpText>
                            </Form.Group>
                            {formValue.guardrailsAktiv && (
                                <Form.Group controlId="guardrailsSchwelle">
                                    <Form.ControlLabel>Anpassungsschwelle (%)</Form.ControlLabel>
                                    <Form.Control name="guardrailsSchwelle" accepter={Slider} 
                                        min={5}
                                        max={20}
                                        step={1}
                                        handleTitle={(<div style={{marginTop: '-17px'}}>{formValue.guardrailsSchwelle}%</div>)}
                                        progress
                                        graduated
                                    />
                                    <Form.HelpText>
                                        Bei Überschreitung dieser Schwelle wird die Entnahme angepasst
                                    </Form.HelpText>
                                </Form.Group>
                            )}
                        </>
                    )}

                    {/* Dynamic strategy specific controls */}
                    {formValue.strategie === "dynamisch" && (
                        <DynamicWithdrawalConfiguration formValue={formValue} />
                    )}
                    </Form>
                )}
            </Panel>
            <Panel header="Simulation" bordered>
                {withdrawalData ? (
                    <div>
                        {useComparisonMode ? (
                            /* Comparison mode simulation results */
                            <div>
                                <h4>Strategien-Vergleich</h4>
                                <p><strong>Startkapital bei Entnahme:</strong> {formatCurrency(withdrawalData.startingCapital)}</p>
                                
                                {/* Base strategy summary */}
                                <div style={{ 
                                    border: '2px solid #1675e0', 
                                    borderRadius: '8px', 
                                    padding: '15px', 
                                    marginBottom: '20px',
                                    backgroundColor: '#f8f9ff'
                                }}>
                                    <h5 style={{ color: '#1675e0', margin: '0 0 10px 0' }}>📊 Basis-Strategie: {getStrategyDisplayName(formValue.strategie)}</h5>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                                        <div><strong>Rendite:</strong> {formValue.rendite}%</div>
                                        <div><strong>Endkapital:</strong> {formatCurrency(withdrawalData.withdrawalArray[0]?.endkapital || 0)}</div>
                                        <div><strong>Vermögen reicht für:</strong> {
                                            withdrawalData.duration 
                                                ? `${withdrawalData.duration} Jahr${withdrawalData.duration === 1 ? '' : 'e'}`
                                                : 'unbegrenzt'
                                        }</div>
                                        {formValue.strategie === "4prozent" || formValue.strategie === "3prozent" ? (
                                            <div><strong>Jährliche Entnahme:</strong> {formatCurrency(withdrawalData.startingCapital * (formValue.strategie === "4prozent" ? 0.04 : 0.03))}</div>
                                        ) : formValue.strategie === "variabel_prozent" ? (
                                            <div><strong>Jährliche Entnahme:</strong> {formatCurrency(withdrawalData.startingCapital * (formValue.variabelProzent / 100))}</div>
                                        ) : formValue.strategie === "monatlich_fest" ? (
                                            <div><strong>Monatliche Entnahme:</strong> {formatCurrency(formValue.monatlicheBetrag)}</div>
                                        ) : formValue.strategie === "dynamisch" ? (
                                            <div><strong>Basis-Entnahme:</strong> {formatCurrency(withdrawalData.startingCapital * (formValue.dynamischBasisrate / 100))}</div>
                                        ) : null}
                                    </div>
                                </div>
                                
                                {/* Comparison strategies results */}
                                <h5>🔍 Vergleichs-Strategien</h5>
                                {comparisonResults.length > 0 ? (
                                    <div style={{ display: 'grid', gap: '15px' }}>
                                        {comparisonResults.map((result: ComparisonResult, _index: number) => (
                                            <div key={result.strategy.id} style={{ 
                                                border: '1px solid #e5e5ea', 
                                                borderRadius: '6px', 
                                                padding: '15px',
                                                backgroundColor: '#f8f9fa'
                                            }}>
                                                <h6 style={{ margin: '0 0 10px 0', color: '#666' }}>
                                                    {result.strategy.name} ({result.strategy.rendite}% Rendite)
                                                </h6>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', fontSize: '14px' }}>
                                                    <div><strong>Endkapital:</strong> {formatCurrency(result.finalCapital)}</div>
                                                    <div><strong>Gesamt-Entnahme:</strong> {formatCurrency(result.totalWithdrawal)}</div>
                                                    <div><strong>Ø Jährlich:</strong> {formatCurrency(result.averageAnnualWithdrawal)}</div>
                                                    <div><strong>Dauer:</strong> {
                                                        typeof result.duration === 'number' 
                                                            ? `${result.duration} Jahre` 
                                                            : result.duration
                                                    }</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: '#666', fontStyle: 'italic' }}>
                                        Keine Vergleichs-Strategien konfiguriert. Fügen Sie Strategien über den Konfigurationsbereich hinzu.
                                    </p>
                                )}
                                
                                {/* Comparison summary table */}
                                {comparisonResults.length > 0 && (
                                    <div style={{ marginTop: '30px' }}>
                                        <h5>📋 Vergleichstabelle</h5>
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ 
                                                width: '100%', 
                                                borderCollapse: 'collapse', 
                                                border: '1px solid #e5e5ea',
                                                fontSize: '14px'
                                            }}>
                                                <thead>
                                                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                                                        <th style={{ padding: '10px', borderBottom: '1px solid #e5e5ea', textAlign: 'left' }}>Strategie</th>
                                                        <th style={{ padding: '10px', borderBottom: '1px solid #e5e5ea', textAlign: 'right' }}>Rendite</th>
                                                        <th style={{ padding: '10px', borderBottom: '1px solid #e5e5ea', textAlign: 'right' }}>Endkapital</th>
                                                        <th style={{ padding: '10px', borderBottom: '1px solid #e5e5ea', textAlign: 'right' }}>Ø Jährliche Entnahme</th>
                                                        <th style={{ padding: '10px', borderBottom: '1px solid #e5e5ea', textAlign: 'right' }}>Vermögen reicht für</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {/* Base strategy row */}
                                                    <tr style={{ backgroundColor: '#f8f9ff', fontWeight: 'bold' }}>
                                                        <td style={{ padding: '10px', borderBottom: '1px solid #e5e5ea' }}>
                                                            📊 {getStrategyDisplayName(formValue.strategie)} (Basis)
                                                        </td>
                                                        <td style={{ padding: '10px', borderBottom: '1px solid #e5e5ea', textAlign: 'right' }}>{formValue.rendite}%</td>
                                                        <td style={{ padding: '10px', borderBottom: '1px solid #e5e5ea', textAlign: 'right' }}>
                                                            {formatCurrency(withdrawalData.withdrawalArray[0]?.endkapital || 0)}
                                                        </td>
                                                        <td style={{ padding: '10px', borderBottom: '1px solid #e5e5ea', textAlign: 'right' }}>
                                                            {(() => {
                                                                const totalWithdrawal = withdrawalData.withdrawalArray.reduce((sum, year) => sum + year.entnahme, 0);
                                                                const averageAnnual = totalWithdrawal / withdrawalData.withdrawalArray.length;
                                                                return formatCurrency(averageAnnual);
                                                            })()}
                                                        </td>
                                                        <td style={{ padding: '10px', borderBottom: '1px solid #e5e5ea', textAlign: 'right' }}>
                                                            {withdrawalData.duration 
                                                                ? `${withdrawalData.duration} Jahre`
                                                                : 'unbegrenzt'
                                                            }
                                                        </td>
                                                    </tr>
                                                    {/* Comparison strategies rows */}
                                                    {comparisonResults.map((result: ComparisonResult) => (
                                                        <tr key={result.strategy.id}>
                                                            <td style={{ padding: '10px', borderBottom: '1px solid #e5e5ea' }}>
                                                                {result.strategy.name}
                                                            </td>
                                                            <td style={{ padding: '10px', borderBottom: '1px solid #e5e5ea', textAlign: 'right' }}>{result.strategy.rendite}%</td>
                                                            <td style={{ padding: '10px', borderBottom: '1px solid #e5e5ea', textAlign: 'right' }}>
                                                                {formatCurrency(result.finalCapital)}
                                                            </td>
                                                            <td style={{ padding: '10px', borderBottom: '1px solid #e5e5ea', textAlign: 'right' }}>
                                                                {formatCurrency(result.averageAnnualWithdrawal)}
                                                            </td>
                                                            <td style={{ padding: '10px', borderBottom: '1px solid #e5e5ea', textAlign: 'right' }}>
                                                                {typeof result.duration === 'number' 
                                                                    ? `${result.duration} Jahre` 
                                                                    : result.duration
                                                                }
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Regular single strategy simulation results */
                            <div>
                                <div style={{ marginBottom: '20px' }}>
                                    <h4>Entnahme-Simulation</h4>
                                    <p><strong>Startkapital bei Entnahme:</strong> {formatCurrency(withdrawalData.startingCapital)}</p>
                            {formValue.strategie === "monatlich_fest" ? (
                                <>
                                    <p><strong>Monatliche Entnahme (Basis):</strong> {formatCurrency(formValue.monatlicheBetrag)}</p>
                                    <p><strong>Jährliche Entnahme (Jahr 1):</strong> {formatCurrency(formValue.monatlicheBetrag * 12)}</p>
                                    {formValue.guardrailsAktiv && (
                                        <p><strong>Dynamische Anpassung:</strong> Aktiviert (Schwelle: {formValue.guardrailsSchwelle}%)</p>
                                    )}
                                </>
                            ) : formValue.strategie === "variabel_prozent" ? (
                                <p><strong>Jährliche Entnahme ({formValue.variabelProzent} Prozent Regel):</strong> {formatCurrency(withdrawalData.startingCapital * (formValue.variabelProzent / 100))}</p>
                            ) : formValue.strategie === "dynamisch" ? (
                                <>
                                    <p><strong>Basis-Entnahmerate:</strong> {formValue.dynamischBasisrate}%</p>
                                    <p><strong>Jährliche Basis-Entnahme:</strong> {formatCurrency(withdrawalData.startingCapital * (formValue.dynamischBasisrate / 100))}</p>
                                    <p><strong>Obere Schwelle:</strong> {formValue.dynamischObereSchwell}% Rendite → {formValue.dynamischObereAnpassung > 0 ? '+' : ''}{formValue.dynamischObereAnpassung}% Anpassung</p>
                                    <p><strong>Untere Schwelle:</strong> {formValue.dynamischUntereSchwell}% Rendite → {formValue.dynamischUntereAnpassung}% Anpassung</p>
                                </>
                            ) : (
                                <p><strong>Jährliche Entnahme ({formValue.strategie === "4prozent" ? "4 Prozent" : "3 Prozent"} Regel):</strong> {formatCurrency(withdrawalData.startingCapital * (formValue.strategie === "4prozent" ? 0.04 : 0.03))}</p>
                            )}
                            {formValue.inflationAktiv && (
                                <p><strong>Inflationsrate:</strong> {formValue.inflationsrate}% p.a. (Entnahmebeträge werden jährlich angepasst)</p>
                            )}
                            <p><strong>Erwartete Rendite:</strong> {formValue.rendite} Prozent p.a.</p>
                            {formValue.grundfreibetragAktiv && (
                                <p><strong>Grundfreibetrag:</strong> {formatCurrency(formValue.grundfreibetragBetrag)} pro Jahr (Einkommensteuersatz: {formValue.einkommensteuersatz}%)</p>
                            )}
                            <p><strong>Vermögen reicht für:</strong> {
                                withdrawalData.duration 
                                    ? `${withdrawalData.duration} Jahr${withdrawalData.duration === 1 ? '' : 'e'}`
                                    : 'unbegrenzt (Vermögen wächst weiter)'
                            }</p>
                        </div>
                        
                        {/* Card Layout for All Devices */}
                        <div>
                            <div className="sparplan-cards">
                                {withdrawalData.withdrawalArray.map((rowData, index) => (
                                    <div key={index} className="sparplan-card">
                                        <div className="sparplan-card-header">
                                            <span className="sparplan-year">📅 {rowData.year}</span>
                                            <span className="sparplan-endkapital">
                                                🎯 {formatCurrency(rowData.endkapital)}
                                            </span>
                                        </div>
                                        <div className="sparplan-card-details">
                                            <div className="sparplan-detail">
                                                <span className="detail-label">💰 Startkapital:</span>
                                                <span className="detail-value" style={{ color: '#28a745' }}>
                                                    {formatCurrency(rowData.startkapital)}
                                                </span>
                                            </div>
                                            <div className="sparplan-detail">
                                                <span className="detail-label">💸 Entnahme:</span>
                                                <span className="detail-value" style={{ color: '#dc3545' }}>
                                                    {formatCurrency(rowData.entnahme)}
                                                </span>
                                            </div>
                                            {formValue.strategie === "monatlich_fest" && rowData.monatlicheEntnahme && (
                                                <div className="sparplan-detail">
                                                    <span className="detail-label">📅 Monatlich:</span>
                                                    <span className="detail-value" style={{ color: '#6f42c1' }}>
                                                        {formatCurrency(rowData.monatlicheEntnahme)}
                                                    </span>
                                                </div>
                                            )}
                                            {formValue.inflationAktiv && rowData.inflationAnpassung !== undefined && (
                                                <div className="sparplan-detail">
                                                    <span className="detail-label">📈 Inflation:</span>
                                                    <span className="detail-value" style={{ color: '#fd7e14' }}>
                                                        {formatCurrency(rowData.inflationAnpassung)}
                                                    </span>
                                                </div>
                                            )}
                                            {formValue.strategie === "monatlich_fest" && formValue.guardrailsAktiv && rowData.portfolioAnpassung !== undefined && (
                                                <div className="sparplan-detail">
                                                    <span className="detail-label">🛡️ Guardrails:</span>
                                                    <span className="detail-value" style={{ color: '#20c997' }}>
                                                        {formatCurrency(rowData.portfolioAnpassung)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="sparplan-detail">
                                                <span className="detail-label">📈 Zinsen:</span>
                                                <span className="detail-value" style={{ color: '#17a2b8' }}>
                                                    {formatCurrency(rowData.zinsen)}
                                                </span>
                                            </div>
                                            <div className="sparplan-detail">
                                                <span className="detail-label">💳 Bezahlte Steuer:</span>
                                                <span className="detail-value" style={{ color: '#dc3545' }}>
                                                    {formatCurrency(rowData.bezahlteSteuer)}
                                                </span>
                                            </div>
                                            {formValue.grundfreibetragAktiv && rowData.einkommensteuer !== undefined && (
                                                <div className="sparplan-detail">
                                                    <span className="detail-label">🏛️ Einkommensteuer:</span>
                                                    <span className="detail-value" style={{ color: '#e83e8c' }}>
                                                        {formatCurrency(rowData.einkommensteuer)}
                                                    </span>
                                                </div>
                                            )}
                                            {formValue.grundfreibetragAktiv && rowData.genutzterGrundfreibetrag !== undefined && (
                                                <div className="sparplan-detail">
                                                    <span className="detail-label">🆓 Grundfreibetrag:</span>
                                                    <span className="detail-value" style={{ color: '#28a745' }}>
                                                        {formatCurrency(rowData.genutzterGrundfreibetrag)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hidden Desktop Table Layout */}
                        <div style={{ display: 'none' }}>
                            <div className="table-container">
                                <Table
                                    autoHeight
                                    data={withdrawalData.withdrawalArray}
                                    bordered
                                    rowHeight={60}
                                >
                                    <Column width={100}>
                                        <HeaderCell>Jahr</HeaderCell>
                                        <Cell dataKey="year" />
                                    </Column>
                                    <Column width={120}>
                                        <HeaderCell>Startkapital</HeaderCell>
                                        <Cell>
                                            {rowData => formatCurrency(rowData.startkapital)}
                                        </Cell>
                                    </Column>
                                    <Column width={120}>
                                        <HeaderCell>Entnahme</HeaderCell>
                                        <Cell>
                                            {rowData => formatCurrency(rowData.entnahme)}
                                        </Cell>
                                    </Column>
                                    {formValue.strategie === "monatlich_fest" && (
                                        <Column width={120}>
                                            <HeaderCell>Monatlich</HeaderCell>
                                            <Cell>
                                                {rowData => rowData.monatlicheEntnahme ? formatCurrency(rowData.monatlicheEntnahme) : '-'}
                                            </Cell>
                                        </Column>
                                    )}
                                    {formValue.inflationAktiv && (
                                        <Column width={120}>
                                            <HeaderCell>Inflation</HeaderCell>
                                            <Cell>
                                                {rowData => rowData.inflationAnpassung !== undefined ? formatCurrency(rowData.inflationAnpassung) : '-'}
                                            </Cell>
                                        </Column>
                                    )}
                                    {formValue.strategie === "monatlich_fest" && formValue.guardrailsAktiv && (
                                        <Column width={120}>
                                            <HeaderCell>Guardrails</HeaderCell>
                                            <Cell>
                                                {rowData => rowData.portfolioAnpassung !== undefined ? formatCurrency(rowData.portfolioAnpassung) : '-'}
                                            </Cell>
                                        </Column>
                                    )}
                                    {formValue.strategie === "dynamisch" && (
                                        <>
                                            <Column width={100}>
                                                <HeaderCell>Vorjahres-Rendite</HeaderCell>
                                                <Cell>
                                                    {rowData => rowData.vorjahresRendite !== undefined ? `${(rowData.vorjahresRendite * 100).toFixed(1)}%` : '-'}
                                                </Cell>
                                            </Column>
                                            <Column width={120}>
                                                <HeaderCell>Dynamische Anpassung</HeaderCell>
                                                <Cell>
                                                    {rowData => rowData.dynamischeAnpassung !== undefined ? formatCurrency(rowData.dynamischeAnpassung) : '-'}
                                                </Cell>
                                            </Column>
                                        </>
                                    )}
                                    <Column width={100}>
                                        <HeaderCell>Zinsen</HeaderCell>
                                        <Cell>
                                            {rowData => formatCurrency(rowData.zinsen)}
                                        </Cell>
                                    </Column>
                                    <Column width={120}>
                                        <HeaderCell>bezahlte Steuer</HeaderCell>
                                        <Cell>
                                            {rowData => formatCurrency(rowData.bezahlteSteuer)}
                                        </Cell>
                                    </Column>
                                    {formValue.grundfreibetragAktiv && (
                                        <Column width={120}>
                                            <HeaderCell>Einkommensteuer</HeaderCell>
                                            <Cell>
                                                {rowData => rowData.einkommensteuer !== undefined ? formatCurrency(rowData.einkommensteuer) : '-'}
                                            </Cell>
                                        </Column>
                                    )}
                                    {formValue.grundfreibetragAktiv && (
                                        <Column width={140}>
                                            <HeaderCell>Grundfreibetrag genutzt</HeaderCell>
                                            <Cell>
                                                {rowData => rowData.genutzterGrundfreibetrag !== undefined ? formatCurrency(rowData.genutzterGrundfreibetrag) : '-'}
                                            </Cell>
                                        </Column>
                                    )}
                                    <Column width={120}>
                                        <HeaderCell>Endkapital</HeaderCell>
                                        <Cell>
                                            {rowData => formatCurrency(rowData.endkapital)}
                                        </Cell>
                                    </Column>
                                </Table>
                            </div>
                        </div>
                    </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <p>Keine Daten verfügbar. Bitte stelle sicher, dass Sparpläne definiert sind und eine Simulation durchgeführt wurde.</p>
                    </div>
                )}
            </Panel>
        </>
    )
}


