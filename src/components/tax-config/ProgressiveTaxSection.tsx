import { GlossaryTerm } from '../GlossaryTerm'
import { useMemo } from 'react'
import { generateFormId } from '../../utils/unique-id'

interface ProgressiveTaxInfoSectionProps {
  guenstigerPruefungAktiv: boolean
}

/**
 * Progressive Tax Information section - displays information about
 * the progressive tax system that is used when Günstigerprüfung is active
 */
export function ProgressiveTaxInfoSection({ guenstigerPruefungAktiv }: ProgressiveTaxInfoSectionProps) {
  const sectionId = useMemo(() => generateFormId('progressive-tax-info', 'section'), [])

  if (!guenstigerPruefungAktiv) {
    return null
  }

  return (
    <div id={sectionId} className="border rounded-lg p-4 bg-green-50/50">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium">
            📊 <GlossaryTerm term="progressivesteuer">Progressives Steuersystem</GlossaryTerm>
          </span>
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            Bei aktivierter Günstigerprüfung wird der progressive Einkommensteuertarif berücksichtigt.
            Das System wählt automatisch zwischen Abgeltungssteuer und progressivem Tarif, je nachdem,
            welches für Sie günstiger ist.
          </p>

          <div className="p-3 bg-blue-50 rounded space-y-2">
            <p className="font-medium text-sm">ℹ️ Progressiver Tarif 2024 (Deutschland):</p>
            <ul className="list-disc list-inside ml-2 space-y-0.5 text-xs">
              <li>0 - 11.604€: 0% (Grundfreibetrag)</li>
              <li>11.605€ - 17.005€: 14% - 24% (progressiv)</li>
              <li>17.006€ - 66.760€: 24% - 42% (progressiv)</li>
              <li>66.761€ - 277.825€: 42% (Spitzensteuersatz)</li>
              <li>Ab 277.826€: 45% (Reichensteuer)</li>
            </ul>
            <p className="text-xs mt-2">
              Der progressive Tarif ist besonders vorteilhaft, wenn Ihr Grenzsteuersatz unter 26,375% liegt.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
