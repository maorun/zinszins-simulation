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
    Toggle,
    Form,
    Table,
    IconButton,
    FlexboxGrid
} from "rsuite";
import 'rsuite/dist/rsuite.min.css';
import { EntnahmeSimulationsAusgabe } from "../components/EntnahmeSimulationsAusgabe";
import { MonteCarloResults } from "../components/MonteCarloResults";
import type { Sparplan, SparplanElement } from "../components/SparplanEingabe";
import { SparplanEingabe, convertSparplanToElements, initialSparplan } from "../components/SparplanEingabe";
import { SparplanEnd, SparplanSimulationsAusgabe } from "../components/SparplanSimulationsAusgabe";
import { Zeitspanne } from "../components/Zeitspanne";

export const unique = function <T extends undefined | number | string>(data: undefined | null | T[]): T[] {
    if (!data || !data.length) {
        return []
    }
    return data.reduce((acc, curr) => {
        if (!acc.includes(curr)) {
            acc.push(curr)
        }
        return acc
    }, [] as T[])
}

export default function HomePage() {
    const [rendite, setRendite] = useState(5);
    
    // Tax configuration state
    const [steuerlast, setSteuerlast] = useState(26.375); // Capital gains tax rate as percentage
    const [teilfreistellungsquote, setTeilfreistellungsquote] = useState(30); // Partial exemption rate as percentage
    const [freibetragPerYear, setFreibetragPerYear] = useState<{[year: number]: number}>({2023: 2000}); // Tax allowance per year

    // Return configuration state
    const [returnMode, setReturnMode] = useState<ReturnMode>('fixed');
    const [averageReturn, setAverageReturn] = useState(7); // Percentage for random returns
    const [standardDeviation, setStandardDeviation] = useState(15); // Percentage for random returns
    const [randomSeed, setRandomSeed] = useState<number | undefined>(undefined);

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
                sparplanElements: sparplanElemente.map(element => ({
                    ...element,
                    simulation: result.filter(r => r.year >= element.start.getFullYear()).reduce((acc, r) => {
                        acc[r.year] = r;
                        return acc;
                    }, {} as any)
                }))
            });
        } catch (error) {
            console.error('Simulation error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [rendite, returnMode, averageReturn, standardDeviation, randomSeed, simulationAnnual, sparplanElemente, startEnd, yearToday, steuerlast, teilfreistellungsquote, freibetragPerYear]);

    useEffect(() => {
        performSimulation();
    }, [performSimulation]);

    const data = unique(simulationData && (simulationData.sparplanElements.flatMap((v: any) => v.simulation && Object.keys(v.simulation)).map(Number)))

    return (
        <div>

            <Button
                onClick={() => {
                    setSparplanElemente(convertSparplanToElements(sparplan, startEnd, simulationAnnual))
                    performSimulation()
                }}
            >
                Refresh</Button>

            <Panel header="Eingabe" bordered>
                <Panel header="Variablen" bordered>
                    <Zeitspanne startEnd={startEnd} dispatch={(val) => {
                        setStartEnd(val)
                        setSparplanElemente(convertSparplanToElements(sparplan, val, simulationAnnual))
                    }} />
                    
                    <Panel header="Rendite-Konfiguration" bordered>
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
                            </RadioGroup>
                        </Form.Group>

                        {returnMode === 'fixed' ? (
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
                        ) : (
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
                                    <Form.ControlLabel>Zufallsseed (optional)</Form.ControlLabel>
                                    <InputNumber
                                        placeholder="Leer für zufälligen Seed"
                                        value={randomSeed}
                                        onChange={(value) => {
                                            setRandomSeed(value || undefined);
                                            performSimulation();
                                        }}
                                    />
                                </Form.Group>
                            </>
                        )}
                    </Panel>

                    <Panel header="Steuer-Konfiguration" bordered>
                        <Form.Group controlId="steuerlast">
                            <Form.ControlLabel>Kapitalertragsteuer (%)</Form.ControlLabel>
                            <Slider
                                name="steuerlast"
                                renderTooltip={(value) => value + "%"}
                                handleTitle={(<div style={{ marginTop: '-17px' }}>{steuerlast}%</div>)}
                                progress
                                value={steuerlast}
                                min={0}
                                max={50}
                                step={0.1}
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
                                max={100}
                                step={1}
                                graduated
                                onChange={(value) => {
                                    setTeilfreistellungsquote(value);
                                    performSimulation();
                                }}
                            />
                        </Form.Group>
                        
                        <Form.Group controlId="freibetragPerYear">
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
                            
                            {Object.entries(freibetragPerYear).map(([year, betrag]) => (
                                <div key={year} style={{ marginBottom: '10px' }}>
                                    <FlexboxGrid>
                                        <FlexboxGrid.Item colspan={4}>
                                            <span>{year}:</span>
                                        </FlexboxGrid.Item>
                                        <FlexboxGrid.Item colspan={6}>
                                            <InputNumber
                                                min={0}
                                                value={betrag}
                                                onChange={(value) => {
                                                    setFreibetragPerYear(prev => ({
                                                        ...prev,
                                                        [year]: value || 0
                                                    }));
                                                    performSimulation();
                                                }}
                                            />
                                        </FlexboxGrid.Item>
                                        <FlexboxGrid.Item colspan={2}>
                                            <Button 
                                                size="xs" 
                                                color="red" 
                                                appearance="ghost"
                                                onClick={() => {
                                                    setFreibetragPerYear(prev => {
                                                        const newObj = { ...prev };
                                                        delete newObj[parseInt(year)];
                                                        return newObj;
                                                    });
                                                    performSimulation();
                                                }}
                                            >
                                                Entfernen
                                            </Button>
                                        </FlexboxGrid.Item>
                                    </FlexboxGrid>
                                </div>
                            ))}
                        </Form.Group>
                    </Panel>

                    <Panel header="Simulation-Konfiguration" bordered>
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
                </Panel>

                <Panel header="Sparpläne erstellen" collapsible bordered>
                    <SparplanEingabe 
                        sparplan={sparplan} 
                        setSparplan={setSparplan} 
                        simulationAnnual={simulationAnnual}
                        startEnd={startEnd}
                        dispatch={(sparplan) => {
                            setSparplanElemente(convertSparplanToElements(sparplan, startEnd, simulationAnnual))
                        }}
                    />
                </Panel>
            </Panel>

            {simulationData && (
                <>
                    <Panel header="Sparplan-Simulation" collapsible bordered>
                        <SparplanSimulationsAusgabe
                            startEnd={startEnd}
                            elemente={simulationData.sparplanElements}
                            simulationAnnual={simulationAnnual}
                        />
                    </Panel>

                    <Panel header="Entnahme" collapsible bordered>
                        <EntnahmeSimulationsAusgabe
                            startEnd={startEnd}
                            elemente={simulationData.sparplanElements}
                            dispatchEnd={(val) => setStartEnd(val)}
                        />
                    </Panel>

                    <Panel header="Monte Carlo Analyse" collapsible bordered>
                        <MonteCarloResults
                            years={data}
                            randomConfig={{
                                averageReturn: averageReturn / 100,
                                standardDeviation: standardDeviation / 100,
                                seed: randomSeed
                            }}
                        />
                    </Panel>

                    {returnMode === 'random' && (
                        <Panel header="Simulation" collapsible bordered>
                            <Table data={data.map(year => {
                                const yearData = simulationData.sparplanElements.flatMap((element: any) => 
                                    element.simulation[year] ? [element.simulation[year]] : []
                                )[0];
                                
                                return yearData ? {
                                    year,
                                    ...yearData
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
                    )}
                </>
            )}

            {isLoading && <div>Berechnung läuft...</div>}
        </div>
    );
}