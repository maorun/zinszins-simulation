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

import {
    Button,
    ButtonToolbar,
    DatePicker,
    Form,
    InputNumber,
    Panel,
    Message,
    useToaster
} from "rsuite";





export function SparplanEingabe({ dispatch, simulationAnnual }: { dispatch: (val: Sparplan[]) => void; simulationAnnual: SimulationAnnualType }) {
    const [sparplans, setSparplans] = useState<Sparplan[]>([
        initialSparplan
    ]);

    const [singleFormValue, setSingleFormValue] = useState<{ date: Date, einzahlung: string, ter: string, transactionCosts: string }>({
        date: new Date(),
        einzahlung: '',
        ter: '0',
        transactionCosts: '0',
    });
    const [sparplanFormValues, setSparplanFormValues] = useState<{ start: Date, end: Date | null, einzahlung: string, ter: string, transactionCosts: string }>({
        start: new Date(),
        end: null,
        einzahlung: '',
        ter: '0',
        transactionCosts: '0',
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
                    ter: Number(sparplanFormValues.ter) || 0,
                    transactionCosts: Number(sparplanFormValues.transactionCosts) || 0,
                }
            ]
            setSparplans(changedSparplans)
            dispatch(changedSparplans)
            setSparplanFormValues({
                start: new Date(),
                end: null,
                einzahlung: '',
                ter: '0',
                transactionCosts: '0',
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
                    ter: Number(singleFormValue.ter) || 0,
                    transactionCosts: Number(singleFormValue.transactionCosts) || 0,
                }
            ]
            setSparplans(changedSparplans)
            dispatch(changedSparplans)
            setSingleFormValue({
                date: new Date(),
                einzahlung: '',
                ter: '0',
                transactionCosts: '0',
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
            <Panel header="💰 Sparpläne erstellen" bordered collapsible>
                <div style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
                    Erstellen Sie regelmäßige Sparpläne mit Start- und Enddatum
                </div>
                <Form fluid
                    formValue={sparplanFormValues}
                    onChange={changedFormValue => setSparplanFormValues(prev => ({ ...prev, ...changedFormValue }))}
                    onSubmit={handleSparplanSubmit}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        <Form.Group controlId="start">
                            <Form.ControlLabel>Start</Form.ControlLabel>
                            <Form.Control 
                                format="yyyy-MM" 
                                name="start" 
                                accepter={DatePicker}
                                placeholder="Startdatum"
                                style={{ width: '100%' }}
                            />
                        </Form.Group>
                        <Form.Group controlId="end">
                            <Form.ControlLabel>Ende (optional)</Form.ControlLabel>
                            <Form.Control 
                                format="yyyy-MM" 
                                name="end" 
                                accepter={DatePicker}
                                placeholder="Enddatum"
                                style={{ width: '100%' }}
                            />
                        </Form.Group>
                        <Form.Group controlId="einzahlung">
                            <Form.ControlLabel>
                                {simulationAnnual === SimulationAnnual.yearly ? 'Einzahlung p.a. (€)' : 'Einzahlung p.m. (€)'}
                            </Form.ControlLabel>
                            <Form.Control 
                                name="einzahlung" 
                                accepter={InputNumber}
                                placeholder="Betrag"
                                style={{ width: '100%' }}
                                min={0}
                                step={simulationAnnual === SimulationAnnual.monthly ? 10 : 100}
                            />
                        </Form.Group>
                        <Form.Group controlId="ter">
                            <Form.ControlLabel>TER (% p.a.)</Form.ControlLabel>
                            <Form.Control
                                name="ter"
                                accepter={InputNumber}
                                placeholder="z.B. 0.25"
                                style={{ width: '100%' }}
                                min={0}
                                step={0.05}
                            />
                        </Form.Group>
                        <Form.Group controlId="transactionCosts">
                            <Form.ControlLabel>Transaktionskosten (€)</Form.ControlLabel>
                            <Form.Control
                                name="transactionCosts"
                                accepter={InputNumber}
                                placeholder="z.B. 1.50"
                                style={{ width: '100%' }}
                                min={0}
                                step={0.5}
                            />
                        </Form.Group>
                    </div>
                    <Form.Group>
                        <ButtonToolbar>
                            <Button
                                appearance="primary"
                                type="submit"
                                size="lg"
                                disabled={!sparplanFormValues.start || !sparplanFormValues.einzahlung}
                            >
                                💾 Sparplan hinzufügen
                            </Button>
                        </ButtonToolbar>
                    </Form.Group>
                </Form>
            </Panel>
            
            <Panel header="💵 Einmalzahlungen erstellen" bordered collapsible>
                <div style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
                    Fügen Sie einmalige Zahlungen zu einem bestimmten Zeitpunkt hinzu
                </div>
                <Form fluid
                    formValue={singleFormValue}
                    onChange={changedFormValue => setSingleFormValue(prev => ({ ...prev, ...changedFormValue }))}
                    onSubmit={handleSinglePaymentSubmit}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        <Form.Group controlId="date">
                            <Form.ControlLabel>Datum</Form.ControlLabel>
                            <Form.Control 
                                format="yyyy-MM" 
                                name="date" 
                                accepter={DatePicker}
                                placeholder="Datum"
                                style={{ width: '100%' }}
                            />
                        </Form.Group>
                        <Form.Group controlId="einzahlung">
                            <Form.ControlLabel>Einzahlung (€)</Form.ControlLabel>
                            <Form.Control 
                                name="einzahlung" 
                                accepter={InputNumber}
                                placeholder="Betrag"
                                style={{ width: '100%' }}
                                min={0}
                                step={100}
                            />
                        </Form.Group>
                        <Form.Group controlId="ter_single">
                            <Form.ControlLabel>TER (% p.a.)</Form.ControlLabel>
                            <Form.Control
                                name="ter"
                                accepter={InputNumber}
                                placeholder="z.B. 0.25"
                                style={{ width: '100%' }}
                                min={0}
                                step={0.05}
                            />
                        </Form.Group>
                        <Form.Group controlId="transactionCosts_single">
                            <Form.ControlLabel>Transaktionskosten (€)</Form.ControlLabel>
                            <Form.Control
                                name="transactionCosts"
                                accepter={InputNumber}
                                placeholder="z.B. 5.00"
                                style={{ width: '100%' }}
                                min={0}
                                step={0.5}
                            />
                        </Form.Group>
                    </div>
                    <Form.Group>
                        <ButtonToolbar>
                            <Button
                                appearance="primary"
                                type="submit"
                                size="lg"
                                disabled={!singleFormValue.einzahlung}
                            >
                                💰 Einmalzahlung hinzufügen
                            </Button>
                        </ButtonToolbar>
                    </Form.Group>
                </Form>
            </Panel>
            
            <Panel header="📋 Gespeicherte Sparpläne" bordered bodyFill collapsible expanded>
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
                                        📅 {sparplan.start.toLocaleDateString('de-DE')}
                                    </span>
                                    <Button
                                        onClick={() => handleDeleteSparplan(sparplan.id)}
                                        color="red"
                                        appearance="ghost"
                                        size="sm"
                                        title="Sparplan löschen"
                                    >
                                        <CloseIcon />
                                    </Button>
                                </div>
                                <div className="sparplan-card-details">
                                    <div className="sparplan-detail">
                                        <span className="detail-label">📅 Start:</span>
                                        <span className="detail-value" style={{ color: '#28a745' }}>
                                            {sparplan.start.toLocaleDateString('de-DE')}
                                        </span>
                                    </div>
                                    <div className="sparplan-detail">
                                        <span className="detail-label">🏁 Ende:</span>
                                        <span className="detail-value" style={{ color: '#17a2b8' }}>
                                            {sparplan.end ? sparplan.end.toLocaleDateString('de-DE') : 'Unbegrenzt'}
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
                                    {(sparplan.ter !== undefined && sparplan.ter > 0) && (
                                        <div className="sparplan-detail">
                                            <span className="detail-label">TER:</span>
                                            <span className="detail-value">{sparplan.ter.toFixed(2)}% p.a.</span>
                                        </div>
                                    )}
                                    {(sparplan.transactionCosts !== undefined && sparplan.transactionCosts > 0) && (
                                        <div className="sparplan-detail">
                                            <span className="detail-label">Kosten:</span>
                                            <span className="detail-value">{sparplan.transactionCosts.toLocaleString('de-DE')} €</span>
                                        </div>
                                    )}
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
            </Panel>
        </div>
    );
}



