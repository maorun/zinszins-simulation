import { ApiActionsSection } from './ApiActionsSection'
import { ErrorDisplay } from './ErrorDisplay'
import { InfoPanel } from './InfoPanel'
import { ManualEntryForm } from './ManualEntryForm'
import { RatesTable } from './RatesTable'
import { SummaryInfo } from './SummaryInfo'
import type { BasiszinsConfiguration } from '../../services/bundesbank-api'

interface BasiszinsContentProps {
  basiszinsConfiguration: BasiszinsConfiguration
  currentYear: number
  isLoading: boolean
  lastApiUpdate: string | null
  error: string | null
  newYear: string
  newRate: string
  onFetchFromApi: () => void
  onAddManualEntry: () => void
  onUpdateRate: (year: number, newRateValue: string) => void
  onRemoveYear: (year: number) => void
  onSetNewYear: (year: string) => void
  onSetNewRate: (rate: string) => void
  getSuggestedRate: () => string
}

/**
 * Renders the content of the Basiszins configuration panel
 */
export function BasiszinsContent({
  basiszinsConfiguration,
  currentYear,
  isLoading,
  lastApiUpdate,
  error,
  newYear,
  newRate,
  onFetchFromApi,
  onAddManualEntry,
  onUpdateRate,
  onRemoveYear,
  onSetNewYear,
  onSetNewRate,
  getSuggestedRate,
}: BasiszinsContentProps) {
  return (
    <>
      {/* Information Panel */}
      <InfoPanel />

      {/* API Actions */}
      <ApiActionsSection handleFetchFromApi={onFetchFromApi} isLoading={isLoading} lastApiUpdate={lastApiUpdate} />

      {/* Error Display */}
      <ErrorDisplay error={error} />

      {/* Manual Entry Form */}
      <ManualEntryForm
        newYear={newYear}
        setNewYear={onSetNewYear}
        newRate={newRate}
        setNewRate={onSetNewRate}
        handleAddManualEntry={onAddManualEntry}
        getSuggestedRate={getSuggestedRate}
        currentYear={currentYear}
      />

      {/* Rates Table */}
      <RatesTable
        basiszinsConfiguration={basiszinsConfiguration}
        currentYear={currentYear}
        onUpdateRate={onUpdateRate}
        onRemoveYear={onRemoveYear}
      />

      {/* Summary Info */}
      <SummaryInfo currentYear={currentYear} />
    </>
  )
}
