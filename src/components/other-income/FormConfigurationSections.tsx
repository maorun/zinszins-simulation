import type { OtherIncomeSource } from '../../../helpers/other-income'
import { AmountTypeSection } from './AmountTypeSection'
import { TaxRateSection } from './TaxRateSection'
import { InflationRateSection } from './InflationRateSection'
import { MonthlyAmountSection } from './MonthlyAmountSection'
import { TimePeriodSection } from './TimePeriodSection'
import { RealEstateConfigSection } from './RealEstateConfigSection'
import { KindergeldConfigSection } from './KindergeldConfigSection'
import { BURenteConfigSection } from './BURenteConfigSection'

interface FormConfigurationSectionsProps {
  editingSource: OtherIncomeSource
  monthlyAmountId: string
  currentYear: number
  isKindergeld: boolean
  isBURente: boolean
  isRental: boolean
  isGrossIncome: boolean
  onUpdate: (source: OtherIncomeSource) => void
}

export function FormConfigurationSections({
  editingSource,
  monthlyAmountId,
  currentYear,
  isKindergeld,
  isBURente,
  isRental,
  isGrossIncome,
  onUpdate,
}: FormConfigurationSectionsProps) {
  return (
    <>
      {!isKindergeld && <AmountTypeSection editingSource={editingSource} onUpdate={onUpdate} />}

      <MonthlyAmountSection
        editingSource={editingSource}
        monthlyAmountId={monthlyAmountId}
        isKindergeld={isKindergeld}
        isGrossIncome={isGrossIncome}
        onUpdate={onUpdate}
      />

      {isGrossIncome && <TaxRateSection editingSource={editingSource} onUpdate={onUpdate} />}

      {!isBURente && <TimePeriodSection editingSource={editingSource} currentYear={currentYear} onUpdate={onUpdate} />}

      {!isKindergeld && !isBURente && <InflationRateSection editingSource={editingSource} onUpdate={onUpdate} />}

      {isRental && <RealEstateConfigSection editingSource={editingSource} onUpdate={onUpdate} />}

      {isKindergeld && <KindergeldConfigSection editingSource={editingSource} onUpdate={onUpdate} />}

      {isBURente && <BURenteConfigSection editingSource={editingSource} currentYear={currentYear} onUpdate={onUpdate} />}
    </>
  )
}
