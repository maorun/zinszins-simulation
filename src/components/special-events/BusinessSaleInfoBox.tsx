export function BusinessSaleInfoBox() {
  return (
    <div className="p-3 bg-blue-100 border border-blue-300 rounded-md mt-4">
      <p className="text-sm text-blue-900">
        <strong>💡 Steuerliche Besonderheiten:</strong>
      </p>
      <ul className="text-xs text-blue-800 mt-2 space-y-1 ml-4 list-disc">
        <li>
          <strong>§16 EStG Freibetrag:</strong> Bis zu 45.000€ steuerfrei bei Verkauf ab 55 Jahren
          oder bei dauerhafter Erwerbsminderung
        </li>
        <li>
          <strong>Freibetragskurve:</strong> Volle 45.000€ bis 136.000€ Gewinn, dann schrittweise
          Abbau bis 181.000€
        </li>
        <li>
          <strong>Fünftelregelung:</strong> Verteilt außerordentliche Einkünfte steuerlich auf 5
          Jahre (§34 EStG)
        </li>
        <li>
          <strong>Solidaritätszuschlag:</strong> 5,5% der Einkommensteuer werden zusätzlich
          berechnet
        </li>
      </ul>
    </div>
  )
}
