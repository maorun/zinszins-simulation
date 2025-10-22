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
function InsuranceRateDisplay({ rate }: { rate?: number }) {
  if (!rate) return null
  return (
    <span className="text-xs text-gray-500 ml-1">
      (
      {rate.toFixed(2)}
      %)
    </span>
  )
}

function InflationAdjustmentDisplay({ factor }: { factor?: number }) {
  if (!factor) return null
  return (
    <span className="text-xs text-gray-500 ml-1">
      (Inflationsanpassung:
      {' '}
      {(factor * 100 - 100).toFixed(1)}
      %)
    </span>
  )
}

function EmployerContributionNote({ insuranceType, includesEmployerContribution }: {
  insuranceType: 'statutory' | 'private'
  includesEmployerContribution?: boolean
}) {
  if (insuranceType !== 'statutory' || includesEmployerContribution) return null
  return <> - nur AN-Anteil</>
}

function HealthInsuranceRow({
  insuranceType,
  amount,
  effectiveRate,
  inflationFactor,
}: {
  insuranceType: 'statutory' | 'private'
  amount: number
  effectiveRate?: number
  inflationFactor?: number
}) {
  const isStatutory = insuranceType === 'statutory'

  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-gray-600 font-medium">
        🏥 Krankenversicherung (
        {isStatutory ? 'Gesetzlich' : 'Privat'}
        ):
      </span>
      <span className="font-semibold text-red-600 text-sm">
        -
        {formatCurrency(amount)}
        {isStatutory && effectiveRate && (
          <InsuranceRateDisplay rate={effectiveRate} />
        )}
        {inflationFactor && <InflationAdjustmentDisplay factor={inflationFactor} />}
      </span>
    </div>
  )
}

function CareInsuranceRow({
  insuranceType,
  amount,
  effectiveRate,
}: {
  insuranceType: 'statutory' | 'private'
  amount: number
  effectiveRate?: number
}) {
  const isStatutory = insuranceType === 'statutory'

  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-gray-600 font-medium">
        🩺 Pflegeversicherung:
      </span>
      <span className="font-semibold text-red-600 text-sm">
        -
        {formatCurrency(amount)}
        {isStatutory && effectiveRate && (
          <InsuranceRateDisplay rate={effectiveRate} />
        )}
      </span>
    </div>
  )
}

function TotalInsuranceRow({
  insuranceType,
  totalAnnual,
  includesEmployerContribution,
  onCalculationInfoClick,
  rowData,
}: {
  insuranceType: 'statutory' | 'private'
  totalAnnual: number
  includesEmployerContribution?: boolean
  onCalculationInfoClick: (explanationType: string, rowData: unknown) => void
  rowData: unknown
}) {
  const isStatutory = insuranceType === 'statutory'

  return (
    <div className="flex justify-between items-center py-1 border-t border-gray-200 pt-1">
      <span className="text-sm text-gray-600 font-medium">
        🏥 Gesamt Kranken- & Pflegeversicherung:
      </span>
      <span className="font-semibold text-red-600 text-sm flex items-center">
        -
        {formatCurrency(totalAnnual)}
        <span className="text-xs text-gray-500 ml-1">
          (
          {isStatutory ? 'Gesetzlich' : 'Privat'}
          )
          <EmployerContributionNote
            insuranceType={insuranceType}
            includesEmployerContribution={includesEmployerContribution}
          />
        </span>
        <Info
          className="h-4 w-4 ml-2 cursor-pointer text-blue-600 hover:text-blue-800"
          onClick={() => onCalculationInfoClick('healthCareInsurance', rowData)}
        />
      </span>
    </div>
  )
}

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
      <HealthInsuranceRow
        insuranceType={healthCareInsurance.insuranceType}
        amount={healthCareInsurance.healthInsuranceAnnual}
        effectiveRate={healthCareInsurance.effectiveHealthInsuranceRate}
        inflationFactor={healthCareInsurance.inflationAdjustmentFactor}
      />

      <CareInsuranceRow
        insuranceType={healthCareInsurance.insuranceType}
        amount={healthCareInsurance.careInsuranceAnnual}
        effectiveRate={healthCareInsurance.effectiveCareInsuranceRate}
      />

      <TotalInsuranceRow
        insuranceType={healthCareInsurance.insuranceType}
        totalAnnual={healthCareInsurance.totalAnnual}
        includesEmployerContribution={healthCareInsurance.includesEmployerContribution}
        onCalculationInfoClick={onCalculationInfoClick}
        rowData={rowData}
      />

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
