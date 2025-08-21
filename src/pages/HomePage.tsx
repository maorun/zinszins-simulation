import { SimulationAnnual, type SimulationAnnualType, simulate } from "../utils/simulate";
import type { ReturnMode, ReturnConfiguration } from "../utils/random-returns";
import type { WithdrawalResult } from "../utils/withdrawal";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ChevronDown } from "lucide-react";
import { EntnahmeSimulationsAusgabe } from "../components/EntnahmeSimulationsAusgabe";
import { MonteCarloResults } from "../components/MonteCarloResults";
import { SparplanEingabe } from "../components/SparplanEingabe";
import { SparplanSimulationsAusgabe } from "../components/SparplanSimulationsAusgabe";
import type { Sparplan, SparplanElement } from "../utils/sparplan-utils";
import { convertSparplanToElements, initialSparplan } from "../utils/sparplan-utils";
import { fullSummary, getEnhancedSummary } from "../utils/summary-utils";
import { calculateWithdrawal } from "../utils/withdrawal";
import { unique } from "../utils/array-utils";
import { Zeitspanne } from "../components/Zeitspanne";
import { useToast } from "@/components/ui/use-toast";


export default function HomePage() {
    const { toast } = useToast();
    const [rendite, setRendite] = useState(5);
    
    // Collapsible state management
    const [configOpen, setConfigOpen] = useState(true);
    const [sparplanOpen, setSparplanOpen] = useState(true);
    const [simulationOpen, setSimulationOpen] = useState(true);
    const [entnahmeOpen, setEntnahmeOpen] = useState(false);
    const [monteCarloOpen, setMonteCarloOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    
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
            toast({
                title: "Simulation Error",
                description: `Ein Fehler ist aufgetreten: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
                variant: "destructive",
            });
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
                        const baseSummary = fullSummary(simulationData.sparplanElements);
                        let withdrawalResult;
                        
                        if (withdrawalResults) {
                            // Use the actual withdrawal results from EntnahmeSimulationsAusgabe
                            withdrawalResult = withdrawalResults;
                        } else {
                            // Fall back to default 4% rule calculation for overview
                            withdrawalResult = calculateWithdrawal(
                                baseSummary.endkapital,
                                startEnd[0], // Start of withdrawal 
                                startEnd[1], // End of life
                                "4prozent", // Default to 4% rule for overview
                                rendite / 100, // Convert percentage to decimal
                                26.375 / 100 // Default tax rate
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
            <Collapsible open={configOpen} onOpenChange={setConfigOpen}>
                <Card>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <CardTitle className="flex items-center justify-between">
                                ⚙️ Konfiguration
                                <ChevronDown className={`h-4 w-4 transition-transform ${configOpen ? 'rotate-180' : ''}`} />
                            </CardTitle>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent>
                            <div className="form-grid">
                                {/* Time Range */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>📅 Zeitspanne</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Zeitspanne startEnd={startEnd} dispatch={(val) => {
                                            setStartEnd(val)
                                            setSparplanElemente(convertSparplanToElements(sparplan, val, simulationAnnual))
                                        }} />
                                    </CardContent>
                                </Card>
                                
                                {/* Return Configuration */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>📈 Rendite-Konfiguration</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Rendite-Modus</Label>
                                                <RadioGroup 
                                                    value={returnMode} 
                                                    onValueChange={(value) => {
                                                        const mode = value as ReturnMode;
                                                        setReturnMode(mode);
                                                        performSimulation();
                                                    }}
                                                    className="flex flex-row gap-6"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="fixed" id="fixed" />
                                                        <Label htmlFor="fixed">Feste Rendite</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="random" id="random" />
                                                        <Label htmlFor="random">Zufällige Rendite</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="variable" id="variable" />
                                                        <Label htmlFor="variable">Variable Rendite</Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>

                            {returnMode === 'fixed' && (
                                <div className="space-y-2">
                                    <Label>Feste Rendite</Label>
                                    <div className="px-3">
                                        <Slider
                                            value={[rendite]}
                                            onValueChange={(value) => {
                                                setRendite(value[0])
                                                performSimulation({ rendite: value[0] })
                                            }}
                                            max={15}
                                            min={0}
                                            step={0.5}
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-sm text-muted-foreground mt-1">
                                            <span>0%</span>
                                            <span className="font-medium">{rendite}%</span>
                                            <span>15%</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {returnMode === 'random' && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Durchschnittliche Rendite</Label>
                                        <div className="px-3">
                                            <Slider
                                                value={[averageReturn]}
                                                onValueChange={(value) => {
                                                    setAverageReturn(value[0]);
                                                    performSimulation();
                                                }}
                                                max={15}
                                                min={0}
                                                step={0.5}
                                                className="w-full"
                                            />
                                            <div className="flex justify-between text-sm text-muted-foreground mt-1">
                                                <span>0%</span>
                                                <span className="font-medium">{averageReturn}%</span>
                                                <span>15%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Volatilität (Standardabweichung)</Label>
                                        <div className="px-3">
                                            <Slider
                                                value={[standardDeviation]}
                                                onValueChange={(value) => {
                                                    setStandardDeviation(value[0]);
                                                    performSimulation();
                                                }}
                                                max={30}
                                                min={5}
                                                step={1}
                                                className="w-full"
                                            />
                                            <div className="flex justify-between text-sm text-muted-foreground mt-1">
                                                <span>5%</span>
                                                <span className="font-medium">{standardDeviation}%</span>
                                                <span>30%</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>Zufallsseed (optional für reproduzierbare Ergebnisse)</Label>
                                        <Input
                                            type="number"
                                            placeholder="Leer lassen für echte Zufälligkeit"
                                            value={randomSeed || ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setRandomSeed(value ? parseInt(value) : undefined);
                                                performSimulation();
                                            }}
                                            min={1}
                                            max={999999}
                                        />
                                    </div>
                                </div>
                            )}

                            {returnMode === 'variable' && (
                                <div className="space-y-2">
                                    <Label>Variable Renditen pro Jahr</Label>
                                    <div className="max-h-80 overflow-y-auto border border-border rounded-md p-3 space-y-2">
                                        {Array.from({ length: startEnd[0] - yearToday + 1 }, (_, i) => {
                                            const year = yearToday + i;
                                        return (
                                            <div key={year} className="flex items-center gap-3">
                                                <div className="min-w-[60px] font-semibold">{year}:</div>
                                                <div className="flex-1 px-3">
                                                    <Slider
                                                        value={[variableReturns[year] || 5]}
                                                        min={-10}
                                                        max={20}
                                                        step={0.5}
                                                        onValueChange={(value) => {
                                                            const newReturns = { ...variableReturns, [year]: value[0] };
                                                            setVariableReturns(newReturns);
                                                            performSimulation();
                                                        }}
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div className="min-w-[50px] text-right font-medium">
                                                    {(variableReturns[year] || 5).toFixed(1)}%
                                                </div>
                                            </div>
                                        );
                                    })}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-2">
                                        Tipp: Verwende negative Werte für wirtschaftliche Krisen und höhere Werte für Boom-Jahre.
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                
                {/* Tax Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle>💰 Steuer-Konfiguration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Kapitalertragsteuer (%)</Label>
                                <div className="px-3">
                                    <Slider
                                        value={[steuerlast]}
                                        onValueChange={(value) => {
                                            setSteuerlast(value[0]);
                                            performSimulation();
                                        }}
                                        max={35}
                                        min={20}
                                        step={0.025}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                                        <span>20%</span>
                                        <span className="font-medium">{steuerlast.toFixed(3)}%</span>
                                        <span>35%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Teilfreistellungsquote (%)</Label>
                                <div className="px-3">
                                    <Slider
                                        value={[teilfreistellungsquote]}
                                        onValueChange={(value) => {
                                            setTeilfreistellungsquote(value[0]);
                                            performSimulation();
                                        }}
                                        max={50}
                                        min={0}
                                        step={1}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                                        <span>0%</span>
                                        <span className="font-medium">{teilfreistellungsquote}%</span>
                                        <span>50%</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Freibetrag pro Jahr (€)</Label>
                                <div className="space-y-2">
                            <div className="space-y-2">
                                <Label>Freibetrag pro Jahr (€)</Label>
                                {/* TODO: Implement Freibetrag configuration UI with shadcn/ui */}
                                <div className="text-sm text-muted-foreground">
                                    Aktuell konfiguriert: {Object.entries(freibetragPerYear).map(([year, amount]) => 
                                        `${year}: ${amount}€`).join(', ')}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                {/* Simulation Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle>⏱️ Berechnungsmodus</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label>Berechnungsmodus</Label>
                            <RadioGroup 
                                value={simulationAnnual} 
                                onValueChange={(value) => {
                                    const mode = value as SimulationAnnualType;
                                    setSimulationAnnual(mode);
                                    setSparplanElemente(convertSparplanToElements(sparplan, startEnd, mode));
                                }}
                                className="flex flex-row gap-6"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value={SimulationAnnual.yearly} id="yearly" />
                                    <Label htmlFor="yearly">Jährlich</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value={SimulationAnnual.monthly} id="monthly" />
                                    <Label htmlFor="monthly">Monatlich</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </CardContent>
    </CollapsibleContent>
</Card>
</Collapsible>

            {/* Savings Plans Configuration */}
            <Collapsible open={sparplanOpen} onOpenChange={setSparplanOpen}>
                <Card>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <CardTitle className="flex items-center justify-between">
                                💼 Sparpläne erstellen
                                <ChevronDown className={`h-4 w-4 transition-transform ${sparplanOpen ? 'rotate-180' : ''}`} />
                            </CardTitle>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent>
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