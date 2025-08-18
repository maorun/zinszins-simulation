import { SimulationAnnual, type SimulationAnnualType, simulate } from "../utils/simulate";
import type { ReturnMode, ReturnConfiguration } from "../utils/random-returns";
import { useCallback, useEffect, useState } from "react";
import {
    Button,
    Panel,
    Radio,
    RadioGroup,
    Slider,
    InputNumber,
    Form,
    Table,
    IconButton,
    FlexboxGrid
} from "rsuite";
import 'rsuite/dist/rsuite.min.css';
import { EntnahmeSimulationsAusgabe } from "../components/EntnahmeSimulationsAusgabe";
import { MonteCarloResults } from "../components/MonteCarloResults";
import { SparplanEingabe } from "../components/SparplanEingabe";
import { SparplanSimulationsAusgabe } from "../components/SparplanSimulationsAusgabe";
import type { Sparplan, SparplanElement } from "../utils/sparplan-utils";
import { convertSparplanToElements, initialSparplan } from "../utils/sparplan-utils";
import { fullSummary } from "../utils/summary-utils";
import { unique } from "../utils/array-utils";
import { Zeitspanne } from "../components/Zeitspanne";


export default function HomePage() {
    const [rendite, setRendite] = useState(5);
    
    // Tax configuration state
    const [steuerlast, setSteuerlast] = useState(26.375); // Capital gains tax rate as percentage
    const [teilfreistellungsquote, setTeilfreistellungsquote] = useState(30); // Partial exemption rate as percentage
    const [freibetragPerYear, setFreibetragPerYear] = useState<{[year: number]: number}>({2023: 2000}); // Tax allowance per year

    // Return configuration state
    const [returnMode, setReturnMode] = useState<ReturnMode>('fixed');
    const [averageReturn, setAverageReturn] = useState(7); // Percentage for random returns
    const [standardDeviation, setStandardDeviation] = useState(15); // Percentage
    const [randomSeed, setRandomSeed] = useState<number | undefined>(undefined);
    
    // Variable returns state: map of year to return rate (as percentage)
    const [variableReturns, setVariableReturns] = useState<Record<number, number>>({});

    // Grundfreibetrag für Einkommensteuer bei Entnahme
    // const Grundfreibetrag = 9744; // erst bei Auszahlung
    const [startEnd, setStartEnd] = useState<[number, number]>([2040, 2080]);

    const [sparplan, setSparplan] = useState<Sparplan[]>([initialSparplan]);

    const [simulationAnnual, setSimulationAnnual] = useState<SimulationAnnualType>(SimulationAnnual.yearly)
    const [sparplanElemente, setSparplanElemente] = useState<SparplanElement[]>(
        convertSparplanToElements([initialSparplan], startEnd, simulationAnnual)
    );

    // Replace useFetcher with local state
    const [simulationData, setSimulationData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const yearToday = new Date().getFullYear()

    const performSimulation = useCallback(async (overwrite: { rendite?: number } = {}) => {
        setIsLoading(true);
        
        try {
            // Build return configuration
            let returnConfig: ReturnConfiguration | number;
            
            if (overwrite.rendite !== undefined) {
                // Legacy API: use the old rendite parameter
                returnConfig = overwrite.rendite / 100;
            } else {
                // New API: build return configuration
                if (returnMode === 'random') {
                    returnConfig = {
                        mode: 'random',
                        randomConfig: {
                            averageReturn: averageReturn / 100 || 0.07, // Default 7%
                            standardDeviation: standardDeviation / 100 || 0.15, // Default 15%
                            seed: randomSeed
                        }
                    };
                } else if (returnMode === 'variable') {
                    returnConfig = {
                        mode: 'variable',
                        variableConfig: {
                            yearlyReturns: Object.fromEntries(
                                Object.entries(variableReturns).map(([year, rate]) => [parseInt(year), rate / 100])
                            )
                        }
                    };
                } else {
                    returnConfig = {
                        mode: 'fixed',
                        fixedRate: rendite / 100 || 0.05 // Default 5%
                    };
                }
            }

            const result = simulate(
                yearToday,
                startEnd[0],
                sparplanElemente,
                returnConfig,
                steuerlast / 100,
                simulationAnnual,
                teilfreistellungsquote / 100,
                freibetragPerYear
            );

            setSimulationData({
                sparplanElements: result.map(element => ({
                    ...element
                }))
            });
        } catch (error) {
            console.error('Simulation error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [rendite, returnMode, averageReturn, standardDeviation, randomSeed, variableReturns, simulationAnnual, sparplanElemente, startEnd, yearToday, steuerlast, teilfreistellungsquote, freibetragPerYear]);

    useEffect(() => {
        performSimulation();
    }, [performSimulation]);

    const data = unique(simulationData && (simulationData.sparplanElements.flatMap((v: any) => v.simulation && Object.keys(v.simulation)).map(Number)))

    return (
        <div className="app-container">
            <header className="app-header">
                <h1 className="app-title">Zinseszins-Simulation</h1>
                <p className="app-subtitle">Berechne deine Kapitalentwicklung mit deutschen Steuerregeln</p>
            </header>

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

            {/* Quick Results - Mobile First */}
            <div className="endkapital-highlight">
                💰 Endkapital: {simulationData ? (
                    fullSummary(simulationData.sparplanElements).endkapital.toLocaleString('de-DE', { 
                        style: 'currency', 
                        currency: 'EUR' 
                    })
                ) : '...'}
            </div>

            {/* Main Configuration */}
            <Panel header="⚙️ Konfiguration" collapsible bordered>
                <div className="form-grid">
                    {/* Time Range */}
                    <Panel header="📅 Zeitspanne" bordered>
                        <Zeitspanne startEnd={startEnd} dispatch={(val) => {
                            setStartEnd(val)
                            setSparplanElemente(convertSparplanToElements(sparplan, val, simulationAnnual))
                        }} />
                    </Panel>
                    
                    {/* Return Configuration */}
                    <Panel header="📈 Rendite-Konfiguration" bordered>
                        <Form.Group controlId="returnMode">
                            <Form.ControlLabel>Rendite-Modus</Form.ControlLabel>
                            <RadioGroup 
                                inline 
                                value={returnMode} 
                                onChange={(value) => {
                                    const mode = value as ReturnMode;
                                    setReturnMode(mode);
                                    performSimulation();
                                }}
                            >
                                <Radio value="fixed">Feste Rendite</Radio>
                                <Radio value="random">Zufällige Rendite</Radio>
                                <Radio value="variable">Variable Rendite</Radio>
                            </RadioGroup>
                        </Form.Group>

                        {returnMode === 'fixed' && (
                            <Form.Group controlId="fixedReturn">
                                <Form.ControlLabel>Feste Rendite</Form.ControlLabel>
                                <Slider
                                    name="rendite"
                                    renderTooltip={(value) => value + "%"}
                                    handleTitle={(<div style={{ marginTop: '-17px' }}>{rendite}%</div>)}
                                    progress
                                    value={rendite}
                                    min={0}
                                    max={15}
                                    step={0.5}
                                    graduated
                                    onChange={(r) => {
                                        setRendite(r)
                                        performSimulation({ rendite: r })
                                    }}
                                />
                            </Form.Group>
                        )}

                        {returnMode === 'random' && (
                            <>
                                <Form.Group controlId="averageReturn">
                                    <Form.ControlLabel>Durchschnittliche Rendite</Form.ControlLabel>
                                    <Slider
                                        name="averageReturn"
                                        renderTooltip={(value) => value + "%"}
                                        handleTitle={(<div style={{ marginTop: '-17px' }}>{averageReturn}%</div>)}
                                        progress
                                        value={averageReturn}
                                        min={0}
                                        max={15}
                                        step={0.5}
                                        graduated
                                        onChange={(value) => {
                                            setAverageReturn(value);
                                            performSimulation();
                                        }}
                                    />
                                </Form.Group>
                                
                                <Form.Group controlId="standardDeviation">
                                    <Form.ControlLabel>Volatilität (Standardabweichung)</Form.ControlLabel>
                                    <Slider
                                        name="standardDeviation"
                                        renderTooltip={(value) => value + "%"}
                                        handleTitle={(<div style={{ marginTop: '-17px' }}>{standardDeviation}%</div>)}
                                        progress
                                        value={standardDeviation}
                                        min={5}
                                        max={30}
                                        step={1}
                                        graduated
                                        onChange={(value) => {
                                            setStandardDeviation(value);
                                            performSimulation();
                                        }}
                                    />
                                </Form.Group>
                                
                                <Form.Group controlId="randomSeed">
                                    <Form.ControlLabel>Zufallsseed (optional für reproduzierbare Ergebnisse)</Form.ControlLabel>
                                    <InputNumber
                                        placeholder="Leer lassen für echte Zufälligkeit"
                                        value={randomSeed}
                                        onChange={(value) => {
                                            setRandomSeed(typeof value === 'number' ? value : undefined);
                                            performSimulation();
                                        }}
                                        min={1}
                                        max={999999}
                                    />
                                </Form.Group>
                            </>
                        )}

                        {returnMode === 'variable' && (
                            <Form.Group controlId="variableReturns">
                                <Form.ControlLabel>Variable Renditen pro Jahr</Form.ControlLabel>
                                <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e5e5ea', borderRadius: '6px', padding: '10px' }}>
                                    {Array.from({ length: startEnd[0] - yearToday + 1 }, (_, i) => {
                                        const year = yearToday + i;
                                        return (
                                            <div key={year} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', gap: '10px' }}>
                                                <div style={{ minWidth: '60px', fontWeight: 'bold' }}>{year}:</div>
                                                <div style={{ flex: 1 }}>
                                                    <Slider
                                                        value={variableReturns[year] || 5}
                                                        min={-10}
                                                        max={20}
                                                        step={0.5}
                                                        onChange={(value) => {
                                                            const newReturns = { ...variableReturns, [year]: value };
                                                            setVariableReturns(newReturns);
                                                            performSimulation();
                                                        }}
                                                    />
                                                </div>
                                                <div style={{ minWidth: '50px', textAlign: 'right' }}>
                                                    {(variableReturns[year] || 5).toFixed(1)}%
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                                    Tipp: Verwende negative Werte für wirtschaftliche Krisen und höhere Werte für Boom-Jahre.
                                </div>
                            </Form.Group>
                        )}
                    </Panel>
                    
                    {/* Tax Configuration */}
                    <Panel header="💰 Steuer-Konfiguration" bordered>
                        <Form.Group controlId="steuerlast">
                            <Form.ControlLabel>Kapitalertragsteuer (%)</Form.ControlLabel>
                            <Slider
                                name="steuerlast"
                                renderTooltip={(value) => value + "%"}
                                handleTitle={(<div style={{ marginTop: '-17px' }}>{steuerlast}%</div>)}
                                progress
                                value={steuerlast}
                                min={20}
                                max={35}
                                step={0.025}
                                graduated
                                onChange={(value) => {
                                    setSteuerlast(value);
                                    performSimulation();
                                }}
                            />
                        </Form.Group>
                        
                        <Form.Group controlId="teilfreistellungsquote">
                            <Form.ControlLabel>Teilfreistellungsquote (%)</Form.ControlLabel>
                            <Slider
                                name="teilfreistellungsquote"
                                renderTooltip={(value) => value + "%"}
                                handleTitle={(<div style={{ marginTop: '-17px' }}>{teilfreistellungsquote}%</div>)}
                                progress
                                value={teilfreistellungsquote}
                                min={0}
                                max={50}
                                step={1}
                                graduated
                                onChange={(value) => {
                                    setTeilfreistellungsquote(value);
                                    performSimulation();
                                }}
                            />
                        </Form.Group>
                        
                        <Form.Group controlId="freibetragConfiguration">
                            <Form.ControlLabel>Freibetrag pro Jahr (€)</Form.ControlLabel>
                            <div style={{ marginBottom: '10px' }}>
                                <FlexboxGrid>
                                    <FlexboxGrid.Item colspan={8}>
                                        <InputNumber
                                            placeholder="Jahr"
                                            min={yearToday}
                                            max={2100}
                                            value={undefined}
                                            onChange={(value) => {
                                                if (value && !freibetragPerYear[value]) {
                                                    setFreibetragPerYear(prev => ({
                                                        ...prev,
                                                        [value]: 2000 // Default value
                                                    }));
                                                    performSimulation();
                                                }
                                            }}
                                        />
                                    </FlexboxGrid.Item>
                                    <FlexboxGrid.Item colspan={2}>
                                        <Button
                                            onClick={() => {
                                                const year = yearToday;
                                                if (!freibetragPerYear[year]) {
                                                    setFreibetragPerYear(prev => ({
                                                        ...prev,
                                                        [year]: 2000
                                                    }));
                                                    performSimulation();
                                                }
                                            }}
                                        >
                                            Jahr hinzufügen
                                        </Button>
                                    </FlexboxGrid.Item>
                                </FlexboxGrid>
                            </div>
                            <Table
                                height={200}
                                data={Object.entries(freibetragPerYear).map(([year, amount]) => ({ year: Number(year), amount }))}
                            >
                                <Table.Column width={100} align="center">
                                    <Table.HeaderCell>Jahr</Table.HeaderCell>
                                    <Table.Cell dataKey="year" />
                                </Table.Column>
                                <Table.Column width={120} align="center">
                                    <Table.HeaderCell>Freibetrag (€)</Table.HeaderCell>
                                    <Table.Cell>
                                        {(rowData: any) => (
                                            <InputNumber
                                                value={freibetragPerYear[rowData.year]}
                                                min={0}
                                                max={10000}
                                                step={50}
                                                onChange={(value) => {
                                                    if (value !== null && value !== undefined) {
                                                        setFreibetragPerYear(prev => ({
                                                            ...prev,
                                                            [rowData.year]: value
                                                        }));
                                                        performSimulation();
                                                    }
                                                }}
                                            />
                                        )}
                                    </Table.Cell>
                                </Table.Column>
                                <Table.Column width={80} align="center">
                                    <Table.HeaderCell>Aktionen</Table.HeaderCell>
                                    <Table.Cell>
                                        {(rowData: any) => (
                                            <IconButton
                                                size="sm"
                                                color="red"
                                                appearance="ghost"
                                                onClick={() => {
                                                    const newFreibetrag = { ...freibetragPerYear };
                                                    delete newFreibetrag[rowData.year];
                                                    setFreibetragPerYear(newFreibetrag);
                                                    performSimulation();
                                                }}
                                            >
                                                Löschen
                                            </IconButton>
                                        )}
                                    </Table.Cell>
                                </Table.Column>
                            </Table>
                        </Form.Group>
                    </Panel>
                    
                    {/* Simulation Configuration */}
                    <Panel header="⚙️ Simulation-Konfiguration" bordered>
                        <Form.Group controlId="simulationAnnual">
                            <Form.ControlLabel>Berechnungsmodus</Form.ControlLabel>
                            <RadioGroup
                                inline
                                value={simulationAnnual}
                                onChange={(value) => {
                                    const annual = value as SimulationAnnualType;
                                    setSimulationAnnual(annual);
                                    setSparplanElemente(convertSparplanToElements(sparplan, startEnd, annual));
                                }}
                            >
                                <Radio value={SimulationAnnual.yearly}>Jährlich</Radio>
                                <Radio value={SimulationAnnual.monthly}>Monatlich</Radio>
                            </RadioGroup>
                        </Form.Group>
                    </Panel>
                </div>
            </Panel>

            {/* Savings Plans Configuration */}
            <Panel header="💼 Sparpläne erstellen" collapsible bordered>
                    <SparplanEingabe 
                        dispatch={(sparplan) => {
                            setSparplan(sparplan);
                            setSparplanElemente(convertSparplanToElements(sparplan, startEnd, simulationAnnual));
                        }}
                        simulationAnnual={simulationAnnual}
                    />
            </Panel>

            {/* Results Section */}
            {simulationData && (
                <>
                    {/* Remove the old SparplanEnd since we have the highlight box */}
                    
                    <Panel header="📊 Sparplan-Simulation" collapsible bordered>
                        <SparplanSimulationsAusgabe
                            startEnd={startEnd}
                            elemente={simulationData.sparplanElements}
                            simulationAnnual={simulationAnnual}
                        />
                    </Panel>

                    <Panel header="💸 Entnahme" collapsible bordered>
                        <EntnahmeSimulationsAusgabe
                            startEnd={startEnd}
                            elemente={simulationData.sparplanElements}
                            dispatchEnd={(val) => setStartEnd(val)}
                        />
                    </Panel>

                    <Panel header="🎲 Monte Carlo Analyse" collapsible bordered>
                        <MonteCarloResults
                            years={data}
                            accumulationConfig={{
                                averageReturn: averageReturn / 100,
                                standardDeviation: standardDeviation / 100,
                                seed: randomSeed
                            }}
                            withdrawalConfig={{
                                averageReturn: 0.05, // Default 5% for withdrawal phase (more conservative)
                                standardDeviation: 0.12, // Default 12% volatility (more conservative)
                                seed: randomSeed
                            }}
                        />
                    </Panel>

                    <Panel header="📋 Detaillierte Simulation" bordered collapsible defaultExpanded>
                        <div>
                            {data
                                .sort((a, b) => b - a)
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
                                                                    <div style={{ fontWeight: 600, color: '#1976d2', marginBottom: '6px' }}>
                                                                        📊 Vorabpauschale-Berechnung
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
                    </Panel>

                    <Panel header="📋 Detaillierte Simulation" collapsible bordered defaultExpanded>
                            <Table data={data.map(year => {
                                const yearData = simulationData.sparplanElements.flatMap((element: any) => 
                                    element.simulation[year] ? [element.simulation[year]] : []
                                )[0];
                                
                                // Calculate return rate from the data or use the configured rate
                                let returnRate = 0;
                                if (returnMode === 'fixed') {
                                    returnRate = rendite; // Use the fixed return rate setting
                                } else if (yearData && yearData.startkapital > 0 && yearData.endkapital > 0) {
                                    // Calculate from actual growth
                                    returnRate = ((yearData.endkapital / yearData.startkapital) - 1) * 100;
                                }
                                
                                return yearData ? {
                                    year,
                                    ...yearData,
                                    rendite: returnRate / 100 // Convert to decimal for display
                                } : null;
                            }).filter(Boolean)} autoHeight>
                                <Table.Column width={70} align="center" fixed>
                                    <Table.HeaderCell>Jahr</Table.HeaderCell>
                                    <Table.Cell dataKey="year" />
                                </Table.Column>

                                <Table.Column width={120} align="center">
                                    <Table.HeaderCell>Einzahlung (€)</Table.HeaderCell>
                                    <Table.Cell>
                                        {(rowData: any) => rowData.einzahlung?.toLocaleString('de-DE', { minimumFractionDigits: 2 }) || '0,00'}
                                    </Table.Cell>
                                </Table.Column>

                                <Table.Column width={120} align="center">
                                    <Table.HeaderCell>Zinsen (€)</Table.HeaderCell>
                                    <Table.Cell>
                                        {(rowData: any) => rowData.zinsen?.toLocaleString('de-DE', { minimumFractionDigits: 2 }) || '0,00'}
                                    </Table.Cell>
                                </Table.Column>

                                <Table.Column width={120} align="center">
                                    <Table.HeaderCell>Kapital (€)</Table.HeaderCell>
                                    <Table.Cell>
                                        {(rowData: any) => rowData.kapital?.toLocaleString('de-DE', { minimumFractionDigits: 2 }) || '0,00'}
                                    </Table.Cell>
                                </Table.Column>

                                <Table.Column width={120} align="center">
                                    <Table.HeaderCell>Steuern (€)</Table.HeaderCell>
                                    <Table.Cell>
                                        {(rowData: any) => rowData.steuern?.toLocaleString('de-DE', { minimumFractionDigits: 2 }) || '0,00'}
                                    </Table.Cell>
                                </Table.Column>

                                <Table.Column width={120} align="center">
                                    <Table.HeaderCell>Rendite (%)</Table.HeaderCell>
                                    <Table.Cell>
                                        {(rowData: any) => rowData.rendite ? (rowData.rendite * 100).toFixed(2) + '%' : '0,00%'}
                                    </Table.Cell>
                                </Table.Column>
                            </Table>
                        </Panel>
                </>
            )}

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