/**
 * Goal progress bar component
 */
export function GoalProgressBar({ progress, achieved }: { progress: number; achieved: boolean }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">Fortschritt</span>
        <span className="text-sm font-bold text-blue-600">{progress.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${achieved ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
    </div>
  )
}
