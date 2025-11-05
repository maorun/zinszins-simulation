interface IntroductionSectionProps {
  introduction: string
}

const IntroductionSection = ({ introduction }: IntroductionSectionProps) => {
  return (
    <div className="bg-[#f8f9fa] p-4 rounded-lg mb-5 border border-[#e9ecef]">
      <h5 className="text-[#1976d2] mb-3">🎯 Erklärung</h5>
      <p className="m-0">
        {introduction}
      </p>
    </div>
  )
}

export default IntroductionSection
