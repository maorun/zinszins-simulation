import type { SimulationAnnualType } from '../utils/simulate';
import { SimulationAnnual } from '../utils/simulate';
import type { Sparplan } from '../utils/sparplan-utils';
import { initialSparplan } from '../utils/sparplan-utils';
import { useState } from "react";
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Info, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function SparplanEingabe({ dispatch, simulationAnnual }: { dispatch: (val: Sparplan[]) => void; simulationAnnual: SimulationAnnualType }) {
    const [sparplans, setSparplans] = useState<Sparplan[]>([
        initialSparplan
    ]);

    const [singleFormValue, setSingleFormValue] = useState<{ date: Date, einzahlung: string }>({
        date: new Date(),
        einzahlung: '',
    });
    const [sparplanFormValues, setSparplanFormValues] = useState<{ start: Date, end: Date | null, einzahlung: string }>({
        start: new Date(),
        end: null,
        einzahlung: '',
    });

    const handleSparplanSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (sparplanFormValues.start && sparplanFormValues.einzahlung && sparplanFormValues.einzahlung) {
            // Convert monthly input to yearly for storage (backend always expects yearly amounts)
            const yearlyAmount = simulationAnnual === SimulationAnnual.monthly 
                ? Number(sparplanFormValues.einzahlung) * 12 
                : Number(sparplanFormValues.einzahlung);
            
            const changedSparplans: Sparplan[] = [
                ...sparplans,
                {
                    id: new Date().getTime(),
                    start: sparplanFormValues.start,
                    end: sparplanFormValues.end,
                    einzahlung: yearlyAmount,
                }
            ]
            setSparplans(changedSparplans)
            dispatch(changedSparplans)
            setSparplanFormValues({
                start: new Date(),
                end: null,
                einzahlung: '',
            })
            
            toast.success("Sparplan erfolgreich hinzugefügt!");
        }
    };

    const handleSinglePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (singleFormValue.einzahlung) {
            const changedSparplans: Sparplan[] = [
                ...sparplans,
                {
                    id: new Date().getTime(),
                    start: singleFormValue.date,
                    end: singleFormValue.date,
                    einzahlung: Number(singleFormValue.einzahlung),
                }
            ]
            setSparplans(changedSparplans)
            dispatch(changedSparplans)
            setSingleFormValue({
                date: new Date(),
                einzahlung: '',
            })
            
            toast.success("Einmalzahlung erfolgreich hinzugefügt!");
        }
    };

    const handleDeleteSparplan = (id: number) => {
        const changedSparplans = sparplans.filter((el) => el.id !== id)
        setSparplans(changedSparplans)
        dispatch(changedSparplans)
        
        toast.info("Sparplan entfernt");
    };

    return (
        <div className="space-y-4">
            <Collapsible>
                <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-lg font-semibold">
                        <span className="mr-2">💰</span> Sparpläne erstellen
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                    <Card>
                        <CardContent className="pt-6">
                            <p className="mb-4 text-sm text-muted-foreground">
                                Erstellen Sie regelmäßige Sparpläne mit Start- und Enddatum
                            </p>
                            <form onSubmit={handleSparplanSubmit}>
                                <div className="grid md:grid-cols-3 gap-4 mb-4">
                                    <div className="space-y-2">
                                        <Label>Start <Info className="inline h-3 w-3" /></Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !sparplanFormValues.start && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {sparplanFormValues.start ? format(sparplanFormValues.start, "yyyy-MM") : <span>Startdatum wählen</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={sparplanFormValues.start}
                                                    onSelect={(date) => setSparplanFormValues(prev => ({ ...prev, start: date || new Date() }))}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Ende (optional) <Info className="inline h-3 w-3" /></Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !sparplanFormValues.end && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {sparplanFormValues.end ? format(sparplanFormValues.end, "yyyy-MM") : <span>Enddatum wählen</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={sparplanFormValues.end}
                                                    onSelect={(date) => setSparplanFormValues(prev => ({ ...prev, end: date }))}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>
                                            {simulationAnnual === SimulationAnnual.yearly ? 'Einzahlungen je Jahr (€)' : 'Einzahlungen je Monat (€)'}
                                            <Info className="inline h-3 w-3" />
                                        </Label>
                                        <Input
                                            type="number"
                                            value={sparplanFormValues.einzahlung}
                                            onChange={(e) => setSparplanFormValues(prev => ({ ...prev, einzahlung: e.target.value }))}
                                            placeholder="Betrag eingeben"
                                            min={0}
                                            step={simulationAnnual === SimulationAnnual.monthly ? 10 : 100}
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={!sparplanFormValues.start || !sparplanFormValues.einzahlung}
                                >
                                    💾 Sparplan hinzufügen
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </CollapsibleContent>
            </Collapsible>
            
            <Collapsible>
                <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-lg font-semibold">
                        <span className="mr-2">💵</span> Einmalzahlungen erstellen
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                    <Card>
                        <CardContent className="pt-6">
                            <p className="mb-4 text-sm text-muted-foreground">
                                Fügen Sie einmalige Zahlungen zu einem bestimmten Zeitpunkt hinzu
                            </p>
                            <form onSubmit={handleSinglePaymentSubmit}>
                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div className="space-y-2">
                                        <Label>Datum <Info className="inline h-3 w-3" /></Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !singleFormValue.date && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {singleFormValue.date ? format(singleFormValue.date, "yyyy-MM") : <span>Datum wählen</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={singleFormValue.date}
                                                    onSelect={(date) => setSingleFormValue(prev => ({ ...prev, date: date || new Date() }))}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Einzahlung (€) <Info className="inline h-3 w-3" /></Label>
                                        <Input
                                            type="number"
                                            value={singleFormValue.einzahlung}
                                            onChange={(e) => setSingleFormValue(prev => ({...prev, einzahlung: e.target.value}))}
                                            placeholder="Betrag eingeben"
                                            min={0}
                                            step={100}
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={!singleFormValue.einzahlung}
                                >
                                    💰 Einmalzahlung hinzufügen
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </CollapsibleContent>
            </Collapsible>
            
            <Card>
                <CardHeader>
                    <CardTitle>📋 Gespeicherte Sparpläne</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {sparplans.map((sparplan) => (
                            <Card key={sparplan.id} className="sparplan-card">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        📅 {sparplan.start.toLocaleDateString('de-DE')}
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteSparplan(sparplan.id)}
                                        title="Sparplan löschen"
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                <div className="space-y-1">
                                    <div>
                                        <span className="text-sm font-medium">📅 Start:</span>
                                        <span className="text-sm text-muted-foreground ml-2">
                                            {sparplan.start.toLocaleDateString('de-DE')}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium">🏁 Ende:</span>
                                        <span className="text-sm text-muted-foreground ml-2">
                                            {sparplan.end ? sparplan.end.toLocaleDateString('de-DE') : 'Unbegrenzt'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium">
                                            {simulationAnnual === SimulationAnnual.yearly ? '💰 Jährlich:' : '💰 Monatlich:'}
                                        </span>
                                        <span className="text-sm text-muted-foreground ml-2 font-semibold">
                                            {(() => {
                                                const displayValue = simulationAnnual === SimulationAnnual.monthly 
                                                    ? (sparplan.einzahlung / 12).toFixed(2)
                                                    : sparplan.einzahlung.toFixed(2);
                                                return Number(displayValue).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €';
                                            })()}
                                        </span>
                                    </div>
                                </div>
                                </CardContent>
                            </Card>
                        ))}
                        
                        {sparplans.length === 0 && (
                            <div className="text-center p-8 text-muted-foreground italic">
                                Noch keine Sparpläne erstellt. Fügen Sie oben einen Sparplan hinzu.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
