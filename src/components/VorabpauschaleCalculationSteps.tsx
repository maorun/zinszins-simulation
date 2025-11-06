import type { VorabpauschaleDetails } from '../utils/simulate'
import StepBasiszins from './vorabpauschale-steps/StepBasiszins'
import StepBasisertrag from './vorabpauschale-steps/StepBasisertrag'
import StepJahresgewinn from './vorabpauschale-steps/StepJahresgewinn'
import StepVorabpauschale from './vorabpauschale-steps/StepVorabpauschale'
import StepSteuer from './vorabpauschale-steps/StepSteuer'

interface VorabpauschaleCalculationStepsProps {
  selectedVorabDetails: VorabpauschaleDetails
}

const VorabpauschaleCalculationSteps = ({ selectedVorabDetails }: VorabpauschaleCalculationStepsProps) => {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h5 style={{ color: '#1976d2', marginBottom: '16px' }}>🧮 Schritt-für-Schritt Berechnung</h5>

      <div
        style={{
          display: 'grid',
          gap: '16px',
          gridTemplateColumns: '1fr',
          maxWidth: '100%',
        }}
      >
        <StepBasiszins selectedVorabDetails={selectedVorabDetails} />
        <StepBasisertrag selectedVorabDetails={selectedVorabDetails} />
        <StepJahresgewinn selectedVorabDetails={selectedVorabDetails} />
        <StepVorabpauschale selectedVorabDetails={selectedVorabDetails} />
        <StepSteuer selectedVorabDetails={selectedVorabDetails} />
      </div>
    </div>
  )
}

export default VorabpauschaleCalculationSteps
