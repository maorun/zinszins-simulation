import React from 'react'
import { type SimulationAnnualType } from '../utils/simulate'
import { type SparplanFormValue } from './SparplanEingabe.helpers'
import { SparplanFormFields } from './sparplan-forms/SparplanFormFields'
import { CostFactorFields } from './sparplan-forms/CostFactorFields'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown } from 'lucide-react'

interface SparplanFormCardProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  formValues: SparplanFormValue
  simulationAnnual: SimulationAnnualType
  onFormChange: (values: SparplanFormValue) => void
  formatDateForInput: (date: Date | string | null, format: string) => string
  handleDateChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    format: string,
    onChange: (date: Date | null) => void
  ) => void
  handleNumberChange: (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => void
  onSubmit: () => void
  isEditMode: boolean
  showCancelButton: boolean
  onCancel: () => void
}

export function SparplanFormCard({
  isOpen,
  onOpenChange,
  formValues,
  simulationAnnual,
  onFormChange,
  formatDateForInput,
  handleDateChange,
  handleNumberChange,
  onSubmit,
  isEditMode,
  showCancelButton,
  onCancel,
}: SparplanFormCardProps) {
  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <CardHeader className="pb-4">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
              <CardTitle className="text-left text-lg">💰 Sparpläne erstellen</CardTitle>
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
              Erstellen Sie regelmäßige Sparpläne mit Start- und Enddatum
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                onSubmit()
              }}
            >
              <SparplanFormFields
                formValues={formValues}
                simulationAnnual={simulationAnnual}
                onFormChange={onFormChange}
                formatDateForInput={formatDateForInput}
                handleDateChange={handleDateChange}
                handleNumberChange={handleNumberChange}
              />
              <CostFactorFields
                values={formValues}
                onValueChange={values => onFormChange({ ...formValues, ...values })}
                handleNumberChange={handleNumberChange}
              />
              <div className="mb-4 space-y-2">
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    type="submit"
                    size="lg"
                    disabled={!formValues.start || !formValues.einzahlung}
                  >
                    {isEditMode ? '✏️ Sparplan aktualisieren' : '💾 Sparplan hinzufügen'}
                  </Button>
                  {showCancelButton && (
                    <Button
                      onClick={onCancel}
                      variant="outline"
                      size="lg"
                      type="button"
                    >
                      Abbrechen
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
