import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Trash2, Plus, ChevronDown } from 'lucide-react';
import { useSimulation } from '../contexts/useSimulation';
import BasiszinsConfiguration from './BasiszinsConfiguration';
const TaxConfiguration = () => {
    const {
        performSimulation,
        steuerlast,
        setSteuerlast,
        teilfreistellungsquote,
        setTeilfreistellungsquote,
        freibetragPerYear,
        setFreibetragPerYear,
        steuerReduzierenEndkapitalSparphase,
        setSteuerReduzierenEndkapitalSparphase,
        steuerReduzierenEndkapitalEntspharphase,
        setSteuerReduzierenEndkapitalEntspharphase,
        grundfreibetragAktiv,
        setGrundfreibetragAktiv,
        grundfreibetragBetrag,
        setGrundfreibetragBetrag,
    } = useSimulation();

    const yearToday = new Date().getFullYear();

    return (
        <div className="space-y-4">
            <Card>
                <Collapsible defaultOpen={false}>
                    <CardHeader>
                        <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
                                <CardTitle className="text-left">💰 Steuer-Konfiguration</CardTitle>
                                <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                            </div>
                        </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent className="space-y-6">{/* ... existing tax configuration content ... */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="steuerlast">Kapitalertragsteuer (%)</Label>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSteuerlast(26.375); // Default value
                                performSimulation();
                            }}
                            className="text-xs"
                        >
                            Reset
                        </Button>
                    </div>
                    <Slider
                        id="steuerlast"
                        value={[steuerlast]}
                        onValueChange={([value]) => {
                            setSteuerlast(value);
                            performSimulation();
                        }}
                        min={20}
                        max={35}
                        step={0.025}
                        className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>20%</span>
                        <span className="font-medium">{steuerlast}%</span>
                        <span>35%</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="teilfreistellungsquote">Teilfreistellungsquote (%)</Label>
                    <Slider
                        id="teilfreistellungsquote"
                        value={[teilfreistellungsquote]}
                        onValueChange={([value]) => {
                            setTeilfreistellungsquote(value);
                            performSimulation();
                        }}
                        min={0}
                        max={50}
                        step={1}
                        className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>0%</span>
                        <span className="font-medium">{teilfreistellungsquote}%</span>
                        <span>50%</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-base font-medium">Steuer reduziert Endkapital</Label>
                    <p className="text-sm text-muted-foreground">
                        Konfigurieren Sie für jede Phase, ob die Steuer vom Endkapital abgezogen wird oder über ein separates Verrechnungskonto bezahlt wird.
                    </p>
                    
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="space-y-1">
                                <Label htmlFor="steuerReduzierenEndkapitalSparphase" className="font-medium">Sparphase</Label>
                                <p className="text-sm text-muted-foreground">
                                    Während der Ansparphase vom Kapital abziehen
                                </p>
                            </div>
                            <Switch
                                id="steuerReduzierenEndkapitalSparphase"
                                checked={steuerReduzierenEndkapitalSparphase}
                                onCheckedChange={(checked) => {
                                    setSteuerReduzierenEndkapitalSparphase(checked);
                                    performSimulation();
                                }}
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="space-y-1">
                                <Label htmlFor="steuerReduzierenEndkapitalEntspharphase" className="font-medium">Entsparphase</Label>
                                <p className="text-sm text-muted-foreground">
                                    Während der Entnahmephase vom Kapital abziehen
                                </p>
                            </div>
                            <Switch
                                id="steuerReduzierenEndkapitalEntspharphase"
                                checked={steuerReduzierenEndkapitalEntspharphase}
                                onCheckedChange={(checked) => {
                                    setSteuerReduzierenEndkapitalEntspharphase(checked);
                                    performSimulation();
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Label htmlFor="freibetragConfiguration">Sparerpauschbetrag pro Jahr (€)</Label>
                    <div className="flex gap-2 items-end">
                        <div className="flex-1">
                            <Input
                                type="number"
                                placeholder="Jahr"
                                min={yearToday}
                                max={2100}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const input = e.target as HTMLInputElement;
                                        const year = Number(input.value);
                                        if (year && !freibetragPerYear[year]) {
                                            setFreibetragPerYear({
                                                ...freibetragPerYear,
                                                [year]: 2000 // Default value
                                            });
                                            performSimulation();
                                            input.value = '';
                                        }
                                    }
                                }}
                            />
                        </div>
                        <Button
                            onClick={() => {
                                const year = yearToday;
                                if (!freibetragPerYear[year]) {
                                    setFreibetragPerYear({
                                        ...freibetragPerYear,
                                        [year]: 2000
                                    });
                                    performSimulation();
                                }
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Jahr hinzufügen
                        </Button>
                    </div>
                    <div className="border rounded-md max-h-[200px] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-center">Jahr</TableHead>
                                    <TableHead className="text-center">Sparerpauschbetrag (€)</TableHead>
                                    <TableHead className="text-center">Aktionen</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(freibetragPerYear).map(([year, amount]) => (
                                    <TableRow key={year}>
                                        <TableCell className="text-center">{year}</TableCell>
                                        <TableCell className="text-center">
                                            <Input
                                                type="number"
                                                value={amount}
                                                min={0}
                                                max={10000}
                                                step={50}
                                                onChange={(e) => {
                                                    const value = Number(e.target.value);
                                                    if (!isNaN(value)) {
                                                        setFreibetragPerYear({
                                                            ...freibetragPerYear,
                                                            [year]: value
                                                        });
                                                        performSimulation();
                                                    }
                                                }}
                                                className="w-24 mx-auto"
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const newFreibetrag = { ...freibetragPerYear };
                                                    delete newFreibetrag[Number(year)];
                                                    setFreibetragPerYear(newFreibetrag);
                                                    performSimulation();
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>
        
        {/* Grundfreibetrag Configuration */}
        <Card>
            <Collapsible defaultOpen={false}>
                <CardHeader>
                    <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
                            <CardTitle className="text-left">🏠 Grundfreibetrag-Konfiguration</CardTitle>
                            <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </div>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                        <Label htmlFor="grundfreibetragAktiv" className="font-medium">Grundfreibetrag berücksichtigen</Label>
                        <p className="text-sm text-muted-foreground">
                            Berücksichtigt den Grundfreibetrag für die Einkommensteuer bei Entnahmen (relevant für Rentner ohne weiteres Einkommen)
                        </p>
                    </div>
                    <Switch
                        id="grundfreibetragAktiv"
                        checked={grundfreibetragAktiv}
                        onCheckedChange={(checked) => {
                            setGrundfreibetragAktiv(checked);
                            // When activating for the first time, set to double the base value
                            if (checked && grundfreibetragBetrag === 11604) {
                                setGrundfreibetragBetrag(23208);
                            }
                            performSimulation();
                        }}
                    />
                </div>

                {grundfreibetragAktiv && (
                    <div className="space-y-2">
                        <Label htmlFor="grundfreibetragBetrag">Grundfreibetrag pro Jahr (€)</Label>
                        <Input
                            id="grundfreibetragBetrag"
                            type="number"
                            value={grundfreibetragBetrag}
                            min={0}
                            max={50000}
                            step={100}
                            onChange={(e) => {
                                const value = Number(e.target.value);
                                if (!isNaN(value)) {
                                    setGrundfreibetragBetrag(value);
                                    performSimulation();
                                }
                            }}
                            className="w-full"
                        />
                        <div className="text-sm text-muted-foreground">
                            <p>Aktueller Grundfreibetrag 2024: €11.604 | Empfohlener Wert für Paare: €23.208</p>
                            <p>Der Grundfreibetrag wird sowohl für einheitliche Strategien als auch für geteilte Entsparphasen berücksichtigt.</p>
                        </div>
                    </div>
                )}
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
        
        {/* Basiszins Configuration */}
        <BasiszinsConfiguration />
    </div>
);
};

export default TaxConfiguration;
