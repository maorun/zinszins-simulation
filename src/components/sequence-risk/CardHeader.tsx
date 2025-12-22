import { AlertTriangle } from 'lucide-react'

export function SequenceRiskCardHeader() {
  return (
    <>
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5" />
        <span className="font-semibold">Sequenz-Risiko-Analyse</span>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        Analyse des Einflusses der Rendite-Reihenfolge auf die Portfolio-Nachhaltigkeit im Ruhestand
      </p>
    </>
  )
}
