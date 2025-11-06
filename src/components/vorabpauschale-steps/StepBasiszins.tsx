import type { VorabpauschaleDetails } from '../../utils/simulate'

interface StepBasiszinsProps {
  selectedVorabDetails: VorabpauschaleDetails
}

const StepBasiszins = ({ selectedVorabDetails }: StepBasiszinsProps) => {
  return (
    <div className="bg-[#fff3e0] p-3 rounded-md border border-[#ffcc80]">
      <strong>Schritt 1: Basiszins ermitteln</strong>
      <div className="mt-2 text-sm">Der jährliche Basiszins wird vom Bundesfinanzministerium festgelegt.</div>
      <div className="mt-2 p-2 bg-white rounded font-mono">
        Basiszins = {(selectedVorabDetails.basiszins * 100).toFixed(2)}%
      </div>
    </div>
  )
}

export default StepBasiszins
