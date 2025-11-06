import type { VorabpauschaleDetails } from '../../utils/simulate'

interface StepSteuerProps {
  selectedVorabDetails: VorabpauschaleDetails
}

const StepSteuer = ({ selectedVorabDetails }: StepSteuerProps) => {
  return (
    <div className="bg-[#ffebee] p-3 rounded-md border border-[#ef5350]">
      <strong>Schritt 5: Steuer berechnen (vor Freibetrag)</strong>
      <div className="mt-2 text-sm">Kapitalertragsteuer auf die Vorabpauschale, reduziert um Teilfreistellung.</div>
      <div className="mt-2 p-2 bg-white rounded font-mono">
        Steuer ={' '}
        {Number(selectedVorabDetails.vorabpauschaleAmount).toLocaleString('de-DE', {
          minimumFractionDigits: 2,
        })}{' '}
        € × Steuersatz × (1 - Teilfreistellung)
        <br />={' '}
        <strong>
          {Number(selectedVorabDetails.steuerVorFreibetrag).toLocaleString('de-DE', {
            minimumFractionDigits: 2,
          })}{' '}
          €
        </strong>
      </div>
    </div>
  )
}

export default StepSteuer
