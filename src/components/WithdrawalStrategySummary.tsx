import { formatCurrency } from '../utils/currency'
import type { WithdrawalFormValue } from '../utils/config-storage'

interface WithdrawalStrategySummaryProps {
  startingCapital: number
  formValue: WithdrawalFormValue
}

export function WithdrawalStrategySummary({
  startingCapital,
  formValue,
}: WithdrawalStrategySummaryProps) {
  return (
    <>
      <p>
        <strong>Startkapital bei Entnahme:</strong>
        {' '}
        {formatCurrency(startingCapital)}
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
                  startingCapital
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
                      startingCapital
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
                    startingCapital
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
      {formValue.grundfreibetragAktiv && formValue.grundfreibetragBetrag && (
        <p>
          <strong>Grundfreibetrag:</strong>
          {' '}
          {formatCurrency(formValue.grundfreibetragBetrag)}
          {' '}
          pro Jahr
          {formValue.einkommensteuersatz && (
            <>
              {' '}
              (Einkommensteuersatz:
              {' '}
              {formValue.einkommensteuersatz}
              %)
            </>
          )}
        </p>
      )}
    </>
  )
}
