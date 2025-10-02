import { formatCurrency } from '../utils/currency'
import type { WithdrawalResult } from '../../helpers/withdrawal'
import type { WithdrawalFormValue, ComparisonStrategy, SegmentedComparisonStrategy } from '../utils/config-storage'
import { WithdrawalComparisonDisplay } from './WithdrawalComparisonDisplay'
import { SegmentedWithdrawalComparisonDisplay } from './SegmentedWithdrawalComparisonDisplay'

// Info icon component for calculation explanations
const InfoIcon = ({ onClick }: { onClick: () => void }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      marginLeft: '0.5rem',
      cursor: 'pointer',
      color: '#1976d2',
      verticalAlign: 'middle',
    }}
    onClick={onClick}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9,9h0a3,3,0,0,1,6,0c0,2-3,3-3,3"></path>
    <path d="M12,17h.01"></path>
  </svg>
)

// Type for segmented comparison results
type SegmentedComparisonResult = {
  strategy: SegmentedComparisonStrategy
  finalCapital: number
  totalWithdrawal: number
  averageAnnualWithdrawal: number
  duration: number | string
  result: any // Full withdrawal result for detailed analysis
}

// Type for comparison results
type ComparisonResult = {
  strategy: ComparisonStrategy
  finalCapital: number
  totalWithdrawal: number
  averageAnnualWithdrawal: number
  duration: number | string
}

interface EntnahmeSimulationDisplayProps {
  withdrawalData: {
    startingCapital: number
    withdrawalArray: any[]
    withdrawalResult: WithdrawalResult
    duration: number | null
  } | null
  formValue: WithdrawalFormValue
  useComparisonMode: boolean
  comparisonResults: ComparisonResult[]
  useSegmentedWithdrawal: boolean
  withdrawalSegments: any[]
  useSegmentedComparisonMode?: boolean
  segmentedComparisonResults?: SegmentedComparisonResult[]
  onCalculationInfoClick: (explanationType: string, rowData: any) => void
  // Global Grundfreibetrag configuration
  grundfreibetragAktiv?: boolean
  grundfreibetragBetrag?: number
}

export function EntnahmeSimulationDisplay({
  withdrawalData,
  formValue,
  useComparisonMode,
  comparisonResults,
  useSegmentedWithdrawal,
  withdrawalSegments,
  useSegmentedComparisonMode = false,
  segmentedComparisonResults = [],
  onCalculationInfoClick,
  grundfreibetragAktiv,
  grundfreibetragBetrag,
}: EntnahmeSimulationDisplayProps) {
  if (!withdrawalData) {
    return (
      <div>
        <p>
          Keine Daten verfügbar. Bitte stelle sicher, dass Sparpläne
          definiert sind und eine Simulation durchgeführt wurde.
        </p>
      </div>
    )
  }

  if (useSegmentedComparisonMode) {
    return (
      <SegmentedWithdrawalComparisonDisplay
        withdrawalData={withdrawalData}
        segmentedComparisonResults={segmentedComparisonResults}
      />
    )
  }

  if (useComparisonMode) {
    return (
      <WithdrawalComparisonDisplay
        withdrawalData={withdrawalData}
        formValue={formValue}
        comparisonResults={comparisonResults}
      />
    )
  }

  // Regular single strategy simulation results
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h4>Entnahme-Simulation</h4>
        <p>
          <strong>Startkapital bei Entnahme:</strong>
          {' '}
          {formatCurrency(withdrawalData.startingCapital)}
        </p>
        {formValue.strategie === 'monatlich_fest'
          ? (
              <>
                <p>
                  <strong>Monatliche Entnahme (Basis):</strong>
                  {' '}
                  {formatCurrency(formValue.monatlicheBetrag)}
                </p>
                <p>
                  <strong>Jährliche Entnahme (Jahr 1):</strong>
                  {' '}
                  {formatCurrency(formValue.monatlicheBetrag * 12)}
                </p>
                {formValue.guardrailsAktiv && (
                  <p>
                    <strong>Dynamische Anpassung:</strong>
                    {' '}
                    Aktiviert
                    (Schwelle:
                    {formValue.guardrailsSchwelle}
                    %)
                  </p>
                )}
              </>
            )
          : formValue.strategie === 'variabel_prozent'
            ? (
                <p>
                  <strong>
                    Jährliche Entnahme (
                    {formValue.variabelProzent}
                    {' '}
                    Prozent
                    Regel):
                  </strong>
                  {' '}
                  {formatCurrency(
                    withdrawalData.startingCapital
                    * (formValue.variabelProzent / 100),
                  )}
                </p>
              )
            : formValue.strategie === 'dynamisch'
              ? (
                  <>
                    <p>
                      <strong>Basis-Entnahmerate:</strong>
                      {' '}
                      {formValue.dynamischBasisrate}
                      %
                    </p>
                    <p>
                      <strong>Jährliche Basis-Entnahme:</strong>
                      {' '}
                      {formatCurrency(
                        withdrawalData.startingCapital
                        * (formValue.dynamischBasisrate / 100),
                      )}
                    </p>
                    <p>
                      <strong>Obere Schwelle:</strong>
                      {' '}
                      {formValue.dynamischObereSchwell}
                      % Rendite →
                      {' '}
                      {formValue.dynamischObereAnpassung > 0 ? '+' : ''}
                      {formValue.dynamischObereAnpassung}
                      % Anpassung
                    </p>
                    <p>
                      <strong>Untere Schwelle:</strong>
                      {' '}
                      {formValue.dynamischUntereSchwell}
                      % Rendite →
                      {' '}
                      {formValue.dynamischUntereAnpassung}
                      % Anpassung
                    </p>
                  </>
                )
              : (
                  <p>
                    <strong>
                      Jährliche Entnahme (
                      {formValue.strategie === '4prozent'
                        ? '4 Prozent'
                        : '3 Prozent'}
                      {' '}
                      Regel):
                    </strong>
                    {' '}
                    {formatCurrency(
                      withdrawalData.startingCapital
                      * (formValue.strategie === '4prozent' ? 0.04 : 0.03),
                    )}
                  </p>
                )}
        {formValue.inflationAktiv && (
          <p>
            <strong>Inflationsrate:</strong>
            {' '}
            {formValue.inflationsrate}
            % p.a. (Entnahmebeträge werden
            jährlich angepasst)
          </p>
        )}
        <p>
          <strong>Erwartete Rendite:</strong>
          {' '}
          {formValue.rendite}
          {' '}
          Prozent p.a.
        </p>
        {(() => {
          // Show Grundfreibetrag information for segmented withdrawal
          if (useSegmentedWithdrawal) {
            const segmentsWithGrundfreibetrag = withdrawalSegments.filter(segment => segment.enableGrundfreibetrag)
            if (segmentsWithGrundfreibetrag.length > 0) {
              return (
                <div>
                  <strong>Grundfreibetrag-Phasen:</strong>
                  {segmentsWithGrundfreibetrag.map((segment, _index) => {
                    const grundfreibetragAmount = segment.grundfreibetragPerYear?.[segment.startYear] || 10908
                    const incomeTaxRate = (segment.incomeTaxRate || 0.18) * 100
                    return (
                      <div key={segment.id} style={{ marginLeft: '10px', fontSize: '14px' }}>
                        •
                        {' '}
                        {segment.name}
                        {' '}
                        (
                        {segment.startYear}
                        -
                        {segment.endYear}
                        ):
                        {' '}
                        {formatCurrency(grundfreibetragAmount)}
                        {' '}
                        pro Jahr (Einkommensteuersatz:
                        {' '}
                        {incomeTaxRate.toFixed(0)}
                        %)
                      </div>
                    )
                  })}
                </div>
              )
            }
            return null
          }
          else if (grundfreibetragAktiv && grundfreibetragBetrag) {
            return (
              <p>
                <strong>Grundfreibetrag:</strong>
                {' '}
                {formatCurrency(grundfreibetragBetrag)}
                {' '}
                pro Jahr
                (Einkommensteuersatz:
                {formValue.einkommensteuersatz}
                %)
              </p>
            )
          }
          return null
        })()}
        <p>
          <strong>Vermögen reicht für:</strong>
          {' '}
          {withdrawalData.duration
            ? `${withdrawalData.duration} Jahr${withdrawalData.duration === 1 ? '' : 'e'}`
            : 'unbegrenzt (Vermögen wächst weiter)'}
        </p>
      </div>

      {/* Card Layout for All Devices */}
      <div className="flex flex-col gap-4">
        {withdrawalData.withdrawalArray.map((rowData, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
              <span className="font-semibold text-gray-800 text-base">
                📅
                {' '}
                {rowData.year}
              </span>
              <span className="font-bold text-blue-600 text-lg flex items-center">
                🎯
                {' '}
                {formatCurrency(rowData.endkapital)}
                <InfoIcon onClick={() => onCalculationInfoClick('endkapital', rowData)} />
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-600 font-medium">💰 Startkapital:</span>
                <span className="font-semibold text-green-600 text-sm">
                  {formatCurrency(rowData.startkapital)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-600 font-medium">💸 Entnahme:</span>
                <span className="font-semibold text-red-600 text-sm">
                  {formatCurrency(rowData.entnahme)}
                </span>
              </div>
              {formValue.strategie === 'monatlich_fest'
                && rowData.monatlicheEntnahme && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-600 font-medium">📅 Monatlich:</span>
                  <span className="font-semibold text-purple-600 text-sm">
                    {formatCurrency(rowData.monatlicheEntnahme)}
                  </span>
                </div>
              )}
              {formValue.inflationAktiv
                && rowData.inflationAnpassung !== undefined && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-600 font-medium">📈 Inflation:</span>
                  <span className="font-semibold text-orange-600 text-sm flex items-center">
                    {formatCurrency(rowData.inflationAnpassung)}
                    <InfoIcon onClick={() => onCalculationInfoClick('inflation', rowData)} />
                  </span>
                </div>
              )}
              {formValue.strategie === 'monatlich_fest'
                && formValue.guardrailsAktiv
                && rowData.portfolioAnpassung !== undefined && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-600 font-medium">🛡️ Guardrails:</span>
                  <span className="font-semibold text-teal-600 text-sm">
                    {formatCurrency(rowData.portfolioAnpassung)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-600 font-medium">📈 Zinsen:</span>
                <span className="font-semibold text-cyan-600 text-sm flex items-center">
                  {formatCurrency(rowData.zinsen)}
                  <InfoIcon onClick={() => onCalculationInfoClick('interest', rowData)} />
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-600 font-medium">💸 Bezahlte Steuer:</span>
                <span className="font-semibold text-red-600 text-sm flex items-center">
                  {formatCurrency(rowData.bezahlteSteuer)}
                  <InfoIcon onClick={() => onCalculationInfoClick('tax', rowData)} />
                </span>
              </div>
              {rowData.vorabpauschale !== undefined && rowData.vorabpauschale > 0 && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-600 font-medium">📊 Vorabpauschale:</span>
                  <span className="font-semibold text-blue-700 text-sm flex items-center">
                    {formatCurrency(rowData.vorabpauschale)}
                    <InfoIcon onClick={() => onCalculationInfoClick('vorabpauschale', rowData)} />
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-600 font-medium">🎯 Genutzter Freibetrag:</span>
                <span className="font-semibold text-green-600 text-sm">
                  {formatCurrency(rowData.genutzterFreibetrag)}
                </span>
              </div>
              {(() => {
                // Check if Grundfreibetrag is enabled for this year
                const isGrundfreibetragEnabled = useSegmentedWithdrawal
                  ? withdrawalSegments.some(segment =>
                      rowData.year >= segment.startYear
                      && rowData.year <= segment.endYear
                      && segment.enableGrundfreibetrag,
                    )
                  : formValue.grundfreibetragAktiv

                return isGrundfreibetragEnabled && rowData.einkommensteuer !== undefined && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600 font-medium">🏛️ Einkommensteuer:</span>
                    <span className="font-semibold text-pink-600 text-sm flex items-center">
                      {formatCurrency(rowData.einkommensteuer)}
                      <InfoIcon onClick={() => onCalculationInfoClick('incomeTax', rowData)} />
                    </span>
                  </div>
                )
              })()}
              {(() => {
                // Check if Grundfreibetrag is enabled for this year
                const isGrundfreibetragEnabled = useSegmentedWithdrawal
                  ? withdrawalSegments.some(segment =>
                      rowData.year >= segment.startYear
                      && rowData.year <= segment.endYear
                      && segment.enableGrundfreibetrag,
                    )
                  : formValue.grundfreibetragAktiv

                return isGrundfreibetragEnabled && rowData.genutzterGrundfreibetrag !== undefined && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600 font-medium">🆓 Grundfreibetrag:</span>
                    <span className="font-semibold text-green-600 text-sm flex items-center">
                      {formatCurrency(
                        rowData.genutzterGrundfreibetrag,
                      )}
                      <InfoIcon onClick={() => onCalculationInfoClick('incomeTax', rowData)} />
                    </span>
                  </div>
                )
              })()}
              {/* Other Income Sources Display */}
              {rowData.otherIncome && rowData.otherIncome.totalNetAmount > 0 && (
                <>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600 font-medium">💰 Andere Einkünfte (Netto):</span>
                    <span className="font-semibold text-green-600 text-sm flex items-center">
                      {formatCurrency(rowData.otherIncome.totalNetAmount)}
                      <InfoIcon onClick={() => onCalculationInfoClick('otherIncome', rowData)} />
                    </span>
                  </div>
                  {rowData.otherIncome.totalTaxAmount > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-600 font-medium">💸 Steuern auf andere Einkünfte:</span>
                      <span className="font-semibold text-red-600 text-sm">
                        {formatCurrency(rowData.otherIncome.totalTaxAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600 font-medium">📊 Anzahl Einkommensquellen:</span>
                    <span className="font-semibold text-blue-600 text-sm">
                      {rowData.otherIncome.sourceCount}
                    </span>
                  </div>
                </>
              )}
              {/* Health Care Insurance Display */}
              {rowData.healthCareInsurance && rowData.healthCareInsurance.totalAnnual > 0 && (
                <>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600 font-medium">
                      🏥 Krankenversicherung (
                      {rowData.healthCareInsurance.insuranceType === 'statutory' ? 'Gesetzlich' : 'Privat'}
                      ):
                    </span>
                    <span className="font-semibold text-red-600 text-sm">
                      -
                      {formatCurrency(rowData.healthCareInsurance.healthInsuranceAnnual)}
                      {rowData.healthCareInsurance.insuranceType === 'statutory' && rowData.healthCareInsurance.effectiveHealthInsuranceRate && (
                        <span className="text-xs text-gray-500 ml-1">
                          (
                          {rowData.healthCareInsurance.effectiveHealthInsuranceRate.toFixed(2)}
                          %)
                        </span>
                      )}
                      {rowData.healthCareInsurance.inflationAdjustmentFactor && (
                        <span className="text-xs text-gray-500 ml-1">
                          (Inflationsanpassung:
                          {' '}
                          {(rowData.healthCareInsurance.inflationAdjustmentFactor * 100 - 100).toFixed(1)}
                          %)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600 font-medium">
                      🩺 Pflegeversicherung:
                    </span>
                    <span className="font-semibold text-red-600 text-sm">
                      -
                      {formatCurrency(rowData.healthCareInsurance.careInsuranceAnnual)}
                      {rowData.healthCareInsurance.insuranceType === 'statutory' && rowData.healthCareInsurance.effectiveCareInsuranceRate && (
                        <span className="text-xs text-gray-500 ml-1">
                          (
                          {rowData.healthCareInsurance.effectiveCareInsuranceRate.toFixed(2)}
                          %)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-t border-gray-200 pt-1">
                    <span className="text-sm text-gray-600 font-medium">
                      🏥 Gesamt Kranken- & Pflegeversicherung:
                    </span>
                    <span className="font-semibold text-red-600 text-sm">
                      -
                      {formatCurrency(rowData.healthCareInsurance.totalAnnual)}
                      <span className="text-xs text-gray-500 ml-1">
                        (
                        {rowData.healthCareInsurance.insuranceType === 'statutory' ? 'Gesetzlich' : 'Privat'}
                        )
                        {rowData.healthCareInsurance.insuranceType === 'statutory' && !rowData.healthCareInsurance.includesEmployerContribution && ' - nur AN-Anteil'}
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600 font-medium">📅 Monatliche Beiträge:</span>
                    <span className="font-semibold text-blue-600 text-sm">
                      {formatCurrency(rowData.healthCareInsurance.totalMonthly)}
                    </span>
                  </div>
                </>
              )}
              {/* Statutory Pension Display */}
              {rowData.statutoryPension && rowData.statutoryPension.grossAnnualAmount > 0 && (
                <>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600 font-medium">🏛️ Gesetzliche Rente (Brutto):</span>
                    <span className="font-semibold text-green-600 text-sm flex items-center">
                      +
                      {formatCurrency(rowData.statutoryPension.grossAnnualAmount)}
                      <InfoIcon onClick={() => onCalculationInfoClick('statutoryPension', rowData)} />
                    </span>
                  </div>
                  {rowData.statutoryPension.incomeTax > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-sm text-gray-600 font-medium">💸 Einkommensteuer auf Rente:</span>
                      <span className="font-semibold text-red-600 text-sm">
                        -
                        {formatCurrency(rowData.statutoryPension.incomeTax)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-1 border-t border-gray-200 pt-1">
                    <span className="text-sm text-gray-600 font-medium">
                      🏛️ Gesetzliche Rente (Netto):
                    </span>
                    <span className="font-semibold text-green-600 text-sm">
                      +
                      {formatCurrency(rowData.statutoryPension.netAnnualAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600 font-medium">📅 Monatliche Rente (Netto):</span>
                    <span className="font-semibold text-green-600 text-sm">
                      +
                      {formatCurrency(rowData.statutoryPension.netAnnualAmount / 12)}
                    </span>
                  </div>
                </>
              )}
              {/* New section for taxable income */}
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-600 font-medium">💰 Zu versteuerndes Einkommen:</span>
                <span className="font-semibold text-gray-600 text-sm flex items-center">
                  {(() => {
                    // Use the calculated taxableIncome from withdrawal calculation if available
                    if (rowData.taxableIncome !== undefined) {
                      return formatCurrency(rowData.taxableIncome)
                    }

                    // Fallback to old calculation for backwards compatibility
                    // (though this is incorrect for multiple income sources)
                    const grundfreibetragAmount = useSegmentedWithdrawal
                      ? (() => {
                          const applicableSegment = withdrawalSegments.find(segment =>
                            rowData.year >= segment.startYear && rowData.year <= segment.endYear,
                          )
                          return applicableSegment?.enableGrundfreibetrag
                            ? (applicableSegment.grundfreibetragPerYear?.[rowData.year] || 10908)
                            : 0
                        })()
                      : (formValue.grundfreibetragAktiv ? (formValue.grundfreibetragBetrag || 10908) : 0)

                    return formatCurrency(Math.max(0, rowData.entnahme - grundfreibetragAmount))
                  })()}
                  <InfoIcon onClick={() => onCalculationInfoClick('taxableIncome', rowData)} />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
