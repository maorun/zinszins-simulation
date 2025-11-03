import { SparplanForms } from './SparplanForms'
import { SavedSparplansList } from './SavedSparplansList'
import { computeViewProps, type SparplanEingabeViewProps } from './SparplanEingabeView.helpers'

export type { SparplanEingabeViewProps }

export function SparplanEingabeView(props: SparplanEingabeViewProps) {
  const viewProps = computeViewProps(props)

  return (
    <div className="space-y-4">
      <SparplanForms
        sparplanForm={viewProps.sparplanForm}
        singlePaymentForm={viewProps.singlePaymentForm}
        sharedUtilities={viewProps.sharedUtilities}
      />
      <SavedSparplansList {...viewProps.savedSparplansList} />
    </div>
  )
}
