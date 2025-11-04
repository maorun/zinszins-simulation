import type { VorabpauschaleDetails } from '../../utils/simulate'

interface StepBasiszinsProps {
  selectedVorabDetails: VorabpauschaleDetails
}

const StepBasiszins = ({ selectedVorabDetails }: StepBasiszinsProps) => {
  return (
    <div
      style={{
        background: '#fff3e0',
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid #ffcc80',
      }}
    >
      <strong>Schritt 1: Basiszins ermitteln</strong>
      <div style={{ marginTop: '8px', fontSize: '0.9rem' }}>
        Der jährliche Basiszins wird vom Bundesfinanzministerium festgelegt.
      </div>
      <div
        style={{
          marginTop: '8px',
          padding: '8px',
          background: '#fff',
          borderRadius: '4px',
          fontFamily: 'monospace',
        }}
      >
        Basiszins =
        {' '}
        {(selectedVorabDetails.basiszins * 100).toFixed(2)}
        %
      </div>
    </div>
  )
}

export default StepBasiszins
