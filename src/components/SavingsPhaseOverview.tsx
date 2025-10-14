interface SavingsPhaseOverviewProps {
  savingsStartYear: number
  savingsEndYear: number
  startkapital: number
  endkapital: number
  zinsen: number
  renditeAnsparphase: number
}

export function SavingsPhaseOverview({
  savingsStartYear,
  savingsEndYear,
  startkapital,
  endkapital,
  zinsen,
  renditeAnsparphase,
}: SavingsPhaseOverviewProps) {
  return (
    <div className="p-4 sm:p-6 border-b border-gray-200">
      <h4 className="m-0 mb-3 sm:mb-4 text-slate-700 text-base sm:text-lg font-semibold flex items-center gap-1.5 sm:gap-2">
        📈 Ansparphase (
        {savingsStartYear}
        {' '}
        -
        {' '}
        {savingsEndYear}
        )
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1 bg-gradient-to-r from-red-50 to-blue-50 border-l-blue-400 shadow-sm shadow-blue-400/20">
          <span className="font-medium text-gray-700 text-sm">💰 Gesamte Einzahlungen</span>
          <span className="font-bold text-slate-700 text-right text-sm sm:text-base">
            {startkapital.toLocaleString('de-DE', {
              style: 'currency',
              currency: 'EUR',
            })}
          </span>
        </div>
        <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1 bg-gradient-to-r from-red-50 to-blue-50 border-l-blue-400 shadow-sm shadow-blue-400/20">
          <span className="font-medium text-gray-700 text-sm">🎯 Endkapital Ansparphase</span>
          <span className="font-bold text-green-600 text-base sm:text-lg text-right">
            {endkapital.toLocaleString('de-DE', {
              style: 'currency',
              currency: 'EUR',
            })}
          </span>
        </div>
        <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1">
          <span className="font-medium text-gray-700 text-sm">📊 Gesamtzinsen Ansparphase</span>
          <span className="font-bold text-slate-700 text-right text-sm sm:text-base">
            {zinsen.toLocaleString('de-DE', {
              style: 'currency',
              currency: 'EUR',
            })}
          </span>
        </div>
        <div className="flex justify-between items-center p-2.5 sm:p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 transition-all hover:bg-gray-100 hover:translate-x-1">
          <span className="font-medium text-gray-700 text-sm">📈 Rendite Ansparphase</span>
          <span className="font-bold text-slate-700 text-right text-sm sm:text-base">
            {renditeAnsparphase.toFixed(2)}
            % p.a.
          </span>
        </div>
      </div>
    </div>
  )
}
