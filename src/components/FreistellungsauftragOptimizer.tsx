import { useMemo } from 'react'
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
} from '../../helpers/freistellungsauftrag-optimization'
import { formatCurrency } from '../utils/currency'

interface FreistellungsauftragOptimizerProps {
  totalFreibetrag: number
  accounts: BankAccount[]
  onAccountsChange: (accounts: BankAccount[]) => void
  steuerlast: number // As percentage (e.g., 26.375)
  teilfreistellungsquote: number // As percentage (e.g., 30)
}

export function FreistellungsauftragOptimizer({
  totalFreibetrag,
  accounts,
  onAccountsChange,
  steuerlast,
  teilfreistellungsquote,
}: FreistellungsauftragOptimizerProps) {
  // Generate unique IDs for form elements
  const totalFreibetragId = useMemo(() => generateFormId('freistellungsauftrag', 'total-freibetrag'), [])

  // Convert percentages to decimals for calculation
  const steuerlastDecimal = steuerlast / 100
  const teilfreistellungsquoteDecimal = teilfreistellungsquote / 100

  // Memoize config to avoid recreation on every render
  const config: FreistellungsauftragConfig = useMemo(() => ({
    totalFreibetrag,
    accounts,
  }), [totalFreibetrag, accounts])

  // Validate configuration
  const validationErrors = validateFreistellungsauftragConfig(config)

  // Calculate optimal distribution
  const optimizationResult = useMemo(() => {
    if (validationErrors.length > 0) {
      return null
    }
    return optimizeFreistellungsauftrag(config, steuerlastDecimal, teilfreistellungsquoteDecimal)
  }, [config, steuerlastDecimal, teilfreistellungsquoteDecimal, validationErrors.length])

  // Calculate effective tax rates
  const effectiveTaxRates = useMemo(() => {
    if (!optimizationResult) return []
    return calculateEffectiveTaxRates(
      optimizationResult.accounts,
      steuerlastDecimal,
      teilfreistellungsquoteDecimal,
    )
  }, [optimizationResult, steuerlastDecimal, teilfreistellungsquoteDecimal])

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
    onAccountsChange(
      accounts.map(acc =>
        acc.id === id ? { ...acc, [field]: value } : acc,
      ),
    )
  }

  const handleApplyOptimization = () => {
    if (!optimizationResult) return

    onAccountsChange(optimizationResult.accounts)
  }

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
        {/* Total Freibetrag Display (read-only, managed by planning mode) */}
        <div className="space-y-2">
          <Label htmlFor={totalFreibetragId}>Gesamt-Freibetrag (Sparerpauschbetrag)</Label>
          <Input
            id={totalFreibetragId}
            type="text"
            value={formatCurrency(totalFreibetrag)}
            disabled
            className="bg-gray-50"
          />
          <p className="text-sm text-muted-foreground">
            {totalFreibetrag === 1000
              ? 'Einzelperson: 1.000 € pro Jahr'
              : totalFreibetrag === 2000
                ? 'Ehepaar: 2.000 € pro Jahr'
                : `${formatCurrency(totalFreibetrag)} pro Jahr`}
          </p>
        </div>

        {/* Account List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Bankkonten / Depots</Label>
            <Button onClick={handleAddAccount} size="sm" variant="outline">
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

          {accounts.map((account) => {
            const accountNameId = generateFormId('freistellungsauftrag', 'account-name', account.id)
            const accountGainsId = generateFormId('freistellungsauftrag', 'account-gains', account.id)
            const accountFreibetragId = generateFormId('freistellungsauftrag', 'account-freibetrag', account.id)

            const optimizedAccount = optimizationResult?.accounts.find(a => a.id === account.id)
            const taxRate = effectiveTaxRates.find(r => r.accountId === account.id)

            return (
              <Card key={account.id} className="relative">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <Label htmlFor={accountNameId}>Kontoname</Label>
                        <Input
                          id={accountNameId}
                          type="text"
                          value={account.name}
                          onChange={e => handleAccountChange(account.id, 'name', e.target.value)}
                          placeholder="z.B. DKB, Trade Republic, ING"
                        />
                      </div>
                      <Button
                        onClick={() => handleRemoveAccount(account.id)}
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={accountGainsId}>Erwartete Kapitalerträge (€/Jahr)</Label>
                        <Input
                          id={accountGainsId}
                          type="number"
                          min="0"
                          step="100"
                          value={account.expectedCapitalGains}
                          onChange={e =>
                            handleAccountChange(account.id, 'expectedCapitalGains', Number(e.target.value))}
                          placeholder="z.B. 2000"
                        />
                      </div>

                      <div>
                        <Label htmlFor={accountFreibetragId}>
                          Zugewiesener Freibetrag (€)
                          {optimizedAccount && optimizedAccount.assignedFreibetrag !== account.assignedFreibetrag && (
                            <span className="ml-2 text-xs text-green-600 font-normal">
                              Optimal:
                              {' '}
                              {formatCurrency(optimizedAccount.assignedFreibetrag)}
                            </span>
                          )}
                        </Label>
                        <Input
                          id={accountFreibetragId}
                          type="number"
                          min="0"
                          max={totalFreibetrag}
                          step="10"
                          value={account.assignedFreibetrag}
                          onChange={e =>
                            handleAccountChange(account.id, 'assignedFreibetrag', Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Tax Information */}
                    {taxRate && account.expectedCapitalGains > 0 && (
                      <div className="pt-2 border-t">
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Steuer:</span>
                            <span className="font-medium">{formatCurrency(taxRate.taxAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Effektiver Steuersatz:</span>
                            <span className="font-medium">
                              {(taxRate.effectiveTaxRate * 100).toFixed(2)}
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="font-semibold text-red-900 mb-2">Validierungsfehler:</p>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm text-red-700">{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Optimization Results */}
        {optimizationResult && accounts.length > 0 && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-3">Optimierungsergebnis</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Zugewiesener Freibetrag:</span>
                  <span className="font-semibold text-green-900">
                    {formatCurrency(optimizationResult.totalAssignedFreibetrag)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-green-700">Verbleibender Freibetrag:</span>
                  <span className="font-semibold text-green-900">
                    {formatCurrency(optimizationResult.remainingFreibetrag)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-green-700">Eingesparte Steuern:</span>
                  <span className="font-semibold text-green-900">
                    {formatCurrency(optimizationResult.totalTaxSaved)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-green-700">Status:</span>
                  <span className={`font-semibold ${optimizationResult.isOptimal ? 'text-green-900' : 'text-orange-700'}`}>
                    {optimizationResult.isOptimal ? '✓ Optimal' : '⚠ Optimierbar'}
                  </span>
                </div>
              </div>

              {/* Recommendations */}
              {optimizationResult.recommendations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="font-semibold text-green-900 mb-2">Empfehlungen:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {optimizationResult.recommendations.map((rec, recIndex) => (
                      <li key={recIndex} className="text-sm text-green-700">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Apply Button */}
              <div className="mt-4">
                <Button onClick={handleApplyOptimization} className="w-full" variant="default">
                  Optimale Verteilung übernehmen
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Hinweis:</strong>
            {' '}
            Die Optimierung verteilt Ihren Sparerpauschbetrag automatisch auf die Konten
            mit den höchsten erwarteten Kapitalerträgen, um die Steuerlast zu minimieren.
          </p>
          <p>
            Tragen Sie für jedes Konto die erwarteten jährlichen Kapitalerträge ein. Die Optimierung
            berücksichtigt automatisch die Teilfreistellung für Aktienfonds.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
