import { useState } from "react";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { RadioTileGroup, RadioTile } from './ui/radio-tile';
import { Separator } from './ui/separator';
import { Plus, Trash2 } from 'lucide-react';

// Temporary components still from stubs
import { 
  Form, 
  InputNumber, 
  Toggle
} from './temp-rsuite-stubs';
import type { 
    WithdrawalSegment
} from "../utils/segmented-withdrawal";
import { validateWithdrawalSegments, createDefaultWithdrawalSegment } from "../utils/segmented-withdrawal";
import type { WithdrawalStrategy } from "../../helpers/withdrawal";
import type { ReturnConfiguration } from "../../helpers/random-returns";
import { DynamicWithdrawalConfiguration } from "./DynamicWithdrawalConfiguration";

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

    // Check if more segments can be added
    const canAddMoreSegments = () => {
        const lastSegment = segments[segments.length - 1];
        const nextStartYear = lastSegment ? lastSegment.endYear + 1 : withdrawalStartYear;
        return nextStartYear <= withdrawalEndYear;
    };

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
        
        // Check if there's space for a new segment
        if (startYear > withdrawalEndYear) {
            return; // Cannot add more segments - no available years
        }
        
        // Calculate end year, ensuring it's at least the start year and doesn't exceed withdrawal end year
        const endYear = Math.max(startYear, Math.min(startYear + 5, withdrawalEndYear)); // Default 5 year segment
        
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
                    <p className="mb-4">
                        Teile die Entnahme-Phase in verschiedene Zeiträume mit unterschiedlichen Strategien auf.
                        Dies ermöglicht es, verschiedene Ansätze für Früh-, Mittel- und Spätrente zu kombinieren.
                    </p>
                    
                    {errors.length > 0 && (
                        <div className="text-destructive mb-4">
                            <strong>Fehler:</strong>
                            <ul className="list-disc list-inside">
                                {errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    <Button 
                        onClick={addSegment} 
                        disabled={!canAddMoreSegments()}
                        className="mb-4"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Phase hinzufügen
                    </Button>
                </div>

                {segments.map((segment, _index) => (
                    <Card 
                        key={segment.id} 
                        className="mb-4"
                    >
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">{segment.name} ({segment.startYear} - {segment.endYear})</CardTitle>
                                {segments.length > 1 && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => removeSegment(segment.id)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                    <Form fluid>
                        {/* Basic segment configuration - Mobile responsive layout */}
                        <div className="form-grid">
                            <Form.Group>
                                <Form.ControlLabel>Name der Phase</Form.ControlLabel>
                                <Input
                                    value={segment.name}
                                    onChange={(e) => updateSegment(segment.id, { name: e.target.value })}
                                    placeholder="z.B. Frühe Rente"
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel>Startjahr</Form.ControlLabel>
                                <InputNumber
                                    value={segment.startYear}
                                    onChange={(value: number | undefined) => updateSegment(segment.id, { startYear: Number(value) || withdrawalStartYear })}
                                    min={withdrawalStartYear}
                                    max={withdrawalEndYear}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel>Endjahr</Form.ControlLabel>
                                <InputNumber
                                    value={segment.endYear}
                                    onChange={(value: number | undefined) => updateSegment(segment.id, { endYear: Number(value) || withdrawalEndYear })}
                                    min={withdrawalStartYear}
                                    max={withdrawalEndYear}
                                />
                            </Form.Group>
                        </div>

                        <Separator />

                        {/* Withdrawal strategy */}
                        <Form.Group>
                            <Form.ControlLabel>Entnahme-Strategie</Form.ControlLabel>
                            <RadioTileGroup 
                                value={segment.strategy}
                                onValueChange={(value: string) => {
                                    const newStrategy = value as WithdrawalStrategy;
                                    const updates: Partial<WithdrawalSegment> = { strategy: newStrategy };
                                    
                                    // Initialize monthlyConfig when switching to monatlich_fest strategy
                                    if (newStrategy === "monatlich_fest" && !segment.monthlyConfig) {
                                        updates.monthlyConfig = {
                                            monthlyAmount: 2000,
                                            enableGuardrails: false,
                                            guardrailsThreshold: 0.10
                                        };
                                    }
                                    
                                    // Initialize customPercentage when switching to variabel_prozent strategy
                                    if (newStrategy === "variabel_prozent" && segment.customPercentage === undefined) {
                                        updates.customPercentage = 0.05; // 5% default
                                    }
                                    
                                    // Initialize dynamicConfig when switching to dynamisch strategy
                                    if (newStrategy === "dynamisch" && !segment.dynamicConfig) {
                                        updates.dynamicConfig = {
                                            baseWithdrawalRate: 0.04, // 4% base rate
                                            upperThresholdReturn: 0.08, // 8% upper threshold
                                            upperThresholdAdjustment: 0.05, // 5% increase when exceeding
                                            lowerThresholdReturn: 0.02, // 2% lower threshold
                                            lowerThresholdAdjustment: -0.05, // 5% decrease when below
                                        };
                                    }
                                    
                                    updateSegment(segment.id, updates);
                                }}
                            >
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
                                    Rendite-abhängige Anpassung
                                </RadioTile>
                            </RadioTileGroup>
                        </Form.Group>

                        {/* Withdrawal frequency configuration */}
                        <Form.Group>
                            <Form.ControlLabel>Entnahme-Häufigkeit</Form.ControlLabel>
                            <div className="flex items-center space-x-3 mt-2">
                                <span className="text-sm">Jährlich</span>
                                <Switch
                                    checked={segment.withdrawalFrequency === "monthly"}
                                    onCheckedChange={(checked) => {
                                        updateSegment(segment.id, {
                                            withdrawalFrequency: checked ? "monthly" : "yearly"
                                        });
                                    }}
                                />
                                <span className="text-sm">Monatlich</span>
                            </div>
                            <Form.HelpText>
                                {segment.withdrawalFrequency === "yearly" 
                                    ? "Entnahme erfolgt einmal jährlich am Anfang des Jahres"
                                    : "Entnahme erfolgt monatlich - Portfolio hat mehr Zeit zu wachsen"
                                }
                            </Form.HelpText>
                        </Form.Group>

                        {/* Variable percentage settings */}
                        {segment.strategy === "variabel_prozent" && (
                            <Form.Group>
                                <Form.ControlLabel>Entnahme-Prozentsatz (%)</Form.ControlLabel>
                                <div className="space-y-2">
                                    <Slider
                                        value={[(segment.customPercentage || 0.05) * 100]}
                                        min={2}
                                        max={7}
                                        step={0.5}
                                        onValueChange={(value) => updateSegment(segment.id, { customPercentage: value[0] / 100 })}
                                        className="mt-2"
                                    />
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>2%</span>
                                        <span className="font-medium text-gray-900">{((segment.customPercentage || 0.05) * 100).toFixed(1)}%</span>
                                        <span>7%</span>
                                    </div>
                                </div>
                            </Form.Group>
                        )}

                        {/* Monthly withdrawal settings */}
                        {segment.strategy === "monatlich_fest" && (
                            <>
                                <Form.Group>
                                    <Form.ControlLabel>Monatlicher Betrag (€)</Form.ControlLabel>
                                    <InputNumber
                                        value={segment.monthlyConfig?.monthlyAmount || 2000}
                                        onChange={(value: any) => updateSegment(segment.id, {
                                            monthlyConfig: {
                                                ...segment.monthlyConfig,
                                                monthlyAmount: Number(value) || 2000
                                            }
                                        })}
                                        min={100}
                                        max={50000}
                                        step={100}
                                    />
                                </Form.Group>
                                
                                <Form.Group>
                                    <Form.ControlLabel>Dynamische Anpassung (Guardrails)</Form.ControlLabel>
                                    <Toggle
                                        checked={segment.monthlyConfig?.enableGuardrails || false}
                                        onChange={(checked: boolean) => updateSegment(segment.id, {
                                            monthlyConfig: {
                                                ...segment.monthlyConfig,
                                                monthlyAmount: segment.monthlyConfig?.monthlyAmount || 2000,
                                                enableGuardrails: checked
                                            }
                                        })}
                                    />
                                </Form.Group>

                                {segment.monthlyConfig?.enableGuardrails && (
                                    <Form.Group>
                                        <Form.ControlLabel>Anpassungsschwelle (%)</Form.ControlLabel>
                                        <div className="space-y-2">
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
                                                className="mt-2"
                                            />
                                            <div className="flex justify-between text-sm text-gray-500">
                                                <span>5%</span>
                                                <span className="font-medium text-gray-900">{((segment.monthlyConfig?.guardrailsThreshold || 0.10) * 100).toFixed(0)}%</span>
                                                <span>20%</span>
                                            </div>
                                        </div>
                                    </Form.Group>
                                )}
                            </>
                        )}

                        {/* Dynamic strategy settings */}
                        {segment.strategy === "dynamisch" && (
                            <DynamicWithdrawalConfiguration
                                values={{
                                    baseWithdrawalRate: segment.dynamicConfig?.baseWithdrawalRate || 0.04,
                                    upperThresholdReturn: segment.dynamicConfig?.upperThresholdReturn || 0.08,
                                    upperThresholdAdjustment: segment.dynamicConfig?.upperThresholdAdjustment || 0.05,
                                    lowerThresholdReturn: segment.dynamicConfig?.lowerThresholdReturn || 0.02,
                                    lowerThresholdAdjustment: segment.dynamicConfig?.lowerThresholdAdjustment || -0.05,
                                }}
                                onChange={{
                                    onBaseWithdrawalRateChange: (value) => updateSegment(segment.id, {
                                        dynamicConfig: {
                                            ...segment.dynamicConfig,
                                            baseWithdrawalRate: value,
                                            upperThresholdReturn: segment.dynamicConfig?.upperThresholdReturn || 0.08,
                                            upperThresholdAdjustment: segment.dynamicConfig?.upperThresholdAdjustment || 0.05,
                                            lowerThresholdReturn: segment.dynamicConfig?.lowerThresholdReturn || 0.02,
                                            lowerThresholdAdjustment: segment.dynamicConfig?.lowerThresholdAdjustment || -0.05,
                                        }
                                    }),
                                    onUpperThresholdReturnChange: (value) => updateSegment(segment.id, {
                                        dynamicConfig: {
                                            ...segment.dynamicConfig,
                                            baseWithdrawalRate: segment.dynamicConfig?.baseWithdrawalRate || 0.04,
                                            upperThresholdReturn: value,
                                            upperThresholdAdjustment: segment.dynamicConfig?.upperThresholdAdjustment || 0.05,
                                            lowerThresholdReturn: segment.dynamicConfig?.lowerThresholdReturn || 0.02,
                                            lowerThresholdAdjustment: segment.dynamicConfig?.lowerThresholdAdjustment || -0.05,
                                        }
                                    }),
                                    onUpperThresholdAdjustmentChange: (value) => updateSegment(segment.id, {
                                        dynamicConfig: {
                                            ...segment.dynamicConfig,
                                            baseWithdrawalRate: segment.dynamicConfig?.baseWithdrawalRate || 0.04,
                                            upperThresholdReturn: segment.dynamicConfig?.upperThresholdReturn || 0.08,
                                            upperThresholdAdjustment: value,
                                            lowerThresholdReturn: segment.dynamicConfig?.lowerThresholdReturn || 0.02,
                                            lowerThresholdAdjustment: segment.dynamicConfig?.lowerThresholdAdjustment || -0.05,
                                        }
                                    }),
                                    onLowerThresholdReturnChange: (value) => updateSegment(segment.id, {
                                        dynamicConfig: {
                                            ...segment.dynamicConfig,
                                            baseWithdrawalRate: segment.dynamicConfig?.baseWithdrawalRate || 0.04,
                                            upperThresholdReturn: segment.dynamicConfig?.upperThresholdReturn || 0.08,
                                            upperThresholdAdjustment: segment.dynamicConfig?.upperThresholdAdjustment || 0.05,
                                            lowerThresholdReturn: value,
                                            lowerThresholdAdjustment: segment.dynamicConfig?.lowerThresholdAdjustment || -0.05,
                                        }
                                    }),
                                    onLowerThresholdAdjustmentChange: (value) => updateSegment(segment.id, {
                                        dynamicConfig: {
                                            ...segment.dynamicConfig,
                                            baseWithdrawalRate: segment.dynamicConfig?.baseWithdrawalRate || 0.04,
                                            upperThresholdReturn: segment.dynamicConfig?.upperThresholdReturn || 0.08,
                                            upperThresholdAdjustment: segment.dynamicConfig?.upperThresholdAdjustment || 0.05,
                                            lowerThresholdReturn: segment.dynamicConfig?.lowerThresholdReturn || 0.02,
                                            lowerThresholdAdjustment: value,
                                        }
                                    }),
                                }}
                            />
                        )}

                        <Separator />

                        {/* Return configuration */}
                        <Form.Group>
                            <Form.ControlLabel>Rendite-Modus</Form.ControlLabel>
                            <RadioTileGroup
                                value={getReturnModeFromConfig(segment.returnConfig)}
                                onValueChange={(value: any) => {
                                    const newReturnConfig = getReturnConfigFromMode(value as WithdrawalReturnMode, segment);
                                    updateSegment(segment.id, { returnConfig: newReturnConfig });
                                }}
                            >
                                <RadioTile value="fixed" label="Feste Rendite">
                                    Konstante jährliche Rendite für diese Phase
                                </RadioTile>
                                <RadioTile value="random" label="Zufällige Rendite">
                                    Monte Carlo Simulation mit Volatilität
                                </RadioTile>
                                <RadioTile value="variable" label="Variable Rendite">
                                    Jahr-für-Jahr konfigurierbare Renditen
                                </RadioTile>
                            </RadioTileGroup>
                        </Form.Group>

                        {/* Fixed return settings */}
                        {segment.returnConfig.mode === 'fixed' && (
                            <Form.Group>
                                <Form.ControlLabel>Erwartete Rendite (%)</Form.ControlLabel>
                                <div className="space-y-2">
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
                                        className="mt-2"
                                    />
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>0%</span>
                                        <span className="font-medium text-gray-900">{((segment.returnConfig.fixedRate || 0.05) * 100).toFixed(1)}%</span>
                                        <span>10%</span>
                                    </div>
                                </div>
                            </Form.Group>
                        )}

                        <Separator />

                        {/* Inflation settings */}
                        <Form.Group>
                            <Form.ControlLabel>Inflation berücksichtigen</Form.ControlLabel>
                            <Toggle
                                checked={segment.inflationConfig !== undefined}
                                onChange={(checked: boolean) => updateSegment(segment.id, {
                                    inflationConfig: checked ? { inflationRate: 0.02 } : undefined
                                })}
                            />
                        </Form.Group>

                        {segment.inflationConfig && (
                            <Form.Group>
                                <Form.ControlLabel>Inflationsrate (%)</Form.ControlLabel>
                                <div className="space-y-2">
                                    <Slider
                                        value={[(segment.inflationConfig.inflationRate || 0.02) * 100]}
                                        min={0}
                                        max={5}
                                        step={0.1}
                                        onValueChange={(value) => updateSegment(segment.id, {
                                            inflationConfig: { inflationRate: value[0] / 100 }
                                        })}
                                        className="mt-2"
                                    />
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>0%</span>
                                        <span className="font-medium text-gray-900">{((segment.inflationConfig.inflationRate || 0.02) * 100).toFixed(1)}%</span>
                                        <span>5%</span>
                                    </div>
                                </div>
                            </Form.Group>
                        )}

                        {/* Grundfreibetrag settings */}
                        <Form.Group>
                            <Form.ControlLabel>Grundfreibetrag berücksichtigen</Form.ControlLabel>
                            <Switch
                                checked={segment.enableGrundfreibetrag || false}
                                onCheckedChange={(checked: boolean) => updateSegment(segment.id, { enableGrundfreibetrag: checked })}
                            />
                        </Form.Group>

                        {segment.enableGrundfreibetrag && (
                            <>
                                <Form.Group>
                                    <Form.ControlLabel>Grundfreibetrag pro Jahr (€)</Form.ControlLabel>
                                    <InputNumber
                                        value={(() => {
                                            // Get the first year's value or default to 10908
                                            if (segment.grundfreibetragPerYear && segment.startYear in segment.grundfreibetragPerYear) {
                                                return segment.grundfreibetragPerYear[segment.startYear];
                                            }
                                            return 10908; // Default German basic allowance for 2023
                                        })()}
                                        onChange={(value: any) => {
                                            const grundfreibetragPerYear: {[year: number]: number} = {};
                                            for (let year = segment.startYear; year <= segment.endYear; year++) {
                                                grundfreibetragPerYear[year] = Number(value) || 10908;
                                            }
                                            updateSegment(segment.id, { grundfreibetragPerYear });
                                        }}
                                        min={0}
                                        max={30000}
                                        step={100}
                                    />
                                    <Form.HelpText>
                                        Grundfreibetrag für die Einkommensteuer (2023: 10.908 €)
                                    </Form.HelpText>
                                </Form.Group>
                                
                                <Form.Group>
                                    <Form.ControlLabel>Einkommensteuersatz (%)</Form.ControlLabel>
                                    <div className="space-y-2">
                                        <Slider
                                            value={[(segment.incomeTaxRate || 0.18) * 100]}
                                            min={14}
                                            max={42}
                                            step={1}
                                            onValueChange={(value) => updateSegment(segment.id, { incomeTaxRate: value[0] / 100 })}
                                            className="mt-2"
                                        />
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>14%</span>
                                            <span className="font-medium text-gray-900">{((segment.incomeTaxRate || 0.18) * 100).toFixed(0)}%</span>
                                            <span>42%</span>
                                        </div>
                                    </div>
                                </Form.Group>
                            </>
                        )}

                        <Separator />

                        {/* Tax reduction setting */}
                        <Form.Group>
                            <Form.ControlLabel>Steuer reduziert Endkapital</Form.ControlLabel>
                            <div className="flex items-center space-x-3 mt-2">
                                <Switch
                                    checked={segment.steuerReduzierenEndkapital ?? true}
                                    onCheckedChange={(checked) => {
                                        updateSegment(segment.id, {
                                            steuerReduzierenEndkapital: checked
                                        });
                                    }}
                                />
                                <span className="text-sm">
                                    {(segment.steuerReduzierenEndkapital ?? true) 
                                        ? "Steuern werden vom Kapital abgezogen" 
                                        : "Steuern werden separat bezahlt"
                                    }
                                </span>
                            </div>
                            <Form.HelpText>
                                Bestimmt, ob Vorabpauschale-Steuern das Endkapital dieser Phase reduzieren oder über ein separates Verrechnungskonto bezahlt werden.
                            </Form.HelpText>
                        </Form.Group>
                    </Form>
                        </CardContent>
                    </Card>
            ))}
            </CardContent>
        </Card>
    );
}