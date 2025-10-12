import { Info } from 'lucide-react'
import { formatCurrency } from '../utils/currency'

interface OtherIncomeSectionProps {
  otherIncome?: {
    totalNetAmount: number
    totalTaxAmount: number
    sourceCount: number
  }
  onCalculationInfoClick: (explanationType: string, rowData: unknown) => void
  rowData: unknown
}

/**
 * Display section for other income sources
 */
export function OtherIncomeSection({
  otherIncome,
  onCalculationInfoClick,
  rowData,
}: OtherIncomeSectionProps) {
  if (!otherIncome || otherIncome.totalNetAmount <= 0) {
    return null
  }

  return (
    <>
      <div className="flex justify-between items-center py-1">
        <span className="text-sm text-gray-600 font-medium">💰 Andere Einkünfte (Netto):</span>
        <span className="font-semibold text-green-600 text-sm flex items-center">
          {formatCurrency(otherIncome.totalNetAmount)}
          <Info
            className="h-4 w-4 ml-2 cursor-pointer text-blue-600 hover:text-blue-800"
            onClick={() => onCalculationInfoClick('otherIncome', rowData)}
          />
        </span>
      </div>
      {otherIncome.totalTaxAmount > 0 && (
        <div className="flex justify-between items-center py-1">
          <span className="text-sm text-gray-600 font-medium">💸 Steuern auf andere Einkünfte:</span>
          <span className="font-semibold text-red-600 text-sm">
            {formatCurrency(otherIncome.totalTaxAmount)}
          </span>
        </div>
      )}
      <div className="flex justify-between items-center py-1">
        <span className="text-sm text-gray-600 font-medium">📊 Anzahl Einkommensquellen:</span>
        <span className="font-semibold text-blue-600 text-sm">
          {otherIncome.sourceCount}
        </span>
      </div>
    </>
  )
}

interface HealthCareInsuranceSectionProps {
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
  onCalculationInfoClick: (explanationType: string, rowData: unknown) => void
  rowData: unknown
}

/**
 * Display section for health care insurance
 */
export function HealthCareInsuranceSection({
  healthCareInsurance,
  onCalculationInfoClick,
  rowData,
}: HealthCareInsuranceSectionProps) {
  if (!healthCareInsurance || healthCareInsurance.totalAnnual <= 0) {
    return null
  }

  return (
    <>
      <div className="flex justify-between items-center py-1">
        <span className="text-sm text-gray-600 font-medium">
          🏥 Krankenversicherung (
          {healthCareInsurance.insuranceType === 'statutory' ? 'Gesetzlich' : 'Privat'}
          ):
        </span>
        <span className="font-semibold text-red-600 text-sm">
          -
          {formatCurrency(healthCareInsurance.healthInsuranceAnnual)}
          {healthCareInsurance.insuranceType === 'statutory' && healthCareInsurance.effectiveHealthInsuranceRate && (
            <span className="text-xs text-gray-500 ml-1">
              (
              {healthCareInsurance.effectiveHealthInsuranceRate.toFixed(2)}
              %)
            </span>
          )}
          {healthCareInsurance.inflationAdjustmentFactor && (
            <span className="text-xs text-gray-500 ml-1">
              (Inflationsanpassung:
              {' '}
              {(healthCareInsurance.inflationAdjustmentFactor * 100 - 100).toFixed(1)}
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
          {formatCurrency(healthCareInsurance.careInsuranceAnnual)}
          {healthCareInsurance.insuranceType === 'statutory' && healthCareInsurance.effectiveCareInsuranceRate && (
            <span className="text-xs text-gray-500 ml-1">
              (
              {healthCareInsurance.effectiveCareInsuranceRate.toFixed(2)}
              %)
            </span>
          )}
        </span>
      </div>
      <div className="flex justify-between items-center py-1 border-t border-gray-200 pt-1">
        <span className="text-sm text-gray-600 font-medium">
          🏥 Gesamt Kranken- & Pflegeversicherung:
        </span>
        <span className="font-semibold text-red-600 text-sm flex items-center">
          -
          {formatCurrency(healthCareInsurance.totalAnnual)}
          <span className="text-xs text-gray-500 ml-1">
            (
            {healthCareInsurance.insuranceType === 'statutory' ? 'Gesetzlich' : 'Privat'}
            )
            {healthCareInsurance.insuranceType === 'statutory' && !healthCareInsurance.includesEmployerContribution && ' - nur AN-Anteil'}
          </span>
          <Info
            className="h-4 w-4 ml-2 cursor-pointer text-blue-600 hover:text-blue-800"
            onClick={() => onCalculationInfoClick('healthCareInsurance', rowData)}
          />
        </span>
      </div>
      <div className="flex justify-between items-center py-1">
        <span className="text-sm text-gray-600 font-medium">📅 Monatliche Beiträge:</span>
        <span className="font-semibold text-blue-600 text-sm">
          {formatCurrency(healthCareInsurance.totalMonthly)}
        </span>
      </div>
    </>
  )
}

interface StatutoryPensionSectionProps {
  statutoryPension?: {
    grossAnnualAmount: number
    netAnnualAmount: number
    incomeTax: number
  }
  onCalculationInfoClick: (explanationType: string, rowData: unknown) => void
  rowData: unknown
}

/**
 * Display section for statutory pension
 */
export function StatutoryPensionSection({
  statutoryPension,
  onCalculationInfoClick,
  rowData,
}: StatutoryPensionSectionProps) {
  if (!statutoryPension || statutoryPension.grossAnnualAmount <= 0) {
    return null
  }

  return (
    <>
      <div className="flex justify-between items-center py-1">
        <span className="text-sm text-gray-600 font-medium">🏛️ Gesetzliche Rente (Brutto):</span>
        <span className="font-semibold text-green-600 text-sm flex items-center">
          +
          {formatCurrency(statutoryPension.grossAnnualAmount)}
          <Info
            className="h-4 w-4 ml-2 cursor-pointer text-blue-600 hover:text-blue-800"
            onClick={() => onCalculationInfoClick('statutoryPension', rowData)}
          />
        </span>
      </div>
      {statutoryPension.incomeTax > 0 && (
        <div className="flex justify-between items-center py-1">
          <span className="text-sm text-gray-600 font-medium">💸 Einkommensteuer auf Rente:</span>
          <span className="font-semibold text-red-600 text-sm">
            -
            {formatCurrency(statutoryPension.incomeTax)}
          </span>
        </div>
      )}
      <div className="flex justify-between items-center py-1 border-t border-gray-200 pt-1">
        <span className="text-sm text-gray-600 font-medium">
          🏛️ Gesetzliche Rente (Netto):
        </span>
        <span className="font-semibold text-green-600 text-sm">
          +
          {formatCurrency(statutoryPension.netAnnualAmount)}
        </span>
      </div>
      <div className="flex justify-between items-center py-1">
        <span className="text-sm text-gray-600 font-medium">📅 Monatliche Rente (Netto):</span>
        <span className="font-semibold text-green-600 text-sm">
          +
          {formatCurrency(statutoryPension.netAnnualAmount / 12)}
        </span>
      </div>
    </>
  )
}
