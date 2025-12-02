import { lazy, Suspense } from 'react'
import WithdrawalPlan from './WithdrawalPlan'
import { Card, CardContent } from './ui/card'

// Lazy load Immobilien-Teilverkauf component
const ImmobilienTeilverkauf = lazy(() =>
  import('./teilverkauf/ImmobilienTeilverkauf').then(m => ({ default: m.ImmobilienTeilverkauf })),
)

/**
 * Loading fallback component
 */
function LoadingCard() {
  return (
    <Card className="mb-3 sm:mb-4">
      <CardContent className="py-4 text-center text-gray-500 text-sm">Lädt Konfiguration...</CardContent>
    </Card>
  )
}

/**
 * Entnahme View - All withdrawal-related functionality
 * Includes intelligent withdrawal strategies and simulations
 */
export function EntnahmeView() {
  return (
    <div className="space-y-4">
      {/* Withdrawal Plan with Strategies and Risk Assessment */}
      <WithdrawalPlan />

      {/* Real Estate Partial Sale with Lifelong Residence Rights */}
      <Suspense fallback={<LoadingCard />}>
        <ImmobilienTeilverkauf />
      </Suspense>
    </div>
  )
}
