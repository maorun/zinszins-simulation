import { useMemo } from 'react'
import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
import { GlossaryTerm } from '../GlossaryTerm'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { generateFormId } from '../../utils/unique-id'
import {
  type AssetClass,
  getAllAssetClasses,
  getAssetClassName,
  getAssetClassDescription,
  getTeilfreistellungsquoteForAssetClass,
  isCustomAssetClass,
  formatTeilfreistellungsquote,
} from '../../../helpers/asset-class'

interface AssetClassSelectorProps {
  assetClass: AssetClass
  customTeilfreistellungsquote: number
  onAssetClassChange: (assetClass: AssetClass) => void
  onCustomTeilfreistellungsquoteChange: (value: number) => void
}

function AssetClassOption({ assetClassOption }: { assetClassOption: AssetClass }) {
  const quote = getTeilfreistellungsquoteForAssetClass(assetClassOption)
  const displayQuote = formatTeilfreistellungsquote(quote)

  return (
    <div className="flex items-start space-x-3">
      <RadioGroupItem value={assetClassOption} id={`asset-class-${assetClassOption}`} className="mt-1" />
      <div className="flex-1">
        <Label htmlFor={`asset-class-${assetClassOption}`} className="font-normal cursor-pointer">
          <div className="flex items-center justify-between">
            <span>{getAssetClassName(assetClassOption)}</span>
            {!isCustomAssetClass(assetClassOption) && (
              <span className="text-sm text-muted-foreground ml-2">
                <GlossaryTerm term="teilfreistellung">TFS</GlossaryTerm>: {displayQuote}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{getAssetClassDescription(assetClassOption)}</p>
        </Label>
      </div>
    </div>
  )
}

function CustomQuoteSlider({
  customTeilfreistellungsquote,
  onCustomTeilfreistellungsquoteChange,
  customSlideId,
}: {
  customTeilfreistellungsquote: number
  onCustomTeilfreistellungsquoteChange: (value: number) => void
  customSlideId: string
}) {
  return (
    <div className="space-y-2 pl-7">
      <Label htmlFor={customSlideId}>
        Benutzerdefinierte <GlossaryTerm term="teilfreistellung">Teilfreistellungsquote</GlossaryTerm> (%)
      </Label>
      <Slider
        id={customSlideId}
        value={[customTeilfreistellungsquote * 100]}
        onValueChange={([value]) => onCustomTeilfreistellungsquoteChange(value / 100)}
        min={0}
        max={100}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>0%</span>
        <span className="font-medium">{(customTeilfreistellungsquote * 100).toFixed(0)}%</span>
        <span>100%</span>
      </div>
    </div>
  )
}

export function AssetClassSelector({
  assetClass,
  customTeilfreistellungsquote,
  onAssetClassChange,
  onCustomTeilfreistellungsquoteChange,
}: AssetClassSelectorProps) {
  const assetClasses = getAllAssetClasses()
  const isCustom = isCustomAssetClass(assetClass)

  const assetClassGroupId = useMemo(() => generateFormId('asset-class-selector', 'group'), [])
  const customSlideId = useMemo(() => generateFormId('asset-class-selector', 'custom-slider'), [])

  const effectiveTeilfreistellungsquote = isCustom
    ? customTeilfreistellungsquote
    : getTeilfreistellungsquoteForAssetClass(assetClass)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={assetClassGroupId}>Anlageklasse (Asset Class)</Label>
        <RadioGroup
          id={assetClassGroupId}
          value={assetClass}
          onValueChange={value => onAssetClassChange(value as AssetClass)}
          className="space-y-2"
        >
          {assetClasses.map(assetClassOption => (
            <AssetClassOption key={assetClassOption} assetClassOption={assetClassOption} />
          ))}
        </RadioGroup>
      </div>

      {isCustom && (
        <CustomQuoteSlider
          customTeilfreistellungsquote={customTeilfreistellungsquote}
          onCustomTeilfreistellungsquoteChange={onCustomTeilfreistellungsquoteChange}
          customSlideId={customSlideId}
        />
      )}

      {!isCustom && (
        <div className="text-sm text-muted-foreground pl-7">
          Aktuelle <GlossaryTerm term="teilfreistellung">Teilfreistellungsquote</GlossaryTerm>:{' '}
          <span className="font-medium">{formatTeilfreistellungsquote(effectiveTeilfreistellungsquote)}</span>
        </div>
      )}
    </div>
  )
}
