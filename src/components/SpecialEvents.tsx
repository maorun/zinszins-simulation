import type { SimulationAnnualType } from '../utils/simulate'
import type { Sparplan } from '../utils/sparplan-utils'
import { calculateInheritanceTax } from '../../helpers/inheritance-tax'
import { getDefaultCreditTerms } from '../../helpers/credit-calculation'
import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigationItem } from '../hooks/useNavigationItem'
import { EventFormFields, type EventFormValues } from './special-events/EventFormFields'
import { EventsList } from './special-events/EventsList'

interface SpecialEventsProps {
  dispatch: (val: Sparplan[]) => void
  simulationAnnual: SimulationAnnualType
  currentSparplans?: Sparplan[]
  savingsStartYear: number
  savingsEndYear: number
  withdrawalStartYear: number
  withdrawalEndYear: number
}

export function SpecialEvents({
  dispatch,
  simulationAnnual: _simulationAnnual,
  currentSparplans = [],
  savingsStartYear,
  savingsEndYear,
  withdrawalStartYear,
  withdrawalEndYear,
}: SpecialEventsProps) {
  const [specialEventFormValues, setSpecialEventFormValues] = useState<EventFormValues>({
    date: new Date(),
    eventType: 'inheritance',
    phase: 'sparphase',
    relationshipType: 'child',
    grossAmount: '',
    expenseType: 'car',
    expenseAmount: '',
    useCredit: false,
    interestRate: '',
    termYears: '',
    description: '',
  })

  const resetForm = () => {
    setSpecialEventFormValues({
      date: new Date(),
      eventType: 'inheritance',
      phase: 'sparphase',
      relationshipType: 'child',
      grossAmount: '',
      expenseType: 'car',
      expenseAmount: '',
      useCredit: false,
      interestRate: '',
      termYears: '',
      description: '',
    })
  }

  // Helper to generate next ID for sparplan
  const getNextSparplanId = () => Math.max(0, ...currentSparplans.map(p => p.id)) + 1

  const handleInheritanceSubmit = () => {
    if (!specialEventFormValues.grossAmount) return

    const grossAmount = Number(specialEventFormValues.grossAmount)
    const taxCalc = calculateInheritanceTax(grossAmount, specialEventFormValues.relationshipType)

    const newSparplan: Sparplan = {
      id: getNextSparplanId(),
      start: specialEventFormValues.date,
      end: specialEventFormValues.date,
      einzahlung: taxCalc.netAmount,
      eventType: 'inheritance',
      specialEventData: {
        relationshipType: specialEventFormValues.relationshipType,
        grossInheritanceAmount: grossAmount,
        description: specialEventFormValues.description,
        phase: specialEventFormValues.phase,
      },
    }

    dispatch([...currentSparplans, newSparplan])
    toast.success('Erbschaft erfolgreich hinzugefügt!')
    resetForm()
  }

  const handleExpenseSubmit = () => {
    if (!specialEventFormValues.expenseAmount) return

    const expenseAmount = Number(specialEventFormValues.expenseAmount)
    let creditTerms = undefined

    if (specialEventFormValues.useCredit) {
      const defaultTerms = getDefaultCreditTerms(specialEventFormValues.expenseType, expenseAmount)
      const interestRate = specialEventFormValues.interestRate
        ? Number(specialEventFormValues.interestRate) / 100
        : defaultTerms.interestRate
      const termYears = specialEventFormValues.termYears
        ? Number(specialEventFormValues.termYears)
        : defaultTerms.termYears

      creditTerms = {
        interestRate,
        termYears,
        monthlyPayment:
          interestRate === 0
            ? expenseAmount / (termYears * 12)
            : (expenseAmount * (interestRate / 12) * Math.pow(1 + interestRate / 12, termYears * 12))
              / (Math.pow(1 + interestRate / 12, termYears * 12) - 1),
      }
    }

    const newSparplan: Sparplan = {
      id: getNextSparplanId(),
      start: specialEventFormValues.date,
      end: specialEventFormValues.date,
      einzahlung: -expenseAmount,
      eventType: 'expense',
      specialEventData: {
        expenseType: specialEventFormValues.expenseType,
        description: specialEventFormValues.description,
        creditTerms,
        phase: specialEventFormValues.phase,
      },
    }

    dispatch([...currentSparplans, newSparplan])
    toast.success('Ausgabe erfolgreich hinzugefügt!')
    resetForm()
  }

  const handleSubmit = () => {
    if (specialEventFormValues.eventType === 'inheritance') {
      handleInheritanceSubmit()
    }
    else if (specialEventFormValues.eventType === 'expense') {
      handleExpenseSubmit()
    }
  }

  const handleDeleteSparplan = (id: number) => {
    const filtered = currentSparplans.filter(sparplan => sparplan.id !== id)
    dispatch(filtered)
    toast.info('Eintrag gelöscht')
  }

  const navigationRef = useNavigationItem({
    id: 'special-events',
    title: 'Sonderereignisse verwalten',
    icon: '🎯',
    level: 0,
  })

  return (
    <Card nestingLevel={0} className="mb-6" ref={navigationRef}>
      <Collapsible defaultOpen={false}>
        <CardHeader nestingLevel={0}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
              <CardTitle className="text-left text-lg">🎯 Sonderereignisse verwalten</CardTitle>
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={0} className="pt-0">
            <div style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
              Verwalten Sie besondere Ereignisse wie Erbschaften oder größere Ausgaben für beide Lebensphasen
            </div>

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
                        handleSubmit()
                      }}
                    >
                      <EventFormFields
                        formValues={specialEventFormValues}
                        onFormChange={setSpecialEventFormValues}
                        savingsStartYear={savingsStartYear}
                        savingsEndYear={savingsEndYear}
                        withdrawalStartYear={withdrawalStartYear}
                        withdrawalEndYear={withdrawalEndYear}
                      />

                      <div className="mb-4 space-y-2">
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            type="submit"
                            size="lg"
                            disabled={
                              (specialEventFormValues.eventType === 'inheritance' && !specialEventFormValues.grossAmount)
                              || (specialEventFormValues.eventType === 'expense' && !specialEventFormValues.expenseAmount)
                            }
                          >
                            {specialEventFormValues.eventType === 'inheritance' ? '💰 Erbschaft hinzufügen' : '💸 Ausgabe hinzufügen'}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            <EventsList
              sparplans={currentSparplans}
              onDelete={handleDeleteSparplan}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
