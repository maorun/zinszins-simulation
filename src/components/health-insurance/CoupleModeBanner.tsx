interface CoupleModeBannerProps {
  planningMode: 'individual' | 'couple'
}

/**
 * Info banner displayed when couple planning mode is active
 */
export function CoupleModeBanner({ planningMode }: CoupleModeBannerProps) {
  if (planningMode !== 'couple') {
    return null
  }

  return (
    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="text-sm font-medium text-blue-900">
        💑 Paarplanung aktiviert
      </div>
      <div className="text-xs text-blue-700 mt-1">
        Planungsmodus wird aus der globalen Planung übernommen
      </div>
    </div>
  )
}
