import { formatCurrency } from '../utils/currency'
import { formatValueWithInflation } from './inflation-helpers'
import type { WithdrawalFormValue } from '../utils/config-storage'
import {
  OtherIncomeSection,
  HealthCareInsuranceSection,
  StatutoryPensionSection,
} from './withdrawal-card-sections'

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

interface WithdrawalYearCardProps {
  rowData: {
    year: number
    startkapital: number
    endkapital: number
    entnahme: number
    monatlicheEntnahme?: number
    inflationAnpassung?: number
    portfolioAnpassung?: number
    zinsen: number
    bezahlteSteuer: number
    vorabpauschale?: number
    genutzterFreibetrag: number
    einkommensteuer?: number
    genutzterGrundfreibetrag?: number
    otherIncome?: {
      totalNetAmount: number
      totalTaxAmount: number
      sourceCount: number
    }
    healthCareInsurance?: {
      totalAnnual: number
      healthInsuranceAnnual: number
      careInsuranceAnnual: number
      totalMonthly: number
      insuranceType: 'statutory' | 'private'
      effectiveHealthInsuranceRate?: number
      effectiveCareInsuranceRate?: number
      includesEmployerContribution?: boolean
      inflationAdjustmentFactor?: number
    }
    statutoryPension?: {
      grossAnnualAmount: number
      netAnnualAmount: number
      incomeTax: number
    }
    guenstigerPruefungResultRealizedGains?: {
      isFavorable: string
      usedTaxRate: number
      explanation: string
    }
  }
  formValue: WithdrawalFormValue
  allYears: Array<number | null | undefined>
  onCalculationInfoClick: (explanationType: string, rowData: unknown) => void
}

/**
 * Format value with inflation adjustment
 */
function formatWithInflation(params: {
  value: number
  year: number
  allYears: Array<number | null | undefined>
  formValue: WithdrawalFormValue
  showIcon?: boolean
}): string {
  return formatValueWithInflation({
    nominalValue: params.value,
    currentYear: params.year,
    allYears: params.allYears,
    inflationActive: params.formValue.inflationAktiv || false,
    inflationRatePercent: params.formValue.inflationsrate,
    showIcon: params.showIcon,
  })
}

/**
 * Card component for displaying withdrawal data for a single year
 */
export function WithdrawalYearCard({
  rowData,
  formValue,
  allYears,
  onCalculationInfoClick,
}: WithdrawalYearCardProps) {
  const isGrundfreibetragEnabled = formValue.grundfreibetragAktiv

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Year Header */}
      <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
        <span className="font-semibold text-gray-800 text-base">
          {`📅 ${rowData.year}`}
        </span>
        <span className="font-bold text-blue-600 text-lg flex items-center">
          🎯
          {' '}
          {formatWithInflation({
            value: rowData.endkapital,
            year: rowData.year,
            allYears,
            formValue,
            showIcon: true,
          })}
          <InfoIcon onClick={() => onCalculationInfoClick('endkapital', rowData)} />
        </span>
      </div>

      {/* Card Details */}
      <div className="flex flex-col gap-2">
        {/* Startkapital */}
        <div className="flex justify-between items-center py-1">
          <span className="text-sm text-gray-600 font-medium">💰 Startkapital:</span>
          <span className="font-semibold text-green-600 text-sm">
            {formatWithInflation({
              value: rowData.startkapital,
              year: rowData.year,
              allYears,
              formValue,
              showIcon: true,
            })}
          </span>
        </div>

        {/* Entnahme */}
        <div className="flex justify-between items-center py-1">
          <span className="text-sm text-gray-600 font-medium">💸 Entnahme:</span>
          <span className="font-semibold text-red-600 text-sm">
            {formatWithInflation({
              value: rowData.entnahme,
              year: rowData.year,
              allYears,
              formValue,
              showIcon: true,
            })}
          </span>
        </div>

        {/* Monthly withdrawal (monatlich_fest strategy) */}
        {formValue.strategie === 'monatlich_fest' && rowData.monatlicheEntnahme && (
          <div className="flex justify-between items-center py-1">
            <span className="text-sm text-gray-600 font-medium">📅 Monatlich:</span>
            <span className="font-semibold text-purple-600 text-sm">
              {formatCurrency(rowData.monatlicheEntnahme)}
            </span>
          </div>
        )}

        {/* Inflation adjustment */}
        {formValue.inflationAktiv && rowData.inflationAnpassung !== undefined && (
          <div className="flex justify-between items-center py-1">
            <span className="text-sm text-gray-600 font-medium">📈 Inflation:</span>
            <span className="font-semibold text-orange-600 text-sm flex items-center">
              {formatCurrency(rowData.inflationAnpassung)}
              <InfoIcon onClick={() => onCalculationInfoClick('inflation', rowData)} />
            </span>
          </div>
        )}

        {/* Guardrails adjustment */}
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

        {/* Interest */}
        <div className="flex justify-between items-center py-1">
          <span className="text-sm text-gray-600 font-medium">📈 Zinsen:</span>
          <span className="font-semibold text-cyan-600 text-sm flex items-center">
            {formatWithInflation({
              value: rowData.zinsen,
              year: rowData.year,
              allYears,
              formValue,
              showIcon: true,
            })}
            <InfoIcon onClick={() => onCalculationInfoClick('interest', rowData)} />
          </span>
        </div>

        {/* Tax paid */}
        <div className="flex justify-between items-center py-1">
          <span className="text-sm text-gray-600 font-medium">💸 Bezahlte Steuer:</span>
          <span className="font-semibold text-red-600 text-sm flex items-center">
            {formatCurrency(rowData.bezahlteSteuer)}
            <InfoIcon onClick={() => onCalculationInfoClick('tax', rowData)} />
          </span>
        </div>

        {/* Günstigerprüfung (realized gains) */}
        {rowData.guenstigerPruefungResultRealizedGains && (
          <div className="bg-blue-50 px-2 py-1 rounded space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-600 font-medium">🔍 Günstigerprüfung (Veräußerung):</span>
              <span className="font-semibold text-blue-700 text-sm">
                {rowData.guenstigerPruefungResultRealizedGains.isFavorable === 'personal' ? 'Persönlicher Steuersatz' : 'Abgeltungssteuer'}
                {' '}
                (
                {(rowData.guenstigerPruefungResultRealizedGains.usedTaxRate * 100).toFixed(2)}
                %)
              </span>
            </div>
            <div className="text-xs text-blue-600 italic">
              {rowData.guenstigerPruefungResultRealizedGains.explanation}
            </div>
          </div>
        )}

        {/* Vorabpauschale */}
        {rowData.vorabpauschale !== undefined && rowData.vorabpauschale > 0 && (
          <div className="flex justify-between items-center py-1">
            <span className="text-sm text-gray-600 font-medium">📊 Vorabpauschale:</span>
            <span className="font-semibold text-blue-700 text-sm flex items-center">
              {formatCurrency(rowData.vorabpauschale)}
              <InfoIcon onClick={() => onCalculationInfoClick('vorabpauschale', rowData)} />
            </span>
          </div>
        )}

        {/* Tax allowance used */}
        <div className="flex justify-between items-center py-1">
          <span className="text-sm text-gray-600 font-medium">🎯 Genutzter Freibetrag:</span>
          <span className="font-semibold text-green-600 text-sm">
            {formatCurrency(rowData.genutzterFreibetrag)}
          </span>
        </div>

        {/* Income tax */}
        {isGrundfreibetragEnabled && rowData.einkommensteuer !== undefined && (
          <div className="flex justify-between items-center py-1">
            <span className="text-sm text-gray-600 font-medium">🏛️ Einkommensteuer:</span>
            <span className="font-semibold text-pink-600 text-sm flex items-center">
              {formatCurrency(rowData.einkommensteuer)}
              <InfoIcon onClick={() => onCalculationInfoClick('incomeTax', rowData)} />
            </span>
          </div>
        )}

        {/* Grundfreibetrag */}
        {isGrundfreibetragEnabled && rowData.genutzterGrundfreibetrag !== undefined && (
          <div className="flex justify-between items-center py-1">
            <span className="text-sm text-gray-600 font-medium">🆓 Grundfreibetrag:</span>
            <span className="font-semibold text-green-600 text-sm flex items-center">
              {formatCurrency(rowData.genutzterGrundfreibetrag)}
              <InfoIcon onClick={() => onCalculationInfoClick('incomeTax', rowData)} />
            </span>
          </div>
        )}

        {/* Other Income Sources */}
        <OtherIncomeSection
          otherIncome={rowData.otherIncome}
          onCalculationInfoClick={onCalculationInfoClick}
          rowData={rowData}
        />

        {/* Health Care Insurance */}
        <HealthCareInsuranceSection
          healthCareInsurance={rowData.healthCareInsurance}
          onCalculationInfoClick={onCalculationInfoClick}
          rowData={rowData}
        />

        {/* Statutory Pension */}
        <StatutoryPensionSection
          statutoryPension={rowData.statutoryPension}
          onCalculationInfoClick={onCalculationInfoClick}
          rowData={rowData}
        />
      </div>
    </div>
  )
}
