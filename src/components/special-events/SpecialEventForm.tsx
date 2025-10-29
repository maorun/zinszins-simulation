import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { EventFormFields, type EventFormValues } from './EventFormFields'

interface SpecialEventFormProps {
  formValues: EventFormValues
  onFormChange: (values: EventFormValues) => void
  onSubmit: () => void
  savingsStartYear: number
  savingsEndYear: number
  withdrawalStartYear: number
  withdrawalEndYear: number
}

export function SpecialEventForm({
  formValues,
  onFormChange,
  onSubmit,
  savingsStartYear,
  savingsEndYear,
  withdrawalStartYear,
  withdrawalEndYear,
}: SpecialEventFormProps) {
  const isSubmitDisabled = (formValues.eventType === 'inheritance' && !formValues.grossAmount)
    || (formValues.eventType === 'expense' && !formValues.expenseAmount)
  const submitButtonText = formValues.eventType === 'inheritance' ? '💰 Erbschaft hinzufügen' : '💸 Ausgabe hinzufügen'

  return (
    <Card nestingLevel={1} className="mb-4">
      <Collapsible defaultOpen={false}>
        <CardHeader nestingLevel={1}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
              <CardTitle className="text-left text-lg">✏️ Neues Sonderereignis erstellen</CardTitle>
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={1} className="pt-0">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                onSubmit()
              }}
            >
              <EventFormFields
                formValues={formValues}
                onFormChange={onFormChange}
                savingsStartYear={savingsStartYear}
                savingsEndYear={savingsEndYear}
                withdrawalStartYear={withdrawalStartYear}
                withdrawalEndYear={withdrawalEndYear}
              />
              <Button variant="default" type="submit" size="lg" disabled={isSubmitDisabled}>
                {submitButtonText}
              </Button>
            </form>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
