import { useMemo, type ChangeEvent } from 'react'
import { Plus, Trash2, Calculator } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { generateFormId } from '../utils/unique-id'
import {
  optimizeFreistellungsauftrag,
  validateFreistellungsauftragConfig,
  calculateEffectiveTaxRates,
  type BankAccount,
  type FreistellungsauftragConfig,
  type OptimizationResult,
} from '../../helpers/freistellungsauftrag-optimization'
import { formatCurrency } from '../utils/currency'

interface FreistellungsauftragOptimizerProps {
  totalFreibetrag: number
  accounts: BankAccount[]
  onAccountsChange: (accounts: BankAccount[]) => void
  steuerlast: number // As percentage (e.g., 26.375)
  teilfreistellungsquote: number // As percentage (e.g., 30)
}

function AccountCardHeader({
  accountNameId,
  accountName,
  onAccountNameChange,
  onRemoveAccount,
}: {
  accountNameId: string
  accountName: string
  onAccountNameChange: (e: ChangeEvent<HTMLInputElement>) => void
  onRemoveAccount: () => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 mr-4">
        <Label htmlFor={accountNameId}>Kontoname</Label>
        <Input
          id={accountNameId}
          type="text"
          value={accountName}
          onChange={onAccountNameChange}
          placeholder="z.B. DKB, Trade Republic, ING"
        />
      </div>
      <Button onClick={onRemoveAccount} size="sm" variant="ghost" className="text-destructive hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

function AccountCardGainsInput({
  accountGainsId,
  expectedCapitalGains,
  onExpectedCapitalGainsChange,
}: {
  accountGainsId: string
  expectedCapitalGains: number
  onExpectedCapitalGainsChange: (e: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div>
      <Label htmlFor={accountGainsId}>Erwartete Kapitalerträge (€/Jahr)</Label>
      <Input
        id={accountGainsId}
        type="number"
        min="0"
        step="100"
        value={expectedCapitalGains}
        onChange={onExpectedCapitalGainsChange}
        placeholder="z.B. 2000"
      />
    </div>
  )
}

function AccountCardFreibetragInput({
  accountFreibetragId,
  assignedFreibetrag,
  onAssignedFreibetragChange,
  hasOptimization,
  optimizedFreibetrag,
}: {
  accountFreibetragId: string
  assignedFreibetrag: number
  onAssignedFreibetragChange: (e: ChangeEvent<HTMLInputElement>) => void
  hasOptimization: boolean
  optimizedFreibetrag: number
}) {
  return (
    <div>
      <Label htmlFor={accountFreibetragId}>
        Zugewiesener Freibetrag (€)
        {hasOptimization && (
          <span className="ml-2 text-xs text-green-600 font-normal">
            Optimal: {formatCurrency(optimizedFreibetrag)}
          </span>
        )}
      </Label>
      <Input
        id={accountFreibetragId}
        type="number"
        min="0"
        step="10"
        value={assignedFreibetrag}
        onChange={onAssignedFreibetragChange}
        placeholder="0"
      />
    </div>
  )
}

function AccountCardBody({
  accountGainsId,
  expectedCapitalGains,
  onExpectedCapitalGainsChange,
  accountFreibetragId,
  assignedFreibetrag,
  onAssignedFreibetragChange,
  hasOptimization,
  optimizedFreibetrag,
}: {
  accountGainsId: string
  expectedCapitalGains: number
  onExpectedCapitalGainsChange: (e: ChangeEvent<HTMLInputElement>) => void
  accountFreibetragId: string
  assignedFreibetrag: number
  onAssignedFreibetragChange: (e: ChangeEvent<HTMLInputElement>) => void
  hasOptimization: boolean
  optimizedFreibetrag: number
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AccountCardGainsInput
        accountGainsId={accountGainsId}
        expectedCapitalGains={expectedCapitalGains}
        onExpectedCapitalGainsChange={onExpectedCapitalGainsChange}
      />
      <AccountCardFreibetragInput
        accountFreibetragId={accountFreibetragId}
        assignedFreibetrag={assignedFreibetrag}
        onAssignedFreibetragChange={onAssignedFreibetragChange}
        hasOptimization={hasOptimization}
        optimizedFreibetrag={optimizedFreibetrag}
      />
    </div>
  )
}

function AccountCardFooter({
  taxRate,
  expectedCapitalGains,
}: {
  taxRate: { effectiveTaxRate: number; taxAmount: number } | undefined
  expectedCapitalGains: number
}) {
  if (!taxRate || expectedCapitalGains <= 0) {
    return null
  }

  return (
    <div className="pt-2 border-t">
      <div className="text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Steuer:</span>
          <span className="font-medium">{formatCurrency(taxRate.taxAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Effektiver Steuersatz:</span>
          <span className="font-medium">{(taxRate.effectiveTaxRate * 100).toFixed(2)}%</span>
        </div>
      </div>
    </div>
  )
}

function useAccountCard(
  account: BankAccount,
  optimizationResult: OptimizationResult | null,
  effectiveTaxRates: Array<{
    accountId: string
    accountName: string
    effectiveTaxRate: number
    taxAmount: number
  }>,
) {
  const accountNameId = generateFormId('freistellungsauftrag', 'account-name', account.id)
  const accountGainsId = generateFormId('freistellungsauftrag', 'account-gains', account.id)
  const accountFreibetragId = generateFormId('freistellungsauftrag', 'account-freibetrag', account.id)

  const optimizedAccount = optimizationResult?.accounts.find(a => a.id === account.id)
  const taxRate = effectiveTaxRates.find(r => r.accountId === account.id)

  const hasOptimization = optimizedAccount && optimizedAccount.assignedFreibetrag !== account.assignedFreibetrag

  return {
    accountNameId,
    accountGainsId,
    accountFreibetragId,
    optimizedAccount,
    taxRate,
    hasOptimization,
  }
}

interface AccountCardProps {
  account: BankAccount
  optimizationResult: OptimizationResult | null
  effectiveTaxRates: Array<{
    accountId: string
    accountName: string
    effectiveTaxRate: number
    taxAmount: number
  }>
  onRemove: (id: string) => void
  onChange: (id: string, field: keyof BankAccount, value: string | number) => void
}

function AccountCard({ account, optimizationResult, effectiveTaxRates, onRemove, onChange }: AccountCardProps) {
  const { accountNameId, accountGainsId, accountFreibetragId, optimizedAccount, taxRate, hasOptimization } =
    useAccountCard(account, optimizationResult, effectiveTaxRates)

  return (
    <Card key={account.id} className="relative">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <AccountCardHeader
            accountNameId={accountNameId}
            accountName={account.name}
            onAccountNameChange={(e: ChangeEvent<HTMLInputElement>) => onChange(account.id, 'name', e.target.value)}
            onRemoveAccount={() => onRemove(account.id)}
          />
          <AccountCardBody
            accountGainsId={accountGainsId}
            expectedCapitalGains={account.expectedCapitalGains}
            onExpectedCapitalGainsChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange(account.id, 'expectedCapitalGains', Number(e.target.value))
            }
            accountFreibetragId={accountFreibetragId}
            assignedFreibetrag={account.assignedFreibetrag}
            onAssignedFreibetragChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange(account.id, 'assignedFreibetrag', Number(e.target.value))
            }
            hasOptimization={!!hasOptimization}
            optimizedFreibetrag={optimizedAccount?.assignedFreibetrag ?? 0}
          />
          <AccountCardFooter taxRate={taxRate} expectedCapitalGains={account.expectedCapitalGains} />
        </div>
      </CardContent>
    </Card>
  )
}

function TotalFreibetragDisplay({ totalFreibetrag }: { totalFreibetrag: number }) {
  const totalFreibetragId = useMemo(() => generateFormId('freistellungsauftrag', 'total-freibetrag'), [])

  const getFreibetragDescription = (amount: number): string => {
    if (amount === 1000) return 'Einzelperson: 1.000 € pro Jahr'
    if (amount === 2000) return 'Ehepaar: 2.000 € pro Jahr'
    return `${formatCurrency(amount)} pro Jahr`
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={totalFreibetragId}>Gesamt-Freibetrag (Sparerpauschbetrag)</Label>
      <Input
        id={totalFreibetragId}
        type="text"
        value={formatCurrency(totalFreibetrag)}
        disabled
        className="bg-gray-50"
      />
      <p className="text-sm text-muted-foreground">{getFreibetragDescription(totalFreibetrag)}</p>
    </div>
  )
}

function AccountList({
  accounts,
  onAddAccount,
  onRemoveAccount,
  onAccountChange,
  optimizationResult,
  effectiveTaxRates,
}: {
  accounts: BankAccount[]
  onAddAccount: () => void
  onRemoveAccount: (id: string) => void
  onAccountChange: (id: string, field: keyof BankAccount, value: string | number) => void
  optimizationResult: OptimizationResult | null
  effectiveTaxRates: Array<{
    accountId: string
    accountName: string
    effectiveTaxRate: number
    taxAmount: number
  }>
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Bankkonten / Depots</Label>
        <Button onClick={onAddAccount} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Konto hinzufügen
        </Button>
      </div>
      {accounts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Noch keine Konten angelegt.</p>
          <p className="text-sm">Fügen Sie Konten hinzu, um die Optimierung zu nutzen.</p>
        </div>
      )}
      {accounts.map(account => (
        <AccountCard
          key={account.id}
          account={account}
          optimizationResult={optimizationResult}
          effectiveTaxRates={effectiveTaxRates}
          onRemove={onRemoveAccount}
          onChange={onAccountChange}
        />
      ))}
    </div>
  )
}

function ValidationErrors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="font-semibold text-red-900 mb-2">Validierungsfehler:</p>
      <ul className="list-disc list-inside space-y-1">
        {errors.map((error, index) => (
          <li key={index} className="text-sm text-red-700">
            {error}
          </li>
        ))}
      </ul>
    </div>
  )
}

function OptimizationResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-green-700">{label}:</span>
      <span className="font-semibold text-green-900">{value}</span>
    </div>
  )
}

function OptimizationResultStatus({ isOptimal }: { isOptimal: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-green-700">Status:</span>
      <span className={`font-semibold ${isOptimal ? 'text-green-900' : 'text-orange-700'}`}>
        {isOptimal ? '✓ Optimal' : '⚠ Optimierbar'}
      </span>
    </div>
  )
}

function OptimizationResultRecommendations({ recommendations }: { recommendations: string[] }) {
  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="mt-4 pt-4 border-t border-green-200">
      <p className="font-semibold text-green-900 mb-2">Empfehlungen:</p>
      <ul className="list-disc list-inside space-y-1">
        {recommendations.map((rec: string, recIndex: number) => (
          <li key={recIndex} className="text-sm text-green-700">
            {rec}
          </li>
        ))}
      </ul>
    </div>
  )
}

function OptimizationResults({ result, onApply }: { result: OptimizationResult; onApply: () => void }) {
  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-3">Optimierungsergebnis</h3>
        <div className="space-y-2 text-sm">
          <OptimizationResultRow
            label="Zugewiesener Freibetrag"
            value={formatCurrency(result.totalAssignedFreibetrag)}
          />
          <OptimizationResultRow label="Verbleibender Freibetrag" value={formatCurrency(result.remainingFreibetrag)} />
          <OptimizationResultRow label="Eingesparte Steuern" value={formatCurrency(result.totalTaxSaved)} />
          <OptimizationResultStatus isOptimal={result.isOptimal} />
        </div>
        <OptimizationResultRecommendations recommendations={result.recommendations} />
        <div className="mt-4">
          <Button onClick={onApply} className="w-full" variant="default">
            Optimale Verteilung übernehmen
          </Button>
        </div>
      </div>
    </div>
  )
}

function HelpText() {
  return (
    <div className="text-sm text-muted-foreground space-y-2">
      <p>
        <strong>Hinweis:</strong> Die Optimierung verteilt Ihren Sparerpauschbetrag automatisch auf die Konten mit den
        höchsten erwarteten Kapitalerträgen, um die Steuerlast zu minimieren.
      </p>
      <p>
        Tragen Sie für jedes Konto die erwarteten jährlichen Kapitalerträge ein. Die Optimierung berücksichtigt
        automatisch die Teilfreistellung für Aktienfonds.
      </p>
    </div>
  )
}

function useFreistellungsauftragCalculations(props: FreistellungsauftragOptimizerProps) {
  const { totalFreibetrag, accounts, steuerlast, teilfreistellungsquote } = props
  const steuerlastDecimal = steuerlast / 100
  const teilfreistellungsquoteDecimal = teilfreistellungsquote / 100

  const config: FreistellungsauftragConfig = useMemo(
    () => ({
      totalFreibetrag,
      accounts,
    }),
    [totalFreibetrag, accounts],
  )

  const validationErrors = validateFreistellungsauftragConfig(config)
  const optimizationResult = useMemo(() => {
    if (validationErrors.length > 0) return null
    return optimizeFreistellungsauftrag(config, steuerlastDecimal, teilfreistellungsquoteDecimal)
  }, [config, steuerlastDecimal, teilfreistellungsquoteDecimal, validationErrors.length])

  const effectiveTaxRates = useMemo(() => {
    if (!optimizationResult) return []
    return calculateEffectiveTaxRates(optimizationResult.accounts, steuerlastDecimal, teilfreistellungsquoteDecimal)
  }, [optimizationResult, steuerlastDecimal, teilfreistellungsquoteDecimal])

  return { validationErrors, optimizationResult, effectiveTaxRates }
}

function useFreistellungsauftragHandlers(
  props: FreistellungsauftragOptimizerProps,
  optimizationResult: OptimizationResult | null,
) {
  const { accounts, onAccountsChange } = props

  const handleAddAccount = () => {
    const newAccount: BankAccount = {
      id: `account-${Date.now()}`,
      name: `Konto ${accounts.length + 1}`,
      expectedCapitalGains: 0,
      assignedFreibetrag: 0,
    }
    onAccountsChange([...accounts, newAccount])
  }

  const handleRemoveAccount = (id: string) => {
    onAccountsChange(accounts.filter(acc => acc.id !== id))
  }

  const handleAccountChange = (id: string, field: keyof BankAccount, value: string | number) => {
    onAccountsChange(accounts.map(acc => (acc.id === id ? { ...acc, [field]: value } : acc)))
  }

  const handleApplyOptimization = () => {
    if (!optimizationResult) return
    onAccountsChange(optimizationResult.accounts)
  }

  return {
    handleAddAccount,
    handleRemoveAccount,
    handleAccountChange,
    handleApplyOptimization,
  }
}

function useFreistellungsauftragOptimizer(props: FreistellungsauftragOptimizerProps) {
  const { validationErrors, optimizationResult, effectiveTaxRates } = useFreistellungsauftragCalculations(props)
  const handlers = useFreistellungsauftragHandlers(props, optimizationResult)

  return {
    validationErrors,
    optimizationResult,
    effectiveTaxRates,
    ...handlers,
  }
}

export function FreistellungsauftragOptimizer(props: FreistellungsauftragOptimizerProps) {
  const {
    validationErrors,
    optimizationResult,
    effectiveTaxRates,
    handleAddAccount,
    handleRemoveAccount,
    handleAccountChange,
    handleApplyOptimization,
  } = useFreistellungsauftragOptimizer(props)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Freistellungsaufträge-Optimierung
        </CardTitle>
        <CardDescription>
          Optimale Verteilung der Freistellungsaufträge auf mehrere Bankkonten zur Minimierung der Steuerlast
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <TotalFreibetragDisplay totalFreibetrag={props.totalFreibetrag} />
        <AccountList
          accounts={props.accounts}
          onAddAccount={handleAddAccount}
          onRemoveAccount={handleRemoveAccount}
          onAccountChange={handleAccountChange}
          optimizationResult={optimizationResult}
          effectiveTaxRates={effectiveTaxRates}
        />
        <ValidationErrors errors={validationErrors} />
        {optimizationResult && props.accounts.length > 0 && (
          <OptimizationResults result={optimizationResult} onApply={handleApplyOptimization} />
        )}
        <HelpText />
      </CardContent>
    </Card>
  )
}
