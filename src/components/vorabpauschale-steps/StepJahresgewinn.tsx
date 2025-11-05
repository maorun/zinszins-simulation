import type { VorabpauschaleDetails } from '../../utils/simulate'

interface StepJahresgewinnProps {
  selectedVorabDetails: VorabpauschaleDetails
}

const StepJahresgewinn = ({ selectedVorabDetails }: StepJahresgewinnProps) => {
  return (
    <div className="bg-[#e3f2fd] p-3 rounded-md border border-[#64b5f6]">
      <strong>Schritt 3: Tatsächlichen Gewinn ermitteln</strong>
      <div className="mt-2 text-sm">
        Der reale Wertzuwachs der Anlage im betrachteten Jahr.
      </div>
      <div className="mt-2 p-2 bg-white rounded font-mono">
        Tatsächlicher Gewinn =
        {' '}
        {Number(selectedVorabDetails.jahresgewinn).toLocaleString('de-DE', {
          minimumFractionDigits: 2,
        })}
        {' '}
        €
      </div>
    </div>
  )
}

export default StepJahresgewinn
