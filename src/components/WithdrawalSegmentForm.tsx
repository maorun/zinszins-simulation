import React, { useState } from 'react'
import { Input } from './ui/input'
import { Slider } from './ui/slider'
import { Switch } from './ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Button } from './ui/button'
import { RadioTileGroup, RadioTile } from './ui/radio-tile'
import { Separator } from './ui/separator'
import { Label } from './ui/label'
import { Plus, Trash2, ChevronDown, MoveUp, MoveDown } from 'lucide-react'

// Helper function for number input handling with number onChange
const handleNumberInputChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  onChange: (value: number | undefined) => void,
) => {
  const value = e.target.value
  onChange(value ? Math.round(Number(value)) : undefined)
}

// No more temporary components needed!
import type {
  WithdrawalSegment,
} from '../utils/segmented-withdrawal'
import { validateWithdrawalSegments, createDefaultWithdrawalSegment } from '../utils/segmented-withdrawal'
import type { WithdrawalStrategy } from '../../helpers/withdrawal'
import type { ReturnConfiguration } from '../../helpers/random-returns'
import { DynamicWithdrawalConfiguration } from './DynamicWithdrawalConfiguration'
import { BucketStrategyConfiguration } from './BucketStrategyConfiguration'
import { RMDWithdrawalConfiguration } from './RMDWithdrawalConfiguration'

export type WithdrawalReturnMode = 'fixed' | 'random' | 'variable'

interface WithdrawalSegmentFormProps {
  segments: WithdrawalSegment[]
  onSegmentsChange: (segments: WithdrawalSegment[]) => void
  withdrawalStartYear: number
  withdrawalEndYear: number
}

export function WithdrawalSegmentForm({
  segments,
  onSegmentsChange,
  withdrawalStartYear,
  withdrawalEndYear,
}: WithdrawalSegmentFormProps) {
  const [errors, setErrors] = useState<string[]>([])

  // Check if more segments can be added
  const canAddMoreSegments = () => {
    // Allow adding segments as long as the last segment doesn't extend indefinitely
    // Remove the constraint of requiring segments to end at globalEndOfLife
    // Users can create segments with any end year they choose
    return true
  }

  // Validate segments whenever they change
  const validateAndUpdateSegments = (newSegments: WithdrawalSegment[]) => {
    const validationErrors = validateWithdrawalSegments(newSegments, withdrawalStartYear, withdrawalEndYear)
    setErrors(validationErrors)
    onSegmentsChange(newSegments)
  }

  // Add a new segment - allow flexible positioning
  const addSegment = () => {
    const newId = `segment_${Date.now()}`

    // Default to starting one year before the withdrawal start year if no segments exist
    // This allows users to create phases before the end of the savings phase
    let startYear: number
    let endYear: number

    if (segments.length === 0) {
      // For the first segment, start one year before the withdrawal start year by default
      startYear = Math.round(withdrawalStartYear) - 1
      endYear = startYear + 4 // Default 5-year segment
    }
    else {
      // For additional segments, try to position after the last segment
      const sortedSegments = [...segments].sort((a, b) => a.startYear - b.startYear)
      const lastSegment = sortedSegments[sortedSegments.length - 1]
      startYear = Math.round(lastSegment.endYear) + 1
      endYear = startYear + 4 // Default 5-year segment
    }

    const newSegment = createDefaultWithdrawalSegment(newId, `Phase ${segments.length + 1}`, startYear, endYear)

    validateAndUpdateSegments([...segments, newSegment])
  }

  // Remove a segment
  const removeSegment = (segmentId: string) => {
    const newSegments = segments.filter(s => s.id !== segmentId)
    validateAndUpdateSegments(newSegments)
  }

  // Update a specific segment
  const updateSegment = (segmentId: string, updates: Partial<WithdrawalSegment>) => {
    const newSegments = segments.map(segment =>
      segment.id === segmentId
        ? { ...segment, ...updates }
        : segment,
    )
    validateAndUpdateSegments(newSegments)
  }

  // Move a segment up in the list
  const moveSegmentUp = (segmentId: string) => {
    const currentIndex = segments.findIndex(s => s.id === segmentId)
    if (currentIndex > 0) {
      const newSegments = [...segments]
      const temp = newSegments[currentIndex]
      newSegments[currentIndex] = newSegments[currentIndex - 1]
      newSegments[currentIndex - 1] = temp
      validateAndUpdateSegments(newSegments)
    }
  }

  // Move a segment down in the list
  const moveSegmentDown = (segmentId: string) => {
    const currentIndex = segments.findIndex(s => s.id === segmentId)
    if (currentIndex < segments.length - 1) {
      const newSegments = [...segments]
      const temp = newSegments[currentIndex]
      newSegments[currentIndex] = newSegments[currentIndex + 1]
      newSegments[currentIndex + 1] = temp
      validateAndUpdateSegments(newSegments)
    }
  }

  // Convert return mode to return configuration
  const getReturnConfigFromMode = (mode: WithdrawalReturnMode, segment: WithdrawalSegment): ReturnConfiguration => {
    switch (mode) {
      case 'fixed':
        return {
          mode: 'fixed',
          fixedRate: (segment.returnConfig.mode === 'fixed' ? segment.returnConfig.fixedRate : 0.05) || 0.05,
        }
      case 'random':
        return {
          mode: 'random',
          randomConfig: {
            averageReturn: 0.05,
            standardDeviation: 0.12,
            seed: undefined,
          },
        }
      case 'variable':
        return {
          mode: 'variable',
          variableConfig: {
            yearlyReturns: {},
          },
        }
      default:
        return segment.returnConfig
    }
  }

  // Get return mode from return configuration
  const getReturnModeFromConfig = (returnConfig: ReturnConfiguration): WithdrawalReturnMode => {
    return returnConfig.mode as WithdrawalReturnMode
  }

  return (
    <Card>
      <Collapsible defaultOpen={false}>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
              <CardTitle className="text-left">Entnahme-Phasen konfigurieren</CardTitle>
              <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <div className="mb-5">
              <p className="mb-4">
                Teile die Entnahme-Phase in verschiedene Zeiträume mit unterschiedlichen Strategien auf.
                Phasen können flexibel positioniert werden - sie müssen nicht am Ende der Sparphase beginnen
                und können Lücken zwischen ihnen haben. Verwende die Pfeil-Buttons, um die Reihenfolge zu ändern.
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

            {segments.map((segment, index) => (
              <Card
                key={segment.id}
                className="mb-4"
              >
                <Collapsible defaultOpen={false}>
                  <CardHeader>
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
                        <CardTitle className="text-lg text-left">
                          {segment.name}
                          {' '}
                          (
                          {segment.startYear}
                          {' '}
                          -
                          {' '}
                          {segment.endYear}
                          )
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                moveSegmentUp(segment.id)
                              }}
                              disabled={index === 0}
                              className="text-gray-500 hover:text-gray-700"
                              title="Phase nach oben verschieben"
                            >
                              <MoveUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                moveSegmentDown(segment.id)
                              }}
                              disabled={index === segments.length - 1}
                              className="text-gray-500 hover:text-gray-700"
                              title="Phase nach unten verschieben"
                            >
                              <MoveDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                          {segments.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeSegment(segment.id)
                              }}
                              className="text-destructive hover:text-destructive ml-2"
                              title="Phase löschen"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent>
                      {/* Basic segment configuration - Mobile responsive layout */}
                      <div className="form-grid">
                        <div className="mb-4 space-y-2">
                          <Label>Name der Phase</Label>
                          <Input
                            value={segment.name}
                            onChange={e => updateSegment(segment.id, { name: e.target.value })}
                            placeholder="z.B. Frühe Rente"
                          />
                        </div>
                        <div className="mb-4 space-y-2">
                          <Label>Startjahr</Label>
                          <Input
                            type="number"
                            value={segment.startYear}
                            onChange={e => handleNumberInputChange(e, value =>
                              updateSegment(segment.id, { startYear: Number(value) || withdrawalStartYear }),
                            )}
                            min={2020}
                            max={2100}
                          />
                        </div>
                        <div className="mb-4 space-y-2">
                          <Label>Endjahr</Label>
                          <Input
                            type="number"
                            value={segment.endYear}
                            onChange={e => handleNumberInputChange(e, value =>
                              updateSegment(segment.id, { endYear: Number(value) || withdrawalEndYear }),
                            )}
                            min={2020}
                            max={2100}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Withdrawal strategy */}
                      <div className="mb-4 space-y-2">
                        <Label>Entnahme-Strategie</Label>
                        <RadioTileGroup
                          value={segment.strategy}
                          idPrefix={`segment-${segment.id}-strategy`}
                          onValueChange={(value: string) => {
                            const newStrategy = value as WithdrawalStrategy
                            const updates: Partial<WithdrawalSegment> = { strategy: newStrategy }

                            // Initialize monthlyConfig when switching to monatlich_fest strategy
                            if (newStrategy === 'monatlich_fest' && !segment.monthlyConfig) {
                              updates.monthlyConfig = {
                                monthlyAmount: 2000,
                                enableGuardrails: false,
                                guardrailsThreshold: 0.10,
                              }
                            }

                            // Initialize customPercentage when switching to variabel_prozent strategy
                            if (newStrategy === 'variabel_prozent' && segment.customPercentage === undefined) {
                              updates.customPercentage = 0.05 // 5% default
                            }

                            // Initialize dynamicConfig when switching to dynamisch strategy
                            if (newStrategy === 'dynamisch' && !segment.dynamicConfig) {
                              updates.dynamicConfig = {
                                baseWithdrawalRate: 0.04, // 4% base rate
                                upperThresholdReturn: 0.08, // 8% upper threshold
                                upperThresholdAdjustment: 0.05, // 5% increase when exceeding
                                lowerThresholdReturn: 0.02, // 2% lower threshold
                                lowerThresholdAdjustment: -0.05, // 5% decrease when below
                              }
                            }

                            // Initialize bucketConfig when switching to bucket_strategie strategy
                            if (newStrategy === 'bucket_strategie' && !segment.bucketConfig) {
                              updates.bucketConfig = {
                                initialCashCushion: 20000, // €20,000 default
                                refillThreshold: 5000, // €5,000 threshold
                                refillPercentage: 0.5, // 50% of excess gains
                                baseWithdrawalRate: 0.04, // 4% base withdrawal rate
                              }
                            }

                            // Initialize rmdConfig when switching to rmd strategy
                            if (newStrategy === 'rmd' && !segment.rmdConfig) {
                              updates.rmdConfig = {
                                startAge: 65, // Default retirement age
                                lifeExpectancyTable: 'german_2020_22', // German 2020-22 mortality table
                                customLifeExpectancy: undefined, // Use table by default
                              }
                            }

                            updateSegment(segment.id, updates)
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
                          <RadioTile value="bucket_strategie" label="Drei-Eimer-Strategie">
                            Cash-Polster bei negativen Renditen
                          </RadioTile>
                          <RadioTile value="rmd" label="RMD (Lebenserwartung)">
                            Entnahme basierend auf Alter und Lebenserwartung
                          </RadioTile>
                        </RadioTileGroup>
                      </div>

                      {/* Withdrawal frequency configuration */}
                      <div className="mb-4 space-y-2">
                        <Label>Entnahme-Häufigkeit</Label>
                        <div className="flex items-center space-x-3 mt-2">
                          <span className="text-sm">Jährlich</span>
                          <Switch
                            checked={segment.withdrawalFrequency === 'monthly'}
                            onCheckedChange={(checked) => {
                              updateSegment(segment.id, {
                                withdrawalFrequency: checked ? 'monthly' : 'yearly',
                              })
                            }}
                          />
                          <span className="text-sm">Monatlich</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {segment.withdrawalFrequency === 'yearly'
                            ? 'Entnahme erfolgt einmal jährlich am Anfang des Jahres'
                            : 'Entnahme erfolgt monatlich - Portfolio hat mehr Zeit zu wachsen'}
                        </div>
                      </div>

                      {/* Variable percentage settings */}
                      {segment.strategy === 'variabel_prozent' && (
                        <div className="mb-4 space-y-2">
                          <Label>Entnahme-Prozentsatz (%)</Label>
                          <div className="space-y-2">
                            <Slider
                              value={[(segment.customPercentage || 0.05) * 100]}
                              min={2}
                              max={7}
                              step={0.5}
                              onValueChange={value => updateSegment(segment.id, { customPercentage: value[0] / 100 })}
                              className="mt-2"
                            />
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>2%</span>
                              <span className="font-medium text-gray-900">
                                {((segment.customPercentage || 0.05) * 100).toFixed(1)}
                                %
                              </span>
                              <span>7%</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Monthly withdrawal settings */}
                      {segment.strategy === 'monatlich_fest' && (
                        <>
                          <div className="mb-4 space-y-2">
                            <Label>Monatlicher Betrag (€)</Label>
                            <Input
                              type="number"
                              value={segment.monthlyConfig?.monthlyAmount || 2000}
                              onChange={(e) => {
                                const value = e.target.value ? Number(e.target.value) : 2000
                                updateSegment(segment.id, {
                                  monthlyConfig: {
                                    ...segment.monthlyConfig,
                                    monthlyAmount: value,
                                  },
                                })
                              }}
                              min={100}
                              max={50000}
                              step={100}
                            />
                          </div>

                          <div className="mb-4 space-y-2">
                            <Label>Dynamische Anpassung (Guardrails)</Label>
                            <Switch
                              checked={segment.monthlyConfig?.enableGuardrails || false}
                              onCheckedChange={(checked: boolean) => updateSegment(segment.id, {
                                monthlyConfig: {
                                  ...segment.monthlyConfig,
                                  monthlyAmount: segment.monthlyConfig?.monthlyAmount || 2000,
                                  enableGuardrails: checked,
                                },
                              })}
                            />
                          </div>

                          {segment.monthlyConfig?.enableGuardrails && (
                            <div className="mb-4 space-y-2">
                              <Label>Anpassungsschwelle (%)</Label>
                              <div className="space-y-2">
                                <Slider
                                  value={[(segment.monthlyConfig?.guardrailsThreshold || 0.10) * 100]}
                                  min={5}
                                  max={20}
                                  step={1}
                                  onValueChange={value => updateSegment(segment.id, {
                                    monthlyConfig: {
                                      ...segment.monthlyConfig,
                                      monthlyAmount: segment.monthlyConfig?.monthlyAmount || 2000,
                                      guardrailsThreshold: value[0] / 100,
                                    },
                                  })}
                                  className="mt-2"
                                />
                                <div className="flex justify-between text-sm text-gray-500">
                                  <span>5%</span>
                                  <span className="font-medium text-gray-900">
                                    {((segment.monthlyConfig?.guardrailsThreshold || 0.10) * 100).toFixed(0)}
                                    %
                                  </span>
                                  <span>20%</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Dynamic strategy settings */}
                      {segment.strategy === 'dynamisch' && (
                        <DynamicWithdrawalConfiguration
                          values={{
                            baseWithdrawalRate: segment.dynamicConfig?.baseWithdrawalRate || 0.04,
                            upperThresholdReturn: segment.dynamicConfig?.upperThresholdReturn || 0.08,
                            upperThresholdAdjustment: segment.dynamicConfig?.upperThresholdAdjustment || 0.05,
                            lowerThresholdReturn: segment.dynamicConfig?.lowerThresholdReturn || 0.02,
                            lowerThresholdAdjustment: segment.dynamicConfig?.lowerThresholdAdjustment || -0.05,
                          }}
                          onChange={{
                            onBaseWithdrawalRateChange: value => updateSegment(segment.id, {
                              dynamicConfig: {
                                ...segment.dynamicConfig,
                                baseWithdrawalRate: value,
                                upperThresholdReturn: segment.dynamicConfig?.upperThresholdReturn || 0.08,
                                upperThresholdAdjustment: segment.dynamicConfig?.upperThresholdAdjustment || 0.05,
                                lowerThresholdReturn: segment.dynamicConfig?.lowerThresholdReturn || 0.02,
                                lowerThresholdAdjustment: segment.dynamicConfig?.lowerThresholdAdjustment || -0.05,
                              },
                            }),
                            onUpperThresholdReturnChange: value => updateSegment(segment.id, {
                              dynamicConfig: {
                                ...segment.dynamicConfig,
                                baseWithdrawalRate: segment.dynamicConfig?.baseWithdrawalRate || 0.04,
                                upperThresholdReturn: value,
                                upperThresholdAdjustment: segment.dynamicConfig?.upperThresholdAdjustment || 0.05,
                                lowerThresholdReturn: segment.dynamicConfig?.lowerThresholdReturn || 0.02,
                                lowerThresholdAdjustment: segment.dynamicConfig?.lowerThresholdAdjustment || -0.05,
                              },
                            }),
                            onUpperThresholdAdjustmentChange: value => updateSegment(segment.id, {
                              dynamicConfig: {
                                ...segment.dynamicConfig,
                                baseWithdrawalRate: segment.dynamicConfig?.baseWithdrawalRate || 0.04,
                                upperThresholdReturn: segment.dynamicConfig?.upperThresholdReturn || 0.08,
                                upperThresholdAdjustment: value,
                                lowerThresholdReturn: segment.dynamicConfig?.lowerThresholdReturn || 0.02,
                                lowerThresholdAdjustment: segment.dynamicConfig?.lowerThresholdAdjustment || -0.05,
                              },
                            }),
                            onLowerThresholdReturnChange: value => updateSegment(segment.id, {
                              dynamicConfig: {
                                ...segment.dynamicConfig,
                                baseWithdrawalRate: segment.dynamicConfig?.baseWithdrawalRate || 0.04,
                                upperThresholdReturn: segment.dynamicConfig?.upperThresholdReturn || 0.08,
                                upperThresholdAdjustment: segment.dynamicConfig?.upperThresholdAdjustment || 0.05,
                                lowerThresholdReturn: value,
                                lowerThresholdAdjustment: segment.dynamicConfig?.lowerThresholdAdjustment || -0.05,
                              },
                            }),
                            onLowerThresholdAdjustmentChange: value => updateSegment(segment.id, {
                              dynamicConfig: {
                                ...segment.dynamicConfig,
                                baseWithdrawalRate: segment.dynamicConfig?.baseWithdrawalRate || 0.04,
                                upperThresholdReturn: segment.dynamicConfig?.upperThresholdReturn || 0.08,
                                upperThresholdAdjustment: segment.dynamicConfig?.upperThresholdAdjustment || 0.05,
                                lowerThresholdReturn: segment.dynamicConfig?.lowerThresholdReturn || 0.02,
                                lowerThresholdAdjustment: value,
                              },
                            }),
                          }}
                        />
                      )}

                      {/* Bucket strategy settings */}
                      {segment.strategy === 'bucket_strategie' && (
                        <BucketStrategyConfiguration
                          values={{
                            initialCashCushion: segment.bucketConfig?.initialCashCushion || 20000,
                            refillThreshold: segment.bucketConfig?.refillThreshold || 5000,
                            refillPercentage: segment.bucketConfig?.refillPercentage || 0.5,
                            baseWithdrawalRate: segment.bucketConfig?.baseWithdrawalRate || 0.04,
                            subStrategy: segment.bucketConfig?.subStrategy || '4prozent',
                            variabelProzent: segment.bucketConfig?.variabelProzent || 4,
                            monatlicheBetrag: segment.bucketConfig?.monatlicheBetrag || 2000,
                            dynamischBasisrate: segment.bucketConfig?.dynamischBasisrate || 4,
                            dynamischObereSchwell: segment.bucketConfig?.dynamischObereSchwell || 8,
                            dynamischObereAnpassung: segment.bucketConfig?.dynamischObereAnpassung || 5,
                            dynamischUntereSchwell: segment.bucketConfig?.dynamischUntereSchwell || 2,
                            dynamischUntereAnpassung: segment.bucketConfig?.dynamischUntereAnpassung || -5,
                          }}
                          onChange={{
                            onInitialCashCushionChange: value => updateSegment(segment.id, {
                              bucketConfig: {
                                initialCashCushion: value,
                                refillThreshold: segment.bucketConfig?.refillThreshold || 5000,
                                refillPercentage: segment.bucketConfig?.refillPercentage || 0.5,
                                baseWithdrawalRate: segment.bucketConfig?.baseWithdrawalRate || 0.04,
                              },
                            }),
                            onRefillThresholdChange: value => updateSegment(segment.id, {
                              bucketConfig: {
                                initialCashCushion: segment.bucketConfig?.initialCashCushion || 20000,
                                refillThreshold: value,
                                refillPercentage: segment.bucketConfig?.refillPercentage || 0.5,
                                baseWithdrawalRate: segment.bucketConfig?.baseWithdrawalRate || 0.04,
                              },
                            }),
                            onRefillPercentageChange: value => updateSegment(segment.id, {
                              bucketConfig: {
                                initialCashCushion: segment.bucketConfig?.initialCashCushion || 20000,
                                refillThreshold: segment.bucketConfig?.refillThreshold || 5000,
                                refillPercentage: value,
                                baseWithdrawalRate: segment.bucketConfig?.baseWithdrawalRate || 0.04,
                              },
                            }),
                            onBaseWithdrawalRateChange: value => updateSegment(segment.id, {
                              bucketConfig: {
                                ...segment.bucketConfig,
                                initialCashCushion: segment.bucketConfig?.initialCashCushion || 20000,
                                refillThreshold: segment.bucketConfig?.refillThreshold || 5000,
                                refillPercentage: segment.bucketConfig?.refillPercentage || 0.5,
                                baseWithdrawalRate: value,
                              },
                            }),
                            onSubStrategyChange: value => updateSegment(segment.id, {
                              bucketConfig: {
                                ...segment.bucketConfig,
                                initialCashCushion: segment.bucketConfig?.initialCashCushion || 20000,
                                refillThreshold: segment.bucketConfig?.refillThreshold || 5000,
                                refillPercentage: segment.bucketConfig?.refillPercentage || 0.5,
                                baseWithdrawalRate: segment.bucketConfig?.baseWithdrawalRate || 0.04,
                                subStrategy: value,
                              },
                            }),
                            onVariabelProzentChange: value => updateSegment(segment.id, {
                              bucketConfig: {
                                initialCashCushion: segment.bucketConfig?.initialCashCushion || 20000,
                                refillThreshold: segment.bucketConfig?.refillThreshold || 5000,
                                refillPercentage: segment.bucketConfig?.refillPercentage || 0.5,
                                baseWithdrawalRate: segment.bucketConfig?.baseWithdrawalRate || 0.04,
                                variabelProzent: value,
                              },
                            }),
                            onMonatlicheBetragChange: value => updateSegment(segment.id, {
                              bucketConfig: {
                                initialCashCushion: segment.bucketConfig?.initialCashCushion || 20000,
                                refillThreshold: segment.bucketConfig?.refillThreshold || 5000,
                                refillPercentage: segment.bucketConfig?.refillPercentage || 0.5,
                                baseWithdrawalRate: segment.bucketConfig?.baseWithdrawalRate || 0.04,
                                monatlicheBetrag: value,
                              },
                            }),
                            onDynamischBasisrateChange: value => updateSegment(segment.id, {
                              bucketConfig: {
                                initialCashCushion: segment.bucketConfig?.initialCashCushion || 20000,
                                refillThreshold: segment.bucketConfig?.refillThreshold || 5000,
                                refillPercentage: segment.bucketConfig?.refillPercentage || 0.5,
                                baseWithdrawalRate: segment.bucketConfig?.baseWithdrawalRate || 0.04,
                                dynamischBasisrate: value,
                              },
                            }),
                            onDynamischObereSchwell: value => updateSegment(segment.id, {
                              bucketConfig: {
                                initialCashCushion: segment.bucketConfig?.initialCashCushion || 20000,
                                refillThreshold: segment.bucketConfig?.refillThreshold || 5000,
                                refillPercentage: segment.bucketConfig?.refillPercentage || 0.5,
                                baseWithdrawalRate: segment.bucketConfig?.baseWithdrawalRate || 0.04,
                                dynamischObereSchwell: value,
                              },
                            }),
                            onDynamischObereAnpassung: value => updateSegment(segment.id, {
                              bucketConfig: {
                                initialCashCushion: segment.bucketConfig?.initialCashCushion || 20000,
                                refillThreshold: segment.bucketConfig?.refillThreshold || 5000,
                                refillPercentage: segment.bucketConfig?.refillPercentage || 0.5,
                                baseWithdrawalRate: segment.bucketConfig?.baseWithdrawalRate || 0.04,
                                dynamischObereAnpassung: value,
                              },
                            }),
                            onDynamischUntereSchwell: value => updateSegment(segment.id, {
                              bucketConfig: {
                                initialCashCushion: segment.bucketConfig?.initialCashCushion || 20000,
                                refillThreshold: segment.bucketConfig?.refillThreshold || 5000,
                                refillPercentage: segment.bucketConfig?.refillPercentage || 0.5,
                                baseWithdrawalRate: segment.bucketConfig?.baseWithdrawalRate || 0.04,
                                dynamischUntereSchwell: value,
                              },
                            }),
                            onDynamischUntereAnpassung: value => updateSegment(segment.id, {
                              bucketConfig: {
                                initialCashCushion: segment.bucketConfig?.initialCashCushion || 20000,
                                refillThreshold: segment.bucketConfig?.refillThreshold || 5000,
                                refillPercentage: segment.bucketConfig?.refillPercentage || 0.5,
                                baseWithdrawalRate: segment.bucketConfig?.baseWithdrawalRate || 0.04,
                                dynamischUntereAnpassung: value,
                              },
                            }),
                          }}
                        />
                      )}

                      {/* RMD strategy settings */}
                      {segment.strategy === 'rmd' && (
                        <RMDWithdrawalConfiguration
                          values={{
                            startAge: segment.rmdConfig?.startAge || 65,
                            lifeExpectancyTable: segment.rmdConfig?.lifeExpectancyTable || 'german_2020_22',
                            customLifeExpectancy: segment.rmdConfig?.customLifeExpectancy,
                          }}
                          onChange={{
                            onStartAgeChange: age => updateSegment(segment.id, {
                              rmdConfig: {
                                startAge: age,
                                lifeExpectancyTable: segment.rmdConfig?.lifeExpectancyTable || 'german_2020_22',
                                customLifeExpectancy: segment.rmdConfig?.customLifeExpectancy,
                              },
                            }),
                            onLifeExpectancyTableChange: table => updateSegment(segment.id, {
                              rmdConfig: {
                                startAge: segment.rmdConfig?.startAge || 65,
                                lifeExpectancyTable: table,
                                customLifeExpectancy: segment.rmdConfig?.customLifeExpectancy,
                              },
                            }),
                            onCustomLifeExpectancyChange: years => updateSegment(segment.id, {
                              rmdConfig: {
                                startAge: segment.rmdConfig?.startAge || 65,
                                lifeExpectancyTable: 'custom',
                                customLifeExpectancy: years,
                              },
                            }),
                          }}
                        />
                      )}

                      <Separator />

                      {/* Return configuration */}
                      <div className="mb-4 space-y-2">
                        <Label>Rendite-Modus</Label>
                        <RadioTileGroup
                          value={getReturnModeFromConfig(segment.returnConfig)}
                          onValueChange={(value: any) => {
                            const newReturnConfig = getReturnConfigFromMode(value as WithdrawalReturnMode, segment)
                            updateSegment(segment.id, { returnConfig: newReturnConfig })
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
                      </div>

                      {/* Fixed return settings */}
                      {segment.returnConfig.mode === 'fixed' && (
                        <div className="mb-4 space-y-2">
                          <Label>Erwartete Rendite (%)</Label>
                          <div className="space-y-2">
                            <Slider
                              value={[(segment.returnConfig.fixedRate || 0.05) * 100]}
                              min={0}
                              max={10}
                              step={0.5}
                              onValueChange={value => updateSegment(segment.id, {
                                returnConfig: {
                                  mode: 'fixed',
                                  fixedRate: value[0] / 100,
                                },
                              })}
                              className="mt-2"
                            />
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>0%</span>
                              <span className="font-medium text-gray-900">
                                {((segment.returnConfig.fixedRate || 0.05) * 100).toFixed(1)}
                                %
                              </span>
                              <span>10%</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Random return settings */}
                      {segment.returnConfig.mode === 'random' && (
                        <>
                          <div className="mb-4 space-y-2">
                            <Label>Durchschnittliche Rendite (%)</Label>
                            <div className="space-y-2">
                              <Slider
                                value={[(segment.returnConfig.randomConfig?.averageReturn || 0.05) * 100]}
                                min={0}
                                max={12}
                                step={0.5}
                                onValueChange={value => updateSegment(segment.id, {
                                  returnConfig: {
                                    mode: 'random',
                                    randomConfig: {
                                      averageReturn: value[0] / 100,
                                      standardDeviation: segment.returnConfig.randomConfig?.standardDeviation || 0.12,
                                      seed: segment.returnConfig.randomConfig?.seed,
                                    },
                                  },
                                })}
                                className="mt-2"
                              />
                              <div className="flex justify-between text-sm text-gray-500">
                                <span>0%</span>
                                <span className="font-medium text-gray-900">
                                  {((segment.returnConfig.randomConfig?.averageReturn || 0.05) * 100).toFixed(1)}
                                  %
                                </span>
                                <span>12%</span>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Erwartete durchschnittliche Rendite für diese Phase (meist konservativer als Ansparphase)
                            </div>
                          </div>

                          <div className="mb-4 space-y-2">
                            <Label>Standardabweichung (%)</Label>
                            <div className="space-y-2">
                              <Slider
                                value={[(segment.returnConfig.randomConfig?.standardDeviation || 0.12) * 100]}
                                min={5}
                                max={25}
                                step={1}
                                onValueChange={value => updateSegment(segment.id, {
                                  returnConfig: {
                                    mode: 'random',
                                    randomConfig: {
                                      averageReturn: segment.returnConfig.randomConfig?.averageReturn || 0.05,
                                      standardDeviation: value[0] / 100,
                                      seed: segment.returnConfig.randomConfig?.seed,
                                    },
                                  },
                                })}
                                className="mt-2"
                              />
                              <div className="flex justify-between text-sm text-gray-500">
                                <span>5%</span>
                                <span className="font-medium text-gray-900">
                                  {((segment.returnConfig.randomConfig?.standardDeviation || 0.12) * 100).toFixed(0)}
                                  %
                                </span>
                                <span>25%</span>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Volatilität der Renditen (meist niedriger als Ansparphase wegen konservativerer
                              Allokation)
                            </div>
                          </div>

                          <div className="mb-4 space-y-2">
                            <Label>Zufalls-Seed (optional)</Label>
                            <Input
                              type="number"
                              value={segment.returnConfig.randomConfig?.seed || ''}
                              onChange={(e) => {
                                const value = e.target.value ? Number(e.target.value) : undefined
                                updateSegment(segment.id, {
                                  returnConfig: {
                                    mode: 'random',
                                    randomConfig: {
                                      averageReturn: segment.returnConfig.randomConfig?.averageReturn || 0.05,
                                      standardDeviation: segment.returnConfig.randomConfig?.standardDeviation || 0.12,
                                      seed: value,
                                    },
                                  },
                                })
                              }}
                              placeholder="Für reproduzierbare Ergebnisse"
                            />
                            <div className="text-sm text-muted-foreground mt-1">
                              Optionaler Seed für reproduzierbare Zufallsrenditen. Leer lassen für echte Zufälligkeit.
                            </div>
                          </div>
                        </>
                      )}

                      {/* Variable return settings */}
                      {segment.returnConfig.mode === 'variable' && (
                        <div className="mb-4 space-y-2">
                          <Label>Variable Renditen pro Jahr</Label>
                          <div
                            style={{
                              maxHeight: '300px',
                              overflowY: 'auto',
                              padding: '8px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                            }}
                          >
                            {Array.from(
                              { length: segment.endYear - segment.startYear + 1 },
                              (_, index) => {
                                const year = segment.startYear + index
                                const currentReturn = segment.returnConfig.variableConfig?.yearlyReturns[year] || 0.05
                                return (
                                  <div key={year} className="flex items-center space-x-3 mb-2">
                                    <span className="text-sm font-medium min-w-[60px]">
                                      {year}
                                      :
                                    </span>
                                    <Input
                                      type="number"
                                      value={(currentReturn * 100).toFixed(1)}
                                      onChange={(e) => {
                                        const newReturn = e.target.value ? Number(e.target.value) / 100 : 0.05
                                        const newYearlyReturns = {
                                          ...(segment.returnConfig.variableConfig?.yearlyReturns || {}),
                                          [year]: newReturn,
                                        }
                                        updateSegment(segment.id, {
                                          returnConfig: {
                                            mode: 'variable',
                                            variableConfig: {
                                              yearlyReturns: newYearlyReturns,
                                            },
                                          },
                                        })
                                      }}
                                      step={0.1}
                                      min={-50}
                                      max={50}
                                      className="flex-1"
                                    />
                                    <span className="text-sm text-gray-500">%</span>
                                  </div>
                                )
                              },
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Konfiguriere die erwartete Rendite für jedes Jahr dieser Phase individuell.
                          </div>
                        </div>
                      )}

                      <Separator />

                      {/* Inflation settings */}
                      <div className="mb-4 space-y-2">
                        <Label>Inflation berücksichtigen</Label>
                        <Switch
                          checked={segment.inflationConfig !== undefined}
                          onCheckedChange={(checked: boolean) => updateSegment(segment.id, {
                            inflationConfig: checked ? { inflationRate: 0.02 } : undefined,
                          })}
                        />
                      </div>

                      {segment.inflationConfig && (
                        <div className="mb-4 space-y-2">
                          <Label>Inflationsrate (%)</Label>
                          <div className="space-y-2">
                            <Slider
                              value={[(segment.inflationConfig.inflationRate || 0.02) * 100]}
                              min={0}
                              max={5}
                              step={0.1}
                              onValueChange={value => updateSegment(segment.id, {
                                inflationConfig: { inflationRate: value[0] / 100 },
                              })}
                              className="mt-2"
                            />
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>0%</span>
                              <span className="font-medium text-gray-900">
                                {((segment.inflationConfig.inflationRate || 0.02) * 100).toFixed(1)}
                                %
                              </span>
                              <span>5%</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <Separator />

                      {/* Tax reduction setting */}
                      <div className="mb-4 space-y-2">
                        <Label>Steuer reduziert Endkapital</Label>
                        <div className="flex items-center space-x-3 mt-2">
                          <Switch
                            checked={segment.steuerReduzierenEndkapital ?? true}
                            onCheckedChange={(checked) => {
                              updateSegment(segment.id, {
                                steuerReduzierenEndkapital: checked,
                              })
                            }}
                          />
                          <span className="text-sm">
                            {(segment.steuerReduzierenEndkapital ?? true)
                              ? 'Steuern werden vom Kapital abgezogen'
                              : 'Steuern werden separat bezahlt'}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Bestimmt, ob Vorabpauschale-Steuern das Endkapital dieser Phase reduzieren oder über ein
                          separates Verrechnungskonto bezahlt werden.
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
