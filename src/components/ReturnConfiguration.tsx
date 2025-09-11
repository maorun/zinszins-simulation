import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { ChevronDown } from 'lucide-react';
import { useSimulation } from '../contexts/useSimulation';
import type { ReturnMode } from '../utils/random-returns';
import FixedReturnConfiguration from './FixedReturnConfiguration';
import RandomReturnConfiguration from './RandomReturnConfiguration';
import VariableReturnConfiguration from './VariableReturnConfiguration';
import HistoricalReturnConfiguration from './HistoricalReturnConfiguration';
import { RadioTileGroup, RadioTile } from './ui/radio-tile';

const ReturnConfiguration = () => {
    const {
        returnMode,
        setReturnMode,
        inflationAktivSparphase,
        setInflationAktivSparphase,
        inflationsrateSparphase,
        setInflationsrateSparphase,
        inflationAnwendungSparphase,
        setInflationAnwendungSparphase,
        performSimulation,
    } = useSimulation();

    return (
        <Card>
            <Collapsible defaultOpen={false}>
                <CardHeader>
                    <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
                            <CardTitle className="text-left">📈 Rendite-Konfiguration (Sparphase)</CardTitle>
                            <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </div>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className="space-y-4">
                <div className="space-y-3">
                    <Label>Rendite-Modus für Sparphase</Label>
                    <RadioTileGroup
                        value={returnMode}
                        onValueChange={(value: string) => {
                            const mode = value as ReturnMode;
                            setReturnMode(mode);
                            performSimulation();
                        }}
                    >
                        <RadioTile value="fixed" label="Feste Rendite">
                            Konstante jährliche Rendite für die gesamte Sparphase
                        </RadioTile>
                        <RadioTile value="random" label="Zufällige Rendite">
                            Monte Carlo Simulation mit Durchschnitt und Volatilität
                        </RadioTile>
                        <RadioTile value="variable" label="Variable Rendite">
                            Jahr-für-Jahr konfigurierbare Renditen für realistische Szenarien
                        </RadioTile>
                        <RadioTile value="historical" label="Historische Daten">
                            Backtesting mit echten historischen Marktdaten (Vergangenheit ≠ Zukunft!)
                        </RadioTile>
                    </RadioTileGroup>
                    <p className="text-sm text-muted-foreground">
                        Konfiguration der erwarteten Rendite während der Ansparphase (bis zum Beginn der Entnahme).
                    </p>
                </div>

                {/* Inflation configuration for savings phase */}
                <div className="space-y-3 border-t pt-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="inflation-sparphase" className="text-base font-medium">
                            💰 Inflation berücksichtigen (Sparphase)
                        </Label>
                        <Switch
                            id="inflation-sparphase"
                            checked={inflationAktivSparphase}
                            onCheckedChange={(checked: boolean) => {
                                setInflationAktivSparphase(checked);
                                performSimulation();
                            }}
                        />
                    </div>
                    {inflationAktivSparphase && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                Inflationsrate: <span className="font-medium text-gray-900">{inflationsrateSparphase.toFixed(1)}%</span>
                            </Label>
                            <Slider
                                value={[inflationsrateSparphase]}
                                onValueChange={(values: number[]) => {
                                    setInflationsrateSparphase(values[0]);
                                    performSimulation();
                                }}
                                max={10}
                                min={0}
                                step={0.1}
                                className="w-full"
                            />
                            <p className="text-xs text-muted-foreground">
                                Die reale Kaufkraft der Einzahlungen wird durch die Inflation gemindert. 
                                Ihre Sparbeträge behalten nicht ihre volle Kaufkraft über die Zeit.
                            </p>
                            
                            {/* Toggle for inflation application mode */}
                            <div className="mt-4 space-y-2">
                                <Label className="text-sm font-medium">Anwendung der Inflation:</Label>
                                <RadioTileGroup
                                    value={inflationAnwendungSparphase}
                                    onValueChange={(value: string) => {
                                        const mode = value as 'sparplan' | 'gesamtmenge';
                                        setInflationAnwendungSparphase(mode);
                                        performSimulation();
                                    }}
                                >
                                    <RadioTile value="sparplan" label="Auf Sparplan">
                                        Inflation wird auf einzelne Beiträge angewendet (realistische Anpassung zukünftiger Einzahlungen)
                                    </RadioTile>
                                    <RadioTile value="gesamtmenge" label="Auf Gesamtmenge">
                                        Inflation wird auf die gesamte Sparsumme in der Sparphase angewendet
                                    </RadioTile>
                                </RadioTileGroup>
                            </div>
                        </div>
                    )}
                </div>

                {returnMode === 'fixed' && <FixedReturnConfiguration />}
                {returnMode === 'random' && <RandomReturnConfiguration />}
                {returnMode === 'variable' && <VariableReturnConfiguration />}
                {returnMode === 'historical' && <HistoricalReturnConfiguration />}
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
};

export default ReturnConfiguration;
