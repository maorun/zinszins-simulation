import { lazy } from 'react'
import { ConfigurationSection } from './ConfigurationSection'

// Lazy load real estate configuration components
const EigenheimVsMieteComparison = lazy(() =>
  import('../EigenheimVsMieteComparison').then(m => ({ default: m.EigenheimVsMieteComparison })),
)
const ImmobilienTeilverkauf = lazy(() =>
  import('../teilverkauf/ImmobilienTeilverkauf').then(m => ({ default: m.ImmobilienTeilverkauf })),
)

/**
 * Real Estate Configuration Sections
 * Groups together home ownership vs. renting comparison and partial sale with lifelong residence rights
 */
export function RealEstateConfigurations() {
  return (
    <>
      {/* Eigenheim vs. Miete Comparison */}
      <ConfigurationSection Component={EigenheimVsMieteComparison} />

      {/* Real Estate Partial Sale with Lifelong Residence Rights */}
      <ConfigurationSection Component={ImmobilienTeilverkauf} />
    </>
  )
}
