import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Info } from 'lucide-react'

interface EMRenteInfoCardProps {
  nestingLevel: number
}

export function EMRenteInfoCard({ nestingLevel }: EMRenteInfoCardProps) {
  return (
    <Card nestingLevel={nestingLevel + 1}>
      <CardHeader nestingLevel={nestingLevel + 1} className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Info className="h-4 w-4" />
          Information
        </CardTitle>
      </CardHeader>
      <CardContent nestingLevel={nestingLevel + 1}>
        <div className="text-sm space-y-2">
          <p>
            Die <strong>Erwerbsminderungsrente (EM-Rente)</strong> ist eine gesetzliche Rente bei dauerhafter
            Erwerbsminderung:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Volle EM-Rente:</strong> Weniger als 3 Stunden täglich arbeitsfähig
            </li>
            <li>
              <strong>Teilweise EM-Rente:</strong> 3-6 Stunden täglich arbeitsfähig (50% der vollen EM-Rente)
            </li>
            <li>
              <strong>Zurechnungszeiten:</strong> Fiktive Beitragszeiten bis zum 67. Lebensjahr
            </li>
            <li>
              <strong>Abschläge:</strong> 0,3% pro Monat vor Regelaltersgrenze (max. 10,8%)
            </li>
            <li>
              <strong>Hinzuverdienstgrenzen:</strong> Zulässige Nebeneinkünfte werden automatisch berücksichtigt
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
