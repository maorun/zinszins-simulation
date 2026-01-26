import { useState, useMemo } from 'react'
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { CollapsibleCardHeader } from './ui/collapsible-card'
import { Switch } from './ui/switch'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Info, Calendar, AlertTriangle } from 'lucide-react'
import { generateFormId } from '../utils/unique-id'
import { formatCurrency } from '../utils/currency'
import {
  calculateQuarterlyTaxPrepayments,
  getDefaultQuarterlyTaxPrepaymentConfig,
  arePrepaymentsRequired,
  getOptimizationSuggestions,
  type QuarterlyTaxPrepaymentConfig,
} from '../../helpers/quarterly-tax-prepayments'

interface InputFieldProps {
  id: string
  label: string
  description: string
  value: number
  onChange: (value: number) => void
  step?: string
  suffix?: string
}

function InputField({ id, label, description, value, onChange, step = '100', suffix }: InputFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="flex gap-2 items-center">
        <Input
          id={id}
          type="number"
          min="0"
          step={step}
          value={value}
          onChange={(e) => {
            const parsedValue = parseFloat(e.target.value)
            if (!isNaN(parsedValue)) {
              onChange(parsedValue)
            }
          }}
          className="max-w-xs"
        />
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  )
}

function InfoMessage() {
  return (
    <div className="text-sm text-muted-foreground bg-yellow-50 border border-yellow-200 rounded-lg p-3">
      <p className="font-medium text-yellow-900 mb-1">💡 Für Selbstständige und Freiberufler</p>
      <p className="text-xs text-yellow-800">
        Bei erwarteten Kapitalerträgen können vierteljährliche Vorauszahlungen erforderlich sein. Dieser Rechner hilft
        bei der Planung und zeigt die Zahlungstermine sowie potenzielle Nachzahlungszinsen.
      </p>
    </div>
  )
}

function TaxRulesInfoBox() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex gap-2 items-start">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-900">
          <p className="font-medium mb-1">Deutsche Vorauszahlungsregeln:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Vorauszahlungen erforderlich bei Steuerlast &gt; 400 € pro Jahr</li>
            <li>Vierteljährliche Zahlungen am 10.03., 10.06., 10.09., 10.12.</li>
            <li>Nachzahlungszinsen von 6% p.a. bei verspäteter Zahlung (§ 233a AO)</li>
            <li>Teilfreistellung (30%) für Aktienfonds reduziert die Steuerlast</li>
            <li>Sparer-Pauschbetrag (1.000 € / 2.000 €) wird berücksichtigt</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

interface PaymentScheduleProps {
  result: ReturnType<typeof calculateQuarterlyTaxPrepayments>
}

function PaymentSchedule({ result }: PaymentScheduleProps) {
  const hasAlreadyPaidTax = result.alreadyPaidWithholdingTax > 0
  const quarterlyAmount = hasAlreadyPaidTax ? result.remainingQuarterlyPrepayment : result.quarterlyPrepayment

  return (
    <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
      <div className="flex gap-2 items-center mb-3">
        <Calendar className="h-4 w-4 text-purple-600" />
        <h4 className="font-medium text-purple-900">
          📅 Zahlungstermine{hasAlreadyPaidTax ? ' (nach Abzug bereits gezahlter Steuern)' : ''}
        </h4>
      </div>
      <div className="space-y-2">
        {result.paymentDates.map((payment) => (
          <div key={payment.quarter} className="flex justify-between items-center text-sm">
            <span className="text-purple-800">Q{payment.quarter} - {payment.deadlineFormatted}</span>
            <span className="font-medium text-purple-900">{formatCurrency(quarterlyAmount)}</span>
          </div>
        ))}
      </div>
      {hasAlreadyPaidTax && quarterlyAmount > 0 && (
        <div className="mt-3 pt-3 border-t border-purple-300 text-xs text-purple-800">
          <p>
            💡 Ihre Bank hat bereits {formatCurrency(result.alreadyPaidWithholdingTax)} an Steuern einbehalten. Die
            verbleibenden Vorauszahlungen wurden entsprechend reduziert.
          </p>
        </div>
      )}
      {hasAlreadyPaidTax && quarterlyAmount === 0 && (
        <div className="mt-3 pt-3 border-t border-purple-300 text-xs text-purple-800">
          <p>
            ✅ Die von Ihrer Bank bereits einbehaltenen Steuern ({formatCurrency(result.alreadyPaidWithholdingTax)})
            decken Ihre gesamte Steuerlast ab. Keine zusätzlichen Vorauszahlungen erforderlich.
          </p>
        </div>
      )}
    </div>
  )
}

interface TaxSavingsDisplayProps {
  result: ReturnType<typeof calculateQuarterlyTaxPrepayments>
}

function TaxSavingsDisplay({ result }: TaxSavingsDisplayProps) {
  const hasAlreadyPaidTax = result.alreadyPaidWithholdingTax > 0

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <h4 className="font-medium text-green-900 mb-3">💰 Berechnete Steuerlast</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-green-800">Steuerpflichtige Kapitalerträge:</span>
          <span className="font-medium text-green-900">{formatCurrency(result.taxableIncome)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-800">Steuerersparnis durch Freibetrag:</span>
          <span className="font-medium text-green-900">{formatCurrency(result.taxFreeAllowanceSavings)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-green-800">Steuerersparnis durch Teilfreistellung:</span>
          <span className="font-medium text-green-900">{formatCurrency(result.partialExemptionSavings)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-green-300">
          <span className="font-medium text-green-900">Jährliche Gesamtsteuerlast:</span>
          <span className="font-bold text-green-900 text-lg">{formatCurrency(result.annualTaxLiability)}</span>
        </div>
        {hasAlreadyPaidTax && (
          <>
            <div className="flex justify-between bg-blue-100 -mx-2 px-2 py-1 rounded">
              <span className="text-blue-800">Bereits gezahlte Steuern (Bank):</span>
              <span className="font-medium text-blue-900">- {formatCurrency(result.alreadyPaidWithholdingTax)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-green-300 bg-yellow-50 -mx-2 px-2 py-1 rounded">
              <span className="font-medium text-yellow-900">Verbleibende Steuerlast:</span>
              <span className="font-bold text-yellow-900 text-lg">{formatCurrency(result.remainingTaxLiability)}</span>
            </div>
          </>
        )}
        <div className="flex justify-between">
          <span className="font-medium text-green-900">
            {hasAlreadyPaidTax ? 'Verbleibende ' : ''}Vierteljährliche Vorauszahlung:
          </span>
          <span className="font-bold text-green-900 text-lg">
            {formatCurrency(hasAlreadyPaidTax ? result.remainingQuarterlyPrepayment : result.quarterlyPrepayment)}
          </span>
        </div>
      </div>
    </div>
  )
}

interface LatePaymentWarningProps {
  result: ReturnType<typeof calculateQuarterlyTaxPrepayments>
}

function LatePaymentWarning({ result }: LatePaymentWarningProps) {
  if (result.estimatedLatePaymentInterest <= 0) return null

  return (
    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
      <div className="flex gap-2 items-start">
        <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-orange-900">
          <p className="font-medium mb-1">⚠️ Nachzahlungszinsen bei Verzug</p>
          <p>
            Bei verspäteter Zahlung eines Quartals (3 Monate Verzug): ca.{' '}
            <span className="font-bold">{formatCurrency(result.estimatedLatePaymentInterest)}</span>
          </p>
          <p className="mt-1">Zinssatz: {(result.latePaymentInterestRate * 100).toFixed(2)}% p.a. (§ 233a AO)</p>
        </div>
      </div>
    </div>
  )
}

interface ResultsDisplayProps {
  result: ReturnType<typeof calculateQuarterlyTaxPrepayments>
}

function ResultsDisplay({ result }: ResultsDisplayProps) {
  const isRequired = arePrepaymentsRequired(result.annualTaxLiability)

  return (
    <div className="mt-4 space-y-4">
      <TaxSavingsDisplay result={result} />
      {isRequired && <PaymentSchedule result={result} />}
      {!isRequired && result.annualTaxLiability > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-900">
            ℹ️ Vorauszahlungen sind bei einer jährlichen Steuerlast unter 400 € in der Regel nicht erforderlich.
          </p>
        </div>
      )}
      <LatePaymentWarning result={result} />
    </div>
  )
}

interface OptimizationSuggestionsProps {
  config: QuarterlyTaxPrepaymentConfig
}

function OptimizationSuggestions({ config }: OptimizationSuggestionsProps) {
  const suggestions = getOptimizationSuggestions(config)

  if (suggestions.length === 0) return null

  return (
    <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
      <h4 className="font-medium text-indigo-900 mb-2">💡 Optimierungsvorschläge</h4>
      <ul className="space-y-2 text-xs text-indigo-800">
        {suggestions.map((suggestion, index) => (
          <li key={index} className="flex gap-2 items-start">
            <span className="mt-0.5">•</span>
            <span>{suggestion}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface ConfigurationFieldsProps {
  config: QuarterlyTaxPrepaymentConfig
  setConfig: (config: QuarterlyTaxPrepaymentConfig) => void
  incomeId: string
  taxRateId: string
  allowanceId: string
  exemptionId: string
  alreadyPaidId: string
}

function ConfigurationFields({ config, setConfig, incomeId, taxRateId, allowanceId, exemptionId, alreadyPaidId }: ConfigurationFieldsProps) {
  return (
    <div className="space-y-4 pt-2">
      <InputField
        id={incomeId}
        label="Erwartete jährliche Kapitalerträge (€)"
        description="Geschätzte Gesamtkapitalerträge für das Jahr (Dividenden, Zinsen, realisierte Gewinne)"
        value={config.expectedAnnualCapitalIncome}
        onChange={(value) => setConfig({ ...config, expectedAnnualCapitalIncome: Math.max(0, value) })}
        step="1000"
      />

      <InputField
        id={taxRateId}
        label="Kapitalertragsteuersatz (%)"
        description="Standard: 26,375% (25% Abgeltungssteuer + 5,5% Solidaritätszuschlag)"
        value={config.capitalGainsTaxRate}
        onChange={(value) => setConfig({ ...config, capitalGainsTaxRate: Math.max(0, Math.min(100, value)) })}
        step="0.001"
        suffix="%"
      />

      <InputField
        id={allowanceId}
        label="Sparer-Pauschbetrag (€)"
        description="Freibetrag: 1.000 € (Singles) oder 2.000 € (Paare) durch Freistellungsauftrag"
        value={config.taxFreeAllowance}
        onChange={(value) => setConfig({ ...config, taxFreeAllowance: Math.max(0, value) })}
        step="100"
      />

      <InputField
        id={exemptionId}
        label="Teilfreistellungsquote (%)"
        description="Standard: 30% für Aktienfonds, 15% für Mischfonds, 0% für andere Anlagen"
        value={config.partialExemptionRate}
        onChange={(value) => setConfig({ ...config, partialExemptionRate: Math.max(0, Math.min(100, value)) })}
        step="1"
        suffix="%"
      />

      <InputField
        id={alreadyPaidId}
        label="Bereits gezahlte Abgeltungsteuer (€)"
        description="Von Ihrer Bank bereits einbehaltene Steuern auf Dividenden und Zinsen"
        value={config.alreadyPaidWithholdingTax ?? 0}
        onChange={(value) => setConfig({ ...config, alreadyPaidWithholdingTax: Math.max(0, value) })}
        step="100"
      />
    </div>
  )
}

interface EnableSwitchSectionProps {
  enableSwitchId: string
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
}

function EnableSwitchSection({ enableSwitchId, enabled, onEnabledChange }: EnableSwitchSectionProps) {
  return (
    <div className="flex items-center justify-between border rounded-lg p-4 bg-gray-50/50">
      <div className="space-y-1">
        <Label className="text-base font-medium">Vorauszahlungsberechnung aktivieren</Label>
        <p className="text-sm text-muted-foreground">
          Berechnung der vierteljährlichen Steuerzahlungen für Kapitalerträge
        </p>
      </div>
      <Switch id={enableSwitchId} checked={enabled} onCheckedChange={onEnabledChange} />
    </div>
  )
}

interface ConfigurationContentProps {
  config: QuarterlyTaxPrepaymentConfig
  setConfig: (config: QuarterlyTaxPrepaymentConfig) => void
  incomeId: string
  taxRateId: string
  allowanceId: string
  exemptionId: string
  alreadyPaidId: string
  result: ReturnType<typeof calculateQuarterlyTaxPrepayments> | null
}

function ConfigurationContent({
  config,
  setConfig,
  incomeId,
  taxRateId,
  allowanceId,
  exemptionId,
  alreadyPaidId,
  result,
}: ConfigurationContentProps) {
  return (
    <>
      <TaxRulesInfoBox />
      <ConfigurationFields
        config={config}
        setConfig={setConfig}
        incomeId={incomeId}
        taxRateId={taxRateId}
        allowanceId={allowanceId}
        exemptionId={exemptionId}
        alreadyPaidId={alreadyPaidId}
      />
      {result && <ResultsDisplay result={result} />}
      {result && <OptimizationSuggestions config={config} />}
    </>
  )
}

/**
 * Quarterly Tax Prepayment Card - Calculator for self-employed individuals
 * to plan Abgeltungssteuer-Vorauszahlungen (quarterly capital gains tax prepayments)
 */
export function QuarterlyTaxPrepaymentCard() {
  const currentYear = new Date().getFullYear()
  const [config, setConfig] = useState<QuarterlyTaxPrepaymentConfig>(() =>
    getDefaultQuarterlyTaxPrepaymentConfig(currentYear),
  )

  const enableSwitchId = useMemo(() => generateFormId('quarterly-tax-prepayment', 'enabled'), [])
  const incomeId = useMemo(() => generateFormId('quarterly-tax-prepayment', 'income'), [])
  const taxRateId = useMemo(() => generateFormId('quarterly-tax-prepayment', 'tax-rate'), [])
  const allowanceId = useMemo(() => generateFormId('quarterly-tax-prepayment', 'allowance'), [])
  const exemptionId = useMemo(() => generateFormId('quarterly-tax-prepayment', 'exemption'), [])
  const alreadyPaidId = useMemo(() => generateFormId('quarterly-tax-prepayment', 'already-paid'), [])

  const result = useMemo(() => {
    if (!config.enabled) return null
    return calculateQuarterlyTaxPrepayments(config)
  }, [config])

  return (
    <Card nestingLevel={1}>
      <Collapsible defaultOpen={false}>
        <CollapsibleCardHeader titleClassName="text-left" simplifiedPadding>
          💼 Vorauszahlungsrechner für Selbstständige
        </CollapsibleCardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={1}>
            <div className="space-y-4">
              <InfoMessage />
              <EnableSwitchSection
                enableSwitchId={enableSwitchId}
                enabled={config.enabled}
                onEnabledChange={(checked) => setConfig({ ...config, enabled: checked })}
              />
              {config.enabled && (
                <ConfigurationContent
                  config={config}
                  setConfig={setConfig}
                  incomeId={incomeId}
                  taxRateId={taxRateId}
                  allowanceId={allowanceId}
                  exemptionId={exemptionId}
                  alreadyPaidId={alreadyPaidId}
                  result={result}
                />
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
