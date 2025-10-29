import { useState } from 'react'
import { toast } from 'sonner'
import type { Sparplan } from '../utils/sparplan-utils'
import { calculateInheritanceTax } from '../../helpers/inheritance-tax'
import { getDefaultCreditTerms } from '../../helpers/credit-calculation'
import type { EventFormValues } from '../components/special-events/EventFormFields'

const INITIAL_FORM_VALUES: EventFormValues = {
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
}

function createInheritanceSparplan(formValues: EventFormValues, nextId: number): Sparplan {
  const grossAmount = Number(formValues.grossAmount)
  const taxCalc = calculateInheritanceTax(grossAmount, formValues.relationshipType)

  return {
    id: nextId,
    start: formValues.date,
    end: formValues.date,
    einzahlung: taxCalc.netAmount,
    eventType: 'inheritance',
    specialEventData: {
      relationshipType: formValues.relationshipType,
      grossInheritanceAmount: grossAmount,
      description: formValues.description,
      phase: formValues.phase,
    },
  }
}

function createExpenseSparplan(formValues: EventFormValues, nextId: number): Sparplan {
  const expenseAmount = Number(formValues.expenseAmount)
  let creditTerms = undefined

  if (formValues.useCredit) {
    const defaultTerms = getDefaultCreditTerms(formValues.expenseType, expenseAmount)
    const interestRate = formValues.interestRate
      ? Number(formValues.interestRate) / 100
      : defaultTerms.interestRate
    const termYears = formValues.termYears
      ? Number(formValues.termYears)
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

  return {
    id: nextId,
    start: formValues.date,
    end: formValues.date,
    einzahlung: -expenseAmount,
    eventType: 'expense',
    specialEventData: {
      expenseType: formValues.expenseType,
      description: formValues.description,
      creditTerms,
      phase: formValues.phase,
    },
  }
}

export function useSpecialEvents(currentSparplans: Sparplan[], dispatch: (val: Sparplan[]) => void) {
  const [specialEventFormValues, setSpecialEventFormValues] = useState<EventFormValues>(INITIAL_FORM_VALUES)

  const getNextSparplanId = () => Math.max(0, ...currentSparplans.map(p => p.id)) + 1

  const handleSubmit = () => {
    const nextId = getNextSparplanId()
    let newSparplan: Sparplan | undefined

    if (specialEventFormValues.eventType === 'inheritance' && specialEventFormValues.grossAmount) {
      newSparplan = createInheritanceSparplan(specialEventFormValues, nextId)
      toast.success('Erbschaft erfolgreich hinzugefügt!')
    }
    else if (specialEventFormValues.eventType === 'expense' && specialEventFormValues.expenseAmount) {
      newSparplan = createExpenseSparplan(specialEventFormValues, nextId)
      toast.success('Ausgabe erfolgreich hinzugefügt!')
    }

    if (newSparplan) {
      dispatch([...currentSparplans, newSparplan])
      setSpecialEventFormValues(INITIAL_FORM_VALUES)
    }
  }

  const handleDeleteSparplan = (id: number) => {
    const filtered = currentSparplans.filter(sparplan => sparplan.id !== id)
    dispatch(filtered)
    toast.info('Eintrag gelöscht')
  }

  return {
    specialEventFormValues,
    setSpecialEventFormValues,
    handleSubmit,
    handleDeleteSparplan,
  }
}
