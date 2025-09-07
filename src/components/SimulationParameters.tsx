import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import TimeRangeConfiguration from './TimeRangeConfiguration';
import TaxConfiguration from './TaxConfiguration';
import SimulationConfiguration from './SimulationConfiguration';

const SimulationParameters = () => {
  const [isOpen, setIsOpen] = useState(false); // Collapsed by default

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
              <CardTitle className="text-left">⚙️ Konfiguration</CardTitle>
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <div className="form-grid">
              <SimulationConfiguration />
              <TimeRangeConfiguration />
              <TaxConfiguration />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default SimulationParameters;
