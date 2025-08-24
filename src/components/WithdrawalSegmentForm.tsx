import { useState } from "react";
import type { 
    WithdrawalSegment
} from "../utils/segmented-withdrawal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { validateWithdrawalSegments, createDefaultWithdrawalSegment } from "../utils/segmented-withdrawal";
import type { WithdrawalStrategy } from "../utils/withdrawal";
import type { ReturnConfiguration } from "../../helpers/random-returns";

export type WithdrawalReturnMode = 'fixed' | 'random' | 'variable';

interface WithdrawalSegmentFormProps {
    segments: WithdrawalSegment[];
    onSegmentsChange: (segments: WithdrawalSegment[]) => void;
    withdrawalStartYear: number;
    withdrawalEndYear: number;
}

export function WithdrawalSegmentForm({
    segments,
    onSegmentsChange,
    withdrawalStartYear,
    withdrawalEndYear
}: WithdrawalSegmentFormProps) {
    const [errors, setErrors] = useState<string[]>([]);

    // Validate segments whenever they change
    const validateAndUpdateSegments = (newSegments: WithdrawalSegment[]) => {
        const validationErrors = validateWithdrawalSegments(newSegments, withdrawalStartYear, withdrawalEndYear);
        setErrors(validationErrors);
        onSegmentsChange(newSegments);
    };

    // Add a new segment
    const addSegment = () => {
        const newId = `segment_${Date.now()}`;
        const lastSegment = segments[segments.length - 1];
        const startYear = lastSegment ? lastSegment.endYear + 1 : withdrawalStartYear;
        const endYear = Math.min(startYear + 5, withdrawalEndYear); // Default 5 year segment
        
        // Import createDefaultWithdrawalSegment here
        const newSegment = createDefaultWithdrawalSegment(newId, `Phase ${segments.length + 1}`, startYear, endYear);
        
        validateAndUpdateSegments([...segments, newSegment]);
    };

    // Remove a segment
    const removeSegment = (segmentId: string) => {
        const newSegments = segments.filter(s => s.id !== segmentId);
        validateAndUpdateSegments(newSegments);
    };

    // Update a specific segment
    const updateSegment = (segmentId: string, updates: Partial<WithdrawalSegment>) => {
        const newSegments = segments.map(segment => 
            segment.id === segmentId 
                ? { ...segment, ...updates }
                : segment
        );
        validateAndUpdateSegments(newSegments);
    };

    // Convert return mode to return configuration
    const getReturnConfigFromMode = (mode: WithdrawalReturnMode, segment: WithdrawalSegment): ReturnConfiguration => {
        switch (mode) {
            case 'fixed':
                return {
                    mode: 'fixed',
                    fixedRate: (segment.returnConfig.mode === 'fixed' ? segment.returnConfig.fixedRate : 0.05) || 0.05
                };
            case 'random':
                return {
                    mode: 'random',
                    randomConfig: {
                        averageReturn: 0.05,
                        standardDeviation: 0.12,
                        seed: undefined
                    }
                };
            case 'variable':
                return {
                    mode: 'variable',
                    variableConfig: {
                        yearlyReturns: {}
                    }
                };
            default:
                return segment.returnConfig;
        }
    };

    // Get return mode from return configuration
    const getReturnModeFromConfig = (returnConfig: ReturnConfiguration): WithdrawalReturnMode => {
        return returnConfig.mode as WithdrawalReturnMode;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Entnahme-Phasen konfigurieren</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-5">
                    <p className="text-sm text-muted-foreground">
                        Teile die Entnahme-Phase in verschiedene Zeiträume mit unterschiedlichen Strategien auf.
                        Dies ermöglicht es, verschiedene Ansätze für Früh-, Mittel- und Spätrente zu kombinieren.
                    </p>

                    {errors.length > 0 && (
                        <div className="text-red-500 mt-2">
                            <strong>Fehler:</strong>
                            <ul className="list-disc list-inside">
                                {errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <Button onClick={addSegment} className="mt-4">
                        <Plus className="mr-2 h-4 w-4" /> Phase hinzufügen
                    </Button>
                </div>

                <div className="space-y-4">
                {segments.map((segment, _index) => (
                    <Collapsible key={segment.id} className="border rounded-md">
                        <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between p-4 cursor-pointer">
                                <span>{segment.name} ({segment.startYear} - {segment.endYear})</span>
                                {segments.length > 1 && (
                                    <Button variant="ghost" size="icon" onClick={() => removeSegment(segment.id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                )}
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="p-4 border-t">
                                <div className="space-y-4">
                                    {/* Basic segment configuration */}
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Name der Phase</Label>
                                            <Input
                                                value={segment.name}
                                                onChange={(e) => updateSegment(segment.id, { name: e.target.value })}
                                                placeholder="z.B. Frühe Rente"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Startjahr</Label>
                                            <Input
                                                type="number"
                                                value={segment.startYear}
                                                onChange={(e) => updateSegment(segment.id, { startYear: Number(e.target.value) || withdrawalStartYear })}
                                                min={withdrawalStartYear}
                                                max={withdrawalEndYear}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Endjahr</Label>
                                            <Input
                                                type="number"
                                                value={segment.endYear}
                                                onChange={(e) => updateSegment(segment.id, { endYear: Number(e.target.value) || withdrawalEndYear })}
                                                min={withdrawalStartYear}
                                                max={withdrawalEndYear}
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Withdrawal strategy */}
                                    <div className="space-y-2">
                                        <Label>Entnahme-Strategie</Label>
                                        <RadioGroup
                                            value={segment.strategy}
                                            onValueChange={(value) => {
                                                const newStrategy = value as WithdrawalStrategy;
                                                const updates: Partial<WithdrawalSegment> = { strategy: newStrategy };
                                                if (newStrategy === "monatlich_fest" && !segment.monthlyConfig) {
                                                    updates.monthlyConfig = {
                                                        monthlyAmount: 2000,
                                                        enableGuardrails: false,
                                                        guardrailsThreshold: 0.10
                                                    };
                                                }
                                                updateSegment(segment.id, updates);
                                            }}
                                            className="grid grid-cols-2 gap-2"
                                        >
                                             <Label htmlFor={`4prozent-${segment.id}`} className="border rounded-md p-4 flex items-center space-x-2 cursor-pointer data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground">
                                                <RadioGroupItem value="4prozent" id={`4prozent-${segment.id}`} />
                                                <span>4% Regel</span>
                                            </Label>
                                            <Label htmlFor={`3prozent-${segment.id}`} className="border rounded-md p-4 flex items-center space-x-2 cursor-pointer data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground">
                                                <RadioGroupItem value="3prozent" id={`3prozent-${segment.id}`} />
                                                <span>3% Regel</span>
                                            </Label>
                                            <Label htmlFor={`variabel_prozent-${segment.id}`} className="border rounded-md p-4 flex items-center space-x-2 cursor-pointer data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground">
                                                <RadioGroupItem value="variabel_prozent" id={`variabel_prozent-${segment.id}`} />
                                                <span>Variable Prozent</span>
                                            </Label>
                                            <Label htmlFor={`monatlich_fest-${segment.id}`} className="border rounded-md p-4 flex items-center space-x-2 cursor-pointer data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground">
                                                <RadioGroupItem value="monatlich_fest" id={`monatlich_fest-${segment.id}`} />
                                                <span>Monatlich fest</span>
                                            </Label>
                                        </RadioGroup>
                                    </div>

                                    {segment.strategy === "variabel_prozent" && (
                                        <div className="space-y-2">
                                            <Label>Entnahme-Prozentsatz (%)</Label>
                                            <div className="flex items-center space-x-4">
                                            <Slider
                                                value={[(segment.customPercentage || 0.05) * 100]}
                                                min={2}
                                                max={7}
                                                step={0.5}
                                                onValueChange={(value) => updateSegment(segment.id, { customPercentage: value[0] / 100 })}
                                                className="w-[80%]"
                                            />
                                            <span className="w-[20%] text-right">{((segment.customPercentage || 0.05) * 100).toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    )}

                                    {segment.strategy === "monatlich_fest" && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Monatlicher Betrag (€)</Label>
                                                <Input
                                                    type="number"
                                                    value={segment.monthlyConfig?.monthlyAmount || 2000}
                                                    onChange={(e) => updateSegment(segment.id, {
                                                        monthlyConfig: {
                                                            ...segment.monthlyConfig,
                                                            monthlyAmount: Number(e.target.value) || 2000
                                                        }
                                                    })}
                                                    min={100}
                                                    max={50000}
                                                    step={100}
                                                />
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id={`guardrails-${segment.id}`}
                                                    checked={segment.monthlyConfig?.enableGuardrails || false}
                                                    onCheckedChange={(checked) => updateSegment(segment.id, {
                                                        monthlyConfig: {
                                                            ...segment.monthlyConfig,
                                                            monthlyAmount: segment.monthlyConfig?.monthlyAmount || 2000,
                                                            enableGuardrails: checked
                                                        }
                                                    })}
                                                />
                                                <Label htmlFor={`guardrails-${segment.id}`}>Dynamische Anpassung (Guardrails)</Label>
                                            </div>

                                            {segment.monthlyConfig?.enableGuardrails && (
                                                <div className="space-y-2">
                                                    <Label>Anpassungsschwelle (%)</Label>
                                                    <div className="flex items-center space-x-4">
                                                    <Slider
                                                        value={[(segment.monthlyConfig?.guardrailsThreshold || 0.10) * 100]}
                                                        min={5}
                                                        max={20}
                                                        step={1}
                                                        onValueChange={(value) => updateSegment(segment.id, {
                                                            monthlyConfig: {
                                                                ...segment.monthlyConfig,
                                                                monthlyAmount: segment.monthlyConfig?.monthlyAmount || 2000,
                                                                guardrailsThreshold: value[0] / 100
                                                            }
                                                        })}
                                                        className="w-[80%]"
                                                    />
                                                    <span className="w-[20%] text-right">{((segment.monthlyConfig?.guardrailsThreshold || 0.10) * 100).toFixed(0)}%</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <Separator />

                                    <div className="space-y-2">
                                        <Label>Rendite-Modus</Label>
                                        <RadioGroup
                                            value={getReturnModeFromConfig(segment.returnConfig)}
                                            onValueChange={(value) => {
                                                const newReturnConfig = getReturnConfigFromMode(value as WithdrawalReturnMode, segment);
                                                updateSegment(segment.id, { returnConfig: newReturnConfig });
                                            }}
                                            className="flex space-x-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="fixed" id={`fixed-${segment.id}`} />
                                                <Label htmlFor={`fixed-${segment.id}`}>Feste Rendite</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="random" id={`random-${segment.id}`} />
                                                <Label htmlFor={`random-${segment.id}`}>Zufällige Rendite</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="variable" id={`variable-${segment.id}`} />
                                                <Label htmlFor={`variable-${segment.id}`}>Variable Rendite</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    {segment.returnConfig.mode === 'fixed' && (
                                        <div className="space-y-2">
                                            <Label>Erwartete Rendite (%)</Label>
                                            <div className="flex items-center space-x-4">
                                            <Slider
                                                value={[(segment.returnConfig.fixedRate || 0.05) * 100]}
                                                min={0}
                                                max={10}
                                                step={0.5}
                                                onValueChange={(value) => updateSegment(segment.id, {
                                                    returnConfig: {
                                                        mode: 'fixed',
                                                        fixedRate: value[0] / 100
                                                    }
                                                })}
                                                className="w-[80%]"
                                            />
                                            <span className="w-[20%] text-right">{((segment.returnConfig.fixedRate || 0.05) * 100).toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    )}

                                    <Separator />

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id={`inflation-${segment.id}`}
                                            checked={segment.inflationConfig !== undefined}
                                            onCheckedChange={(checked) => updateSegment(segment.id, {
                                                inflationConfig: checked ? { inflationRate: 0.02 } : undefined
                                            })}
                                        />
                                        <Label htmlFor={`inflation-${segment.id}`}>Inflation berücksichtigen</Label>
                                    </div>

                                    {segment.inflationConfig && (
                                        <div className="space-y-2">
                                            <Label>Inflationsrate (%)</Label>
                                            <div className="flex items-center space-x-4">
                                            <Slider
                                                value={[(segment.inflationConfig.inflationRate || 0.02) * 100]}
                                                min={0}
                                                max={5}
                                                step={0.1}
                                                onValueChange={(value) => updateSegment(segment.id, {
                                                    inflationConfig: { inflationRate: value[0] / 100 }
                                                })}
                                                className="w-[80%]"
                                            />
                                            <span className="w-[20%] text-right">{((segment.inflationConfig.inflationRate || 0.02) * 100).toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id={`grundfreibetrag-${segment.id}`}
                                            checked={segment.enableGrundfreibetrag || false}
                                            onCheckedChange={(checked) => updateSegment(segment.id, { enableGrundfreibetrag: checked })}
                                        />
                                        <Label htmlFor={`grundfreibetrag-${segment.id}`}>Grundfreibetrag berücksichtigen</Label>
                                    </div>

                                    {segment.enableGrundfreibetrag && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Grundfreibetrag pro Jahr (€)</Label>
                                                <Input
                                                    type="number"
                                                    value={(() => {
                                                        if (segment.grundfreibetragPerYear && segment.startYear in segment.grundfreibetragPerYear) {
                                                            return segment.grundfreibetragPerYear[segment.startYear];
                                                        }
                                                        return 10908;
                                                    })()}
                                                    onChange={(e) => {
                                                        const grundfreibetragPerYear: {[year: number]: number} = {};
                                                        for (let year = segment.startYear; year <= segment.endYear; year++) {
                                                            grundfreibetragPerYear[year] = Number(e.target.value) || 10908;
                                                        }
                                                        updateSegment(segment.id, { grundfreibetragPerYear });
                                                    }}
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
                                                    value={[(segment.incomeTaxRate || 0.25) * 100]}
                                                    min={14}
                                                    max={42}
                                                    step={1}
                                                    onValueChange={(value) => updateSegment(segment.id, { incomeTaxRate: value[0] / 100 })}
                                                    className="w-[80%]"
                                                />
                                                <span className="w-[20%] text-right">{((segment.incomeTaxRate || 0.25) * 100).toFixed(0)}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                ))}
                </div>
            </CardContent>
        </Card>
    );
}