import type { OtherIncomeSource } from '../../../helpers/other-income'
import { RealEstateDetails } from './RealEstateDetails'

interface IncomeSourceDetailsProps {
  source: OtherIncomeSource
}

export function IncomeSourceDetails({ source }: IncomeSourceDetailsProps) {
  return (
    <div className="text-sm text-gray-600 space-y-1">
      <div>
        💰
        {' '}
        {source.monthlyAmount.toLocaleString('de-DE')}
        {' '}
        €/Monat
        (
        {(source.monthlyAmount * 12).toLocaleString('de-DE')}
        {' '}
        €/Jahr)
      </div>
      <div>
        📅
        {' '}
        {source.startYear}
        {' '}
        -
        {' '}
        {source.endYear || 'Unbegrenzt'}
      </div>
      <div>
        📈
        {' '}
        {source.inflationRate}
        % Inflation
        {source.amountType === 'gross' && `, ${source.taxRate}% Steuersatz`}
      </div>
      {/* Real Estate Details */}
      {source.type === 'rental' && source.realEstateConfig && (
        <RealEstateDetails config={source.realEstateConfig} />
      )}
      {source.notes && (
        <div className="text-gray-500">
          📝
          {source.notes}
        </div>
      )}
    </div>
  )
}
