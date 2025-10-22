import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Button } from './ui/button'
import {
  type CareCostConfiguration,
  type CareCostYearResult,
  createDefaultCareCostConfiguration,
  calculateCareCostsForYear,
  validateCareCostConfiguration,
} from '../../helpers/care-cost-simulation'
import { CareLevelSelector } from './CareCostConfiguration/CareLevelSelector'
import { CoupleCareCostConfig } from './CareCostConfiguration/CoupleCareCostConfig'
import { CareCostPreview } from './CareCostConfiguration/CareCostPreview'
import { CareCostValidationErrors } from './CareCostConfiguration/CareCostValidationErrors'
import { BasicCareCostFields } from './CareCostConfiguration/BasicCareCostFields'
import { InflationRateSlider } from './CareCostConfiguration/InflationRateSlider'
import { InsuranceAndBenefitsFields } from './CareCostConfiguration/InsuranceAndBenefitsFields'

interface CareCostConfigurationProps {
  /** Current care cost configuration */
  values: CareCostConfiguration
  /** Callback when configuration changes */
  onChange: (config: CareCostConfiguration) => void
  /** Current year for validation */
  currentYear?: number
  /** Birth year for calculations */
  birthYear?: number
  /** Spouse birth year for couple calculations */
  spouseBirthYear?: number
  /** Planning mode */
  planningMode: 'individual' | 'couple'
  /** Card nesting level for proper styling */
  nestingLevel?: number
}

/**
 * Check if preview should be shown
 */
function shouldShowPreview(
  previewResult: ReturnType<typeof calculateCareCostsForYear> | null,
  validationErrors: string[],
): boolean {
  return !!(previewResult && previewResult.careNeeded && validationErrors.length === 0)
}

/**
 * Care cost configuration fields
 */
function ResetButton({ onChange }: { onChange: (config: CareCostConfiguration) => void }) {
  return (
    <div className="pt-4 border-t">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(createDefaultCareCostConfiguration())}
      >
        Auf Standardwerte zurücksetzen
      </Button>
    </div>
  )
}

function CareCostConfigFields({
  values,
  onChange,
  currentYear,
  planningMode,
  nestingLevel,
  validationErrors,
  showPreview,
  previewResult,
  previewYear,
}: {
  values: CareCostConfiguration
  onChange: (config: CareCostConfiguration) => void
  currentYear: number
  planningMode: 'individual' | 'couple'
  nestingLevel: number
  validationErrors: string[]
  showPreview: boolean
  previewResult: CareCostYearResult | null
  previewYear: number
}) {
  return (
    <>
      <BasicCareCostFields values={values} onChange={onChange} currentYear={currentYear} />
      <CareLevelSelector careLevel={values.careLevel} onChange={careLevel => onChange({ ...values, careLevel })} />
      <InflationRateSlider
        value={values.careInflationRate}
        onChange={careInflationRate => onChange({ ...values, careInflationRate })}
      />
      <InsuranceAndBenefitsFields values={values} onChange={onChange} />
      {planningMode === 'couple' && (
        <CoupleCareCostConfig
          values={values}
          onChange={onChange}
          currentYear={currentYear}
          nestingLevel={nestingLevel}
        />
      )}
      <CareCostValidationErrors errors={validationErrors} nestingLevel={nestingLevel} />
      {showPreview && previewResult && (
        <CareCostPreview previewYear={previewYear} previewResult={previewResult} nestingLevel={nestingLevel} />
      )}
      <ResetButton onChange={onChange} />
    </>
  )
}

export function CareCostConfiguration({
  values,
  onChange,
  currentYear = new Date().getFullYear(),
  birthYear,
  spouseBirthYear,
  planningMode,
  nestingLevel = 0,
}: CareCostConfigurationProps) {
  const validationErrors = validateCareCostConfiguration(values)
  const previewYear = Math.max(currentYear + 5, values.startYear)
  const previewResult = values.enabled
    ? calculateCareCostsForYear(values, previewYear, birthYear, spouseBirthYear)
    : null
  const showPreview = shouldShowPreview(previewResult, validationErrors)

  return (
    <Card nestingLevel={nestingLevel} className="mb-4">
      <CardHeader nestingLevel={nestingLevel}>
        <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
          🏥 Pflegekosten-Simulation
        </CardTitle>
      </CardHeader>

      <CardContent nestingLevel={nestingLevel} className="space-y-6">
        <div className="flex items-center space-x-2">
          <Switch
            checked={values.enabled}
            onCheckedChange={enabled => onChange({ ...values, enabled })}
            id="care-cost-enabled"
          />
          <Label htmlFor="care-cost-enabled" className="text-sm font-medium">
            Pflegekosten-Simulation aktivieren
          </Label>
        </div>

        {values.enabled && (
          <CareCostConfigFields
            values={values}
            onChange={onChange}
            currentYear={currentYear}
            planningMode={planningMode}
            nestingLevel={nestingLevel}
            validationErrors={validationErrors}
            showPreview={showPreview}
            previewResult={previewResult}
            previewYear={previewYear}
          />
        )}
      </CardContent>
    </Card>
  )
}
