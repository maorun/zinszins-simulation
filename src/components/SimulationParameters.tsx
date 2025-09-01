import { Panel } from 'rsuite';
import TimeRangeConfiguration from './TimeRangeConfiguration';
import ReturnConfiguration from './ReturnConfiguration';
import TaxConfiguration from './TaxConfiguration';
import SimulationConfiguration from './SimulationConfiguration';

const SimulationParameters = () => {
  return (
    <Panel header="⚙️ Konfiguration" collapsible bordered>
      <div className="form-grid">
        <TimeRangeConfiguration />
        <ReturnConfiguration />
        <TaxConfiguration />
        <SimulationConfiguration />
      </div>
    </Panel>
  );
};

export default SimulationParameters;
