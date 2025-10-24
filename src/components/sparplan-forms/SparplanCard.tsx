import React from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Edit2 } from 'lucide-react'
import { SimulationAnnual, type SimulationAnnualType } from '../../utils/simulate'
import type { Sparplan } from '../../utils/sparplan-utils'
import { isEinmalzahlung, type SingleFormValue, type SparplanFormValue } from '../SparplanEingabe.helpers'

// Simple Close icon component
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

interface SparplanCardProps {
  sparplan: Sparplan
  simulationAnnual: SimulationAnnualType
  isEditMode: boolean
  editingSparplan: Sparplan | null
  sparplanFormValues: SparplanFormValue
  singleFormValue: SingleFormValue
  formatDateForInput: (date: Date | string | null, format: string) => string
  handleDateChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    format: string,
    callback: (date: Date | null) => void,
  ) => void
  onEdit: (sparplan: Sparplan) => void
  onDelete: (id: number) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onSparplanFormChange: (values: SparplanFormValue) => void
  onSingleFormChange: (values: SingleFormValue) => void
}

/**
 * Displays a single sparplan or single payment card with edit functionality
 * Complexity: <8, Lines: <50
 */
/**
 * Get card styling classes based on edit state and payment type
 */
function getCardClasses(
  isEditMode: boolean,
  editingSparplanId: number | undefined,
  sparplanId: number,
  isOneTimePayment: boolean,
): string {
  const baseClasses = 'p-4 rounded-lg border-2 transition-colors'

  if (isEditMode && editingSparplanId === sparplanId) {
    return `${baseClasses} bg-yellow-50 border-yellow-300 ring-2 ring-yellow-200`
  }

  if (isOneTimePayment) {
    return `${baseClasses} bg-orange-50 border-orange-200 hover:bg-orange-100`
  }

  return `${baseClasses} bg-blue-50 border-blue-200 hover:bg-blue-100`
}

export function SparplanCard(props: SparplanCardProps) {
  const {
    sparplan,
    simulationAnnual,
    isEditMode,
    editingSparplan,
    sparplanFormValues,
    singleFormValue,
    formatDateForInput,
    handleDateChange,
    onEdit,
    onDelete,
    onSaveEdit,
    onCancelEdit,
    onSparplanFormChange,
    onSingleFormChange,
  } = props

  const isOneTimePayment = isEinmalzahlung(sparplan)

  return (
    <div className={getCardClasses(isEditMode, editingSparplan?.id, sparplan.id, isOneTimePayment)}>
      <SparplanCardHeader
        sparplan={sparplan}
        isOneTimePayment={isOneTimePayment}
        isEditMode={isEditMode}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <SparplanCardDetails
        sparplan={sparplan}
        simulationAnnual={simulationAnnual}
        isOneTimePayment={isOneTimePayment}
      />
      {isEditMode && editingSparplan?.id === sparplan.id && (
        <SparplanCardEditForm
          sparplan={sparplan}
          isOneTimePayment={isOneTimePayment}
          simulationAnnual={simulationAnnual}
          sparplanFormValues={sparplanFormValues}
          singleFormValue={singleFormValue}
          formatDateForInput={formatDateForInput}
          handleDateChange={handleDateChange}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
          onSparplanFormChange={onSparplanFormChange}
          onSingleFormChange={onSingleFormChange}
        />
      )}
    </div>
  )
}

/**
 * Card header with type label and action buttons
 * Complexity: <8, Lines: <50
 */
/**
 * Badge showing sparplan type and start date
 */
function SparplanTypeBadge({ sparplan, isOneTimePayment }: { sparplan: Sparplan, isOneTimePayment: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
      isOneTimePayment
        ? 'bg-orange-100 text-orange-800 border border-orange-200'
        : 'bg-blue-100 text-blue-800 border border-blue-200'
    }`}
    >
      {isOneTimePayment ? '💰 Einmalzahlung' : '📈 Sparplan'}
      <span className="text-xs opacity-75">
        📅
        {' '}
        {new Date(sparplan.start).toLocaleDateString('de-DE')}
      </span>
    </span>
  )
}

/**
 * Action buttons for editing and deleting sparplan
 */
function SparplanActionButtons({
  sparplan,
  isOneTimePayment,
  isEditMode,
  onEdit,
  onDelete,
}: {
  sparplan: Sparplan
  isOneTimePayment: boolean
  isEditMode: boolean
  onEdit: (sparplan: Sparplan) => void
  onDelete: (id: number) => void
}) {
  return (
    <div className="flex gap-2">
      <Button
        onClick={() => onEdit(sparplan)}
        variant="outline"
        size="sm"
        title={isOneTimePayment ? 'Einmalzahlung bearbeiten' : 'Sparplan bearbeiten'}
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        disabled={isEditMode}
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => onDelete(sparplan.id)}
        variant="ghost"
        size="sm"
        title={isOneTimePayment ? 'Einmalzahlung löschen' : 'Sparplan löschen'}
        className="text-red-600 hover:text-red-700"
        disabled={isEditMode}
      >
        <CloseIcon />
      </Button>
    </div>
  )
}

function SparplanCardHeader({
  sparplan,
  isOneTimePayment,
  isEditMode,
  onEdit,
  onDelete,
}: {
  sparplan: Sparplan
  isOneTimePayment: boolean
  isEditMode: boolean
  onEdit: (sparplan: Sparplan) => void
  onDelete: (id: number) => void
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <SparplanTypeBadge sparplan={sparplan} isOneTimePayment={isOneTimePayment} />
      <SparplanActionButtons
        sparplan={sparplan}
        isOneTimePayment={isOneTimePayment}
        isEditMode={isEditMode}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  )
}

/**
 * Card details showing dates and amounts
 * Complexity: <8, Lines: <50
 */
function SparplanCardDetails({
  sparplan,
  simulationAnnual,
  isOneTimePayment,
}: {
  sparplan: Sparplan
  simulationAnnual: SimulationAnnualType
  isOneTimePayment: boolean
}) {
  const displayValue = simulationAnnual === SimulationAnnual.monthly && !isOneTimePayment
    ? (sparplan.einzahlung / 12).toFixed(2)
    : sparplan.einzahlung.toFixed(2)
  const formattedAmount = Number(displayValue).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €'

  return (
    <div className="grid gap-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600">📅 Start:</span>
        <span className="text-sm font-semibold text-green-600">
          {new Date(sparplan.start).toLocaleDateString('de-DE')}
        </span>
      </div>
      {!isOneTimePayment && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">🏁 Ende:</span>
          <span className="text-sm font-semibold text-blue-600">
            {sparplan.end ? new Date(sparplan.end).toLocaleDateString('de-DE') : 'Unbegrenzt'}
          </span>
        </div>
      )}
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600">
          {isOneTimePayment
            ? '💵 Betrag:'
            : (simulationAnnual === SimulationAnnual.yearly ? '💰 Jährlich:' : '💰 Monatlich:')}
        </span>
        <span className="text-sm font-bold text-cyan-600">
          {formattedAmount}
        </span>
      </div>
    </div>
  )
}

/**
 * Inline edit form for sparplan card
 * Complexity: <8, Lines: <50
 */
// eslint-disable-next-line max-lines-per-function -- Complex configuration component
function SparplanCardEditForm(props: {
  sparplan: Sparplan
  isOneTimePayment: boolean
  simulationAnnual: SimulationAnnualType
  sparplanFormValues: SparplanFormValue
  singleFormValue: SingleFormValue
  formatDateForInput: (date: Date | string | null, format: string) => string
  handleDateChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    format: string,
    callback: (date: Date | null) => void,
  ) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onSparplanFormChange: (values: SparplanFormValue) => void
  onSingleFormChange: (values: SingleFormValue) => void
}) {
  const {
    isOneTimePayment,
    simulationAnnual,
    sparplanFormValues,
    singleFormValue,
    formatDateForInput,
    handleDateChange,
    onSaveEdit,
    onCancelEdit,
    onSparplanFormChange,
    onSingleFormChange,
  } = props

  return (
    <div className="mt-4 p-4 bg-yellow-25 border border-yellow-200 rounded-lg">
      <div className="text-sm font-semibold text-yellow-800 mb-3">✏️ Bearbeiten</div>
      <div className="space-y-3">
        {/* Date field for one-time payments */}
        {isOneTimePayment && (
          <div>
            <Label className="text-sm font-medium">📅 Datum</Label>
            <Input
              type="date"
              value={formatDateForInput(singleFormValue.date, 'yyyy-MM-dd')}
              onChange={e => handleDateChange(e, 'yyyy-MM-dd', date => onSingleFormChange({ ...singleFormValue, date: date || new Date() }))}
              className="mt-1"
            />
          </div>
        )}

        {/* Start and End dates for savings plans */}
        {!isOneTimePayment && (
          <>
            <div>
              <Label className="text-sm font-medium">📅 Start</Label>
              <Input
                type="month"
                value={formatDateForInput(sparplanFormValues.start, 'yyyy-MM')}
                onChange={e => handleDateChange(e, 'yyyy-MM', date => onSparplanFormChange({ ...sparplanFormValues, start: date || new Date() }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">🏁 Ende (optional)</Label>
              <Input
                type="month"
                value={formatDateForInput(sparplanFormValues.end, 'yyyy-MM')}
                onChange={e => handleDateChange(e, 'yyyy-MM', date => onSparplanFormChange({ ...sparplanFormValues, end: date }))}
                className="mt-1"
              />
            </div>
          </>
        )}

        {/* Amount field */}
        <div>
          <Label className="text-sm font-medium">
            {isOneTimePayment
              ? '💰 Betrag (€)'
              : `💰 ${simulationAnnual === SimulationAnnual.yearly ? 'Jährlich' : 'Monatlich'} (€)`}
          </Label>
          <Input
            type="number"
            value={isOneTimePayment ? singleFormValue.einzahlung : sparplanFormValues.einzahlung}
            onChange={(e) => {
              const value = e.target.value
              if (isOneTimePayment) {
                onSingleFormChange({ ...singleFormValue, einzahlung: value })
              }
              else {
                onSparplanFormChange({ ...sparplanFormValues, einzahlung: value })
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
            onClick={onSaveEdit}
            size="sm"
            className="flex-1"
          >
            ✅ Speichern
          </Button>
          <Button
            onClick={onCancelEdit}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            ❌ Abbrechen
          </Button>
        </div>
      </div>
    </div>
  )
}
