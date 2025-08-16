import { useState, useMemo } from "react";
import {
    Form,
    InputNumber,
    Panel,
    RadioTile,
    RadioTileGroup,
    Slider,
    Table,
    Toggle
} from "rsuite";
import 'rsuite/dist/rsuite.min.css';
import type { SparplanElement } from "../utils/sparplan-utils";
import { calculateWithdrawal, getTotalCapitalAtYear, calculateWithdrawalDuration } from "../utils/withdrawal";
import type { WithdrawalStrategy } from "../utils/withdrawal";

const { Column, HeaderCell, Cell } = Table;

export function EntnahmeSimulationsAusgabe({
    startEnd,
    elemente,
    dispatchEnd,
}: {
        startEnd: [number, number];
        elemente: SparplanElement[];
        dispatchEnd: (val: [number, number]) => void;
    }) {
    const [startOfIndependence, endOfLife] = startEnd;

    const [formValue, setFormValue] = useState({
        endOfLife,
        strategie: "4prozent" as WithdrawalStrategy,
        rendite: 5,
        // Monthly strategy specific settings
        monatlicheBetrag: 2000,
        inflationsrate: 2,
        guardrailsAktiv: false,
        guardrailsSchwelle: 10,
    });

    // Calculate withdrawal projections
    const withdrawalData = useMemo(() => {
        if (!elemente || elemente.length === 0) {
            return null;
        }

        // Get total accumulated capital at the start of withdrawal phase
        const startingCapital = getTotalCapitalAtYear(elemente, startOfIndependence);
        
        if (startingCapital <= 0) {
            return null;
        }

        // Calculate withdrawal projections
        const withdrawalResult = calculateWithdrawal(
            startingCapital,
            startOfIndependence + 1, // Start withdrawals the year after accumulation ends
            formValue.endOfLife,
            formValue.strategie,
            formValue.rendite / 100, // Convert percentage to decimal
            0.26375, // Default tax rate
            undefined, // Use default freibetrag
            // Pass monthly config only for monthly strategy
            formValue.strategie === "monatlich_fest" ? {
                monthlyAmount: formValue.monatlicheBetrag,
                inflationRate: formValue.inflationsrate / 100,
                enableGuardrails: formValue.guardrailsAktiv,
                guardrailsThreshold: formValue.guardrailsSchwelle / 100
            } : undefined
        );

        // Convert to array for table display, sorted by year descending
        const withdrawalArray = Object.entries(withdrawalResult)
            .map(([year, data]) => ({
                year: parseInt(year),
                ...data
            }))
            .sort((a, b) => b.year - a.year);

        // Calculate withdrawal duration
        const duration = calculateWithdrawalDuration(withdrawalResult, startOfIndependence + 1);

        return {
            startingCapital,
            withdrawalArray,
            withdrawalResult,
            duration
        };
    }, [elemente, startOfIndependence, formValue.endOfLife, formValue.strategie, formValue.rendite, formValue.monatlicheBetrag, formValue.inflationsrate, formValue.guardrailsAktiv, formValue.guardrailsSchwelle]);

    // Format currency for display
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    return (
        <Panel header="Entnahme" bordered collapsible>
            <Panel header="Variablen" bordered>
                <Form fluid formValue={formValue}
                    onChange={changedFormValue => {
                        dispatchEnd([startOfIndependence, changedFormValue.endOfLife])
                        setFormValue({
                            endOfLife: changedFormValue.endOfLife,
                            strategie: changedFormValue.strategie,
                            rendite: changedFormValue.rendite,
                            monatlicheBetrag: changedFormValue.monatlicheBetrag,
                            inflationsrate: changedFormValue.inflationsrate,
                            guardrailsAktiv: changedFormValue.guardrailsAktiv,
                            guardrailsSchwelle: changedFormValue.guardrailsSchwelle,
                        })
                    }}
                >
                    <Form.Group controlId="rendite">
                        <Form.ControlLabel>erwartete Rendite</Form.ControlLabel>
                        <Form.Control name="rendite" accepter={Slider} 
                            min={0}
                            max={10}
                            step={0.5}
                            handleTitle={(<div style={{marginTop: 15}}>{formValue.rendite} %</div>)}
                            progress
                            graduated
                        />
                    </Form.Group>
                    <Form.Group controlId="endOfLife">
                        <Form.ControlLabel>End of Life</Form.ControlLabel>
                        <Form.Control name="endOfLife" accepter={InputNumber} 
                        />
                    </Form.Group>
                    <Form.Group controlId="strategie">
                        <Form.ControlLabel>Strategie</Form.ControlLabel>
                        <Form.Control name="strategie" accepter={RadioTileGroup}>
                            <RadioTile value="4prozent" label="4% Regel">
                                4% Entnahme
                            </RadioTile>
                            <RadioTile value="3prozent" label="3% Regel">
                                3% Entnahme
                            </RadioTile>
                            <RadioTile value="monatlich_fest" label="Monatlich fest">
                                Fester monatlicher Betrag
                            </RadioTile>
                        </Form.Control>
                    </Form.Group>
                    
                    {/* Monthly strategy specific controls */}
                    {formValue.strategie === "monatlich_fest" && (
                        <>
                            <Form.Group controlId="monatlicheBetrag">
                                <Form.ControlLabel>Monatlicher Betrag (€)</Form.ControlLabel>
                                <Form.Control name="monatlicheBetrag" accepter={InputNumber} 
                                    min={100}
                                    max={50000}
                                    step={100}
                                />
                            </Form.Group>
                            <Form.Group controlId="inflationsrate">
                                <Form.ControlLabel>Inflationsrate (%)</Form.ControlLabel>
                                <Form.Control name="inflationsrate" accepter={Slider} 
                                    min={0}
                                    max={5}
                                    step={0.1}
                                    handleTitle={(<div style={{marginTop: 15}}>{formValue.inflationsrate} %</div>)}
                                    progress
                                    graduated
                                />
                            </Form.Group>
                            <Form.Group controlId="guardrailsAktiv">
                                <Form.ControlLabel>Dynamische Anpassung (Guardrails)</Form.ControlLabel>
                                <Form.Control name="guardrailsAktiv" accepter={Toggle} />
                                <Form.HelpText>
                                    Passt die Entnahme basierend auf der Portfolio-Performance an
                                </Form.HelpText>
                            </Form.Group>
                            {formValue.guardrailsAktiv && (
                                <Form.Group controlId="guardrailsSchwelle">
                                    <Form.ControlLabel>Anpassungsschwelle (%)</Form.ControlLabel>
                                    <Form.Control name="guardrailsSchwelle" accepter={Slider} 
                                        min={5}
                                        max={20}
                                        step={1}
                                        handleTitle={(<div style={{marginTop: 15}}>{formValue.guardrailsSchwelle} %</div>)}
                                        progress
                                        graduated
                                    />
                                    <Form.HelpText>
                                        Bei Überschreitung dieser Schwelle wird die Entnahme angepasst
                                    </Form.HelpText>
                                </Form.Group>
                            )}
                        </>
                    )}
                </Form>
            </Panel>
            <Panel header="Simulation" bordered>
                {withdrawalData ? (
                    <div>
                        <div style={{ marginBottom: '20px' }}>
                            <h4>Entnahme-Simulation</h4>
                            <p><strong>Startkapital bei Entnahme:</strong> {formatCurrency(withdrawalData.startingCapital)}</p>
                            {formValue.strategie === "monatlich_fest" ? (
                                <>
                                    <p><strong>Monatliche Entnahme (Basis):</strong> {formatCurrency(formValue.monatlicheBetrag)}</p>
                                    <p><strong>Jährliche Entnahme (Jahr 1):</strong> {formatCurrency(formValue.monatlicheBetrag * 12)}</p>
                                    <p><strong>Inflationsrate:</strong> {formValue.inflationsrate} Prozent p.a.</p>
                                    {formValue.guardrailsAktiv && (
                                        <p><strong>Dynamische Anpassung:</strong> Aktiviert (Schwelle: {formValue.guardrailsSchwelle}%)</p>
                                    )}
                                </>
                            ) : (
                                <p><strong>Jährliche Entnahme ({formValue.strategie === "4prozent" ? "4 Prozent" : "3 Prozent"} Regel):</strong> {formatCurrency(withdrawalData.startingCapital * (formValue.strategie === "4prozent" ? 0.04 : 0.03))}</p>
                            )}
                            <p><strong>Erwartete Rendite:</strong> {formValue.rendite} Prozent p.a.</p>
                            <p><strong>Vermögen reicht für:</strong> {
                                withdrawalData.duration 
                                    ? `${withdrawalData.duration} Jahr${withdrawalData.duration === 1 ? '' : 'e'}`
                                    : 'unbegrenzt (Vermögen wächst weiter)'
                            }</p>
                        </div>
                        
                        <Table
                            autoHeight
                            data={withdrawalData.withdrawalArray}
                            bordered
                            rowHeight={60}
                        >
                            <Column width={100}>
                                <HeaderCell>Jahr</HeaderCell>
                                <Cell dataKey="year" />
                            </Column>
                            <Column width={120}>
                                <HeaderCell>Startkapital</HeaderCell>
                                <Cell>
                                    {rowData => formatCurrency(rowData.startkapital)}
                                </Cell>
                            </Column>
                            <Column width={120}>
                                <HeaderCell>Entnahme</HeaderCell>
                                <Cell>
                                    {rowData => formatCurrency(rowData.entnahme)}
                                </Cell>
                            </Column>
                            {formValue.strategie === "monatlich_fest" && (
                                <Column width={120}>
                                    <HeaderCell>Monatlich</HeaderCell>
                                    <Cell>
                                        {rowData => rowData.monatlicheEntnahme ? formatCurrency(rowData.monatlicheEntnahme) : '-'}
                                    </Cell>
                                </Column>
                            )}
                            {formValue.strategie === "monatlich_fest" && (
                                <Column width={120}>
                                    <HeaderCell>Inflation</HeaderCell>
                                    <Cell>
                                        {rowData => rowData.inflationAnpassung !== undefined ? formatCurrency(rowData.inflationAnpassung) : '-'}
                                    </Cell>
                                </Column>
                            )}
                            {formValue.strategie === "monatlich_fest" && formValue.guardrailsAktiv && (
                                <Column width={120}>
                                    <HeaderCell>Guardrails</HeaderCell>
                                    <Cell>
                                        {rowData => rowData.portfolioAnpassung !== undefined ? formatCurrency(rowData.portfolioAnpassung) : '-'}
                                    </Cell>
                                </Column>
                            )}
                            <Column width={100}>
                                <HeaderCell>Zinsen</HeaderCell>
                                <Cell>
                                    {rowData => formatCurrency(rowData.zinsen)}
                                </Cell>
                            </Column>
                            <Column width={120}>
                                <HeaderCell>bezahlte Steuer</HeaderCell>
                                <Cell>
                                    {rowData => formatCurrency(rowData.bezahlteSteuer)}
                                </Cell>
                            </Column>
                            <Column width={120}>
                                <HeaderCell>Endkapital</HeaderCell>
                                <Cell>
                                    {rowData => formatCurrency(rowData.endkapital)}
                                </Cell>
                            </Column>
                        </Table>
                    </div>
                ) : (
                    <div>
                        <p>Keine Daten verfügbar. Bitte stelle sicher, dass Sparpläne definiert sind und eine Simulation durchgeführt wurde.</p>
                    </div>
                )}
            </Panel>
        </Panel>
    )
}


