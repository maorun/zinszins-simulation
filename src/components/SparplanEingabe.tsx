import type { SimulationAnnualType } from '../utils/simulate';
import { SimulationAnnual } from '../utils/simulate';
import type { Sparplan } from '../utils/sparplan-utils';
import { initialSparplan } from '../utils/sparplan-utils';
import { useState } from "react";

// Simple Close icon component to avoid RSuite icons ESM/CommonJS issues
const CloseIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

// Helper icon for form help
const InfoIcon = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ marginLeft: '0.25rem', opacity: 0.6 }}
    >
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9,9h0a3,3,0,0,1,6,0c0,2-3,3-3,3"></path>
        <path d="M12,17h.01"></path>
    </svg>
);

// Import Button directly from shadcn/ui
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ChevronDown } from "lucide-react";

// Temporary imports - only keep what's needed
import {
    DatePicker,
    InputNumber,
    Message,
    useToaster,
    ButtonToolbar
} from "./temp-rsuite-stubs";

// Import shadcn/ui components for form elements
import { Label } from "./ui/label";
import { Input } from "./ui/input";





export function SparplanEingabe({ dispatch, simulationAnnual }: { dispatch: (val: Sparplan[]) => void; simulationAnnual: SimulationAnnualType }) {
    const [sparplans, setSparplans] = useState<Sparplan[]>([
        initialSparplan
    ]);

    const [singleFormValue, setSingleFormValue] = useState<{ 
        date: Date, 
        einzahlung: string,
        ter: string,
        transactionCostPercent: string,
        transactionCostAbsolute: string
    }>({
        date: new Date(),
        einzahlung: '',
        ter: '',
        transactionCostPercent: '',
        transactionCostAbsolute: '',
    });
    const [sparplanFormValues, setSparplanFormValues] = useState<{ 
        start: Date, 
        end: Date | null, 
        einzahlung: string,
        ter: string,
        transactionCostPercent: string,
        transactionCostAbsolute: string
    }>({
        start: new Date(),
        end: null,
        einzahlung: '',
        ter: '',
        transactionCostPercent: '',
        transactionCostAbsolute: '',
    });



    const toaster = useToaster();

    const handleSparplanSubmit = () => {
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
                    ter: sparplanFormValues.ter ? Number(sparplanFormValues.ter) : undefined,
                    transactionCostPercent: sparplanFormValues.transactionCostPercent ? Number(sparplanFormValues.transactionCostPercent) : undefined,
                    transactionCostAbsolute: sparplanFormValues.transactionCostAbsolute ? Number(sparplanFormValues.transactionCostAbsolute) : undefined,
                }
            ]
            setSparplans(changedSparplans)
            dispatch(changedSparplans)
            setSparplanFormValues({
                start: new Date(),
                end: null,
                einzahlung: '',
                ter: '',
                transactionCostPercent: '',
                transactionCostAbsolute: '',
            })
            
            toaster.push(
                <Message type="success" showIcon closable>
                    Sparplan erfolgreich hinzugefügt!
                </Message>,
                { duration: 3000 }
            );
        }
    };

    const handleSinglePaymentSubmit = () => {
        if (singleFormValue.einzahlung) {
            const changedSparplans: Sparplan[] = [
                ...sparplans,
                {
                    id: new Date().getTime(),
                    start: singleFormValue.date,
                    end: singleFormValue.date,
                    einzahlung: Number(singleFormValue.einzahlung),
                    ter: singleFormValue.ter ? Number(singleFormValue.ter) : undefined,
                    transactionCostPercent: singleFormValue.transactionCostPercent ? Number(singleFormValue.transactionCostPercent) : undefined,
                    transactionCostAbsolute: singleFormValue.transactionCostAbsolute ? Number(singleFormValue.transactionCostAbsolute) : undefined,
                }
            ]
            setSparplans(changedSparplans)
            dispatch(changedSparplans)
            setSingleFormValue({
                date: new Date(),
                einzahlung: '',
                ter: '',
                transactionCostPercent: '',
                transactionCostAbsolute: '',
            })
            
            toaster.push(
                <Message type="success" showIcon closable>
                    Einmalzahlung erfolgreich hinzugefügt!
                </Message>,
                { duration: 3000 }
            );
        }
    };

    const handleDeleteSparplan = (id: number) => {
        const changedSparplans = sparplans.filter((el) => el.id !== id)
        setSparplans(changedSparplans)
        dispatch(changedSparplans)
        
        toaster.push(
            <Message type="info" showIcon closable>
                Sparplan entfernt
            </Message>,
            { duration: 2000 }
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Card className="mb-6">
                <Collapsible defaultOpen={false}>
                    <CardHeader className="pb-4">
                        <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
                                <CardTitle className="text-left text-lg">💰 Sparpläne erstellen</CardTitle>
                                <ChevronDown className="h-5 w-5 text-gray-500" />
                            </div>
                        </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent className="pt-0">
                <div style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
                    Erstellen Sie regelmäßige Sparpläne mit Start- und Enddatum
                </div>
                <form 
                    onSubmit={(e) => { e.preventDefault(); handleSparplanSubmit(); }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="mb-4 space-y-2">
                            <Label>
                                Start
                                <InfoIcon />
                            </Label>
                            <DatePicker
                                format="yyyy-MM" 
                                value={sparplanFormValues.start}
                                onChange={(date) => setSparplanFormValues({...sparplanFormValues, start: date})}
                                placeholder="Startdatum wählen"
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div className="mb-4 space-y-2">
                            <Label>
                                Ende (optional)
                                <InfoIcon />
                            </Label>
                            <DatePicker
                                format="yyyy-MM" 
                                value={sparplanFormValues.end}
                                onChange={(date) => setSparplanFormValues({...sparplanFormValues, end: date})}
                                placeholder="Enddatum wählen"
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div className="mb-4 space-y-2">
                            <Label>
                                {simulationAnnual === SimulationAnnual.yearly ? 'Einzahlungen je Jahr (€)' : 'Einzahlungen je Monat (€)'}
                                <InfoIcon />
                            </Label>
                            <InputNumber
                                value={sparplanFormValues.einzahlung}
                                onChange={(value) => setSparplanFormValues({...sparplanFormValues, einzahlung: value})}
                                placeholder="Betrag eingeben"
                                style={{ width: '100%' }}
                                min={0}
                                step={simulationAnnual === SimulationAnnual.monthly ? 10 : 100}
                            />
                        </div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                            💰 Kostenfaktoren (optional)
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div className="mb-4 space-y-2">
                                <Label>
                                    TER (% p.a.)
                                    <InfoIcon />
                                </Label>
                                <InputNumber
                                    value={sparplanFormValues.ter}
                                    onChange={(value) => setSparplanFormValues({...sparplanFormValues, ter: value})}
                                    placeholder="z.B. 0.75"
                                    style={{ width: '100%' }}
                                    min={0}
                                    max={10}
                                    step={0.01}
                                />
                                <div className="text-sm text-muted-foreground mt-1">Total Expense Ratio in % pro Jahr</div>
                            </div>
                            <div className="mb-4 space-y-2">
                                <Label>
                                    Transaktionskosten (%)
                                    <InfoIcon />
                                </Label>
                                <InputNumber
                                    value={sparplanFormValues.transactionCostPercent}
                                    onChange={(value) => setSparplanFormValues({...sparplanFormValues, transactionCostPercent: value})}
                                    placeholder="z.B. 0.25"
                                    style={{ width: '100%' }}
                                    min={0}
                                    max={5}
                                    step={0.01}
                                />
                                <div className="text-sm text-muted-foreground mt-1">Prozentuale Transaktionskosten</div>
                            </div>
                            <div className="mb-4 space-y-2">
                                <Label>
                                    Transaktionskosten (€)
                                    <InfoIcon />
                                </Label>
                                <InputNumber
                                    value={sparplanFormValues.transactionCostAbsolute}
                                    onChange={(value) => setSparplanFormValues({...sparplanFormValues, transactionCostAbsolute: value})}
                                    placeholder="z.B. 1.50"
                                    style={{ width: '100%' }}
                                    min={0}
                                    max={100}
                                    step={0.01}
                                />
                                <div className="text-sm text-muted-foreground mt-1">Absolute Transaktionskosten in Euro</div>
                            </div>
                        </div>
                    </div>
                    <div className="mb-4 space-y-2">
                        <ButtonToolbar>
                            <Button
                                variant="default"
                                type="submit"
                                size="lg"
                                disabled={!sparplanFormValues.start || !sparplanFormValues.einzahlung}
                            >
                                💾 Sparplan hinzufügen
                            </Button>
                        </ButtonToolbar>
                    </div>
                </form>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>
            
            <Card className="mb-6">
                <Collapsible defaultOpen={false}>
                    <CardHeader className="pb-4">
                        <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
                                <CardTitle className="text-left text-lg">💵 Einmalzahlungen erstellen</CardTitle>
                                <ChevronDown className="h-5 w-5 text-gray-500" />
                            </div>
                        </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent className="pt-0">
                <div style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
                    Fügen Sie einmalige Zahlungen zu einem bestimmten Zeitpunkt hinzu
                </div>
                <form 
                    onSubmit={(e) => { e.preventDefault(); handleSinglePaymentSubmit(); }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="mb-4 space-y-2">
                            <Label>
                                Datum
                                <InfoIcon />
                            </Label>
                            <DatePicker
                                format="yyyy-MM-dd" 
                                value={singleFormValue.date}
                                onChange={(date) => setSingleFormValue({...singleFormValue, date: date})}
                                placeholder="Datum wählen"
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div className="mb-4 space-y-2">
                            <Label>
                                Einzahlung (€)
                                <InfoIcon />
                            </Label>
                            <InputNumber
                                value={singleFormValue.einzahlung}
                                onChange={(value) => setSingleFormValue({...singleFormValue, einzahlung: value})}
                                placeholder="Betrag eingeben"
                                style={{ width: '100%' }}
                                min={0}
                                step={100}
                            />
                        </div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                            💰 Kostenfaktoren (optional)
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div className="mb-4 space-y-2">
                                <Label>
                                    TER (% p.a.)
                                    <InfoIcon />
                                </Label>
                                <InputNumber
                                    value={singleFormValue.ter}
                                    onChange={(value) => setSingleFormValue({...singleFormValue, ter: value})}
                                    placeholder="z.B. 0.75"
                                    style={{ width: '100%' }}
                                    min={0}
                                    max={10}
                                    step={0.01}
                                />
                                <div className="text-sm text-muted-foreground mt-1">Total Expense Ratio in % pro Jahr</div>
                            </div>
                            <div className="mb-4 space-y-2">
                                <Label>
                                    Transaktionskosten (%)
                                    <InfoIcon />
                                </Label>
                                <InputNumber
                                    value={singleFormValue.transactionCostPercent}
                                    onChange={(value) => setSingleFormValue({...singleFormValue, transactionCostPercent: value})}
                                    placeholder="z.B. 0.25"
                                    style={{ width: '100%' }}
                                    min={0}
                                    max={5}
                                    step={0.01}
                                />
                                <div className="text-sm text-muted-foreground mt-1">Prozentuale Transaktionskosten</div>
                            </div>
                            <div className="mb-4 space-y-2">
                                <Label>
                                    Transaktionskosten (€)
                                    <InfoIcon />
                                </Label>
                                <InputNumber
                                    value={singleFormValue.transactionCostAbsolute}
                                    onChange={(value) => setSingleFormValue({...singleFormValue, transactionCostAbsolute: value})}
                                    placeholder="z.B. 1.50"
                                    style={{ width: '100%' }}
                                    min={0}
                                    max={100}
                                    step={0.01}
                                />
                                <div className="text-sm text-muted-foreground mt-1">Absolute Transaktionskosten in Euro</div>
                            </div>
                        </div>
                    </div>
                    <div className="mb-4 space-y-2">
                        <ButtonToolbar>
                            <Button
                                variant="default"
                                type="submit"
                                size="lg"
                                disabled={!singleFormValue.einzahlung}
                            >
                                💰 Einmalzahlung hinzufügen
                            </Button>
                        </ButtonToolbar>
                    </div>
                </form>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>
            
            <Card className="mb-6">
                <Collapsible defaultOpen={true}>
                    <CardHeader className="pb-4">
                        <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
                                <CardTitle className="text-left text-lg">📋 Gespeicherte Sparpläne</CardTitle>
                                <ChevronDown className="h-5 w-5 text-gray-500" />
                            </div>
                        </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent className="pt-0">
                <div style={{ padding: '1rem 1.5rem 0.5rem', color: '#666', fontSize: '0.9rem', borderBottom: '1px solid #f0f0f0' }}>
                    Ihre konfigurierten Sparpläne und Einmalzahlungen
                </div>
                
                {/* Card Layout for All Devices */}
                <div style={{ padding: '1rem' }}>
                    <div className="sparplan-cards">
                        {sparplans.map((sparplan) => (
                            <div key={sparplan.id} className="sparplan-card">
                                <div className="sparplan-card-header">
                                    <span className="sparplan-year">
                                        📅 {new Date(sparplan.start).toLocaleDateString('de-DE')}
                                    </span>
                                    <Button
                                        onClick={() => handleDeleteSparplan(sparplan.id)}
                                        variant="ghost"
                                        size="sm"
                                        title="Sparplan löschen"
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <CloseIcon />
                                    </Button>
                                </div>
                                <div className="sparplan-card-details">
                                    <div className="sparplan-detail">
                                        <span className="detail-label">📅 Start:</span>
                                        <span className="detail-value" style={{ color: '#28a745' }}>
                                            {new Date(sparplan.start).toLocaleDateString('de-DE')}
                                        </span>
                                    </div>
                                    <div className="sparplan-detail">
                                        <span className="detail-label">🏁 Ende:</span>
                                        <span className="detail-value" style={{ color: '#17a2b8' }}>
                                            {sparplan.end ? new Date(sparplan.end).toLocaleDateString('de-DE') : 'Unbegrenzt'}
                                        </span>
                                    </div>
                                    <div className="sparplan-detail">
                                        <span className="detail-label">
                                            {simulationAnnual === SimulationAnnual.yearly ? '💰 Jährlich:' : '💰 Monatlich:'}
                                        </span>
                                        <span className="detail-value" style={{ color: '#2eabdf', fontWeight: 600 }}>
                                            {(() => {
                                                const displayValue = simulationAnnual === SimulationAnnual.monthly 
                                                    ? (sparplan.einzahlung / 12).toFixed(2)
                                                    : sparplan.einzahlung.toFixed(2);
                                                return Number(displayValue).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' €';
                                            })()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {sparplans.length === 0 && (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '2rem', 
                                color: '#666',
                                fontStyle: 'italic'
                            }}>
                                Noch keine Sparpläne erstellt. Fügen Sie oben einen Sparplan hinzu.
                            </div>
                        )}
                    </div>
                </div>

                {/* Hidden Desktop Table Layout */}
                <div style={{ display: 'none' }}>
                    {/* Table functionality has been replaced with card layout above */}
                </div>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>
        </div>
    );
}



