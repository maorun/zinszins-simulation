export function CareCostInfoBox() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
      <p className="font-semibold mb-2">ℹ️ Berücksichtigt werden:</p>
      <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
        <li>Gesetzliche Pflegeversicherungsleistungen (Pflegegeld)</li>
        <li>Jährliche Inflation der Pflegekosten</li>
        <li>Steuerliche Absetzbarkeit als außergewöhnliche Belastung</li>
        <li>Integration in die Gesamtfinanzplanung</li>
      </ul>
    </div>
  )
}
