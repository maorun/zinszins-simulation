import type { SimulationAnnualType } from '../utils/simulate'
import { SimulationAnnual } from '../utils/simulate'
import type { Sparplan, RelationshipType, ExpenseType, SpecialEventData } from '../utils/sparplan-utils'
import { initialSparplan } from '../utils/sparplan-utils'
import { getRelationshipTypeLabel, getExpenseTypeLabel, calculateInheritanceTax } from '../../helpers/inheritance-tax'
import { getDefaultCreditTerms } from '../../helpers/credit-calculation'
import React, { useState, useEffect } from 'react'

// Simple Close icon component using modern Lucide React icons
const CloseIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

// Helper icon for form help
const InfoIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginLeft: '0.25rem', opacity: 0.6 }}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9,9h0a3,3,0,0,1,6,0c0,2-3,3-3,3"></path>
    <path d="M12,17h.01"></path>
  </svg>
)

// Import Button directly from shadcn/ui
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown, Edit2 } from 'lucide-react'

// Temporary imports - only keep what's needed
// No more temp imports needed!

// Import shadcn/ui components for form elements
import { Label } from './ui/label'
import { Input } from './ui/input'
import { toast } from 'sonner'

// Helper functions for date formatting and handling
const formatDateForInput = (date: Date | string | null, format: string): string => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  if (format === 'yyyy-MM') {
    return d.toISOString().substring(0, 7) // YYYY-MM
  }
  return d.toISOString().substring(0, 10) // YYYY-MM-DD (default)
}

const handleDateChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  format: string,
  onChange: (date: Date | null) => void,
) => {
  const inputValue = e.target.value
  if (!inputValue) {
    onChange(null)
    return
  }

  // Create date from input value
  const date = new Date(inputValue + (format === 'yyyy-MM' ? '-01' : ''))
  if (!isNaN(date.getTime())) {
    onChange(date)
  }
}

// Helper function for number input handling
const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
  const value = e.target.value
  onChange(value ? value : '')
}

export function SparplanEingabe({
  dispatch,
  simulationAnnual,
  currentSparplans = [initialSparplan],
}: {
  dispatch: (val: Sparplan[]) => void
  simulationAnnual: SimulationAnnualType
  currentSparplans?: Sparplan[]
}) {
  const [sparplans, setSparplans] = useState<Sparplan[]>(currentSparplans)

  // Edit state management
  const [editingSparplan, setEditingSparplan] = useState<Sparplan | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  // Collapsible section state management
  const [isSparplanFormOpen, setIsSparplanFormOpen] = useState(false)
  const [isSingleFormOpen, setIsSingleFormOpen] = useState(false)
  const [isSpecialEventFormOpen, setIsSpecialEventFormOpen] = useState(false)

  // Synchronize local state with prop changes
  useEffect(() => {
    setSparplans(currentSparplans)
  }, [currentSparplans])

  const [singleFormValue, setSingleFormValue] = useState<{
    date: Date
    einzahlung: string
    ter: string
    transactionCostPercent: string
    transactionCostAbsolute: string
  }>({
    date: new Date(),
    einzahlung: '',
    ter: '',
    transactionCostPercent: '',
    transactionCostAbsolute: '',
  })
  const [sparplanFormValues, setSparplanFormValues] = useState<{
    start: Date
    end: Date | null
    einzahlung: string
    ter: string
    transactionCostPercent: string
    transactionCostAbsolute: string
  }>({
    start: new Date(),
    end: null,
    einzahlung: '',
    ter: '',
    transactionCostPercent: '',
    transactionCostAbsolute: '',
  })

  // Special events form state
  const [specialEventFormValues, setSpecialEventFormValues] = useState<{
    date: Date
    eventType: 'inheritance' | 'expense'
    amount: string
    description: string
    // Inheritance specific
    relationshipType: RelationshipType
    grossAmount: string
    // Expense specific
    expenseType: ExpenseType
    useCredit: boolean
    interestRate: string
    termYears: string
    ter: string
    transactionCostPercent: string
    transactionCostAbsolute: string
  }>({
    date: new Date(),
    eventType: 'inheritance',
    amount: '',
    description: '',
    relationshipType: 'child',
    grossAmount: '',
    expenseType: 'car',
    useCredit: false,
    interestRate: '4.5',
    termYears: '5',
    ter: '',
    transactionCostPercent: '',
    transactionCostAbsolute: '',
  })

  const handleSparplanSubmit = () => {
    if (sparplanFormValues.start && sparplanFormValues.einzahlung && sparplanFormValues.einzahlung) {
      if (isEditMode) {
        // In edit mode, call save edit
        handleSaveEdit()
      }
      else {
        // In create mode, add new sparplan
        // Convert monthly input to yearly for storage (backend always expects yearly amounts)
        const yearlyAmount = simulationAnnual === SimulationAnnual.monthly
          ? Number(sparplanFormValues.einzahlung) * 12
          : Number(sparplanFormValues.einzahlung)

        const changedSparplans: Sparplan[] = [
          ...sparplans,
          {
            id: new Date().getTime(),
            start: sparplanFormValues.start,
            end: sparplanFormValues.end,
            einzahlung: yearlyAmount,
            ter: sparplanFormValues.ter ? Number(sparplanFormValues.ter) : undefined,
            transactionCostPercent: sparplanFormValues.transactionCostPercent
              ? Number(sparplanFormValues.transactionCostPercent) : undefined,
            transactionCostAbsolute: sparplanFormValues.transactionCostAbsolute
              ? Number(sparplanFormValues.transactionCostAbsolute) : undefined,
          },
        ]
        setSparplans(changedSparplans)
        dispatch(changedSparplans)
        setSparplanFormValues({
          start: new Date(),
          end: null,
          einzahlung: '',
          ter: '',
          transactionCostPercent: '',
          transactionCostAbsolute: '',
        })

        toast.success('Sparplan erfolgreich hinzugefügt!')
      }
    }
  }

  const handleSinglePaymentSubmit = () => {
    if (singleFormValue.einzahlung) {
      if (isEditMode) {
        // In edit mode, call save edit
        handleSaveEdit()
      }
      else {
        // In create mode, add new single payment
        const changedSparplans: Sparplan[] = [
          ...sparplans,
          {
            id: new Date().getTime(),
            start: singleFormValue.date,
            end: singleFormValue.date,
            einzahlung: Number(singleFormValue.einzahlung),
            ter: singleFormValue.ter ? Number(singleFormValue.ter) : undefined,
            transactionCostPercent: singleFormValue.transactionCostPercent
              ? Number(singleFormValue.transactionCostPercent) : undefined,
            transactionCostAbsolute: singleFormValue.transactionCostAbsolute
              ? Number(singleFormValue.transactionCostAbsolute) : undefined,
          },
        ]
        setSparplans(changedSparplans)
        dispatch(changedSparplans)
        setSingleFormValue({
          date: new Date(),
          einzahlung: '',
          ter: '',
          transactionCostPercent: '',
          transactionCostAbsolute: '',
        })

        toast.success('Einmalzahlung erfolgreich hinzugefügt!')
      }
    }
  }

  const handleDeleteSparplan = (id: number) => {
    const changedSparplans = sparplans.filter(el => el.id !== id)
    setSparplans(changedSparplans)
    dispatch(changedSparplans)

    toast.info('Sparplan entfernt')
  }

  const handleSpecialEventSubmit = () => {
    if (specialEventFormValues.date && specialEventFormValues.amount) {
      let finalAmount = Number(specialEventFormValues.amount)
      let eventData: SpecialEventData = {
        description: specialEventFormValues.description,
        taxRelevant: true,
      }

      if (specialEventFormValues.eventType === 'inheritance') {
        // Calculate inheritance tax
        const grossAmount = Number(specialEventFormValues.grossAmount || specialEventFormValues.amount)
        const taxCalculation = calculateInheritanceTax(grossAmount, specialEventFormValues.relationshipType)
        
        finalAmount = taxCalculation.netAmount
        eventData = {
          ...eventData,
          relationshipType: specialEventFormValues.relationshipType,
          grossInheritanceAmount: grossAmount,
        }
      }
      else if (specialEventFormValues.eventType === 'expense') {
        // Handle expense event - negative amount
        finalAmount = -Math.abs(finalAmount)
        eventData = {
          ...eventData,
          expenseType: specialEventFormValues.expenseType,
        }

        if (specialEventFormValues.useCredit) {
          eventData.creditTerms = {
            interestRate: Number(specialEventFormValues.interestRate) / 100,
            termYears: Number(specialEventFormValues.termYears),
            monthlyPayment: getDefaultCreditTerms(
              specialEventFormValues.expenseType,
              Math.abs(finalAmount),
            ).monthlyPayment,
          }
        }
      }

      const newSparplan: Sparplan = {
        id: Math.max(...sparplans.map(s => s.id), 0) + 1,
        start: specialEventFormValues.date,
        end: specialEventFormValues.date, // Special events are one-time
        einzahlung: finalAmount,
        eventType: specialEventFormValues.eventType,
        specialEventData: eventData,
        ter: specialEventFormValues.ter ? Number(specialEventFormValues.ter) : undefined,
        transactionCostPercent: specialEventFormValues.transactionCostPercent
          ? Number(specialEventFormValues.transactionCostPercent) : undefined,
        transactionCostAbsolute: specialEventFormValues.transactionCostAbsolute
          ? Number(specialEventFormValues.transactionCostAbsolute) : undefined,
      }

      const changedSparplans = [...sparplans, newSparplan]
      setSparplans(changedSparplans)
      dispatch(changedSparplans)

      // Reset form
      setSpecialEventFormValues({
        date: new Date(),
        eventType: 'inheritance',
        amount: '',
        description: '',
        relationshipType: 'child',
        grossAmount: '',
        expenseType: 'car',
        useCredit: false,
        interestRate: '4.5',
        termYears: '5',
        ter: '',
        transactionCostPercent: '',
        transactionCostAbsolute: '',
      })

      const eventTypeName = specialEventFormValues.eventType === 'inheritance' ? 'Erbschaft' : 'Ausgabe'
      toast.success(`${eventTypeName} erfolgreich hinzugefügt!`)
    }
  }

  // Edit handlers
  const handleEditSparplan = (sparplan: Sparplan) => {
    setEditingSparplan(sparplan)
    setIsEditMode(true)

    // Check if this is a one-time payment
    const isEinmalzahlung = sparplan.end
      && new Date(sparplan.start).getTime() === new Date(sparplan.end).getTime()

    if (isEinmalzahlung) {
      // Pre-fill single payment form
      setSingleFormValue({
        date: new Date(sparplan.start),
        einzahlung: sparplan.einzahlung.toString(),
        ter: sparplan.ter?.toString() || '',
        transactionCostPercent: sparplan.transactionCostPercent?.toString() || '',
        transactionCostAbsolute: sparplan.transactionCostAbsolute?.toString() || '',
      })
      // NO auto-expansion for better mobile UX - inline editing instead
    }
    else {
      // Pre-fill savings plan form
      // Convert yearly amount to display format based on simulation mode
      const displayAmount = simulationAnnual === SimulationAnnual.monthly && !isEinmalzahlung
        ? (sparplan.einzahlung / 12).toString()
        : sparplan.einzahlung.toString()

      setSparplanFormValues({
        start: new Date(sparplan.start),
        end: sparplan.end ? new Date(sparplan.end) : null,
        einzahlung: displayAmount,
        ter: sparplan.ter?.toString() || '',
        transactionCostPercent: sparplan.transactionCostPercent?.toString() || '',
        transactionCostAbsolute: sparplan.transactionCostAbsolute?.toString() || '',
      })
      // NO auto-expansion for better mobile UX - inline editing instead
    }
  }

  const handleSaveEdit = () => {
    if (!editingSparplan) return

    // Check if this is a one-time payment
    const isEinmalzahlung = editingSparplan.end
      && new Date(editingSparplan.start).getTime() === new Date(editingSparplan.end).getTime()

    let updatedSparplan: Sparplan

    if (isEinmalzahlung) {
      // Update with single payment form values
      updatedSparplan = {
        ...editingSparplan,
        start: singleFormValue.date,
        end: singleFormValue.date,
        einzahlung: Number(singleFormValue.einzahlung),
        ter: singleFormValue.ter ? Number(singleFormValue.ter) : undefined,
        transactionCostPercent: singleFormValue.transactionCostPercent
          ? Number(singleFormValue.transactionCostPercent) : undefined,
        transactionCostAbsolute: singleFormValue.transactionCostAbsolute
          ? Number(singleFormValue.transactionCostAbsolute) : undefined,
      }
    }
    else {
      // Update with savings plan form values
      // Convert monthly input to yearly for storage (backend always expects yearly amounts)
      const yearlyAmount = simulationAnnual === SimulationAnnual.monthly
        ? Number(sparplanFormValues.einzahlung) * 12
        : Number(sparplanFormValues.einzahlung)

      updatedSparplan = {
        ...editingSparplan,
        start: sparplanFormValues.start,
        end: sparplanFormValues.end,
        einzahlung: yearlyAmount,
        ter: sparplanFormValues.ter ? Number(sparplanFormValues.ter) : undefined,
        transactionCostPercent: sparplanFormValues.transactionCostPercent
          ? Number(sparplanFormValues.transactionCostPercent) : undefined,
        transactionCostAbsolute: sparplanFormValues.transactionCostAbsolute
          ? Number(sparplanFormValues.transactionCostAbsolute) : undefined,
      }
    }

    // Update the sparplans array
    const changedSparplans = sparplans.map(sp =>
      sp.id === editingSparplan.id ? updatedSparplan : sp,
    )

    setSparplans(changedSparplans)
    dispatch(changedSparplans)

    // Reset edit state
    setEditingSparplan(null)
    setIsEditMode(false)

    // Reset forms
    setSparplanFormValues({
      start: new Date(),
      end: null,
      einzahlung: '',
      ter: '',
      transactionCostPercent: '',
      transactionCostAbsolute: '',
    })
    setSingleFormValue({
      date: new Date(),
      einzahlung: '',
      ter: '',
      transactionCostPercent: '',
      transactionCostAbsolute: '',
    })

    // Close the expanded form sections - removed for better mobile UX
    // setIsSparplanFormOpen(false)
    // setIsSingleFormOpen(false)

    const itemType = isEinmalzahlung ? 'Einmalzahlung' : 'Sparplan'
    toast.success(`${itemType} erfolgreich aktualisiert!`)
  }

  const handleCancelEdit = () => {
    setEditingSparplan(null)
    setIsEditMode(false)

    // Reset forms
    setSparplanFormValues({
      start: new Date(),
      end: null,
      einzahlung: '',
      ter: '',
      transactionCostPercent: '',
      transactionCostAbsolute: '',
    })
    setSingleFormValue({
      date: new Date(),
      einzahlung: '',
      ter: '',
      transactionCostPercent: '',
      transactionCostAbsolute: '',
    })

    // Close the expanded form sections - removed for better mobile UX
    // setIsSparplanFormOpen(false)
    // setIsSingleFormOpen(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Card className="mb-6">
        <Collapsible open={isSparplanFormOpen} onOpenChange={setIsSparplanFormOpen}>
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
                  handleSparplanSubmit()
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="mb-4 space-y-2">
                    <Label>
                      Start
                      <InfoIcon />
                    </Label>
                    <Input
                      type="month"
                      value={formatDateForInput(sparplanFormValues.start, 'yyyy-MM')}
                      onChange={e => handleDateChange(e, 'yyyy-MM', (date) => {
                        if (date) setSparplanFormValues({ ...sparplanFormValues, start: date })
                      })}
                      placeholder="Startdatum wählen"
                      className="w-full"
                    />
                  </div>
                  <div className="mb-4 space-y-2">
                    <Label>
                      Ende (optional)
                      <InfoIcon />
                    </Label>
                    <Input
                      type="month"
                      value={formatDateForInput(sparplanFormValues.end, 'yyyy-MM')}
                      onChange={e => handleDateChange(e, 'yyyy-MM', date => setSparplanFormValues({ ...sparplanFormValues, end: date }))}
                      placeholder="Enddatum wählen"
                      className="w-full"
                    />
                  </div>
                  <div className="mb-4 space-y-2">
                    <Label>
                      {simulationAnnual === SimulationAnnual.yearly ? 'Einzahlungen je Jahr (€)' : 'Einzahlungen je Monat (€)'}
                      <InfoIcon />
                    </Label>
                    <Input
                      type="number"
                      value={sparplanFormValues.einzahlung || ''}
                      onChange={e => handleNumberChange(e, value =>
                        setSparplanFormValues({ ...sparplanFormValues, einzahlung: value }),
                      )}
                      placeholder="Betrag eingeben"
                      className="w-full"
                      min={0}
                      step={simulationAnnual === SimulationAnnual.monthly ? 10 : 100}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                    💰 Kostenfaktoren (optional)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div className="mb-4 space-y-2">
                      <Label>
                        TER (% p.a.)
                        <InfoIcon />
                      </Label>
                      <Input
                        type="number"
                        value={sparplanFormValues.ter || ''}
                        onChange={e => handleNumberChange(e, value =>
                          setSparplanFormValues({ ...sparplanFormValues, ter: value }),
                        )}
                        placeholder="z.B. 0.75"
                        className="w-full"
                        min={0}
                        max={10}
                        step={0.01}
                      />
                      <div className="text-sm text-muted-foreground mt-1">Total Expense Ratio in % pro Jahr</div>
                    </div>
                    <div className="mb-4 space-y-2">
                      <Label>
                        Transaktionskosten (%)
                        <InfoIcon />
                      </Label>
                      <Input
                        type="number"
                        value={sparplanFormValues.transactionCostPercent || ''}
                        onChange={e => handleNumberChange(e, value =>
                          setSparplanFormValues({ ...sparplanFormValues, transactionCostPercent: value }),
                        )}
                        placeholder="z.B. 0.25"
                        className="w-full"
                        min={0}
                        max={5}
                        step={0.01}
                      />
                      <div className="text-sm text-muted-foreground mt-1">Prozentuale Transaktionskosten</div>
                    </div>
                    <div className="mb-4 space-y-2">
                      <Label>
                        Transaktionskosten (€)
                        <InfoIcon />
                      </Label>
                      <Input
                        type="number"
                        value={sparplanFormValues.transactionCostAbsolute || ''}
                        onChange={e => handleNumberChange(e, value =>
                          setSparplanFormValues({ ...sparplanFormValues, transactionCostAbsolute: value }),
                        )}
                        placeholder="z.B. 1.50"
                        className="w-full"
                        min={0}
                        max={100}
                        step={0.01}
                      />
                      <div className="text-sm text-muted-foreground mt-1">Absolute Transaktionskosten in Euro</div>
                    </div>
                  </div>
                </div>
                <div className="mb-4 space-y-2">
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      type="submit"
                      size="lg"
                      disabled={!sparplanFormValues.start || !sparplanFormValues.einzahlung}
                    >
                      {isEditMode && editingSparplan
                        && !(editingSparplan.end
                          && new Date(editingSparplan.start).getTime() === new Date(editingSparplan.end).getTime())
                        ? '✏️ Sparplan aktualisieren'
                        : '💾 Sparplan hinzufügen'}
                    </Button>
                    {isEditMode && editingSparplan
                      && !(editingSparplan.end
                        && new Date(editingSparplan.start).getTime() === new Date(editingSparplan.end).getTime()) && (
                      <Button
                        onClick={handleCancelEdit}
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

      <Card className="mb-6">
        <Collapsible open={isSingleFormOpen} onOpenChange={setIsSingleFormOpen}>
          <CardHeader className="pb-4">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
                <CardTitle className="text-left text-lg">💵 Einmalzahlungen erstellen</CardTitle>
                <ChevronDown className="h-5 w-5 text-gray-500" />
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
                Fügen Sie einmalige Zahlungen zu einem bestimmten Zeitpunkt hinzu
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSinglePaymentSubmit()
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="mb-4 space-y-2">
                    <Label>
                      Datum
                      <InfoIcon />
                    </Label>
                    <Input
                      type="date"
                      value={formatDateForInput(singleFormValue.date, 'yyyy-MM-dd')}
                      onChange={e => handleDateChange(e, 'yyyy-MM-dd', date => setSingleFormValue({ ...singleFormValue, date: date! }))}
                      placeholder="Datum wählen"
                      className="w-full"
                    />
                  </div>
                  <div className="mb-4 space-y-2">
                    <Label>
                      Einzahlung (€)
                      <InfoIcon />
                    </Label>
                    <Input
                      type="number"
                      value={singleFormValue.einzahlung || ''}
                      onChange={e => handleNumberChange(e, value =>
                        setSingleFormValue({ ...singleFormValue, einzahlung: value }),
                      )}
                      placeholder="Betrag eingeben"
                      className="w-full"
                      min={0}
                      step={100}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                    💰 Kostenfaktoren (optional)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div className="mb-4 space-y-2">
                      <Label>
                        TER (% p.a.)
                        <InfoIcon />
                      </Label>
                      <Input
                        type="number"
                        value={singleFormValue.ter || ''}
                        onChange={e => handleNumberChange(e, value =>
                          setSingleFormValue({ ...singleFormValue, ter: value }),
                        )}
                        placeholder="z.B. 0.75"
                        className="w-full"
                        min={0}
                        max={10}
                        step={0.01}
                      />
                      <div className="text-sm text-muted-foreground mt-1">Total Expense Ratio in % pro Jahr</div>
                    </div>
                    <div className="mb-4 space-y-2">
                      <Label>
                        Transaktionskosten (%)
                        <InfoIcon />
                      </Label>
                      <Input
                        type="number"
                        value={singleFormValue.transactionCostPercent || ''}
                        onChange={e => handleNumberChange(e, value =>
                          setSingleFormValue({ ...singleFormValue, transactionCostPercent: value }),
                        )}
                        placeholder="z.B. 0.25"
                        className="w-full"
                        min={0}
                        max={5}
                        step={0.01}
                      />
                      <div className="text-sm text-muted-foreground mt-1">Prozentuale Transaktionskosten</div>
                    </div>
                    <div className="mb-4 space-y-2">
                      <Label>
                        Transaktionskosten (€)
                        <InfoIcon />
                      </Label>
                      <Input
                        type="number"
                        value={singleFormValue.transactionCostAbsolute || ''}
                        onChange={e => handleNumberChange(e, value =>
                          setSingleFormValue({ ...singleFormValue, transactionCostAbsolute: value }),
                        )}
                        placeholder="z.B. 1.50"
                        className="w-full"
                        min={0}
                        max={100}
                        step={0.01}
                      />
                      <div className="text-sm text-muted-foreground mt-1">Absolute Transaktionskosten in Euro</div>
                    </div>
                  </div>
                </div>
                <div className="mb-4 space-y-2">
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      type="submit"
                      size="lg"
                      disabled={!singleFormValue.einzahlung}
                    >
                      {isEditMode && editingSparplan && editingSparplan.end
                        && new Date(editingSparplan.start).getTime() === new Date(editingSparplan.end).getTime()
                        ? '✏️ Einmalzahlung aktualisieren'
                        : '💰 Einmalzahlung hinzufügen'}
                    </Button>
                    {isEditMode && editingSparplan && editingSparplan.end
                      && new Date(editingSparplan.start).getTime() === new Date(editingSparplan.end).getTime() && (
                      <Button
                        onClick={handleCancelEdit}
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

      <Card className="mb-6">
        <Collapsible open={isSpecialEventFormOpen} onOpenChange={setIsSpecialEventFormOpen}>
          <CardHeader className="pb-4">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
                <CardTitle className="text-left text-lg">🎯 Sonderereignisse erstellen</CardTitle>
                <ChevronDown className="h-5 w-5 text-gray-500" />
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
                Erstellen Sie besondere Ereignisse wie Erbschaften oder größere Ausgaben
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSpecialEventSubmit()
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="mb-4 space-y-2">
                    <Label>
                      Datum
                      <InfoIcon />
                    </Label>
                    <Input
                      type="date"
                      value={formatDateForInput(specialEventFormValues.date, 'yyyy-MM-dd')}
                      onChange={e => handleDateChange(e, 'yyyy-MM-dd', date => 
                        setSpecialEventFormValues({ ...specialEventFormValues, date: date! }))}
                      placeholder="Datum wählen"
                      className="w-full"
                    />
                  </div>
                  <div className="mb-4 space-y-2">
                    <Label>
                      Ereignistyp
                      <InfoIcon />
                    </Label>
                    <select
                      value={specialEventFormValues.eventType}
                      onChange={e => setSpecialEventFormValues({ 
                        ...specialEventFormValues, 
                        eventType: e.target.value as 'inheritance' | 'expense' 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="inheritance">💰 Erbschaft</option>
                      <option value="expense">💸 Ausgabe</option>
                    </select>
                  </div>
                </div>

                {specialEventFormValues.eventType === 'inheritance' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div className="mb-4 space-y-2">
                        <Label>
                          Verwandtschaftsgrad
                          <InfoIcon />
                        </Label>
                        <select
                          value={specialEventFormValues.relationshipType}
                          onChange={e => setSpecialEventFormValues({ 
                            ...specialEventFormValues, 
                            relationshipType: e.target.value as RelationshipType 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="spouse">Ehegatte/Ehegattin (€500.000 Freibetrag)</option>
                          <option value="child">Kind/Stiefkind (€400.000 Freibetrag)</option>
                          <option value="grandchild">Enkelkind (€200.000 Freibetrag)</option>
                          <option value="parent_from_descendant">Eltern v. Nachkommen (€100.000 Freibetrag)</option>
                          <option value="parent_other">Eltern sonstige (€20.000 Freibetrag)</option>
                          <option value="sibling">Geschwister (€20.000 Freibetrag)</option>
                          <option value="other">Sonstige/Nicht verwandt (€20.000 Freibetrag)</option>
                        </select>
                      </div>
                      <div className="mb-4 space-y-2">
                        <Label>
                          Brutto-Erbschaft (€)
                          <InfoIcon />
                        </Label>
                        <Input
                          type="number"
                          value={specialEventFormValues.grossAmount || ''}
                          onChange={e => setSpecialEventFormValues({ 
                            ...specialEventFormValues, 
                            grossAmount: e.target.value,
                            amount: e.target.value // Auto-sync with amount field
                          })}
                          placeholder="z.B. 100000"
                          className="w-full"
                          min={0}
                          step={1}
                        />
                        <div className="text-sm text-muted-foreground mt-1">
                          Bruttobetrag vor Erbschaftsteuer
                        </div>
                      </div>
                    </div>
                    {specialEventFormValues.grossAmount && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="text-sm font-semibold text-green-800 mb-2">💡 Steuerberechnung:</div>
                        {(() => {
                          const grossAmount = Number(specialEventFormValues.grossAmount)
                          if (grossAmount > 0) {
                            const calc = calculateInheritanceTax(grossAmount, specialEventFormValues.relationshipType)
                            return (
                              <div className="text-sm text-green-700 space-y-1">
                                <div>Brutto-Erbschaft: {grossAmount.toLocaleString('de-DE')} €</div>
                                <div>Freibetrag: {calc.exemption.toLocaleString('de-DE')} €</div>
                                <div>Erbschaftsteuer: {calc.tax.toLocaleString('de-DE')} €</div>
                                <div className="font-semibold">Netto-Erbschaft: {calc.netAmount.toLocaleString('de-DE')} €</div>
                              </div>
                            )
                          }
                          return null
                        })()}
                      </div>
                    )}
                  </>
                )}

                {specialEventFormValues.eventType === 'expense' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div className="mb-4 space-y-2">
                        <Label>
                          Ausgabentyp
                          <InfoIcon />
                        </Label>
                        <select
                          value={specialEventFormValues.expenseType}
                          onChange={e => setSpecialEventFormValues({ 
                            ...specialEventFormValues, 
                            expenseType: e.target.value as ExpenseType 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="car">🚗 Autokauf</option>
                          <option value="real_estate">🏠 Immobilienkauf</option>
                          <option value="education">🎓 Bildungsausgaben</option>
                          <option value="medical">🏥 Medizinische Ausgaben</option>
                          <option value="other">💰 Sonstige Ausgaben</option>
                        </select>
                      </div>
                      <div className="mb-4 space-y-2">
                        <Label>
                          Ausgabenbetrag (€)
                          <InfoIcon />
                        </Label>
                        <Input
                          type="number"
                          value={specialEventFormValues.amount || ''}
                          onChange={e => setSpecialEventFormValues({ 
                            ...specialEventFormValues, 
                            amount: e.target.value 
                          })}
                          placeholder="z.B. 25000"
                          className="w-full"
                          min={0}
                          step={1}
                        />
                      </div>
                    </div>

                    <div className="mb-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="useCredit"
                          checked={specialEventFormValues.useCredit}
                          onChange={e => setSpecialEventFormValues({ 
                            ...specialEventFormValues, 
                            useCredit: e.target.checked 
                          })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <Label htmlFor="useCredit" className="text-sm font-medium">
                          💳 Mit Kredit finanzieren
                        </Label>
                      </div>
                    </div>

                    {specialEventFormValues.useCredit && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="mb-4 space-y-2">
                          <Label>
                            Zinssatz (% p.a.)
                            <InfoIcon />
                          </Label>
                          <Input
                            type="number"
                            value={specialEventFormValues.interestRate || ''}
                            onChange={e => setSpecialEventFormValues({ 
                              ...specialEventFormValues, 
                              interestRate: e.target.value 
                            })}
                            placeholder="z.B. 4.5"
                            className="w-full"
                            min={0}
                            max={20}
                            step={0.1}
                          />
                        </div>
                        <div className="mb-4 space-y-2">
                          <Label>
                            Laufzeit (Jahre)
                            <InfoIcon />
                          </Label>
                          <Input
                            type="number"
                            value={specialEventFormValues.termYears || ''}
                            onChange={e => setSpecialEventFormValues({ 
                              ...specialEventFormValues, 
                              termYears: e.target.value 
                            })}
                            placeholder="z.B. 5"
                            className="w-full"
                            min={1}
                            max={30}
                            step={1}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="mb-4 space-y-2">
                  <Label>
                    Beschreibung (optional)
                    <InfoIcon />
                  </Label>
                  <Input
                    type="text"
                    value={specialEventFormValues.description || ''}
                    onChange={e => setSpecialEventFormValues({ 
                      ...specialEventFormValues, 
                      description: e.target.value 
                    })}
                    placeholder="z.B. Erbschaft Großeltern, Neuwagenkauf"
                    className="w-full"
                  />
                </div>

                <div className="mb-4 space-y-2">
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      type="submit"
                      size="lg"
                      disabled={!specialEventFormValues.amount}
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

      <Card className="mb-6">
        <Collapsible defaultOpen={true}>
          <CardHeader className="pb-4">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
                <CardTitle className="text-left text-lg">📋 Gespeicherte Sparpläne, Einmalzahlungen & Sonderereignisse</CardTitle>
                <ChevronDown className="h-5 w-5 text-gray-500" />
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div style={{
                padding: '1rem 1.5rem 0.5rem', color: '#666', fontSize: '0.9rem',
                borderBottom: '1px solid #f0f0f0',
              }}
              >
                Ihre konfigurierten Sparpläne, Einmalzahlungen und Sonderereignisse
              </div>

              {/* Card Layout for All Devices */}
              <div style={{ padding: '1rem' }}>
                <div className="grid gap-4">
                  {sparplans.map((sparplan) => {
                    // Detect if this is a one-time payment (start and end dates are the same)
                    const isEinmalzahlung = sparplan.end
                      && new Date(sparplan.start).getTime() === new Date(sparplan.end).getTime()
                    
                    // Detect if this is a special event
                    const isSpecialEvent = sparplan.eventType && sparplan.eventType !== 'normal'
                    const isInheritance = sparplan.eventType === 'inheritance'
                    const isExpense = sparplan.eventType === 'expense'

                    return (
                      <div
                        key={sparplan.id}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          isEditMode && editingSparplan?.id === sparplan.id
                            ? 'bg-yellow-50 border-yellow-300 ring-2 ring-yellow-200'
                            : isSpecialEvent
                              ? isInheritance
                                ? 'bg-green-50 border-green-200 hover:bg-green-100'
                                : 'bg-red-50 border-red-200 hover:bg-red-100'
                              : isEinmalzahlung
                                ? 'bg-orange-50 border-orange-200 hover:bg-orange-100'
                                : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                            isSpecialEvent
                              ? isInheritance
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                              : isEinmalzahlung
                                ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                          >
                            {isSpecialEvent
                              ? isInheritance
                                ? '🎯 Erbschaft'
                                : '🎯 Ausgabe'
                              : isEinmalzahlung
                                ? '💰 Einmalzahlung'
                                : '📈 Sparplan'}
                            <span className="text-xs opacity-75">
                              📅
                              {' '}
                              {new Date(sparplan.start).toLocaleDateString('de-DE')}
                            </span>
                          </span>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleEditSparplan(sparplan)}
                              variant="outline"
                              size="sm"
                              title={isEinmalzahlung ? 'Einmalzahlung bearbeiten' : 'Sparplan bearbeiten'}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              disabled={isEditMode}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteSparplan(sparplan.id)}
                              variant="ghost"
                              size="sm"
                              title={isEinmalzahlung ? 'Einmalzahlung löschen' : 'Sparplan löschen'}
                              className="text-red-600 hover:text-red-700"
                              disabled={isEditMode}
                            >
                              <CloseIcon />
                            </Button>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">📅 Start:</span>
                            <span className="text-sm font-semibold text-green-600">
                              {new Date(sparplan.start).toLocaleDateString('de-DE')}
                            </span>
                          </div>
                          {!isEinmalzahlung && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600">🏁 Ende:</span>
                              <span className="text-sm font-semibold text-blue-600">
                                {sparplan.end ? new Date(sparplan.end).toLocaleDateString('de-DE') : 'Unbegrenzt'}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">
                              {isSpecialEvent
                                ? isInheritance
                                  ? '💰 Netto-Erbschaft:'
                                  : '💸 Ausgabe:'
                                : isEinmalzahlung
                                  ? '💵 Betrag:'
                                  : (simulationAnnual === SimulationAnnual.yearly ? '💰 Jährlich:' : '💰 Monatlich:')}
                            </span>
                            <span className={`text-sm font-bold ${
                              isSpecialEvent
                                ? isInheritance
                                  ? 'text-green-600'
                                  : 'text-red-600'
                                : 'text-cyan-600'
                            }`}
                            >
                              {(() => {
                                const displayValue = simulationAnnual === SimulationAnnual.monthly && !isEinmalzahlung
                                  ? (sparplan.einzahlung / 12).toFixed(2)
                                  : Math.abs(sparplan.einzahlung).toFixed(2)
                                return Number(displayValue).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €'
                              })()}
                            </span>
                          </div>
                          
                          {/* Special event details */}
                          {isSpecialEvent && sparplan.specialEventData && (
                            <>
                              {isInheritance && sparplan.specialEventData.relationshipType && (
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-600">👥 Verwandtschaft:</span>
                                  <span className="text-sm font-semibold text-green-600">
                                    {getRelationshipTypeLabel(sparplan.specialEventData.relationshipType)}
                                  </span>
                                </div>
                              )}
                              {isExpense && sparplan.specialEventData.expenseType && (
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-600">🏷️ Typ:</span>
                                  <span className="text-sm font-semibold text-red-600">
                                    {getExpenseTypeLabel(sparplan.specialEventData.expenseType)}
                                  </span>
                                </div>
                              )}
                              {sparplan.specialEventData.description && (
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-600">📝 Beschreibung:</span>
                                  <span className="text-sm font-semibold text-gray-700">
                                    {sparplan.specialEventData.description}
                                  </span>
                                </div>
                              )}
                              {isExpense && sparplan.specialEventData.creditTerms && (
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-600">💳 Kredit:</span>
                                  <span className="text-sm font-semibold text-red-600">
                                    {sparplan.specialEventData.creditTerms.interestRate.toFixed(1)}% / {sparplan.specialEventData.creditTerms.termYears}J
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* Inline Edit Form - only show when this specific item is being edited */}
                        {isEditMode && editingSparplan?.id === sparplan.id && (
                          <div className="mt-4 p-4 bg-yellow-25 border border-yellow-200 rounded-lg">
                            <div className="text-sm font-semibold text-yellow-800 mb-3">✏️ Bearbeiten</div>
                            <div className="space-y-3">
                              {/* Date field for one-time payments */}
                              {isEinmalzahlung && (
                                <div>
                                  <Label className="text-sm font-medium">📅 Datum</Label>
                                  <Input
                                    type="date"
                                    value={formatDateForInput(singleFormValue.date, 'yyyy-MM-dd')}
                                    onChange={e => handleDateChange(e, 'yyyy-MM-dd', date => setSingleFormValue({ ...singleFormValue, date }))}
                                    className="mt-1"
                                  />
                                </div>
                              )}

                              {/* Start and End dates for savings plans */}
                              {!isEinmalzahlung && (
                                <>
                                  <div>
                                    <Label className="text-sm font-medium">📅 Start</Label>
                                    <Input
                                      type="month"
                                      value={formatDateForInput(sparplanFormValues.start, 'yyyy-MM')}
                                      onChange={e => handleDateChange(e, 'yyyy-MM', date => setSparplanFormValues({ ...sparplanFormValues, start: date }))}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">🏁 Ende (optional)</Label>
                                    <Input
                                      type="month"
                                      value={formatDateForInput(sparplanFormValues.end, 'yyyy-MM')}
                                      onChange={e => handleDateChange(e, 'yyyy-MM', date => setSparplanFormValues({ ...sparplanFormValues, end: date }))}
                                      className="mt-1"
                                    />
                                  </div>
                                </>
                              )}

                              {/* Amount field */}
                              <div>
                                <Label className="text-sm font-medium">
                                  {isEinmalzahlung
                                    ? '💰 Betrag (€)'
                                    : `💰 ${simulationAnnual === SimulationAnnual.yearly ? 'Jährlich' : 'Monatlich'} (€)`}
                                </Label>
                                <Input
                                  type="number"
                                  value={isEinmalzahlung ? singleFormValue.einzahlung : sparplanFormValues.einzahlung}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    if (isEinmalzahlung) {
                                      setSingleFormValue({ ...singleFormValue, einzahlung: value })
                                    }
                                    else {
                                      setSparplanFormValues({ ...sparplanFormValues, einzahlung: value })
                                    }
                                  }}
                                  className="mt-1"
                                  min={0}
                                  step={100}
                                />
                              </div>

                              {/* Action buttons */}
                              <div className="flex gap-2 pt-2">
                                <Button
                                  onClick={handleSaveEdit}
                                  size="sm"
                                  className="flex-1"
                                >
                                  ✅ Speichern
                                </Button>
                                <Button
                                  onClick={handleCancelEdit}
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                >
                                  ❌ Abbrechen
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {sparplans.length === 0 && (
                    <div style={{
                      textAlign: 'center',
                      padding: '2rem',
                      color: '#666',
                      fontStyle: 'italic',
                    }}
                    >
                      Noch keine Sparpläne oder Einmalzahlungen erstellt. Fügen Sie oben einen Sparplan oder eine
                      Einmalzahlung hinzu.
                    </div>
                  )}
                </div>
              </div>

              {/* Hidden Desktop Table Layout */}
              <div style={{ display: 'none' }}>
                {/* Table functionality has been replaced with card layout above */}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  )
}
