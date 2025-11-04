import type { VorabpauschaleDetails } from '../../utils/simulate'

interface StepJahresgewinnProps {
  selectedVorabDetails: VorabpauschaleDetails
}

const StepJahresgewinn = ({ selectedVorabDetails }: StepJahresgewinnProps) => {
  return (
    <div
      style={{
        background: '#e3f2fd',
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid #64b5f6',
      }}
    >
      <strong>Schritt 3: Tatsächlichen Gewinn ermitteln</strong>
      <div style={{ marginTop: '8px', fontSize: '0.9rem' }}>
        Der reale Wertzuwachs der Anlage im betrachteten Jahr.
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
