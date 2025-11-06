import React from 'react'
import { type SingleFormValue } from './SparplanEingabe.helpers'
import { SinglePaymentFormFields } from './sparplan-forms/SinglePaymentFormFields'
import { CostFactorFields } from './sparplan-forms/CostFactorFields'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { CollapsibleCardHeader } from './ui/collapsible-card'

interface SinglePaymentFormCardProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  formValues: SingleFormValue
  onFormChange: (values: SingleFormValue) => void
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

function FormHeader() {
  return (
    <CollapsibleCardHeader
      className="pb-4"
      titleClassName="text-left text-lg"
      iconClassName="h-5 w-5"
      simplifiedPadding
    >
      💵 Einmalzahlungen erstellen
    </CollapsibleCardHeader>
  )
}

function FormButtons({
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

/**
 * Form content for single payment
 */
function SinglePaymentForm({
  formValues,
  onFormChange,
  formatDateForInput,
  handleDateChange,
  handleNumberChange,
  onSubmit,
  isEditMode,
  showCancelButton,
  onCancel,
}: Omit<SinglePaymentFormCardProps, 'isOpen' | 'onOpenChange'>) {
  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        onSubmit()
      }}
    >
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
  )
}

export function SinglePaymentFormCard({ isOpen, onOpenChange, ...formProps }: SinglePaymentFormCardProps) {
  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <FormHeader />
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="mb-4 text-[#666] text-sm">
              Fügen Sie einmalige Zahlungen zu einem bestimmten Zeitpunkt hinzu
            </div>
            <SinglePaymentForm {...formProps} />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
