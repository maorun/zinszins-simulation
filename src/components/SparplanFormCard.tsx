import React from 'react'
import { type SimulationAnnualType } from '../utils/simulate'
import { type SparplanFormValue } from './SparplanEingabe.helpers'
import { SparplanFormFields } from './sparplan-forms/SparplanFormFields'
import { CostFactorFields } from './sparplan-forms/CostFactorFields'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { CollapsibleCardHeader } from './ui/collapsible-card'

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
    onChange: (date: Date | null) => void,
  ) => void
  handleNumberChange: (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => void
  onSubmit: () => void
  isEditMode: boolean
  showCancelButton: boolean
  onCancel: () => void
}

function SparplanFormHeader() {
  return (
    <CollapsibleCardHeader
      className="pb-4"
      titleClassName="text-left text-lg"
      iconClassName="h-5 w-5"
      simplifiedPadding
    >
      💰 Sparpläne erstellen
    </CollapsibleCardHeader>
  )
}

function SparplanFormButtons({
  isEditMode,
  showCancelButton,
  onCancel,
  disabled,
}: {
  isEditMode: boolean
  showCancelButton: boolean
  onCancel?: () => void
  disabled: boolean
}) {
  return (
    <div className="mb-4 space-y-2">
      <div className="flex gap-2">
        <Button variant="default" type="submit" size="lg" disabled={disabled}>
          {isEditMode ? '✏️ Sparplan aktualisieren' : '💾 Sparplan hinzufügen'}
        </Button>
        {showCancelButton && (
          <Button onClick={onCancel} variant="outline" size="lg" type="button">
            Abbrechen
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * Form content for sparplan
 */
function SparplanForm({
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
}: Omit<SparplanFormCardProps, 'isOpen' | 'onOpenChange'>) {
  return (
    <form
      onSubmit={e => {
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
      <SparplanFormButtons
        isEditMode={isEditMode}
        showCancelButton={showCancelButton}
        onCancel={onCancel}
        disabled={!formValues.start || !formValues.einzahlung}
      />
    </form>
  )
}

export function SparplanFormCard({ isOpen, onOpenChange, ...formProps }: SparplanFormCardProps) {
  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <SparplanFormHeader />
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="mb-4 text-[#666] text-sm">Erstellen Sie regelmäßige Sparpläne mit Start- und Enddatum</div>
            <SparplanForm {...formProps} />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
