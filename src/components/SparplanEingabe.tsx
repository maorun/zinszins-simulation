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
import { SparplanList } from './sparplan-forms/SparplanList'
import { SparplanFormCard } from './SparplanFormCard'
import { SinglePaymentFormCard } from './SinglePaymentFormCard'

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

// Helper to check if sparplan is an Einmalzahlung (single payment)
const isSinglePaymentSparplan = (sparplan: Sparplan): boolean => {
  if (!sparplan.end) return false
  return new Date(sparplan.start).getTime() === new Date(sparplan.end).getTime()
}

// Helper to check if we're editing a Sparplan (not a single payment)
const isEditingSparplan = (editingSparplan: Sparplan | null): boolean => {
  if (!editingSparplan) return false
  return !isSinglePaymentSparplan(editingSparplan)
}

// Helper to check if we're editing a single payment
const isEditingSinglePayment = (editingSparplan: Sparplan | null): boolean => {
  if (!editingSparplan) return false
  return isSinglePaymentSparplan(editingSparplan)
}

// eslint-disable-next-line max-lines-per-function -- Large component function
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
    if (!sparplanFormValues.start || !sparplanFormValues.einzahlung) return

    if (isEditMode) {
      handleSaveEdit()
      return
    }

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

  const handleSinglePaymentSubmit = () => {
    if (!singleFormValue.einzahlung) return

    if (isEditMode) {
      handleSaveEdit()
      return
    }

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

    // Check if this is a one-time payment and populate appropriate form
    if (isEinmalzahlung(sparplan)) {
      setSingleFormValue(populateSingleFormFromSparplan(sparplan))
    }
    else {
      setSparplanFormValues(populateSparplanFormFromSparplan(sparplan, simulationAnnual))
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

    // Reset edit state and forms
    setEditingSparplan(null)
    setIsEditMode(false)
    setSparplanFormValues(getInitialSparplanFormValue())
    setSingleFormValue(getInitialSingleFormValue())

    const itemType = isEinmalzahlung(editingSparplan) ? 'Einmalzahlung' : 'Sparplan'
    toast.success(`${itemType} erfolgreich aktualisiert!`)
  }

  const handleCancelEdit = () => {
    setEditingSparplan(null)
    setIsEditMode(false)
    setSparplanFormValues(getInitialSparplanFormValue())
    setSingleFormValue(getInitialSingleFormValue())
  }

  return (
    <div className="space-y-4">
      <SparplanFormCard
        isOpen={isSparplanFormOpen}
        onOpenChange={setIsSparplanFormOpen}
        formValues={sparplanFormValues}
        simulationAnnual={simulationAnnual}
        onFormChange={setSparplanFormValues}
        formatDateForInput={formatDateForInput}
        handleDateChange={handleDateChange}
        handleNumberChange={handleNumberChange}
        onSubmit={handleSparplanSubmit}
        isEditMode={isEditMode && isEditingSparplan(editingSparplan)}
        showCancelButton={isEditMode && isEditingSparplan(editingSparplan)}
        onCancel={handleCancelEdit}
      />

      <SinglePaymentFormCard
        isOpen={isSingleFormOpen}
        onOpenChange={setIsSingleFormOpen}
        formValues={singleFormValue}
        onFormChange={setSingleFormValue}
        formatDateForInput={formatDateForInput}
        handleDateChange={handleDateChange}
        handleNumberChange={handleNumberChange}
        onSubmit={handleSinglePaymentSubmit}
        isEditMode={isEditMode && isEditingSinglePayment(editingSparplan)}
        showCancelButton={isEditMode && isEditingSinglePayment(editingSparplan)}
        onCancel={handleCancelEdit}
      />

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
