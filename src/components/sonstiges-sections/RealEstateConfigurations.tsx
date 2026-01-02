import { lazy } from 'react'
import { CollapsibleCategory } from './CollapsibleCategory'
import { ConfigurationSection } from './ConfigurationSection'

// Lazy load real estate configuration components
const EigenheimVsMieteComparison = lazy(() =>
  import('../EigenheimVsMieteComparison').then(m => ({ default: m.EigenheimVsMieteComparison })),
)
const ImmobilienLeverageComparison = lazy(() =>
  import('../ImmobilienLeverageComparison').then(m => ({ default: m.ImmobilienLeverageComparison })),
)
const ImmobilienTeilverkauf = lazy(() =>
  import('../teilverkauf/ImmobilienTeilverkauf').then(m => ({ default: m.ImmobilienTeilverkauf })),
)

/**
 * Real Estate Configuration Sections
 * Groups together home ownership vs. renting comparison, leverage analysis, and partial sale with lifelong residence rights
 */
export function RealEstateConfigurations() {
  return (
    <CollapsibleCategory title="Immobilien-Analysen" icon="🏠" defaultOpen={false} nestingLevel={0}>
      {/* Eigenheim vs. Miete Vergleich */}
      <ConfigurationSection Component={EigenheimVsMieteComparison} />

      {/* Immobilien-Leverage-Analyse */}
      <ConfigurationSection Component={ImmobilienLeverageComparison} />

      {/* Immobilien-Teilverkauf mit Nießbrauchrecht */}
      <ConfigurationSection Component={ImmobilienTeilverkauf} />
    </CollapsibleCategory>
  )
}
