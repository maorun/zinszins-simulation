import { type SimulationAnnualType } from '../utils/simulate'
import { initialSparplan, type Sparplan } from '../utils/sparplan-utils'
import React, { useState, useEffect } from 'react'
import {
  createNewSparplan,
  createNewSinglePayment,
  updateExistingSparplan,
  getInitialSingleFormValue,
  getInitialSparplanFormValue,
  populateSingleFormFromSparplan,
  populateSparplanFormFromSparplan,
  isEinmalzahlung,
  type SingleFormValue,
  type SparplanFormValue,
} from './SparplanEingabe.helpers'
import { SparplanFormFields } from './sparplan-forms/SparplanFormFields'
import { SinglePaymentFormFields } from './sparplan-forms/SinglePaymentFormFields'
import { CostFactorFields } from './sparplan-forms/CostFactorFields'
import { SparplanList } from './sparplan-forms/SparplanList'

// Import Button directly from shadcn/ui
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown } from 'lucide-react'

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

  // Synchronize local state with prop changes
  useEffect(() => {
    setSparplans(currentSparplans)
  }, [currentSparplans])

  const [singleFormValue, setSingleFormValue] = useState<SingleFormValue>(getInitialSingleFormValue())
  const [sparplanFormValues, setSparplanFormValues] = useState<SparplanFormValue>(getInitialSparplanFormValue())

  const handleSparplanSubmit = () => {
    if (sparplanFormValues.start && sparplanFormValues.einzahlung && sparplanFormValues.einzahlung) {
      if (isEditMode) {
        // In edit mode, call save edit
        handleSaveEdit()
      }
      else {
        // In create mode, add new sparplan
        const changedSparplans = createNewSparplan({
          formValues: sparplanFormValues,
          simulationAnnual,
          existingSparplans: sparplans,
        })

        setSparplans(changedSparplans)
        dispatch(changedSparplans)
        setSparplanFormValues(getInitialSparplanFormValue())

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
        const changedSparplans = createNewSinglePayment({
          formValues: singleFormValue,
          existingSparplans: sparplans,
        })

        setSparplans(changedSparplans)
        dispatch(changedSparplans)
        setSingleFormValue(getInitialSingleFormValue())

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

  // Edit handlers
  const handleEditSparplan = (sparplan: Sparplan) => {
    setEditingSparplan(sparplan)
    setIsEditMode(true)

    // Check if this is a one-time payment
    const isOneTimePayment = isEinmalzahlung(sparplan)

    if (isOneTimePayment) {
      // Pre-fill single payment form
      setSingleFormValue(populateSingleFormFromSparplan(sparplan))
      // NO auto-expansion for better mobile UX - inline editing instead
    }
    else {
      // Pre-fill savings plan form
      setSparplanFormValues(populateSparplanFormFromSparplan(sparplan, simulationAnnual))
      // NO auto-expansion for better mobile UX - inline editing instead
    }
  }

  const handleSaveEdit = () => {
    if (!editingSparplan) return

    const changedSparplans = updateExistingSparplan({
      editingSparplan,
      sparplanFormValues,
      singleFormValues: singleFormValue,
      simulationAnnual,
      existingSparplans: sparplans,
    })

    setSparplans(changedSparplans)
    dispatch(changedSparplans)

    // Reset edit state
    setEditingSparplan(null)
    setIsEditMode(false)

    // Reset forms
    setSparplanFormValues(getInitialSparplanFormValue())
    setSingleFormValue(getInitialSingleFormValue())

    // Close the expanded form sections - removed for better mobile UX
    // setIsSparplanFormOpen(false)
    // setIsSingleFormOpen(false)

    const itemType = isEinmalzahlung(editingSparplan) ? 'Einmalzahlung' : 'Sparplan'
    toast.success(`${itemType} erfolgreich aktualisiert!`)
  }

  const handleCancelEdit = () => {
    setEditingSparplan(null)
    setIsEditMode(false)

    // Reset forms
    setSparplanFormValues(getInitialSparplanFormValue())
    setSingleFormValue(getInitialSingleFormValue())

    // Close the expanded form sections - removed for better mobile UX
    // setIsSparplanFormOpen(false)
    // setIsSingleFormOpen(false)
  }

  return (
    <div className="space-y-4">
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
                <SparplanFormFields
                  formValues={sparplanFormValues}
                  simulationAnnual={simulationAnnual}
                  onFormChange={setSparplanFormValues}
                  formatDateForInput={formatDateForInput}
                  handleDateChange={handleDateChange}
                  handleNumberChange={handleNumberChange}
                />
                <CostFactorFields
                  values={sparplanFormValues}
                  onValueChange={values => setSparplanFormValues({ ...sparplanFormValues, ...values })}
                  handleNumberChange={handleNumberChange}
                />
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
                <SinglePaymentFormFields
                  formValues={singleFormValue}
                  onFormChange={setSingleFormValue}
                  formatDateForInput={formatDateForInput}
                  handleDateChange={handleDateChange}
                  handleNumberChange={handleNumberChange}
                />
                <CostFactorFields
                  values={singleFormValue}
                  onValueChange={values => setSingleFormValue({ ...singleFormValue, ...values })}
                  handleNumberChange={handleNumberChange}
                />
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
              <div style={{
                padding: '1rem 1.5rem 0.5rem', color: '#666', fontSize: '0.9rem',
                borderBottom: '1px solid #f0f0f0',
              }}
              >
                Ihre konfigurierten Sparpläne und Einmalzahlungen
              </div>

              {/* Card Layout for All Devices */}
              <div style={{ padding: '1rem' }}>
                <SparplanList
                  sparplans={sparplans}
                  simulationAnnual={simulationAnnual}
                  isEditMode={isEditMode}
                  editingSparplan={editingSparplan}
                  sparplanFormValues={sparplanFormValues}
                  singleFormValue={singleFormValue}
                  formatDateForInput={formatDateForInput}
                  handleDateChange={handleDateChange}
                  onEdit={handleEditSparplan}
                  onDelete={handleDeleteSparplan}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                  onSparplanFormChange={setSparplanFormValues}
                  onSingleFormChange={setSingleFormValue}
                />
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
