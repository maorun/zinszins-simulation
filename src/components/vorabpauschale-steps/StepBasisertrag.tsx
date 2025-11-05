import type { VorabpauschaleDetails } from '../../utils/simulate'

interface StepBasisertragProps {
  selectedVorabDetails: VorabpauschaleDetails
}

const StepBasisertrag = ({ selectedVorabDetails }: StepBasisertragProps) => {
  return (
    <div className="bg-[#e8f5e8] p-3 rounded-md border border-[#81c784]">
      <strong>Schritt 2: Basisertrag berechnen</strong>
      <div className="mt-2 text-sm">
        70% des theoretischen Ertrags bei Basiszins, anteilig für den Besitzzeitraum.
      </div>
      <div className="mt-2 p-2 bg-white rounded font-mono">
        Startkapital × Basiszins × 70% × (
        {selectedVorabDetails.anteilImJahr}
        /12)
        <br />
        =
        {' '}
        Startkapital ×
        {' '}
        {(selectedVorabDetails.basiszins * 100).toFixed(2)}
        % × 70% × (
        {selectedVorabDetails.anteilImJahr}
        /12)
        <br />
        =
        {' '}
        <strong>
          {Number(selectedVorabDetails.basisertrag).toLocaleString('de-DE', {
            minimumFractionDigits: 2,
          })}
          {' '}
          €
        </strong>
      </div>
    </div>
  )
}

export default StepBasisertrag
