import type { VorabpauschaleDetails } from '../../utils/simulate'

interface StepSteuerProps {
  selectedVorabDetails: VorabpauschaleDetails
}

const StepSteuer = ({ selectedVorabDetails }: StepSteuerProps) => {
  return (
    <div
      style={{
        background: '#ffebee',
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid #ef5350',
      }}
    >
      <strong>Schritt 5: Steuer berechnen (vor Freibetrag)</strong>
      <div style={{ marginTop: '8px', fontSize: '0.9rem' }}>
        Kapitalertragsteuer auf die Vorabpauschale, reduziert um Teilfreistellung.
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
        Steuer =
        {' '}
        {Number(selectedVorabDetails.vorabpauschaleAmount).toLocaleString('de-DE', {
          minimumFractionDigits: 2,
        })}
        {' '}
        € × Steuersatz × (1 - Teilfreistellung)
        <br />
        =
        {' '}
        <strong>
          {Number(selectedVorabDetails.steuerVorFreibetrag).toLocaleString('de-DE', {
            minimumFractionDigits: 2,
          })}
          {' '}
          €
        </strong>
      </div>
    </div>
  )
}

export default StepSteuer
