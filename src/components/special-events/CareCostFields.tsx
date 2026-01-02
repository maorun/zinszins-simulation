import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useMemo } from 'react'
import { generateFormId } from '../../utils/unique-id'
import type { EventFormValues } from './EventFormFields'
import { CareCostInfoBox } from './CareCostInfoBox'
import { CareLevelSelect } from './CareLevelSelect'
import { CareCostInputFields } from './CareCostInputFields'
import { DEFAULT_CARE_LEVELS } from '../../../helpers/care-cost-simulation'

interface CareCostFieldsProps {
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
}

export function CareCostFields({ formValues, onFormChange }: CareCostFieldsProps) {
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
          <CareLevelSelect careLevelId={careLevelId} formValues={formValues} onFormChange={onFormChange} />
          <CareCostInputFields
            customCostsId={customCostsId}
            durationId={durationId}
            inflationId={inflationId}
            formValues={formValues}
            onFormChange={onFormChange}
            typicalMonthlyCost={selectedCareLevelInfo.typicalMonthlyCost}
          />
          <CareCostInfoBox />
        </div>
      </CardContent>
    </Card>
  )
}
