import type { SimulationAnnualType } from '../utils/simulate'
import type { Sparplan, RelationshipType, ExpenseType } from '../utils/sparplan-utils'
import { getRelationshipTypeLabel, getExpenseTypeLabel, calculateInheritanceTax } from '../../helpers/inheritance-tax'
import { getDefaultCreditTerms } from '../../helpers/credit-calculation'
import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { toast } from 'sonner'

type EventPhase = 'sparphase' | 'entsparphase'

interface SpecialEventsProps {
  dispatch: (val: Sparplan[]) => void
  simulationAnnual: SimulationAnnualType
  currentSparplans?: Sparplan[]
  savingsStartYear: number
  savingsEndYear: number
  withdrawalStartYear: number
  withdrawalEndYear: number
}

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

export function SpecialEvents({
  dispatch,
  simulationAnnual: _simulationAnnual,
  currentSparplans = [],
  savingsStartYear,
  savingsEndYear,
  withdrawalStartYear,
  withdrawalEndYear,
}: SpecialEventsProps) {
  const [specialEventFormValues, setSpecialEventFormValues] = useState({
    date: new Date(),
    eventType: 'inheritance' as 'inheritance' | 'expense',
    phase: 'sparphase' as EventPhase,
    // Inheritance fields
    relationshipType: 'child' as RelationshipType,
    grossAmount: '',
    // Expense fields
    expenseType: 'car' as ExpenseType,
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

  const handleSubmit = () => {
    if (specialEventFormValues.eventType === 'inheritance') {
      if (!specialEventFormValues.grossAmount) return

      const grossAmount = Number(specialEventFormValues.grossAmount)
      const taxCalc = calculateInheritanceTax(grossAmount, specialEventFormValues.relationshipType)

      const newSparplan: Sparplan = {
        id: Math.max(0, ...currentSparplans.map(p => p.id)) + 1,
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
    else if (specialEventFormValues.eventType === 'expense') {
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
        id: Math.max(0, ...currentSparplans.map(p => p.id)) + 1,
        start: specialEventFormValues.date,
        end: specialEventFormValues.date,
        einzahlung: -expenseAmount, // Negative for expenses
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
  }

  const handleDeleteSparplan = (id: number) => {
    const filtered = currentSparplans.filter(sparplan => sparplan.id !== id)
    dispatch(filtered)
    toast.info('Eintrag gelöscht')
  }

  // Calculate inheritance tax for display
  const inheritanceTaxCalc = specialEventFormValues.grossAmount
    ? calculateInheritanceTax(Number(specialEventFormValues.grossAmount), specialEventFormValues.relationshipType)
    : null

  // Get phase date ranges
  const getPhaseYearRange = (phase: EventPhase) => {
    if (phase === 'sparphase') {
      return { start: savingsStartYear, end: savingsEndYear }
    }
    else {
      return { start: withdrawalStartYear, end: withdrawalEndYear }
    }
  }

  const currentPhaseRange = getPhaseYearRange(specialEventFormValues.phase)

  return (
    <Card nestingLevel={0} className="mb-6">
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
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '1.5rem',
                      }}
                      >
                        {/* Phase Selection */}
                        <div className="mb-4 space-y-2">
                          <Label>
                            Lebensphase
                            <InfoIcon />
                          </Label>
                          <select
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={specialEventFormValues.phase}
                            onChange={e => setSpecialEventFormValues({
                              ...specialEventFormValues,
                              phase: e.target.value as EventPhase,
                            })}
                          >
                            <option value="sparphase">
                              💰 Sparphase (
                              {savingsStartYear}
                              {' '}
                              -
                              {' '}
                              {savingsEndYear}
                              )
                            </option>
                            <option value="entsparphase">
                              💸 Entsparphase (
                              {withdrawalStartYear}
                              {' '}
                              -
                              {' '}
                              {withdrawalEndYear}
                              )
                            </option>
                          </select>
                          <div className="text-sm text-muted-foreground mt-1">
                            Wählen Sie die Lebensphase für das Ereignis
                          </div>
                        </div>

                        {/* Date */}
                        <div className="mb-4 space-y-2">
                          <Label>
                            Datum
                            <InfoIcon />
                          </Label>
                          <Input
                            type="date"
                            value={formatDateForInput(specialEventFormValues.date, 'yyyy-MM-dd')}
                            onChange={e => handleDateChange(e, 'yyyy-MM-dd', date => setSpecialEventFormValues({
                              ...specialEventFormValues,
                              date: date || new Date(),
                            }))}
                            min={`${currentPhaseRange.start}-01-01`}
                            max={`${currentPhaseRange.end}-12-31`}
                            placeholder="Datum wählen"
                          />
                          <div className="text-sm text-muted-foreground mt-1">
                            Datum zwischen
                            {' '}
                            {currentPhaseRange.start}
                            {' '}
                            und
                            {' '}
                            {currentPhaseRange.end}
                          </div>
                        </div>

                        {/* Event Type */}
                        <div className="mb-4 space-y-2">
                          <Label>
                            Ereignistyp
                            <InfoIcon />
                          </Label>
                          <select
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={specialEventFormValues.eventType}
                            onChange={e => setSpecialEventFormValues({
                              ...specialEventFormValues,
                              eventType: e.target.value as 'inheritance' | 'expense',
                            })}
                          >
                            <option value="inheritance">💰 Erbschaft</option>
                            <option value="expense">💸 Ausgabe</option>
                          </select>
                        </div>
                      </div>

                      {/* Inheritance-specific fields */}
                      {specialEventFormValues.eventType === 'inheritance' && (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '1rem',
                          marginBottom: '1.5rem',
                        }}
                        >
                          <div className="mb-4 space-y-2">
                            <Label>
                              Verwandtschaftsgrad
                              <InfoIcon />
                            </Label>
                            <select
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={specialEventFormValues.relationshipType}
                              onChange={e => setSpecialEventFormValues({
                                ...specialEventFormValues,
                                relationshipType: e.target.value as RelationshipType,
                              })}
                            >
                              <option value="spouse">Ehegatte/Ehegattin (€500.000 Freibetrag)</option>
                              <option value="child">Kind/Stiefkind (€400.000 Freibetrag)</option>
                              <option value="grandchild">Enkelkind (€200.000 Freibetrag)</option>
                              <option value="parent_from_descendant">Eltern v. Nachkommen (€100.000 Freibetrag)</option>
                              <option value="parent">Eltern sonstige (€20.000 Freibetrag)</option>
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
                              value={specialEventFormValues.grossAmount}
                              onChange={e => setSpecialEventFormValues({
                                ...specialEventFormValues,
                                grossAmount: e.target.value,
                              })}
                              placeholder="z.B. 100000"
                              min="0"
                              step="1000"
                            />
                            <div className="text-sm text-muted-foreground mt-1">Bruttobetrag vor Erbschaftsteuer</div>
                          </div>
                        </div>
                      )}

                      {/* Expense-specific fields */}
                      {specialEventFormValues.eventType === 'expense' && (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '1rem',
                          marginBottom: '1.5rem',
                        }}
                        >
                          <div className="mb-4 space-y-2">
                            <Label>
                              Ausgabentyp
                              <InfoIcon />
                            </Label>
                            <select
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={specialEventFormValues.expenseType}
                              onChange={e => setSpecialEventFormValues({
                                ...specialEventFormValues,
                                expenseType: e.target.value as ExpenseType,
                              })}
                            >
                              <option value="car">🚗 Autokauf</option>
                              <option value="real_estate">🏠 Immobilie</option>
                              <option value="education">🎓 Bildung</option>
                              <option value="medical">🏥 Medizin</option>
                              <option value="other">📦 Sonstiges</option>
                            </select>
                          </div>

                          <div className="mb-4 space-y-2">
                            <Label>
                              Ausgabenbetrag (€)
                              <InfoIcon />
                            </Label>
                            <Input
                              type="number"
                              value={specialEventFormValues.expenseAmount}
                              onChange={e => setSpecialEventFormValues({
                                ...specialEventFormValues,
                                expenseAmount: e.target.value,
                              })}
                              placeholder="z.B. 25000"
                              min="0"
                              step="1000"
                            />
                          </div>

                          <div className="mb-4 space-y-2 col-span-full">
                            <Label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={specialEventFormValues.useCredit}
                                onChange={(e) => {
                                  const checked = e.target.checked
                                  // Default amount for defaults calculation
                                  const amount = Number(specialEventFormValues.expenseAmount) || 1000
                                  const defaults = getDefaultCreditTerms(specialEventFormValues.expenseType, amount)
                                  setSpecialEventFormValues({
                                    ...specialEventFormValues,
                                    useCredit: checked,
                                    interestRate: checked ? (defaults.interestRate * 100).toString() : '',
                                    termYears: checked ? defaults.termYears.toString() : '',
                                  })
                                }}
                                className="mr-2"
                              />
                              💳 Mit Kredit finanzieren
                              <InfoIcon />
                            </Label>
                          </div>

                          {specialEventFormValues.useCredit && (
                            <>
                              <div className="mb-4 space-y-2">
                                <Label>
                                  Zinssatz (% p.a.)
                                  <InfoIcon />
                                </Label>
                                <Input
                                  type="number"
                                  value={specialEventFormValues.interestRate}
                                  onChange={e => setSpecialEventFormValues({
                                    ...specialEventFormValues,
                                    interestRate: e.target.value,
                                  })}
                                  placeholder="z.B. 4.5"
                                  min="0"
                                  max="20"
                                  step="0.1"
                                />
                              </div>

                              <div className="mb-4 space-y-2">
                                <Label>
                                  Laufzeit (Jahre)
                                  <InfoIcon />
                                </Label>
                                <Input
                                  type="number"
                                  value={specialEventFormValues.termYears}
                                  onChange={e => setSpecialEventFormValues({
                                    ...specialEventFormValues,
                                    termYears: e.target.value,
                                  })}
                                  placeholder="z.B. 5"
                                  min="1"
                                  max="30"
                                  step="1"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Tax calculation display for inheritance */}
                      {specialEventFormValues.eventType === 'inheritance' && inheritanceTaxCalc && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-sm font-semibold text-green-800 mb-2">📊 Steuerberechnung:</div>
                          <div className="text-sm text-green-700 space-y-1">
                            <div>
                              Brutto-Erbschaft:
                              {inheritanceTaxCalc.grossAmount.toLocaleString('de-DE')}
                              {' '}
                              €
                            </div>
                            <div>
                              Freibetrag:
                              {inheritanceTaxCalc.exemption.toLocaleString('de-DE')}
                              {' '}
                              €
                            </div>
                            <div>
                              Erbschaftsteuer:
                              {inheritanceTaxCalc.tax.toLocaleString('de-DE')}
                              {' '}
                              €
                            </div>
                            <div className="font-semibold border-t pt-1 mt-2">
                              Netto-Erbschaft:
                              {' '}
                              {inheritanceTaxCalc.netAmount.toLocaleString('de-DE')}
                              {' '}
                              €
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      <div className="mb-4 space-y-2">
                        <Label>
                          Beschreibung (optional)
                          <InfoIcon />
                        </Label>
                        <Input
                          type="text"
                          value={specialEventFormValues.description}
                          onChange={e => setSpecialEventFormValues({
                            ...specialEventFormValues,
                            description: e.target.value,
                          })}
                          placeholder="z.B. Erbschaft Großeltern, Neuwagenkauf"
                        />
                      </div>

                      {/* Submit button */}
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

            {/* Display existing special events */}
            {currentSparplans.some(plan => plan.eventType && plan.eventType !== 'normal') && (
              <Card nestingLevel={1}>
                <Collapsible defaultOpen={true}>
                  <CardHeader nestingLevel={1}>
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
                        <CardTitle className="text-left text-lg">📋 Gespeicherte Sonderereignisse</CardTitle>
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      </div>
                    </CollapsibleTrigger>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent nestingLevel={1} className="pt-0">
                      <div style={{
                        padding: '1rem 1.5rem 0.5rem',
                        color: '#666',
                        fontSize: '0.9rem',
                        borderBottom: '1px solid #f0f0f0',
                      }}
                      >
                        Ihre konfigurierten Sonderereignisse für beide Lebensphasen
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {currentSparplans
                          .filter(sparplan => sparplan.eventType && sparplan.eventType !== 'normal')
                          .map((sparplan) => {
                            const isInheritance = sparplan.eventType === 'inheritance'
                            const isExpense = sparplan.eventType === 'expense'
                            const eventPhase = sparplan.specialEventData?.phase || 'sparphase'
                            const phaseLabel = eventPhase === 'sparphase' ? 'Sparphase' : 'Entsparphase'
                            const phaseColor = eventPhase === 'sparphase' ? 'blue' : 'purple'

                            return (
                              <Card
                                key={sparplan.id}
                                nestingLevel={2}
                                className={`p-4 ${
                                  isInheritance
                                    ? 'bg-green-50 border-green-200'
                                    : isExpense
                                      ? 'bg-red-50 border-red-200'
                                      : 'bg-blue-50 border-blue-200'
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-base font-bold">
                                        {isInheritance ? '🎯 Erbschaft' : isExpense ? '🎯 Ausgabe' : '💰 Einmalzahlung'}
                                      </span>
                                      <span className="text-sm text-gray-600">
                                        📅
                                        {new Date(sparplan.start).toLocaleDateString('de-DE')}
                                      </span>
                                      <span className={`text-xs px-2 py-1 rounded-full bg-${phaseColor}-100 text-${phaseColor}-700 font-medium`}>
                                        {phaseLabel}
                                      </span>
                                    </div>

                                    <div className="space-y-1 text-sm">
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-600">📅 Datum:</span>
                                        <span className="text-sm font-semibold text-blue-600">
                                          {new Date(sparplan.start).toLocaleDateString('de-DE')}
                                        </span>
                                      </div>

                                      <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-600">
                                          {isInheritance
                                            ? '💰 Netto-Erbschaft:'
                                            : isExpense
                                              ? '💸 Ausgabe:'
                                              : '💰 Betrag:'}
                                        </span>
                                        <span className={`text-sm font-semibold ${
                                          isInheritance ? 'text-green-600' : isExpense ? 'text-red-600' : 'text-blue-600'
                                        }`}
                                        >
                                          {Math.abs(sparplan.einzahlung).toLocaleString('de-DE', {
                                            style: 'currency',
                                            currency: 'EUR',
                                          })}
                                        </span>
                                      </div>

                                      {isInheritance && sparplan.specialEventData?.relationshipType && (
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm font-medium text-gray-600">👥 Verwandtschaft:</span>
                                          <span className="text-sm font-semibold text-green-600">
                                            {getRelationshipTypeLabel(sparplan.specialEventData.relationshipType)}
                                          </span>
                                        </div>
                                      )}

                                      {isExpense && sparplan.specialEventData?.expenseType && (
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm font-medium text-gray-600">🏷️ Typ:</span>
                                          <span className="text-sm font-semibold text-red-600">
                                            {getExpenseTypeLabel(sparplan.specialEventData.expenseType)}
                                          </span>
                                        </div>
                                      )}

                                      {sparplan.specialEventData?.description && (
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm font-medium text-gray-600">📝 Beschreibung:</span>
                                          <span className="text-sm font-semibold text-gray-700">
                                            {sparplan.specialEventData.description}
                                          </span>
                                        </div>
                                      )}

                                      {isExpense && sparplan.specialEventData?.creditTerms && (
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm font-medium text-gray-600">💳 Kredit:</span>
                                          <span className="text-sm font-semibold text-red-600">
                                            {(sparplan.specialEventData.creditTerms.interestRate * 100).toFixed(1)}
                                            % /
                                            {sparplan.specialEventData.creditTerms.termYears}
                                            J
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex gap-2 ml-4">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteSparplan(sparplan.id)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      🗑️
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            )
                          })}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
