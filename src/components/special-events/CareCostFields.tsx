import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useMemo } from 'react'
import { generateFormId } from '../../utils/unique-id'
import type { EventFormValues } from './EventFormFields'
import { DEFAULT_CARE_LEVELS, type CareLevel } from '../../../helpers/care-cost-simulation'

interface CareCostFieldsProps {
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
}

export function CareCostFields({ formValues, onFormChange }: CareCostFieldsProps) {
  // Generate unique IDs for form fields
  const careLevelId = useMemo(() => generateFormId('care-cost-fields', 'care-level'), [])
  const customCostsId = useMemo(() => generateFormId('care-cost-fields', 'custom-costs'), [])
  const durationId = useMemo(() => generateFormId('care-cost-fields', 'duration'), [])
  const inflationId = useMemo(() => generateFormId('care-cost-fields', 'inflation'), [])

  const selectedCareLevelInfo = DEFAULT_CARE_LEVELS[formValues.careLevel]

  return (
    <Card nestingLevel={2} className="mb-4">
      <CardHeader nestingLevel={2}>
        <CardTitle className="text-left text-base">🏥 Pflegekosten-Details</CardTitle>
      </CardHeader>
      <CardContent nestingLevel={2}>
        <div className="space-y-4">
          {/* Care Level Selection */}
          <div>
            <Label htmlFor={careLevelId}>Pflegegrad *</Label>
            <select
              id={careLevelId}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={String(formValues.careLevel)}
              onChange={e =>
                onFormChange({
                  ...formValues,
                  careLevel: Number(e.target.value) as CareLevel,
                })
              }
            >
              {([1, 2, 3, 4, 5] as const).map(level => (
                <option key={level} value={String(level)}>
                  {DEFAULT_CARE_LEVELS[level].name} - {DEFAULT_CARE_LEVELS[level].description}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Typische monatliche Kosten: {selectedCareLevelInfo.typicalMonthlyCost.toLocaleString('de-DE')} € |
              Pflegegeld: {selectedCareLevelInfo.careAllowance.toLocaleString('de-DE')} €
            </p>
          </div>

          {/* Custom Monthly Costs */}
          <div>
            <Label htmlFor={customCostsId}>Individuelle monatliche Kosten (optional)</Label>
            <Input
              id={customCostsId}
              type="number"
              min="0"
              step="100"
              placeholder={`Standard: ${selectedCareLevelInfo.typicalMonthlyCost.toLocaleString('de-DE')} €`}
              value={formValues.customMonthlyCosts}
              onChange={e =>
                onFormChange({
                  ...formValues,
                  customMonthlyCosts: e.target.value,
                })
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Leer lassen für typische Kosten des gewählten Pflegegrads
            </p>
          </div>

          {/* Care Duration */}
          <div>
            <Label htmlFor={durationId}>Pflegedauer (Jahre)</Label>
            <Input
              id={durationId}
              type="number"
              min="0"
              step="1"
              placeholder="0 = bis Lebensende"
              value={formValues.careDurationYears}
              onChange={e =>
                onFormChange({
                  ...formValues,
                  careDurationYears: e.target.value,
                })
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              0 oder leer = Pflegekosten bis zum Lebensende
            </p>
          </div>

          {/* Care Inflation Rate */}
          <div>
            <Label htmlFor={inflationId}>Inflationsrate für Pflegekosten (%)</Label>
            <Input
              id={inflationId}
              type="number"
              min="0"
              max="20"
              step="0.5"
              value={formValues.careInflationRate}
              onChange={e =>
                onFormChange({
                  ...formValues,
                  careInflationRate: e.target.value,
                })
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Pflegekosten steigen oft stärker als die allgemeine Inflation (typisch: 3-5%)
            </p>
          </div>

          {/* Information Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
            <p className="font-semibold mb-2">ℹ️ Berücksichtigt werden:</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
              <li>Gesetzliche Pflegeversicherungsleistungen (Pflegegeld)</li>
              <li>Jährliche Inflation der Pflegekosten</li>
              <li>Steuerliche Absetzbarkeit als außergewöhnliche Belastung</li>
              <li>Integration in die Gesamtfinanzplanung</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
