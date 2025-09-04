import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { useSimulation } from '../contexts/useSimulation';
import type { ReturnMode } from '../utils/random-returns';
import FixedReturnConfiguration from './FixedReturnConfiguration';
import RandomReturnConfiguration from './RandomReturnConfiguration';
import VariableReturnConfiguration from './VariableReturnConfiguration';

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
                    <RadioGroup
                        value={returnMode}
                        onValueChange={(value) => {
                            const mode = value as ReturnMode;
                            setReturnMode(mode);
                            performSimulation();
                        }}
                        className="flex space-x-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fixed" id="fixed" />
                            <Label htmlFor="fixed">Feste Rendite</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="random" id="random" />
                            <Label htmlFor="random">Zufällige Rendite</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="variable" id="variable" />
                            <Label htmlFor="variable">Variable Rendite</Label>
                        </div>
                    </RadioGroup>
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
