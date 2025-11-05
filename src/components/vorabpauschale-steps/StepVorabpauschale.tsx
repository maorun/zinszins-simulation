import type { VorabpauschaleDetails } from '../../utils/simulate'

interface StepVorabpauschaleProps {
  selectedVorabDetails: VorabpauschaleDetails
}

const StepVorabpauschale = ({ selectedVorabDetails }: StepVorabpauschaleProps) => {
  return (
    <div className="bg-[#f3e5f5] p-3 rounded-md border border-[#ba68c8]">
      <strong>Schritt 4: Vorabpauschale bestimmen</strong>
      <div className="mt-2 text-sm">
        Das Minimum aus Basisertrag und tatsächlichem Gewinn (nie negativ).
      </div>
      <div className="mt-2 p-2 bg-white rounded font-mono">
        Vorabpauschale = min(
        {Number(selectedVorabDetails.basisertrag).toLocaleString('de-DE', {
          minimumFractionDigits: 2,
        })}
        {' '}
        €,
        {' '}
        {Number(selectedVorabDetails.jahresgewinn).toLocaleString('de-DE', {
          minimumFractionDigits: 2,
        })}
        {' '}
        €)
        <br />
        = max(0,
        {' '}
        <strong>
          {Number(selectedVorabDetails.vorabpauschaleAmount).toLocaleString('de-DE', {
            minimumFractionDigits: 2,
          })}
          {' '}
          €
        </strong>
        )
      </div>
    </div>
  )
}

export default StepVorabpauschale
