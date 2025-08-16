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

import {
    Button,
    ButtonToolbar,
    DatePicker,
    Form,
    InputNumber,
    Panel,
    Table,
    Message,
    useToaster
} from "rsuite";

const { Column, HeaderCell, Cell } = Table;



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
                }
            ]
            setSparplans(changedSparplans)
            dispatch(changedSparplans)
            setSparplanFormValues({
                start: new Date(),
                end: null,
                einzahlung: '',
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
                }
            ]
            setSparplans(changedSparplans)
            dispatch(changedSparplans)
            setSingleFormValue({
                date: new Date(),
                einzahlung: '',
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
                    onChange={changedFormValue => setSparplanFormValues({
                        start: changedFormValue.start,
                        end: changedFormValue.end,
                        einzahlung: changedFormValue.einzahlung,
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
                    onChange={changedFormValue => setSingleFormValue({
                        date: changedFormValue.date,
                        einzahlung: changedFormValue.einzahlung,
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
                                format="yyyy-MM" 
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
                <Table
                    autoHeight
                    data={sparplans}
                    bordered
                    rowHeight={60}
                    style={{ fontSize: '0.9rem' }}
                >
                    <Column width={140}>
                        <HeaderCell style={{ fontWeight: 600, backgroundColor: '#f8f9fa' }}>Start</HeaderCell>
                        <ChangeDateCell onChange={(id, value) => {
                            if (!value) {
                                return
                            }
                            const changedSparplans = sparplans.map((el) => el.id === id ? { ...el, start: value } : el)
                            setSparplans(changedSparplans)
                            dispatch(changedSparplans)
                        }} dataKey="start" />
                    </Column>
                    <Column width={140}>
                        <HeaderCell style={{ fontWeight: 600, backgroundColor: '#f8f9fa' }}>Ende</HeaderCell>
                        <ChangeDateCell onChange={(id, value) => {
                            const changedSparplans = sparplans.map((el) => el.id === id ? { ...el, end: value } : el)
                            setSparplans(changedSparplans)
                            dispatch(changedSparplans)
                        }} dataKey="end" />
                    </Column>
                    <Column width={180}>
                        <HeaderCell style={{ fontWeight: 600, backgroundColor: '#f8f9fa' }}>
                            {simulationAnnual === SimulationAnnual.yearly ? 'Einzahlungen je Jahr' : 'Einzahlungen je Monat'}
                        </HeaderCell>
                        <Cell>
                            {(rowData: Sparplan) => {
                                const displayValue = simulationAnnual === SimulationAnnual.monthly 
                                    ? (rowData.einzahlung / 12).toFixed(2)
                                    : rowData.einzahlung.toFixed(2);
                                return (
                                    <span style={{ fontWeight: 500, color: '#2eabdf' }}>
                                        {Number(displayValue).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                                    </span>
                                );
                            }}
                        </Cell>
                    </Column>
                    <Column width={100}>
                        <HeaderCell style={{ fontWeight: 600, backgroundColor: '#f8f9fa' }}>Aktionen</HeaderCell>
                        <Cell>
                            {(action: Sparplan) => (
                                <Button
                                    onClick={() => handleDeleteSparplan(action.id)}
                                    color="red"
                                    appearance="ghost"
                                    size="sm"
                                    title="Sparplan löschen"
                                >
                                    <CloseIcon />
                                </Button>
                            )}
                        </Cell>
                    </Column>
                </Table>
            </Panel>
        </div>
    );
}

function ChangeDateCell({
    rowData,
    dataKey,
    onChange,
    ...props
}: {
    rowData?: { id: any, [key: string]: Date | null }
    dataKey: string;
    onChange?: (id: any, val: Date | null) => void;
}) {
    const [isFocused, setIsFocused] = useState(false)

    return <Cell {...props} onClick={() => setIsFocused(true)}>
        {isFocused ?
            <DatePicker
                defaultOpen
                format="yyyy-MM"
                defaultValue={rowData?.[dataKey]}
                onChange={(val) => {
                    if (rowData) {
                        rowData[dataKey] = val
                    }
                    onChange && onChange(rowData?.id, val)
                }}
                onClose={() => setIsFocused(false)}
            />
            :
            rowData?.[dataKey]?.toLocaleDateString()}
    </Cell>;
}

