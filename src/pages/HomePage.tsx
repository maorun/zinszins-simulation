import { SimulationAnnual, type SimulationAnnualType, simulate } from "../utils/simulate";
import type { ReturnMode, ReturnConfiguration } from "../utils/random-returns";
import type { WithdrawalResult } from "../utils/withdrawal";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
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
    
    // Tax configuration state
    const [steuerlast, setSteuerlast] = useState(26.375); // Capital gains tax rate as percentage
    const [teilfreistellungsquote, setTeilfreistellungsquote] = useState(30); // Partial exemption rate as percentage
    const [freibetragPerYear, setFreibetragPerYear] = useState<{[year: number]: number}>({2023: 2000}); // Tax allowance per year
    const [newFreibetragYear, setNewFreibetragYear] = useState<number | undefined>();


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
                className="mb-4 w-full"
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
            <Collapsible className="mb-4">
                <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-lg font-semibold">
                        <span className="mr-2">⚙️</span> Konfiguration
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                    <Card>
                        <CardContent className="pt-6 form-grid">
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
                                    <div className="space-y-2 mb-4">
                                        <Label>Rendite-Modus</Label>
                                        <RadioGroup
                                            value={returnMode}
                                            onValueChange={(value) => {
                                                const mode = value as ReturnMode;
                                                setReturnMode(mode);
                                                performSimulation();
                                            }}
                                            className="flex space-x-4"
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
                                            <div className="flex items-center space-x-4">
                                                <Slider
                                                    value={[rendite]}
                                                    min={0}
                                                    max={15}
                                                    step={0.5}
                                                    onValueChange={(value) => {
                                                        setRendite(value[0])
                                                        performSimulation({ rendite: value[0] })
                                                    }}
                                                    className="w-[80%]"
                                                />
                                                <span className="w-[20%] text-right">{rendite}%</span>
                                            </div>
                                        </div>
                                    )}

                                    {returnMode === 'random' && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Durchschnittliche Rendite</Label>
                                                <div className="flex items-center space-x-4">
                                                    <Slider
                                                        value={[averageReturn]}
                                                        min={0}
                                                        max={15}
                                                        step={0.5}
                                                        onValueChange={(value) => {
                                                            setAverageReturn(value[0]);
                                                            performSimulation();
                                                        }}
                                                        className="w-[80%]"
                                                    />
                                                    <span className="w-[20%] text-right">{averageReturn}%</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Volatilität (Standardabweichung)</Label>
                                                <div className="flex items-center space-x-4">
                                                <Slider
                                                    value={[standardDeviation]}
                                                    min={5}
                                                    max={30}
                                                    step={1}
                                                    onValueChange={(value) => {
                                                        setStandardDeviation(value[0]);
                                                        performSimulation();
                                                    }}
                                                    className="w-[80%]"
                                                />
                                                <span className="w-[20%] text-right">{standardDeviation}%</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Zufallsseed (optional für reproduzierbare Ergebnisse)</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="Leer lassen für echte Zufälligkeit"
                                                    value={randomSeed ?? ''}
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
                                            <div className="max-h-72 overflow-y-auto rounded-md border p-2">
                                                {Array.from({ length: startEnd[0] - yearToday + 1 }, (_, i) => {
                                                    const year = yearToday + i;
                                                    return (
                                                        <div key={year} className="flex items-center space-x-2 mb-2">
                                                            <Label className="w-16 font-bold">{year}:</Label>
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
                                                                className="flex-1"
                                                            />
                                                            <span className="w-20 text-right">
                                                                {(variableReturns[year] || 5).toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Tipp: Verwende negative Werte für wirtschaftliche Krisen und höhere Werte für Boom-Jahre.
                                            </div>
                                        </div>
                                    )}
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
                                            <div className="flex items-center space-x-4">
                                                <Slider
                                                    value={[steuerlast]}
                                                    min={20}
                                                    max={35}
                                                    step={0.025}
                                                    onValueChange={(value) => {
                                                        setSteuerlast(value[0]);
                                                        performSimulation();
                                                    }}
                                                    className="w-[80%]"
                                                />
                                                <span className="w-[20%] text-right">{steuerlast.toFixed(3)}%</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Teilfreistellungsquote (%)</Label>
                                            <div className="flex items-center space-x-4">
                                                <Slider
                                                    value={[teilfreistellungsquote]}
                                                    min={0}
                                                    max={50}
                                                    step={1}
                                                    onValueChange={(value) => {
                                                        setTeilfreistellungsquote(value[0]);
                                                        performSimulation();
                                                    }}
                                                    className="w-[80%]"
                                                />
                                                <span className="w-[20%] text-right">{teilfreistellungsquote}%</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Freibetrag pro Jahr (€)</Label>
                                            <div className="flex gap-2 mb-2">
                                                <div className="w-2/3">
                                                    <Input
                                                        type="number"
                                                        placeholder="Jahr"
                                                        value={newFreibetragYear ?? ''}
                                                        onChange={(e) => setNewFreibetragYear(Number(e.target.value))}
                                                    />
                                                </div>
                                                <div className="w-1/3">
                                                    <Button
                                                        onClick={() => {
                                                            if (newFreibetragYear && !freibetragPerYear[newFreibetragYear]) {
                                                                setFreibetragPerYear(prev => ({
                                                                    ...prev,
                                                                    [newFreibetragYear]: 2000
                                                                }));
                                                                setNewFreibetragYear(undefined);
                                                                performSimulation();
                                                            }
                                                        }}
                                                        className="w-full"
                                                    >
                                                        Hinzufügen
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="rounded-md border h-48 overflow-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="text-center">Jahr</TableHead>
                                                            <TableHead className="text-center">Freibetrag (€)</TableHead>
                                                            <TableHead className="text-center">Aktionen</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {Object.entries(freibetragPerYear).map(([year, amount]) => (
                                                            <TableRow key={year}>
                                                                <TableCell className="text-center">{year}</TableCell>
                                                                <TableCell className="text-center">
                                                                    <Input
                                                                        type="number"
                                                                        value={amount}
                                                                        min={0}
                                                                        max={10000}
                                                                        step={50}
                                                                        onChange={(e) => {
                                                                            const value = Number(e.target.value);
                                                                            if (value !== null && value !== undefined) {
                                                                                setFreibetragPerYear(prev => ({
                                                                                    ...prev,
                                                                                    [year]: value
                                                                                }));
                                                                                performSimulation();
                                                                            }
                                                                        }}
                                                                        className="w-24"
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => {
                                                                            const newFreibetrag = { ...freibetragPerYear };
                                                                            delete newFreibetrag[Number(year)];
                                                                            setFreibetragPerYear(newFreibetrag);
                                                                            performSimulation();
                                                                        }}
                                                                    >
                                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Simulation Configuration */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>⚙️ Simulation-Konfiguration</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Label>Berechnungsmodus</Label>
                                        <RadioGroup
                                            value={simulationAnnual}
                                            onValueChange={(value) => {
                                                const annual = value as SimulationAnnualType;
                                                setSimulationAnnual(annual);
                                                setSparplanElemente(convertSparplanToElements(sparplan, startEnd, annual));
                                            }}
                                            className="flex space-x-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value={SimulationAnnual.yearly} id="yearly"/>
                                                <Label htmlFor="yearly">Jährlich</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value={SimulationAnnual.monthly} id="monthly"/>
                                                <Label htmlFor="monthly">Monatlich</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>
                </CollapsibleContent>
            </Collapsible>

            {/* Savings Plans Configuration */}
            <Collapsible className="mb-4">
                <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-lg font-semibold">
                        <span className="mr-2">💼</span> Sparpläne erstellen
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                    <SparplanEingabe 
                        dispatch={(sparplan) => {
                            setSparplan(sparplan);
                            setSparplanElemente(convertSparplanToElements(sparplan, startEnd, simulationAnnual));
                        }}
                        simulationAnnual={simulationAnnual}
                    />
                </CollapsibleContent>
            </Collapsible>

            {/* Results Section */}
            {simulationData && (
                <div className="space-y-4">
                    {/* Remove the old SparplanEnd since we have the highlight box */}
                    
                    <Collapsible>
                        <CollapsibleTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-lg font-semibold">
                                <span className="mr-2">📊</span> Sparplan-Simulation
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent  className="pt-4">
                            <SparplanSimulationsAusgabe
                                startEnd={startEnd}
                                elemente={simulationData.sparplanElements}
                                simulationAnnual={simulationAnnual}
                            />
                        </CollapsibleContent>
                    </Collapsible>

                    <Collapsible>
                        <CollapsibleTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-lg font-semibold">
                                <span className="mr-2">💸</span> Entnahme
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent  className="pt-4">
                            <EntnahmeSimulationsAusgabe
                                startEnd={startEnd}
                                elemente={simulationData.sparplanElements}
                                dispatchEnd={(val) => setStartEnd(val)}
                                onWithdrawalResultsChange={setWithdrawalResults}
                            />
                        </CollapsibleContent>
                    </Collapsible>

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

                    <Card>
                        <CardHeader>
                            <CardTitle>📋 Detaillierte Simulation</CardTitle>
                        </CardHeader>
                        <CardContent>
                        {/* Mobile Optimized View */}
                        <div className="md:hidden">
                            <div className="mb-4 text-sm text-muted-foreground">
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
                                        <Collapsible key={year + '' + yearIndex} className="mb-2">
                                            <CollapsibleTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between">
                                                    <span>📅 Jahr {year}</span>
                                                    <span>{totalEndkapital.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €</span>
                                                </Button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="pt-2">
                                                <Card>
                                                    <CardContent className="pt-4 mobile-year-summary">
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
                                                            <Collapsible className="mt-4">
                                                                <CollapsibleTrigger asChild>
                                                                    <Button variant="outline" size="sm" className="w-full">
                                                                        📊 Details ({yearData.length} Sparpläne)
                                                                    </Button>
                                                                </CollapsibleTrigger>
                                                                <CollapsibleContent className="pt-2">
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
                                                                </CollapsibleContent>
                                                            </Collapsible>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    );
                                })}
                        </div>

                        {/* Desktop View - Original */}
                        <div className="hidden md:block">
                            {data
                                .sort((a, b) => b - a)
                                .map((year, index) => {
                                    return (
                                        <div key={year + '' + index} className="mb-5">
                                            <h3 className="text-lg font-semibold text-blue-600 border-b-2 border-blue-100 pb-2 mb-3">
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
                                                        <Card key={index} className="mb-2 bg-gray-50">
                                                            <CardContent className="p-3">
                                                                <div className="font-semibold mb-2">
                                                                    💰 Sparplan #{index + 1}
                                                                </div>
                                                                <div className="flex flex-wrap gap-x-4 gap-y-1">
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
                                                                    <div className="mt-3 p-2 bg-blue-50 rounded-md text-sm">
                                                                        <div className="font-semibold text-blue-600 mb-1.5">
                                                                            📊 Vorabpauschale-Berechnung
                                                                        </div>
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5">
                                                                            <div>
                                                                                <span className="font-medium">Basiszins:</span> {(value.vorabpauschaleDetails.basiszins * 100).toFixed(2)}%
                                                                            </div>
                                                                            <div>
                                                                                <span className="font-medium">Basisertrag:</span> {Number(value.vorabpauschaleDetails.basisertrag).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                                                                            </div>
                                                                            <div>
                                                                                <span className="font-medium">Vorabpauschale:</span> {Number(value.vorabpauschaleDetails.vorabpauschaleAmount).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                                                                            </div>
                                                                            <div>
                                                                                <span className="font-medium">Steuer vor Freibetrag:</span> {Number(value.vorabpauschaleDetails.steuerVorFreibetrag).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <div className="mt-2 flex justify-between text-sm">
                                                                    <div className={`font-medium ${value.bezahlteSteuer > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                                        💸 Bezahlte Steuer: {Number(value.bezahlteSteuer).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                                                                    </div>
                                                                    <div className="text-gray-600">
                                                                        🛡️ Genutzter Freibetrag: {Number(value.genutzterFreibetrag).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    );
                                                })}
                                        </div>
                                    );
                                })}
                        </div>
                        </CardContent>
                    </Card>


                </div>
            )}

            {isLoading && (
                <div className="loading-state">
                    ⏳ Berechnung läuft...
                </div>
            )}

            <footer>
                <div>💼 Zinseszins-Simulation</div>
                <div>📧 by Marco</div>
                <div>🚀 Erstellt mit React, TypeScript & shadcn/ui</div>
            </footer>
        </div>
    );
}