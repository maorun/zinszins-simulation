import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { NestingProvider } from '../lib/nesting-context';
import TimeRangeConfiguration from './TimeRangeConfiguration';
import TaxConfiguration from './TaxConfiguration';
import SimulationConfiguration from './SimulationConfiguration';

const SimulationParameters = () => {
  return (
    <Card nestingLevel={0} className="mb-4">
      <Collapsible defaultOpen={false}>
        <CardHeader nestingLevel={0}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
              <CardTitle className="text-left">⚙️ Konfiguration</CardTitle>
              <div className="flex items-center gap-2">
                <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={0}>
            <NestingProvider level={0}>
              <div className="form-grid">
                <SimulationConfiguration />
                <TimeRangeConfiguration />
                <TaxConfiguration />
              </div>
            </NestingProvider>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default SimulationParameters;
