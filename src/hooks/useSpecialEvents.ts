import { useState } from 'react'
import { toast } from 'sonner'
import type { Sparplan } from '../utils/sparplan-utils'
import { calculateInheritanceTax } from '../../helpers/inheritance-tax'
import { getDefaultCreditTerms } from '../../helpers/credit-calculation'
import { calculateCareCostsForYear } from '../../helpers/care-cost-simulation'
import { calculateBusinessSaleTax } from '../../helpers/business-sale'
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
  // Care cost default values
  careLevel: 2,
  customMonthlyCosts: '',
  careDurationYears: '',
  careInflationRate: '3',
  // Business sale default values
  businessSalePrice: '',
  businessBookValue: '',
  sellerAge: '',
  permanentlyDisabled: false,
  businessSaleOtherIncome: '',
  applyFifthRule: true,
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
    const interestRate = formValues.interestRate ? Number(formValues.interestRate) / 100 : defaultTerms.interestRate
    const termYears = formValues.termYears ? Number(formValues.termYears) : defaultTerms.termYears

    creditTerms = {
      interestRate,
      termYears,
      monthlyPayment:
        interestRate === 0
          ? expenseAmount / (termYears * 12)
          : (expenseAmount * (interestRate / 12) * Math.pow(1 + interestRate / 12, termYears * 12)) /
            (Math.pow(1 + interestRate / 12, termYears * 12) - 1),
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

function createCareCostSparplan(formValues: EventFormValues, nextId: number): Sparplan {
  const careLevel = formValues.careLevel
  const customMonthlyCosts = formValues.customMonthlyCosts ? Number(formValues.customMonthlyCosts) : undefined
  const careDurationYears = formValues.careDurationYears ? Number(formValues.careDurationYears) : 0
  const careInflationRate = formValues.careInflationRate ? Number(formValues.careInflationRate) : 3

  // Calculate first year costs to use as the initial deduction
  const firstYearResult = calculateCareCostsForYear(
    {
      enabled: true,
      startYear: formValues.date.getFullYear(),
      careLevel,
      customMonthlyCosts,
      careInflationRate,
      includeStatutoryBenefits: true,
      privateCareInsuranceMonthlyBenefit: 0,
      careDurationYears,
      planningMode: 'individual',
      taxDeductible: true,
      maxAnnualTaxDeduction: 20000,
    },
    formValues.date.getFullYear(),
  )

  return {
    id: nextId,
    start: formValues.date,
    end: formValues.date,
    einzahlung: -firstYearResult.annualCostsNet, // Negative amount represents costs
    eventType: 'care_costs',
    specialEventData: {
      careLevel,
      customMonthlyCosts,
      careDurationYears,
      careInflationRate,
      description: formValues.description,
      phase: formValues.phase,
    },
  }
}

function createBusinessSaleSparplan(formValues: EventFormValues, nextId: number): Sparplan {
  const salePrice = Number(formValues.businessSalePrice)
  const bookValue = Number(formValues.businessBookValue)
  const sellerAge = Number(formValues.sellerAge)
  const otherIncome = formValues.businessSaleOtherIncome ? Number(formValues.businessSaleOtherIncome) : 0

  const taxCalc = calculateBusinessSaleTax({
    salePrice,
    bookValue,
    sellerAge,
    permanentlyDisabled: formValues.permanentlyDisabled,
    otherIncome,
    applyFifthRule: formValues.applyFifthRule,
  })

  return {
    id: nextId,
    start: formValues.date,
    end: formValues.date,
    einzahlung: taxCalc.netProceeds,
    eventType: 'business_sale',
    specialEventData: {
      businessSalePrice: salePrice,
      businessBookValue: bookValue,
      sellerAge,
      permanentlyDisabled: formValues.permanentlyDisabled,
      businessSaleOtherIncome: otherIncome,
      applyFifthRule: formValues.applyFifthRule,
      description: formValues.description,
      phase: formValues.phase,
    },
  }
}

function isInheritanceValid(formValues: EventFormValues): boolean {
  return Boolean(formValues.grossAmount)
}

function isExpenseValid(formValues: EventFormValues): boolean {
  return Boolean(formValues.expenseAmount)
}

function isBusinessSaleValid(formValues: EventFormValues): boolean {
  return Boolean(
    formValues.businessSalePrice && formValues.businessBookValue && formValues.sellerAge,
  )
}

function createEventSparplan(
  formValues: EventFormValues,
  nextId: number,
): { sparplan: Sparplan; message: string } | null {
  const { eventType } = formValues

  switch (eventType) {
    case 'inheritance':
      if (!isInheritanceValid(formValues)) return null
      return {
        sparplan: createInheritanceSparplan(formValues, nextId),
        message: 'Erbschaft erfolgreich hinzugefügt!',
      }

    case 'expense':
      if (!isExpenseValid(formValues)) return null
      return {
        sparplan: createExpenseSparplan(formValues, nextId),
        message: 'Ausgabe erfolgreich hinzugefügt!',
      }

    case 'care_costs':
      return {
        sparplan: createCareCostSparplan(formValues, nextId),
        message: 'Pflegekosten erfolgreich hinzugefügt!',
      }

    case 'business_sale':
      if (!isBusinessSaleValid(formValues)) return null
      return {
        sparplan: createBusinessSaleSparplan(formValues, nextId),
        message: 'Unternehmensverkauf erfolgreich hinzugefügt!',
      }

    default:
      return null
  }
}

export function useSpecialEvents(currentSparplans: Sparplan[], dispatch: (val: Sparplan[]) => void) {
  const [specialEventFormValues, setSpecialEventFormValues] = useState<EventFormValues>(INITIAL_FORM_VALUES)

  const getNextSparplanId = () => Math.max(0, ...currentSparplans.map(p => p.id)) + 1

  const handleSubmit = () => {
    const nextId = getNextSparplanId()
    const result = createEventSparplan(specialEventFormValues, nextId)

    if (result) {
      dispatch([...currentSparplans, result.sparplan])
      toast.success(result.message)
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
