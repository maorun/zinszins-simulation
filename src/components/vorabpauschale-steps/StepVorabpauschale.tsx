import type { VorabpauschaleDetails } from '../../utils/simulate'

interface StepVorabpauschaleProps {
  selectedVorabDetails: VorabpauschaleDetails
}

const StepVorabpauschale = ({ selectedVorabDetails }: StepVorabpauschaleProps) => {
  return (
    <div
      style={{
        background: '#f3e5f5',
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid #ba68c8',
      }}
    >
      <strong>Schritt 4: Vorabpauschale bestimmen</strong>
      <div style={{ marginTop: '8px', fontSize: '0.9rem' }}>
        Das Minimum aus Basisertrag und tatsächlichem Gewinn (nie negativ).
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
