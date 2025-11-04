import type { VorabpauschaleDetails } from '../../utils/simulate'

interface StepBasisertragProps {
  selectedVorabDetails: VorabpauschaleDetails
}

const StepBasisertrag = ({ selectedVorabDetails }: StepBasisertragProps) => {
  return (
    <div
      style={{
        background: '#e8f5e8',
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid #81c784',
      }}
    >
      <strong>Schritt 2: Basisertrag berechnen</strong>
      <div style={{ marginTop: '8px', fontSize: '0.9rem' }}>
        70% des theoretischen Ertrags bei Basiszins, anteilig für den Besitzzeitraum.
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
