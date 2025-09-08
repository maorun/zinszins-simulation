import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Label } from './ui/label';
import { useSimulation } from '../contexts/useSimulation';
import type { ReturnMode } from '../utils/random-returns';
import FixedReturnConfiguration from './FixedReturnConfiguration';
import RandomReturnConfiguration from './RandomReturnConfiguration';
import VariableReturnConfiguration from './VariableReturnConfiguration';
import { RadioTileGroup, RadioTile } from './ui/radio-tile';

const ReturnConfiguration = () => {
    const {
        returnMode,
        setReturnMode,
        performSimulation,
    } = useSimulation();

    return (
        <Card>
            <CardHeader>
                <CardTitle>📈 Rendite-Konfiguration (Sparphase)</CardTitle>
            </CardHeader>
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
                    </RadioTileGroup>
                    <p className="text-sm text-muted-foreground">
                        Konfiguration der erwarteten Rendite während der Ansparphase (bis zum Beginn der Entnahme).
                    </p>
                </div>

                {returnMode === 'fixed' && <FixedReturnConfiguration />}
                {returnMode === 'random' && <RandomReturnConfiguration />}
                {returnMode === 'variable' && <VariableReturnConfiguration />}
            </CardContent>
        </Card>
    );
};

export default ReturnConfiguration;
