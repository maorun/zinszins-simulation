import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import TimeRangeConfiguration from './TimeRangeConfiguration';
import ReturnConfiguration from './ReturnConfiguration';
import TaxConfiguration from './TaxConfiguration';
import SimulationConfiguration from './SimulationConfiguration';

const SimulationParameters = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>⚙️ Konfiguration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="form-grid">
          <TimeRangeConfiguration />
          <ReturnConfiguration />
          <TaxConfiguration />
          <SimulationConfiguration />
        </div>
      </CardContent>
    </Card>
  );
};

export default SimulationParameters;
