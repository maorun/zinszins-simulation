import type { EnhancedSummary, WithdrawalSegmentSummary } from '../../utils/summary-utils'

interface WithdrawalPhaseSectionProps {
  withdrawalStartYear: number
  withdrawalEndYear: number
  enhancedSummary: EnhancedSummary
}

function MetricCard({ icon, label, value }: { icon: string, label: string, value: string }) {
  return (
    <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1">
      <span className="font-medium text-gray-700 text-sm">
        {icon}
        {' '}
        {label}
      </span>
      <span className="font-bold text-slate-700 text-right text-sm sm:text-base">{value}</span>
    </div>
  )
}

function formatEuro(value: number): string {
  return value.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
  })
}

function SegmentCardHeader({ segment }: { segment: WithdrawalSegmentSummary }) {
  return (
    <h5 className="m-0 mb-2.5 sm:mb-3 text-slate-700 text-sm sm:text-base font-semibold">
      {segment.name}
      {' '}
      (
      {segment.startYear}
      {' '}
      -
      {' '}
      {segment.endYear}
      ) -
      {' '}
      {segment.strategy}
    </h5>
  )
}

function SegmentCard({ segment }: { segment: WithdrawalSegmentSummary }) {
  return (
    <div
      key={segment.id}
      className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 border-l-4 border-l-cyan-600"
    >
      <SegmentCardHeader segment={segment} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <MetricCard icon="🏁" label="Startkapital" value={formatEuro(segment.startkapital)} />
        <MetricCard icon="💰" label="Endkapital" value={formatEuro(segment.endkapital)} />
        <MetricCard icon="💸" label="Entnahme gesamt" value={formatEuro(segment.totalWithdrawn)} />
        {segment.averageMonthlyWithdrawal > 0 && (
          <MetricCard
            icon="💶"
            label="Monatlich Ø"
            value={formatEuro(segment.averageMonthlyWithdrawal)}
          />
        )}
      </div>
    </div>
  )
}

/**
 * Displays the withdrawal phase (Entsparphase) section in the enhanced overview
 * Handles both segmented withdrawal (multiple phases) and single withdrawal phase display
 */
// eslint-disable-next-line max-lines-per-function -- Complex business logic calculation
export function WithdrawalPhaseSection({
  withdrawalStartYear,
  withdrawalEndYear,
  enhancedSummary,
}: WithdrawalPhaseSectionProps) {
  // Only render if withdrawal data exists
  if (enhancedSummary.endkapitalEntspharphase === undefined) {
    return null
  }

  const hasSegmentedWithdrawal = enhancedSummary.isSegmentedWithdrawal
    && enhancedSummary.withdrawalSegments
    && enhancedSummary.withdrawalSegments.length > 1

  return (
    <div className="p-4 sm:p-6 border-b border-gray-200">
      <h4 className="m-0 mb-3 sm:mb-4 text-slate-700 text-base sm:text-lg font-semibold flex items-center gap-1.5 sm:gap-2">
        💸 Entsparphase (
        {withdrawalStartYear}
        {' '}
        -
        {' '}
        {withdrawalEndYear}
        )
        {hasSegmentedWithdrawal && (
          <span className="text-sm text-cyan-600 font-normal">
            {' '}
            -
            {enhancedSummary.withdrawalSegments!.length}
            {' '}
            Phasen
          </span>
        )}
      </h4>

      {hasSegmentedWithdrawal
        ? (
            <div className="flex flex-col gap-3 sm:gap-4">
              {enhancedSummary.withdrawalSegments!.map(segment => (
                <SegmentCard key={segment.id} segment={segment} />
              ))}

              {/* Overall withdrawal summary */}
              <div className="bg-green-100 border border-green-200 rounded-lg p-4 border-l-4 border-l-green-600 bg-gradient-to-r from-gray-50 to-green-50">
                <h5 className="m-0 mb-3 text-slate-700 text-base font-semibold">📊 Gesamt-Übersicht</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1 bg-gradient-to-r from-red-50 to-blue-50 border-l-blue-400 shadow-sm shadow-blue-400/20">
                    <span className="font-medium text-gray-700 text-sm">🏁 Endkapital Gesamt</span>
                    <span className="font-bold text-slate-700 text-right">
                      {enhancedSummary.endkapitalEntspharphase.toLocaleString(
                        'de-DE',
                        { style: 'currency', currency: 'EUR' },
                      )}
                    </span>
                  </div>
                  {enhancedSummary.monatlicheAuszahlung && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1 bg-gradient-to-r from-red-50 to-blue-50 border-l-blue-400 shadow-sm shadow-blue-400/20">
                      <span className="font-medium text-gray-700 text-sm">💶 Letzte Monatl. Auszahlung</span>
                      <span className="font-bold text-cyan-600 text-lg text-right">
                        {enhancedSummary.monatlicheAuszahlung.toLocaleString(
                          'de-DE',
                          { style: 'currency', currency: 'EUR' },
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Display single withdrawal phase (original format)
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1">
                <span className="font-medium text-gray-700 text-sm">🏁 Endkapital Entsparphase</span>
                <span className="font-bold text-slate-700 text-right">
                  {enhancedSummary.endkapitalEntspharphase.toLocaleString(
                    'de-DE',
                    { style: 'currency', currency: 'EUR' },
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1 bg-gradient-to-r from-red-50 to-blue-50 border-l-blue-400 shadow-sm shadow-blue-400/20">
                <span className="font-medium text-gray-700 text-sm">💶 Monatliche Auszahlung</span>
                <span className="font-bold text-cyan-600 text-lg text-right">
                  {(enhancedSummary.monatlicheAuszahlung || 0).toLocaleString(
                    'de-DE',
                    { style: 'currency', currency: 'EUR' },
                  )}
                </span>
              </div>
            </div>
          )}
    </div>
  )
}
