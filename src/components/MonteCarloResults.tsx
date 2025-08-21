import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { RandomReturnConfig } from '../utils/random-returns';

interface MonteCarloResultsProps {
    years: number[];
    accumulationConfig: RandomReturnConfig;
    withdrawalConfig?: RandomReturnConfig;
    runs?: number;
}

export function MonteCarloResults({
    years: _years,
    accumulationConfig,
    withdrawalConfig,
    runs: _runs = 500
}: MonteCarloResultsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const formatPercent = (value: number) => (value * 100).toFixed(1) + '%';

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <Card>
                <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardTitle className="flex items-center justify-between">
                            Monte Carlo Analyse
                            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </CardTitle>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-lg font-semibold text-blue-600 mb-2">📊 Konfiguration</h4>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p><strong>Ansparphase:</strong> Durchschnittliche Rendite {formatPercent(accumulationConfig.averageReturn)}, Volatilität {formatPercent(accumulationConfig.standardDeviation || 0.15)}</p>
                                    {withdrawalConfig && (
                                        <p><strong>Entnahmephase:</strong> Durchschnittliche Rendite {formatPercent(withdrawalConfig.averageReturn)}, Volatilität {formatPercent(withdrawalConfig.standardDeviation || 0.12)}</p>
                                    )}
                                    {accumulationConfig.seed && (
                                        <p><strong>Zufallsseed:</strong> {accumulationConfig.seed} (deterministische Ergebnisse)</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-muted/50 border border-gray-200 rounded-md">
                            <h6 className="font-semibold mb-2">💡 Hinweis zu Monte Carlo Simulationen:</h6>
                            <p className="text-sm text-muted-foreground">
                                Diese Simulation basiert auf statistischen Modellen und historischen Annahmen. 
                                Tatsächliche Marktrenditen können stark abweichen. Die Simulation dient nur zur 
                                groben Orientierung und ersetzt keine professionelle Finanzberatung.
                            </p>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}