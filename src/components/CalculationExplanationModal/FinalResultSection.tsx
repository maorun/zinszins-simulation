interface FinalResultSectionProps {
  finalResult: {
    title: string
    values: Array<{ label: string, value: string }>
  }
}

const FinalResultSection = ({ finalResult }: FinalResultSectionProps) => {
  return (
    <div className="bg-[#e8f5e8] p-4 rounded-lg border border-[#81c784]">
      <h5 className="text-[#2e7d32] mb-3">
        ✅
        {finalResult.title}
      </h5>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
        {finalResult.values.map((item, index) => (
          <div key={index}>
            <strong>
              {item.label}
              :
            </strong>
            <br />
            {item.value}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FinalResultSection
