import { lazy } from 'react'
import { CollapsibleCategory } from './CollapsibleCategory'
import { ConfigurationSection } from './ConfigurationSection'

// Lazy load tax configuration component
const TaxConfiguration = lazy(() => import('../TaxConfiguration'))

interface SteuerKonfigurationSectionProps {
  planningMode?: 'individual' | 'couple'
}

/**
 * Steuer-Konfiguration Section - Tax configuration category
 * Groups together all tax-related configuration tools
 * Includes: Tax settings, Freistellungsauftrag optimization, multi-year loss planning,
 * portfolio Teilfreistellung calculator, and 20+ additional tax tools
 */
export function SteuerKonfigurationSection({ planningMode = 'individual' }: SteuerKonfigurationSectionProps) {
  return (
    <CollapsibleCategory title="Steuer-Konfiguration" icon="💰" defaultOpen={false} nestingLevel={0}>
      {/* TaxConfiguration component contains all nested tax tools */}
      <ConfigurationSection Component={TaxConfiguration} componentProps={{ planningMode }} />
    </CollapsibleCategory>
  )
}
