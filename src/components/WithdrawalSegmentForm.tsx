import { useState } from "react";
import {
    Form,
    Input,
    InputNumber,
    Panel,
    Button,
    Radio,
    RadioGroup,
    RadioTile,
    RadioTileGroup,
    Slider,
    Toggle,
    IconButton,
    Divider
} from "rsuite";
import PlusIcon from '@rsuite/icons/Plus';
import TrashIcon from '@rsuite/icons/Trash';
import 'rsuite/dist/rsuite.min.css';
import type { 
    WithdrawalSegment
} from "../utils/segmented-withdrawal";
import { validateWithdrawalSegments, createDefaultWithdrawalSegment } from "../utils/segmented-withdrawal";
import type { WithdrawalStrategy } from "../../helpers/withdrawal";
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
        <Panel header="Entnahme-Phasen konfigurieren" bordered collapsible>
            <div style={{ marginBottom: '20px' }}>
                <p>
                    Teile die Entnahme-Phase in verschiedene Zeiträume mit unterschiedlichen Strategien auf.
                    Dies ermöglicht es, verschiedene Ansätze für Früh-, Mittel- und Spätrente zu kombinieren.
                </p>
                
                {errors.length > 0 && (
                    <div style={{ color: 'red', marginBottom: '10px' }}>
                        <strong>Fehler:</strong>
                        <ul>
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}
                
                <Button appearance="primary" onClick={addSegment} startIcon={<PlusIcon />}>
                    Phase hinzufügen
                </Button>
            </div>

            {segments.map((segment, _index) => (
                <Panel 
                    key={segment.id} 
                    header={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{segment.name} ({segment.startYear} - {segment.endYear})</span>
                            {segments.length > 1 && (
                                <IconButton 
                                    icon={<TrashIcon />} 
                                    size="sm" 
                                    color="red" 
                                    appearance="subtle"
                                    onClick={() => removeSegment(segment.id)}
                                />
                            )}
                        </div>
                    }
                    bordered
                    collapsible
                    style={{ marginBottom: '15px' }}
                >
                    <Form fluid>
                        {/* Basic segment configuration - Mobile responsive layout */}
                        <div className="form-grid">
                            <Form.Group>
                                <Form.ControlLabel>Name der Phase</Form.ControlLabel>
                                <Input
                                    value={segment.name}
                                    onChange={(value) => updateSegment(segment.id, { name: value })}
                                    placeholder="z.B. Frühe Rente"
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel>Startjahr</Form.ControlLabel>
                                <InputNumber
                                    value={segment.startYear}
                                    onChange={(value) => updateSegment(segment.id, { startYear: Number(value) || withdrawalStartYear })}
                                    min={withdrawalStartYear}
                                    max={withdrawalEndYear}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.ControlLabel>Endjahr</Form.ControlLabel>
                                <InputNumber
                                    value={segment.endYear}
                                    onChange={(value) => updateSegment(segment.id, { endYear: Number(value) || withdrawalEndYear })}
                                    min={withdrawalStartYear}
                                    max={withdrawalEndYear}
                                />
                            </Form.Group>
                        </div>

                        <Divider />

                        {/* Withdrawal strategy */}
                        <Form.Group>
                            <Form.ControlLabel>Entnahme-Strategie</Form.ControlLabel>
                            <RadioTileGroup 
                                value={segment.strategy}
                                onChange={(value) => {
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

                        {/* Variable percentage settings */}
                        {segment.strategy === "variabel_prozent" && (
                            <Form.Group>
                                <Form.ControlLabel>Entnahme-Prozentsatz (%)</Form.ControlLabel>
                                <Slider
                                    value={(segment.customPercentage || 0.05) * 100}
                                    min={2}
                                    max={7}
                                    step={0.5}
                                    onChange={(value) => updateSegment(segment.id, { customPercentage: value / 100 })}
                                    handleTitle={(<div style={{marginTop: '-17px'}}>{((segment.customPercentage || 0.05) * 100).toFixed(1)}%</div>)}
                                    progress
                                    graduated
                                />
                            </Form.Group>
                        )}

                        {/* Monthly withdrawal settings */}
                        {segment.strategy === "monatlich_fest" && (
                            <>
                                <Form.Group>
                                    <Form.ControlLabel>Monatlicher Betrag (€)</Form.ControlLabel>
                                    <InputNumber
                                        value={segment.monthlyConfig?.monthlyAmount || 2000}
                                        onChange={(value) => updateSegment(segment.id, {
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
                                        onChange={(checked) => updateSegment(segment.id, {
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
                                        <Slider
                                            value={(segment.monthlyConfig?.guardrailsThreshold || 0.10) * 100}
                                            min={5}
                                            max={20}
                                            step={1}
                                            onChange={(value) => updateSegment(segment.id, {
                                                monthlyConfig: {
                                                    ...segment.monthlyConfig,
                                                    monthlyAmount: segment.monthlyConfig?.monthlyAmount || 2000,
                                                    guardrailsThreshold: value / 100
                                                }
                                            })}
                                            handleTitle={(<div style={{marginTop: '-17px'}}>{((segment.monthlyConfig?.guardrailsThreshold || 0.10) * 100).toFixed(0)}%</div>)}
                                            progress
                                            graduated
                                        />
                                    </Form.Group>
                                )}
                            </>
                        )}

                        {/* Dynamic strategy settings */}
                        {segment.strategy === "dynamisch" && (
                            <>
                                <Form.Group>
                                    <Form.ControlLabel>Basis-Entnahmerate (%)</Form.ControlLabel>
                                    <Slider
                                        value={(segment.dynamicConfig?.baseWithdrawalRate || 0.04) * 100}
                                        min={2}
                                        max={7}
                                        step={0.5}
                                        onChange={(value) => updateSegment(segment.id, {
                                            dynamicConfig: {
                                                ...segment.dynamicConfig,
                                                baseWithdrawalRate: value / 100,
                                                upperThresholdReturn: segment.dynamicConfig?.upperThresholdReturn || 0.08,
                                                upperThresholdAdjustment: segment.dynamicConfig?.upperThresholdAdjustment || 0.05,
                                                lowerThresholdReturn: segment.dynamicConfig?.lowerThresholdReturn || 0.02,
                                                lowerThresholdAdjustment: segment.dynamicConfig?.lowerThresholdAdjustment || -0.05,
                                            }
                                        })}
                                        handleTitle={(<div style={{marginTop: '-17px'}}>{((segment.dynamicConfig?.baseWithdrawalRate || 0.04) * 100).toFixed(1)}%</div>)}
                                        progress
                                        graduated
                                    />
                                    <Form.HelpText>
                                        Grundlegende jährliche Entnahmerate vor dynamischen Anpassungen
                                    </Form.HelpText>
                                </Form.Group>
                                
                                <Form.Group>
                                    <Form.ControlLabel>Obere Schwelle Rendite (%)</Form.ControlLabel>
                                    <Slider
                                        value={(segment.dynamicConfig?.upperThresholdReturn || 0.08) * 100}
                                        min={4}
                                        max={15}
                                        step={0.5}
                                        onChange={(value) => updateSegment(segment.id, {
                                            dynamicConfig: {
                                                ...segment.dynamicConfig,
                                                baseWithdrawalRate: segment.dynamicConfig?.baseWithdrawalRate || 0.04,
                                                upperThresholdReturn: value / 100,
                                                upperThresholdAdjustment: segment.dynamicConfig?.upperThresholdAdjustment || 0.05,
                                                lowerThresholdReturn: segment.dynamicConfig?.lowerThresholdReturn || 0.02,
                                                lowerThresholdAdjustment: segment.dynamicConfig?.lowerThresholdAdjustment || -0.05,
                                            }
                                        })}
                                        handleTitle={(<div style={{marginTop: '-17px'}}>{((segment.dynamicConfig?.upperThresholdReturn || 0.08) * 100).toFixed(1)}%</div>)}
                                        progress
                                        graduated
                                    />
                                    <Form.HelpText>
                                        Rendite-Schwelle: Bei Überschreitung wird die Entnahme erhöht
                                    </Form.HelpText>
                                </Form.Group>
                                
                                <Form.Group>
                                    <Form.ControlLabel>Anpassung bei oberer Schwelle (%)</Form.ControlLabel>
                                    <Slider
                                        value={(segment.dynamicConfig?.upperThresholdAdjustment || 0.05) * 100}
                                        min={0}
                                        max={15}
                                        step={1}
                                        onChange={(value) => updateSegment(segment.id, {
                                            dynamicConfig: {
                                                ...segment.dynamicConfig,
                                                baseWithdrawalRate: segment.dynamicConfig?.baseWithdrawalRate || 0.04,
                                                upperThresholdReturn: segment.dynamicConfig?.upperThresholdReturn || 0.08,
                                                upperThresholdAdjustment: value / 100,
                                                lowerThresholdReturn: segment.dynamicConfig?.lowerThresholdReturn || 0.02,
                                                lowerThresholdAdjustment: segment.dynamicConfig?.lowerThresholdAdjustment || -0.05,
                                            }
                                        })}
                                        handleTitle={(<div style={{marginTop: '-17px'}}>{((segment.dynamicConfig?.upperThresholdAdjustment || 0.05) * 100) > 0 ? '+' : ''}{((segment.dynamicConfig?.upperThresholdAdjustment || 0.05) * 100).toFixed(0)}%</div>)}
                                        progress
                                        graduated
                                    />
                                    <Form.HelpText>
                                        Relative Erhöhung der Entnahme bei guter Performance
                                    </Form.HelpText>
                                </Form.Group>
                                
                                <Form.Group>
                                    <Form.ControlLabel>Untere Schwelle Rendite (%)</Form.ControlLabel>
                                    <Slider
                                        value={(segment.dynamicConfig?.lowerThresholdReturn || 0.02) * 100}
                                        min={-5}
                                        max={6}
                                        step={0.5}
                                        onChange={(value) => updateSegment(segment.id, {
                                            dynamicConfig: {
                                                ...segment.dynamicConfig,
                                                baseWithdrawalRate: segment.dynamicConfig?.baseWithdrawalRate || 0.04,
                                                upperThresholdReturn: segment.dynamicConfig?.upperThresholdReturn || 0.08,
                                                upperThresholdAdjustment: segment.dynamicConfig?.upperThresholdAdjustment || 0.05,
                                                lowerThresholdReturn: value / 100,
                                                lowerThresholdAdjustment: segment.dynamicConfig?.lowerThresholdAdjustment || -0.05,
                                            }
                                        })}
                                        handleTitle={(<div style={{marginTop: '-17px'}}>{((segment.dynamicConfig?.lowerThresholdReturn || 0.02) * 100).toFixed(1)}%</div>)}
                                        progress
                                        graduated
                                    />
                                    <Form.HelpText>
                                        Rendite-Schwelle: Bei Unterschreitung wird die Entnahme reduziert
                                    </Form.HelpText>
                                </Form.Group>
                                
                                <Form.Group>
                                    <Form.ControlLabel>Anpassung bei unterer Schwelle (%)</Form.ControlLabel>
                                    <Slider
                                        value={(segment.dynamicConfig?.lowerThresholdAdjustment || -0.05) * 100}
                                        min={-15}
                                        max={0}
                                        step={1}
                                        onChange={(value) => updateSegment(segment.id, {
                                            dynamicConfig: {
                                                ...segment.dynamicConfig,
                                                baseWithdrawalRate: segment.dynamicConfig?.baseWithdrawalRate || 0.04,
                                                upperThresholdReturn: segment.dynamicConfig?.upperThresholdReturn || 0.08,
                                                upperThresholdAdjustment: segment.dynamicConfig?.upperThresholdAdjustment || 0.05,
                                                lowerThresholdReturn: segment.dynamicConfig?.lowerThresholdReturn || 0.02,
                                                lowerThresholdAdjustment: value / 100,
                                            }
                                        })}
                                        handleTitle={(<div style={{marginTop: '-17px'}}>{((segment.dynamicConfig?.lowerThresholdAdjustment || -0.05) * 100).toFixed(0)}%</div>)}
                                        progress
                                        graduated
                                    />
                                    <Form.HelpText>
                                        Relative Reduzierung der Entnahme bei schlechter Performance
                                    </Form.HelpText>
                                </Form.Group>
                            </>
                        )}

                        <Divider />

                        {/* Return configuration */}
                        <Form.Group>
                            <Form.ControlLabel>Rendite-Modus</Form.ControlLabel>
                            <RadioGroup
                                inline
                                value={getReturnModeFromConfig(segment.returnConfig)}
                                onChange={(value) => {
                                    const newReturnConfig = getReturnConfigFromMode(value as WithdrawalReturnMode, segment);
                                    updateSegment(segment.id, { returnConfig: newReturnConfig });
                                }}
                            >
                                <Radio value="fixed">Feste Rendite</Radio>
                                <Radio value="random">Zufällige Rendite</Radio>
                                <Radio value="variable">Variable Rendite</Radio>
                            </RadioGroup>
                        </Form.Group>

                        {/* Fixed return settings */}
                        {segment.returnConfig.mode === 'fixed' && (
                            <Form.Group>
                                <Form.ControlLabel>Erwartete Rendite (%)</Form.ControlLabel>
                                <Slider
                                    value={(segment.returnConfig.fixedRate || 0.05) * 100}
                                    min={0}
                                    max={10}
                                    step={0.5}
                                    onChange={(value) => updateSegment(segment.id, {
                                        returnConfig: {
                                            mode: 'fixed',
                                            fixedRate: value / 100
                                        }
                                    })}
                                    handleTitle={(<div style={{marginTop: '-17px'}}>{((segment.returnConfig.fixedRate || 0.05) * 100).toFixed(1)}%</div>)}
                                    progress
                                    graduated
                                />
                            </Form.Group>
                        )}

                        <Divider />

                        {/* Inflation settings */}
                        <Form.Group>
                            <Form.ControlLabel>Inflation berücksichtigen</Form.ControlLabel>
                            <Toggle
                                checked={segment.inflationConfig !== undefined}
                                onChange={(checked) => updateSegment(segment.id, {
                                    inflationConfig: checked ? { inflationRate: 0.02 } : undefined
                                })}
                            />
                        </Form.Group>

                        {segment.inflationConfig && (
                            <Form.Group>
                                <Form.ControlLabel>Inflationsrate (%)</Form.ControlLabel>
                                <Slider
                                    value={(segment.inflationConfig.inflationRate || 0.02) * 100}
                                    min={0}
                                    max={5}
                                    step={0.1}
                                    onChange={(value) => updateSegment(segment.id, {
                                        inflationConfig: { inflationRate: value / 100 }
                                    })}
                                    handleTitle={(<div style={{marginTop: '-17px'}}>{((segment.inflationConfig.inflationRate || 0.02) * 100).toFixed(1)}%</div>)}
                                    progress
                                    graduated
                                />
                            </Form.Group>
                        )}

                        {/* Grundfreibetrag settings */}
                        <Form.Group>
                            <Form.ControlLabel>Grundfreibetrag berücksichtigen</Form.ControlLabel>
                            <Toggle
                                checked={segment.enableGrundfreibetrag || false}
                                onChange={(checked) => updateSegment(segment.id, { enableGrundfreibetrag: checked })}
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
                                        onChange={(value) => {
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
                                    <Slider
                                        value={(segment.incomeTaxRate || 0.25) * 100}
                                        min={14}
                                        max={42}
                                        step={1}
                                        onChange={(value) => updateSegment(segment.id, { incomeTaxRate: value / 100 })}
                                        handleTitle={(<div style={{marginTop: '-17px'}}>{((segment.incomeTaxRate || 0.25) * 100).toFixed(0)}%</div>)}
                                        progress
                                        graduated
                                    />
                                </Form.Group>
                            </>
                        )}
                    </Form>
                </Panel>
            ))}
        </Panel>
    );
}