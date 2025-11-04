import type { OtherIncomeSource } from '../../../helpers/other-income'
import { AmountTypeSection } from './AmountTypeSection'
import { TaxRateSection } from './TaxRateSection'
import { InflationRateSection } from './InflationRateSection'
import { MonthlyAmountSection } from './MonthlyAmountSection'
import { TimePeriodSection } from './TimePeriodSection'
import { RealEstateConfigSection } from './RealEstateConfigSection'
import { KindergeldConfigSection } from './KindergeldConfigSection'

interface FormConfigurationSectionsProps {
  editingSource: OtherIncomeSource
  monthlyAmountId: string
  currentYear: number
  isKindergeld: boolean
  isRental: boolean
  isGrossIncome: boolean
  onUpdate: (source: OtherIncomeSource) => void
}

export function FormConfigurationSections({
  editingSource,
  monthlyAmountId,
  currentYear,
  isKindergeld,
  isRental,
  isGrossIncome,
  onUpdate,
}: FormConfigurationSectionsProps) {
  return (
    <>
      {!isKindergeld && (
        <AmountTypeSection editingSource={editingSource} onUpdate={onUpdate} />
      )}

      <MonthlyAmountSection
        editingSource={editingSource}
        monthlyAmountId={monthlyAmountId}
        isKindergeld={isKindergeld}
        isGrossIncome={isGrossIncome}
        onUpdate={onUpdate}
      />

      {isGrossIncome && (
        <TaxRateSection editingSource={editingSource} onUpdate={onUpdate} />
      )}

      <TimePeriodSection
        editingSource={editingSource}
        currentYear={currentYear}
        onUpdate={onUpdate}
      />

      {!isKindergeld && (
        <InflationRateSection editingSource={editingSource} onUpdate={onUpdate} />
      )}

      {isRental && (
        <RealEstateConfigSection
          editingSource={editingSource}
          onUpdate={onUpdate}
        />
      )}

      {isKindergeld && (
        <KindergeldConfigSection
          editingSource={editingSource}
          onUpdate={onUpdate}
        />
      )}
    </>
  )
}
