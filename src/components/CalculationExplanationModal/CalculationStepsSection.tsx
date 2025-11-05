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
    <div className="mb-6">
      <h5 className="text-[#1976d2] mb-4">🧮 Schritt-für-Schritt Berechnung</h5>

      <div className="grid gap-4 grid-cols-1 max-w-full">
        {steps.map((step, index) => (
          <div
            key={index}
            className="p-3 rounded-md"
            style={{
              background: step.backgroundColor,
              border: `1px solid ${step.borderColor}`,
            }}
          >
            <strong>{step.title}</strong>
            <div className="mt-2 text-sm">
              {step.description}
            </div>
            <div className="mt-2 p-2 bg-white rounded font-mono">
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
