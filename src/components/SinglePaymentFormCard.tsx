import React from 'react'
import { type SingleFormValue } from './SparplanEingabe.helpers'
import { SinglePaymentFormFields } from './sparplan-forms/SinglePaymentFormFields'
import { CostFactorFields } from './sparplan-forms/CostFactorFields'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown } from 'lucide-react'

interface SinglePaymentFormCardProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  formValues: SingleFormValue
  onFormChange: (values: SingleFormValue) => void
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

function FormHeader() {
  return (
    <CardHeader className="pb-4">
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
          <CardTitle className="text-left text-lg">💵 Einmalzahlungen erstellen</CardTitle>
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </div>
      </CollapsibleTrigger>
    </CardHeader>
  )
}

function FormButtons({ isEditMode, showCancelButton, onCancel, disabled }: {
  isEditMode: boolean
  showCancelButton: boolean
  onCancel?: () => void
  disabled: boolean
}) {
  return (
    <div className="mb-4 space-y-2">
      <div className="flex gap-2">
        <Button variant="default" type="submit" size="lg" disabled={disabled}>
          {isEditMode ? '✏️ Einmalzahlung aktualisieren' : '💰 Einmalzahlung hinzufügen'}
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

export function SinglePaymentFormCard({
  isOpen,
  onOpenChange,
  formValues,
  onFormChange,
  formatDateForInput,
  handleDateChange,
  handleNumberChange,
  onSubmit,
  isEditMode,
  showCancelButton,
  onCancel,
}: SinglePaymentFormCardProps) {
  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <FormHeader />
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
              Fügen Sie einmalige Zahlungen zu einem bestimmten Zeitpunkt hinzu
            </div>
            <form onSubmit={(e) => { e.preventDefault(); onSubmit() }}>
              <SinglePaymentFormFields
                formValues={formValues}
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
              <FormButtons
                isEditMode={isEditMode}
                showCancelButton={showCancelButton}
                onCancel={onCancel}
                disabled={!formValues.einzahlung}
              />
            </form>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
