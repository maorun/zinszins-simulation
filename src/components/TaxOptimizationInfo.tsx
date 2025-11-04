export function TaxOptimizationInfo() {
  return (
    <div className="bg-green-100 border border-green-300 rounded-md p-3">
      <div className="text-sm">
        <div className="font-medium text-green-900 mb-1">💡 Steueroptimierung:</div>
        <div className="text-green-800 text-xs space-y-1">
          <div>• Berücksichtigt Vorabpauschale und Basiszins</div>
          <div>• Nutzt Sparerpauschbetrag (Freibetrag) optimal</div>
          <div>• Passt Entnahmebeträge dynamisch an</div>
          <div>• Berücksichtigt Günstigerprüfung bei hohen Einkommen</div>
        </div>
      </div>
    </div>
  )
}
