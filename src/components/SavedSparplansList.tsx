import React from 'react'
import type { Sparplan } from '../utils/sparplan-utils'
import type { SimulationAnnualType } from '../utils/simulate'
import type { SingleFormValue, SparplanFormValue } from './SparplanEingabe.helpers'
import { SparplanList } from './sparplan-forms/SparplanList'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown } from 'lucide-react'

interface SavedSparplansListProps {
  sparplans: Sparplan[]
  simulationAnnual: SimulationAnnualType
  isEditMode: boolean
  editingSparplan: Sparplan | null
  sparplanFormValues: SparplanFormValue
  singleFormValue: SingleFormValue
  formatDateForInput: (date: Date | string | null, format: string) => string
  handleDateChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    format: string,
    onChange: (date: Date | null) => void,
  ) => void
  onEdit: (sparplan: Sparplan) => void
  onDelete: (id: number) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onSparplanFormChange: (values: SparplanFormValue) => void
  onSingleFormChange: (value: SingleFormValue) => void
}

// eslint-disable-next-line max-lines-per-function -- Display component with nested structure
export function SavedSparplansList({
  sparplans,
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
}: SavedSparplansListProps) {
  return (
    <Card className="mb-6">
      <Collapsible defaultOpen={true}>
        <CardHeader className="pb-4">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
              <CardTitle className="text-left text-lg">
                📋 Gespeicherte Sparpläne & Einmalzahlungen
              </CardTitle>
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div style={{
              padding: '1rem 1.5rem 0.5rem',
              color: '#666',
              fontSize: '0.9rem',
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
                onEdit={onEdit}
                onDelete={onDelete}
                onSaveEdit={onSaveEdit}
                onCancelEdit={onCancelEdit}
                onSparplanFormChange={onSparplanFormChange}
                onSingleFormChange={onSingleFormChange}
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
  )
}
