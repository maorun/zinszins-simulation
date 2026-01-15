import { useState, useMemo } from 'react'
import { Card, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { CollapsibleCardHeader } from './ui/collapsible-card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import {
  calculateMidijobBeitraege,
  calculateOptimalGleitzoneIncome,
  compareMinijobRentenversicherung,
  calculateVersicherungspflichtgrenzeOptimization,
  getDefaultMidijobConfig,
  SV_CONSTANTS_2024,
  type MidijobConfig,
  type MidijobErgebnis,
} from '../../helpers/sozialversicherung-optimierung'
import { formatCurrency } from '../utils/currency'
import { generateFormId } from '../utils/unique-id'

/**
 * Sozialversicherungs-Optimierung für Grenzfälle
 * 
 * Interactive calculator for social security optimization in German border cases:
 * - Midijob/Gleitzone (538€ - 2,000€)
 * - Minijob (up to 538€)
 * - Versicherungspflichtgrenze (69,300€/year)
 */
export function SozialversicherungsOptimierungCard() {
  const [config, setConfig] = useState<MidijobConfig>(getDefaultMidijobConfig())

  return (
    <Card nestingLevel={1}>
      <Collapsible defaultOpen={false}>
        <CollapsibleCardHeader titleClassName="text-left" simplifiedPadding>
          💼 Sozialversicherungs-Optimierung für Grenzfälle
        </CollapsibleCardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={1}>
            <div className="space-y-6">
              <InfoSection />
              <MidijobCalculator config={config} onConfigChange={setConfig} />
              <OptimalIncomeSection config={config} />
              <MinijobRentenversicherungSection config={config} />
              <VersicherungspflichtgrenzeSection />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

function InfoSection() {
  return (
    <div className="text-sm text-gray-700 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-semibold text-blue-900 mb-2">📊 Sozialversicherungs-Rechner</h4>
      <p className="text-xs text-blue-800 mb-2">
        Dieser Rechner hilft bei der Optimierung von Gehältern in Grenzbereichen des deutschen Sozialversicherungssystems:
      </p>
      <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
        <li>
          <strong>Minijob</strong>: Bis {SV_CONSTANTS_2024.minijobGrenze.toLocaleString('de-DE')} € monatlich
        </li>
        <li>
          <strong>Gleitzone/Midijob</strong>: {SV_CONSTANTS_2024.gleitzoneUntergrenze.toLocaleString('de-DE')} € -{' '}
          {SV_CONSTANTS_2024.gleitzoneObergrenze.toLocaleString('de-DE')} € monatlich (reduzierte Arbeitnehmerbeiträge)
        </li>
        <li>
          <strong>Versicherungspflichtgrenze</strong>: {SV_CONSTANTS_2024.versicherungspflichtgrenze.toLocaleString('de-DE')} €
          jährlich (Wechsel zur PKV möglich)
        </li>
      </ul>
    </div>
  )
}

interface MidijobCalculatorProps {
  config: MidijobConfig
  onConfigChange: (config: MidijobConfig) => void
}

function MidijobCalculator({ config, onConfigChange }: MidijobCalculatorProps) {
  const bruttoId = useMemo(() => generateFormId('sv-optimierung', 'brutto'), [])
  const kinderlosId = useMemo(() => generateFormId('sv-optimierung', 'kinderlos'), [])
  const rentenBefreiungId = useMemo(() => generateFormId('sv-optimierung', 'renten-befreiung'), [])

  const ergebnis = calculateMidijobBeitraege(config)

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900">🧮 Brutto-Netto-Rechner</h4>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={bruttoId}>Monatliches Bruttoeinkommen (€)</Label>
          <Input
            id={bruttoId}
            type="number"
            value={config.bruttoEinkommen}
            onChange={(e) => onConfigChange({ ...config, bruttoEinkommen: Number(e.target.value) || 0 })}
            min={0}
            max={5000}
            step={10}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor={kinderlosId} className="text-sm">
              Kinderlos (über 23 Jahre)
            </Label>
            <Switch
              id={kinderlosId}
              checked={config.kinderlos}
              onCheckedChange={(checked) => onConfigChange({ ...config, kinderlos: checked })}
            />
          </div>

          {ergebnis.istMinijob && (
            <div className="flex items-center justify-between">
              <Label htmlFor={rentenBefreiungId} className="text-sm">
                Von Rentenversicherung befreit
              </Label>
              <Switch
                id={rentenBefreiungId}
                checked={config.rentenversicherungBefreiung}
                onCheckedChange={(checked) => onConfigChange({ ...config, rentenversicherungBefreiung: checked })}
              />
            </div>
          )}
        </div>
      </div>

      <ResultsDisplay ergebnis={ergebnis} />
    </div>
  )
}

interface ResultsDisplayProps {
  ergebnis: MidijobErgebnis
}

function ResultsDisplay({ ergebnis }: ResultsDisplayProps) {
  return (
    <div className="space-y-4">
      <StatusBadges ergebnis={ergebnis} />
      <MainResults ergebnis={ergebnis} />
      {ergebnis.istGleitzone && <GleitzoneDetails ergebnis={ergebnis} />}
      <BreakdownDetails ergebnis={ergebnis} />
    </div>
  )
}

function StatusBadges({ ergebnis }: { ergebnis: MidijobErgebnis }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {ergebnis.istMinijob && <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Minijob</span>}
      {ergebnis.istGleitzone && (
        <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          Gleitzone (reduzierte SV-Beiträge)
        </span>
      )}
      {!ergebnis.istMinijob && !ergebnis.istGleitzone && (
        <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Reguläre Beschäftigung</span>
      )}
    </div>
  )
}

function MainResults({ ergebnis }: { ergebnis: MidijobErgebnis }) {
  return (
    <div className="grid gap-3 p-4 bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-700">Bruttoeinkommen:</span>
        <span className="text-lg font-bold text-gray-900">{formatCurrency(ergebnis.brutto)}</span>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-green-200">
        <span className="text-sm text-gray-700">Arbeitnehmerbeitrag SV:</span>
        <span className="text-sm font-medium text-red-700">- {formatCurrency(ergebnis.arbeitnehmerBeitrag)}</span>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-green-200">
        <span className="text-sm font-semibold text-green-900">Nettoeinkommen:</span>
        <span className="text-xl font-bold text-green-900">{formatCurrency(ergebnis.netto)}</span>
      </div>
      <div className="text-xs text-gray-600 mt-2">Netto-Quote: {((ergebnis.netto / ergebnis.brutto) * 100).toFixed(1)}%</div>
    </div>
  )
}

function GleitzoneDetails({ ergebnis }: { ergebnis: MidijobErgebnis }) {
  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
      <div className="font-semibold text-blue-900 mb-2">💡 Gleitzone-Vorteil:</div>
      <div className="space-y-1 text-blue-800">
        <div className="flex justify-between">
          <span>Gleitzonenfaktor (F):</span>
          <span className="font-medium">{ergebnis.gleitzonenfaktor.toFixed(4)}</span>
        </div>
        <div className="flex justify-between">
          <span>Bemessungsentgelt:</span>
          <span className="font-medium">{formatCurrency(ergebnis.bemessungsentgelt)}</span>
        </div>
        <p className="mt-2 text-xs">
          Durch die Gleitzonenregelung zahlen Sie reduzierte Sozialversicherungsbeiträge auf Basis des niedrigeren Bemessungsentgelts
          statt auf Ihr volles Bruttogehalt.
        </p>
      </div>
    </div>
  )
}

function BreakdownDetails({ ergebnis }: { ergebnis: MidijobErgebnis }) {
  return (
    <details className="text-sm">
      <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">📋 Detaillierte Aufschlüsselung</summary>
      <BreakdownContent ergebnis={ergebnis} />
    </details>
  )
}

function BreakdownContent({ ergebnis }: { ergebnis: MidijobErgebnis }) {
  return (
    <div className="mt-2 space-y-2 p-3 bg-gray-50 rounded-lg text-xs">
      <EmployeeContributions ergebnis={ergebnis} />
      <EmployerCosts ergebnis={ergebnis} />
      <PensionPoints ergebnis={ergebnis} />
    </div>
  )
}

function EmployeeContributions({ ergebnis }: { ergebnis: MidijobErgebnis }) {
  return (
    <>
      <div className="font-semibold text-gray-900 mb-2">Arbeitnehmerbeiträge:</div>
      <div className="space-y-1 ml-2">
        <div className="flex justify-between">
          <span>Krankenversicherung:</span>
          <span>{formatCurrency(ergebnis.beitraege.krankenversicherung)}</span>
        </div>
        <div className="flex justify-between">
          <span>Pflegeversicherung:</span>
          <span>{formatCurrency(ergebnis.beitraege.pflegeversicherung)}</span>
        </div>
        <div className="flex justify-between">
          <span>Rentenversicherung:</span>
          <span>{formatCurrency(ergebnis.beitraege.rentenversicherung)}</span>
        </div>
        <div className="flex justify-between">
          <span>Arbeitslosenversicherung:</span>
          <span>{formatCurrency(ergebnis.beitraege.arbeitslosenversicherung)}</span>
        </div>
      </div>
    </>
  )
}

function EmployerCosts({ ergebnis }: { ergebnis: MidijobErgebnis }) {
  return (
    <div className="pt-2 mt-2 border-t border-gray-300">
      <div className="font-semibold text-gray-900 mb-2">Arbeitgeberkosten:</div>
      <div className="space-y-1 ml-2">
        <div className="flex justify-between">
          <span>Bruttolohn:</span>
          <span>{formatCurrency(ergebnis.brutto)}</span>
        </div>
        <div className="flex justify-between">
          <span>Arbeitgeberbeitrag SV:</span>
          <span>{formatCurrency(ergebnis.arbeitgeberBeitrag)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Gesamtkosten:</span>
          <span>{formatCurrency(ergebnis.arbeitgeberKosten)}</span>
        </div>
      </div>
    </div>
  )
}

function PensionPoints({ ergebnis }: { ergebnis: MidijobErgebnis }) {
  return (
    <div className="pt-2 mt-2 border-t border-gray-300">
      <div className="font-semibold text-gray-900 mb-1">Rentenpunkte:</div>
      <div className="flex justify-between ml-2">
        <span>Erworben pro Jahr:</span>
        <span className="font-medium">{ergebnis.rentenpunkteProJahr.toFixed(4)} Punkte</span>
      </div>
      <div className="text-xs text-gray-600 mt-1 ml-2">
        ≈ {(ergebnis.rentenpunkteProJahr * SV_CONSTANTS_2024.rentenpunktWertMonatlich).toLocaleString('de-DE')} €/Monat zusätzliche
        Rente
      </div>
    </div>
  )
}

interface OptimalIncomeSectionProps {
  config: MidijobConfig
}

function OptimalIncomeSection({ config }: OptimalIncomeSectionProps) {
  const optimal = useMemo(() => calculateOptimalGleitzoneIncome(config.kinderlos), [config.kinderlos])

  return (
    <div className="space-y-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
      <h4 className="font-semibold text-purple-900">🎯 Optimales Einkommen in der Gleitzone</h4>
      <p className="text-xs text-purple-800">
        Das optimale Einkommen maximiert die Netto-Quote (Verhältnis von Nettoeinkommen zu Bruttoeinkommen) innerhalb der
        Gleitzone:
      </p>

      <div className="grid gap-3 p-3 bg-white rounded-lg border border-purple-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">Optimales Brutto:</span>
          <span className="text-lg font-bold text-purple-900">{formatCurrency(optimal.optimalBrutto)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">Nettoeinkommen:</span>
          <span className="text-lg font-bold text-green-700">{formatCurrency(optimal.ergebnis.netto)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">Netto-Quote:</span>
          <span className="text-base font-semibold text-purple-900">{(optimal.nettoProEuro * 100).toFixed(2)}%</span>
        </div>
      </div>

      <p className="text-xs text-purple-700 italic">
        💡 Tipp: Bei diesem Einkommen behalten Sie den höchsten Prozentsatz Ihres Bruttoeinkommens als Netto.
      </p>
    </div>
  )
}

interface MinijobRentenversicherungSectionProps {
  config: MidijobConfig
}

function MinijobRentenversicherungSection({ config }: MinijobRentenversicherungSectionProps) {
  const comparison = useMemo(() => compareMinijobRentenversicherung(config.bruttoEinkommen), [config.bruttoEinkommen])
  const ergebnis = calculateMidijobBeitraege(config)

  if (!ergebnis.istMinijob) {
    return null
  }

  return <MinijobRentenversicherungDisplay comparison={comparison} />
}

interface MinijobRentenversicherungDisplayProps {
  comparison: ReturnType<typeof compareMinijobRentenversicherung>
}

function MinijobRentenversicherungDisplay({ comparison }: MinijobRentenversicherungDisplayProps) {
  return (
    <div className="space-y-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h4 className="font-semibold text-yellow-900">🤔 Minijob: Rentenversicherungspflicht nutzen?</h4>
      <p className="text-xs text-yellow-800">
        Bei Minijobs können Sie sich von der Rentenversicherungspflicht befreien lassen. Hier ist der Vergleich:
      </p>

      <div className="grid md:grid-cols-2 gap-3">
        <MinijobWithRVCard ergebnis={comparison.mitRentenversicherung} comparison={comparison} />
        <MinijobWithoutRVCard ergebnis={comparison.ohneRentenversicherung} />
      </div>

      <MinijobRVTradeoff comparison={comparison} />
    </div>
  )
}

function MinijobWithRVCard({
  ergebnis,
  comparison,
}: {
  ergebnis: MidijobErgebnis
  comparison: ReturnType<typeof compareMinijobRentenversicherung>
}) {
  return (
    <div className="p-3 bg-white rounded-lg border border-yellow-300">
      <div className="font-medium text-yellow-900 mb-2 text-sm">Mit Rentenversicherung</div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Monatlicher Beitrag:</span>
          <span className="font-medium text-red-700">-{formatCurrency(ergebnis.arbeitnehmerBeitrag)}</span>
        </div>
        <div className="flex justify-between">
          <span>Netto:</span>
          <span className="font-medium">{formatCurrency(ergebnis.netto)}</span>
        </div>
        <div className="flex justify-between text-green-700">
          <span>Rentenpunkte/Jahr:</span>
          <span className="font-medium">{comparison.verloreneRentenpunkte.toFixed(4)}</span>
        </div>
        <div className="flex justify-between text-green-700">
          <span>Zusätzliche Rente:</span>
          <span className="font-medium">+{formatCurrency(comparison.entgangeneRente)}/Monat</span>
        </div>
      </div>
    </div>
  )
}

function MinijobWithoutRVCard({ ergebnis }: { ergebnis: MidijobErgebnis }) {
  return (
    <div className="p-3 bg-white rounded-lg border border-yellow-300">
      <div className="font-medium text-yellow-900 mb-2 text-sm">Ohne Rentenversicherung (Befreiung)</div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Monatlicher Beitrag:</span>
          <span className="font-medium text-gray-500">{formatCurrency(ergebnis.arbeitnehmerBeitrag)}</span>
        </div>
        <div className="flex justify-between">
          <span>Netto:</span>
          <span className="font-medium">{formatCurrency(ergebnis.netto)}</span>
        </div>
        <div className="flex justify-between text-red-700">
          <span>Rentenpunkte/Jahr:</span>
          <span className="font-medium">0</span>
        </div>
        <div className="flex justify-between text-red-700">
          <span>Keine Rentenpunkte:</span>
          <span className="font-medium">0 €/Monat</span>
        </div>
      </div>
    </div>
  )
}

function MinijobRVTradeoff({ comparison }: { comparison: ReturnType<typeof compareMinijobRentenversicherung> }) {
  return (
    <div className="p-3 bg-yellow-100 rounded-lg text-xs">
      <div className="font-semibold text-yellow-900 mb-1">💰 Abwägung:</div>
      <div className="text-yellow-800 space-y-1">
        <div>
          • Mehr Netto jetzt: <strong>+{formatCurrency(comparison.mehrNetto)}</strong> pro Monat
        </div>
        <div>
          • Verlorene Rente später: <strong>-{formatCurrency(comparison.entgangeneRente)}</strong> pro Monat (lebenslang)
        </div>
        <div className="mt-2 pt-2 border-t border-yellow-300">
          Die Rentenversicherung lohnt sich meist langfristig, besonders bei längerer Lebenserwartung.
        </div>
      </div>
    </div>
  )
}

function VersicherungspflichtgrenzeSection() {
  const [jahresBrutto, setJahresBrutto] = useState(65000)
  const jahresBruttoId = useMemo(() => generateFormId('sv-optimierung', 'jahres-brutto'), [])
  const optimization = useMemo(() => calculateVersicherungspflichtgrenzeOptimization(jahresBrutto), [jahresBrutto])

  return (
    <div className="space-y-3 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
      <h4 className="font-semibold text-indigo-900">🏥 Versicherungspflichtgrenze-Optimierung</h4>
      <p className="text-xs text-indigo-800">
        Ab {SV_CONSTANTS_2024.versicherungspflichtgrenze.toLocaleString('de-DE')} € Jahreseinkommen können Sie von der gesetzlichen
        (GKV) in die private Krankenversicherung (PKV) wechseln.
      </p>

      <div className="space-y-2">
        <Label htmlFor={jahresBruttoId}>Jahresbruttoeinkommen (€)</Label>
        <Input
          id={jahresBruttoId}
          type="number"
          value={jahresBrutto}
          onChange={(e) => setJahresBrutto(Number(e.target.value) || 0)}
          min={30000}
          max={150000}
          step={1000}
        />
      </div>

      <PKVEligibilityStatus optimization={optimization} />
      <PKVWarnings />
    </div>
  )
}

function PKVEligibilityStatus({ optimization }: { optimization: ReturnType<typeof calculateVersicherungspflichtgrenzeOptimization> }) {
  return (
    <div className="p-3 bg-white rounded-lg border border-indigo-200">
      <div className="space-y-2 text-sm">
        {optimization.pkvVorteilhaft && optimization.ueberschreitungsbetrag >= 0 ? (
          <div className="text-green-700">
            <div className="font-semibold mb-1">✅ PKV-Berechtigung erreicht</div>
            <div className="text-xs">
              Sie überschreiten die Versicherungspflichtgrenze um <strong>{formatCurrency(optimization.ueberschreitungsbetrag)}</strong>.
            </div>
          </div>
        ) : optimization.mehrverdienstFuerPKV < 5000 ? (
          <div className="text-yellow-700">
            <div className="font-semibold mb-1">⚠️ Knapp unter der Grenze</div>
            <div className="text-xs">
              Nur noch <strong>{formatCurrency(optimization.mehrverdienstFuerPKV)}</strong> fehlen für PKV-Berechtigung.
            </div>
          </div>
        ) : (
          <div className="text-gray-700">
            <div className="font-semibold mb-1">ℹ️ Deutlich unter der Grenze</div>
            <div className="text-xs">
              <strong>{formatCurrency(optimization.mehrverdienstFuerPKV)}</strong> fehlen für PKV-Berechtigung.
            </div>
          </div>
        )}
        <div className="pt-2 mt-2 border-t border-indigo-200 text-xs text-indigo-800">{optimization.empfehlung}</div>
      </div>
    </div>
  )
}

function PKVWarnings() {
  return (
    <div className="p-3 bg-indigo-100 rounded-lg text-xs text-indigo-800">
      <div className="font-semibold mb-1">⚠️ Wichtige Hinweise:</div>
      <ul className="space-y-1 ml-4 list-disc">
        <li>PKV-Beiträge sind nicht einkommensabhängig, sondern nach Alter, Gesundheit und Leistungsumfang</li>
        <li>Rückkehr in die GKV ist nach PKV-Wechsel oft schwierig oder unmöglich</li>
        <li>Familienversicherung in der PKV kostet extra (anders als in der GKV)</li>
        <li>Lassen Sie sich vor einem Wechsel unabhängig beraten</li>
      </ul>
    </div>
  )
}
