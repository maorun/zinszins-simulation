import type { OtherIncomeSource } from '../../../helpers/other-income'
import { AmountTypeSection } from './AmountTypeSection'
import { TaxRateSection } from './TaxRateSection'
import { InflationRateSection } from './InflationRateSection'
import { MonthlyAmountSection } from './MonthlyAmountSection'
import { TimePeriodSection } from './TimePeriodSection'
import { RealEstateConfigSection } from './RealEstateConfigSection'
import { KindergeldConfigSection } from './KindergeldConfigSection'
import { BURenteConfigSection } from './BURenteConfigSection'
import { KapitallebensversicherungConfigSection } from './KapitallebensversicherungConfigSection'
import { PflegezusatzversicherungConfigSection } from './PflegezusatzversicherungConfigSection'
import { RisikolebensversicherungConfigSection } from './RisikolebensversicherungConfigSection'

interface FormConfigurationSectionsProps {
  editingSource: OtherIncomeSource
  monthlyAmountId: string
  currentYear: number
  isKindergeld: boolean
  isBURente: boolean
  isRental: boolean
  isKapitallebensversicherung: boolean
  isPflegezusatzversicherung: boolean
  isRisikolebensversicherung: boolean
  isGrossIncome: boolean
  onUpdate: (source: OtherIncomeSource) => void
}

function AmountAndTaxSections({
  editingSource,
  monthlyAmountId,
  isKindergeld,
  isKapitallebensversicherung,
  isRisikolebensversicherung,
  isGrossIncome,
  onUpdate,
}: Pick<
  FormConfigurationSectionsProps,
  'editingSource' | 'monthlyAmountId' | 'isKindergeld' | 'isKapitallebensversicherung' | 'isRisikolebensversicherung' | 'isGrossIncome' | 'onUpdate'
>) {
  return (
    <>
      {!isKindergeld && !isKapitallebensversicherung && !isRisikolebensversicherung && (
        <AmountTypeSection editingSource={editingSource} onUpdate={onUpdate} />
      )}

      {!isKapitallebensversicherung && !isRisikolebensversicherung && (
        <MonthlyAmountSection
          editingSource={editingSource}
          monthlyAmountId={monthlyAmountId}
          isKindergeld={isKindergeld}
          isGrossIncome={isGrossIncome}
          onUpdate={onUpdate}
        />
      )}

      {isGrossIncome && <TaxRateSection editingSource={editingSource} onUpdate={onUpdate} />}
    </>
  )
}

function TimeAndInflationSections({
  editingSource,
  currentYear,
  isKindergeld,
  isBURente,
  isKapitallebensversicherung,
  isRisikolebensversicherung,
  onUpdate,
}: Pick<
  FormConfigurationSectionsProps,
  'editingSource' | 'currentYear' | 'isKindergeld' | 'isBURente' | 'isKapitallebensversicherung' | 'isRisikolebensversicherung' | 'onUpdate'
>) {
  return (
    <>
      {!isBURente && !isKapitallebensversicherung && !isRisikolebensversicherung && (
        <TimePeriodSection editingSource={editingSource} currentYear={currentYear} onUpdate={onUpdate} />
      )}

      {!isKindergeld && !isBURente && !isKapitallebensversicherung && !isRisikolebensversicherung && (
        <InflationRateSection editingSource={editingSource} onUpdate={onUpdate} />
      )}
    </>
  )
}

function StandardConfigSections(props: Pick<
  FormConfigurationSectionsProps,
  | 'editingSource'
  | 'monthlyAmountId'
  | 'currentYear'
  | 'isKindergeld'
  | 'isBURente'
  | 'isKapitallebensversicherung'
  | 'isRisikolebensversicherung'
  | 'isGrossIncome'
  | 'onUpdate'
>) {
  return (
    <>
      <AmountAndTaxSections {...props} />
      <TimeAndInflationSections {...props} />
    </>
  )
}

function InsuranceConfigSections({
  editingSource,
  currentYear,
  isKindergeld,
  isBURente,
  isKapitallebensversicherung,
  isPflegezusatzversicherung,
  isRisikolebensversicherung,
  onUpdate,
}: Pick<
  FormConfigurationSectionsProps,
  'editingSource' | 'currentYear' | 'isKindergeld' | 'isBURente' | 'isKapitallebensversicherung' | 'isPflegezusatzversicherung' | 'isRisikolebensversicherung' | 'onUpdate'
>) {
  return (
    <>
      {isKindergeld && <KindergeldConfigSection editingSource={editingSource} onUpdate={onUpdate} />}
      {isBURente && <BURenteConfigSection editingSource={editingSource} currentYear={currentYear} onUpdate={onUpdate} />}
      {isKapitallebensversicherung && (
        <KapitallebensversicherungConfigSection
          editingSource={editingSource}
          currentYear={currentYear}
          onUpdate={onUpdate}
        />
      )}
      {isPflegezusatzversicherung && (
        <PflegezusatzversicherungConfigSection
          editingSource={editingSource}
          currentYear={currentYear}
          onUpdate={onUpdate}
        />
      )}
      {isRisikolebensversicherung && (
        <RisikolebensversicherungConfigSection
          editingSource={editingSource}
          currentYear={currentYear}
          onUpdate={onUpdate}
        />
      )}
    </>
  )
}

export function FormConfigurationSections(props: FormConfigurationSectionsProps) {
  return (
    <>
      <StandardConfigSections {...props} />
      {props.isRental && <RealEstateConfigSection editingSource={props.editingSource} onUpdate={props.onUpdate} />}
      <InsuranceConfigSections {...props} />
    </>
  )
}
