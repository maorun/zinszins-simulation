import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { EntnahmeSimulationsAusgabe } from './EntnahmeSimulationsAusgabe';
import RiskAssessment from './RiskAssessment';
import { useSimulation } from '../contexts/useSimulation';

const WithdrawalPlan = () => {
    const {
        startEnd,
        simulationData,
        setStartEnd,
        setWithdrawalResults,
        steuerlast,
        teilfreistellungsquote,
    } = useSimulation();

    if (!simulationData) return null;

    return (
        <Card className="mb-4">
            <Collapsible defaultOpen={false}>
                <CardHeader>
                    <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
                            <CardTitle className="text-left">💸 Entnahme</CardTitle>
                            <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </div>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent>
                <EntnahmeSimulationsAusgabe
                    startEnd={startEnd}
                    elemente={simulationData.sparplanElements}
                    dispatchEnd={(val) => setStartEnd(val)}
                    onWithdrawalResultsChange={setWithdrawalResults}
                    steuerlast={steuerlast / 100}
                    teilfreistellungsquote={teilfreistellungsquote / 100}
                />
                
                {/* Risk Assessment with Monte Carlo Analysis moved to collapsible panel */}
                <RiskAssessment phase="withdrawal" />
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
};

export default WithdrawalPlan;
