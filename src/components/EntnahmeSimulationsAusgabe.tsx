import { useState, useMemo, useEffect } from "react";
import type { SparplanElement } from "../utils/sparplan-utils";
import { calculateWithdrawal, calculateSegmentedWithdrawal, getTotalCapitalAtYear, calculateWithdrawalDuration } from "../utils/withdrawal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { WithdrawalStrategy, WithdrawalResult } from "../utils/withdrawal";
import type { ReturnConfiguration } from "../../helpers/random-returns";
import type { WithdrawalSegment, SegmentedWithdrawalConfig } from "../utils/segmented-withdrawal";
import { createDefaultWithdrawalSegment } from "../utils/segmented-withdrawal";
import { WithdrawalSegmentForm } from "./WithdrawalSegmentForm";

export type WithdrawalReturnMode = 'fixed' | 'random' | 'variable';

export function EntnahmeSimulationsAusgabe({
    startEnd,
    elemente,
    dispatchEnd,
    onWithdrawalResultsChange,
}: {
        startEnd: [number, number];
        elemente: SparplanElement[];
        dispatchEnd: (val: [number, number]) => void;
        onWithdrawalResultsChange?: (results: WithdrawalResult | null) => void;
    }) {
    const [startOfIndependence, endOfLife] = startEnd;

    const [formValue, setFormValue] = useState({
        endOfLife,
        strategie: "4prozent" as WithdrawalStrategy,
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
        // Grundfreibetrag settings
        grundfreibetragAktiv: false,
        grundfreibetragBetrag: 10908, // Default German basic tax allowance for 2023
        einkommensteuersatz: 25, // Default income tax rate 25%
    });

    // Withdrawal return mode and variable returns state
    const [withdrawalReturnMode, setWithdrawalReturnMode] = useState<WithdrawalReturnMode>('fixed');
    const [withdrawalVariableReturns, setWithdrawalVariableReturns] = useState<Record<number, number>>({});
    
    // Withdrawal random return configuration
    const [withdrawalAverageReturn, setWithdrawalAverageReturn] = useState(5); // Default 5% (more conservative than accumulation)
    const [withdrawalStandardDeviation, setWithdrawalStandardDeviation] = useState(12); // Default 12% (more conservative than accumulation)
    const [withdrawalRandomSeed, setWithdrawalRandomSeed] = useState<number | undefined>(undefined);

    // Segmented withdrawal state
    const [useSegmentedWithdrawal, setUseSegmentedWithdrawal] = useState(false);
    const [withdrawalSegments, setWithdrawalSegments] = useState<WithdrawalSegment[]>(() => [
        createDefaultWithdrawalSegment(
            "main",
            "Hauptphase",
            startOfIndependence + 1,
            endOfLife
        )
    ]);

    // Calculate withdrawal projections
    const withdrawalData = useMemo(() => {
        if (!elemente || elemente.length === 0) {
            return null;
        }

        // Get total accumulated capital at the start of withdrawal phase
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
            
            withdrawalResult = calculateSegmentedWithdrawal(startingCapital, segmentedConfig);
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
                            Object.entries(withdrawalVariableReturns).map(([year, rate]) => [parseInt(year), rate / 100])
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
            withdrawalResult = calculateWithdrawal(
                startingCapital,
                startOfIndependence + 1, // Start withdrawals the year after accumulation ends
                formValue.endOfLife,
                formValue.strategie,
                withdrawalReturnConfig, // Use new return configuration API
                0.26375, // Default tax rate
                undefined, // Use default freibetrag
                // Pass monthly config only for monthly strategy
                formValue.strategie === "monatlich_fest" ? {
                    monthlyAmount: formValue.monatlicheBetrag,
                    enableGuardrails: formValue.guardrailsAktiv,
                    guardrailsThreshold: formValue.guardrailsSchwelle / 100
                } : undefined,
                // Pass custom percentage for variable percentage strategy
                formValue.strategie === "variabel_prozent" ? formValue.variabelProzent / 100 : undefined,
                // Grundfreibetrag parameters
                formValue.grundfreibetragAktiv,
                formValue.grundfreibetragAktiv ? (() => {
                    // Create grundfreibetrag object for all withdrawal years
                    const grundfreibetragPerYear: {[year: number]: number} = {};
                    for (let year = startOfIndependence + 1; year <= formValue.endOfLife; year++) {
                        grundfreibetragPerYear[year] = formValue.grundfreibetragBetrag;
                    }
                    return grundfreibetragPerYear;
                })() : undefined,
                formValue.grundfreibetragAktiv ? formValue.einkommensteuersatz / 100 : undefined,
                undefined, // variableReturns (legacy parameter)
                // Inflation configuration for all strategies
                formValue.inflationAktiv ? {
                    inflationRate: formValue.inflationsrate / 100
                } : undefined
            );
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
    }, [elemente, startOfIndependence, formValue.endOfLife, formValue.strategie, formValue.rendite, formValue.inflationAktiv, formValue.inflationsrate, formValue.monatlicheBetrag, formValue.guardrailsAktiv, formValue.guardrailsSchwelle, formValue.variabelProzent, formValue.grundfreibetragAktiv, formValue.grundfreibetragBetrag, formValue.einkommensteuersatz, withdrawalReturnMode, withdrawalVariableReturns, withdrawalAverageReturn, withdrawalStandardDeviation, withdrawalRandomSeed, useSegmentedWithdrawal, withdrawalSegments]);

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

    const handleFormChange = (newValues: Partial<typeof formValue>) => {
        const updatedFormValue = { ...formValue, ...newValues };
        setFormValue(updatedFormValue);
        dispatchEnd([startOfIndependence, updatedFormValue.endOfLife]);
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader><CardTitle>Variablen</CardTitle></CardHeader>
                <CardContent className="p-6 space-y-4">
                    {/* Toggle between single and segmented withdrawal */}
                    <div className="space-y-2">
                        <Label>Entnahme-Modus</Label>
                        <RadioGroup
                            value={useSegmentedWithdrawal ? "segmented" : "single"}
                            onValueChange={(value) => {
                                const useSegmented = value === "segmented";
                                setUseSegmentedWithdrawal(useSegmented);

                                if (useSegmented && withdrawalSegments.length === 0) {
                                    const defaultSegment = createDefaultWithdrawalSegment(
                                        "main",
                                        "Hauptphase",
                                        startOfIndependence + 1,
                                        formValue.endOfLife
                                    );
                                    setWithdrawalSegments([defaultSegment]);
                                }
                            }}
                            className="flex space-x-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="single" id="single-strategy" />
                                <Label htmlFor="single-strategy">Einheitliche Strategie</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="segmented" id="segmented-strategy" />
                                <Label htmlFor="segmented-strategy">Geteilte Phasen</Label>
                            </div>
                        </RadioGroup>
                        <p className="text-sm text-muted-foreground">
                            {useSegmentedWithdrawal
                                ? "Teile die Entnahme-Phase in verschiedene Zeiträume mit unterschiedlichen Strategien auf."
                                : "Verwende eine einheitliche Strategie für die gesamte Entnahme-Phase."
                            }
                        </p>
                    </div>

                    {useSegmentedWithdrawal ? (
                        /* Segmented withdrawal configuration */
                        <WithdrawalSegmentForm
                            segments={withdrawalSegments}
                            onSegmentsChange={setWithdrawalSegments}
                            withdrawalStartYear={startOfIndependence + 1}
                            withdrawalEndYear={formValue.endOfLife}
                        />
                    ) : (
                        /* Single strategy configuration (existing UI) */
                        <div className="space-y-4">
                        {/* Withdrawal Return Configuration */}
                        <div className="space-y-2">
                            <Label>Entnahme-Rendite Modus</Label>
                            <RadioGroup
                                value={withdrawalReturnMode}
                                onValueChange={(value) => setWithdrawalReturnMode(value as WithdrawalReturnMode)}
                                className="flex space-x-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="fixed" id="w-fixed" />
                                    <Label htmlFor="w-fixed">Feste Rendite</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="random" id="w-random" />
                                    <Label htmlFor="w-random">Zufällige Rendite</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="variable" id="w-variable" />
                                    <Label htmlFor="w-variable">Variable Rendite</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {withdrawalReturnMode === 'fixed' && (
                            <div className="space-y-2">
                                <Label>Erwartete Rendite (%)</Label>
                                <div className="flex items-center space-x-4">
                                <Slider
                                    value={[formValue.rendite]}
                                    onValueChange={(v) => handleFormChange({ rendite: v[0] })}
                                    min={0}
                                    max={10}
                                    step={0.5}
                                    className="w-[80%]"
                                />
                                <span className="w-[20%] text-right">{formValue.rendite}%</span>
                                </div>
                            </div>
                        )}

                        {withdrawalReturnMode === 'random' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Durchschnittliche Rendite (%)</Label>
                                    <div className="flex items-center space-x-4">
                                    <Slider
                                        value={[withdrawalAverageReturn]}
                                        onValueChange={(v) => setWithdrawalAverageReturn(v[0])}
                                        min={0}
                                        max={12}
                                        step={0.5}
                                        className="w-[80%]"
                                    />
                                    <span className="w-[20%] text-right">{withdrawalAverageReturn}%</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Erwartete durchschnittliche Rendite für die Entnahme-Phase (meist konservativer als Ansparphase)
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Standardabweichung (%)</Label>
                                    <div className="flex items-center space-x-4">
                                    <Slider
                                        value={[withdrawalStandardDeviation]}
                                        onValueChange={(v) => setWithdrawalStandardDeviation(v[0])}
                                        min={5}
                                        max={25}
                                        step={1}
                                        className="w-[80%]"
                                    />
                                    <span className="w-[20%] text-right">{withdrawalStandardDeviation}%</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Volatilität der Renditen (meist niedriger als Ansparphase wegen konservativerer Allokation)
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Zufalls-Seed (optional)</Label>
                                    <Input
                                        type="number"
                                        value={withdrawalRandomSeed ?? ''}
                                        onChange={(e) => setWithdrawalRandomSeed(e.target.value ? Number(e.target.value) : undefined)}
                                        placeholder="Für reproduzierbare Ergebnisse"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Optionaler Seed für reproduzierbare Zufallsrenditen. Leer lassen für echte Zufälligkeit.
                                    </p>
                                </div>
                            </div>
                        )}

                        {withdrawalReturnMode === 'variable' && (
                             <div className="space-y-2">
                                <Label>Variable Renditen pro Jahr (Entnahme-Phase)</Label>
                                <div className="max-h-72 overflow-y-auto rounded-md border p-2">
                                    {Array.from({ length: formValue.endOfLife - startOfIndependence }, (_, i) => {
                                        const year = startOfIndependence + 1 + i;
                                        return (
                                            <div key={year} className="flex items-center space-x-2 mb-2">
                                                <Label className="w-16 font-bold">{year}:</Label>
                                                <Slider
                                                    value={[withdrawalVariableReturns[year] || 5]}
                                                    min={-10}
                                                    max={15}
                                                    step={0.5}
                                                    onValueChange={(value) => {
                                                        const newReturns = { ...withdrawalVariableReturns, [year]: value[0] };
                                                        setWithdrawalVariableReturns(newReturns);
                                                    }}
                                                    className="flex-1"
                                                />
                                                <span className="w-20 text-right">
                                                    {(withdrawalVariableReturns[year] || 5).toFixed(1)}%
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Tipp: Verwende niedrigere Werte für konservative Portfolio-Allokation in der Rente und negative Werte für Krisen-Jahre.
                                </p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>End of Life</Label>
                            <Input
                                type="number"
                                value={formValue.endOfLife}
                                onChange={(e) => handleFormChange({ endOfLife: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Strategie</Label>
                            <RadioGroup
                                value={formValue.strategie}
                                onValueChange={(v) => handleFormChange({ strategie: v as WithdrawalStrategy })}
                                className="grid grid-cols-2 gap-2"
                            >
                                <Label htmlFor="4prozent" className="border rounded-md p-4 flex items-center space-x-2 cursor-pointer data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground">
                                    <RadioGroupItem value="4prozent" id="4prozent" />
                                    <span>4% Regel</span>
                                </Label>
                                <Label htmlFor="3prozent" className="border rounded-md p-4 flex items-center space-x-2 cursor-pointer data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground">
                                    <RadioGroupItem value="3prozent" id="3prozent" />
                                    <span>3% Regel</span>
                                </Label>
                                <Label htmlFor="variabel_prozent" className="border rounded-md p-4 flex items-center space-x-2 cursor-pointer data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground">
                                    <RadioGroupItem value="variabel_prozent" id="variabel_prozent" />
                                    <span>Variable Prozent</span>
                                </Label>
                                <Label htmlFor="monatlich_fest" className="border rounded-md p-4 flex items-center space-x-2 cursor-pointer data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground">
                                    <RadioGroupItem value="monatlich_fest" id="monatlich_fest" />
                                    <span>Monatlich fest</span>
                                </Label>
                            </RadioGroup>
                        </div>

                        {/* Grundfreibetrag settings */}
                        <div className="flex items-center space-x-2">
                            <Switch id="grundfreibetragAktiv" checked={formValue.grundfreibetragAktiv} onCheckedChange={(v) => handleFormChange({ grundfreibetragAktiv: v })} />
                            <Label htmlFor="grundfreibetragAktiv">Grundfreibetrag berücksichtigen</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Berücksichtigt den Grundfreibetrag für die Einkommensteuer bei Entnahmen (relevant für Rentner ohne weiteres Einkommen)
                        </p>

                        {/* General inflation controls for all strategies */}
                        <div className="flex items-center space-x-2">
                            <Switch id="inflationAktiv" checked={formValue.inflationAktiv} onCheckedChange={(v) => handleFormChange({ inflationAktiv: v })} />
                            <Label htmlFor="inflationAktiv">Inflation berücksichtigen</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Passt die Entnahmebeträge jährlich an die Inflation an (für alle Entnahme-Strategien)
                        </p>

                        {formValue.inflationAktiv && (
                            <div className="space-y-2">
                                <Label>Inflationsrate (%)</Label>
                                <div className="flex items-center space-x-4">
                                <Slider
                                    value={[formValue.inflationsrate]}
                                    onValueChange={(v) => handleFormChange({ inflationsrate: v[0] })}
                                    min={0}
                                    max={5}
                                    step={0.1}
                                    className="w-[80%]"
                                />
                                <span className="w-[20%] text-right">{formValue.inflationsrate}%</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Jährliche Inflationsrate zur Anpassung der Entnahmebeträge
                                </p>
                            </div>
                        )}

                        {formValue.grundfreibetragAktiv && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Grundfreibetrag pro Jahr (€)</Label>
                                    <Input
                                        type="number"
                                        value={formValue.grundfreibetragBetrag}
                                        onChange={(e) => handleFormChange({ grundfreibetragBetrag: Number(e.target.value) })}
                                        min={0}
                                        max={30000}
                                        step={100}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Grundfreibetrag für die Einkommensteuer (2023: 10.908 €)
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Einkommensteuersatz (%)</Label>
                                    <div className="flex items-center space-x-4">
                                    <Slider
                                        value={[formValue.einkommensteuersatz]}
                                        onValueChange={(v) => handleFormChange({ einkommensteuersatz: v[0] })}
                                        min={14}
                                        max={42}
                                        step={1}
                                        className="w-[80%]"
                                    />
                                    <span className="w-[20%] text-right">{formValue.einkommensteuersatz}%</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Vereinfachter Einkommensteuersatz (normalerweise zwischen 14% und 42%)
                                    </p>
                                </div>
                            </div>
                        )}
                        
                        {/* Variable percentage strategy specific controls */}
                        {formValue.strategie === "variabel_prozent" && (
                            <div className="space-y-2">
                                <Label>Entnahme-Prozentsatz (%)</Label>
                                <div className="flex items-center space-x-4">
                                <Slider
                                    value={[formValue.variabelProzent]}
                                    onValueChange={(v) => handleFormChange({ variabelProzent: v[0] })}
                                    min={2}
                                    max={7}
                                    step={0.5}
                                    className="w-[80%]"
                                />
                                <span className="w-[20%] text-right">{formValue.variabelProzent}%</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Wählen Sie einen Entnahme-Prozentsatz zwischen 2% und 7% in 0,5%-Schritten
                                </p>
                            </div>
                        )}

                        {/* Monthly strategy specific controls */}
                        {formValue.strategie === "monatlich_fest" && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Monatlicher Betrag (€)</Label>
                                    <Input
                                        type="number"
                                        value={formValue.monatlicheBetrag}
                                        onChange={(e) => handleFormChange({ monatlicheBetrag: Number(e.target.value) })}
                                        min={100}
                                        max={50000}
                                        step={100}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id="guardrailsAktiv" checked={formValue.guardrailsAktiv} onCheckedChange={(v) => handleFormChange({ guardrailsAktiv: v })} />
                                    <Label htmlFor="guardrailsAktiv">Dynamische Anpassung (Guardrails)</Label>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Passt die Entnahme basierend auf der Portfolio-Performance an
                                </p>
                                {formValue.guardrailsAktiv && (
                                    <div className="space-y-2">
                                        <Label>Anpassungsschwelle (%)</Label>
                                        <div className="flex items-center space-x-4">
                                        <Slider
                                            value={[formValue.guardrailsSchwelle]}
                                            onValueChange={(v) => handleFormChange({ guardrailsSchwelle: v[0] })}
                                            min={5}
                                            max={20}
                                            step={1}
                                            className="w-[80%]"
                                        />
                                        <span className="w-[20%] text-right">{formValue.guardrailsSchwelle}%</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Bei Überschreitung dieser Schwelle wird die Entnahme angepasst
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Simulation</CardTitle></CardHeader>
                <CardContent className="p-6">
                    {withdrawalData ? (
                        <div>
                            <div className="mb-5">
                                <h4 className="text-lg font-semibold">Entnahme-Simulation</h4>
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
                            <div className="md:hidden">
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

                            {/* Desktop Table Layout */}
                            <div className="hidden md:block">
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Jahr</TableHead>
                                                <TableHead>Startkapital</TableHead>
                                                <TableHead>Entnahme</TableHead>
                                                {formValue.strategie === "monatlich_fest" && <TableHead>Monatlich</TableHead>}
                                                {formValue.inflationAktiv && <TableHead>Inflation</TableHead>}
                                                {formValue.strategie === "monatlich_fest" && formValue.guardrailsAktiv && <TableHead>Guardrails</TableHead>}
                                                <TableHead>Zinsen</TableHead>
                                                <TableHead>bezahlte Steuer</TableHead>
                                                {formValue.grundfreibetragAktiv && <TableHead>Einkommensteuer</TableHead>}
                                                {formValue.grundfreibetragAktiv && <TableHead>Grundfreibetrag genutzt</TableHead>}
                                                <TableHead>Endkapital</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {withdrawalData.withdrawalArray.map((rowData) => (
                                                <TableRow key={rowData.year}>
                                                    <TableCell>{rowData.year}</TableCell>
                                                    <TableCell>{formatCurrency(rowData.startkapital)}</TableCell>
                                                    <TableCell>{formatCurrency(rowData.entnahme)}</TableCell>
                                                    {formValue.strategie === "monatlich_fest" && <TableCell>{rowData.monatlicheEntnahme ? formatCurrency(rowData.monatlicheEntnahme) : '-'}</TableCell>}
                                                    {formValue.inflationAktiv && <TableCell>{rowData.inflationAnpassung !== undefined ? formatCurrency(rowData.inflationAnpassung) : '-'}</TableCell>}
                                                    {formValue.strategie === "monatlich_fest" && formValue.guardrailsAktiv && <TableCell>{rowData.portfolioAnpassung !== undefined ? formatCurrency(rowData.portfolioAnpassung) : '-'}</TableCell>}
                                                    <TableCell>{formatCurrency(rowData.zinsen)}</TableCell>
                                                    <TableCell>{formatCurrency(rowData.bezahlteSteuer)}</TableCell>
                                                    {formValue.grundfreibetragAktiv && <TableCell>{rowData.einkommensteuer !== undefined ? formatCurrency(rowData.einkommensteuer) : '-'}</TableCell>}
                                                    {formValue.grundfreibetragAktiv && <TableCell>{rowData.genutzterGrundfreibetrag !== undefined ? formatCurrency(rowData.genutzterGrundfreibetrag) : '-'}</TableCell>}
                                                    <TableCell>{formatCurrency(rowData.endkapital)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p>Keine Daten verfügbar. Bitte stelle sicher, dass Sparpläne definiert sind und eine Simulation durchgeführt wurde.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}


