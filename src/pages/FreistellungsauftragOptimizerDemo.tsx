import { useState } from 'react'
import { FreistellungsauftragOptimizer } from '../components/FreistellungsauftragOptimizer'
import type { BankAccount } from '../../helpers/freistellungsauftrag-optimization'

/**
 * Demo page for the Freistellungsauftrag Optimizer feature
 *
 * This standalone demo shows how German investors can optimize the distribution
 * of their Sparerpauschbetrag (tax-free allowance) across multiple bank accounts.
 *
 * To integrate this feature into the main application:
 * 1. Add BankAccount[] to SimulationContext state
 * 2. Add the FreistellungsauftragOptimizer component to TaxConfiguration.tsx
 * 3. Use the optimized account distribution in tax calculations
 */
export function FreistellungsauftragOptimizerDemo() {
  const [totalFreibetrag] = useState(1000) // Individual investor: 1000€
  const [accounts, setAccounts] = useState<BankAccount[]>([
    {
      id: '1',
      name: 'DKB Depot',
      expectedCapitalGains: 3000,
      assignedFreibetrag: 0,
    },
    {
      id: '2',
      name: 'Trade Republic',
      expectedCapitalGains: 1500,
      assignedFreibetrag: 0,
    },
    {
      id: '3',
      name: 'ING Direkt-Depot',
      expectedCapitalGains: 800,
      assignedFreibetrag: 0,
    },
  ])

  const steuerlast = 26.375 // German capital gains tax
  const teilfreistellungsquote = 30 // 30% partial exemption for equity funds

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Freistellungsaufträge-Optimierung Demo
        </h1>
        <p className="text-muted-foreground">
          Optimieren Sie die Verteilung Ihres Sparerpauschbetrags über mehrere Bankkonten
          zur Minimierung Ihrer Steuerlast.
        </p>
      </div>

      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="font-semibold text-blue-900 mb-2">ℹ️ Über diese Demo</h2>
        <div className="text-sm text-blue-700 space-y-2">
          <p>
            Diese Demo zeigt die Freistellungsaufträge-Optimierung für einen
            {' '}
            <strong>Einzelanleger</strong>
            {' '}
            mit
            {' '}
            <strong>1.000 € Sparerpauschbetrag</strong>
            {' '}
            pro Jahr.
          </p>
          <p>
            Die Optimierung verteilt automatisch den Freibetrag auf die Konten mit den
            höchsten erwarteten Kapitalerträgen, um die Steuerlast zu minimieren.
          </p>
          <p>
            <strong>Beispiel-Szenario:</strong>
            {' '}
            Der Anleger hat drei Depots mit unterschiedlich hohen
            erwarteten Erträgen. Die Optimierung empfiehlt, den gesamten Freibetrag auf das
            DKB Depot zu legen, da es die höchsten erwarteten Erträge hat.
          </p>
        </div>
      </div>

      <FreistellungsauftragOptimizer
        totalFreibetrag={totalFreibetrag}
        accounts={accounts}
        onAccountsChange={setAccounts}
        steuerlast={steuerlast}
        teilfreistellungsquote={teilfreistellungsquote}
      />

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="font-semibold text-yellow-900 mb-2">💡 Tipps zur Nutzung</h2>
        <ul className="text-sm text-yellow-700 space-y-2 list-disc list-inside">
          <li>
            Tragen Sie für jedes Konto die
            {' '}
            <strong>erwarteten jährlichen Kapitalerträge</strong>
            {' '}
            ein
          </li>
          <li>
            Klicken Sie auf
            {' '}
            <strong>"Konto hinzufügen"</strong>
            , um weitere Depots hinzuzufügen
          </li>
          <li>
            Die Optimierung berücksichtigt automatisch die
            {' '}
            <strong>Teilfreistellung</strong>
            {' '}
            für Aktienfonds (30%)
          </li>
          <li>
            Nutzen Sie
            {' '}
            <strong>"Optimale Verteilung übernehmen"</strong>
            , um die empfohlene
            Verteilung anzuwenden
          </li>
          <li>
            Der
            {' '}
            <strong>effektive Steuersatz</strong>
            {' '}
            zeigt, wie viel Prozent Ihrer Gesamterträge
            Sie nach Freibetrag versteuern müssen
          </li>
        </ul>
      </div>

      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h2 className="font-semibold text-green-900 mb-2">✅ Vorteile der Optimierung</h2>
        <div className="text-sm text-green-700 space-y-2">
          <p>
            <strong>Maximale Steuerersparnis:</strong>
            {' '}
            Durch gezielte Verteilung auf Konten mit hohen
            Erträgen sparen Sie mehr Steuern als bei gleichmäßiger Verteilung.
          </p>
          <p>
            <strong>Automatische Berechnung:</strong>
            {' '}
            Das System berechnet sofort die optimale
            Verteilung und zeigt Empfehlungen an.
          </p>
          <p>
            <strong>Transparenz:</strong>
            {' '}
            Sie sehen für jedes Konto den effektiven Steuersatz und die
            tatsächliche Steuerlast.
          </p>
          <p>
            <strong>Gesetzeskonform:</strong>
            {' '}
            Die Optimierung stellt sicher, dass die Summe aller
            Freistellungsaufträge den Sparerpauschbetrag nicht überschreitet.
          </p>
        </div>
      </div>
    </div>
  )
}

export default FreistellungsauftragOptimizerDemo
