import type { SimulationAnnualType } from '../utils/simulate'
import { SimulationAnnual } from '../utils/simulate'
import type { Sparplan } from '../utils/sparplan-utils'
import { initialSparplan } from '../utils/sparplan-utils'
import React, { useState, useEffect } from 'react'

// Simple Close icon component to avoid RSuite icons ESM/CommonJS issues
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
import { ChevronDown } from 'lucide-react'

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

  const handleSparplanSubmit = () => {
    if (sparplanFormValues.start && sparplanFormValues.einzahlung && sparplanFormValues.einzahlung) {
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

  const handleSinglePaymentSubmit = () => {
    if (singleFormValue.einzahlung) {
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

  const handleDeleteSparplan = (id: number) => {
    const changedSparplans = sparplans.filter(el => el.id !== id)
    setSparplans(changedSparplans)
    dispatch(changedSparplans)

    toast.info('Sparplan entfernt')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Card className="mb-6">
        <Collapsible defaultOpen={false}>
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
                      💾 Sparplan hinzufügen
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Card className="mb-6">
        <Collapsible defaultOpen={false}>
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
                      onChange={e => handleNumberChange(e, value => setSingleFormValue({ ...singleFormValue, einzahlung: value }))}
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
                        onChange={e => handleNumberChange(e, value => setSingleFormValue({ ...singleFormValue, ter: value }))}
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
                        onChange={e => handleNumberChange(e, value => setSingleFormValue({ ...singleFormValue, transactionCostPercent: value }))}
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
                        onChange={e => handleNumberChange(e, value => setSingleFormValue({ ...singleFormValue, transactionCostAbsolute: value }))}
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
                      💰 Einmalzahlung hinzufügen
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
                <CardTitle className="text-left text-lg">📋 Gespeicherte Sparpläne & Einmalzahlungen</CardTitle>
                <ChevronDown className="h-5 w-5 text-gray-500" />
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div style={{ padding: '1rem 1.5rem 0.5rem', color: '#666', fontSize: '0.9rem', borderBottom: '1px solid #f0f0f0' }}>
                Ihre konfigurierten Sparpläne und Einmalzahlungen
              </div>

              {/* Card Layout for All Devices */}
              <div style={{ padding: '1rem' }}>
                <div className="grid gap-4">
                  {sparplans.map((sparplan) => {
                    // Detect if this is a one-time payment (start and end dates are the same)
                    const isEinmalzahlung = sparplan.end && new Date(sparplan.start).getTime() === new Date(sparplan.end).getTime()

                    return (
                      <div
                        key={sparplan.id}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          isEinmalzahlung
                            ? 'bg-orange-50 border-orange-200 hover:bg-orange-100'
                            : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                            isEinmalzahlung
                              ? 'bg-orange-100 text-orange-800 border border-orange-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                          >
                            {isEinmalzahlung ? '💰 Einmalzahlung' : '📈 Sparplan'}
                            <span className="text-xs opacity-75">
                              📅
                              {' '}
                              {new Date(sparplan.start).toLocaleDateString('de-DE')}
                            </span>
                          </span>
                          <Button
                            onClick={() => handleDeleteSparplan(sparplan.id)}
                            variant="ghost"
                            size="sm"
                            title={isEinmalzahlung ? 'Einmalzahlung löschen' : 'Sparplan löschen'}
                            className="text-red-600 hover:text-red-700"
                          >
                            <CloseIcon />
                          </Button>
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
                              {isEinmalzahlung
                                ? '💵 Betrag:'
                                : (simulationAnnual === SimulationAnnual.yearly ? '💰 Jährlich:' : '💰 Monatlich:')}
                            </span>
                            <span className="text-sm font-bold text-cyan-600">
                              {(() => {
                                const displayValue = simulationAnnual === SimulationAnnual.monthly && !isEinmalzahlung
                                  ? (sparplan.einzahlung / 12).toFixed(2)
                                  : sparplan.einzahlung.toFixed(2)
                                return Number(displayValue).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €'
                              })()}
                            </span>
                          </div>
                        </div>
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
                      Noch keine Sparpläne oder Einmalzahlungen erstellt. Fügen Sie oben einen Sparplan oder eine Einmalzahlung hinzu.
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
