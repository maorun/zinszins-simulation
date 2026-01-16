import type { OtherIncomeSource } from '../../../helpers/other-income'
import { AmountTypeSection } from './AmountTypeSection'
import { TaxRateSection } from './TaxRateSection'
import { InflationRateSection } from './InflationRateSection'
import { MonthlyAmountSection } from './MonthlyAmountSection'
import { TimePeriodSection } from './TimePeriodSection'
import { RealEstateConfigSection } from './RealEstateConfigSection'
import { KindergeldConfigSection } from './KindergeldConfigSection'
import { ElterngeldConfigSection } from './ElterngeldConfigSection'
import { BURenteConfigSection } from './BURenteConfigSection'
import { KapitallebensversicherungConfigSection } from './KapitallebensversicherungConfigSection'
import { PflegezusatzversicherungConfigSection } from './PflegezusatzversicherungConfigSection'
import { RisikolebensversicherungConfigSection } from './RisikolebensversicherungConfigSection'
import { DepotAufKindConfigSection } from './DepotAufKindConfigSection'

interface FormConfigurationSectionsProps {
  editingSource: OtherIncomeSource
  monthlyAmountId: string
  currentYear: number
  isKindergeld: boolean
  isElterngeld: boolean
  isBURente: boolean
  isRental: boolean
  isKapitallebensversicherung: boolean
  isPflegezusatzversicherung: boolean
  isRisikolebensversicherung: boolean
  isDepotAufKind: boolean
  isGrossIncome: boolean
  onUpdate: (source: OtherIncomeSource) => void
}

function AmountAndTaxSections({
  editingSource,
  monthlyAmountId,
  isKindergeld,
  isElterngeld,
  isKapitallebensversicherung,
  isRisikolebensversicherung,
  isGrossIncome,
  onUpdate,
}: Pick<
  FormConfigurationSectionsProps,
  'editingSource' | 'monthlyAmountId' | 'isKindergeld' | 'isElterngeld' | 'isKapitallebensversicherung' | 'isRisikolebensversicherung' | 'isGrossIncome' | 'onUpdate'
>) {
  return (
    <>
      {!isKindergeld && !isElterngeld && !isKapitallebensversicherung && !isRisikolebensversicherung && (
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

function shouldShowTimePeriodSection(
  isBURente: boolean,
  isKapitallebensversicherung: boolean,
  isRisikolebensversicherung: boolean,
): boolean {
  return !isBURente && !isKapitallebensversicherung && !isRisikolebensversicherung
}

function shouldShowInflationSection(
  isKindergeld: boolean,
  isElterngeld: boolean,
  isBURente: boolean,
  isKapitallebensversicherung: boolean,
  isRisikolebensversicherung: boolean,
): boolean {
  return !isKindergeld && !isElterngeld && !isBURente && !isKapitallebensversicherung && !isRisikolebensversicherung
}

function TimeAndInflationSections({
  editingSource,
  currentYear,
  isKindergeld,
  isElterngeld,
  isBURente,
  isKapitallebensversicherung,
  isRisikolebensversicherung,
  onUpdate,
}: Pick<
  FormConfigurationSectionsProps,
  'editingSource' | 'currentYear' | 'isKindergeld' | 'isElterngeld' | 'isBURente' | 'isKapitallebensversicherung' | 'isRisikolebensversicherung' | 'onUpdate'
>) {
  const showTimePeriod = shouldShowTimePeriodSection(isBURente, isKapitallebensversicherung, isRisikolebensversicherung)
  const showInflation = shouldShowInflationSection(isKindergeld, isElterngeld, isBURente, isKapitallebensversicherung, isRisikolebensversicherung)

  return (
    <>
      {showTimePeriod && <TimePeriodSection editingSource={editingSource} currentYear={currentYear} onUpdate={onUpdate} />}
      {showInflation && <InflationRateSection editingSource={editingSource} onUpdate={onUpdate} />}
    </>
  )
}

function StandardConfigSections(props: Pick<
  FormConfigurationSectionsProps,
  | 'editingSource'
  | 'monthlyAmountId'
  | 'currentYear'
  | 'isKindergeld'
  | 'isElterngeld'
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

function BasicIncomeConfigSections({
  editingSource,
  isKindergeld,
  isElterngeld,
  isBURente,
  onUpdate,
}: Pick<FormConfigurationSectionsProps, 'editingSource' | 'isKindergeld' | 'isElterngeld' | 'isBURente' | 'onUpdate'>) {
  return (
    <>
      {isKindergeld && <KindergeldConfigSection editingSource={editingSource} onUpdate={onUpdate} />}
      {isElterngeld && <ElterngeldConfigSection editingSource={editingSource} currentYear={new Date().getFullYear()} onUpdate={onUpdate} />}
      {isBURente && <BURenteConfigSection editingSource={editingSource} currentYear={new Date().getFullYear()} onUpdate={onUpdate} />}
    </>
  )
}

function InsuranceConfigSections({
  editingSource,
  currentYear,
  isKapitallebensversicherung,
  isPflegezusatzversicherung,
  isRisikolebensversicherung,
  isDepotAufKind,
  onUpdate,
}: Pick<
  FormConfigurationSectionsProps,
  'editingSource' | 'currentYear' | 'isKapitallebensversicherung' | 'isPflegezusatzversicherung' | 'isRisikolebensversicherung' | 'isDepotAufKind' | 'onUpdate'
>) {
  return (
    <>
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
      {isDepotAufKind && editingSource.depotAufKindConfig && (
        <DepotAufKindConfigSection
          config={editingSource.depotAufKindConfig}
          onUpdate={(updates) => onUpdate({ ...editingSource, depotAufKindConfig: { ...editingSource.depotAufKindConfig!, ...updates } })}
          currentYear={currentYear}
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
      <BasicIncomeConfigSections {...props} />
      <InsuranceConfigSections {...props} />
    </>
  )
}
