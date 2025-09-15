import SimulationConfiguration from './SimulationConfiguration';
import TaxConfiguration from './TaxConfiguration';
import TimeRangeConfiguration from './TimeRangeConfiguration';
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card';

const SimulationParameters = () => {
  return (
    <CollapsibleCard>
      <CollapsibleCardHeader>⚙️ Konfiguration</CollapsibleCardHeader>
        <CollapsibleCardContent>
        <SimulationConfiguration />
        <TimeRangeConfiguration />
        <TaxConfiguration />
        </CollapsibleCardContent>
    </CollapsibleCard>
  );
};

export default SimulationParameters;
