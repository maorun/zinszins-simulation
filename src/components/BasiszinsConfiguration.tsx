import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'
import { BasiszinsContent } from './basiszins/BasiszinsContent'
import { useBasiszinsConfiguration } from './basiszins/useBasiszinsConfiguration'

/**
 * Basiszins Configuration Component
 * Manages interest rates from Deutsche Bundesbank for Vorabpauschale calculation
 */
export default function BasiszinsConfiguration() {
  const config = useBasiszinsConfiguration()

  return (
    <CollapsibleCard>
      <CollapsibleCardHeader>📈 Basiszins-Konfiguration (Deutsche Bundesbank)</CollapsibleCardHeader>
      <CollapsibleCardContent>
        <BasiszinsContent
          basiszinsConfiguration={config.basiszinsConfiguration}
          currentYear={config.currentYear}
          isLoading={config.isLoading}
          lastApiUpdate={config.lastApiUpdate}
          error={config.error}
          newYear={config.newYear}
          newRate={config.newRate}
          onFetchFromApi={config.handleFetchFromApi}
          onAddManualEntry={config.handleAddManualEntry}
          onUpdateRate={config.handleUpdateRate}
          onRemoveYear={config.handleRemoveYear}
          onSetNewYear={config.setNewYear}
          onSetNewRate={config.setNewRate}
          getSuggestedRate={config.getSuggestedRate}
        />
      </CollapsibleCardContent>
    </CollapsibleCard>
  )
}
