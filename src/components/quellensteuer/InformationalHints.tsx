export function InformationalHints() {
  return (
    <div className="text-xs text-muted-foreground p-3 bg-blue-50 rounded border border-blue-200">
      <div className="font-semibold mb-1">ℹ️ Hinweise zur Quellensteueranrechnung</div>
      <ul className="list-disc list-inside space-y-1">
        <li>Ausländische Quellensteuer kann auf die deutsche Kapitalertragsteuer angerechnet werden</li>
        <li>Die Anrechnung ist begrenzt auf die deutsche Steuer, die auf die ausländischen Einkünfte entfällt</li>
        <li>Für viele Länder gelten reduzierte Sätze durch Doppelbesteuerungsabkommen (DBA)</li>
        <li>Die Teilfreistellung für Aktienfonds wird bei der Berechnung berücksichtigt</li>
        <li>
          Bei Schweizer Dividenden: 35% Quellensteuer werden einbehalten, aber nur 15% nach DBA - die
          Differenz kann in der Schweiz zurückgefordert werden (DA-1 Formular)
        </li>
      </ul>
    </div>
  )
}
