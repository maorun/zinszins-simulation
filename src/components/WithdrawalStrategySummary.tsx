import { formatCurrency } from '../utils/currency'
import type { WithdrawalFormValue } from '../utils/config-storage'

interface WithdrawalStrategySummaryProps {
  startingCapital: number
  formValue: WithdrawalFormValue
}

function MonthlyFixedStrategy({ formValue }: { formValue: WithdrawalFormValue }) {
  return (
    <>
      <p>
        <strong>Monatliche Entnahme (Basis):</strong> {formatCurrency(formValue.monatlicheBetrag)}
      </p>
      <p>
        <strong>Jährliche Entnahme (Jahr 1):</strong> {formatCurrency(formValue.monatlicheBetrag * 12)}
      </p>
      {formValue.guardrailsAktiv && (
        <p>
          <strong>Dynamische Anpassung:</strong> Aktiviert (Schwelle: {formValue.guardrailsSchwelle}
          %)
        </p>
      )}
    </>
  )
}

function VariablePercentageStrategy({
  startingCapital,
  formValue,
}: {
  startingCapital: number
  formValue: WithdrawalFormValue
}) {
  return (
    <p>
      <strong>Jährliche Entnahme ({formValue.variabelProzent} Prozent Regel):</strong>{' '}
      {formatCurrency(startingCapital * (formValue.variabelProzent / 100))}
    </p>
  )
}

function DynamicStrategy({ startingCapital, formValue }: { startingCapital: number; formValue: WithdrawalFormValue }) {
  return (
    <>
      <p>
        <strong>Basis-Entnahmerate:</strong> {formValue.dynamischBasisrate}%
      </p>
      <p>
        <strong>Jährliche Basis-Entnahme:</strong>{' '}
        {formatCurrency(startingCapital * (formValue.dynamischBasisrate / 100))}
      </p>
      <p>
        <strong>Obere Schwelle:</strong> {formValue.dynamischObereSchwell}% Rendite →{' '}
        {formValue.dynamischObereAnpassung > 0 ? '+' : ''}
        {formValue.dynamischObereAnpassung}% Anpassung
      </p>
      <p>
        <strong>Untere Schwelle:</strong> {formValue.dynamischUntereSchwell}% Rendite →{' '}
        {formValue.dynamischUntereAnpassung}% Anpassung
      </p>
    </>
  )
}

function StandardRuleStrategy({
  startingCapital,
  formValue,
}: {
  startingCapital: number
  formValue: WithdrawalFormValue
}) {
  const is4Percent = formValue.strategie === '4prozent'
  const ruleName = is4Percent ? '4 Prozent' : '3 Prozent'
  const rate = is4Percent ? 0.04 : 0.03

  return (
    <p>
      <strong>Jährliche Entnahme ({ruleName} Regel):</strong> {formatCurrency(startingCapital * rate)}
    </p>
  )
}

function StrategyDetails({ startingCapital, formValue }: { startingCapital: number; formValue: WithdrawalFormValue }) {
  if (formValue.strategie === 'monatlich_fest') {
    return <MonthlyFixedStrategy formValue={formValue} />
  }

  if (formValue.strategie === 'variabel_prozent') {
    return <VariablePercentageStrategy startingCapital={startingCapital} formValue={formValue} />
  }

  if (formValue.strategie === 'dynamisch') {
    return <DynamicStrategy startingCapital={startingCapital} formValue={formValue} />
  }

  return <StandardRuleStrategy startingCapital={startingCapital} formValue={formValue} />
}

export function WithdrawalStrategySummary({ startingCapital, formValue }: WithdrawalStrategySummaryProps) {
  return (
    <>
      <p>
        <strong>Startkapital bei Entnahme:</strong> {formatCurrency(startingCapital)}
      </p>

      <StrategyDetails startingCapital={startingCapital} formValue={formValue} />

      {formValue.inflationAktiv && (
        <p>
          <strong>Inflationsrate:</strong> {formValue.inflationsrate}% p.a. (Entnahmebeträge werden jährlich angepasst)
        </p>
      )}

      <p>
        <strong>Erwartete Rendite:</strong> {formValue.rendite} Prozent p.a.
      </p>

      {formValue.grundfreibetragAktiv && formValue.grundfreibetragBetrag && (
        <p>
          <strong>Grundfreibetrag:</strong> {formatCurrency(formValue.grundfreibetragBetrag)} pro Jahr
          {formValue.einkommensteuersatz && (
            <>
              {' '}
              (Einkommensteuersatz: {formValue.einkommensteuersatz}
              %)
            </>
          )}
        </p>
      )}
    </>
  )
}
