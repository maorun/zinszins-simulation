interface CalculationStep {
  title: string
  description: string
  calculation: string
  result: string
  backgroundColor: string
  borderColor: string
}

interface CalculationStepsSectionProps {
  steps: CalculationStep[]
}

const CalculationStepsSection = ({ steps }: CalculationStepsSectionProps) => {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h5 style={{ color: '#1976d2', marginBottom: '16px' }}>🧮 Schritt-für-Schritt Berechnung</h5>

      <div style={{
        display: 'grid',
        gap: '16px',
        gridTemplateColumns: '1fr',
        maxWidth: '100%',
      }}
      >
        {steps.map((step, index) => (
          <div
            key={index}
            style={{
              background: step.backgroundColor,
              padding: '12px',
              borderRadius: '6px',
              border: `1px solid ${step.borderColor}`,
            }}
          >
            <strong>{step.title}</strong>
            <div style={{ marginTop: '8px', fontSize: '0.9rem' }}>
              {step.description}
            </div>
            <div style={{
              marginTop: '8px',
              padding: '8px',
              background: '#fff',
              borderRadius: '4px',
              fontFamily: 'monospace',
            }}
            >
              <div dangerouslySetInnerHTML={{ __html: step.calculation }} />
              =
              {' '}
              <strong>{step.result}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CalculationStepsSection
