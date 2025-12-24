import { Info } from 'lucide-react'

/**
 * Information section explaining Progressionsvorbehalt
 */
export function ProgressionsvorbehaltInfo() {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex gap-2">
        <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />
        <div className="space-y-2 text-sm text-blue-900">
          <p className="font-semibold">Was ist der Progressionsvorbehalt?</p>
          <p>
            Bestimmte steuerfreie Einkünfte (z.B. Elterngeld, Arbeitslosengeld I, Kurzarbeitergeld, ausländische
            Einkünfte) erhöhen Ihren Steuersatz auf das zu versteuernde Einkommen, obwohl sie selbst steuerfrei sind.
          </p>
          <p className="text-xs">
            Dies kann zu einer höheren Steuerlast auf Ihre sonstigen Einkünfte (z.B. Kapitalerträge, Entnahmen) führen.
          </p>
        </div>
      </div>
    </div>
  )
}
