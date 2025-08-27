import { SimulationAnnual, type SimulationAnnualType, simulate } from "../utils/simulate";
import type { ReturnMode, ReturnConfiguration } from "../utils/random-returns";
import type { WithdrawalResult } from "../utils/withdrawal";
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
import type { WithdrawalResult } from "../../helpers/withdrawal";
import { calculateWithdrawal } from "../../helpers/withdrawal";
import { getEnhancedSummary } from "../utils/summary-utils";
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
    
    // Track withdrawal results from EntnahmeSimulationsAusgabe for financial overview
    const [withdrawalResults, setWithdrawalResults] = useState<WithdrawalResult | null>(null);

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

            {/* Quick Results - Enhanced Overview */}
            {simulationData ? (
                <div className="enhanced-endkapital-overview">
                    {(() => {
                        // Calculate the savings phase date range from sparplan elements
                        const startDates = simulationData.sparplanElements.map(el => new Date(el.start).getFullYear());
                        const savingsStartYear = Math.min(...startDates);
                        const savingsEndYear = startEnd[0]; // Withdrawal starts when savings end
                        
                        // Calculate withdrawal metrics - use actual withdrawal results if available, otherwise fall back to default 4% rule
                        let withdrawalResult;
                        
                        if (withdrawalResults) {
                            // Use the actual withdrawal results from EntnahmeSimulationsAusgabe
                            withdrawalResult = withdrawalResults;
                        } else {
                            // Fall back to default 4% rule calculation for overview
                            withdrawalResult = calculateWithdrawal(
                                simulationData.sparplanElements,
                                startEnd[0] + 1, // Start of withdrawal
                                startEnd[1], // End of life
                                "4prozent", // Default to 4% rule for overview
                                { mode: 'fixed', fixedRate: rendite / 100 },
                                steuerlast / 100,
                                teilfreistellungsquote / 100
                            );
                        }
                        
                        const enhancedSummary = getEnhancedSummary(
                            simulationData.sparplanElements,
                            savingsStartYear,
                            savingsEndYear,
                            withdrawalResult
                        );
                        
                        return (
                            <div className="overview-panel">
                                <h3 className="overview-title">🎯 Finanzübersicht - Schnelle Eckpunkte</h3>
                                
                                {/* Savings Phase */}
                                <div className="overview-section">
                                    <h4 className="section-title">📈 Ansparphase ({savingsStartYear} - {savingsEndYear})</h4>
                                    <div className="metrics-grid">
                                        <div className="metric-item highlight">
                                            <span className="metric-label">💰 Gesamte Einzahlungen</span>
                                            <span className="metric-value">
                                                {enhancedSummary.startkapital.toLocaleString('de-DE', { 
                                                    style: 'currency', 
                                                    currency: 'EUR' 
                                                })}
                                            </span>
                                        </div>
                                        <div className="metric-item highlight">
                                            <span className="metric-label">🎯 Endkapital Ansparphase</span>
                                            <span className="metric-value primary">
                                                {enhancedSummary.endkapital.toLocaleString('de-DE', { 
                                                    style: 'currency', 
                                                    currency: 'EUR' 
                                                })}
                                            </span>
                                        </div>
                                        <div className="metric-item">
                                            <span className="metric-label">📊 Gesamtzinsen Ansparphase</span>
                                            <span className="metric-value">
                                                {enhancedSummary.zinsen.toLocaleString('de-DE', { 
                                                    style: 'currency', 
                                                    currency: 'EUR' 
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
                                
                                {/* Withdrawal Phase */}
                                {enhancedSummary.endkapitalEntspharphase !== undefined && (
                                    <div className="overview-section">
                                        <h4 className="section-title">💸 Entsparphase ({startEnd[0]} - {startEnd[1]})</h4>
                                        <div className="metrics-grid">
                                            <div className="metric-item">
                                                <span className="metric-label">🏁 Endkapital Entsparphase</span>
                                                <span className="metric-value">
                                                    {enhancedSummary.endkapitalEntspharphase.toLocaleString('de-DE', { 
                                                        style: 'currency', 
                                                        currency: 'EUR' 
                                                    })}
                                                </span>
                                            </div>
                                            <div className="metric-item highlight">
                                                <span className="metric-label">💶 Monatliche Auszahlung</span>
                                                <span className="metric-value secondary">
                                                    {(enhancedSummary.monatlicheAuszahlung || 0).toLocaleString('de-DE', { 
                                                        style: 'currency', 
                                                        currency: 'EUR' 
                                                    })}
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
                    })()}
                </div>
            ) : (
                <div className="endkapital-highlight">
                    💰 Endkapital: ...
                </div>
            )}

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
                            <div className="table-container">
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
                            </div>
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
                            onWithdrawalResultsChange={setWithdrawalResults}
                            steuerlast={steuerlast / 100}
                            teilfreistellungsquote={teilfreistellungsquote / 100}
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
                        {/* Mobile Optimized View */}
                        <div className="mobile-only">
                            <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
                                💡 Tipp: Tippen Sie auf ein Jahr für Details
                            </div>
                            {data
                                .sort((a, b) => b - a)
                                .map((year, yearIndex) => {
                                    const yearData = simulationData?.sparplanElements
                                        .map((value: any) => value.simulation?.[Number(year)])
                                        .filter(Boolean)
                                        .flat();
                                    
                                    if (!yearData || yearData.length === 0) return null;
                                    
                                    // Calculate year totals
                                    const totalStartkapital = yearData.reduce((sum, item) => sum + Number(item?.startkapital || 0), 0);
                                    const totalZinsen = yearData.reduce((sum, item) => sum + Number(item?.zinsen || 0), 0);
                                    const totalEndkapital = yearData.reduce((sum, item) => sum + Number(item?.endkapital || 0), 0);
                                    const totalSteuer = yearData.reduce((sum, item) => sum + Number(item?.bezahlteSteuer || 0), 0);
                                    
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
                                                                        <div className="vorab-details">
                                                                            <span>Basiszins: {(value.vorabpauschaleDetails.basiszins * 100).toFixed(2)}%</span>
                                                                            <span>Vorabpauschale: {Number(value.vorabpauschaleDetails.vorabpauschaleAmount).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
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