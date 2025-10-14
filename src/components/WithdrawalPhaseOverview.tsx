interface WithdrawalSegment {
  id: string
  name: string
  startYear: number
  endYear: number
  strategy: string
  startkapital: number
  endkapital: number
  totalWithdrawn: number
  averageMonthlyWithdrawal: number
}

interface WithdrawalPhaseOverviewProps {
  withdrawalStartYear: number
  withdrawalEndYear: number
  endkapitalEntspharphase: number
  monatlicheAuszahlung: number | undefined
  isSegmentedWithdrawal?: boolean
  withdrawalSegments?: WithdrawalSegment[]
}

export function WithdrawalPhaseOverview({
  withdrawalStartYear,
  withdrawalEndYear,
  endkapitalEntspharphase,
  monatlicheAuszahlung,
  isSegmentedWithdrawal,
  withdrawalSegments,
}: WithdrawalPhaseOverviewProps) {
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
        {isSegmentedWithdrawal
          && withdrawalSegments
          && withdrawalSegments.length > 1 && (
          <span className="text-sm text-cyan-600 font-normal">
            {' '}
            -
            {withdrawalSegments.length}
            {' '}
            Phasen
          </span>
        )}
      </h4>

      {isSegmentedWithdrawal
        && withdrawalSegments
        && withdrawalSegments.length > 1
        ? (
      // Display segmented withdrawal phases
            <div className="flex flex-col gap-3 sm:gap-4">
              {withdrawalSegments.map(segment => (
                <div
                  key={segment.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 border-l-4 border-l-cyan-600"
                >
                  <h5 className="m-0 mb-2.5 sm:mb-3 text-slate-700 text-sm sm:text-base font-semibold">
                    {segment.name}
                    {' '}
                    (
                    {segment.startYear}
                    {' '}
                    -
                    {segment.endYear}
                    ) -
                    {segment.strategy}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1">
                      <span className="font-medium text-gray-700 text-sm">🏁 Startkapital</span>
                      <span className="font-bold text-slate-700 text-right text-sm sm:text-base">
                        {segment.startkapital.toLocaleString('de-DE', {
                          style: 'currency',
                          currency: 'EUR',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1">
                      <span className="font-medium text-gray-700 text-sm">💰 Endkapital</span>
                      <span className="font-bold text-slate-700 text-right">
                        {segment.endkapital.toLocaleString('de-DE', {
                          style: 'currency',
                          currency: 'EUR',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1">
                      <span className="font-medium text-gray-700 text-sm">💸 Entnahme gesamt</span>
                      <span className="font-bold text-slate-700 text-right">
                        {segment.totalWithdrawn.toLocaleString('de-DE', {
                          style: 'currency',
                          currency: 'EUR',
                        })}
                      </span>
                    </div>
                    {segment.averageMonthlyWithdrawal > 0 && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1">
                        <span className="font-medium text-gray-700 text-sm">💶 Monatlich Ø</span>
                        <span className="font-bold text-slate-700 text-right">
                          {segment.averageMonthlyWithdrawal.toLocaleString('de-DE', {
                            style: 'currency',
                            currency: 'EUR',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Overall withdrawal summary */}
              <div className="bg-green-100 border border-green-200 rounded-lg p-4 border-l-4 border-l-green-600 bg-gradient-to-r from-gray-50 to-green-50">
                <h5 className="m-0 mb-3 text-slate-700 text-base font-semibold">📊 Gesamt-Übersicht</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1 bg-gradient-to-r from-red-50 to-blue-50 border-l-blue-400 shadow-sm shadow-blue-400/20">
                    <span className="font-medium text-gray-700 text-sm">🏁 Endkapital Gesamt</span>
                    <span className="font-bold text-slate-700 text-right">
                      {endkapitalEntspharphase.toLocaleString(
                        'de-DE',
                        { style: 'currency', currency: 'EUR' },
                      )}
                    </span>
                  </div>
                  {monatlicheAuszahlung && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1 bg-gradient-to-r from-red-50 to-blue-50 border-l-blue-400 shadow-sm shadow-blue-400/20">
                      <span className="font-medium text-gray-700 text-sm">💶 Letzte Monatl. Auszahlung</span>
                      <span className="font-bold text-cyan-600 text-lg text-right">
                        {monatlicheAuszahlung.toLocaleString(
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
                  {endkapitalEntspharphase.toLocaleString(
                    'de-DE',
                    { style: 'currency', currency: 'EUR' },
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1 bg-gradient-to-r from-red-50 to-blue-50 border-l-blue-400 shadow-sm shadow-blue-400/20">
                <span className="font-medium text-gray-700 text-sm">💶 Monatliche Auszahlung</span>
                <span className="font-bold text-cyan-600 text-lg text-right">
                  {(monatlicheAuszahlung || 0).toLocaleString(
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
