import React from 'react'
import { Input } from './ui/input'
import { Slider } from './ui/slider'
import { Switch } from './ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Button } from './ui/button'
import { RadioTileGroup, RadioTile } from './ui/radio-tile'
import { Separator } from './ui/separator'
import { Label } from './ui/label'
import { Trash2, ChevronDown, MoveUp, MoveDown } from 'lucide-react'
import { generateInstanceId } from '../utils/unique-id'
import { DynamicWithdrawalConfiguration } from './DynamicWithdrawalConfiguration'
import { BucketStrategyConfiguration } from './BucketStrategyConfiguration'
import { RMDWithdrawalConfiguration } from './RMDWithdrawalConfiguration'
import { SteueroptimierteEntnahmeConfiguration } from './SteueroptimierteEntnahmeConfiguration'
import { MultiAssetPortfolioConfiguration } from './MultiAssetPortfolioConfiguration'
import { createDefaultMultiAssetConfig } from '../../helpers/multi-asset-portfolio'
import type { WithdrawalSegment } from '../utils/segmented-withdrawal'
import type { WithdrawalStrategy } from '../../helpers/withdrawal'
import type { ReturnConfiguration } from '../../helpers/random-returns'

// Helper function for number input handling
const handleNumberInputChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  onChange: (value: number | undefined) => void,
) => {
  const value = e.target.value
  onChange(value ? Math.round(Number(value)) : undefined)
}

export type WithdrawalReturnMode = 'fixed' | 'random' | 'variable' | 'multiasset'

interface WithdrawalSegmentCardProps {
  segment: WithdrawalSegment
  index: number
  totalSegments: number
  withdrawalStartYear: number
  withdrawalEndYear: number
  onUpdate: (segmentId: string, updates: Partial<WithdrawalSegment>) => void
  onRemove: (segmentId: string) => void
  onMoveUp: (segmentId: string) => void
  onMoveDown: (segmentId: string) => void
}

// Get return mode from config - moved from parent
const getReturnModeFromConfig = (returnConfig: ReturnConfiguration): WithdrawalReturnMode => {
  if (returnConfig.mode === 'multiasset') {
    return 'multiasset'
  }
  return returnConfig.mode as WithdrawalReturnMode
}

// Get return config from mode - moved from parent
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
    case 'multiasset':
      return {
        mode: 'multiasset',
        multiAssetConfig: segment.returnConfig.mode === 'multiasset' && segment.returnConfig.multiAssetConfig
          ? segment.returnConfig.multiAssetConfig
          : createDefaultMultiAssetConfig(),
      }
    default:
      return segment.returnConfig
  }
}

export function WithdrawalSegmentCard({
  segment,
  index,
  totalSegments,
  withdrawalStartYear,
  withdrawalEndYear,
  onUpdate: updateSegment,
  onRemove: removeSegment,
  onMoveUp: moveSegmentUp,
  onMoveDown: moveSegmentDown,
}: WithdrawalSegmentCardProps) {
  return (
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
                    disabled={index === totalSegments - 1}
                    className="text-gray-500 hover:text-gray-700"
                    title="Phase nach unten verschieben"
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                </div>
                <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                {totalSegments > 1 && (
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
                      subStrategy: '4prozent', // Default sub-strategy
                      variabelProzent: 4, // Default variable percentage
                      monatlicheBetrag: 2000, // Default monthly amount
                      dynamischBasisrate: 4, // Default dynamic base rate
                      dynamischObereSchwell: 8, // Default upper threshold
                      dynamischObereAnpassung: 5, // Default upper adjustment
                      dynamischUntereSchwell: 2, // Default lower threshold
                      dynamischUntereAnpassung: -5, // Default lower adjustment
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
                <RadioTile value="steueroptimiert" label="Steueroptimierte Entnahme">
                  Automatische Optimierung zur Steuerminimierung
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
                idPrefix={`bucket-sub-strategy-${segment.id}`}
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
                      refillThreshold: 5000,
                      refillPercentage: 0.5,
                      baseWithdrawalRate: 0.04,
                      ...segment.bucketConfig,
                      initialCashCushion: value,
                    },
                  }),
                  onRefillThresholdChange: value => updateSegment(segment.id, {
                    bucketConfig: {
                      initialCashCushion: 20000,
                      refillPercentage: 0.5,
                      baseWithdrawalRate: 0.04,
                      ...segment.bucketConfig,
                      refillThreshold: value,
                    },
                  }),
                  onRefillPercentageChange: value => updateSegment(segment.id, {
                    bucketConfig: {
                      initialCashCushion: 20000,
                      refillThreshold: 5000,
                      baseWithdrawalRate: 0.04,
                      ...segment.bucketConfig,
                      refillPercentage: value,
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
                      initialCashCushion: 20000,
                      refillThreshold: 5000,
                      refillPercentage: 0.5,
                      baseWithdrawalRate: 0.04,
                      ...segment.bucketConfig,
                      variabelProzent: value,
                    },
                  }),
                  onMonatlicheBetragChange: value => updateSegment(segment.id, {
                    bucketConfig: {
                      initialCashCushion: 20000,
                      refillThreshold: 5000,
                      refillPercentage: 0.5,
                      baseWithdrawalRate: 0.04,
                      ...segment.bucketConfig,
                      monatlicheBetrag: value,
                    },
                  }),
                  onDynamischBasisrateChange: value => updateSegment(segment.id, {
                    bucketConfig: {
                      initialCashCushion: 20000,
                      refillThreshold: 5000,
                      refillPercentage: 0.5,
                      baseWithdrawalRate: 0.04,
                      ...segment.bucketConfig,
                      dynamischBasisrate: value,
                    },
                  }),
                  onDynamischObereSchwell: value => updateSegment(segment.id, {
                    bucketConfig: {
                      initialCashCushion: 20000,
                      refillThreshold: 5000,
                      refillPercentage: 0.5,
                      baseWithdrawalRate: 0.04,
                      ...segment.bucketConfig,
                      dynamischObereSchwell: value,
                    },
                  }),
                  onDynamischObereAnpassung: value => updateSegment(segment.id, {
                    bucketConfig: {
                      initialCashCushion: 20000,
                      refillThreshold: 5000,
                      refillPercentage: 0.5,
                      baseWithdrawalRate: 0.04,
                      ...segment.bucketConfig,
                      dynamischObereAnpassung: value,
                    },
                  }),
                  onDynamischUntereSchwell: value => updateSegment(segment.id, {
                    bucketConfig: {
                      initialCashCushion: 20000,
                      refillThreshold: 5000,
                      refillPercentage: 0.5,
                      baseWithdrawalRate: 0.04,
                      ...segment.bucketConfig,
                      dynamischUntereSchwell: value,
                    },
                  }),
                  onDynamischUntereAnpassung: value => updateSegment(segment.id, {
                    bucketConfig: {
                      initialCashCushion: 20000,
                      refillThreshold: 5000,
                      refillPercentage: 0.5,
                      baseWithdrawalRate: 0.04,
                      ...segment.bucketConfig,
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

            {/* Steueroptimierte Entnahme strategy settings */}
            {segment.strategy === 'steueroptimiert' && (
              <div className="space-y-4">
                <SteueroptimierteEntnahmeConfiguration
                  formValue={{
                    steueroptimierteEntnahmeBaseWithdrawalRate:
                                segment.steuerOptimierteConfig?.baseWithdrawalRate || 0.04,
                    steueroptimierteEntnahmeTargetTaxRate:
                                segment.steuerOptimierteConfig?.targetTaxRate || 0.26375,
                    steueroptimierteEntnahmeOptimizationMode:
                                segment.steuerOptimierteConfig?.optimizationMode || 'balanced',
                    steueroptimierteEntnahmeFreibetragUtilizationTarget:
                                segment.steuerOptimierteConfig?.freibetragUtilizationTarget || 0.85,
                    steueroptimierteEntnahmeRebalanceFrequency:
                                segment.steuerOptimierteConfig?.rebalanceFrequency || 'yearly',
                  } as any}
                  updateFormValue={(updates: any) => {
                    updateSegment(segment.id, {
                      steuerOptimierteConfig: {
                        baseWithdrawalRate:
                                    updates.steueroptimierteEntnahmeBaseWithdrawalRate
                                    || segment.steuerOptimierteConfig?.baseWithdrawalRate || 0.04,
                        targetTaxRate:
                                    updates.steueroptimierteEntnahmeTargetTaxRate
                                    || segment.steuerOptimierteConfig?.targetTaxRate || 0.26375,
                        optimizationMode:
                                    updates.steueroptimierteEntnahmeOptimizationMode
                                    || segment.steuerOptimierteConfig?.optimizationMode || 'balanced',
                        freibetragUtilizationTarget:
                                    updates.steueroptimierteEntnahmeFreibetragUtilizationTarget
                                    || segment.steuerOptimierteConfig?.freibetragUtilizationTarget || 0.85,
                        rebalanceFrequency:
                                    updates.steueroptimierteEntnahmeRebalanceFrequency
                                    || segment.steuerOptimierteConfig?.rebalanceFrequency || 'yearly',
                      },
                    })
                  }}
                />
              </div>
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
                <RadioTile value="multiasset" label="Multi-Asset Portfolio">
                  Diversifiziertes Portfolio mit automatischem Rebalancing
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
                  <Label htmlFor={generateInstanceId('avg-return', segment.id)}>Durchschnittliche Rendite (%)</Label>
                  <div className="space-y-2">
                    <Slider
                      id={generateInstanceId('avg-return', segment.id)}
                      value={[(segment.returnConfig.randomConfig?.averageReturn || 0.05) * 100]}
                      min={0}
                      max={12}
                      step={0.5}
                      onValueChange={value => updateSegment(segment.id, {
                        returnConfig: {
                          mode: 'random',
                          randomConfig: {
                            averageReturn: value[0] / 100,
                            standardDeviation:
                                        segment.returnConfig.randomConfig?.standardDeviation || 0.12,
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
                  <Label htmlFor={generateInstanceId('std-dev', segment.id)}>Standardabweichung (%)</Label>
                  <div className="space-y-2">
                    <Slider
                      id={generateInstanceId('std-dev', segment.id)}
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
                  <Label htmlFor={generateInstanceId('random-seed', segment.id)}>Zufalls-Seed (optional)</Label>
                  <Input
                    id={generateInstanceId('random-seed', segment.id)}
                    type="number"
                    value={segment.returnConfig.randomConfig?.seed || ''}
                    onChange={(e) => {
                      const value = e.target.value ? Number(e.target.value) : undefined
                      updateSegment(segment.id, {
                        returnConfig: {
                          mode: 'random',
                          randomConfig: {
                            averageReturn: segment.returnConfig.randomConfig?.averageReturn || 0.05,
                            standardDeviation:
                                        segment.returnConfig.randomConfig?.standardDeviation || 0.12,
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

            {/* Multi-Asset Portfolio settings */}
            {segment.returnConfig.mode === 'multiasset' && (
              <div className="mb-4">
                <MultiAssetPortfolioConfiguration
                  values={segment.returnConfig.multiAssetConfig || createDefaultMultiAssetConfig()}
                  onChange={newConfig => updateSegment(segment.id, {
                    returnConfig: {
                      mode: 'multiasset',
                      multiAssetConfig: newConfig,
                    },
                  })}
                  nestingLevel={1}
                />
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
  )
}
