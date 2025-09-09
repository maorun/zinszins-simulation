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
import { ChevronDown, ChevronUp } from "lucide-react";

// Temporary imports - remove unused ones for now
import {
    DatePicker,
    Form,
    InputNumber,
    Message,
    useToaster,
    ButtonToolbar
} from "./temp-rsuite-stubs";





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

    // State for collapsible panels
    const [isSparplanOpen, setIsSparplanOpen] = useState(false);
    const [isEinmalzahlungOpen, setIsEinmalzahlungOpen] = useState(false);
    const [isGespeichertOpen, setIsGespeichertOpen] = useState(true); // This one starts expanded

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
                <Collapsible open={isSparplanOpen} onOpenChange={setIsSparplanOpen}>
                    <CardHeader className="pb-4">
                        <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
                                <CardTitle className="text-left text-lg">💰 Sparpläne erstellen</CardTitle>
                                {isSparplanOpen ? (
                                    <ChevronUp className="h-5 w-5 text-gray-500" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-500" />
                                )}
                            </div>
                        </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent className="pt-0">
                <div style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
                    Erstellen Sie regelmäßige Sparpläne mit Start- und Enddatum
                </div>
                <Form fluid
                    formValue={sparplanFormValues}
                    onChange={(changedFormValue: any) => setSparplanFormValues({
                        start: changedFormValue.start,
                        end: changedFormValue.end,
                        einzahlung: changedFormValue.einzahlung,
                        ter: changedFormValue.ter,
                        transactionCostPercent: changedFormValue.transactionCostPercent,
                        transactionCostAbsolute: changedFormValue.transactionCostAbsolute,
                    })}
                    onSubmit={handleSparplanSubmit}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        <Form.Group controlId="start">
                            <Form.ControlLabel>
                                Start
                                <InfoIcon />
                            </Form.ControlLabel>
                            <Form.Control 
                                format="yyyy-MM" 
                                name="start" 
                                accepter={DatePicker}
                                placeholder="Startdatum wählen"
                                style={{ width: '100%' }}
                            />
                        </Form.Group>
                        <Form.Group controlId="end">
                            <Form.ControlLabel>
                                Ende (optional)
                                <InfoIcon />
                            </Form.ControlLabel>
                            <Form.Control 
                                format="yyyy-MM" 
                                name="end" 
                                accepter={DatePicker}
                                placeholder="Enddatum wählen"
                                style={{ width: '100%' }}
                            />
                        </Form.Group>
                        <Form.Group controlId="einzahlung">
                            <Form.ControlLabel>
                                {simulationAnnual === SimulationAnnual.yearly ? 'Einzahlungen je Jahr (€)' : 'Einzahlungen je Monat (€)'}
                                <InfoIcon />
                            </Form.ControlLabel>
                            <Form.Control 
                                name="einzahlung" 
                                accepter={InputNumber}
                                placeholder="Betrag eingeben"
                                style={{ width: '100%' }}
                                min={0}
                                step={simulationAnnual === SimulationAnnual.monthly ? 10 : 100}
                            />
                        </Form.Group>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                            💰 Kostenfaktoren (optional)
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <Form.Group controlId="ter">
                                <Form.ControlLabel>
                                    TER (% p.a.)
                                    <InfoIcon />
                                </Form.ControlLabel>
                                <Form.Control 
                                    name="ter" 
                                    accepter={InputNumber}
                                    placeholder="z.B. 0.75"
                                    style={{ width: '100%' }}
                                    min={0}
                                    max={10}
                                    step={0.01}
                                />
                                <Form.HelpText>Total Expense Ratio in % pro Jahr</Form.HelpText>
                            </Form.Group>
                            <Form.Group controlId="transactionCostPercent">
                                <Form.ControlLabel>
                                    Transaktionskosten (%)
                                    <InfoIcon />
                                </Form.ControlLabel>
                                <Form.Control 
                                    name="transactionCostPercent" 
                                    accepter={InputNumber}
                                    placeholder="z.B. 0.25"
                                    style={{ width: '100%' }}
                                    min={0}
                                    max={5}
                                    step={0.01}
                                />
                                <Form.HelpText>Prozentuale Transaktionskosten</Form.HelpText>
                            </Form.Group>
                            <Form.Group controlId="transactionCostAbsolute">
                                <Form.ControlLabel>
                                    Transaktionskosten (€)
                                    <InfoIcon />
                                </Form.ControlLabel>
                                <Form.Control 
                                    name="transactionCostAbsolute" 
                                    accepter={InputNumber}
                                    placeholder="z.B. 1.50"
                                    style={{ width: '100%' }}
                                    min={0}
                                    max={100}
                                    step={0.01}
                                />
                                <Form.HelpText>Absolute Transaktionskosten in Euro</Form.HelpText>
                            </Form.Group>
                        </div>
                    </div>
                    <Form.Group>
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
                    </Form.Group>
                </Form>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>
            
            <Card className="mb-6">
                <Collapsible open={isEinmalzahlungOpen} onOpenChange={setIsEinmalzahlungOpen}>
                    <CardHeader className="pb-4">
                        <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
                                <CardTitle className="text-left text-lg">💵 Einmalzahlungen erstellen</CardTitle>
                                {isEinmalzahlungOpen ? (
                                    <ChevronUp className="h-5 w-5 text-gray-500" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-500" />
                                )}
                            </div>
                        </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent className="pt-0">
                <div style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
                    Fügen Sie einmalige Zahlungen zu einem bestimmten Zeitpunkt hinzu
                </div>
                <Form fluid
                    formValue={singleFormValue}
                    onChange={(changedFormValue: any) => setSingleFormValue({
                        date: changedFormValue.date,
                        einzahlung: changedFormValue.einzahlung,
                        ter: changedFormValue.ter,
                        transactionCostPercent: changedFormValue.transactionCostPercent,
                        transactionCostAbsolute: changedFormValue.transactionCostAbsolute,
                    })}
                    onSubmit={handleSinglePaymentSubmit}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        <Form.Group controlId="date">
                            <Form.ControlLabel>
                                Datum
                                <InfoIcon />
                            </Form.ControlLabel>
                            <Form.Control 
                                format="yyyy-MM-dd" 
                                name="date" 
                                accepter={DatePicker}
                                placeholder="Datum wählen"
                                style={{ width: '100%' }}
                            />
                        </Form.Group>
                        <Form.Group controlId="einzahlung">
                            <Form.ControlLabel>
                                Einzahlung (€)
                                <InfoIcon />
                            </Form.ControlLabel>
                            <Form.Control 
                                name="einzahlung" 
                                accepter={InputNumber}
                                placeholder="Betrag eingeben"
                                style={{ width: '100%' }}
                                min={0}
                                step={100}
                            />
                        </Form.Group>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                            💰 Kostenfaktoren (optional)
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <Form.Group controlId="ter">
                                <Form.ControlLabel>
                                    TER (% p.a.)
                                    <InfoIcon />
                                </Form.ControlLabel>
                                <Form.Control 
                                    name="ter" 
                                    accepter={InputNumber}
                                    placeholder="z.B. 0.75"
                                    style={{ width: '100%' }}
                                    min={0}
                                    max={10}
                                    step={0.01}
                                />
                                <Form.HelpText>Total Expense Ratio in % pro Jahr</Form.HelpText>
                            </Form.Group>
                            <Form.Group controlId="transactionCostPercent">
                                <Form.ControlLabel>
                                    Transaktionskosten (%)
                                    <InfoIcon />
                                </Form.ControlLabel>
                                <Form.Control 
                                    name="transactionCostPercent" 
                                    accepter={InputNumber}
                                    placeholder="z.B. 0.25"
                                    style={{ width: '100%' }}
                                    min={0}
                                    max={5}
                                    step={0.01}
                                />
                                <Form.HelpText>Prozentuale Transaktionskosten</Form.HelpText>
                            </Form.Group>
                            <Form.Group controlId="transactionCostAbsolute">
                                <Form.ControlLabel>
                                    Transaktionskosten (€)
                                    <InfoIcon />
                                </Form.ControlLabel>
                                <Form.Control 
                                    name="transactionCostAbsolute" 
                                    accepter={InputNumber}
                                    placeholder="z.B. 1.50"
                                    style={{ width: '100%' }}
                                    min={0}
                                    max={100}
                                    step={0.01}
                                />
                                <Form.HelpText>Absolute Transaktionskosten in Euro</Form.HelpText>
                            </Form.Group>
                        </div>
                    </div>
                    <Form.Group>
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
                    </Form.Group>
                </Form>
                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>
            
            <Card className="mb-6">
                <Collapsible open={isGespeichertOpen} onOpenChange={setIsGespeichertOpen}>
                    <CardHeader className="pb-4">
                        <CollapsibleTrigger asChild>
                            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
                                <CardTitle className="text-left text-lg">📋 Gespeicherte Sparpläne</CardTitle>
                                {isGespeichertOpen ? (
                                    <ChevronUp className="h-5 w-5 text-gray-500" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-500" />
                                )}
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



